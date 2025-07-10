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
import { format, formatISO, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { updateCampaignAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useState } from 'react';
import type { Campaign } from '@/lib/types';

const editCampaignSchema = z.object({
  name: z.string().min(5, { message: 'El nombre de la campaña debe tener al menos 5 caracteres.' }),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }),
  dateRange: z.object({
    from: z.date({ required_error: 'Se requiere una fecha de inicio.' }),
    to: z.date({ required_error: 'Se requiere una fecha de finalización.' }),
  }),
  discount: z.string().min(1, { message: 'Los detalles del descuento son obligatorios.' }),
  max_influencers: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
    z.number().int().nonnegative({ message: 'Debe ser un número positivo.' }).nullable().optional()
  ),
  image_url: z.string().url({ message: "Por favor, introduce una URL válida." }).or(z.literal('')).nullable().optional(),
});

type EditCampaignFormValues = z.infer<typeof editCampaignSchema>;

export function EditCampaignForm({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditCampaignFormValues>({
    resolver: zodResolver(editCampaignSchema),
    defaultValues: {
      name: campaign.name,
      description: campaign.description,
      discount: campaign.discount,
      max_influencers: campaign.max_influencers ?? 0,
      image_url: campaign.image_url,
      dateRange: {
        from: parseISO(campaign.start_date),
        to: parseISO(campaign.end_date),
      },
    },
  });

  async function onSubmit(data: EditCampaignFormValues) {
    setIsSubmitting(true);
    const campaignData = {
      name: data.name,
      description: data.description,
      start_date: formatISO(data.dateRange.from),
      end_date: formatISO(data.dateRange.to),
      discount: data.discount,
      max_influencers: data.max_influencers,
      image_url: data.image_url,
    };

    const result = await updateCampaignAction(campaign.id, campaignData);

    if (result.success) {
      toast({
        title: '¡Campaña Actualizada!',
        description: `Tu campaña "${result.data.name}" ha sido actualizada.`,
      });
      router.push(`/dashboard/campaigns/${result.data.id}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: result.error,
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Editar Campaña</CardTitle>
        <CardDescription>Realiza cambios en tu campaña y guarda para aplicarlos.</CardDescription>
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
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="max_influencers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máx. Influencers (Opcional)</FormLabel>
                  <FormControl><Input type="number" placeholder="ej., 100" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen de la Campaña (Opcional)</FormLabel>
                  <FormControl><Input placeholder="https://tu-url-de-imagen.com/imagen.png" {...field} value={field.value ?? ''} /></FormControl>
                  <FormDescription>Si se deja vacío, la IA generará una imagen al crear una nueva campaña.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" disabled={isSubmitting}>
               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
