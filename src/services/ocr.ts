import * as ImageManipulator from 'expo-image-manipulator';
import { z } from 'zod';
import { callOCR } from '../api/claude';
import type { ExtractedWine } from '../types/wine';

const ExtractedWineSchema = z.object({
  name: z.string(),
  producer: z.string(),
  region: z.string(),
  appellation: z.string().nullish(),
  grape: z.string().nullish(),
  vintage: z.number().nullable(),
  menuPrice: z.number().nullable(),
  currency: z.string().default('GBP'),
});

const OCRResponseSchema = z.object({
  wines: z.array(ExtractedWineSchema),
});

async function prepareImage(uri: string): Promise<string> {
  console.log('[OCR] Preparing image:', uri);
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1600 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  if (!manipulated.base64) throw new Error('Failed to encode image as base64');
  console.log('[OCR] Image prepared, base64 length:', manipulated.base64.length);
  return manipulated.base64;
}

export async function extractWineList(imageUri: string): Promise<ExtractedWine[]> {
  console.log('[OCR] Starting extraction');
  const imageBase64 = await prepareImage(imageUri);
  console.log('[OCR] Calling Edge Function');
  const raw = await callOCR(imageBase64);
  console.log('[OCR] Raw response:', JSON.stringify(raw).slice(0, 200));
  const parsed = OCRResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.error('[OCR] Parse error:', parsed.error.message);
    throw new Error('Could not parse wine list from image. Please try a clearer photo.');
  }
  console.log('[OCR] Wines found:', parsed.data.wines.length);
  return parsed.data.wines;
}

