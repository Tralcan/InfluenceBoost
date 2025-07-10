'use server';

import { suggestDiscount, SuggestDiscountInput, SuggestDiscountOutput } from '@/ai/flows/discount-suggestion';
import { createCampaign as dbCreateCampaign, registerInfluencer as dbRegisterInfluencer } from '@/lib/mock-db';
import { Campaign } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function suggestDiscountAction(
  input: SuggestDiscountInput
): Promise<{ success: true; data: SuggestDiscountOutput } | { success: false; error: string }> {
  try {
    const result = await suggestDiscount(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in suggestDiscountAction:', error);
    return { success: false, error: 'Ocurrió un error inesperado al generar la sugerencia.' };
  }
}

export async function createCampaignAction(
  data: Omit<Campaign, 'id' | 'uniqueUrl' | 'qrCodeUrl' | 'influencers' | 'companyId'>
): Promise<{ success: true; data: Campaign } | { success: false; error: string }> {
  try {
    const newCampaign = await dbCreateCampaign(data);
    revalidatePath('/dashboard');
    return { success: true, data: newCampaign };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return { success: false, error: 'No se pudo crear la campaña.' };
  }
}

export async function registerInfluencerAction(
    campaignId: string,
    formData: FormData
) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const socialMedia = formData.get('socialMedia') as string;

    if (!name || !email || !socialMedia) {
        return { success: false, error: 'Todos los campos son obligatorios.' };
    }

    try {
        const newInfluencer = await dbRegisterInfluencer(campaignId, { name, email, socialMedia });
        revalidatePath(`/dashboard/campaigns/${campaignId}`);
        redirect(`/campaign/${campaignId}/success?code=${newInfluencer.generatedCode}`);
    } catch (error) {
        console.error('Error registering influencer:', error);
        return { success: false, error: 'No se pudo registrar.' };
    }
}
