import type { CampaignWithParticipants } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Hash, Star } from 'lucide-react';

export function CampaignStats({ campaign }: { campaign: CampaignWithParticipants }) {
  const totalUses = campaign.campaign_influencers.reduce((acc, p) => acc + p.uses, 0);
  const mostEffectiveParticipant = [...campaign.campaign_influencers].sort((a, b) => b.uses - a.uses)[0];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Participantes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{campaign.campaign_influencers.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usos Totales del Código</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUses.toLocaleString('es-ES')}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mejor Rendimiento</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mostEffectiveParticipant ? mostEffectiveParticipant.influencers.name : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {mostEffectiveParticipant ? `${mostEffectiveParticipant.uses.toLocaleString('es-ES')} usos` : 'Aún no hay usos'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
