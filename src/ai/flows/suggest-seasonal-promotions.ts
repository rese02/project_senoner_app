'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting seasonal promotions based on current trends and available products.
 *
 * - suggestSeasonalPromotions - A function that triggers the seasonal promotion suggestion flow.
 * - SuggestSeasonalPromotionsInput - The input type for the suggestSeasonalPromotions function.
 * - SuggestSeasonalPromotionsOutput - The return type for the suggestSeasonalPromotions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSeasonalPromotionsInputSchema = z.object({
  currentSeason: z.string().describe('The current season (e.g., Spring, Summer, Autumn, Winter).'),
  availableProducts: z.string().describe('A comma-separated list of available products.'),
  recentTrends: z.string().describe('A description of recent market and consumer trends.'),
});
export type SuggestSeasonalPromotionsInput = z.infer<typeof SuggestSeasonalPromotionsInputSchema>;

const SuggestSeasonalPromotionsOutputSchema = z.object({
  promotionSuggestion: z.string().describe('A detailed suggestion for a seasonal promotion, including specific products and marketing strategies.'),
  targetAudience: z.string().describe('The ideal target audience for the suggested promotion.'),
  marketingChannels: z.string().describe('Recommended marketing channels for the promotion (e.g., social media, email, in-store).'),
});
export type SuggestSeasonalPromotionsOutput = z.infer<typeof SuggestSeasonalPromotionsOutputSchema>;

export async function suggestSeasonalPromotions(input: SuggestSeasonalPromotionsInput): Promise<SuggestSeasonalPromotionsOutput> {
  return suggestSeasonalPromotionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSeasonalPromotionsPrompt',
  input: {schema: SuggestSeasonalPromotionsInputSchema},
  output: {schema: SuggestSeasonalPromotionsOutputSchema},
  prompt: `You are a marketing expert specializing in creating seasonal promotions for a gourmet food store.

  Given the current season, available products, and recent trends, suggest a detailed promotion.

Current Season: {{{currentSeason}}}
Available Products: {{{availableProducts}}}
Recent Trends: {{{recentTrends}}}

Consider the following when creating the promotion:
- Which products are most relevant to the season and trends?
- What is a compelling marketing message?
- Which target audience would be most receptive?
- Which marketing channels would be most effective?

Output a detailed promotion suggestion, target audience, and recommended marketing channels.

{{outputSchema.shape.promotionSuggestion.description}}
{{outputSchema.shape.targetAudience.description}}
{{outputSchema.shape.marketingChannels.description}}`,
});

const suggestSeasonalPromotionsFlow = ai.defineFlow(
  {
    name: 'suggestSeasonalPromotionsFlow',
    inputSchema: SuggestSeasonalPromotionsInputSchema,
    outputSchema: SuggestSeasonalPromotionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
