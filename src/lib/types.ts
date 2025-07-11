export type Company = {
  id: string;
  name: string;
  email: string;
};

// Represents the core influencer profile
export type Influencer = {
  id: string; // uuid, primary key
  name: string;
  email: string;
  phone_number: string | null;
  tiktok_handle: string | null;
  instagram_handle: string | null;
  x_handle: string | null;
  other_social_media: string | null;
  points: number; // Cumulative points across all campaigns
  created_at: string;
};

// Represents the structure in the 'campaigns' table
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

// Represents the join table record, linking an influencer to a campaign
export type CampaignInfluencer = {
  id: string; // uuid, primary key
  campaign_id: string; // FK to campaigns
  influencer_id: string; // FK to influencers
  generated_code: string;
  uses: number;
  created_at: string;
  // We can join to get influencer details
  influencers: Pick<Influencer, 'name' | 'email' | 'instagram_handle' | 'tiktok_handle' | 'x_handle' | 'other_social_media' | 'points'>;
};

// For the main dashboard view: Campaign with its list of participants
export type CampaignWithParticipants = Campaign & {
  campaign_influencers: CampaignInfluencer[];
};

// For the code search result page
export type CampaignParticipantInfo = {
  id: string; // ID of the campaign_influencers record
  campaign_id: string;
  influencer_id: string;
  generated_code: string;
  uses: number;
  campaigns: Campaign; // The campaign details
  influencers: Influencer; // The influencer details
};
