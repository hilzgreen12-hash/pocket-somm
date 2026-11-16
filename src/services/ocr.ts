import * as ImageManipulator from 'expo-image-manipulator';

// Preparing wine-list photos for the scan.
//
// The phone only prepares the images; reading them happens on the server
// (scan-start → ocr). Each photo is resized, compressed and — when it's tall —
// cut into overlapping sections ("tiles"):
//
// - The reading model shrinks any image whose long side is much past ~1,500px,
//   so a tall camera photo (about 1280 × 2770) or a long scrolling screenshot
//   lost its small print. Tiles keep every section close to square, so the text
//   stays at full size.
// - Tiles overlap by ~12%, so every line of the list is whole in at least one
//   tile; the reader ignores lines cut off at a tile's edge, and the server
//   de-duplicates the wines seen in two tiles.

type Source = 'camera' | 'upload';

// Camera photos are large and often sent over mobile data, so they're kept
// lighter. Uploaded screenshots are already clean, compact images, so they keep
// more detail and are never scaled up (that softens the text).
const SETTINGS: Record<Source, { maxWidth: number; quality: number }> = {
  camera: { maxWidth: 1280, quality: 0.75 },
  upload: { maxWidth: 1600, quality: 0.9 },
};

const TILE_ASPECT = 1.15;   // target height ÷ width of each tile
const TILE_OVERLAP = 0.12;  // share of a tile repeated in the next one
const MAX_TILES = 4;        // per photo — a very long screenshot still gets 4 readable sections

// One photo → one or more base64 JPEG tiles, ready for scan-start.
export async function prepareScanTiles(uri: string, source: Source = 'camera'): Promise<string[]> {
  const { maxWidth, quality } = SETTINGS[source];
  const save = { compress: quality, format: ImageManipulator.SaveFormat.JPEG, base64: true } as const;

  // Size the photo: only ever scale DOWN, to the width limit.
  let width = 0;
  let height = 0;
  try {
    const probe = await ImageManipulator.manipulateAsync(uri, [], {});
    width = probe.width;
    height = probe.height;
  } catch { /* unknown size — resized to the limit below */ }
  const scale = width > maxWidth || !width ? maxWidth / (width || maxWidth) : 1;
  const w = Math.round((width || maxWidth) * scale);
  const h = Math.round((height || maxWidth) * scale);
  const resize = scale < 1 || !width ? [{ resize: { width: maxWidth } }] : [];

  const count = Math.min(MAX_TILES, Math.max(1, Math.ceil(h / w / TILE_ASPECT)));
  if (count === 1 || !width || !height) {
    const one = await ImageManipulator.manipulateAsync(uri, resize, save);
    if (!one.base64) throw new Error('Failed to encode image');
    return [one.base64];
  }

  // Resize once, then cut overlapping horizontal bands from the result.
  const sized = await ImageManipulator.manipulateAsync(uri, resize, { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
  const tileH = Math.min(sized.height, Math.round(sized.height / (count - (count - 1) * TILE_OVERLAP)));
  const step = (sized.height - tileH) / (count - 1);
  const tiles: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const originY = Math.round(i * step);
    const band = await ImageManipulator.manipulateAsync(
      sized.uri,
      [{ crop: { originX: 0, originY, width: sized.width, height: Math.min(tileH, sized.height - originY) } }],
      save,
    );
    if (band.base64) tiles.push(band.base64);
  }
  if (!tiles.length) throw new Error('Failed to encode image');
  return tiles;
}
