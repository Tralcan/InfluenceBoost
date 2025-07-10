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
  campaignGoal: z.string().min(10, 'Por favor, describe tu objetivo con más detalle.'),
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
        discount: `${suggestion.suggestedDiscountPercentage}% DTO`,
        description: suggestion.marketingLanguage,
      });
    }
  };


  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          <span className="font-headline">Optimizador de Descuentos con IA</span>
        </CardTitle>
        <CardDescription>
          ¿No estás seguro del descuento? Deja que nuestra IA sugiera el descuento y el texto de marketing óptimos según tus objetivos.
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
                  <FormLabel>Objetivo Principal de la Campaña</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ej., 'Aumentar rápidamente las ventas de nuestra nueva línea de productos' o 'Atraer nuevos clientes en el rango de edad de 18-25 años'." {...field} />
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
                  <FormLabel>Datos de Campañas Anteriores (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., 'El verano pasado, un 15% de descuento nos dio un 20% de aumento en ventas.'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Generando...' : 'Obtener Sugerencia'}
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
                <CardTitle className="font-headline">Sugerencia de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                    <Badge variant="secondary" className="text-base p-2">
                        <Percent className="mr-2 h-4 w-4" />
                        Descuento Sugerido: {suggestion.suggestedDiscountPercentage}%
                    </Badge>
                </div>

                <div>
                    <h4 className="font-semibold">Texto de Marketing Sugerido:</h4>
                    <p className="text-muted-foreground italic">"{suggestion.marketingLanguage}"</p>
                </div>
                
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Razonamiento</AlertTitle>
                    <AlertDescription>{suggestion.reasoning}</AlertDescription>
                </Alert>

                <Button onClick={handleApplySuggestion}>
                    <Sparkles className="mr-2 h-4 w-4" /> Aplicar Sugerencia
                </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
