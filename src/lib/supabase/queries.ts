
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

  const mappedCampaigns = campaigns.map(c => ({
    ...c,
    user_id: user.id, 
    created_at: '', 
    max_influencers: null, 
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

  return data as CampaignWithParticipants;
}

export async function getParticipantByCode(code: string): Promise<CampaignParticipantInfo | null> {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const searchCode = code.toUpperCase();

    const { data, error } = await supabase
        .from('campaign_influencers')
        .select(`
            *,
            campaigns!inner(id, name, discount, end_date, user_id),
            influencers(*)
        `)
        .eq('generated_code', searchCode)
        .eq('campaigns.user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Error al buscar el código en la base de datos:', error);
        throw new Error('Error al buscar el código en la base de datos.');
    }

    return data as CampaignParticipantInfo | null;
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
    
    // Step 0: Check campaign capacity
    const { data: campaignData, error: campaignFetchError } = await supabase
      .from('campaigns')
      .select('max_influencers, campaign_influencers(count)')
      .eq('id', campaignId)
      .single();

    if (campaignFetchError || !campaignData) {
      throw new Error('No se pudo verificar la información de la campaña.');
    }
    
    const maxInfluencers = campaignData.max_influencers;
    const currentInfluencers = campaignData.campaign_influencers[0]?.count ?? 0;

    if (maxInfluencers !== null && maxInfluencers > 0 && currentInfluencers >= maxInfluencers) {
      throw new Error('Esta campaña ha alcanzado el número máximo de influencers.');
    }

    // Step 1: Upsert Influencer profile
    const { data: upsertedInfluencer, error: upsertError } = await supabase
        .from('influencers')
        .upsert({
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

    // Step 2: Check if influencer is already part of THIS campaign
    const { data: existingParticipant } = await supabase
        .from('campaign_influencers')
        .select('generated_code')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencer.id)
        .maybeSingle();

    if (existingParticipant) {
        return { generated_code: existingParticipant.generated_code };
    }
    
    // Step 3: If not, generate a new unique code
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('discount')
        .eq('id', campaignId)
        .single();

    if (campaignError || !campaign) {
        throw new Error('Campaña no encontrada para generar código.');
    }

    const baseName = influencer.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    let suffix = parseInt(campaign.discount.match(/\d+/)?.[0] || '10', 10);
    let finalCode = '';
    
    // Loop to find a unique code across the entire table
    while (true) {
        const tentativeCode = `${baseName}${suffix}`;
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
        
        suffix++; 
    }

    // Step 4: Insert the new participant record with the unique code
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
        if (participantError.code === '23505') {
            throw new Error('Ya existe un código de descuento igual. Por favor, inténtalo de nuevo.');
        }
        throw new Error('No se pudo registrar al influencer en la campaña.');
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

    // 1. Fetch current data for participant and influencer
    const { data: participantData, error: participantError } = await supabase
        .from('campaign_influencers')
        .select('uses')
        .eq('id', participantId)
        .single();

    if (participantError || !participantData) {
        console.error('Error fetching participant data:', participantError);
        throw new Error('No se pudo encontrar al participante.');
    }

    const { data: influencerData, error: influencerError } = await supabase
        .from('influencers')
        .select('points')
        .eq('id', influencerId)
        .single();
    
    if (influencerError || !influencerData) {
        console.error('Error fetching influencer data:', influencerError);
        throw new Error('No se pudo encontrar al influencer.');
    }

    // 2. Calculate new values
    const newUses = participantData.uses + 1;
    const newPoints = influencerData.points + 10;

    // 3. Update records
    const { error: usesUpdateError } = await supabase
        .from('campaign_influencers')
        .update({ uses: newUses })
        .eq('id', participantId);
    
    if (usesUpdateError) {
        console.error('Error incrementing participant uses:', usesUpdateError);
        throw new Error('No se pudo actualizar el contador de usos del participante.');
    }

    const { error: pointsUpdateError } = await supabase
        .from('influencers')
        .update({ points: newPoints })
        .eq('id', influencerId);

    if (pointsUpdateError) {
        console.error('Error incrementing influencer points:', pointsUpdateError);
        // Not a critical error, so we just log it and continue
    }
    
    // 4. Re-fetch the updated data to return
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
