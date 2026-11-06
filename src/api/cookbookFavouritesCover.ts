import AsyncStorage from '@react-native-async-storage/async-storage';

// The Favourites tile isn't a real cookbook folder (it's a filter), so it has no
// row to hold a cover image. Its cover's storage path is kept on this device.
export const FAVOURITES_ID = 'favourites';
const key = (userId: string) => `cookbook-favourites-cover:${userId}`;

export async function getFavouritesCover(userId: string): Promise<string | null> {
  try { return (await AsyncStorage.getItem(key(userId))) || null; } catch { return null; }
}

export async function setFavouritesCover(userId: string, path: string | null): Promise<void> {
  if (path) await AsyncStorage.setItem(key(userId), path);
  else await AsyncStorage.removeItem(key(userId));
}
