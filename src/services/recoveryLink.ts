import AsyncStorage from '@react-native-async-storage/async-storage';

// ---- Password-recovery gate ----
// The reset-password screen must only show while a recovery link has really
// been redeemed and the new password not yet set. expo-router can open
// /auth/reset-password straight from the link (Android re-delivers it on a
// restart), so the screen checks this flag and goes home when it isn't set.
// Kept in memory and on disk, so a restart mid-reset still shows the form.
// Written by the link handler in app/_layout.tsx.
const RECOVERY_PENDING_KEY = 'vinster_recovery_pending';
export type RecoveryState = 'idle' | 'redeeming' | 'pending' | 'failed';
let recoveryState: RecoveryState = 'idle';

export function setRecoveryState(s: RecoveryState) {
  recoveryState = s;
}

export async function markRecoveryPending() {
  recoveryState = 'pending';
  try { await AsyncStorage.setItem(RECOVERY_PENDING_KEY, '1'); } catch { /* memory flag still set */ }
}

// Where this session's recovery link stands ('idle' when none has arrived).
export function recoveryLinkState(): RecoveryState {
  return recoveryState;
}

// True when a redeemed recovery link is still waiting for a new password.
export async function isRecoveryPending(): Promise<boolean> {
  if (recoveryState === 'pending') return true;
  try { return (await AsyncStorage.getItem(RECOVERY_PENDING_KEY)) === '1'; } catch { return false; }
}

// Called once the new password is saved.
export async function clearRecoveryPending() {
  recoveryState = 'idle';
  try { await AsyncStorage.removeItem(RECOVERY_PENDING_KEY); } catch { /* ignore */ }
}
