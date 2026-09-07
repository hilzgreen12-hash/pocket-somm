-- Awaiting Placement
--
-- A bottle moved (e.g. by Voice Command) into a rack, fridge, bin or alt cellar
-- can't be assumed to sit in a real slot yet. We flag it "awaiting placement"
-- until the user files it into its true slot / cell / case, so it can be shown
-- distinctly from bottles the user is happy to leave loose.
--
-- Rack / fridge / bin destinations record the target unit in
-- awaiting_placement_unit_id (a wine_racks row — racks, fridges and bins all
-- live there). Alt-cellar destinations keep the existing storage_location_id
-- with the flag set, and can be "ignored" (left loose, flag cleared).

ALTER TABLE cellar_wines
  ADD COLUMN IF NOT EXISTS awaiting_placement boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS awaiting_placement_unit_id uuid REFERENCES wine_racks(id) ON DELETE SET NULL;

-- Fast lookup of "which bottles are awaiting placement in this unit".
CREATE INDEX IF NOT EXISTS cellar_wines_awaiting_unit_idx
  ON cellar_wines (awaiting_placement_unit_id)
  WHERE awaiting_placement_unit_id IS NOT NULL;
