export interface ExtractedWine {
  name: string;
  producer: string;
  region: string;
  appellation?: string;
  grape?: string;
  vintage: number | null;
  menuPrice: number | null;
  currency: string;
}

export interface VintageAssessment {
  label: string;        // e.g. "Exceptional", "Challenging", "Good"
  notes: string;        // e.g. "2014 was an outstanding year for white Burgundy"
}

export interface DrinkingWindow {
  from: number | null;  // earliest year to drink
  to: number | null;    // latest year to drink
  status: 'Too Young' | 'Approaching' | 'Peak' | 'Fading' | 'Past Peak';
  notes: string;        // e.g. "Just entering its peak drinking window"
}

export interface RarityAssessment {
  label: 'Very Rare' | 'Rare' | 'Uncommon' | 'Widely Available';
  notes: string;        // e.g. "Tiny domaine producing under 1,000 cases annually"
}

export interface WineRecommendation {
  name: string;
  producer: string;
  region: string;
  appellation?: string;
  grape?: string;
  vintage: number | null;
  menuPrice: number | null;
  currency: string;
  rationale: string;
  criticScore: number;
  vintageAssessment: VintageAssessment;
  drinkingWindow: DrinkingWindow;
  rarityAssessment: RarityAssessment;
  outsidePreferences?: string | null; // set when wine breaks a stated preference, explains why it's still worth it
  topPickReasons?: string[] | null;  // 2–3 bullet points for the #1 wine only, explaining why it ranks above the others
}

export interface RecommendationResponse {
  wines: WineRecommendation[];
  summary: string;
  topScoringMode?: boolean;
}

// Label scanner types
export interface WineDetails {
  producer: string | null;
  region: string | null;
  wineName: string | null;
  vintage: string | null;
  style: string | null;
}

export interface WineDetailsComplete {
  producer: string;
  region: string;
  wineName: string | null;
  vintage: string;
  style?: string | null;
}

export interface WineIntelligence {
  criticScore: number | null;
  drinkingWindowFrom: number | null;
  drinkingWindowTo: number | null;
  drinkingWindowStatus: 'too_young' | 'approaching' | 'peak' | 'declining' | 'unknown';
  grapeVariety: string | null;
  tastingNotes: string;
  estimatedValue: number | null;
}

export interface Recipe {
  servings: number;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
}

export interface Pairing {
  dishName: string;
  chefInspiration: string;
  pairingNotes: string;
  introduction: string;
  recipe: Recipe;
}

export type DietaryPreference = 'vegetarian' | 'pescatarian' | 'carnivore' | 'vegan';
export type AllergenFilter = 'dairy-free' | 'nut-free' | 'gluten-free';

export interface DietaryFilters {
  dietary: DietaryPreference | null;
  allergens: AllergenFilter[];
  customAllergen: string;
  dietaryNote?: string | null;
  difficulty?: string | null;
  timeConsideration?: string | null;
  specificConcerns?: string | null;
  regionalPreferences?: string[];
  nutritionalPreferences?: string[];
}

// Cellar types
export interface CellarWine {
  id: string;
  user_id: string;
  wine_name: string;
  producer: string | null;
  region: string | null;
  vintage: string | null;
  quantity: number;
  storage_location: string | null;
  date_received: string | null;
  critic_score: number | null;
  drinking_window_from: number | null;
  drinking_window_to: number | null;
  drinking_window_status: string;
  tasting_notes: string | null;
  grape_variety: string | null;
  label_image_path: string | null;
  user_notes: string | null;
  is_wishlist: boolean;
  archived_at: string | null;
  purchase_price: number | null;
  purchase_price_currency: string | null;
  estimated_value: number | null;
  estimated_value_currency: string | null;
  estimated_value_at: string | null;
  review_score: number | null;
  review_location: string | null;
  review_date: string | null;
  created_at: string;
  updated_at: string;
}

// Rack types
export interface WineRack {
  id: string;
  user_id: string;
  name: string;
  rows: number;
  cols: number;
  storage_type: 'rack' | 'fridge';
  created_at: string;
}

export interface RackSlot {
  id: string;
  rack_id: string;
  row_index: number;
  col_index: number;
  cellar_wine_id: string | null;
  wine?: CellarWine | null;
}

// Community types
export interface CommunityPost {
  id: string;
  user_id: string;
  display_name: string;
  avatar: string | null;
  content: string;
  wine_name: string | null;
  wine_producer: string | null;
  wine_vintage: string | null;
  cellar_wine_id: string | null;
  created_at: string;
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  display_name: string;
  avatar: string | null;
  content: string;
  created_at: string;
}

export interface ChosenWine {
  id: string;
  user_id: string;
  chosen_at: string;
  // Links a chosen wine back to the scan session it was picked from,
  // so a restaurant visit can carry multiple chosen wines without
  // relying on name+city heuristics. Nullable for wines added manually
  // and for legacy rows pre-migration 032.
  scan_session_id: string | null;
  wine_name: string;
  producer: string | null;
  region: string | null;
  appellation: string | null;
  grape: string | null;
  vintage: number | null;
  menu_price: number | null;
  currency: string;
  critic_score: number | null;
  rationale: string | null;
  vintage_assessment: VintageAssessment | null;
  drinking_window: DrinkingWindow | null;
  rarity_assessment: RarityAssessment | null;
  restaurant_name: string | null;
  city: string | null;
  tasting_note: string | null;
  other_observations: string | null;
  user_score: number | null;
}

export interface PricingData {
  averageMarketPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  currency: string;
  criticScore: number | null;
  source: 'wine-searcher' | 'unavailable';
}
