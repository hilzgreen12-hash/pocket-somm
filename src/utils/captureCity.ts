import * as Location from 'expo-location';
import { normaliseCity } from './city';

// Best-effort city resolution from GPS. Returns null if permission isn't
// granted or anything fails — saves should never BLOCK on location. The GPS
// fix + reverse-geocode have no native timeout, so on a cold/denied fix they
// could otherwise hang a save spinner indefinitely; we race the whole thing
// against a hard timeout so it always resolves quickly. Shared by chef + lineup.
async function resolveCity(): Promise<string | null> {
  let { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') {
    const req = await Location.requestForegroundPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return null;
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
  const raw = geo?.city ?? geo?.subregion ?? geo?.region ?? null;
  return raw ? normaliseCity(raw) : null;
}

export async function captureCity(timeoutMs = 5000): Promise<string | null> {
  try {
    return await Promise.race([
      resolveCity(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  } catch {
    return null;
  }
}
