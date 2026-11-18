// A slot's position as one string key ("row,col"), for maps and sets of slots.
// The large-format band is row -1.
export function slotKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function parseSlotKey(key: string): { row: number; col: number } {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

// Walk a rack grid from (startRow, startCol) in the given orientation, skipping
// occupied slots ("row,col" keys), collecting up to `count` FREE positions.
// Vertical runs down a column then on to the next; Horizontal runs across a row
// then on to the next. The large-format band (row -1) stays on its own row, so
// a magnum never spills into the 75cl slots below.
export function freeSlotsFrom(
  startRow: number, startCol: number, rows: number, cols: number,
  count: number, orient: 'Vertical' | 'Horizontal',
  occupied: Set<string>, largeFormatCols?: number | null,
): Array<{ row: number; col: number }> {
  const result: Array<{ row: number; col: number }> = [];
  if (startRow === -1) {
    const lfCols = largeFormatCols ?? 0;
    for (let col = startCol; result.length < count && col < lfCols; col++) {
      if (!occupied.has(slotKey(-1, col))) result.push({ row: -1, col });
    }
    return result;
  }
  let row = startRow;
  let col = startCol;
  while (result.length < count && row >= 0 && row < rows && col >= 0 && col < cols) {
    if (!occupied.has(slotKey(row, col))) result.push({ row, col });
    if (orient === 'Horizontal') { col++; if (col >= cols) { col = 0; row++; } }
    else { row++; if (row >= rows) { row = 0; col++; } }
  }
  return result;
}
