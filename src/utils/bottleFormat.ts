// Bottle sizes a wine-list price can be for (ExtractedWine.format), as a label
// for the pick card and as a count of 75cl bottles, so a magnum's price is
// compared with two bottles' market price rather than one.

const FORMATS: Record<string, { label: string; bottles: number }> = {
  half: { label: 'half bottle', bottles: 0.5 },
  '500ml': { label: '500ml', bottles: 2 / 3 },
  litre: { label: '1 litre', bottles: 4 / 3 },
  magnum: { label: 'magnum', bottles: 2 },
  '3L': { label: '3L', bottles: 4 },
  '4.5L': { label: '4.5L', bottles: 6 },
  '6L': { label: '6L', bottles: 8 },
  '9L': { label: '9L', bottles: 12 },
  '12L': { label: '12L', bottles: 16 },
  '15L': { label: '15L', bottles: 20 },
};

// Label for a size that isn't the standard 75cl bottle; null for a bottle,
// a glass, or an unknown size.
export function bottleFormatLabel(format: string | null | undefined): string | null {
  return (format && FORMATS[format]?.label) || null;
}

// How many 75cl bottles the size holds; 1 for a bottle or an unknown size.
export function bottlesIn(format: string | null | undefined): number {
  return (format && FORMATS[format]?.bottles) || 1;
}
