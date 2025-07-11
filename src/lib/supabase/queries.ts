'use server';

import { createClient } from '@supabase/supabase-js';
import { supabase } from './client';
import type { Campaign, CampaignWithInfluencers, Influencer, InfluencerWithCampaign } from '../types';

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

export async function getInfluencerByCode(code: string): Promise<InfluencerWithCampaign | null> {
    const { data, error } = await supabase
        .from('influencers')
        .select(`
            *,
            campaigns ( * )
        `)
        .eq('generated_code', code.toUpperCase())
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found, which is a valid search result
        }
        console.error('Error fetching influencer by code:', error);
        throw new Error('No se pudo buscar el código del influencer.');
    }
    
    return data as InfluencerWithCampaign;
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
            generated_code: generatedCode.toUpperCase(),
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error registering influencer:', error);
        if (error.code === '23505') { // Unique constraint violation
            throw new Error('Este email ya ha sido registrado para esta campaña.');
        }
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

export async function incrementInfluencerCodeUsage(influencerId: string): Promise<Influencer> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('YOUR_SUPABASE_SERVICE_ROLE_KEY')) {
    console.error('Las credenciales de administrador de Supabase no están configuradas.');
    throw new Error('La configuración del servidor está incompleta. No se puede registrar el uso.');
  }

  // Create a temporary admin client to perform this operation securely.
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Fetch the current influencer data
    const { data: influencer, error: fetchError } = await supabaseAdmin
      .from('influencers')
      .select('uses, points')
      .eq('id', influencerId)
      .single();

    if (fetchError || !influencer) {
      console.error('Error fetching influencer for update:', fetchError);
      throw new Error('No se pudo encontrar el influencer para actualizar.');
    }

    // 2. Calculate new values
    const newUses = influencer.uses + 1;
    const newPoints = influencer.points + 10; // Assuming 10 points per use

    // 3. Update the influencer with the new values
    const { data: updatedInfluencer, error: updateError } = await supabaseAdmin
      .from('influencers')
      .update({ uses: newUses, points: newPoints })
      .eq('id', influencerId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating influencer usage:', updateError);
      throw new Error('No se pudo actualizar el uso del código.');
    }

    return updatedInfluencer;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('No se pudo registrar el uso.');
  }
}
