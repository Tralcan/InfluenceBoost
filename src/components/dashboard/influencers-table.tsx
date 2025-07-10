import type { InfluencerCampaign } from '@/lib/types';
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
import { Copy } from 'lucide-react';
import { Button } from '../ui/button';

export function InfluencersTable({ influencers }: { influencers: InfluencerCampaign[] }) {

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Opcionalmente, agregar una notificación toast aquí
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
              <TableHead>Red Social</TableHead>
              <TableHead>Código Generado</TableHead>
              <TableHead className="text-right">Usos</TableHead>
              <TableHead className="text-right">Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.sort((a,b) => b.points - a.points).map((influencer) => (
              <TableRow key={influencer.id}>
                <TableCell className="font-medium">{influencer.name}</TableCell>
                <TableCell>{influencer.socialMedia}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Badge variant="outline">{influencer.generatedCode}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(influencer.generatedCode)}>
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
