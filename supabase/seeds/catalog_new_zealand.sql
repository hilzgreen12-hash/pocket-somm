-- ============================================================================
-- wines_catalog seed — New Zealand
-- ============================================================================
-- Run in the Supabase SQL editor. Idempotent (search_key trigger + ON CONFLICT
-- DO NOTHING + mig-102 merge key). Real producers + flagship cuvées only.
-- ============================================================================
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  -- Central Otago (Pinot Noir)
  ('Felton Road', 'Block 3 Pinot Noir', 'Central Otago', 'Pinot Noir', 'Red'),
  ('Felton Road', 'Block 5 Pinot Noir', 'Central Otago', 'Pinot Noir', 'Red'),
  ('Felton Road', 'Bannockburn Pinot Noir', 'Central Otago', 'Pinot Noir', 'Red'),
  ('Felton Road', 'Calvert Pinot Noir', 'Central Otago', 'Pinot Noir', 'Red'),
  ('Felton Road', 'Chardonnay', 'Central Otago', 'Chardonnay', 'White'),
  ('Felton Road', 'Riesling', 'Central Otago', 'Riesling', 'White'),
  ('Rippon', 'Mature Vine Pinot Noir', 'Central Otago', 'Pinot Noir', 'Red'),
  ('Rippon', 'Tinker''s Field Pinot Noir', 'Central Otago', 'Pinot Noir', 'Red'),
  ('Burn Cottage', 'Pinot Noir', 'Central Otago', 'Pinot Noir', 'Red'),
  ('Two Paddocks', 'Pinot Noir', 'Central Otago', 'Pinot Noir', 'Red'),
  ('Mount Difficulty', 'Bannockburn Pinot Noir', 'Central Otago', 'Pinot Noir', 'Red'),
  -- Canterbury / North Canterbury
  ('Bell Hill', 'Pinot Noir', 'Canterbury', 'Pinot Noir', 'Red'),
  ('Bell Hill', 'Chardonnay', 'Canterbury', 'Chardonnay', 'White'),
  ('Pyramid Valley', 'Angel Flower Pinot Noir', 'North Canterbury', 'Pinot Noir', 'Red'),
  ('Pyramid Valley', 'Earth Smoke Pinot Noir', 'North Canterbury', 'Pinot Noir', 'Red'),
  -- Marlborough
  ('Cloudy Bay', 'Sauvignon Blanc', 'Marlborough', 'Sauvignon Blanc', 'White'),
  ('Cloudy Bay', 'Te Koko', 'Marlborough', 'Sauvignon Blanc', 'White'),
  ('Cloudy Bay', 'Pinot Noir', 'Marlborough', 'Pinot Noir', 'Red'),
  ('Dog Point', 'Section 94 Sauvignon Blanc', 'Marlborough', 'Sauvignon Blanc', 'White'),
  ('Dog Point', 'Sauvignon Blanc', 'Marlborough', 'Sauvignon Blanc', 'White'),
  ('Dog Point', 'Chardonnay', 'Marlborough', 'Chardonnay', 'White'),
  ('Dog Point', 'Pinot Noir', 'Marlborough', 'Pinot Noir', 'Red'),
  ('Greywacke', 'Sauvignon Blanc', 'Marlborough', 'Sauvignon Blanc', 'White'),
  ('Greywacke', 'Wild Sauvignon', 'Marlborough', 'Sauvignon Blanc', 'White'),
  ('Greywacke', 'Pinot Noir', 'Marlborough', 'Pinot Noir', 'Red'),
  ('Fromm', 'Clayvin Pinot Noir', 'Marlborough', 'Pinot Noir', 'Red'),
  -- Kumeu / Auckland
  ('Kumeu River', 'Maté''s Vineyard Chardonnay', 'Kumeu', 'Chardonnay', 'White'),
  ('Kumeu River', 'Estate Chardonnay', 'Kumeu', 'Chardonnay', 'White'),
  ('Kumeu River', 'Hunting Hill Chardonnay', 'Kumeu', 'Chardonnay', 'White'),
  -- Hawke's Bay
  ('Craggy Range', 'Le Sol Syrah', 'Hawke''s Bay', 'Syrah', 'Red'),
  ('Craggy Range', 'The Quarry Cabernet Sauvignon', 'Hawke''s Bay', 'Cabernet Sauvignon/Merlot', 'Red'),
  ('Craggy Range', 'Sophia', 'Hawke''s Bay', 'Merlot/Cabernet Franc/Cabernet Sauvignon', 'Red'),
  ('Craggy Range', 'Aroha Pinot Noir', 'Martinborough', 'Pinot Noir', 'Red'),
  ('Trinity Hill', 'Homage Syrah', 'Hawke''s Bay', 'Syrah', 'Red'),
  ('Te Mata Estate', 'Coleraine', 'Hawke''s Bay', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),
  ('Te Mata Estate', 'Awatea', 'Hawke''s Bay', 'Cabernet Sauvignon/Merlot', 'Red'),
  ('Te Mata Estate', 'Elston Chardonnay', 'Hawke''s Bay', 'Chardonnay', 'White'),
  -- Martinborough / Wairarapa
  ('Ata Rangi', 'Pinot Noir', 'Martinborough', 'Pinot Noir', 'Red'),
  ('Ata Rangi', 'Craighall Chardonnay', 'Martinborough', 'Chardonnay', 'White'),
  ('Dry River', 'Pinot Noir', 'Martinborough', 'Pinot Noir', 'Red'),
  ('Escarpment', 'Kupe Pinot Noir', 'Martinborough', 'Pinot Noir', 'Red'),
  -- Nelson
  ('Neudorf', 'Moutere Chardonnay', 'Nelson', 'Chardonnay', 'White'),
  ('Neudorf', 'Moutere Pinot Noir', 'Nelson', 'Pinot Noir', 'Red')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;
