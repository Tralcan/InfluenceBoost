import type { CampaignWithParticipants } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Users, Percent } from 'lucide-react';
import Link from 'next/link';
import { format, isPast, isFuture, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function CampaignStatusBadge({ startDate, endDate }: { startDate: Date; endDate: Date }) {
  const now = new Date();
  if (isPast(endDate)) {
    return <Badge variant="outline">Completada</Badge>;
  }
  if (isFuture(startDate)) {
    return <Badge variant="secondary">Programada</Badge>;
  }
  return <Badge className="bg-green-500 hover:bg-green-600 text-white">Activa</Badge>;
}

export function CampaignCard({ campaign }: { campaign: CampaignWithParticipants }) {
  const startDate = parseISO(campaign.start_date);
  const endDate = parseISO(campaign.end_date);
  
  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow">
       <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg leading-tight">{campaign.name}</CardTitle>
            <CampaignStatusBadge startDate={startDate} endDate={endDate} />
        </div>
        <CardDescription className="flex items-center gap-2 text-sm pt-1">
            <Calendar className="h-4 w-4" /> 
            <span>{format(startDate, 'dd LLL, yyyy', { locale: es })} - {format(endDate, 'dd LLL, yyyy', { locale: es })}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow grid gap-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
        <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary"/>
                <span className="font-medium">{campaign.campaign_influencers.length} Participantes</span>
            </div>
            <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary"/>
                <span className="font-medium">{campaign.discount}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/campaigns/${campaign.id}`}>
            Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
