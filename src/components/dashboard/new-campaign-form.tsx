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
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createCampaignAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DiscountOptimizer } from './discount-optimizer';
import { useState } from 'react';

const newCampaignSchema = z.object({
  name: z.string().min(5, { message: 'El nombre de la campaña debe tener al menos 5 caracteres.' }),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }),
  dateRange: z.object({
    from: z.date({ required_error: 'Se requiere una fecha de inicio.' }),
    to: z.date({ required_error: 'Se requiere una fecha de finalización.' }),
  }),
  discount: z.string().min(1, { message: 'Los detalles del descuento son obligatorios.' }),
  maxInfluencers: z.coerce.number().positive().optional(),
  imageUrl: z.string().url({ message: 'Por favor, introduce una URL válida.' }).optional().or(z.literal('')),
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
      maxInfluencers: undefined,
    },
  });

  const handleSuggestionApply = (suggestion: { discount: string; description: string }) => {
    form.setValue('discount', suggestion.discount);
    form.setValue('description', suggestion.description, { shouldValidate: true });
    toast({
        title: "¡Sugerencia de IA aplicada!",
        description: "El descuento y la descripción han sido actualizados.",
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
        title: '¡Campaña Creada!',
        description: `Tu nueva campaña "${result.data.name}" está activa.`,
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
            <CardTitle className="font-headline">Crear Nueva Campaña</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Campaña</FormLabel>
                      <FormControl><Input placeholder="ej., Lanzamiento de Moda de Verano" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe los objetivos de tu campaña, público objetivo y mensajes clave." {...field} />
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
                      <FormLabel>Fechas de la Campaña</FormLabel>
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
                                  <>{format(field.value.from, 'd LLL, y', { locale: es })} - {format(field.value.to, 'd LLL, y', { locale: es })}</>
                                ) : (
                                  format(field.value.from, 'd LLL, y', { locale: es })
                                )
                              ) : (
                                <span>Elige un rango de fechas</span>
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
                            locale={es}
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
                      <FormLabel>Detalles del Descuento</FormLabel>
                      <FormControl><Input placeholder="ej., 20% DTO, 2x1, 10€ de Descuento" {...field} /></FormControl>
                       <FormDescription>
                        Esto se usará para generar los códigos de los influencers.
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
                      <FormLabel>Máx. Influencers (Opcional)</FormLabel>
                      <FormControl><Input type="number" placeholder="ej., 100" {...field} value={field.value ?? ''} onChange={event => field.onChange(+event.target.value)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de la Imagen de la Campaña (Opcional)</FormLabel>
                      <FormControl><Input placeholder="https://tu-url-de-imagen.com/imagen.png" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Campaña
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
