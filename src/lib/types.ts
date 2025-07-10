export type Company = {
  id: string;
  name: string;
  email: string;
};

// This represents the structure in the 'influencers' table
export type Influencer = {
  id: string; // uuid, primary key
  name: string;
  email: string;
  tiktok_handle: string | null;
  instagram_handle: string | null;
  x_handle: string | null;
  other_social_media: string | null;
  campaign_id: string; // uuid, foreign key to campaigns
  generated_code: string;
  uses: number; // default 0
  points: number; // default 0
  created_at: string;
};

// This represents the structure in the 'campaigns' table
export type Campaign = {
  id: string; // uuid, primary key
  company_id: string; // mock for now
  name: string;
  description: string;
  start_date: string; // ISO 8601 string
  end_date: string; // ISO 8601 string
  discount: string;
  max_influencers: number | null;
  image_url: string | null;
  created_at: string;
};


// This is a combined type for UI components that need campaign data with its influencers
export type CampaignWithInfluencers = Campaign & {
  influencers: Influencer[];
};
