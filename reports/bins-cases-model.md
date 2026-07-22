# Bins & Cases — storage model spec

_Last updated 2026-07-22._

## The core idea

Vinster has two storage paradigms:

- **Position-based** (racks, fridges): every bottle sits in an addressed slot
  (`wine_racks` + `rack_slots`, row × col). Position matters.
- **Count-based** (cases, bins): a container holds _N_ bottles in bulk. You
  don't address a slot — you drop bottles in and track a count.

**Cases and bins are the same paradigm.** They differ only in shape and
capacity structure. So they get **one shared user flow**, for consistency.

## The shared flow (cases AND bins)

1. **Name** the container.
2. **Capacity** — "How much does it hold?" (details differ by type, below).
3. **Populate** — identical for both: add wines (scan / upload / manual),
   count-based, with a **fill meter** (e.g. "18 / 24 bottles"). No slot
   placement, ever.

Step 3 is byte-for-byte the same screen for a case and a bin. Only step 2
branches.

## Step 2 — capacity, by type

### Case (single container)
- One question: **"How many bottles does this case hold?"** → a single
  capacity number.
- That's the whole unit. No sub-cells, no triangles.

### Bin (diamond unit)
A bin is **not** one container — it's a **grid of diamonds**, exactly like a
rack is a grid of slots. So, like a rack's rows × cols, we ask:

- **"How many diamonds?"** — the arrangement of the unit (there is almost
  always more than one). Captured like rack dimensions (across × down).
- **"How many bottles does one full diamond hold?"** — per-diamond capacity
  (e.g. ~20).

From that the app builds the unit's cells:

- **Full diamonds** — interior cells, hold the full per-diamond capacity.
- **Edge triangles** — cells on the outer edges of the unit are half-diamonds
  (triangles) and hold **half** the per-diamond capacity. The app marks these
  automatically from the arrangement — the user never hand-flags them.

Total unit capacity = (full diamonds × cap) + (edge triangles × cap ÷ 2).

## Data model

Reuse the rack infrastructure, count-based instead of slot-based:

- **Unit** → `wine_racks` gains `storage_type = 'bin'` (so bins live in the
  "Racks, Fridges & Bins" carousel alongside racks/fridges). Add:
  - `shape` — `'diamond'` for bins (rack/fridge keep their existing meaning).
  - The diamond arrangement (across × down) — can reuse the existing
    `rows`/`cols` columns, reinterpreted as the diamond grid.
  - per-diamond capacity (bottles per full diamond).
- **Cells** → a `bin_cells` table parallels `rack_slots`:
  `(bin_id, index, kind 'diamond'|'triangle', capacity)`. Edge cells are
  `triangle` at half capacity.
- **Membership** → count-based, mirroring `case_id`: a `cellar_wines` row
  references its cell (or the unit) with a `quantity`. **No `rack_slots`.**

A **case** is the degenerate single-cell instance of the same model: one cell,
full capacity, no triangles.

## Phasing (recommended)

1. **Phase 1 — unit-level count.** Capture the diamond arrangement + per-diamond
   capacity to compute total capacity, but populate at the **unit** level (one
   fill meter for the whole bin). Ships the shared flow with minimal new tables
   (`bin_cells` optional here).
2. **Phase 2 — per-diamond tracking.** Because we already captured the diamond
   grid, we can let users populate a **specific diamond** ("all my Barolo is in
   diamond 3"), each cell with its own fill meter. This is the count-based
   analogue of per-slot rack tracking — the natural next step, not a rework.

## Open decision

**Track per-diamond, or just total unit capacity?** The rack analogy ("like
rows and cols") points to per-diamond (Phase 2). Recommendation: build Phase 1
now (unit-level) so the shared flow ships, with the schema already shaped for
Phase 2. Confirm before building whether per-diamond tracking is wanted at
launch or can follow.

## Non-negotiables (already decided)

- **Never scan the bin/case itself** to populate it — a case/bin label can't
  tell us the wines inside. Populate only by scanning/adding the wines.
- The populate screen is **shared** between cases and bins — do not fork it.
