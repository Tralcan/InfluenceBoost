'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createCampaignAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DiscountOptimizer } from './discount-optimizer';
import { useState } from 'react';

const newCampaignSchema = z.object({
  name: z.string().min(5, { message: 'Campaign name must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  dateRange: z.object({
    from: z.date({ required_error: 'A start date is required.' }),
    to: z.date({ required_error: 'An end date is required.' }),
  }),
  discount: z.string().min(1, { message: 'Discount details are required.' }),
  maxInfluencers: z.coerce.number().positive().optional(),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

type NewCampaignFormValues = z.infer<typeof newCampaignSchema>;

export function NewCampaignForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewCampaignFormValues>({
    resolver: zodResolver(newCampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      discount: '',
      imageUrl: '',
    },
  });

  const handleSuggestionApply = (suggestion: { discount: string; description: string }) => {
    form.setValue('discount', suggestion.discount);
    form.setValue('description', suggestion.description, { shouldValidate: true });
    toast({
        title: "AI Suggestion Applied!",
        description: "Discount and description have been updated.",
    });
  };

  async function onSubmit(data: NewCampaignFormValues) {
    setIsSubmitting(true);
    const campaignData = {
      name: data.name,
      description: data.description,
      startDate: data.dateRange.from,
      endDate: data.dateRange.to,
      discount: data.discount,
      maxInfluencers: data.maxInfluencers || null,
      imageUrl: data.imageUrl || `https://placehold.co/1200x630.png`,
    };

    const result = await createCampaignAction(campaignData);

    if (result.success) {
      toast({
        title: 'Campaign Created!',
        description: `Your new campaign "${result.data.name}" is live.`,
      });
      router.push(`/dashboard/campaigns/${result.data.id}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Summer Fashion Launch" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your campaign goals, target audience, and key messaging." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Campaign Dates</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>{format(field.value.from, 'LLL dd, y')} - {format(field.value.to, 'LLL dd, y')}</>
                                ) : (
                                  format(field.value.from, 'LLL dd, y')
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={{ from: field.value?.from, to: field.value?.to }}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Details</FormLabel>
                      <FormControl><Input placeholder="e.g., 20% OFF, BOGO, $10 Discount" {...field} /></FormControl>
                       <FormDescription>
                        This will be used to generate influencer codes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="maxInfluencers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Influencers (Optional)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 100" {...field} onChange={event => field.onChange(+event.target.value)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Image URL (Optional)</FormLabel>
                      <FormControl><Input placeholder="https://your-image-url.com/image.png" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Campaign
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <DiscountOptimizer onSuggestionApply={handleSuggestionApply} />
      </div>
    </div>
  );
}
