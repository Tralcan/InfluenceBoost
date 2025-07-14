'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Copy, Share2 } from 'lucide-react';

interface SuccessCardProps {
  code: string;
}

export function SuccessCard({ code }: SuccessCardProps) {
    const { toast } = useToast();

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        toast({
            title: "¡Código Copiado!",
            description: "Tu código de descuento único está ahora en tu portapapeles.",
        });
    };

  return (
    <Card className="w-full max-w-lg mx-auto text-center">
      <CardHeader className="space-y-4">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <CardTitle className="font-headline text-3xl">¡Estás Dentro!</CardTitle>
        <CardDescription>
          Te has unido a la campaña con éxito. Aquí tienes tu código de descuento único para compartir con tu audiencia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-primary rounded-lg p-4">
          <p className="text-4xl font-bold tracking-widest text-primary">{code}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="w-full" onClick={copyCode}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar Código
          </Button>
           <Button variant="secondary" className="w-full" onClick={copyCode}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartir
          </Button>
        </div>
        <div className="text-sm text-muted-foreground pt-4">
            <p className="font-semibold">Consejos para compartir:</p>
            <ul className="list-disc list-inside text-left mt-2">
                <li>Añade el código a tu enlace en la biografía.</li>
                <li>Menciónalo en tu próximo vídeo o publicación.</li>
                <li>Crea historias dedicadas sobre el descuento.</li>
            </ul>
        </div>
      </CardContent>
    </Card>
  );
}
