// Heuristic style classifier for cellar wines that don't have an explicit
// style column populated yet. Returns one of 'Red' | 'White' | 'Rosé' |
// 'Sparkling' | 'Fortified' | null.
//
// Priority: explicit style > region keywords (Champagne, Port, etc.) >
// grape variety lookup > null.

// The app's wine colours/styles, in the order they're offered as choices.
export const WINE_STYLES = ['Red', 'White', 'Rosé', 'Sparkling', 'Fortified'] as const;
export type WineStyle = typeof WINE_STYLES[number];

const SPARKLING_REGION_HINTS = ['champagne', 'cava', 'prosecco', 'crémant', 'cremant', 'franciacorta', 'asti', 'sekt'];
const FORTIFIED_REGION_HINTS = ['port', 'sherry', 'jerez', 'madeira', 'marsala', 'banyuls', 'rutherglen'];
const ROSE_HINTS = ['rosé', 'rose', 'rosato', 'rosado', 'provence rosé'];

const RED_GRAPES = [
  'cabernet sauvignon', 'cabernet', 'merlot', 'pinot noir', 'syrah', 'shiraz',
  'tempranillo', 'sangiovese', 'nebbiolo', 'malbec', 'grenache', 'garnacha',
  'mourvèdre', 'mourvedre', 'monastrell', 'zinfandel', 'cabernet franc',
  'petit verdot', 'carmenère', 'carmenere', 'gamay', 'barbera', 'aglianico',
  'touriga', 'tannat', 'pinotage', 'corvina', 'montepulciano', 'primitivo',
];
const WHITE_GRAPES = [
  'chardonnay', 'sauvignon blanc', 'sauvignon', 'riesling', 'pinot grigio',
  'pinot gris', 'gewürztraminer', 'gewurztraminer', 'viognier', 'albariño',
  'albarino', 'vermentino', 'chenin blanc', 'chenin', 'sémillon', 'semillon',
  'marsanne', 'roussanne', 'grüner veltliner', 'gruner veltliner', 'verdejo',
  'godello', 'fiano', 'falanghina', 'soave', 'muscadet', 'melon de bourgogne',
  'pinot blanc', 'silvaner', 'müller-thurgau', 'muller-thurgau', 'torrontés',
  'torrontes', 'assyrtiko',
];

export function inferWineStyle(input: { style?: string | null; region?: string | null; grape_variety?: string | null }): WineStyle | null {
  const norm = (s: string | null | undefined) => (s ?? '').toLowerCase();

  if (input.style) {
    const s = norm(input.style);
    if (s.includes('red')) return 'Red';
    if (s.includes('white')) return 'White';
    if (s.includes('rosé') || s.includes('rose')) return 'Rosé';
    if (s.includes('sparkling') || s.includes('champagne')) return 'Sparkling';
    if (s.includes('fortified') || s.includes('port') || s.includes('sherry') || s.includes('madeira')) return 'Fortified';
  }

  const region = norm(input.region);
  if (SPARKLING_REGION_HINTS.some((h) => region.includes(h))) return 'Sparkling';
  if (FORTIFIED_REGION_HINTS.some((h) => region.includes(h))) return 'Fortified';

  const grape = norm(input.grape_variety);
  if (grape) {
    if (ROSE_HINTS.some((h) => grape.includes(h))) return 'Rosé';
    if (RED_GRAPES.some((g) => grape.includes(g))) return 'Red';
    if (WHITE_GRAPES.some((g) => grape.includes(g))) return 'White';
  }

  return null;
}

// The colour dot beside a wine in search results: 'red' | 'white' | 'rosé', or
// null when nothing is known. The catalogue's own colour comes first (a rosé
// Champagne is rosé, not sparkling); otherwise it's worked out from the style,
// region or grape. Sparkling and fortified wines take the colour of most of
// their kind.
export function wineDotColourKey(w: { colour?: string | null; style?: string | null; region?: string | null; grape?: string | null }): 'red' | 'white' | 'rosé' | null {
  const c = (w.colour ?? '').toLowerCase();
  if (c === 'red' || c === 'white') return c;
  if (c === 'rosé' || c === 'rose') return 'rosé';
  switch (inferWineStyle({ style: w.style, region: w.region, grape_variety: w.grape })) {
    case 'Red': return 'red';
    case 'Rosé': return 'rosé';
    case 'White': case 'Sparkling': return 'white';
    case 'Fortified': return 'red';
    default: return null;
  }
}

// The dot's paint: red, gold for white, pink for rosé, and a muted neutral
// when the colour isn't known, so every wine still shows a dot.
export function wineDotColour(key: 'red' | 'white' | 'rosé' | null): string {
  switch (key) {
    case 'red': return '#B23A2E';
    case 'white': return '#E0B84A';
    case 'rosé': return '#E39AA6';
    default: return '#8C7B78';
  }
}
