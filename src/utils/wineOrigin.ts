// Best-effort country-of-origin from a wine's region/appellation string.
//
// Reviews don't store a country field, only `region` (which may be a country, a
// region, or an appellation). This maps the common wine regions/appellations to
// their country so the reviews list can show "Region, Country". Returns null when
// the region already names a country, is unknown, or is empty — the caller then
// just shows the region on its own. Kept focused on the major wine nations;
// unknowns fall back gracefully.

const COUNTRIES = [
  'france', 'italy', 'spain', 'portugal', 'germany', 'austria', 'usa', 'united states',
  'australia', 'new zealand', 'argentina', 'chile', 'south africa', 'greece', 'hungary',
  'england', 'united kingdom', 'canada', 'lebanon', 'georgia', 'switzerland',
];

// Region / appellation keyword → country. Matched case-insensitively as a
// substring of the region string, longest-intent first isn't needed since a hit
// on any keyword resolves the country.
const REGION_TO_COUNTRY: Record<string, string> = {
  // France
  bordeaux: 'France', burgundy: 'France', bourgogne: 'France', champagne: 'France',
  rhone: 'France', 'rhône': 'France', loire: 'France', alsace: 'France', beaujolais: 'France',
  provence: 'France', languedoc: 'France', roussillon: 'France', chablis: 'France',
  medoc: 'France', 'médoc': 'France', pauillac: 'France', margaux: 'France', 'saint-emilion': 'France',
  pomerol: 'France', sauternes: 'France', 'côte': 'France', cote: 'France', cahors: 'France',
  jura: 'France', savoie: 'France', 'châteauneuf': 'France', chateauneuf: 'France', sancerre: 'France',
  // Italy
  piedmont: 'Italy', piemonte: 'Italy', barolo: 'Italy', barbaresco: 'Italy', tuscany: 'Italy',
  toscana: 'Italy', chianti: 'Italy', montalcino: 'Italy', 'montepulciano': 'Italy', veneto: 'Italy',
  valpolicella: 'Italy', amarone: 'Italy', prosecco: 'Italy', soave: 'Italy', 'alto adige': 'Italy',
  friuli: 'Italy', sicily: 'Italy', sicilia: 'Italy', etna: 'Italy', puglia: 'Italy', umbria: 'Italy',
  marche: 'Italy', abruzzo: 'Italy', lombardy: 'Italy', franciacorta: 'Italy', 'brunello': 'Italy',
  // Spain
  rioja: 'Spain', ribera: 'Spain', priorat: 'Spain', 'rías baixas': 'Spain', 'rias baixas': 'Spain',
  'jerez': 'Spain', sherry: 'Spain', cava: 'Spain', toro: 'Spain', bierzo: 'Spain', rueda: 'Spain',
  penedes: 'Spain', 'penedès': 'Spain', navarra: 'Spain',
  // Portugal
  douro: 'Portugal', porto: 'Portugal', port: 'Portugal', dao: 'Portugal', 'dão': 'Portugal',
  alentejo: 'Portugal', vinho: 'Portugal', bairrada: 'Portugal', madeira: 'Portugal', 'pico': 'Portugal',
  colares: 'Portugal', 'açores': 'Portugal', azores: 'Portugal', bucelas: 'Portugal',
  // Germany / Austria
  mosel: 'Germany', rheingau: 'Germany', pfalz: 'Germany', nahe: 'Germany', rheinhessen: 'Germany',
  baden: 'Germany', wachau: 'Austria', kamptal: 'Austria', burgenland: 'Austria', 'kremstal': 'Austria',
  // New World
  napa: 'USA', sonoma: 'USA', 'california': 'USA', oregon: 'USA', washington: 'USA', 'willamette': 'USA',
  'finger lakes': 'USA', barossa: 'Australia', 'mclaren': 'Australia', coonawarra: 'Australia',
  'yarra': 'Australia', 'margaret river': 'Australia', clare: 'Australia', 'hunter valley': 'Australia',
  'eden valley': 'Australia', tasmania: 'Australia', marlborough: 'New Zealand', 'central otago': 'New Zealand',
  'hawke': 'New Zealand', mendoza: 'Argentina', 'uco': 'Argentina', salta: 'Argentina',
  maipo: 'Chile', colchagua: 'Chile', casablanca: 'Chile', 'aconcagua': 'Chile',
  stellenbosch: 'South Africa', swartland: 'South Africa', 'walker bay': 'South Africa', paarl: 'South Africa',
  constantia: 'South Africa', tokaj: 'Hungary', santorini: 'Greece', nemea: 'Greece',
};

export function regionCountry(region: string | null | undefined): string | null {
  const r = (region ?? '').trim().toLowerCase();
  if (!r) return null;
  // Already a country (or ends in one, e.g. "Barossa Valley, Australia").
  if (COUNTRIES.some((c) => r === c || r.endsWith(`, ${c}`) || r.endsWith(` ${c}`))) return null;
  for (const [key, country] of Object.entries(REGION_TO_COUNTRY)) {
    if (r.includes(key)) return country;
  }
  return null;
}

// "Region, Country" (or just the region when the country is unknown / redundant).
export function regionWithCountry(region: string | null | undefined): string {
  const r = (region ?? '').trim();
  if (!r) return '';
  const country = regionCountry(r);
  return country ? `${r}, ${country}` : r;
}
