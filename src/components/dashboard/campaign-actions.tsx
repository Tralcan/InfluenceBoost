'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FilePenLine, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteCampaignAction } from '@/app/actions';

export function CampaignActions({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCampaignAction(campaignId);
    if (result.success) {
      toast({
        title: '¡Campaña Eliminada!',
        description: 'La campaña ha sido eliminada correctamente.',
      });
      router.push('/dashboard');
      router.refresh(); // Asegura que la lista de campañas se actualice
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar',
        description: result.error,
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="icon" className="h-8 w-8">
        <Link href={`/dashboard/campaigns/${campaignId}/edit`}>
          <FilePenLine className="h-4 w-4" />
          <span className="sr-only">Editar Campaña</span>
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar Campaña</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <AlertTriangle className="text-destructive"/>
              ¿Estás absolutamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la campaña y todos sus datos asociados (incluidos los influencers inscritos).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Sí, eliminar campaña'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
