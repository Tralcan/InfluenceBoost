import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Rocket, Users } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link href="/dashboard">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container grid lg:grid-cols-2 gap-12 items-center py-12 md:py-24 lg:py-32">
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
              Launch Influencer Campaigns That Convert
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              InfluenceBoost provides the tools to create, manage, and track your influencer marketing campaigns effortlessly. Turn followers into customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <Button asChild size="lg">
                <Link href="/dashboard">Create First Campaign <Rocket className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader>
                <CardTitle className="font-headline">Your All-In-One Platform</CardTitle>
                <CardDescription>Everything you need for success.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Easy Campaign Creation</h3>
                    <p className="text-sm text-muted-foreground">Set up campaigns in minutes with our intuitive builder.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Seamless Influencer Onboarding</h3>
                    <p className="text-sm text-muted-foreground">Unique links & QR codes for easy influencer sign-ups.</p>
                  </div>
                </div>
                 <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI-Powered Optimization</h3>
                    <p className="text-sm text-muted-foreground">Get AI suggestions for the best discount to offer.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} InfluenceBoost. All rights reserved.</p>
           <Logo className="h-6" />
        </div>
      </footer>
    </div>
  );
}
