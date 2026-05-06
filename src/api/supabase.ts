import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// expo-secure-store enforces a 2 KB limit per value. Supabase sessions
// (JWT + refresh token + user metadata) routinely exceed that, which
// previously caused setItemAsync to throw and the session to silently
// fail to persist — users were getting signed out on every app restart.
// We split values across numbered chunks with a meta key tracking the
// chunk count, falling through to the legacy single-key path for older
// data.
const CHUNK_SIZE = 1800;
const META_SUFFIX = '__chunks';

async function deleteChunked(key: string) {
  const meta = await SecureStore.getItemAsync(`${key}${META_SUFFIX}`);
  await SecureStore.deleteItemAsync(key).catch(() => {});
  if (!meta) return;
  const count = parseInt(meta, 10);
  if (!Number.isFinite(count)) return;
  await SecureStore.deleteItemAsync(`${key}${META_SUFFIX}`).catch(() => {});
  for (let i = 0; i < count; i++) {
    await SecureStore.deleteItemAsync(`${key}_${i}`).catch(() => {});
  }
}

const chunkedStorage = {
  async getItem(key: string): Promise<string | null> {
    const meta = await SecureStore.getItemAsync(`${key}${META_SUFFIX}`);
    if (!meta) return SecureStore.getItemAsync(key);
    const count = parseInt(meta, 10);
    if (!Number.isFinite(count)) return null;
    let result = '';
    for (let i = 0; i < count; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
      if (chunk === null) return null;
      result += chunk;
    }
    return result;
  },
  async setItem(key: string, value: string): Promise<void> {
    await deleteChunked(key);
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(`${key}_${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${key}${META_SUFFIX}`, String(count));
  },
  async removeItem(key: string): Promise<void> {
    await deleteChunked(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: chunkedStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
