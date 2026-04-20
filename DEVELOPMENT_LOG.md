# Pocket Somm — Development Log

A narrative record of the build: decisions made, problems encountered, and how they were resolved. No code included.

---

## The Concept

Pocket Somm is a personal sommelier app for iOS and Android. The core experience: a user photographs a restaurant wine list, the app reads it using OCR, and returns a ranked recommendation of the best wines on the list tailored to their personal preferences. The recommendation accounts for vintage quality, drinking window, rarity, value for money, and the user's stated preferences (wine type, style, budget, favourite regions and grapes, food pairing).

---

## Technology Choices

- **React Native + Expo** — cross-platform mobile development (iOS and Android from one codebase)
- **Expo Router** — file-based navigation, similar to Next.js
- **Supabase** — backend: authentication, database, and Edge Functions (serverless API)
- **Claude Opus 4.6** — powers both the OCR (reading the wine list from a photo) and the recommendation engine
- **Zustand** — lightweight state management across screens
- **Zod** — schema validation to ensure Claude's responses are structured correctly

---

## Phase 1 — Core Pipeline

The first working version established the fundamental flow:

1. User photographs a wine list
2. Image is sent to a Supabase Edge Function which passes it to Claude for OCR
3. Claude extracts each wine's name, producer, region, grape, vintage, and price into structured JSON
4. A second Edge Function passes the wine list plus user preferences to Claude for ranking
5. Results are returned and displayed

The initial commit had this pipeline functional end-to-end.

---

## Phase 2 — Preferences System

Users set their preferences before scanning. This involved building several input components:

- **Wine type picker** — red, white, sparkling, rosé, orange, or no preference
- **Style picker** — flavour profiles (e.g. full-bodied, mineral, fruit-forward). A maximum of 5 selections was enforced to prevent over-constraining the recommendation
- **Budget slider** — non-linear scale: £10 increments from £20–£150, then £20 increments to £450, then £50 increments to £1,500, then "no limit". A standard slider only supports uniform steps, so this was built using an index-mapped lookup array of 51 discrete values
- **Food pairing** — free text input
- **Region and grape preferences** — both liked and disliked

---

## Phase 3 — Camera and OCR Refinement

**Problem: Camera crop was producing landscape output with black bars**

Android phones store photos in landscape orientation with an EXIF rotation flag. The app was mapping the on-screen crop guide frame directly to the photo coordinates without accounting for this, producing incorrect crops. The fix required normalising the image orientation first (stripping the EXIF rotation), then recalculating the crop based on whether the photo's aspect ratio was taller or wider than the screen.

**Problem: "Could not parse wine list"**

The Zod schema validating Claude's OCR response was too strict — it expected strings for producer and region, but Claude sometimes returns null for these fields. Fixed by making those fields optional with a fallback to an empty string, and adding catch handlers for vintage and price fields.

---

## Phase 4 — Recommendation Quality

**Hard budget rule**

Early testing revealed that Claude was occasionally recommending wines above the stated budget — treating it as a soft guideline rather than a firm limit. The recommendation prompt was updated to make budget an absolute hard exclusion, not a preference.

**Hard colour rule**

Similarly, white wine requests were occasionally returning Champagne (sparkling). The prompt was clarified to explicitly distinguish white wine from sparkling, with Champagne explicitly categorised as sparkling.

**Outside preferences notice**

When Pocket Somm identifies a wine that falls outside one of the user's stated preferences but judges it genuinely worth considering (e.g. an exceptional bottle at slightly above budget), it now flags this clearly in the results with a contextual note explaining why it merits attention.

---

## Phase 5 — Authentication Problem

**Problem: "Network request failed" on recommendation calls**

OCR was working but the recommendation call was consistently failing. Investigation revealed the root cause was that the Supabase project uses ES256 JWT signing, but the Edge Function runtime only accepts HS256 tokens. The JWT was being rejected silently.

**Fix:** Both Edge Functions were redeployed with the `--no-verify-jwt` flag, and the API client was updated to send only the anonymous API key header rather than a full JWT. This resolved the issue completely.

---

## Phase 6 — Results Screen Redesign

The results screen was redesigned from a card-based layout to an accordion style more consistent with the rest of the app:

- "Pocket Somm Recommends" heading, large and centered
- When no vintages are present on the wine list, a note is shown and all vintage-related information is removed from the results
- Each wine is a collapsible row — rank, name, producer, region, and price always visible; rationale, vintage assessment, drinking window, and rarity revealed on tap
- Top Pick has a gold border; all other text is white throughout
- The top result is open by default
- Vintage, drinking window, and rarity badges were redesigned to match a consistent format: a coloured star indicator, a coloured label, and italic muted notes beneath — no boxes or borders
- A note at the bottom clarifies that critic scores are Pocket Somm's own estimates based on critical consensus in its training data, not live data from subscription services

---

## Phase 7 — Welcome & Sign-Up Screens

The welcome screen was updated with revised copy:

- Tagline: "Your personal sommelier / Master any wine list, anywhere"
- The Create Account button was made more prominent, with the account value proposition embedded inside it rather than sitting separately below Sign In
- Button order changed: Create Account first, Start Scanning second

The sign-up screen was restyled so all text — headings, labels, input fields, placeholder text, and the sign-in link — is consistent white, matching the app's overall dark aesthetic.

---

## Phase 8 — Standalone Build (EAS)

Setting up a standalone Android APK for real-world testing proved more involved than expected. A sequence of issues arose:

**Issue 1: npm install dependencies failure**

EAS builds from git, so uncommitted changes to package.json and package-lock.json were not included. The build was running against the old committed state. Fixed by committing all package changes before building.

**Issue 2: Peer dependency conflict**

`expo-router` required a newer version of `expo-constants` than `expo-linking` was providing. The conflict caused `npm ci` to fail on the build server. Fixed by adding an `.npmrc` file instructing npm to use legacy peer dependency resolution, which matches how the packages resolve locally.

**Issue 3: Missing worklets plugin**

`react-native-reanimated` (the animation library) requires a companion package called `react-native-worklets` for its Babel build plugin. This had been removed from the dependencies during earlier troubleshooting. Once restored and committed, the build proceeded past the JavaScript bundling stage.

The build is currently queued on EAS free tier.

---

## Feature Noted for Future Development

**Order history and preference learning**

Account holders will be able to mark which recommended wine they actually ordered. Pocket Somm will store these selections and use them as context in future recommendations — inferring patterns (preferred regions, grapes, styles) from real ordering behaviour. This is not traditional machine learning but achieves a similar result by passing the order history as context to Claude at recommendation time. The more orders recorded, the more personalised the recommendations become.

---

*Log current as of 16 April 2026.*
