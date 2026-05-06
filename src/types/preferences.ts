export type WineType = 'red' | 'white' | 'rose' | 'sparkling';

export interface UserPreferences {
  wineTypes: WineType[];
  styleProfiles: string[];
  defaultBudget: number;
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
}
