import { getCampaignById } from '@/lib/mock-db';
import { notFound } from 'next/navigation';
import { InfluencerSignupForm } from '@/components/influencer/signup-form';
import { Logo } from '@/components/logo';
import { isPast } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function InfluencerCampaignPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaignById(params.id);

  if (!campaign) {
    notFound();
  }

  const isCampaignOver = isPast(campaign.endDate);

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="w-full">
        {isCampaignOver ? (
          <Alert variant="destructive" className="max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>La Campaña Ha Finalizado</AlertTitle>
            <AlertDescription>
              Esta campaña ya no acepta nuevos influencers.
            </AlertDescription>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/">Volver a la Página Principal</Link>
              </Button>
            </div>
          </Alert>
        ) : (
          <InfluencerSignupForm campaign={campaign} />
        )}
      </div>
    </div>
  );
}
