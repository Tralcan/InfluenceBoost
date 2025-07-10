
'use server';

/**
 * @fileOverview Un agente de IA que sugiere un porcentaje de descuento óptimo y un texto de marketing basado en los objetivos de la campaña y datos históricos.
 *
 * - suggestDiscount - Una función que maneja el proceso de sugerencia de descuento.
 * - SuggestDiscountInput - El tipo de entrada para la función suggestDiscount.
 * - SuggestDiscountOutput - El tipo de retorno para la función suggestDiscount.
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
    .describe('El valor numérico del porcentaje de descuento sugerido (p. ej., para un 20% de descuento, devuelve el número 20).'),
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
  prompt: `Eres un asistente de marketing experto en IA. Tu tarea es proporcionar sugerencias para el descuento y el texto de marketing óptimos para campañas.

  Basándote en los objetivos de la campaña y los datos históricos (si se proporcionan), recomienda el mejor porcentaje de descuento a ofrecer y crea un texto de marketing convincente.

  **Objetivo de la Campaña:** {{{campaignGoal}}}
  **Datos Históricos:** {{{historicalData}}}

  Considera lo siguiente al determinar el descuento:
  - ¿Qué descuento es más probable que logre el objetivo de la campaña?
  - ¿Qué texto de marketing resonaría mejor con el público objetivo?
  - ¿Cómo se puede posicionar el descuento para que sea más atractivo?

  **Instrucción de formato de salida importante:**
  Devuelve el porcentaje de descuento sugerido como un NÚMERO ENTERO (por ejemplo, para un 20% de descuento, devuelve el número 20), junto con el texto de marketing y el razonamiento. No incluyas el símbolo '%' en el número.
  `,
});

const suggestDiscountFlow = ai.defineFlow(
  {
    name: 'suggestDiscountFlow',
    inputSchema: SuggestDiscountInputSchema,
    outputSchema: SuggestDiscountOutputSchema,
  },
  async input => {
    console.log('suggestDiscountFlow: Recibida entrada:', input);

    try {
        const response = await prompt(input);
        
        console.log('suggestDiscountFlow: Recibida respuesta bruta de la IA:', JSON.stringify(response, null, 2));

        if (!response.output) {
            console.error('suggestDiscountFlow: La respuesta de la IA no contiene el campo "output".');
            throw new Error('La respuesta de la IA tiene un formato inesperado.');
        }

        console.log('suggestDiscountFlow: La salida validada es:', response.output);
        return response.output;

    } catch (e) {
        console.error('suggestDiscountFlow: Error durante la llamada a la IA o la validación.', e);
        throw e;
    }
  }
);
