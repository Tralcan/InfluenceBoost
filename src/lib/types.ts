export type Company = {
  id: string;
  name: string;
  email: string;
};

export type Influencer = {
  id: string;
  name: string;
  email: string;
  socialMedia: string;
  campaignId: string;
};

export type Campaign = {
  id: string;
  companyId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  discount: string;
  maxInfluencers: number | null;
  imageUrl: string;
  uniqueUrl: string;
  qrCodeUrl: string;
  influencers: InfluencerCampaign[];
};

export type InfluencerCampaign = {
  id: string;
  influencerId: string;
  campaignId: string;
  name: string;
  socialMedia: string;
  generatedCode: string;
  uses: number;
  points: number;
};
