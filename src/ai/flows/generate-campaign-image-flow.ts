// generate-campaign-image-flow.ts
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
});
export type GenerateCampaignImageInput = z.infer<typeof GenerateCampaignImageInputSchema>;

const GenerateCampaignImageOutputSchema = z.object({
  imageUrl: z.string().describe("A generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateCampaignImageOutput = z.infer<typeof GenerateCampaignImageOutputSchema>;

export async function generateCampaignImage(input: GenerateCampaignImageInput): Promise<GenerateCampaignImageOutput> {
  return generateCampaignImageFlow(input);
}

const generateCampaignImageFlow = ai.defineFlow(
  {
    name: 'generateCampaignImageFlow',
    inputSchema: GenerateCampaignImageInputSchema,
    outputSchema: GenerateCampaignImageOutputSchema,
  },
  async ({ name, description }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a visually appealing and professional marketing banner image for a campaign. The image should be abstract or conceptual, suitable for a social media banner (16:9 aspect ratio).

      Do not include any text in the image. The image should be modern and vibrant.

      Campaign Name: ${name}
      Campaign Description: ${description}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
        throw new Error('Image generation failed or returned no URL.');
    }

    return { imageUrl: media.url };
  }
);
