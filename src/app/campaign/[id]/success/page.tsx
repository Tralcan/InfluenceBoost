import { Suspense } from 'react';
import { Logo } from '@/components/logo';
import { SuccessCard } from '@/components/influencer/success-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

function SuccessContent({ code }: { code: string | null }) {
  if (!code) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not retrieve your unique code. Please try signing up again.
        </AlertDescription>
      </Alert>
    );
  }

  return <SuccessCard code={code} />;
}

export default function InfluencerSuccessPage({ searchParams }: { searchParams: { code?: string } }) {
  const code = searchParams.code || null;

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4 sm:p-6">
       <div className="absolute top-6 left-6">
        <Link href="/">
            <Logo />
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent code={code} />
      </Suspense>
    </div>
  );
}
