'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { incrementUsageAction } from '@/app/actions';
import { Check, Loader2, PlusCircle } from 'lucide-react';

interface IncrementUsageButtonProps {
  participantId: string;
  influencerId: string;
  code: string;
}

export function IncrementUsageButton({ participantId, influencerId, code }: IncrementUsageButtonProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    const result = await incrementUsageAction(participantId, influencerId, code);
    setIsPending(false);

    if (result.success) {
      setIsSuccess(true);
      toast({
        title: '¡Uso Registrado!',
        description: `Se ha registrado un nuevo uso para el código ${code}.`,
      });
      setTimeout(() => setIsSuccess(false), 2000); // Reset button state
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  return (
    <Button onClick={handleClick} disabled={isPending || isSuccess}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Registrando...
        </>
      ) : isSuccess ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          ¡Registrado!
        </>
      ) : (
        <>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Uso
        </>
      )}
    </Button>
  );
}
