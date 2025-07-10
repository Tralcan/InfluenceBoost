import type { InfluencerCampaign } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Copy } from 'lucide-react';
import { Button } from '../ui/button';

export function InfluencersTable({ influencers }: { influencers: InfluencerCampaign[] }) {

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optionally add a toast notification here
  }
  
  if (influencers.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Enrolled Influencers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No influencers have signed up yet.</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Enrolled Influencers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Social Media</TableHead>
              <TableHead>Generated Code</TableHead>
              <TableHead className="text-right">Uses</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.sort((a,b) => b.points - a.points).map((influencer) => (
              <TableRow key={influencer.id}>
                <TableCell className="font-medium">{influencer.name}</TableCell>
                <TableCell>{influencer.socialMedia}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Badge variant="outline">{influencer.generatedCode}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(influencer.generatedCode)}>
                        <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">{influencer.uses.toLocaleString()}</TableCell>
                <TableCell className="text-right">{influencer.points.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
