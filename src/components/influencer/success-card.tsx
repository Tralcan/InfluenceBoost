'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Copy, Share2 } from 'lucide-react';
import Link from 'next/link';

interface SuccessCardProps {
  code: string;
}

export function SuccessCard({ code }: SuccessCardProps) {
    const { toast } = useToast();

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Code Copied!",
            description: "Your unique discount code is now on your clipboard.",
        });
    };

  return (
    <Card className="w-full max-w-lg mx-auto text-center">
      <CardHeader className="space-y-4">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <CardTitle className="font-headline text-3xl">You're In!</CardTitle>
        <CardDescription>
          You have successfully joined the campaign. Here is your unique discount code to share with your audience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-primary rounded-lg p-4">
          <p className="text-4xl font-bold tracking-widest text-primary">{code}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="w-full" onClick={copyCode}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
           <Button variant="secondary" className="w-full" onClick={copyCode}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
        <div className="text-sm text-muted-foreground pt-4">
            <p className="font-semibold">Tips for sharing:</p>
            <ul className="list-disc list-inside text-left mt-2">
                <li>Add the code to your bio link.</li>
                <li>Mention it in your next video or post.</li>
                <li>Create dedicated stories about the discount.</li>
            </ul>
        </div>
        <Button asChild variant="link">
            <Link href="/">Return to Homepage</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
