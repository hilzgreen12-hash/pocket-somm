# Bins & Cases — storage model spec

_Last updated 2026-07-22._

## The core idea

Vinster has two storage paradigms:

- **Position-based** (racks, fridges): every bottle sits in an addressed slot
  (`wine_racks` + `rack_slots`, row × col). Position matters.
- **Count-based** (cases, bins): a container holds _N_ bottles in bulk. You
  don't address a slot — you drop bottles in and track a count.

**Cases and bins share the count-based _characteristic_ — but NOT the flow, and
NOT the placement.** They are separate features that happen to both track
bottles by count rather than by slot. Do not merge their screens.

| | **Case** | **Bin** |
|---|---|---|
| Lives in | **inside an Other Home Storage location** | **top-level furniture** (the "Racks, Fridges & Bins" carousel) |
| Shape | a box of wine | a grid of diamonds |
| Model | `storage_cases` (existing) | `wine_racks` + diamond cells (new) |
| Flow | its own | its own |

The only thing they share: bottles are counted, never slot-placed.

## Cases

Cases are **not** top-level storage — a case lives **inside an Other Home
Storage location** (e.g. "the case of Rioja in the shed"). This is the existing
`storage_cases` model (`storage_location_id`, `kind single|mixed`, `case_id` on
`cellar_wines`). No new furniture, no diamond geometry. Leave the case flow as
it is unless a specific case bug comes up.

## Bins

Bins ARE top-level furniture, shown in the "Racks, Fridges & Bins" carousel
alongside racks and fridges. A bin is a **grid of diamonds** — this is the new
work.

### Bin capacity setup
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
- **Membership** → count-based: a `cellar_wines` row references its bin cell
  (or the unit) with a `quantity`. **No `rack_slots`.**

Cases keep their **own** existing model (`storage_cases`, inside a storage
location) — they are not modelled through `wine_racks`.

## Phasing (recommended)

1. **Phase 1 — unit-level count.** Capture the diamond arrangement + per-diamond
   capacity to compute total capacity, but populate at the **unit** level (one
   fill meter for the whole bin). Ships the bin flow with minimal new tables
   (`bin_cells` optional here).
2. **Phase 2 — per-diamond tracking.** Because we already captured the diamond
   grid, we can let users populate a **specific diamond** ("all my Barolo is in
   diamond 3"), each cell with its own fill meter. This is the count-based
   analogue of per-slot rack tracking — the natural next step, not a rework.

## Open decision

**Track per-diamond, or just total unit capacity?** The rack analogy ("like
rows and cols") points to per-diamond (Phase 2). Recommendation: build Phase 1
now (unit-level), with the schema already shaped for Phase 2. Confirm before
building whether per-diamond tracking is wanted at launch or can follow.

## Non-negotiables (already decided)

- **Never scan the bin/case itself** to populate it — a case/bin label can't
  tell us the wines inside. Populate only by scanning/adding the wines.
- Cases and bins have **separate** flows and screens — they share only the
  count-based characteristic, not the UI.
