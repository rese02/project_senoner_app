'use client';

import { useState, useActionState } from 'react';
import { suggestSeasonalPromotions } from '@/lib/actions/seasonal';
import type { SuggestSeasonalPromotionsOutput } from '@/ai/flows/suggest-seasonal-promotions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';

const initialState: {
  result: SuggestSeasonalPromotionsOutput | null;
  error: string | null;
} = {
  result: null,
  error: null,
};

export default function SeasonalPage() {
  const [state, formAction] = useActionState(suggestSeasonalPromotions, initialState);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    await formAction(formData);
    setLoading(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <form onSubmit={handleFormSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Promotion Generator</CardTitle>
              <CardDescription>
                Let AI help you craft the next exciting promotion for your customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentSeason">Current Season</Label>
                <Input
                  id="currentSeason"
                  name="currentSeason"
                  placeholder="e.g., Summer, Holiday Season"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableProducts">Available Products</Label>
                <Textarea
                  id="availableProducts"
                  name="availableProducts"
                  placeholder="e.g., fresh salmon, local cheeses, artisan bread"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recentTrends">Recent Trends</Label>
                <Textarea
                  id="recentTrends"
                  name="recentTrends"
                  placeholder="e.g., increased demand for healthy options, outdoor dining"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Ideas
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      <div className="lg:col-span-3">
        <Card className="min-h-full">
          <CardHeader>
            <CardTitle>
                <Sparkles className="inline-block mr-2 h-5 w-5 text-accent" />
                AI-Powered Suggestions
            </CardTitle>
            <CardDescription>
              Here are some ideas to get you started. Review and adapt them to your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Thinking up some fresh ideas...</p>
              </div>
            )}
            {!loading && state.result && (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Promotion Suggestion</h3>
                  <p className="text-sm text-muted-foreground">{state.result.promotionSuggestion}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Target Audience</h3>
                  <p className="text-sm text-muted-foreground">{state.result.targetAudience}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Marketing Channels</h3>
                  <p className="text-sm text-muted-foreground">{state.result.marketingChannels}</p>
                </div>
              </>
            )}
             {!loading && !state.result && (
                 <div className="flex flex-col items-center justify-center space-y-4 pt-10 text-center text-muted-foreground">
                    <Wand2 className="h-10 w-10" />
                    <p>Your promotion ideas will appear here once generated.</p>
                </div>
            )}
            {state.error && <p className="text-destructive">{state.error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
