# Code Review — 2026-07-18

Reviewed: Pocket Somm (Expo SDK 54, expo-router, Supabase, Claude API)

---

## Status of Prior Unresolved Findings

The following **High** findings from previous reports are **still unresolved**:

- `app/scan/results.tsx:19` — `router.replace` called during render body (crash risk on Android / React Strict Mode)
- `app/_layout.tsx` — No error boundary anywhere in the app
- `app/index.tsx:21` — New signed-in users can bypass onboarding due to `preferences === null` vs `undefined` mismatch
- `app/(tabs)/history.tsx:35` — `recommendation.topPick` field does not exist; wine names never appear on history cards
- `app/_layout.tsx:15` — Font load error is silently ignored; app can hang on splash indefinitely

The following **Medium** findings from previous reports are **still unresolved**:

- `src/hooks/usePreferences.ts:38` — Upsert mutation errors are silently discarded
- `src/api/claude.ts:17` — `JSON.parse` may throw `SyntaxError` on non-JSON gateway error responses
- `supabase/functions/ocr/index.ts:2` / `supabase/functions/recommend/index.ts:2` — Model ID `claude-opus-4-6` is one major version behind current `claude-opus-4-8`
- `app/(auth)/sign-in.tsx:48` — "Continue without account" does not persist `hasLaunched` to AsyncStorage
- `src/api/claude.ts:6–14` — OCR and Recommend edge functions called without user auth token
- `supabase/functions/wine-searcher-proxy/index.ts:48` — Wine-Searcher API key embedded in URL query string
- `app/(tabs)/scan.tsx:94–99` — Multi-image selection bypasses the confirmation preview
- `app/onboarding.tsx:37–44` — Navigation fires before preferences upsert completes
- `supabase/functions/ocr/index.ts` / `supabase/functions/recommend/index.ts` — No CORS headers for preflight; web builds will fail
- `src/hooks/usePreferences.ts:10` — `isLoading` / `isError` not exposed to callers
- `app/(tabs)/scan.tsx:24` — Local preference state initialised before React Query resolves; fast taps miss saved prefs
- `app/scan/camera.tsx` — No "Go Back" button on the `PermissionScreen` component; user stranded if permission denied

---

## New Findings

---

## Bugs and Crashes

### High

**1. `supabase/migrations/001_initial_schema.sql:28–33` — `pricing_cache` table has no RLS; anyone with the anon key can read, insert, and overwrite cached data**

```sql
create table pricing_cache (
  wine_key text primary key,
  market_price_avg numeric,
  ...
);
-- No: alter table pricing_cache enable row level security;
-- No policy defined
```

`profiles` and `scan_sessions` have RLS enabled with user-scoped policies. `pricing_cache` was created without `enable row level security`, which means all rows are publicly accessible and writable to any client that holds the published anon key. An attacker can:

- Read all cached market prices for every wine ever looked up (information disclosure)
- Insert or overwrite entries with false prices (e.g. set `market_price_avg` to £5 for a £500 wine, causing the value-score calculation to show it as extremely poor value)
- Delete entries en masse, causing the proxy to make real Wine-Searcher API calls on every request until the rate limit or API quota is hit

Fix: add `alter table pricing_cache enable row level security;` and a policy that restricts writes to service-role only (the Edge Function) while restricting reads appropriately. Because the edge function uses the service role key, it bypasses RLS and will continue to work after the policy is added.

Severity: **High**

---

**2. Entire codebase — `scan_sessions` are never written to; the History tab is permanently broken for all users**

The `history.tsx` screen queries `scan_sessions` on line 16:

```ts
// app/(tabs)/history.tsx:16–24
const { data: sessions } = useQuery({
  queryFn: async () => {
    const { data, error } = await supabase
      .from('scan_sessions')
      .select('*')
      .order('captured_at', { ascending: false })
      .limit(50);
    ...
  },
});
```

There is no call to `supabase.from('scan_sessions').insert(...)` or `.upsert(...)` anywhere in the codebase. After a successful recommendation the scan store (`src/stores/scanStore.ts`) holds the result in memory only. When the user navigates away or the app is backgrounded, the result is lost. `scan_sessions` will always be empty for every user. The History tab shows the "No scans yet" empty state regardless of how many scans have been performed. The `restaurant_name` and `image_path` columns also have no capture UI.

Fix: after `setRecommendation(recommendation)` is called in `app/scan/extracting.tsx` (around line 87), insert a row into `scan_sessions` with the `user_id` (if signed in), `recommendation`, `extracted_wines`, and `preferences_snapshot`. Only insert if a session exists; guest scans need not be persisted.

Severity: **High**

---

### Medium

**3. `app/scan/extracting.tsx:35–37` — Pre-filter budget uses the user's profile default, not the scan-session override**

```ts
// app/scan/extracting.tsx — inside preFilterWines
if (prefs.defaultBudget) {
  filtered = filtered.filter(
    (w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget
  );
}
```

`preFilterWines` is called with `userProfile` (the Supabase `profiles` row, from `usePreferences`):

```ts
// app/scan/extracting.tsx:88
const winesForRecommend = preFilterWines(wines, userProfile);
```

The Scan tab allows the user to set a one-off budget override (stored in `useScanStore().preferences.budget`). That value is correctly forwarded to the LLM in the recommend payload but is completely ignored at the pre-filter stage. A user who normally budgets £150 but sets a £40 one-off budget will still have wines up to £150 included in the list sent to Claude. Claude's own budget hard rule then filters them — but at the cost of consuming tokens on wines that should have been excluded before the API call, and with the risk that if Claude's filter slips the user sees over-budget recommendations.

Fix: pass the scan-session budget alongside (or instead of) `userProfile.defaultBudget` in `preFilterWines`, using `scanPrefs.budget ?? userProfile?.defaultBudget` as the budget threshold.

Severity: **Medium**

---

**4. `app/(tabs)/history.tsx:64` — History cards are `TouchableOpacity` with no `onPress`; every tap is silently ignored**

```tsx
// app/(tabs)/history.tsx:64
<TouchableOpacity style={styles.card}>
  <Text style={styles.cardDate}>...</Text>
  ...
</TouchableOpacity>
```

There is no `onPress` prop on the `TouchableOpacity`. The card visually responds to touch (opacity feedback) but nothing happens. Users will try to tap into a past scan and get no response, making the app feel broken. This is a separate issue from the `topPick` field bug (Finding #1 in the 2026-07-17 report) — even if the card displayed correctly, tapping it still does nothing.

Fix: add an `onPress` handler that navigates to a detail view, or replace `TouchableOpacity` with a plain `View` until drill-down navigation is implemented so there is no misleading interactivity.

Severity: **Medium**

---

**5. `eas.json` — Supabase anon key committed in plaintext**

```json
"env": {
  "EXPO_PUBLIC_SUPABASE_URL": "https://...",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY": "sb_publishable_wsa6cGlrAaULP_YA1JwDlQ_h-qaHTke"
}
```

The anon key is committed directly in `eas.json`. Even though this key is labeled `sb_publishable_` and is intentionally client-facing (it is embedded in the compiled app binary and visible to anyone who downloads the app), committing it to the repository means it appears in git history, CI logs, and any repository forks. It should be managed as an EAS secret (`eas secret:create`) and referenced as `$EXPO_PUBLIC_SUPABASE_ANON_KEY` in `eas.json` instead. Rotate the key before making the repository public.

Severity: **Medium**

---

### Low

**6. `supabase/functions/recommend/index.ts:68` — Budget constraint message hardcodes `£` regardless of currency**

```ts
const budgetLine = budget
  ? `HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle. ...`
  : '';
```

The system prompt always embeds the `£` symbol even if the user's `defaultCurrency` is EUR, USD, or any other currency. The `defaultCurrency` field exists on `UserPreferences` (`src/types/preferences.ts:7`) but is never read from the database or passed to the edge function. For non-GBP menus Claude will apply a sterling budget against prices denominated in a different currency, producing incorrect filtering. Fix: pass the user's currency to the edge function and substitute it in the budget line.

Severity: **Low**

---

**7. `src/types/preferences.ts:7` and `src/components/preferences/WineTypePicker.tsx:1` — `WineType` defined in two places; risk of silent drift**

`UserPreferences` in `src/types/preferences.ts` imports from (or re-declares) `WineType`, and `WineTypePicker.tsx` also defines and exports `WineType` independently:

```ts
// src/components/preferences/WineTypePicker.tsx
export type WineType = 'red' | 'white' | 'rose' | 'sparkling';
```

Any future change to the valid wine type values (e.g., adding `'orange'`) must be made in both files. If one is updated and the other is not, TypeScript will not catch mismatches at call sites that mix the two definitions. Consolidate to a single canonical definition in `src/types/preferences.ts` and import it into `WineTypePicker.tsx`.

Severity: **Low**

---

## Supabase and Edge Function Issues

**8. `supabase/functions/ocr/index.ts:52` — Fetching arbitrary user-supplied URLs without SSRF protection**

```ts
// supabase/functions/ocr/index.ts:52–54
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

The `url` value comes directly from the client request body with no validation. The edge function will fetch any URL the caller supplies, including:

- Internal Supabase metadata endpoints (`http://metadata.internal/...`)
- Other Supabase project URLs (cross-project data exfiltration)
- Private network addresses (`http://192.168.x.x`, `http://localhost`)

The URL input is currently not surfaced in the mobile app (the `/scan/url` route is a stub redirect), but the edge function is callable directly by anyone with the anon key. Add a URL allowlist or at minimum a scheme + hostname validation that rejects non-HTTPS URLs and known internal address ranges before issuing the fetch.

Severity: **Medium**

---

## UX and Performance Issues

**9. `app/scan/extracting.tsx:100–120` — The loading screen has redundant text blocks and contradictory timing hints**

During the `recommending` stage, the screen renders two separate `<Text>` elements with body copy back-to-back:

```tsx
<Text style={styles.body}>
  Scoring by critic rating, vintage quality and value
</Text>
{stage === 'recommending' && (
  <Text style={styles.body}>This may take a minute or two</Text>
)}
<Text style={styles.stayNote}>Please don't leave this page while we're searching</Text>

{stage === 'reading' && (
  <Text style={styles.profileNote}>
    We're making a recommendation based on your profile preferences. ...
  </Text>
)}
```

The `profileNote` block (visible during `reading`) tells the user that recommendations are based on profile preferences and to use filters to change them — but there are no filters on the extracting screen and the filter stage has already passed. This text misleads the user into thinking they can still change preferences mid-scan. Remove the `profileNote` block or replace it with an estimated time remaining.

This issue was flagged in the 2026-07-16 report (duplicate body text) and remains partially unresolved.

Severity: **Low**

---

## Navigation Issues

**10. `app/index.tsx:20–22` — Guest user who navigates to sign-in and signs in successfully lands on scan tab but may have stale preferences**

```ts
// app/(auth)/sign-in.tsx — onSignIn success handler
router.replace('/(tabs)/scan');
```

After successful sign-in, `sign-in.tsx` navigates directly to `/(tabs)/scan` bypassing `app/index.tsx`. The `index.tsx` routing logic that checks `preferences === null` to redirect to onboarding is never re-evaluated. A user creating their first account via sign-up → confirm email → sign-in will skip onboarding and land on the scan tab with empty preferences and no indication that they should configure their profile. The fix is to navigate to `/` (index) after sign-in rather than directly to `/(tabs)/scan`, allowing the routing logic to determine the correct destination.

Severity: **Medium**
