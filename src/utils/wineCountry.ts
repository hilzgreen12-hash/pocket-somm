// Pull a country out of a free-text region string. Wines on the cellar
// often have regions like "Margaux, Bordeaux", "Napa Valley", or
// "Châteauneuf-du-Pape, Rhône, France". This walks a known-country list
// against the string (case-insensitive) and returns the first hit.
// If no country is found in the text, falls back to checking common
// country aliases (USA → United States, UK → United Kingdom, etc.).

const COUNTRIES_AND_ALIASES: { canonical: string; matches: string[] }[] = [
  { canonical: 'France', matches: ['france'] },
  { canonical: 'Italy', matches: ['italy', 'italia'] },
  { canonical: 'Spain', matches: ['spain', 'españa', 'espana'] },
  { canonical: 'Portugal', matches: ['portugal'] },
  { canonical: 'Germany', matches: ['germany', 'deutschland'] },
  { canonical: 'Austria', matches: ['austria'] },
  { canonical: 'Switzerland', matches: ['switzerland'] },
  { canonical: 'Greece', matches: ['greece'] },
  { canonical: 'Hungary', matches: ['hungary'] },
  { canonical: 'United States', matches: ['united states', 'usa', 'u.s.a', 'u.s.', ' us '] },
  { canonical: 'Argentina', matches: ['argentina'] },
  { canonical: 'Chile', matches: ['chile'] },
  { canonical: 'Australia', matches: ['australia'] },
  { canonical: 'New Zealand', matches: ['new zealand'] },
  { canonical: 'South Africa', matches: ['south africa'] },
  { canonical: 'Lebanon', matches: ['lebanon'] },
  { canonical: 'Israel', matches: ['israel'] },
  { canonical: 'Georgia', matches: ['georgia'] },
  { canonical: 'Croatia', matches: ['croatia'] },
  { canonical: 'Slovenia', matches: ['slovenia'] },
  { canonical: 'Romania', matches: ['romania'] },
  { canonical: 'Brazil', matches: ['brazil'] },
  { canonical: 'Uruguay', matches: ['uruguay'] },
  { canonical: 'Canada', matches: ['canada'] },
  { canonical: 'Japan', matches: ['japan'] },
  { canonical: 'China', matches: ['china'] },
  { canonical: 'United Kingdom', matches: ['united kingdom', ' uk', 'england'] },
];

// Region → country lookup for common appellations / sub-regions where the
// country name doesn't appear in the string itself.
const REGION_HINTS: { canonical: string; hints: string[] }[] = [
  { canonical: 'France', hints: ['bordeaux', 'burgundy', 'bourgogne', 'champagne', 'rhône', 'rhone', 'loire', 'alsace', 'languedoc', 'provence', 'beaujolais', 'sancerre', 'chablis', 'margaux', 'pomerol', 'saint-émilion', 'saint emilion', 'st. emilion', 'st-emilion', 'sauternes', 'cahors', 'jurançon', 'jurancon', 'condrieu', 'côte-rôtie', 'cote-rotie', 'cornas', 'crozes-hermitage', 'gigondas', 'vacqueyras', 'châteauneuf', 'chateauneuf'] },
  { canonical: 'Italy', hints: ['tuscany', 'piedmont', 'piemonte', 'veneto', 'sicily', 'sicilia', 'puglia', 'umbria', 'lazio', 'campania', 'friuli', 'trentino', 'lombardia', 'liguria', 'chianti', 'barolo', 'barbaresco', 'brunello', 'amarone', 'soave', 'valpolicella', 'prosecco', 'franciacorta', 'etna', 'taurasi', 'bolgheri', 'montalcino', 'montepulciano'] },
  { canonical: 'Spain', hints: ['rioja', 'ribera del duero', 'priorat', 'rías baixas', 'rias baixas', 'jerez', 'sherry', 'cava', 'penedès', 'penedes', 'toro', 'bierzo', 'navarra', 'jumilla'] },
  { canonical: 'Portugal', hints: ['douro', 'porto', 'port', 'madeira', 'dão', 'dao', 'alentejo', 'vinho verde', 'bairrada', 'lisboa', 'setúbal', 'setubal'] },
  { canonical: 'Germany', hints: ['mosel', 'rheingau', 'rheinhessen', 'pfalz', 'baden', 'württemberg', 'wurttemberg', 'nahe', 'franken', 'sekt'] },
  { canonical: 'Austria', hints: ['wachau', 'kamptal', 'kremstal', 'burgenland', 'styria', 'steiermark'] },
  { canonical: 'United States', hints: ['napa', 'sonoma', 'oregon', 'willamette', 'paso robles', 'mendocino', 'columbia valley', 'walla walla', 'finger lakes', 'santa barbara', 'russian river', 'lodi', 'monterey', 'central coast'] },
  { canonical: 'Argentina', hints: ['mendoza', 'salta', 'patagonia', 'uco valley'] },
  { canonical: 'Chile', hints: ['maipo', 'colchagua', 'casablanca', 'aconcagua', 'maule', 'limarí', 'limari'] },
  { canonical: 'Australia', hints: ['barossa', 'mclaren vale', 'clare valley', 'eden valley', 'yarra valley', 'margaret river', 'coonawarra', 'hunter valley', 'tasmania', 'adelaide hills'] },
  { canonical: 'New Zealand', hints: ['marlborough', 'central otago', 'hawke\'s bay', 'hawkes bay', 'martinborough', 'gisborne', 'wairarapa'] },
  { canonical: 'South Africa', hints: ['stellenbosch', 'paarl', 'swartland', 'constantia', 'walker bay', 'elgin'] },
  { canonical: 'Hungary', hints: ['tokaj', 'eger'] },
  { canonical: 'Greece', hints: ['santorini', 'naoussa', 'nemea'] },
];

export function inferCountry(region: string | null | undefined): string | null {
  const text = (region ?? '').toLowerCase().trim();
  if (!text) return null;

  for (const c of COUNTRIES_AND_ALIASES) {
    for (const m of c.matches) {
      if (text.includes(m.trim())) return c.canonical;
    }
  }

  for (const r of REGION_HINTS) {
    for (const h of r.hints) {
      if (text.includes(h)) return r.canonical;
    }
  }

  return null;
}
