-- ============================================================================
-- wines_catalog seed — Australia
-- ============================================================================
-- Run in the Supabase SQL editor. Idempotent (search_key trigger + ON CONFLICT
-- DO NOTHING + mig-102 merge key). Real producers + flagship cuvées only.
-- ============================================================================
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  -- Barossa / Eden Valley
  ('Penfolds', 'Grange', 'South Australia', 'Shiraz', 'Red'),
  ('Penfolds', 'Bin 707 Cabernet Sauvignon', 'South Australia', 'Cabernet Sauvignon', 'Red'),
  ('Penfolds', 'RWT Bin 798 Shiraz', 'Barossa Valley', 'Shiraz', 'Red'),
  ('Penfolds', 'St Henri Shiraz', 'South Australia', 'Shiraz', 'Red'),
  ('Penfolds', 'Bin 389 Cabernet Shiraz', 'South Australia', 'Cabernet Sauvignon/Shiraz', 'Red'),
  ('Penfolds', 'Bin 28 Kalimna Shiraz', 'South Australia', 'Shiraz', 'Red'),
  ('Penfolds', 'Bin 407 Cabernet Sauvignon', 'South Australia', 'Cabernet Sauvignon', 'Red'),
  ('Penfolds', 'Yattarna Chardonnay', 'South Australia', 'Chardonnay', 'White'),
  ('Henschke', 'Hill of Grace', 'Eden Valley', 'Shiraz', 'Red'),
  ('Henschke', 'Mount Edelstone', 'Eden Valley', 'Shiraz', 'Red'),
  ('Henschke', 'Cyril Henschke', 'Eden Valley', 'Cabernet Sauvignon', 'Red'),
  ('Torbreck', 'RunRig', 'Barossa Valley', 'Shiraz/Viognier', 'Red'),
  ('Torbreck', 'The Factor', 'Barossa Valley', 'Shiraz', 'Red'),
  ('Torbreck', 'The Struie', 'Barossa Valley', 'Shiraz', 'Red'),
  ('Torbreck', 'The Steading', 'Barossa Valley', 'Grenache/Shiraz/Mourvèdre', 'Red'),
  ('Rockford', 'Basket Press Shiraz', 'Barossa Valley', 'Shiraz', 'Red'),
  ('Standish', 'The Standish', 'Barossa Valley', 'Shiraz', 'Red'),
  ('Yalumba', 'The Signature', 'Barossa Valley', 'Cabernet Sauvignon/Shiraz', 'Red'),
  ('Yalumba', 'The Octavius', 'Barossa Valley', 'Shiraz', 'Red'),
  ('Yalumba', 'The Virgilius Viognier', 'Eden Valley', 'Viognier', 'White'),
  ('Two Hands', 'Bella''s Garden Shiraz', 'Barossa Valley', 'Shiraz', 'Red'),
  ('Seppeltsfield', 'Para Vintage Tawny', 'Barossa Valley', 'Shiraz/Grenache/Mourvèdre', 'Fortified'),
  -- Clare Valley
  ('Grosset', 'Polish Hill Riesling', 'Clare Valley', 'Riesling', 'White'),
  ('Grosset', 'Springvale Riesling', 'Clare Valley', 'Riesling', 'White'),
  ('Grosset', 'Gaia', 'Clare Valley', 'Cabernet Sauvignon/Cabernet Franc', 'Red'),
  ('Jim Barry', 'The Armagh Shiraz', 'Clare Valley', 'Shiraz', 'Red'),
  ('Jim Barry', 'The McRae Wood Shiraz', 'Clare Valley', 'Shiraz', 'Red'),
  ('Wendouree', 'Shiraz', 'Clare Valley', 'Shiraz', 'Red'),
  ('Wendouree', 'Cabernet Sauvignon', 'Clare Valley', 'Cabernet Sauvignon', 'Red'),
  -- McLaren Vale
  ('Clarendon Hills', 'Astralis', 'McLaren Vale', 'Syrah', 'Red'),
  ('d''Arenberg', 'The Dead Arm Shiraz', 'McLaren Vale', 'Shiraz', 'Red'),
  ('d''Arenberg', 'The Ironstone Pressings', 'McLaren Vale', 'Grenache/Shiraz/Mourvèdre', 'Red'),
  -- Coonawarra
  ('Wynns Coonawarra Estate', 'John Riddoch Cabernet Sauvignon', 'Coonawarra', 'Cabernet Sauvignon', 'Red'),
  ('Wynns Coonawarra Estate', 'Black Label Cabernet Sauvignon', 'Coonawarra', 'Cabernet Sauvignon', 'Red'),
  -- Margaret River
  ('Cullen', 'Diana Madeline', 'Margaret River', 'Cabernet Sauvignon/Merlot', 'Red'),
  ('Cullen', 'Kevin John Chardonnay', 'Margaret River', 'Chardonnay', 'White'),
  ('Moss Wood', 'Cabernet Sauvignon', 'Margaret River', 'Cabernet Sauvignon', 'Red'),
  ('Leeuwin Estate', 'Art Series Chardonnay', 'Margaret River', 'Chardonnay', 'White'),
  ('Leeuwin Estate', 'Art Series Cabernet Sauvignon', 'Margaret River', 'Cabernet Sauvignon', 'Red'),
  ('Vasse Felix', 'Heytesbury Chardonnay', 'Margaret River', 'Chardonnay', 'White'),
  ('Vasse Felix', 'Tom Cullity', 'Margaret River', 'Cabernet Sauvignon/Malbec', 'Red'),
  ('Cape Mentelle', 'Cabernet Sauvignon', 'Margaret River', 'Cabernet Sauvignon', 'Red'),
  -- Victoria (Yarra, Beechworth, Geelong, Gippsland)
  ('Giaconda', 'Estate Vineyard Chardonnay', 'Beechworth', 'Chardonnay', 'White'),
  ('Giaconda', 'Warner Vineyard Shiraz', 'Beechworth', 'Shiraz', 'Red'),
  ('By Farr', 'Sangreal Pinot Noir', 'Geelong', 'Pinot Noir', 'Red'),
  ('By Farr', 'Farrside Pinot Noir', 'Geelong', 'Pinot Noir', 'Red'),
  ('Bass Phillip', 'Reserve Pinot Noir', 'Gippsland', 'Pinot Noir', 'Red'),
  ('Mount Mary', 'Quintet', 'Yarra Valley', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),
  ('Mount Mary', 'Triolet', 'Yarra Valley', 'Sauvignon Blanc/Sémillon/Muscadelle', 'White'),
  ('Yarra Yering', 'Dry Red No. 1', 'Yarra Valley', 'Cabernet Sauvignon/Merlot/Malbec', 'Red'),
  ('Yarra Yering', 'Dry Red No. 2', 'Yarra Valley', 'Shiraz', 'Red'),
  -- Hunter Valley
  ('Tyrrell''s', 'Vat 1 Semillon', 'Hunter Valley', 'Sémillon', 'White'),
  ('Tyrrell''s', 'Vat 9 Shiraz', 'Hunter Valley', 'Shiraz', 'Red'),
  ('Tyrrell''s', 'Vat 47 Chardonnay', 'Hunter Valley', 'Chardonnay', 'White'),
  ('Mount Pleasant', 'Maurice O''Shea Shiraz', 'Hunter Valley', 'Shiraz', 'Red')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;
