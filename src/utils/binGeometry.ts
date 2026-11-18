// The geometry of a diamond wine bin. A bin is a rectangular frame `across`
// diamonds wide and `down` diamonds tall, packed with an interlocking diamond
// tessellation: centres on a half-grid, every other row offset by half a cell.
// The frame clips the diamonds on its edges into half-diamond triangles (the
// four corner pieces are quarters, but are stored as triangles too). The create
// screen draws this, the bin screen lays its cells out on it, and createBin
// stores one cell per piece — so all three must come from here.

type Point = { x: number; y: number };
type Piece = Point & { corner: boolean };

// Every piece of the tessellation that shows inside the frame, in unit coords
// (one diamond = 1 across), in spatial order: whole diamonds in `full`, pieces
// cut by the frame in `clipped`. Stored cells follow this order — diamonds
// first, then triangles — so cell idx pairs 1:1 with these lists.
export function tessellate(across: number, down: number): { full: Piece[]; clipped: Piece[] } {
  const E = 1e-9;
  const full: Piece[] = [];
  const clipped: Piece[] = [];
  for (let jj = -1; jj <= down * 2 + 1; jj++) {
    const y = jj / 2;
    const offset = Math.abs(jj) % 2 === 0 ? 0 : 0.5;
    for (let x = offset - 1; x <= across + 1 + E; x += 1) {
      // Entirely outside the frame (at most touching it at a point).
      if (x + 0.5 <= E || x - 0.5 >= across - E || y + 0.5 <= E || y - 0.5 >= down - E) continue;
      const clipX = x - 0.5 < -E || x + 0.5 > across + E;
      const clipY = y - 0.5 < -E || y + 0.5 > down + E;
      (clipX || clipY ? clipped : full).push({ x, y, corner: clipX && clipY });
    }
  }
  return { full, clipped };
}

// Whole diamonds: the across × down grid plus the interleaved row between —
// (across-1) × (down-1) more. A 2×2 frame → 5 diamonds.
export function binDiamondCount(across: number, down: number): number {
  return across * down + Math.max(0, across - 1) * Math.max(0, down - 1);
}

// Pieces cut by the frame: 2 × (across+down), corners included. A 2×2 frame → 8.
export function binTriangleCount(across: number, down: number): number {
  return 2 * (across + down);
}

type BinCellSpec = { idx: number; kind: 'diamond' | 'triangle'; capacity: number };

// The cells createBin stores, in tessellation order: the diamonds, then the
// triangles, which hold half a diamond's bottles (rounded down, at least 1).
export function buildBinCells(across: number, down: number, diamondCapacity: number): BinCellSpec[] {
  const cells: BinCellSpec[] = [];
  const triCap = Math.max(1, Math.floor(diamondCapacity / 2));
  for (let i = 0; i < binDiamondCount(across, down); i++) cells.push({ idx: cells.length, kind: 'diamond', capacity: diamondCapacity });
  for (let i = 0; i < binTriangleCount(across, down); i++) cells.push({ idx: cells.length, kind: 'triangle', capacity: triCap });
  return cells;
}

// Total bottle capacity of a bin before it's created (the create-screen preview).
export function binTotalCapacity(across: number, down: number, diamondCapacity: number): number {
  return buildBinCells(across, down, diamondCapacity).reduce((sum, c) => sum + c.capacity, 0);
}

function rowLetters(i: number): string {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

// A name for every cubby so it can be found: rows are letters (top first),
// columns numbers (left first), read prefix + column + row — D2B is the diamond
// in column 2 of row B, HD3C a half diamond. Corner quarters get no name.
// Returned in tessellation order, so they pair 1:1 with the stored cells.
export function binCellLabels(across: number, down: number): { diamondLabels: (string | null)[]; triangleLabels: (string | null)[] } {
  const { full, clipped } = tessellate(across, down);
  const whole = new Set(full);
  const named = [...full, ...clipped].filter((p) => !p.corner);
  const ys = Array.from(new Set(named.map((p) => p.y))).sort((a, b) => a - b);
  const labelOf = new Map<Piece, string>();
  ys.forEach((y, row) => {
    named.filter((p) => p.y === y).sort((a, b) => a.x - b.x).forEach((p, col) => {
      labelOf.set(p, `${whole.has(p) ? 'D' : 'HD'}${col + 1}${rowLetters(row)}`);
    });
  });
  return {
    diamondLabels: full.map((p) => labelOf.get(p) ?? null),
    triangleLabels: clipped.map((p) => labelOf.get(p) ?? null),
  };
}

// The name of one stored cell (diamonds hold idx 0..D-1, triangles the rest).
export function binCellLabel(across: number, down: number, kind: 'diamond' | 'triangle', idx: number): string | null {
  const labels = binCellLabels(across, down);
  return kind === 'diamond'
    ? labels.diamondLabels[idx] ?? null
    : labels.triangleLabels[idx - binDiamondCount(across, down)] ?? null;
}
