'use server';

import type { Campaign, InfluencerCampaign } from '@/lib/types';
import { addDays, formatISO } from 'date-fns';

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    companyId: '1',
    name: 'Summer Sale Spectacle',
    description: 'A huge summer sale event to boost our new line of sunglasses. We want to reach a young, fashion-forward audience on Instagram and TikTok.',
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
    discount: '25% OFF',
    maxInfluencers: 50,
    imageUrl: `https://placehold.co/1200x630.png`,
    uniqueUrl: '/campaign/1',
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${process.env.NEXT_PUBLIC_BASE_URL||'http://localhost:3000'}/campaign/1`,
    influencers: [
      { id: '101', influencerId: 'inf1', campaignId: '1', name: 'Alice Johnson', socialMedia: '@alicej', generatedCode: 'ALICE25', uses: 150, points: 1500 },
      { id: '102', influencerId: 'inf2', campaignId: '1', name: 'Bob Williams', socialMedia: '@bobw', generatedCode: 'BOB25', uses: 120, points: 1200 },
      { id: '103', influencerId: 'inf3', campaignId: '1', name: 'Charlie Brown', socialMedia: '@charlieb', generatedCode: 'CHARLIE25', uses: 200, points: 2000 },
    ],
  },
  {
    id: '2',
    companyId: '1',
    name: 'Winter Wellness Retreat',
    description: 'Promoting our new line of wellness products for the winter season. Targeting micro-influencers in the health and wellness space.',
    startDate: addDays(new Date(), -60),
    endDate: addDays(new Date(), -10),
    discount: 'Buy One Get One Free',
    maxInfluencers: 20,
    imageUrl: `https://placehold.co/1200x630.png`,
    uniqueUrl: '/campaign/2',
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${process.env.NEXT_PUBLIC_BASE_URL||'http://localhost:3000'}/campaign/2`,
    influencers: [
       { id: '201', influencerId: 'inf4', campaignId: '2', name: 'Diana Prince', socialMedia: '@dianap', generatedCode: 'DIANABOGO', uses: 80, points: 1600 },
       { id: '202', influencerId: 'inf5', campaignId: '2', name: 'Eve Adams', socialMedia: '@evea', generatedCode: 'EVEBOGO', uses: 95, points: 1900 },
    ],
  },
];

let campaigns: Campaign[] = [...MOCK_CAMPAIGNS];

export async function getCampaigns(): Promise<Campaign[]> {
  return Promise.resolve(campaigns);
}

export async function getCampaignById(id: string): Promise<Campaign | undefined> {
  return Promise.resolve(campaigns.find(c => c.id === id));
}

export async function createCampaign(data: Omit<Campaign, 'id' | 'uniqueUrl' | 'qrCodeUrl' | 'influencers' | 'companyId'>): Promise<Campaign> {
  const newId = (campaigns.length + 1).toString();
  const newCampaign: Campaign = {
    ...data,
    id: newId,
    companyId: '1', // Mocked user
    uniqueUrl: `/campaign/${newId}`,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${process.env.NEXT_PUBLIC_BASE_URL||'http://localhost:3000'}/campaign/${newId}`,
    influencers: [],
  };
  campaigns.push(newCampaign);
  return Promise.resolve(newCampaign);
}

export async function registerInfluencer(campaignId: string, influencerData: { name: string, email: string, socialMedia: string }): Promise<InfluencerCampaign> {
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }

    const influencerId = `inf${Math.floor(Math.random() * 1000)}`;
    const discountValue = campaign.discount.match(/\d+/)?.[0] || '10';
    const generatedCode = `${influencerData.name.split(' ')[0].toUpperCase()}${discountValue}`;

    const newInfluencerCampaign: InfluencerCampaign = {
        id: `ic${Math.floor(Math.random() * 1000)}`,
        influencerId,
        campaignId,
        name: influencerData.name,
        socialMedia: influencerData.socialMedia,
        generatedCode,
        uses: 0,
        points: 0,
    };

    campaign.influencers.push(newInfluencerCampaign);
    return Promise.resolve(newInfluencerCampaign);
}
