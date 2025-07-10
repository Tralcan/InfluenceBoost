// discount-suggestion.ts
'use server';

/**
 * @fileOverview An AI agent that suggests an optimal discount percentage and marketing language based on campaign goals and historical data.
 *
 * - suggestDiscount - A function that handles the discount suggestion process.
 * - SuggestDiscountInput - The input type for the suggestDiscount function.
 * - SuggestDiscountOutput - The return type for the suggestDiscount function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDiscountInputSchema = z.object({
  campaignGoal: z
    .string()
    .describe('El objetivo de la campaña, p. ej., aumentar las ventas, conseguir nuevos clientes, notoriedad de marca.'),
  historicalData: z
    .string()
    .optional()
    .describe('Datos históricos de campañas anteriores, si están disponibles.'),
});
export type SuggestDiscountInput = z.infer<typeof SuggestDiscountInputSchema>;

const SuggestDiscountOutputSchema = z.object({
  suggestedDiscountPercentage: z
    .number()
    .describe('El porcentaje de descuento sugerido para la campaña.'),
  marketingLanguage: z
    .string()
    .describe(
      'Lenguaje de marketing para usar al publicitar el descuento, p. ej., un eslogan o frase pegadiza.'
    ),
  reasoning: z
    .string()
    .describe(
      'Explicación de por qué se eligió el porcentaje de descuento y cómo el lenguaje de marketing puede ser más efectivo.'
    ),
});
export type SuggestDiscountOutput = z.infer<typeof SuggestDiscountOutputSchema>;

export async function suggestDiscount(input: SuggestDiscountInput): Promise<SuggestDiscountOutput> {
  return suggestDiscountFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDiscountPrompt',
  input: {schema: SuggestDiscountInputSchema},
  output: {schema: SuggestDiscountOutputSchema},
  prompt: `Eres un asistente de marketing de IA que proporciona sugerencias para el descuento y el lenguaje de marketing óptimos para campañas de marketing.

  Basándote en los objetivos de la campaña y los datos históricos (si están disponibles), recomienda el mejor porcentaje de descuento a ofrecer y crea un lenguaje de marketing convincente.

  Objetivo de la Campaña: {{{campaignGoal}}}
  Datos Históricos: {{{historicalData}}}

  Considera lo siguiente al determinar el descuento:
  - ¿Qué descuento es probable que sea más efectivo para alcanzar el objetivo de la campaña?
  - ¿Qué lenguaje de marketing resonaría más con el público objetivo?
  - ¿Cómo se puede posicionar el descuento para hacerlo más atractivo para los clientes potenciales?

  Devuelve el porcentaje de descuento sugerido, el lenguaje de marketing y el razonamiento.
  `,
});

const suggestDiscountFlow = ai.defineFlow(
  {
    name: 'suggestDiscountFlow',
    inputSchema: SuggestDiscountInputSchema,
    outputSchema: SuggestDiscountOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
