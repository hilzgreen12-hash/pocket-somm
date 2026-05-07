// Heuristic style classifier for cellar wines that don't have an explicit
// style column populated yet. Returns one of 'Red' | 'White' | 'Rosé' |
// 'Sparkling' | 'Fortified' | null.
//
// Priority: explicit style > region keywords (Champagne, Port, etc.) >
// grape variety lookup > null.

export type WineStyle = 'Red' | 'White' | 'Rosé' | 'Sparkling' | 'Fortified';

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
