'use client';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerInfluencerAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import Image from 'next/image';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Obtener Mi Código Único
    </Button>
  );
}

export function InfluencerSignupForm({ campaign }: { campaign: Campaign }) {
  const action = registerInfluencerAction.bind(null, campaign.id);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center space-y-4">
        {campaign.image_url && (
            <div className="aspect-video overflow-hidden rounded-lg border">
                <Image
                    data-ai-hint="company logo"
                    src={campaign.image_url}
                    alt={campaign.name}
                    width={1200}
                    height={630}
                    className="object-cover"
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
        <form action={action} className="space-y-4">
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
        </form>
      </CardContent>
    </Card>
  );
}
