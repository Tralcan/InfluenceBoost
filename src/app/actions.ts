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
  console.log('DEBUG: Iniciando createCampaignAction con datos:', data);
  try {
    let finalImageUrl = data.image_url;

    if (!finalImageUrl) {
      console.log("DEBUG: No se proporcionó URL de imagen. Activando la generación de imágenes de IA para la campaña:", data.name);
      try {
        const imageResult = await generateCampaignImage({ name: data.name, description: data.description });
        
        if (imageResult && imageResult.imageUrl) {
            console.log("DEBUG: Imagen de IA generada con éxito. Longitud de la URL:", imageResult.imageUrl.length);
            finalImageUrl = imageResult.imageUrl;
        } else {
            console.log("DEBUG: La generación de imágenes de IA no devolvió una URL. Se usará una URL vacía.");
            finalImageUrl = ''; // Asegurarse de que sea una cadena vacía si falla
        }

      } catch (genError) {
         console.error('DEBUG: Error generando la imagen de la campaña:', genError);
         finalImageUrl = ''; 
      }
    } else {
        console.log("DEBUG: Se proporcionó una URL de imagen:", finalImageUrl);
    }

    const campaignToCreate = {
        ...data,
        image_url: finalImageUrl,
    };
    
    console.log("DEBUG: Datos finales a guardar en la base de datos:", {
        ...campaignToCreate,
        image_url: `URL de longitud ${campaignToCreate.image_url.length}` // No registrar la URL completa
    });

    const newCampaign = await createCampaign(campaignToCreate);
    revalidatePath('/dashboard');
    return { success: true, data: newCampaign };
  } catch (error) {
    console.error('DEBUG: Error final en createCampaignAction:', error);
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
