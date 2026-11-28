-- La Grange St. Martin "La Pointe du Vent" (Châteauneuf-du-Pape): the label
-- shows only the brand, but web lookups had filed it twice under clashing
-- Famille Perrin producer names, so Wine Intel never matched the scanned label.
-- One verified row, spelled as the label reads, replaces both.
-- Sources: https://www.vivino.com/en/chateau-de-beaucastel-la-grange-st-martin-la-pointe-du-vent-chateauneuf-du-pape/w/6018732
--          https://www.cellartracker.com/wine.asp?iWine=2871080
delete from public.wines_catalog
where id in ('13b0c8f2-bb96-4f56-9c5e-d5851589fbf1', 'c426eaae-21cb-43ed-800f-e7aea7c78c58');

insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
values ('La Grange St. Martin', 'La Pointe du Vent', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'Red',
        'La Grange St. Martin La Pointe du Vent', 'seed', 'verified', 'web-page', now(),
        'Perrin family (Château de Beaucastel) brand; confirmed on Vivino and CellarTracker 2026-11-27 (see supabase/seeds/catalog_fix_la_grange_st_martin.sql)')
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes;

select producer, wine_name, region, verification_status from public.wines_catalog where wine_name ilike '%pointe du vent%';
