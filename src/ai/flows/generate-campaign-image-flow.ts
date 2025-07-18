'use server';

/**
 * @fileOverview An AI agent that generates a campaign image based on a name and description.
 *
 * - generateCampaignImage - A function that handles the image generation process.
 * - GenerateCampaignImageInput - The input type for the generateCampaignImage function.
 * - GenerateCampaignImageOutput - The return type for the generateCampaignImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCampaignImageInputSchema = z.object({
  name: z.string().describe('The name of the marketing campaign.'),
  description: z.string().describe('A detailed description of the marketing campaign.'),
  discount: z.string().describe('The discount details of the campaign (e.g., "25% OFF", "BOGO").'),
});
export type GenerateCampaignImageInput = z.infer<typeof GenerateCampaignImageInputSchema>;

const GenerateCampaignImageOutputSchema = z.object({
  imageUrl: z.string().describe("A generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateCampaignImageOutput = z.infer<typeof GenerateCampaignImageOutputSchema>;

export async function generateCampaignImage(input: GenerateCampaignImageInput): Promise<GenerateCampaignImageOutput> {
  console.log("DEBUG: Iniciando el flujo generateCampaignImage con la entrada:", input);
  return generateCampaignImageFlow(input);
}

const generateCampaignImageFlow = ai.defineFlow(
  {
    name: 'generateCampaignImageFlow',
    inputSchema: GenerateCampaignImageInputSchema,
    outputSchema: GenerateCampaignImageOutputSchema,
  },
  async ({ name, description, discount }) => {
    console.log("DEBUG: Dentro de generateCampaignImageFlow. Llamando a la API de generación de IA.");
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a visually appealing and professional marketing banner image for a campaign. The image should be abstract or conceptual, suitable for a social media banner (16:9 aspect ratio), and evoke the feeling of the campaign.

      Do not include any text in the image. The image should be modern, vibrant, and professional.

      **Campaign Details for Inspiration:**
      - **Campaign Name:** ${name}
      - **Campaign Description:** ${description}
      - **The Offer:** ${discount}

      **Instructions:**
      - Create a high-quality, conceptual image that represents the themes from the details above.
      - For example, if the campaign is about a summer sale, the image could feature abstract sunny and warm elements. If it's about a tech product, use sleek, modern, abstract shapes.
      - **Strictly no text, letters, or numbers in the generated image.**`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
        console.error('DEBUG: La generación de imágenes falló o no devolvió URL.');
        throw new Error('Image generation failed or returned no URL.');
    }

    console.log("DEBUG: La API de generación devolvió una URL de imagen. Longitud:", media.url.length);
    return { imageUrl: media.url };
  }
);
