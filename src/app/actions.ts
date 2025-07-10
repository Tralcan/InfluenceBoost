'use server';

import { suggestDiscount, SuggestDiscountInput, SuggestDiscountOutput } from '@/ai/flows/discount-suggestion';
import { generateCampaignImage } from '@/ai/flows/generate-campaign-image-flow';
import { createCampaign, registerInfluencer } from '@/lib/supabase/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Campaign } from '@/lib/types';

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
  data: Omit<Campaign, 'id' | 'created_at' | 'company_id'>
): Promise<{ success: true; data: Campaign } | { success: false; error: string }> {
  try {
    let finalData = { ...data };
    
    // Si no se proporciona una URL de imagen o está vacía, generarla con IA
    if (!finalData.image_url) {
      console.log("No image URL provided. Generating AI image for campaign...");
      try {
        const imageResult = await generateCampaignImage({ name: data.name, description: data.description });
        console.log("AI image generated, URL length:", imageResult.imageUrl.length);
        finalData.image_url = imageResult.imageUrl;
      } catch (genError) {
         console.error('Error generating campaign image:', genError);
         // Opcional: no bloquear la creación de la campaña si la generación de imagen falla.
         // Puedes asignar una imagen de placeholder aquí si lo prefieres.
         finalData.image_url = ''; 
      }
    }

    const newCampaign = await createCampaign(finalData);
    revalidatePath('/dashboard');
    return { success: true, data: newCampaign };
  } catch (error) {
    console.error('Error creating campaign:', error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'No se pudo crear la campaña.' };
  }
}

export async function registerInfluencerAction(
    campaignId: string,
    prevState: any,
    formData: FormData
) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const socialMedia = formData.get('socialMedia') as string;

    if (!name || !email || !socialMedia) {
        return { success: false, error: 'Todos los campos son obligatorios.' };
    }

    try {
        const newInfluencer = await registerInfluencer(campaignId, { name, email, social_media: socialMedia });
        revalidatePath(`/dashboard/campaigns/${campaignId}`);
        // Devolvemos el código para que el cliente redirija.
        return { success: true, code: newInfluencer.generated_code, error: null };
    } catch (error) {
        console.error('Error registering influencer:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message, code: null };
        }
        return { success: false, error: 'No se pudo registrar.', code: null };
    }
}