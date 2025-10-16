'use server';

import {
  suggestSeasonalPromotions as suggestSeasonalPromotionsFlow,
  type SuggestSeasonalPromotionsInput,
  type SuggestSeasonalPromotionsOutput,
} from '@/ai/flows/suggest-seasonal-promotions';

export async function suggestSeasonalPromotions(
  prevState: {
    result: SuggestSeasonalPromotionsOutput | null;
    error: string | null;
  },
  formData: FormData
): Promise<{
  result: SuggestSeasonalPromotionsOutput | null;
  error: string | null;
}> {
  try {
    const input: SuggestSeasonalPromotionsInput = {
      currentSeason: formData.get('currentSeason') as string,
      availableProducts: formData.get('availableProducts') as string,
      recentTrends: formData.get('recentTrends') as string,
    };

    if (!input.currentSeason || !input.availableProducts || !input.recentTrends) {
      return { result: null, error: 'All fields are required.' };
    }
    const result = await suggestSeasonalPromotionsFlow(input);
    return { result, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { result: null, error };
  }
}
