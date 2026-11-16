import * as Location from 'expo-location';
import { showAlert } from '../components/AppAlert';
import { COUNTRY_TO_CURRENCY } from '../constants/currency';
import { supabase } from '../api/supabase';

// The user's home currency. Screens pass the one from their loaded preferences;
// when preferences haven't loaded yet (a scan started straight after opening
// the app), it's read from the profile instead of quietly assuming GBP, which
// used to price a USD or EUR user's card in pounds.
export async function homeCurrency(fromPreferences: string | null | undefined): Promise<string> {
  if (fromPreferences) return fromPreferences.toUpperCase();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id;
    if (userId) {
      const { data } = await supabase.from('profiles').select('default_currency').eq('user_id', userId).maybeSingle();
      const c = (data as { default_currency?: string | null } | null)?.default_currency;
      if (c) return c.toUpperCase();
    }
  } catch { /* fall back below */ }
  return 'GBP';
}

// GPS → local currency. Returns null when permission is denied, location is
// unavailable, or the country has no mapped currency — the caller then keeps
// the home currency. Shared by the wine-list scanner and the single-wine intel
// flow so both detect "you're abroad" the same way.
async function detectLocalCurrency(): Promise<{ currency: string; country: string | null } | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    // Never hold up a scan for GPS (indoors it can take a long time): give up
    // after 4s and keep the home currency.
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('location timeout')), 4000)),
    ]);
    const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    const iso = geo?.isoCountryCode?.toUpperCase();
    if (!iso) return null;
    const currency = COUNTRY_TO_CURRENCY[iso];
    if (!currency) return null;
    return { currency, country: geo?.country ?? null };
  } catch {
    return null;
  }
}

// The "use local currency?" confirm. Resolves to whichever currency the user
// picks (local or their profile default).
function askUseLocalCurrency(local: string, profile: string, country: string | null): Promise<string> {
  const where = country ? `in ${country}` : `somewhere using ${local}`;
  return new Promise((resolve) => {
    showAlert({
      title: 'Local currency detected',
      body: `You appear to be ${where}. Show values in local currency (${local}) instead of your usual ${profile}?`,
      dismissable: false,
      buttons: [
        { text: `Use ${local}`, onPress: () => resolve(local) },
        { text: `Keep ${profile}`, style: 'cancel', onPress: () => resolve(profile) },
      ],
    });
  });
}

// Session-remembered choice for the single-wine intel/search flow: the first
// abroad lookup prompts, then the answer is reused for the rest of the app
// session so repeat searches don't nag. Keyed on the home currency so changing
// the profile default re-asks. Cleared on app restart (module-level state).
let sessionChoice: { home: string; resolved: string } | null = null;

// Resolve the currency to use for a single-wine intel/search lookup. Trusts the
// saved home currency as the safeguard; when GPS shows a different local
// currency, asks once per session and remembers the answer.
export async function resolveIntelCurrency(fromPreferences: string | null | undefined): Promise<string> {
  const home = await homeCurrency(fromPreferences);
  if (sessionChoice && sessionChoice.home === home) return sessionChoice.resolved;
  let resolved = home;
  try {
    const detected = await detectLocalCurrency();
    if (detected && detected.currency !== home) {
      resolved = await askUseLocalCurrency(detected.currency, home, detected.country);
    }
  } catch {
    resolved = home;
  }
  sessionChoice = { home, resolved };
  return resolved;
}

// Synchronous read of the session-remembered choice (no prompt, no GPS) so a
// downstream screen can DISPLAY values in the same currency the intel was
// generated with. Returns null when nothing's been resolved this session for
// this home currency — the caller then falls back to the home default.
export function peekIntelCurrency(fromPreferences: string | null | undefined): string | null {
  // Preferences not loaded yet: the choice made this session is the best answer.
  if (!fromPreferences) return sessionChoice?.resolved ?? null;
  const home = fromPreferences.toUpperCase();
  return sessionChoice && sessionChoice.home === home ? sessionChoice.resolved : null;
}

