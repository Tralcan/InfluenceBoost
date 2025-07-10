import { getCampaignById } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import { EditCampaignForm } from '@/components/dashboard/edit-campaign-form';

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaignById(params.id);

  if (!campaign) {
    notFound();
  }

  return (
    <div>
      <EditCampaignForm campaign={campaign} />
    </div>
  );
}
