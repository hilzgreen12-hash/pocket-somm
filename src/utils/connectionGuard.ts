import { getConnectionQuality } from '../hooks/useNetworkStatus';
import { showAlert } from '../components/AppAlert';

// Shared offline wording — matches the tone used on the scan screens and in
// invokeResilient's NetworkError message, so a pre-flight block reads the same
// as a mid-scan drop.
const OFFLINE_BODY =
  "Vinster couldn't reach the internet — you may be offline or on a weak signal. Find better reception and try again.";

// Pre-flight connectivity gate for the heavy image-upload actions (wine-label
// scan, wine-list scan, lineup detect, cellar import). Call it right before the
// upload; the boolean it resolves to says whether to proceed:
//   - offline → blocking alert, resolves false (never start the upload)
//   - weak    → confirm alert; resolves true only if the user taps "Try Anyway"
//   - ok      → resolves true immediately, no UI (today's behaviour)
// Factored here so each call site stays a one-line guard rather than repeating
// the NetInfo check + alert wiring.
export async function ensureConnectionForUpload(_opts: { heavy?: boolean } = {}): Promise<boolean> {
  const quality = await getConnectionQuality();
  if (quality === 'ok') return true;

  if (quality === 'offline') {
    showAlert({ title: 'No Connection', body: OFFLINE_BODY });
    return false;
  }

  // weak — let the user decide; large uploads can still squeak through on a bad
  // signal, so we warn rather than block.
  return new Promise<boolean>((resolve) => {
    showAlert({
      title: 'Weak Connection',
      body: "You're on a weak connection — scanning may be slow or fail.",
      dismissable: false,
      buttons: [
        { text: 'Try Anyway', style: 'default', onPress: () => resolve(true) },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      ],
    });
  });
}
