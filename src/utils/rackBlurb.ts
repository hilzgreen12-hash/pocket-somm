// Generate a short, Vinster-flavoured one-liner describing what a rack is
// mostly home to. Pure client-side — based on the dominant style and the
// most represented region among the wines stored there. Returns a single
// string ready to drop into the UI.

import type { CellarWine } from '../types/wine';
import { inferWineStyle, type WineStyle } from './wineStyle';

const STYLE_BLURBS: Record<WineStyle, string[]> = {
  Red: [
    'mostly reds, built for the long game',
    'a red-wine sanctuary',
    'reds, reds, and a few more reds',
  ],
  White: [
    'a chilled white-wine retreat',
    'whites with a sense of occasion',
    'mostly whites, kept cool and ready',
  ],
  Rosé: [
    'rosé country',
    'pink-hued and ready for sun',
  ],
  Sparkling: [
    'the bubbles corner',
    'a celebration in waiting',
    'mostly sparkling, mostly trouble',
  ],
  Fortified: [
    'fortified treasures, sipped slowly',
    'after-dinner territory',
  ],
};

const STYLE_WITH_REGION: Record<WineStyle, (region: string) => string> = {
  Red: (r) => `mostly ${r} reds, built for the long game`,
  White: (r) => `a ${r} white-wine retreat`,
  Rosé: (r) => `${r} rosé, mostly`,
  Sparkling: (r) => `mostly ${r} bubbles`,
  Fortified: (r) => `${r} fortifieds, sipped slowly`,
};

const MIXED_BLURBS = [
  'a happy mixed bag',
  'a bit of everything, no theme',
  'eclectic — a sommelier\'s playground',
  'mixed and unrepentant',
];

const EMPTY_BLURBS = [
  'empty — waiting to be filled',
  'an empty stage, ready for an opening act',
];

// Pick a deterministic option from a list using a simple hash of the seed
// so the same rack keeps the same blurb across renders without useMemo
// gymnastics.
function pick<T>(items: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return items[Math.abs(hash) % items.length];
}

export function rackHomeToBlurb(rackId: string, wines: CellarWine[]): string {
  if (wines.length === 0) {
    return pick(EMPTY_BLURBS, rackId);
  }

  // Tally style buckets by bottle count
  const styleCounts: Record<WineStyle, number> = { Red: 0, White: 0, Rosé: 0, Sparkling: 0, Fortified: 0 };
  let unclassified = 0;
  for (const w of wines) {
    const style = inferWineStyle({ style: (w as any).style, region: w.region, grape_variety: w.grape_variety });
    if (style) styleCounts[style] += w.quantity;
    else unclassified += w.quantity;
  }

  const totalClassified = Object.values(styleCounts).reduce((a, b) => a + b, 0);
  const total = totalClassified + unclassified;

  const dominantEntry = (Object.entries(styleCounts) as [WineStyle, number][])
    .sort((a, b) => b[1] - a[1])[0];
  const dominantStyle = dominantEntry?.[0];
  const dominantCount = dominantEntry?.[1] ?? 0;

  // If nothing classifies clearly, or the cellar is too mixed (less than 50%
  // of one style), fall back to a "mixed" blurb.
  if (!dominantStyle || total === 0 || dominantCount / total < 0.5) {
    return pick(MIXED_BLURBS, rackId);
  }

  // Try to add a regional flavour if one region dominates
  const regionCounts: Record<string, number> = {};
  for (const w of wines) {
    if (!w.region) continue;
    const key = w.region.trim();
    if (!key) continue;
    regionCounts[key] = (regionCounts[key] ?? 0) + w.quantity;
  }
  const topRegionEntry = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];
  if (topRegionEntry && topRegionEntry[1] / total >= 0.4) {
    // Strip trailing country qualifier to keep the line tight
    // ("Margaux, Bordeaux" → "Margaux", "Sancerre, Loire" → "Sancerre")
    const region = topRegionEntry[0].split(',')[0].trim();
    return STYLE_WITH_REGION[dominantStyle](region);
  }

  return pick(STYLE_BLURBS[dominantStyle], rackId);
}
