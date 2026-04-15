export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'any';

export interface UserPreferences {
  wineType: WineType;
  styleProfiles: string[];
  defaultBudget: number;
  defaultCurrency: string;
  favouriteRegions: string[];
  favouriteGrapes: string[];
  dislikedRegions: string[];
  dislikedGrapes: string[];
}
