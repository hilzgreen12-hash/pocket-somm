import * as Location from 'expo-location';
import { normaliseCity } from './city';

// Best-effort city resolution from GPS. Returns null if permission isn't
// granted or anything fails — saves should never block on location. Prompts for
// permission if it hasn't been asked yet. Shared by the chef and lineup flows.
export async function captureCity(): Promise<string | null> {
  try {
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
  } catch {
    return null;
  }
}
