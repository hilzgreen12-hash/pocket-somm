# Vinster — Technical Handover Report

**Prepared:** 5 May 2026  
**Purpose:** Technical account and infrastructure reference for incoming technical manager

---

## 1. Overview

Vinster is a React Native mobile app (iOS and Android) built with Expo. It is an AI-powered sommelier that scans restaurant wine lists, manages home wine cellars, and generates food and wine pairings. The app is powered by three external platforms: GitHub (source code), Supabase (database and backend), and Anthropic (AI engine). Automated weekly reporting runs through Claude Code on claude.ai.

---

## 2. Accounts Summary

| Platform | Purpose | Where to find credentials |
|---|---|---|
| GitHub | Source code repository | Owner's GitHub account |
| Supabase | Database, authentication, edge functions | Owner's Supabase account |
| Anthropic | Claude API (AI recommendations) | Owner's Anthropic account |
| Expo / EAS | Mobile app builds and distribution | Owner's Expo account |
| claude.ai | Automated agent routines | Owner's Claude account |

---

## 3. GitHub

**Account:** `hilzgreen12-hash`  
**Repository:** `hilzgreen12-hash/pocket-somm` (public)  
**URL:** `https://github.com/hilzgreen12-hash/pocket-somm`  
**Branch:** `main` (default and only branch)

**What it contains:**
- Full React Native / Expo source code
- All Supabase migration SQL files (`supabase/migrations/`)
- All Supabase Edge Function source code (`supabase/functions/`)
- Email templates (`supabase/email-templates/`)
- Agent-generated reports (`reports/` folder — added automatically by scheduled agents)
- Business plan (`Business Plan 1.md`)

**GitHub App installed:** The Claude GitHub App is installed on this repository and grants the automated agent routines (see Section 7) read and write access to push report commits nightly.

**Access:** To transfer control, add the new technical manager as a collaborator at `https://github.com/hilzgreen12-hash/pocket-somm/settings/access`, or transfer the repository to their account.

---

## 4. Supabase

**Account:** Owner's personal Supabase account  
**Project name:** pocket-somm  
**Project reference:** `skwfykendnhnhhbdrfbr`  
**Dashboard:** `https://supabase.com/dashboard/project/skwfykendnhnhhbdrfbr`  
**Region:** (check dashboard — set at project creation)

### 4.1 Database Tables

| Table | Purpose | RLS |
|---|---|---|
| `profiles` | User taste preferences (wine types, regions, grapes, budget, dietary needs) | ✓ Enabled |
| `scan_sessions` | History of restaurant wine list scans and AI recommendations | ✓ Enabled |
| `cellar_wines` | User's home wine cellar (bottles, quantities, storage locations) | ✓ Enabled |
| `cellar_shares` | Sharing a cellar with other users (read-only) | ✓ Enabled |
| `wine_racks` | Virtual wine rack definitions (name, dimensions) | ✓ Enabled |
| `rack_slots` | Individual rack slot assignments (which bottle is where) | ✓ Enabled |
| `community_posts` | Community tab posts (not yet live in UI) | ✓ Enabled |
| `community_likes` | Likes on community posts | ✓ Enabled |
| `community_comments` | Comments on community posts | ✓ Enabled |
| `pricing_cache` | Cached Wine-Searcher pricing data (TTL: 7 days) | ✓ Enabled |

All tables have Row Level Security (RLS) enabled. Users can only read and write their own data. The service role key (held only in Supabase secrets) bypasses RLS for edge function operations.

### 4.2 Authentication

Supabase Auth handles all user sign-up, sign-in, and session management. Email confirmation is required before sign-in. Password reset and email change flows use custom branded templates stored in `supabase/email-templates/`.

**Auth settings to be aware of:**
- Email confirmation: enabled
- Password minimum length: 8 characters
- Guest (unauthenticated) users can scan wine lists without an account; account is required for cellar, history, and chosen wines

### 4.3 Edge Functions

Edge functions run as Deno serverless functions on Supabase's infrastructure. They are the bridge between the mobile app and the Claude API. All Claude API calls go through these functions — the API key is never exposed to the client.

| Function | Model | Purpose |
|---|---|---|
| `ocr` | Claude Haiku | Extracts wine list from a photo or URL into structured JSON |
| `recommend` | Claude Sonnet 4.6 | Recommends 3 wines from extracted list based on user preferences |
| `scan-label` | Claude Haiku | Extracts producer, wine name, region, and vintage from a label photo |
| `wine-intelligence` | Claude Sonnet 4.6 | Returns critic score, drinking window, grape, and tasting notes for a scanned wine |
| `generate-pairings` | Claude Sonnet 4.6 | Generates 3 chef-inspired recipes paired to a scanned wine, with dietary filtering |
| `food-wine-pairing` | Claude Sonnet 4.6 | Recommends wines from a user's cellar (or a style to buy) for a given dish |
| `import-cellar` | Claude Haiku | Parses a spreadsheet or handwritten wine list photo into cellar entries |
| `detect-rack` | Claude Haiku | Detects wine rack dimensions from a photo |
| `wine-searcher-proxy` | — | Proxies Wine-Searcher API calls (API key held server-side) |
| `delete-account` | — | Permanently deletes a user's account and all associated data |

**Deployment command** (run from project root when deploying updated functions):
```
npx supabase functions deploy <function-name> --no-verify-jwt
```

The `--no-verify-jwt` flag allows guest (unauthenticated) users to call the OCR and recommend functions. All functions require an `Authorization` header.

### 4.4 Environment Secrets

The following secrets are stored in Supabase and are NOT in the codebase. They must be set in any new environment.

| Secret name | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Authenticates all Claude API calls from edge functions |
| `WINE_SEARCHER_API_KEY` | Authenticates Wine-Searcher API calls (if active) |

**To view or update secrets:**  
`https://supabase.com/dashboard/project/skwfykendnhnhhbdrfbr/settings/functions`

Or via CLI: `npx supabase secrets set ANTHROPIC_API_KEY=...`

### 4.5 Client-Side Keys (in .env)

The app requires a local `.env` file (not committed to Git) with:

```
EXPO_PUBLIC_SUPABASE_URL=https://skwfykendnhnhhbdrfbr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
```

The anon key is safe to include in the app bundle — it is a public key that only allows operations permitted by RLS policies. Retrieve it from:  
`https://supabase.com/dashboard/project/skwfykendnhnhhbdrfbr/settings/api`

### 4.6 Database Migrations

All schema changes are version-controlled as SQL migration files in `supabase/migrations/`. When setting up a new environment or applying schema changes, run:
```
npx supabase db push
```
This requires the database password, which can be found in:  
`https://supabase.com/dashboard/project/skwfykendnhnhhbdrfbr/settings/database`

**Migration history:**

| File | Description |
|---|---|
| `001_initial_schema.sql` | Core tables: profiles, scan_sessions, pricing_cache |
| `002_extend_profiles.sql` | Adds region/grape preference columns to profiles |
| `003_wine_types_array.sql` | Converts wine type from single value to array |
| `004_dietary_preferences.sql` | Adds dietary and allergen columns to profiles |
| `005_cellar.sql` | Cellar wines and cellar sharing tables |
| `006_community.sql` | Community posts, likes, and comments tables |
| `007_wine_racks.sql` | Wine rack and rack slot tables |
| `008_pricing_cache_rls.sql` | Enables RLS on pricing_cache table |

---

## 5. Anthropic (Claude API)

**Account:** Owner's personal Anthropic account  
**Dashboard:** `https://console.anthropic.com`

The Claude API key is stored as a Supabase secret (`ANTHROPIC_API_KEY`) and is only accessed server-side by edge functions. It is never sent to the mobile client.

**Models in use:**
- `claude-haiku-4-5-20251001` — fast, low-cost model for OCR and label scanning
- `claude-sonnet-4-6` — higher-capability model for recommendations, pairings, and wine intelligence

**To rotate the API key:**
1. Generate a new key at `https://console.anthropic.com/settings/keys`
2. Update the Supabase secret: `npx supabase secrets set ANTHROPIC_API_KEY=<new-key>`

**Cost considerations:** Each wine list scan makes one Haiku call (OCR) and one Sonnet call (recommendations). Label scans make one Haiku call and one Sonnet call. Recipes make one Sonnet call with an 8,192-token output budget (highest cost per call).

---

## 6. Expo / EAS (App Builds)

**Account:** Owner's personal Expo account  
**Dashboard:** `https://expo.dev`

Expo is used to build and distribute the app. EAS (Expo Application Services) handles production and preview builds.

**To build a preview APK (Android, for testing):**
```
npx eas build --profile preview --platform android
```

**To build for App Store / Play Store submission:**
```
npx eas build --profile production --platform ios
npx eas build --profile production --platform android
```

Build configuration is in `eas.json` at the project root. The app is not yet live on the App Store or Play Store.

---

## 7. Automated Agent Routines (claude.ai)

Two scheduled agents run automatically via the Claude Code routines feature. They clone the GitHub repository, perform analysis, write a markdown report, and commit it back to `reports/` in the repo.

**Access:** `https://claude.ai/code/routines`  
**Account:** Owner's personal Claude (claude.ai) account

| Routine | ID | Schedule | Output |
|---|---|---|---|
| Vinster Nightly Code Review | `trig_0112esDrPPaZ5DvGRCbrXR7C` | Every night at 1am BST | `reports/YYYY-MM-DD-code-review.md` |
| Vinster Weekly Market Research | `trig_01M5Hw1pVRhR2pMHXmiKF9st` | Wednesday nights at midnight BST | `reports/YYYY-MM-DD-market-research.md` |

**What the code review agent checks:** unhandled errors, null checks, Supabase RLS issues, edge function prompt quality, UX problems, navigation dead-ends.

**What the market research agent checks:** Vivino, Delectable, CellarTracker, Hello Vino, Wine Ring, Somm, Wine Spectator — App Store ratings, user sentiment, competitive gaps, emerging wine tech trends.

**Reports are viewable at:**  
`https://github.com/hilzgreen12-hash/pocket-somm/tree/master/reports`

**If a routine gets auto-disabled** (e.g. due to a repository access error), re-enable it via the routines dashboard linked above.

---

## 8. Running the App Locally

**Prerequisites:** Node.js, npm, Expo CLI, the `.env` file (see Section 4.5)

```
cd "C:\Claude - Pocket Som"
npm install
npx expo start
```

Scan the QR code with the Expo Go app on a physical device, or press `i` for iOS simulator / `a` for Android emulator.

---

## 9. Key Files Reference

| File / Directory | Purpose |
|---|---|
| `app/` | All screens (expo-router file-based routing) |
| `app/(tabs)/` | Main tab screens (scan, cellar, chef, history, profile, community) |
| `app/(auth)/` | Sign-in, sign-up, forgot password |
| `src/api/` | Supabase client and edge function callers |
| `src/hooks/` | React hooks for auth, preferences, cellar, scan history |
| `src/stores/` | Zustand stores for per-session state |
| `src/types/` | TypeScript type definitions |
| `src/components/` | Reusable UI components |
| `supabase/functions/` | Edge function source code |
| `supabase/migrations/` | Database schema version history |
| `supabase/email-templates/` | Branded email templates for auth flows |
| `.env` | Local environment variables (not in Git — must be created manually) |
| `eas.json` | Expo build profiles |
| `app.json` | Expo app configuration (name, bundle ID, version) |
| `reports/` | Auto-generated agent reports (committed by scheduled agents) |
| `Business Plan 1.md` | Business plan document |

---

## 10. Summary Checklist for Incoming Technical Manager

- [ ] Gain access to GitHub repository (`hilzgreen12-hash/pocket-somm`)
- [ ] Gain access to Supabase project (`skwfykendnhnhhbdrfbr`)
- [ ] Obtain `ANTHROPIC_API_KEY` from Anthropic console
- [ ] Obtain Supabase anon key and create local `.env` file
- [ ] Gain access to Expo / EAS account for app builds
- [ ] Gain access to claude.ai account to manage scheduled agent routines
- [ ] Confirm Claude GitHub App remains installed on the repository (required for automated reports)
- [ ] Run `npm install` and `npx expo start` to verify local setup
