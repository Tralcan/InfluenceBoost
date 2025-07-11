import { getInfluencerByCode } from '@/lib/supabase/queries';
import type { InfluencerWithCampaign } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Calendar, Tag, Percent, Hash, Star } from 'lucide-react';
import { SearchForm } from '@/components/dashboard/search-form';
import Link from 'next/link';
import { IncrementUsageButton } from '@/components/dashboard/increment-usage-button';

interface SearchCodePageProps {
  searchParams: {
    code?: string;
  };
}

function ResultCard({ influencer, code }: { influencer: InfluencerWithCampaign, code: string }) {
  if (!influencer.campaigns) {
    return (
        <Card className="mt-6 animate-in fade-in-50">
            <CardHeader>
                <CardTitle>Error de Datos</CardTitle>
            </CardHeader>
            <CardContent>
                <p>No se pudo cargar la información de la campaña para este influencer.</p>
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card className="mt-6 animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="font-headline">Resultado de la Búsqueda</CardTitle>
        <CardDescription>Se encontró el siguiente influencer asociado al código <Badge variant="secondary">{influencer.generated_code}</Badge>.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{influencer.name}</h3>
            <p className="text-sm text-muted-foreground">{influencer.email}</p>
          </div>
        </div>

        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <h4 className='text-sm font-semibold mb-2'>Detalles de la Campaña</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="h-4 w-4" />
                        <span>{influencer.campaigns.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Percent className="h-4 w-4" />
                        <span>{influencer.campaigns.discount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Válido hasta: {new Date(influencer.campaigns.end_date).toLocaleDateString('es-ES')}</span>
                    </div>
                </div>
             </div>
             <div>
                <h4 className='text-sm font-semibold mb-2'>Estadísticas del Influencer</h4>
                 <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        <span>{influencer.uses.toLocaleString('es-ES')} Usos</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span>{influencer.points.toLocaleString('es-ES')} Puntos</span>
                    </div>
                </div>
            </div>
        </div>

      </CardContent>
      <CardFooter className="flex-wrap gap-2 justify-between">
        <IncrementUsageButton influencerId={influencer.id} code={code} />
        <Button asChild variant="outline">
            <Link href={`/dashboard/campaigns/${influencer.campaign_id}`}>
                Ir a la Campaña <ArrowRight className="ml-2 h-4 w-4"/>
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function NoResult({ code }: { code: string }) {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Sin Resultados</CardTitle>
            </CardHeader>
            <CardContent>
                <p>No se encontró ningún influencer con el código <Badge variant="destructive">{code}</Badge>.</p>
                <p className="text-sm text-muted-foreground mt-2">Por favor, verifica que el código sea correcto e inténtalo de nuevo.</p>
            </CardContent>
        </Card>
    )
}

export default async function SearchCodePage({ searchParams }: SearchCodePageProps) {
  const code = searchParams.code;
  let influencer: InfluencerWithCampaign | null = null;

  if (code) {
    influencer = await getInfluencerByCode(code);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Buscar Código de Influencer</CardTitle>
          <CardDescription>
            Introduce un código de descuento para ver qué influencer está asociado a él y a qué campaña pertenece.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchForm />
        </CardContent>
      </Card>
      
      {code && (
        influencer ? <ResultCard influencer={influencer} code={code} /> : <NoResult code={code} />
      )}
    </div>
  );
}
