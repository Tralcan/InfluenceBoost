
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  useEffect(() => {
    const signInWithGoogle = async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
    };
    signInWithGoogle();
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <h1 className="mt-4 text-xl font-semibold">Redirigiendo a la página de inicio de sesión...</h1>
      <p className="text-muted-foreground">Por favor, espera un momento.</p>
    </div>
  );
}
