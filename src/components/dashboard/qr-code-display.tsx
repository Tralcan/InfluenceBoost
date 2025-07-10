'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Download, QrCode } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
  campaignName: string;
  uniqueUrl: string;
  qrCodeUrl: string;
}

export function QRCodeDisplay({ campaignName, uniqueUrl, qrCodeUrl }: QRCodeDisplayProps) {
  const { toast } = useToast();
  const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${uniqueUrl}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    toast({ title: '¡URL Copiada!', description: 'El enlace de la campaña está ahora en tu portapapeles.' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <QrCode />
          Enlace de Registro de Influencer
        </CardTitle>
        <CardDescription>
          Comparte este enlace o código QR para que los influencers se inscriban en tu campaña.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input value={fullUrl} readOnly />
          <Button variant="outline" size="icon" onClick={copyUrl}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="p-4 border rounded-lg bg-white">
             <Image
                src={qrCodeUrl}
                alt={`Código QR para ${campaignName}`}
                width={200}
                height={200}
              />
          </div>
          <Button asChild>
            <a href={qrCodeUrl} download={`qr-code-${campaignName.toLowerCase().replace(/\s+/g, '-')}.png`}>
              <Download className="mr-2 h-4 w-4" />
              Descargar Código QR
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
