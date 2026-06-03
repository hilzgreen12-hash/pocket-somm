# Vinster — Data & Privacy Audit (pre-launch)

_Generated 2026-06-03 from the live schema (`supabase/migrations`) + app code. Use this to (a) finalise the privacy policy and (b) fill the App Store "App Privacy" and Google Play "Data safety" forms accurately._

---

## 1. Full data inventory — what Vinster collects & stores

### Account / identity (Supabase Auth + `profiles`)
- **Email address** (auth) — sign-in, account.
- **Password** — hashed by Supabase Auth; never seen in plaintext.
- **Display name** (auth metadata / `profiles.display_name`).
- **Date of birth** — used at the age gate. ⚠️ *Verify storage:* it's collected on first launch; confirm whether the DOB is stored or only a boolean "verified" flag is kept locally (`vinster_age_verified_at` in AsyncStorage). Declare accordingly.
- **Email notification prefs** (auth metadata): `notify_drinking_window`, `notify_decline`.
- **Onboarding flag**, **default currency**.

### Taste profile (`profiles`)
- Wine prefs: default wine type(s), favourite/disliked regions, favourite/disliked grapes.
- Recipe prefs: dietary preference, allergens, custom allergen, specific concerns, regional & nutritional preferences.

### User-generated content
- **Cellar** (`cellar_wines`, `cellar_wine_removals`): wines, vintages, regions, grape, bottle size, **purchase price**, estimated value, your review score/notes, favourites, archive entries.
- **Wine reviews** (`chosen_wines`): tasting notes, scores, list price, observations, wishlist flag, source.
- **Restaurant reviews** (`scan_sessions`): restaurant name, **restaurant ratings** (food/service/wine-list/overall), restaurant note.
- **Scans**: extracted wine-list data + the generated recommendation per session.
- **Recipes / cookbook** (`chosen_recipes`, `chef_label_sessions`, `chef_pairing_sessions`, collections): saved recipes, your recipe notes.
- **Racks/fridges** (`wine_racks`, `rack_slots`): your virtual storage layout.

### AI-generated content (stored on your account)
- Wine recommendations, recipes, drinking-window assessments, wine notes, **personality sketches** (`personality_sketches`, `profiles.last_*_personality`).

### Location ⚠️
- **`scan_sessions.city`** — derived city label.
- **`scan_sessions.latitude` + `longitude`** — **precise GPS coordinates are persisted** (see `useScanHistory.ts` lines 121–161). *(This is the main gap — see §3.)*

### Photos
- Wine-list and wine-label **photos** are captured and sent to the edge functions → **Anthropic Claude** for OCR/analysis, then **discarded** (not retained in the DB; `cellar_wines.label_image_path` is left null). Transmitted off-device and to a third party, but not stored.

### Community (tables exist; feature "Coming Soon", not yet live)
- `community_posts`, `community_likes`, `community_comments`, `community_reviews`, `community_profiles` — when enabled, these make selected content **publicly visible**. Policy must cover this before Community ships.

### Diagnostics / operational
- `function_call_log` — logs function calls (user id + timestamps) for rate-limiting = app-activity/diagnostic data.
- Expo/React Native — anonymous app/OS version + crash diagnostics.
- `pricing_cache` — not user-specific.

---

## 2. Third parties (sub-processors)
| Provider | Purpose | Data it sees |
|---|---|---|
| **Supabase** | DB, auth, storage, edge compute | All account + content data (EU regions where available). |
| **Anthropic (Claude API)** | OCR + recommendations/recipes/personality | Wine-list & label **photos**, wine names, profile/activity summaries. Not retained for training under API terms. |
| **Expo** | Build/update infra | Anonymous crash + performance data. |

No data is sold. No advertising SDKs. No payment processor (subscription is currently free / "on us").

---

## 3. Gap analysis — fix before launch

1. **🔴 Precise location is stored, but the policy says it isn't.** The policy states location is only "briefly used to suggest a nearby city" and "we do not track or log your location otherwise" — but `latitude`/`longitude` are saved on every located scan. **Two options:**
   - **(Recommended) Data-minimise:** stop persisting `latitude`/`longitude` — keep only the derived `city`. Small code change in `useScanHistory.ts` (drop the two fields from the insert). Then the policy is accurate and you can declare **approximate location only** (or none). Cleanest for GDPR + store forms.
   - **(Alternative) Disclose:** update the policy to say precise coordinates are stored with each review, and declare **precise location** on both store forms.
2. **🔴 Legal name placeholder.** The policy still reads "operated by **[Your Full Legal Name]**, a sole trader" — fill this in.
3. **🟠 Policy must be hosted at a public URL** (e.g. `https://vinsterapp.com/privacy`) for both stores; keep it in sync with the in-app `legal/privacy.tsx`.
4. **🟠 Date of birth handling** — confirm DOB isn't persisted server-side (or disclose it if it is). Currently looks like only a local "verified" flag.
5. **🟡 Community** — before the community feature goes live, add a "Community & public content" section (what becomes public, how to delete it). Fine to ship now since it's disabled, but note it.
6. **🟡 Policy date** says "Last updated May 2026" — bump on any change above.
7. **🟢 Otherwise the policy is strong** — covers UK GDPR rights, retention (30/90 days), third parties, AI, age restriction, security, deletion via the app.

---

## 4. Store form mapping (use after fixing §3)

### Google Play — Data safety
- **Personal info → Email address**: collected, linked to user, App functionality/Account mgmt. **Name** (display name): collected, optional.
- **Location → Approximate location** (city): collected, linked. *(Only declare **Precise location** if you keep lat/long per option 3-alt.)*
- **Photos** (wine list/label): collected, **shared** with Anthropic; mark **"processed ephemerally"** (not stored).
- **App activity → User-generated content** (cellar, reviews, recipes): collected, linked.
- **App info & performance → Crash logs / diagnostics**: collected (Expo).
- Data is **encrypted in transit**; users **can request deletion** (in-app + email). No data sold.

### Apple — App Privacy ("Data Used to Track You": **None**)
- **Contact Info**: Email, Name → App Functionality (linked).
- **User Content**: Photos, wine/cellar data, reviews, notes → App Functionality (linked).
- **Location**: Coarse (city) — or Precise if you keep coords → App Functionality.
- **Identifiers**: user account id → App Functionality.
- **Usage Data / Diagnostics**: crash + performance → App Functionality / Analytics.
- Age rating: **17+** (alcohol references).

---

## 5. Action checklist
- [ ] Decide location approach (drop lat/long — recommended — or disclose). _Claude can make the code change in tomorrow's batch._
- [ ] Insert your legal name in `legal/privacy.tsx` (+ hosted copy).
- [ ] Host the policy at a public URL.
- [ ] Confirm DOB storage; adjust policy if needed.
- [ ] Bump policy "last updated" date.
- [ ] (Pre-Community) add a public-content section.
- [ ] Fill App Store App Privacy + Play Data safety per §4.

_Claude can: make the lat/long change, draft any new policy sections, and produce a final policy text for hosting — just ask._
