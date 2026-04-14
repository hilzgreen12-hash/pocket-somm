/**
 * Vintage quality scores by region and year.
 * Scale: 0–100. Source: to be populated by user from reference charts.
 *
 * Structure:
 *   VINTAGE_CHARTS[regionKey][year] = score (0–100)
 *
 * Region keys should match Claude's appellation/region output
 * from the OCR step (case-insensitive lookup recommended).
 *
 * This file is a placeholder — vintage data will be added in a subsequent step.
 */
export const VINTAGE_CHARTS: Record<string, Record<number, number>> = {
  // Example structure (to be replaced with real data):
  // 'Burgundy Red': {
  //   2014: 96,
  //   2013: 84,
  //   2012: 88,
  // },
  // 'Burgundy White': {
  //   2014: 97,
  //   2013: 80,
  //   2011: 82,
  // },
};

/**
 * Look up a vintage score for a given region and year.
 * Returns null if not found in the chart.
 */
export function lookupVintageScore(region: string, year: number): number | null {
  const regionKey = Object.keys(VINTAGE_CHARTS).find(
    (k) => k.toLowerCase() === region.toLowerCase()
  );
  if (!regionKey) return null;
  return VINTAGE_CHARTS[regionKey][year] ?? null;
}
