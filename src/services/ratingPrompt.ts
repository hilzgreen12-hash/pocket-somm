import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

// In-app store rating prompt. Shows the native OS dialog (Google Play In-App
// Review / Apple SKStoreReviewController) only after happy moments, rarely:
//   - at least MIN_HAPPY_MOMENTS successes in total before the first ask
//   - at most once every MIN_DAYS_BETWEEN_ASKS days, MAX_ASKS times ever
//   - never within MIN_SESSION_AGE_MS of app launch
// The OS applies its own quotas on top, so a request may show nothing.

const STORAGE_KEY = 'vinster.ratingPrompt.v1';
const MIN_HAPPY_MOMENTS = 3;
const MIN_DAYS_BETWEEN_ASKS = 120;
const MAX_ASKS = 3;
const MIN_SESSION_AGE_MS = 2 * 60 * 1000;
const ASK_DELAY_MS = 1500;
// Bulk actions (e.g. a cellar import adding many wines) count once per kind.
const SAME_KIND_DEDUPE_MS = 60 * 1000;

// Module load ≈ app launch (this module is imported by hooks used at startup).
const sessionStart = Date.now();

interface RatingState {
  happyMoments: number;
  askCount: number;
  lastAskAt: number | null;
}

const lastKindAt: Record<string, number> = {};
let busy = false;

async function readState(): Promise<RatingState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<RatingState>;
      return {
        happyMoments: Number(s.happyMoments) || 0,
        askCount: Number(s.askCount) || 0,
        lastAskAt: typeof s.lastAskAt === 'number' ? s.lastAskAt : null,
      };
    }
  } catch { /* fall through to defaults */ }
  return { happyMoments: 0, askCount: 0, lastAskAt: null };
}

async function writeState(s: RatingState): Promise<void> {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* best-effort */ }
}

async function run(kind: string): Promise<void> {
  const now = Date.now();
  const prev = lastKindAt[kind];
  if (prev != null && now - prev < SAME_KIND_DEDUPE_MS) return;
  lastKindAt[kind] = now;

  if (busy) return;
  busy = true;
  try {
    const state = await readState();
    state.happyMoments += 1;
    await writeState(state);

    if (state.happyMoments < MIN_HAPPY_MOMENTS) return;
    if (state.askCount >= MAX_ASKS) return;
    if (state.lastAskAt != null && now - state.lastAskAt < MIN_DAYS_BETWEEN_ASKS * 86_400_000) return;
    if (now - sessionStart < MIN_SESSION_AGE_MS) return;

    if (!(await StoreReview.isAvailableAsync())) return;
    if (!(await StoreReview.hasAction())) return;

    // Let the success UI settle before the OS sheet appears.
    await new Promise((r) => setTimeout(r, ASK_DELAY_MS));

    // Record the ask before requesting so a failure can't cause repeat asks.
    await writeState({ ...state, askCount: state.askCount + 1, lastAskAt: Date.now() });
    await StoreReview.requestReview();
  } finally {
    busy = false;
  }
}

/** Record a happy moment and, if eligible, show the native rating dialog.
 *  Fire-and-forget: never throws, never needs awaiting. */
export function noteHappyMoment(kind: string): void {
  try {
    void run(kind).catch(() => { /* never surface */ });
  } catch { /* never surface */ }
}
