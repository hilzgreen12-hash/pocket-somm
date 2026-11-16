import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// An anonymous id for this phone, made on first use and kept in the secure
// store. Sent with every server call so a guest's allowance (two scans a day)
// belongs to their phone, not to the restaurant Wi-Fi they share with others.
// It identifies nothing about the person.
const KEY = 'vinster_device_id';
let cached: Promise<string | null> | null = null;

export function deviceId(): Promise<string | null> {
  cached ??= (async () => {
    try {
      const saved = await SecureStore.getItemAsync(KEY);
      if (saved) return saved;
      const id = Crypto.randomUUID();
      await SecureStore.setItemAsync(KEY, id);
      return id;
    } catch {
      cached = null; // try again on the next call
      return null;
    }
  })();
  return cached;
}
