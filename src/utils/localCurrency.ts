import * as Location from 'expo-location';
import { showAlert } from '../components/AppAlert';
import { COUNTRY_TO_CURRENCY } from '../constants/currency';

// GPS → local currency. Returns null when permission is denied, location is
// unavailable, or the country has no mapped currency — the caller then keeps
// the home currency. Shared by the wine-list scanner and the single-wine intel
// flow so both detect "you're abroad" the same way.
export async function detectLocalCurrency(): Promise<{ currency: string; country: string | null } | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
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
export function askUseLocalCurrency(local: string, profile: string, country: string | null): Promise<string> {
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
export async function resolveIntelCurrency(homeCurrency: string | null | undefined): Promise<string> {
  const home = (homeCurrency ?? 'GBP').toUpperCase();
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
export function peekIntelCurrency(homeCurrency: string | null | undefined): string | null {
  const home = (homeCurrency ?? 'GBP').toUpperCase();
  return sessionChoice && sessionChoice.home === home ? sessionChoice.resolved : null;
}

// Forget the remembered choice — e.g. after a manual currency change in
// settings, so the next lookup re-detects.
export function resetIntelCurrencyChoice(): void {
  sessionChoice = null;
}
