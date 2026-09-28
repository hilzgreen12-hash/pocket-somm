import { Share } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { buildCellarListHtml } from './cellarListHtml';
import { shareResult, sharerNameFrom } from './shareCard';
import { wineHeaderLine } from './wineHeader';
import { bottleSizeLabel } from '../components/BottleSizePicker';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import type { CellarWine } from '../types/wine';

// Share a set of cellar wines as the branded Vinster PDF (with a plain-text
// fallback if printing/sharing isn't available). Extracted so both the Full
// Cellar List screen and the Cellar tab's "Export Cellar" can export in place
// without duplicating the PDF/share machinery.
export async function shareCellarListPdf(
  wines: CellarWine[],
  opts: { title: string; session: Session | null; filterSummary?: string | null },
): Promise<void> {
  const items = wines.map((w) => ({
    producer: w.producer,
    wineName: w.wine_name,
    region: w.region,
    vintage: w.vintage,
    quantity: w.quantity ?? 1,
    format: bottleSizeLabel(w.bottle_size_ml ?? 750),
  }));
  const totalBottles = items.reduce((s, w) => s + (w.quantity ?? 1), 0);
  try {
    // expo-print lazy-required for build safety (matches the list screen).
    const Print = require('expo-print');
    const { uri } = await Print.printToFileAsync({
      html: buildCellarListHtml({
        title: opts.title,
        items,
        wineCount: items.length,
        bottleCount: totalBottles,
        filterSummary: opts.filterSummary ?? null,
      }),
    });
    const name = sharerNameFrom(opts.session);
    await shareResult(uri, {
      sharerName: name,
      mimeType: 'application/pdf',
      message: `${name} has shared a cellar list with you: ${opts.title} (${items.length} ${items.length === 1 ? 'wine' : 'wines'} · ${totalBottles} ${totalBottles === 1 ? 'bottle' : 'bottles'})`,
    });
  } catch {
    const lines = items.map((w) => {
      const identity = [wineHeaderLine(w.producer, w.wineName, null), w.region, w.vintage]
        .filter((p) => p && String(p).trim().length > 0)
        .join(' · ');
      return `• ${identity} — ${w.quantity} × ${w.format}`;
    });
    await Share.share({
      message: `${opts.title} (${items.length} ${items.length === 1 ? 'wine' : 'wines'} · ${totalBottles} ${totalBottles === 1 ? 'bottle' : 'bottles'})\n\n${lines.join('\n')}${VINSTER_TEXT_SHARE_FOOTER}`,
      title: opts.title,
    });
  }
}
