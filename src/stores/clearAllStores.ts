import { useCellarImportStore } from './cellarImportStore';
import { useFoodPairingStore } from './foodPairingStore';
import { useLabelStore } from './labelStore';
import { useLastIntelStore } from './lastIntelStore';
import { useLineupStore } from './lineupStore';
import { useRackStore } from './rackStore';
import { useScanStore } from './scanStore';

/**
 * Wipes every Zustand store. Call this when the signed-in user CHANGES —
 * not on ordinary navigation.
 *
 * These stores live in module scope, so they survive sign-out: without this,
 * one account's in-memory state bleeds into the next. The visible symptom was
 * signing in as a different user, tapping "View last result" on the Chef tab,
 * and seeing the previous account's wines.
 *
 * Note this is deliberately stronger than calling each store's own
 * reset()/clear(). Those are FLOW resets, scoped to what a given user journey
 * should forget — rackStore.reset() in particular preserves pendingWineId and
 * pendingSlot on purpose, because wiping them mid-flow breaks
 * "Add wine → Create new rack → place on grid". An account switch has the
 * opposite requirement: those cross-flow signals reference the previous
 * account's rows and must not survive. So the pending fields are cleared
 * explicitly here rather than via reset().
 */
export function clearAllStores() {
  useScanStore.getState().reset();
  useLabelStore.getState().reset();
  useFoodPairingStore.getState().reset();
  useCellarImportStore.getState().reset();
  useLineupStore.getState().clear();

  // Persisted to AsyncStorage under a global (non-user-scoped) key, so without
  // this the previous user's wine intel survives both the account switch and
  // an app restart.
  useLastIntelStore.getState().clear();

  // Full wipe, including the cross-flow pending signals reset() intentionally
  // leaves alone — see the note above.
  useRackStore.setState({
    imageUri: null,
    pendingSlot: null,
    pendingSlots: null,
    pendingWineId: null,
    pendingStorageType: 'rack',
    pendingAddMode: false,
    pendingMove: null,
    pendingStorageLocationId: null,
    pendingCaseId: null,
  });
}
