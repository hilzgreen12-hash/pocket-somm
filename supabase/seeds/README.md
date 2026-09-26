# wines_catalog regional seeds

Hand-curated `wines_catalog` seed batches (real producers + flagship/documented
cuvées only — no invented bottlings), one file per region sweep. They power the
"Search a Wine" typeahead.

## Running
Open each file in the **Supabase SQL editor** and run it. Writes go via the
service role (there is no insert RLS policy on `wines_catalog`), so these can't be
run from the app.

Every batch is **idempotent**:
- `search_key` is auto-normalised by the `trg_wines_catalog_search_key` trigger,
- `ON CONFLICT (search_key) DO NOTHING` absorbs rows already present,
- the migration-102 merge key collapses accent / punctuation / large-format
  variants, so re-running or overlap with existing rows is safe.

`display` is computed inline (`producer + cuvée`); `source` is set to `'seed'`.

## Batches
- `catalog_lebanon_greece.sql` — Lebanon + Greece
- `catalog_oregon_washington_bc.sql` — Oregon, Washington, British Columbia
- `catalog_loire.sql` — Loire Valley (full sweep)
- `catalog_south_africa.sql` — South Africa (Swartland, Stellenbosch, Hemel-en-Aarde, Constantia…)
- `catalog_australia.sql` — Australia (Barossa, Clare, McLaren Vale, Coonawarra, Margaret River, Victoria, Hunter)
- `catalog_new_zealand.sql` — New Zealand (Central Otago, Marlborough, Hawke's Bay, Martinborough…)
- `catalog_germany_austria.sql` — Germany (Mosel, Nahe, Rheingau, Rheinhessen, Pfalz) + Austria (Wachau, Kamptal, Burgenland)
