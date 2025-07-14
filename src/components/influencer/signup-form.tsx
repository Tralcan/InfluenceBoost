
'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerInfluencerAction, findInfluencerByPhoneAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import Image from 'next/image';
import { useEffect, useState, useTransition } from 'react';
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
  const { toast } = useToast();
  const [state, formAction] = useFormState(registerInfluencerAction.bind(null, campaign.id), initialState);

  const [phone, setPhone] = useState('');
  const [foundInfluencer, setFoundInfluencer] = useState<any>(null);
  const [isSearching, startSearchTransition] = useTransition();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [x, setX] = useState('');
  const [other, setOther] = useState('');


  const handlePhoneBlur = () => {
    if (phone && phone.length > 5) {
      startSearchTransition(async () => {
        const result = await findInfluencerByPhoneAction(phone);
        if (result.success && result.data) {
          setFoundInfluencer(result.data);
          setName(result.data.name || '');
          setEmail(result.data.email || '');
          setInstagram(result.data.instagram_handle || '');
          setTiktok(result.data.tiktok_handle || '');
          setX(result.data.x_handle || '');
          setOther(result.data.other_social_media || '');
          toast({
            title: "¡Te encontramos!",
            description: "Hemos rellenado tus datos. Revísalos y continúa.",
          });
        } else {
            setFoundInfluencer(null);
        }
      });
    }
  };


  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error en el Registro',
        description: state.error,
      });
    }
  }, [state, toast]);

  const isDataUrl = campaign.image_url?.startsWith('data:image');

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center space-y-4">
        {campaign.image_url && (
            <div className="aspect-video overflow-hidden rounded-lg border">
                {isDataUrl ? (
                    <Image
                        data-ai-hint="campaign image"
                        src={campaign.image_url}
                        alt={campaign.name}
                        width={1200}
                        height={630}
                        className="object-cover w-full h-full"
                        priority
                    />
                ) : (
                    <img
                        data-ai-hint="campaign image"
                        src={campaign.image_url}
                        alt={campaign.name}
                        className="object-cover w-full h-full"
                    />
                )}
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
          
          <input type="hidden" name="influencer_id" value={foundInfluencer?.id || ''} />

           {foundInfluencer && (
                <Alert variant="default" className="bg-primary/10 border-primary/20">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertTitle className='text-primary'>¡Hola de nuevo, {foundInfluencer.name}!</AlertTitle>
                    <AlertDescription>
                        Hemos rellenado tus datos. Puedes actualizarlos si es necesario.
                    </AlertDescription>
                </Alert>
            )}

          <div className="space-y-2">
            <Label htmlFor="phone_number">Celular</Label>
            <div className='flex items-center gap-2'>
              <Input 
                id="phone_number" 
                name="phone_number" 
                type="tel" 
                placeholder="Ej: +56912345678" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handlePhoneBlur}
                disabled={isSearching}
              />
               {isSearching && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
             <p className="text-xs text-muted-foreground">
                Introduce tu celular (incluyendo código de país) para ver si ya estás registrado/a.
            </p>
          </div>

          <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" name="name" placeholder="Juan Pérez" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="juan.perez@ejemplo.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="instagram_handle">Instagram</Label>
              <Input id="instagram_handle" name="instagram_handle" placeholder="@usuario" value={instagram} onChange={e => setInstagram(e.target.value)} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="tiktok_handle">TikTok</Label>
              <Input id="tiktok_handle" name="tiktok_handle" placeholder="@usuario" value={tiktok} onChange={e => setTiktok(e.target.value)} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="x_handle">X (Twitter)</Label>
              <Input id="x_handle" name="x_handle" placeholder="@usuario" value={x} onChange={e => setX(e.target.value)} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="other_social_media">Otro (ej. YouTube, Blog)</Label>
              <Input id="other_social_media" name="other_social_media" placeholder="URL o usuario" value={other} onChange={e => setOther(e.target.value)} />
          </div>
          <SubmitButton />

           {state?.error && (
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
