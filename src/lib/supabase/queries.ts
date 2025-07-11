
'use server';

import { supabase } from './client';
import type { Campaign, CampaignParticipantInfo, CampaignWithParticipants, Influencer } from '../types';

export async function getCampaigns(): Promise<CampaignWithParticipants[]> {
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_influencers (
        *,
        influencers ( name, email, instagram_handle, tiktok_handle, x_handle, other_social_media, points )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    throw new Error('No se pudieron obtener las campañas.');
  }
  return campaigns as CampaignWithParticipants[];
}

export async function getCampaignById(id: string): Promise<CampaignWithParticipants | null> {
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

export async function createCampaign(
  data: Omit<Campaign, 'id' | 'created_at' | 'company_id'>
): Promise<Campaign> {
   const campaignData = {
    ...data,
    company_id: '1', // Mocked user company
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
  data: Partial<Omit<Campaign, 'id' | 'created_at' | 'company_id'>>
): Promise<Campaign> {
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
        name: string, 
        email: string, 
        instagram_handle: string | null, 
        tiktok_handle: string | null, 
        x_handle: string | null,
        other_social_media: string | null
    }
): Promise<{ generated_code: string }> {
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
        throw new Error('Campaña no encontrada');
    }

    // 1. Find or create the influencer by email
    let { data: influencer, error: findError } = await supabase
        .from('influencers')
        .select('*')
        .eq('email', influencerData.email)
        .single();

    if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding influencer:', findError);
        throw new Error('Error al buscar al influencer.');
    }

    if (!influencer) {
        const { data: newInfluencer, error: createError } = await supabase
            .from('influencers')
            .insert({
                name: influencerData.name,
                email: influencerData.email,
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

    // 2. Check if the influencer is already in this campaign
    const { data: existingParticipant, error: checkError } = await supabase
        .from('campaign_influencers')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencer.id)
        .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error('Error al verificar la participación.');
    }

    if (existingParticipant) {
      throw new Error('Este influencer ya está registrado en esta campaña.');
    }

    // 3. Create the campaign participant record
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
  // Use a transaction to ensure both updates succeed or fail together
  const { data, error } = await supabase.rpc('increment_usage_and_points', {
    p_participant_id: participantId,
    p_influencer_id: influencerId,
    p_points_to_add: 10
  });

  if (error) {
    console.error('Error incrementing usage with RPC:', error);
    throw new Error('No se pudo registrar el uso.');
  }

  // The RPC returns the updated participant info, so we can just return it.
  // We need to fetch the relations again to match the expected type.
  const updatedParticipant = await getParticipantByCode(data.generated_code);
  if (!updatedParticipant) {
    throw new Error('No se pudo recargar la información del participante tras la actualización.')
  }
  return updatedParticipant;
}
