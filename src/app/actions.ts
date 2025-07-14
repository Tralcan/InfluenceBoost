
'use server';

import { suggestDiscount, SuggestDiscountInput, SuggestDiscountOutput } from '@/ai/flows/discount-suggestion';
import { generateCampaignImage } from '@/ai/flows/generate-campaign-image-flow';
import { createCampaign, registerInfluencerForCampaign, deleteCampaign, updateCampaign, incrementInfluencerCodeUsage, getInfluencerByPhone } from '@/lib/supabase/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Campaign, Influencer } from '@/lib/types';

export async function suggestDiscountAction(
  input: SuggestDiscountInput
): Promise<{ success: true; data: SuggestDiscountOutput } | { success: false; error: string }> {
  try {
    console.log('Iniciando suggestDiscountAction con la entrada:', input);
    const result = await suggestDiscount(input);
    console.log('suggestDiscountAction recibió el resultado:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error detallado en suggestDiscountAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, error: `Ocurrió un error inesperado al generar la sugerencia. Detalles: ${errorMessage}` };
  }
}

export async function createCampaignAction(
  data: Omit<Campaign, 'id' | 'created_at' | 'user_id'>
): Promise<{ success: true; data: Campaign } | { success: false; error: string }> {
  console.log('DEBUG: Iniciando createCampaignAction con datos:', {
    ...data,
    image_url: data.image_url ? `URL proporcionada` : 'VACÍO'
  });
  
  try {
    let finalImageUrl = data.image_url;

    if (!finalImageUrl) {
      console.log("DEBUG: No se proporcionó URL de imagen. Activando la generación de imágenes de IA para la campaña:", data.name);
      try {
        const imageResult = await generateCampaignImage({ 
            name: data.name, 
            description: data.description,
            discount: data.discount 
        });
        
        if (imageResult && imageResult.imageUrl) {
            console.log("DEBUG: Imagen de IA generada con éxito.");
            finalImageUrl = imageResult.imageUrl;
        } else {
            console.warn("DEBUG: La generación de imágenes de IA no devolvió una URL. Se usará una URL vacía.");
            finalImageUrl = null;
        }

      } catch (genError) {
         console.error('DEBUG: Error generando la imagen de la campaña:', genError);
         finalImageUrl = null;
      }
    } else {
        console.log("DEBUG: Se proporcionó una URL de imagen, se saltará la generación de IA.");
    }

    const campaignToCreate = {
        ...data,
        image_url: finalImageUrl,
        max_influencers: data.max_influencers === null || data.max_influencers === undefined ? 0 : data.max_influencers,
    };
    
    console.log("DEBUG: Datos finales a guardar en la base de datos (longitud de URL):", campaignToCreate.image_url ? campaignToCreate.image_url.length : 0);

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

export async function updateCampaignAction(
  campaignId: string,
  data: Partial<Omit<Campaign, 'id' | 'created_at' | 'user_id'>>
): Promise<{ success: true; data: Campaign } | { success: false; error: string }> {
  try {
    const campaignData = {
        ...data,
        max_influencers: data.max_influencers === null || data.max_influencers === undefined ? 0 : data.max_influencers,
    };
    
    const updatedCampaign = await updateCampaign(campaignId, campaignData);
    revalidatePath(`/dashboard/campaigns/${campaignId}`);
    revalidatePath('/dashboard');
    return { success: true, data: updatedCampaign };
  } catch (error) {
    console.error('Error updating campaign:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'No se pudo actualizar la campaña.' };
  }
}

export async function registerInfluencerAction(
    campaignId: string,
    prevState: any,
    formData: FormData
) {
    const influencerId = formData.get('influencer_id') as string | null;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone_number') as string;
    const instagram = formData.get('instagram_handle') as string;
    const tiktok = formData.get('tiktok_handle') as string;
    const x = formData.get('x_handle') as string;
    const other = formData.get('other_social_media') as string;

    if (!phone) {
        return { success: false, error: 'El celular es obligatorio.', code: null };
    }
     if (!name || !email) {
        return { success: false, error: 'El nombre y el email son obligatorios.', code: null };
    }
    if (!instagram && !tiktok && !x && !other) {
        return { success: false, error: 'Debes proporcionar al menos una red social.', code: null };
    }

    try {
        const result = await registerInfluencerForCampaign(campaignId, {
            id: influencerId, 
            name, 
            email, 
            phone_number: phone,
            instagram_handle: instagram,
            tiktok_handle: tiktok,
            x_handle: x,
            other_social_media: other
        });
        
        revalidatePath(`/campaign/${campaignId}`);
        redirect(`/campaign/${campaignId}/success?code=${result.generated_code}`);

    } catch (error) {
        console.error('Error registering influencer:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message, code: null };
        }
        return { success: false, error: 'No se pudo registrar.', code: null };
    }
}

export async function deleteCampaignAction(
    campaignId: string
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        await deleteCampaign(campaignId);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error deleting campaign:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'No se pudo eliminar la campaña.' };
    }
}

export async function incrementUsageAction(participantId: string, influencerId: string, currentCode: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const updatedParticipant = await incrementInfluencerCodeUsage(participantId, influencerId);
    revalidatePath(`/dashboard/search-code?code=${currentCode}`);
    revalidatePath(`/dashboard/campaigns/${updatedParticipant.campaign_id}`);
    return { success: true };
  } catch (error) {
    console.error('Error en incrementUsageAction:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'No se pudo registrar el uso.' };
  }
}

export async function findInfluencerByPhoneAction(phone: string): Promise<{ success: true; data: Influencer | null } | { success: false; error: string }> {
    if (!phone) {
        return { success: false, error: 'El número de teléfono es obligatorio.' };
    }
    try {
        const influencer = await getInfluencerByPhone(phone);
        return { success: true, data: influencer };
    } catch (error) {
        console.error('Error finding influencer by phone:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Ocurrió un error al buscar el influencer.' };
    }
}
