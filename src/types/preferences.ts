// 'orange' was removed when Natural / Low-Intervention became a wine
// type in its own right (it covers most of what was sitting under
// "orange" plus a wider sweep of low-intervention production). Legacy
// rows saved as 'orange' are pruned in usePreferences (see
// VALID_WINE_TYPES set) so they don't bleed into prompts or summaries.
export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'natural' | 'sweet-fortified';

export interface UserPreferences {
  wineTypes: WineType[];
  styleProfiles: string[];
  defaultBudget: number | null;
  defaultCurrency: string;
  favouriteRegions: string[];
  favouriteGrapes: string[];
  dislikedRegions: string[];
  dislikedGrapes: string[];
  dietaryNeeds: string[];
  allergyRisks: string[];
  specificConcerns: string;
  regionalPreferences: string[];
  nutritionalPreferences: string[];
  onboardingCompleted: boolean;
}
