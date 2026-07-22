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
  topPickReasons?: string[] | null;  // legacy — superseded by the labelled notes below; kept for fallback on older saved sessions
  // Four labelled parameter notes shown (in this order) on the results
  // card: Critic Score, Value, Vintage/Drinkability, Producer. The recommend
  // edge function generates criticScoreNote + valueNote; vintage/producer
  // reuse vintageAssessment.notes + rarityAssessment.notes. Optional so
  // sessions saved before the prompt upgrade still parse.
  criticScoreNote?: string | null;
  valueNote?: string | null;
  // Top pick (#1) only — one brief synthesis sentence on why it leads.
  standoutNote?: string | null;
  // One brief tasting-only sentence — what the wine actually tastes
  // like, not why it was picked. No vintage notes, no producer info,
  // no scores. Surfaces on the compact card and on the share card so
  // a friend skim-reading the share knows what they're being shown.
  flavourProfile?: string | null;
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
  // Bottle volume in millilitres if the scanner can read it off the label
  // (most labels print "750ml" / "75cl" / "1.5L" near the ABV). null when
  // not detected — the user picks a size manually in that case.
  bottleSizeMl: number | null;
  // Pre-seeded quantity when this wine arrives from a batched lineup entry
  // (N identical bottles). Optional — single-bottle flows omit it (=> 1).
  quantity?: number;
}

export interface WineDetailsComplete {
  producer: string;
  region: string;
  wineName: string | null;
  vintage: string;
  style?: string | null;
  bottleSizeMl?: number | null;
  // Carried through from a batched lineup entry to seed the cellar quantity.
  quantity?: number;
}

// A single named critic's published score. `critic` is a short
// abbreviation (JS = James Suckling, JR = Jancis Robinson, NM = Neal
// Martin, WK = William Kelly, etc.). Most critics score out of 100;
// `scale` carries the denominator since Jancis Robinson uses /20.
export interface CriticScore {
  critic: string;
  score: number;
  scale: string;
}

export interface WineIntelligence {
  // Average / consensus critic score (out of 100). Shown as "Avg Critic
  // Score" on the Wine Intel card, with the per-critic breakdown below.
  criticScore: number | null;
  // Short explanation surfaced when criticScore is null — e.g. "small
  // producer, no published reviews." Lets Vinster say WHY rather than
  // showing a blank score with no context.
  criticScoreNote?: string | null;
  // Individual published scores Vinster is confident are real for this
  // exact wine + vintage. Empty / absent when none are recalled.
  criticScores?: CriticScore[] | null;
  drinkingWindowFrom: number | null;
  drinkingWindowTo: number | null;
  drinkingWindowStatus: 'too_young' | 'approaching' | 'peak' | 'declining' | 'unknown';
  grapeVariety: string | null;
  tastingNotes: string;
  // Single best per-bottle estimate. Returned null readily — only set when
  // Vinster is reasonably confident — since a wrong number is worse than
  // none. The low/high bracket a plausible range; valueConfidence flags how
  // much to trust it. Range + confidence are display-only (not persisted).
  estimatedValue: number | null;
  estimatedValueLow?: number | null;
  estimatedValueHigh?: number | null;
  valueConfidence?: 'high' | 'medium' | 'low' | null;
  // Where the headline estimatedValue came from once Wine-Searcher is consulted:
  // 'wine-searcher' = real market average (in the user's currency), 'vinster' =
  // Claude estimate. Set by generateWineIntel; persisted to estimated_value_source.
  valueSource?: 'wine-searcher' | 'vinster' | null;
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
  servings?: number | null;
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
  // One-sentence explanation surfaced when critic_score is null — saved at
  // wine-intelligence generation time. Migration 033 adds this column.
  critic_score_note: string | null;
  drinking_window_from: number | null;
  drinking_window_to: number | null;
  drinking_window_status: string;
  tasting_notes: string | null;
  grape_variety: string | null;
  label_image_path: string | null;
  // Migration 064. The home-storage location (non-grid, e.g. "the shed") this
  // wine physically lives in, if any. Distinct from rack placement and from the
  // Cellar List "Locations" filter. Optional (nullable column, DB-defaulted) so
  // wine-insert call sites don't all need to set it.
  storage_location_id?: string | null;
  // Migration 069. The case (single-wine OWC or a mixed case) this wine is
  // boxed in, within its storage location. Optional/nullable — loose bottles
  // have no case.
  case_id?: string | null;
  // Migration 072. The bin diamond/triangle cell this wine is filed into, if
  // any. Count-based (the row's quantity is how many bottles are in the cell).
  // Optional/nullable — non-bin wines have none.
  bin_cell_id?: string | null;
  user_notes: string | null;
  // Migration 043. The user's WRITTEN REVIEW — sharable to community
  // and outside the app. Distinct from user_notes (Personal Notes,
  // private). Null on legacy rows; the wine card prefers review_note
  // when populated and falls back to user_notes for the community
  // post body so pre-existing posts aren't lost.
  review_note: string | null;
  is_wishlist: boolean;
  archived_at: string | null;
  purchase_price: number | null;
  purchase_price_currency: string | null;
  estimated_value: number | null;
  estimated_value_currency: string | null;
  estimated_value_at: string | null;
  // Where Estimated Value came from (migration 053): 'wine-searcher' = real
  // market data, 'vinster' = Claude estimate. Null on legacy/untouched rows.
  estimated_value_source: string | null;
  // "Dive Deeper" editorial profiles (migration 054), generated lazily and
  // cached. Shape: { producerProfile, regionProfile, vintageProfile, grapeProfile }.
  wine_knowledge: WineKnowledgeData | null;
  wine_knowledge_at: string | null;
  review_score: number | null;
  review_location: string | null;
  review_date: string | null;
  // The user's own drinking-window opinion (migration 048) — free text,
  // distinct from the Vinster drinking_window_* estimate above.
  user_drinking_window: string | null;
  is_favourite: boolean;
  // Favourite LABEL flag (migration 049) — Label Library only, distinct
  // from is_favourite (favourite wine).
  label_favourite: boolean;
  // Bottle volume in millilitres. 750 = standard, 1500 = magnum, 375 =
  // half, etc. Defaults to 750 on legacy rows via migration 040.
  bottle_size_ml: number;
  created_at: string;
  updated_at: string;
}

// Home storage location (migration 064) — a non-grid space the user photographs
// and fills with a loose list of wines (via cellar_wines.storage_location_id).
export interface StorageLocation {
  id: string;
  user_id: string;
  name: string;
  photo_path: string | null;
  created_at: string;
  // Convenience count of wines filed here, when the query provides it.
  wineCount?: number;
}

// A case of bottles boxed together inside a storage location (migration 069).
// kind='single' → many bottles of one wine; kind='mixed' → different wines.
export interface StorageCase {
  id: string;
  user_id: string;
  storage_location_id: string | null;
  name: string;
  // 'single' is legacy (a single-wine case). Migration 073 splits single-wine
  // cases into 'owc' (original wooden case) and 'non_owc' (self-boxed complete
  // case); 'mixed' is different wines boxed together.
  kind: 'single' | 'mixed' | 'owc' | 'non_owc';
  note: string | null;
  created_at: string;
}

// Rack types
export interface WineRack {
  id: string;
  user_id: string;
  name: string;
  // On bins (migration 072) these are NULL in the DB — bins are count-based,
  // not a slot grid — but bins never go through the rack rows/cols code paths,
  // so the type stays `number` to keep the rack call sites clean.
  rows: number;
  cols: number;
  storage_type: 'rack' | 'fridge' | 'bin';
  created_at: string;
  // Optional large-format row that sits above the standard grid. Both
  // null = no special row. Slots in this row use row_index = -1 in
  // rack_slots; columns 0..large_format_cols-1.
  large_format_cols: number | null;
  large_format_bottle_size_ml: number | null;
  // Bin fields (migration 072, storage_type='bin' only). The diamond grid
  // arrangement and per-full-diamond bottle capacity. NULL on racks/fridges.
  diamonds_across?: number | null;
  diamonds_down?: number | null;
  diamond_capacity?: number | null;
}

// A single cell of a wine bin (migration 072). Interior cells are full
// diamonds; cells on the edge of the unit are triangles holding half.
export interface BinCell {
  id: string;
  bin_id: string;
  idx: number;
  kind: 'diamond' | 'triangle';
  capacity: number;
  // Joined in when listing a bin's cells: the wines filed into this cell and
  // the summed bottle count, for the fill meter.
  wines?: CellarWine[];
  bottleCount?: number;
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
  // Wine colour / style (red, white, rosé…), migration 070. Nullable.
  style: string | null;
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
  is_favourite: boolean;
  // Review-level wish-list flag (migration 045) — set via "Add to Wish
  // List" on the review card; drives the Wish List Wines filter.
  wishlist: boolean;
  // Purchase price + AI estimated value (migration 044) — mirror the
  // equivalent cellar_wines columns so the review card can show them.
  purchase_price: number | null;
  purchase_price_currency: string | null;
  estimated_value: number | null;
  estimated_value_currency: string | null;
  estimated_value_at: string | null;
  estimated_value_source: string | null;
  // Source discriminator (migration 042). 'restaurant' = came from a
  // List scan or manual entry on Your Wine Reviews. 'other' = reviewed
  // via the "Review without adding" path on /label/results (Cellar
  // add-wine flow). Legacy rows default to 'restaurant'.
  source: 'restaurant' | 'other';
  // When the pick first gained review content (migration 047). Stamped by
  // a DB trigger; null for bare, unreviewed bottle picks. Drives the
  // "Reviewed <date>" marker on Your Restaurants · Your Bottle Picks.
  reviewed_at: string | null;
  // The user's own drinking-window opinion (migration 048) — free text.
  user_drinking_window: string | null;
  // Label photo for the review (migration 067). Stored in the wine-labels
  // bucket (<user>/<chosenId>.jpg) and displayed via LabelThumb, exactly
  // like cellar_wines.label_image_path. Captured when a review is created
  // via Scan / Upload on Your Wine Reviews. Null for manual / legacy rows.
  label_image_path: string | null;
}

// A Your Label Library entry (migration 066). A standalone photo record that
// can exist without a cellar or review row — see 066_labels.sql. `intel` is a
// captured WineIntelligence snapshot (null when unknown at capture time).
export interface LibraryLabel {
  id: string;
  user_id: string;
  label_image_path: string | null;
  producer: string | null;
  wine_name: string | null;
  vintage: number | null;
  region: string | null;
  intel: WineIntelligence | null;
  captured_city: string | null;
  captured_place: string | null;
  is_favourite: boolean;
  created_at: string;
}

// Cached "Dive Deeper" editorial profiles stored on cellar_wines.wine_knowledge.
export interface WineKnowledgeData {
  producerProfile: string;
  regionProfile: string;
  vintageProfile: string;
  grapeProfile: string;
}

export interface PricingData {
  // True only when Wine-Searcher actually matched the wine (return-code 0).
  // false on an explicit miss or any proxy error — callers should fall back
  // to the Claude estimate in that case.
  matched?: boolean;
  averageMarketPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  currency: string;
  criticScore: number | null;
  region?: string | null;
  grape?: string | null;
  wsWineId?: string | null;
  source: 'wine-searcher' | 'unavailable';
}
