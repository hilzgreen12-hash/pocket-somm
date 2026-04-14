import type { ExtractedWine, RecommendationResponse } from './wine';
import type { UserPreferences } from './preferences';

export interface ScanSession {
  id: string;
  user_id: string;
  captured_at: string;
  restaurant_name: string | null;
  image_path: string | null;
  extracted_wines: ExtractedWine[];
  recommendation: RecommendationResponse | null;
  preferences_snapshot: UserPreferences | null;
}
