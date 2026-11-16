import { router } from 'expo-router';
import { showAlert } from '../components/AppAlert';
import { isGuestPairLimit, isGuestScanLimit } from '../api/invokeResilient';

// A guest has used today's allowance — two scans, or one pairing. Shows the
// server's message (the wording lives in one place: _shared/guest.ts) with a
// way to sign in or create a free account. Returns false for any other error.
export function handleGuestLimit(err: unknown, onClose?: () => void): boolean {
  if (!isGuestScanLimit(err) && !isGuestPairLimit(err)) return false;
  showAlert({
    title: 'Create an account to continue',
    body: (err as Error).message,
    buttons: [
      { text: 'Sign In', onPress: () => { onClose?.(); router.push('/(auth)/sign-in'); } },
      { text: 'Create Account', onPress: () => { onClose?.(); router.push('/(auth)/sign-up'); } },
      { text: 'Close', style: 'cancel', onPress: onClose },
    ],
  });
  return true;
}
