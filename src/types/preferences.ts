export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'orange' | 'sweet-fortified';

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
