'use client'
import type { Influencer } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Copy, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SocialLink = ({ platform, handle }: { platform: 'Instagram' | 'TikTok' | 'X' | 'Other', handle: string | null }) => {
    if (!handle) return null;

    let href = '';
    switch (platform) {
        case 'Instagram':
            href = `https://instagram.com/${handle.replace('@', '')}`;
            break;
        case 'TikTok':
            href = `https://tiktok.com/@${handle.replace('@', '')}`;
            break;
        case 'X':
            href = `https://x.com/${handle.replace('@', '')}`;
            break;
        case 'Other':
            href = handle.startsWith('http') ? handle : `https://${handle}`;
            break;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={href} target="_blank" rel="noopener noreferrer">
                           <ExternalLink className="h-4 w-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{platform}: {handle}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};


export function InfluencersTable({ influencers }: { influencers: Influencer[] }) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "¡Código copiado!",
        description: "El código del influencer se ha copiado a tu portapapeles."
    })
  }
  
  if (influencers.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Influencers Inscritos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Aún no se ha inscrito ningún influencer.</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Influencers Inscritos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nombre</TableHead>
              <TableHead>Redes Sociales</TableHead>
              <TableHead>Código Generado</TableHead>
              <TableHead className="text-right">Usos</TableHead>
              <TableHead className="text-right">Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.sort((a,b) => b.points - a.points).map((influencer) => (
              <TableRow key={influencer.id}>
                <TableCell className="font-medium">{influencer.name}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-1">
                        <SocialLink platform="Instagram" handle={influencer.instagram_handle} />
                        <SocialLink platform="TikTok" handle={influencer.tiktok_handle} />
                        <SocialLink platform="X" handle={influencer.x_handle} />
                        <SocialLink platform="Other" handle={influencer.other_social_media} />
                    </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Badge variant="outline">{influencer.generated_code}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(influencer.generated_code)}>
                        <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">{influencer.uses.toLocaleString('es-ES')}</TableCell>
                <TableCell className="text-right">{influencer.points.toLocaleString('es-ES')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
