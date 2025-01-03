export type DiscCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export interface UserDisc {
  id: string;
  user_id: string;
  disc_model_id: string;
  storage_location_id: string | null;
  condition: DiscCondition;
  weight: number | null;
  color: string | null;
  personal_notes: string | null;
  front_url: string | null;
  back_url: string | null;
  created_at: string;
  updated_at: string;
}

// Add other existing types...