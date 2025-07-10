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
    .describe('The goal of the campaign, e.g., increase sales, gain new customers, brand awareness.'),
  historicalData: z
    .string()
    .optional()
    .describe('Historical data from previous campaigns, if available.'),
  currentDiscount: z
    .number()
    .optional()
    .describe('The current discount amount being offered as a percentage'),
});
export type SuggestDiscountInput = z.infer<typeof SuggestDiscountInputSchema>;

const SuggestDiscountOutputSchema = z.object({
  suggestedDiscountPercentage: z
    .number()
    .describe('The suggested discount percentage to use for the campaign.'),
  marketingLanguage: z
    .string()
    .describe(
      'Marketing language to use when advertising the discount, e.g., a catchy slogan or phrase.'
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation of why the discount percentage was chosen and how the marketing language can be more effective.'
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
  prompt: `You are an AI marketing assistant that provides suggestions for the optimal discount and marketing language for marketing campaigns.

  Based on the campaign's goals, historical data, and current discount (if available) recommend the best discount percentage to offer and create compelling marketing language.

  Campaign Goal: {{{campaignGoal}}}
  Historical Data: {{{historicalData}}}
  Current Discount: {{{currentDiscount}}}

  Consider the following when determining the discount:
  - What discount is likely to be the most effective to achieve the campaign goal?
  - What marketing language would resonate the most with the target audience?
  - How can the discount be positioned to make it more attractive to potential customers?

  Return the suggested discount percentage, marketing language, and reasoning.
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
