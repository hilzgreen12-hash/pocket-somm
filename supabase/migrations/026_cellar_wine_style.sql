-- Add a style column to cellar_wines so the Cellar Statistics page can
-- show a Red / White / Sparkling / Other breakdown without inferring it
-- from grape_variety or region every render. Going forward, every new
-- cellar wine writes this from the scanner output. Legacy rows stay null
-- until the user edits them or a future enrichment job backfills.

alter table cellar_wines add column if not exists style text;
