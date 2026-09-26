-- ============================================================================
-- wines_catalog seed — South Africa
-- ============================================================================
-- Run in the Supabase SQL editor. Idempotent (search_key trigger + ON CONFLICT
-- DO NOTHING + mig-102 merge key). Real producers + flagship cuvées only.
-- Style ∈ Red / White / Rosé / Sparkling / Fortified.
-- ============================================================================
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  -- Swartland
  ('Sadie Family Wines', 'Columella', 'Swartland', 'Syrah/Mourvèdre', 'Red'),
  ('Sadie Family Wines', 'Palladius', 'Swartland', 'Chenin Blanc/Grenache Blanc', 'White'),
  ('Sadie Family Wines', 'Soldaat', 'Swartland', 'Grenache', 'Red'),
  ('Sadie Family Wines', 'Skerpioen', 'Swartland', 'Chenin Blanc/Palomino', 'White'),
  ('Sadie Family Wines', 'Skurfberg', 'Swartland', 'Chenin Blanc', 'White'),
  ('Sadie Family Wines', 'Mev. Kirsten', 'Stellenbosch', 'Chenin Blanc', 'White'),
  ('Sadie Family Wines', 'Pofadder', 'Swartland', 'Cinsault', 'Red'),
  ('Mullineux', 'Syrah', 'Swartland', 'Syrah', 'Red'),
  ('Mullineux', 'Old Vines White', 'Swartland', 'Chenin Blanc', 'White'),
  ('Mullineux', 'Iron Syrah', 'Swartland', 'Syrah', 'Red'),
  ('Mullineux', 'Schist Syrah', 'Swartland', 'Syrah', 'Red'),
  ('Mullineux', 'Straw Wine', 'Swartland', 'Chenin Blanc', 'White'),
  ('Leeu Passant', 'Dry Red', 'Western Cape', 'Cabernet Sauvignon/Cabernet Franc', 'Red'),
  ('Leeu Passant', 'Chardonnay', 'Western Cape', 'Chardonnay', 'White'),
  ('Leeu Passant', 'Old Vines Cinsault', 'Western Cape', 'Cinsault', 'Red'),
  ('Porseleinberg', 'Syrah', 'Swartland', 'Syrah', 'Red'),
  ('David & Nadia', 'Chenin Blanc', 'Swartland', 'Chenin Blanc', 'White'),
  ('David & Nadia', 'Grenache', 'Swartland', 'Grenache', 'Red'),
  ('David & Nadia', 'Aristargos', 'Swartland', 'Chenin Blanc', 'White'),
  ('A.A. Badenhorst', 'Family Red', 'Swartland', 'Syrah/Cinsault/Mourvèdre', 'Red'),
  ('A.A. Badenhorst', 'Family White', 'Swartland', 'Chenin Blanc', 'White'),
  -- Stellenbosch
  ('Kanonkop', 'Paul Sauer', 'Stellenbosch', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),
  ('Kanonkop', 'Pinotage', 'Stellenbosch', 'Pinotage', 'Red'),
  ('Kanonkop', 'Cabernet Sauvignon', 'Stellenbosch', 'Cabernet Sauvignon', 'Red'),
  ('Meerlust', 'Rubicon', 'Stellenbosch', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),
  ('Meerlust', 'Pinot Noir', 'Stellenbosch', 'Pinot Noir', 'Red'),
  ('Meerlust', 'Chardonnay', 'Stellenbosch', 'Chardonnay', 'White'),
  ('Rustenberg', 'Peter Barlow', 'Stellenbosch', 'Cabernet Sauvignon', 'Red'),
  ('Rustenberg', 'John X Merriman', 'Stellenbosch', 'Cabernet Sauvignon/Merlot', 'Red'),
  ('Rustenberg', 'Five Soldiers Chardonnay', 'Stellenbosch', 'Chardonnay', 'White'),
  ('Vergelegen', 'GVB Red', 'Stellenbosch', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),
  ('Vergelegen', 'V', 'Stellenbosch', 'Cabernet Sauvignon', 'Red'),
  ('De Toren', 'Fusion V', 'Stellenbosch', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),
  ('Thelema', 'Cabernet Sauvignon', 'Stellenbosch', 'Cabernet Sauvignon', 'Red'),
  ('Raats Family', 'Old Vine Chenin Blanc', 'Stellenbosch', 'Chenin Blanc', 'White'),
  ('Raats Family', 'Cabernet Franc', 'Stellenbosch', 'Cabernet Franc', 'Red'),
  ('Raats Family', 'MR de Compostella', 'Stellenbosch', 'Cabernet Franc/Merlot', 'Red'),
  ('Ken Forrester', 'The FMC', 'Stellenbosch', 'Chenin Blanc', 'White'),
  ('Reyneke', 'Reserve Red', 'Stellenbosch', 'Syrah', 'Red'),
  ('Reyneke', 'Reserve White', 'Stellenbosch', 'Chenin Blanc', 'White'),
  ('Tokara', 'Director''s Reserve Red', 'Stellenbosch', 'Cabernet Sauvignon/Merlot', 'Red'),
  -- Hemel-en-Aarde / Walker Bay
  ('Hamilton Russell Vineyards', 'Pinot Noir', 'Hemel-en-Aarde', 'Pinot Noir', 'Red'),
  ('Hamilton Russell Vineyards', 'Chardonnay', 'Hemel-en-Aarde', 'Chardonnay', 'White'),
  ('Bouchard Finlayson', 'Galpin Peak Pinot Noir', 'Hemel-en-Aarde', 'Pinot Noir', 'Red'),
  ('Bouchard Finlayson', 'Missionvale Chardonnay', 'Hemel-en-Aarde', 'Chardonnay', 'White'),
  ('Crystallum', 'Cuvée Cinéma Pinot Noir', 'Hemel-en-Aarde', 'Pinot Noir', 'Red'),
  ('Crystallum', 'The Agnes Chardonnay', 'Western Cape', 'Chardonnay', 'White'),
  ('Storm Wines', 'Vrede Pinot Noir', 'Hemel-en-Aarde', 'Pinot Noir', 'Red'),
  -- Constantia / Cape Point
  ('Klein Constantia', 'Vin de Constance', 'Constantia', 'Muscat de Frontignan', 'White'),
  ('Klein Constantia', 'Sauvignon Blanc', 'Constantia', 'Sauvignon Blanc', 'White'),
  ('Cape Point Vineyards', 'Isliedh', 'Cape Point', 'Sauvignon Blanc/Sémillon', 'White'),
  -- Franschhoek
  ('Boekenhoutskloof', 'Syrah', 'Franschhoek', 'Syrah', 'Red'),
  ('Boekenhoutskloof', 'Cabernet Sauvignon', 'Franschhoek', 'Cabernet Sauvignon', 'Red'),
  ('Boekenhoutskloof', 'The Chocolate Block', 'Western Cape', 'Syrah/Grenache/Cinsault', 'Red'),
  ('Alheit Vineyards', 'Cartology', 'Western Cape', 'Chenin Blanc/Sémillon', 'White'),
  ('Alheit Vineyards', 'Radio Lazarus', 'Stellenbosch', 'Chenin Blanc', 'White'),
  ('Savage Wines', 'Red', 'Western Cape', 'Syrah/Cabernet Franc', 'Red'),
  ('Savage Wines', 'White', 'Western Cape', 'Sauvignon Blanc/Sémillon', 'White')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;
