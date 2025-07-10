import { getCampaignById } from '@/lib/mock-db';
import { notFound } from 'next/navigation';
import { CampaignStats } from '@/components/dashboard/campaign-stats';
import { InfluencersTable } from '@/components/dashboard/influencers-table';
import { QRCodeDisplay } from '@/components/dashboard/qr-code-display';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isPast, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Percent } from 'lucide-react';

function CampaignStatusBadge({ startDate, endDate }: { startDate: Date; endDate: Date }) {
  const now = new Date();
  if (isPast(endDate)) {
    return <Badge variant="outline" className="text-base">Completada</Badge>;
  }
  if (isFuture(startDate)) {
    return <Badge variant="secondary" className="text-base">Programada</Badge>;
  }
  return <Badge className="bg-green-500 hover:bg-green-600 text-white text-base">Activa</Badge>;
}


export default async function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaignById(params.id);

  if (!campaign) {
    notFound();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-2xl font-headline">{campaign.name}</CardTitle>
                        <CampaignStatusBadge startDate={campaign.startDate} endDate={campaign.endDate} />
                    </div>
                    <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(campaign.startDate, 'd MMM, yyyy', { locale: es })} - {format(campaign.endDate, 'd MMM, yyyy', { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        <span>{campaign.discount} de Descuento</span>
                    </div>
                </CardContent>
            </Card>

            <CampaignStats campaign={campaign} />
            <InfluencersTable influencers={campaign.influencers} />
        </div>
        <div className="lg:col-span-1">
            <QRCodeDisplay 
                campaignName={campaign.name} 
                uniqueUrl={campaign.uniqueUrl} 
                qrCodeUrl={campaign.qrCodeUrl} 
            />
        </div>
    </div>
  );
}
