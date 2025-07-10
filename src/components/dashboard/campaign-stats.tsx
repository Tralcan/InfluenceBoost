import type { Campaign } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Hash, Star } from 'lucide-react';

export function CampaignStats({ campaign }: { campaign: Campaign }) {
  const totalUses = campaign.influencers.reduce((acc, inf) => acc + inf.uses, 0);
  const mostEffectiveInfluencer = campaign.influencers.sort((a, b) => b.uses - a.uses)[0];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Influencers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{campaign.influencers.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Code Uses</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUses.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mostEffectiveInfluencer ? mostEffectiveInfluencer.name : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {mostEffectiveInfluencer ? `${mostEffectiveInfluencer.uses.toLocaleString()} uses` : 'No uses yet'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
