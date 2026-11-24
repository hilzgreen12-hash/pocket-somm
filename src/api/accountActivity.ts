import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { supabase } from './supabase';

// At most one write per user every few hours — enough for "last active" and
// to catch app updates without a profile write on every foreground.
const MIN_GAP_MS = 6 * 60 * 60_000;
const lastRecorded = new Map<string, number>();

// The phone's region ('GB') and time zone ('Europe/London'), from its settings.
export function phoneRegion(): { country_code: string | null; time_zone: string | null } {
  try {
    const { locale, timeZone } = Intl.DateTimeFormat().resolvedOptions();
    const region = locale?.split('-').find((part, i) => i > 0 && /^[A-Z]{2}$/.test(part)) ?? null;
    return { country_code: region, time_zone: timeZone ?? null };
  } catch {
    return { country_code: null, time_zone: null };
  }
}

// Saves country, time zone, app version, platform and last-active time on the
// user's profile (migration 141). Best effort: a failure never affects the app.
export async function recordAccountActivity(userId: string): Promise<void> {
  const now = Date.now();
  if (now - (lastRecorded.get(userId) ?? 0) < MIN_GAP_MS) return;
  lastRecorded.set(userId, now);
  const { error } = await supabase.from('profiles').upsert({
    user_id: userId,
    ...phoneRegion(),
    app_version: Application.nativeApplicationVersion ?? null,
    platform: Platform.OS,
    last_active_at: new Date(now).toISOString(),
  });
  if (error) {
    lastRecorded.delete(userId);
    console.warn('[activity] could not save:', error.message);
  }
}
