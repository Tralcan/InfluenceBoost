'use server';

import { supabase } from './client';
import type { Campaign, CampaignWithInfluencers, Influencer } from '../types';

export async function getCampaigns(): Promise<CampaignWithInfluencers[]> {
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      influencers ( * )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    throw new Error('No se pudieron obtener las campañas.');
  }
  return campaigns as CampaignWithInfluencers[];
}

export async function getCampaignById(id: string): Promise<CampaignWithInfluencers | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      influencers ( * )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching campaign by ID:', error);
    // Don't throw for a single not-found item, just return null
    if (error.code === 'PGRST116') { 
        return null;
    }
    throw new Error('No se pudo obtener la campaña.');
  }

  return data as CampaignWithInfluencers;
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
  const { data: updatedCampaign, error } = await supabase
    .from('campaigns')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating campaign:', error);
    throw new Error('Error al actualizar la campaña en la base de datos.');
  }
  return updatedCampaign;
}

export async function registerInfluencer(
    campaignId: string, 
    influencerData: { 
        name: string, 
        email: string, 
        instagram_handle: string, 
        tiktok_handle: string, 
        x_handle: string,
        other_social_media: string
    }
): Promise<Influencer> {
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
        throw new Error('Campaña no encontrada');
    }

    const discountValue = campaign.discount.match(/\d+/)?.[0] || '10';
    const generatedCode = `${influencerData.name.split(' ')[0].toUpperCase()}${discountValue}`;

    const { data: newInfluencer, error } = await supabase
        .from('influencers')
        .insert({
            campaign_id: campaignId,
            name: influencerData.name,
            email: influencerData.email,
            instagram_handle: influencerData.instagram_handle,
            tiktok_handle: influencerData.tiktok_handle,
            x_handle: influencerData.x_handle,
            other_social_media: influencerData.other_social_media,
            generated_code: generatedCode,
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error registering influencer:', error);
        throw new Error('No se pudo registrar al influencer.');
    }

    return newInfluencer;
}


export async function deleteCampaign(campaignId: string): Promise<void> {
    // Supabase is configured with cascading deletes, so deleting a campaign
    // will also delete all associated influencers.
    const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

    if (error) {
        console.error('Error deleting campaign:', error);
        throw new Error('Error al eliminar la campaña de la base de datos.');
    }
}
