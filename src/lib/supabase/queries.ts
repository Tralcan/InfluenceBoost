
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

  return campaigns as CampaignWithParticipants[];
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

  // RLS ensures we can only fetch campaigns owned by the user, but we can double check.
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
  // RLS handles security, so we just update.
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
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
        throw new Error('Campaña no encontrada');
    }

    let influencer: Influencer | null = null;
    
    if (influencerData.id) {
        const { data: updatedInfluencer, error: updateError } = await supabase
            .from('influencers')
            .update({
                name: influencerData.name,
                email: influencerData.email,
                phone_number: influencerData.phone_number,
                instagram_handle: influencerData.instagram_handle,
                tiktok_handle: influencerData.tiktok_handle,
                x_handle: influencerData.x_handle,
                other_social_media: influencerData.other_social_media,
            })
            .eq('id', influencerData.id)
            .select()
            .single();
        
        if (updateError) {
            console.error('Error updating influencer:', updateError);
            throw new Error('Error al actualizar los datos del influencer.');
        }
        influencer = updatedInfluencer;

    } else {
        const { data: newInfluencer, error: createError } = await supabase
            .from('influencers')
            .insert({
                name: influencerData.name,
                email: influencerData.email,
                phone_number: influencerData.phone_number,
                instagram_handle: influencerData.instagram_handle,
                tiktok_handle: influencerData.tiktok_handle,
                x_handle: influencerData.x_handle,
                other_social_media: influencerData.other_social_media,
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating influencer:', createError);
            throw new Error('No se pudo crear el perfil del influencer.');
        }
        influencer = newInfluencer;
    }
    
    if (!influencer) {
        throw new Error("No se pudo obtener la información del influencer después de crearlo o actualizarlo.");
    }

    const { data: existingParticipant, error: checkError } = await supabase
        .from('campaign_influencers')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencer.id)
        .maybeSingle();
    
    if (checkError) {
      console.error("Error checking participation:", checkError);
      throw new Error('Error al verificar la participación.');
    }

    if (existingParticipant) {
      throw new Error('Este influencer ya está registrado en esta campaña.');
    }

    const discountValue = campaign.discount.match(/\d+/)?.[0] || '10';
    const generatedCode = `${influencer.name.split(' ')[0].toUpperCase()}${discountValue}`;

    const { data: participant, error: participantError } = await supabase
        .from('campaign_influencers')
        .insert({
            campaign_id: campaignId,
            influencer_id: influencer.id,
            generated_code: generatedCode.toUpperCase(),
        })
        .select('generated_code')
        .single();
    
    if (participantError) {
        console.error('Error registering influencer for campaign:', participantError);
        throw new Error('No se pudo registrar al influencer en la campaña.');
    }

    return participant;
}

export async function deleteCampaign(campaignId: string): Promise<void> {
    const supabase = createSupabaseServerClient();
    // RLS ensures only the owner can delete.
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
    
    // Fetch current uses for the participant
    const { data: participant, error: fetchError } = await supabase
        .from('campaign_influencers')
        .select('uses')
        .eq('id', participantId)
        .single();

    if (fetchError || !participant) {
        console.error('Error fetching participant for increment:', fetchError);
        throw new Error('No se pudo encontrar al participante para incrementar el uso.');
    }

    // Increment participant's uses
    const { error: incrementError } = await supabase
        .from('campaign_influencers')
        .update({ uses: participant.uses + 1 })
        .eq('id', participantId);
    
    if (incrementError) {
        console.error('Error incrementing participant uses:', incrementError);
        throw new Error('No se pudo actualizar el contador de usos del participante.');
    }
    
    // Fetch current points for the influencer
    const { data: influencer, error: fetchInfluencerError } = await supabase
        .from('influencers')
        .select('points')
        .eq('id', influencerId)
        .single();

    if (fetchInfluencerError || !influencer) {
        console.error('Error fetching influencer for points increment:', fetchInfluencerError);
        throw new Error('No se pudo encontrar al influencer para actualizar los puntos.');
    }

    // Increment influencer's points (e.g., 10 points per use)
    const { error: pointsError } = await supabase
        .from('influencers')
        .update({ points: influencer.points + 10 })
        .eq('id', influencerId);
    
    if (pointsError) {
        console.error('Error incrementing influencer points:', pointsError);
        throw new Error('No se pudo actualizar los puntos del influencer.');
    }
    
    // Refetch the updated participant with all details
    const { data: updatedParticipant, error: refetchError } = await supabase
        .from('campaign_influencers')
        .select(`
            *,
            campaigns ( * ),
            influencers ( * )
        `)
        .eq('id', participantId)
        .single();

    if (refetchError || !updatedParticipant) {
        console.error('Error refetching participant after usage increment:', refetchError);
        throw new Error('No se pudo recargar la información del participante tras la actualización.');
    }

    return updatedParticipant as CampaignParticipantInfo;
}
