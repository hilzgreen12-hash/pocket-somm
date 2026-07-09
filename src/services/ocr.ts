import * as ImageManipulator from 'expo-image-manipulator';
import { z } from 'zod';
import { callOCR } from '../api/claude';
import type { ExtractedWine } from '../types/wine';

const ExtractedWineSchema = z.object({
  name: z.string(),
  producer: z.string().nullish().transform((v) => v ?? ''),
  region: z.string().nullish().transform((v) => v ?? ''),
  appellation: z.string().nullish(),
  grape: z.string().nullish(),
  vintage: z.number().nullable().catch(null),
  menuPrice: z.number().nullable().catch(null),
  currency: z.string().default('GBP'),
});

const OCRResponseSchema = z.object({
  wines: z.array(ExtractedWineSchema),
});

async function prepareImage(uri: string, source: 'camera' | 'upload' = 'camera'): Promise<string> {
  console.log('[OCR] Preparing image:', uri, 'source:', source);
  // Camera photos are huge (multi-MB) and often taken on cellular, so we keep
  // them at a small/cheap target (1280 / 0.72) so the heaviest payload in the
  // app survives a weak signal.
  //
  // Uploaded screenshots are the opposite: already compact, clean digital
  // images, usually picked over WiFi. Downscaling and hard-compressing them
  // (the old behaviour applied the SAME 1280 / 0.72 to everything) smears the
  // dense menu text and trips the OCR. So for uploads we keep far more detail —
  // a much gentler JPEG quality, only shrink when genuinely large, and NEVER
  // upscale (upscaling a screenshot then re-encoding softens the very text we
  // need read).
  const isUpload = source === 'upload';
  const maxWidth = isUpload ? 1600 : 1280;
  const quality = isUpload ? 0.9 : 0.72;

  // Probe the source width so uploads only resize DOWN. Camera photos always
  // exceed 1280, so they still resize as before. If the probe fails, fall back
  // to applying the cap so we never accidentally ship an enormous image.
  let needsResize = true;
  try {
    const probe = await ImageManipulator.manipulateAsync(uri, [], {});
    needsResize = probe.width > maxWidth;
  } catch {
    needsResize = true;
  }

  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    needsResize ? [{ resize: { width: maxWidth } }] : [],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  if (!manipulated.base64) throw new Error('Failed to encode image as base64');
  console.log('[OCR] Image prepared, base64 length:', manipulated.base64.length);
  return manipulated.base64;
}

export async function extractWineList(imageUri: string, opts?: { source?: 'camera' | 'upload' }): Promise<ExtractedWine[]> {
  console.log('[OCR] Starting extraction');
  const imageBase64 = await prepareImage(imageUri, opts?.source ?? 'camera');
  console.log('[OCR] Calling Edge Function');
  const raw = await callOCR(imageBase64);
  console.log('[OCR] Raw response:', JSON.stringify(raw).slice(0, 200));
  const parsed = OCRResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.error('[OCR] Parse error:', parsed.error.message);
    console.error('[OCR] Raw that failed:', JSON.stringify(raw));
    throw new Error(`Could not parse wine list from image. Please try a clearer photo.\n\nDetail: ${parsed.error.message}`);
  }
  console.log('[OCR] Wines found:', parsed.data.wines.length);
  return parsed.data.wines;
}

