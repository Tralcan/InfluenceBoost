import { getCampaignById } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import { InfluencerSignupForm } from '@/components/influencer/signup-form';
import { Logo } from '@/components/logo';
import { isPast, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function InfluencerCampaignPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaignById(params.id);

  if (!campaign) {
    notFound();
  }

  const isCampaignOver = isPast(parseISO(campaign.end_date));
  
  const currentInfluencers = campaign.campaign_influencers.length;
  const maxInfluencers = campaign.max_influencers;
  const isCampaignFull = maxInfluencers !== null && maxInfluencers > 0 && currentInfluencers >= maxInfluencers;


  const renderContent = () => {
    if (isCampaignOver) {
      return (
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
      );
    }

    if (isCampaignFull) {
        return (
            <Alert variant="destructive" className="max-w-lg mx-auto">
                <Users className="h-4 w-4" />
                <AlertTitle>Campaña Completa</AlertTitle>
                <AlertDescription>
                    Esta campaña ha alcanzado el número máximo de influencers y ya no acepta nuevos participantes.
                </AlertDescription>
                 <div className="mt-4">
                    <Button asChild variant="outline">
                        <Link href="/">Volver a la Página Principal</Link>
                    </Button>
                </div>
            </Alert>
        );
    }
    
    return <InfluencerSignupForm campaign={campaign} />;
  }


  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
}
