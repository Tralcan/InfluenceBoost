'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerInfluencerAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Obtener Mi Código Único
    </Button>
  );
}

const initialState = {
  success: false,
  code: null,
  error: null,
};


export function InfluencerSignupForm({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const { toast } = useToast();
  const action = registerInfluencerAction.bind(null, campaign.id);
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.success && state.code) {
      router.push(`/campaign/${campaign.id}/success?code=${state.code}`);
    }
    if (!state.success && state.error) {
      toast({
        variant: 'destructive',
        title: 'Error en el Registro',
        description: state.error,
      });
    }
  }, [state, router, campaign.id, toast]);


  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center space-y-4">
        {campaign.image_url && (
            <div className="aspect-video overflow-hidden rounded-lg border">
                <Image
                    data-ai-hint="campaign image"
                    src={campaign.image_url}
                    alt={campaign.name}
                    width={1200}
                    height={630}
                    className="object-cover"
                    priority
                />
            </div>
        )}
        <div className="space-y-1">
            <p className="text-sm font-medium text-primary">Estás invitado/a a unirte a</p>
            <CardTitle className="font-headline text-3xl">{campaign.name}</CardTitle>
        </div>
        <CardDescription>{campaign.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input id="name" name="name" placeholder="Juan Pérez" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="juan.perez@ejemplo.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialMedia">Usuario de Instagram, TikTok, o YouTube</Label>
            <Input id="socialMedia" name="socialMedia" placeholder="@juanperez" required />
          </div>
          <SubmitButton />
           {state.error && (
             <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
           )}
        </form>
      </CardContent>
    </Card>
  );
}
