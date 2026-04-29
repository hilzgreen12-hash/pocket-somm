# Galavin — Expanded App Plan

## Overview

Galavin becomes a single app with three core features:

1. **List Scanner** — scan a restaurant wine list, get AI sommelier recommendations (existing)
2. **Label Scanner** — scan a bottle label, identify the wine, get tasting notes, critic score, drinking window, and food pairings (new, from Bottles First)
3. **Cellar Manager** — personal wine collection stored in the cloud; add wines by scanning labels, track quantity, storage location, drinking window, and date received (new)

---

## Navigation Structure

### Tab Bar (4 tabs)

| Tab | Icon | Description |
|-----|------|-------------|
| List | Wine list icon | Scan a restaurant wine list |
| Label | Bottle icon | Scan a wine label |
| Cellar | Cellar/rack icon | Your personal wine collection |
| Profile | Person icon | Preferences and account |

### Full Screen Map

```
app/
├── index.tsx                     (existing — routing logic)
├── welcome.tsx                   (existing)
├── onboarding.tsx                (existing)
├── _layout.tsx                   (existing)
│
├── (auth)/
│   ├── _layout.tsx               (existing)
│   ├── sign-in.tsx               (existing)
│   └── sign-up.tsx               (existing)
│
├── (tabs)/
│   ├── _layout.tsx               (UPDATE — add Label + Cellar tabs)
│   ├── scan.tsx                  (existing — List Scanner entry)
│   ├── label.tsx                 (NEW — Label Scanner entry)
│   ├── cellar.tsx                (NEW — Cellar browser)
│   ├── history.tsx               (existing)
│   └── profile.tsx               (existing)
│
├── scan/                         (existing scan flow — no changes)
│   ├── camera.tsx
│   ├── preview.tsx
│   ├── extracting.tsx
│   ├── preferences.tsx
│   └── results.tsx
│
├── label/                        (NEW — label scan flow)
│   ├── camera.tsx                (reuse scan/camera.tsx pattern)
│   ├── confirm.tsx               (from Bottles First — review/edit extracted details)
│   └── results.tsx               (NEW — wine info card with tasting notes, scores, pairings)
│
└── cellar/                       (NEW — cellar detail screens)
    ├── [wineId].tsx              (wine detail — all info, edit quantity/location)
    └── add.tsx                   (manual add without scanning)
```

---

## Feature Detail

### 1. List Scanner (existing — no changes)
The existing scan flow remains unchanged. User sets preferences, scans or uploads a wine list image, gets 3 AI recommendations with pricing, vintage assessment, and rationale.

---

### 2. Label Scanner (new)

**User flow:**
1. Open Label tab → camera viewfinder
2. Capture bottle label
3. **Confirm screen** — review extracted details (wine name, producer, region, vintage); user can correct any field
4. **Results screen** — displays:
   - Wine name, producer, region, vintage
   - Average critic score (from Claude's knowledge)
   - Drinking window (from/to years + status: Too Young / Approaching / Peak / Declining)
   - Tasting notes
   - 3 food pairings with recipes
   - Button: "Add to Cellar"
5. **Add to Cellar** — user enters quantity and storage location, saves to cloud

**What to reuse from Bottles First:**
- `supabase/functions/scan-label/index.ts` — extracts wine details from label image
- `supabase/functions/generate-pairings/index.ts` — generates food pairings
- `types/wine.ts` — WineDetails, WineDetailsComplete, Pairing, Recipe types
- Confirm screen logic (`app/confirm.tsx`)

**New edge function needed:**
- `supabase/functions/wine-intelligence/index.ts` — given wine name, producer, vintage:
  - Returns: critic score, drinking window, tasting notes, grape variety, style notes
  - Powered by Claude Sonnet 4.6

---

### 3. Cellar Manager (new)

**Cellar tab shows:**
- List of all wines in the user's cellar
- Each row: wine name, vintage, producer, quantity, drinking window status badge
- Sort options: drinking window (default), region, vintage, date received
- Filter: Ready to drink / All

**Tap a wine → Detail screen shows:**
- Label image (if scanned)
- Full wine info (name, producer, region, vintage)
- Critic score
- Drinking window (years + status)
- Tasting notes
- Storage location
- Quantity (editable)
- Date received
- Food pairing suggestions

**Adding to cellar:**
- Via Label Scanner (primary method — scan → results → "Add to Cellar")
- Via manual add (`cellar/add.tsx`) — user types wine details manually

---

## Supabase Schema Changes

### New table: `cellar_wines`

```sql
create table cellar_wines (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  wine_name             text not null,
  producer              text,
  region                text,
  vintage               integer,
  quantity              integer not null default 1,
  storage_location      text,
  date_received         date,
  critic_score          integer,        -- 0–100, from Claude
  drinking_window_from  integer,        -- year
  drinking_window_to    integer,        -- year
  drinking_window_status text,          -- 'too_young' | 'approaching' | 'peak' | 'declining'
  tasting_notes         text,
  grape_variety         text,
  label_image_path      text,           -- Supabase Storage path
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- RLS: users manage own cellar
alter table cellar_wines enable row level security;
create policy "Users manage own cellar" on cellar_wines
  for all using (auth.uid() = user_id);
```

### New Supabase Storage bucket: `label-images`
For storing scanned label photos attached to cellar entries.

### Existing tables — no changes needed
`profiles`, `scan_sessions`, `pricing_cache` remain as-is.

---

## Edge Functions — Full List After Expansion

| Function | Purpose | Model | Status |
|----------|---------|-------|--------|
| `ocr` | Extract wines from wine list image/URL | Claude Haiku | Existing |
| `recommend` | Recommend 3 wines from extracted list | Claude Sonnet 4.6 | Existing |
| `wine-searcher-proxy` | Proxy Wine-Searcher API for pricing | — | Existing |
| `scan-label` | Extract wine details from bottle label image | Claude Sonnet 4.6 | Port from Bottles First |
| `wine-intelligence` | Get critic score, drinking window, tasting notes for a wine | Claude Sonnet 4.6 | New |
| `generate-pairings` | Generate 3 food pairings with recipes for a wine | Claude Sonnet 4.6 | Port from Bottles First |

---

## What to Reuse from Bottles First

| Item | Location in Bottles First | Use in Galavin |
|------|--------------------------|----------------|
| Scan label edge function | `supabase/functions/scan-label/` | Port directly to Galavin's supabase/functions/ |
| Generate pairings edge function | `supabase/functions/generate-pairings/` | Port directly |
| Wine type definitions | `types/wine.ts` | Merge into Galavin's `src/types/wine.ts` |
| Label confirm screen logic | `app/confirm.tsx` | Recreate as `app/label/confirm.tsx` |
| Dietary filter types | `types/wine.ts` (DietaryPreference, AllergenFilter) | Add to Galavin's preferences |

**What NOT to bring over:**
- Firebase (Galavin uses Supabase exclusively — no Firebase)
- Inter font (Galavin uses Cormorant Garamond — keep consistent)
- Context API state (Galavin uses Zustand + React Query — extend these instead)
- Archive folder system (replaced by Cellar with Supabase)

---

## Profile Updates

Add dietary preferences to the user profile (from Bottles First) so pairings are personalised:

```sql
alter table profiles add column dietary_preference text default 'carnivore';
alter table profiles add column allergens text[] default '{}';
```

Profile screen gets a new section: **Dietary & Allergens** (vegetarian / pescatarian / carnivore / vegan + allergen toggles).

---

## Build Order

1. **Port edge functions** — scan-label, generate-pairings → Galavin's Supabase project
2. **Add wine-intelligence edge function** — new, powers cellar enrichment
3. **Database migration** — add `cellar_wines` table + Storage bucket
4. **Label Scanner screens** — label.tsx, label/camera.tsx, label/confirm.tsx, label/results.tsx
5. **Cellar screens** — cellar.tsx, cellar/[wineId].tsx, cellar/add.tsx
6. **Tab bar update** — add Label and Cellar tabs
7. **Profile update** — add dietary preferences section
8. **Add-to-cellar flow** — wire results screen → cellar save

---

## Open Questions for Tonight

1. **Drinking window in cellar** — should the app alert the user when a wine is entering its peak drinking window? (push notification or in-app badge)
2. **Cellar sharing** — any interest in sharing a cellar or individual wines with other users in future?
3. **Pairing personalisation** — should the Label Scanner pairings use the user's dietary preferences automatically, or ask each time?
4. **History tab** — should Label Scanner scans also appear in the History tab alongside List Scanner sessions, or have their own history?
