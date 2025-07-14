
'use server';

import { createSupabaseServerClient } from './server';
import type { Campaign, CampaignInfluencer, CampaignParticipantInfo, CampaignWithParticipants, Influencer } from '../types';

export async function getCampaigns(): Promise<CampaignWithParticipants[]> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("No user session found, returning empty campaigns array.");
    return [];
  }
  
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      id,
      name,
      description,
      start_date,
      end_date,
      discount,
      image_url,
      campaign_influencers ( id )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    throw new Error('No se pudieron obtener las campañas.');
  }
  
  if (!campaigns) {
    return [];
  }

  // Map over the campaigns to ensure the structure matches CampaignWithParticipants
  const mappedCampaigns = campaigns.map(c => ({
    ...c,
    user_id: user.id, // Add user_id as it's part of the type
    created_at: '', // Add placeholder for type conformity if not selected
    max_influencers: null, // Add placeholder
    campaign_influencers: c.campaign_influencers,
  }));

  return mappedCampaigns as unknown as CampaignWithParticipants[];
}

export async function getCampaignById(id: string): Promise<CampaignWithParticipants | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_influencers (
        *,
        influencers ( name, email, instagram_handle, tiktok_handle, x_handle, other_social_media, points )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching campaign by ID:', error);
    if (error.code === 'PGRST116') { 
        return null;
    }
    throw new Error('No se pudo obtener la campaña.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (data && user && data.user_id !== user.id) {
    return null;
  }

  return data as CampaignWithParticipants;
}

export async function getParticipantByCode(code: string): Promise<CampaignParticipantInfo | null> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('campaign_influencers')
        .select(`
            *,
            campaigns ( * ),
            influencers ( * )
        `)
        .eq('generated_code', code.toUpperCase())
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found, valid search result
        }
        console.error('Error fetching participant by code:', error);
        throw new Error('No se pudo buscar el código.');
    }
    
    return data as CampaignParticipantInfo;
}

export async function getInfluencerByPhone(phone: string): Promise<Influencer | null> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('phone_number', phone)
        .maybeSingle();

    if (error) {
        console.error('Error getting influencer by phone:', error);
        throw new Error('Error al buscar al influencer.');
    }

    return data;
}

export async function createCampaign(
  data: Omit<Campaign, 'id' | 'created_at' | 'user_id'>
): Promise<Campaign> {
   const supabase = createSupabaseServerClient();
   const { data: { user } } = await supabase.auth.getUser();

   if (!user) {
     throw new Error("Authentication required to create a campaign.");
   }

   const campaignData = {
    ...data,
    user_id: user.id,
  };

  const { data: newCampaign, error } = await supabase
    .from('campaigns')
    .insert(campaignData)
    .select()
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    throw new Error('Error al crear la campaña en la base de datos.');
  }

  return newCampaign;
}

export async function updateCampaign(
  id: string,
  data: Partial<Omit<Campaign, 'id' | 'created_at' | 'user_id'>>
): Promise<Campaign> {
  const supabase = createSupabaseServerClient();
  const { error: updateError } = await supabase
    .from('campaigns')
    .update(data)
    .eq('id', id);

  if (updateError) {
    console.error('Error updating campaign:', updateError);
    throw new Error('Error al actualizar la campaña en la base de datos.');
  }

  const { data: updatedCampaign, error: selectError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (selectError) {
      console.error('Error refetching campaign after update:', selectError);
      throw new Error('No se pudo obtener la campaña actualizada.');
  }
  
  return updatedCampaign;
}

export async function registerInfluencerForCampaign(
    campaignId: string, 
    influencerData: {
        id: string | null;
        name: string, 
        email: string, 
        phone_number: string,
        instagram_handle: string | null, 
        tiktok_handle: string | null, 
        x_handle: string | null,
        other_social_media: string | null
    }
): Promise<{ generated_code: string }> {
    const supabase = createSupabaseServerClient();
    
    // Step 1: Upsert Influencer - this is the safest way.
    const { data: upsertedInfluencer, error: upsertError } = await supabase
        .from('influencers')
        .upsert({
            id: influencerData.id,
            name: influencerData.name,
            email: influencerData.email,
            phone_number: influencerData.phone_number,
            instagram_handle: influencerData.instagram_handle,
            tiktok_handle: influencerData.tiktok_handle,
            x_handle: influencerData.x_handle,
            other_social_media: influencerData.other_social_media,
        }, { onConflict: 'phone_number', ignoreDuplicates: false })
        .select()
        .single();
    
    if (upsertError || !upsertedInfluencer) {
        console.error('Error upserting influencer:', upsertError);
        throw new Error('No se pudo crear o actualizar el perfil del influencer.');
    }
    const influencer = upsertedInfluencer;

    // Step 2: Check if this influencer is ALREADY part of THIS campaign.
    const { data: existingParticipant } = await supabase
        .from('campaign_influencers')
        .select('generated_code')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencer.id)
        .maybeSingle();

    if (existingParticipant) {
        return { generated_code: existingParticipant.generated_code };
    }
    
    // Step 3: Get Campaign details for code generation
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('discount')
        .eq('id', campaignId)
        .single();

    if (campaignError || !campaign) {
        throw new Error('Campaña no encontrada para generar código.');
    }

    // Step 4: Generate a globally unique code using the specified logic.
    const baseName = influencer.name.split(' ')[0].toUpperCase();
    let discountNumber = parseInt(campaign.discount.match(/\d+/)?.[0] || '10', 10);
    let finalCode = '';
    
    while (true) {
        const tentativeCode = `${baseName}${discountNumber}`;
        const { data: codeCheck, error: codeCheckError } = await supabase
            .from('campaign_influencers')
            .select('id')
            .eq('generated_code', tentativeCode)
            .maybeSingle();

        if (codeCheckError) {
            console.error('Error checking for existing code:', codeCheckError);
            throw new Error('No se pudo verificar la unicidad del código.');
        }

        if (!codeCheck) {
            finalCode = tentativeCode;
            break;
        }
        
        discountNumber++; 
    }

    // Step 5: Insert the new participant record with the unique code.
    const { data: newParticipant, error: participantError } = await supabase
        .from('campaign_influencers')
        .insert({
            campaign_id: campaignId,
            influencer_id: influencer.id,
            generated_code: finalCode,
        })
        .select('generated_code')
        .single();
    
    if (participantError) {
        console.error('Error registering influencer for campaign:', participantError);
        throw new Error('No se pudo registrar al influencer en la campaña. Puede que el código ya exista.');
    }

    if (!newParticipant) {
        throw new Error('No se pudo obtener el código generado tras el registro.');
    }

    return newParticipant;
}

export async function deleteCampaign(campaignId: string): Promise<void> {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

    if (error) {
        console.error('Error deleting campaign:', error);
        throw new Error('Error al eliminar la campaña de la base de datos.');
    }
}

export async function incrementInfluencerCodeUsage(participantId: string, influencerId: string): Promise<CampaignParticipantInfo> {
    const supabase = createSupabaseServerClient();

    // The Supabase Edge Functions for these RPCs should be:
    //
    // -- increment_participant_uses
    // create or replace function increment_participant_uses(row_id uuid)
    // returns void
    // language sql
    // as $$
    //   update public.campaign_influencers
    //   set uses = uses + 1
    //   where id = row_id;
    // $$;
    //
    // -- increment_influencer_points
    // create or replace function increment_influencer_points(row_id uuid, points_to_add int)
    // returns void
    // language sql
    // as $$
    //   update public.influencers
    //   set points = points + points_to_add
    //   where id = row_id;
    // $$;

    // Step 1: Increment the uses count on the campaign_influencers table.
    const { error: usesError } = await supabase.rpc('increment_participant_uses', {
        row_id: participantId,
    });

    if (usesError) {
        console.error('Error incrementing participant uses:', usesError);
        throw new Error('No se pudo actualizar el contador de usos del participante.');
    }

    // Step 2: Increment the total points on the influencers table.
    const { error: pointsError } = await supabase.rpc('increment_influencer_points', {
        row_id: influencerId,
        points_to_add: 10,
    });

    if (pointsError) {
        // Not throwing an error here as it's a non-critical part of the flow, but logging it.
        console.error('Error incrementing influencer points:', pointsError);
    }
    
    // Step 3: Fetch the updated participant data to return to the client for revalidation.
    const { data: finalParticipantData, error: refetchError } = await supabase
        .from('campaign_influencers')
        .select(`
            *,
            campaigns ( * ),
            influencers ( * )
        `)
        .eq('id', participantId)
        .single();

    if (refetchError || !finalParticipantData) {
        console.error('Error refetching participant after usage increment:', refetchError);
        throw new Error('No se pudo recargar la información del participante tras la actualización.');
    }

    return finalParticipantData as CampaignParticipantInfo;
}

    

    