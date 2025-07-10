import { Button } from '@/components/ui/button';
import { getCampaigns } from '@/lib/mock-db';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { CampaignCard } from '@/components/dashboard/campaign-card';

export default async function DashboardPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Your Campaigns</h1>
          <p className="text-muted-foreground">Here's an overview of your marketing initiatives.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      {campaigns.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No campaigns yet!</h2>
          <p className="text-muted-foreground mt-2">Get started by creating your first campaign.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/campaigns/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Campaign
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
