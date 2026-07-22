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
- **Membership** → count-based, tracked **per diamond**: a `cellar_wines` row
  references the specific `bin_cell` it lives in, with a `quantity`. **No
  `rack_slots`.**

Cases keep their **own** existing model (`storage_cases`, inside a storage
location) — they are not modelled through `wine_racks`.

### Diamond contents (the per-diamond list)

**Each diamond has its own list of the wines within it** — this is the tracking
granularity (decided; not a whole-bin single meter). You drill into a diamond
and see its contents.

Mirror the **lineup input list** (`scan-lineup.tsx`) exactly — that pattern is
the template:

- **One row per wine + format**, shown as `qty × wine` with a **format tag**,
  e.g. `12 × Diamond Creek · 75cl`. A diamond full of one wine is a single row
  (`12 × Diamond Creek`).
- **Batching:** identical wine **and** format collapse into one `×N` row (same
  rule lineup uses for `producer + name + vintage`), here extended to include
  **format** so sizes never silently merge.
- **Drill-through / edit:** tap a row to open its editor (quantity stepper,
  producer/name/region/vintage, and a `BottleSizePicker` for the format) —
  reuse the lineup edit sheet, including scan-to-fill.
- **Fill meter** per diamond: sum of row quantities vs the diamond's capacity
  (full = cap, triangle = cap ÷ 2).

### Formats (bottle sizes)

**Multiple bottle sizes are allowed both _within_ a diamond and _across_ a
bin.** Format is part of a row's identity, so one diamond can hold
`6 × Diamond Creek · 75cl` and `2 × Diamond Creek · 150cl` as **two** rows.
Every membership row carries its own `bottle_size_ml` (as lineup rows already
do) — do not assume 750ml.

## Non-negotiables (already decided)

- **Never scan the bin/case itself** to populate it — a case/bin label can't
  tell us the wines inside. Populate only by scanning/adding the wines.
- Cases and bins have **separate** flows and screens — they share only the
  count-based characteristic, not the UI.
