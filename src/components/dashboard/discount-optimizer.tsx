'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestDiscountAction } from '@/app/actions';
import type { SuggestDiscountOutput } from '@/ai/flows/discount-suggestion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, Percent, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  campaignGoal: z.string().min(10, 'Please describe your goal in more detail.'),
  historicalData: z.string().optional(),
});

type DiscountOptimizerProps = {
  onSuggestionApply: (suggestion: { discount: string; description: string }) => void;
};

export function DiscountOptimizer({ onSuggestionApply }: DiscountOptimizerProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestDiscountOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { campaignGoal: '', historicalData: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setSuggestion(null);
    const result = await suggestDiscountAction(values);
    if (result.success) {
      setSuggestion(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  const handleApplySuggestion = () => {
    if (suggestion) {
      onSuggestionApply({
        discount: `${suggestion.suggestedDiscountPercentage}% OFF`,
        description: suggestion.marketingLanguage,
      });
    }
  };


  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          <span className="font-headline">AI Discount Optimizer</span>
        </CardTitle>
        <CardDescription>
          Not sure about the discount? Let our AI suggest the optimal discount and marketing copy based on your goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="campaignGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Campaign Goal</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 'Quickly boost sales for our new product line' or 'Attract new customers in the 18-25 age range'." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="historicalData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous Campaign Data (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Last summer, a 15% discount gave us a 20% sales lift.'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Generating...' : 'Get Suggestion'}
            </Button>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestion && (
          <Card className="mt-6">
            <CardHeader>
                <CardTitle className="font-headline">AI Suggestion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                    <Badge variant="secondary" className="text-base p-2">
                        <Percent className="mr-2 h-4 w-4" />
                        Suggested Discount: {suggestion.suggestedDiscountPercentage}%
                    </Badge>
                </div>

                <div>
                    <h4 className="font-semibold">Suggested Marketing Language:</h4>
                    <p className="text-muted-foreground italic">"{suggestion.marketingLanguage}"</p>
                </div>
                
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Reasoning</AlertTitle>
                    <AlertDescription>{suggestion.reasoning}</AlertDescription>
                </Alert>

                <Button onClick={handleApplySuggestion}>
                    <Sparkles className="mr-2 h-4 w-4" /> Apply Suggestion
                </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
