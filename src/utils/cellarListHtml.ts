import type { CellarListLine } from '../components/CellarListShareCard';
import { wineHeaderLine } from './wineHeader';
import { VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../constants/share';

// Build a print-ready HTML document for the Full Cellar List (rendered to a PDF
// via expo-print). A PDF stays crisp and paginates however long the list is —
// unlike a single tall PNG, which scales down blurry when shared.

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildCellarListHtml(opts: {
  title: string;
  items: CellarListLine[];
  wineCount: number;
  bottleCount: number;
  filterSummary?: string | null;
}): string {
  const rows = opts.items.map((w) => {
    const identity = [wineHeaderLine(w.producer, w.wineName, null), w.region, w.vintage]
      .filter((p) => p && String(p).trim().length > 0)
      .join(' · ');
    return `<tr><td class="name">${esc(identity)}</td><td class="qty">${w.quantity} × ${esc(w.format)}</td></tr>`;
  }).join('');

  return `<!doctype html><html><head><meta charset="utf-8">
<style>
  @page { margin: 28px; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; margin: 0; background: #1E0F13; color: #F4EBE0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .wrap { border: 2px solid #E0B84A; border-radius: 16px; padding: 26px 30px; }
  .brand { text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #fff; }
  .tagline { text-align: center; font-style: italic; color: rgba(255,255,255,.7); font-size: 13px; margin-top: 4px; letter-spacing: 1px; }
  .hr { height: 1px; background: rgba(224,184,74,.55); margin: 16px 0; }
  .subhead { text-align: center; color: #E0B84A; text-transform: uppercase; letter-spacing: 4px; font-size: 19px; }
  .count { text-align: center; font-style: italic; color: rgba(255,255,255,.85); font-size: 14px; margin-top: 6px; }
  .filter { text-align: center; color: rgba(224,184,74,.85); text-transform: uppercase; letter-spacing: 1.5px; font-size: 12px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  td { padding: 8px 12px; border-bottom: 1px solid rgba(224,184,74,.25); vertical-align: top; }
  tr:last-child td { border-bottom: 0; }
  td.name { color: #fff; font-size: 13.5px; line-height: 1.35; }
  td.qty { color: #E0B84A; font-weight: bold; text-align: right; white-space: nowrap; font-size: 13px; }
  .footer { text-align: center; margin-top: 22px; }
  .footer .get { color: #E0B84A; font-weight: bold; letter-spacing: 3px; font-size: 14px; }
  .footer .cta { color: rgba(255,255,255,.7); font-style: italic; font-size: 13px; margin-top: 4px; }
</style></head><body>
  <div class="wrap">
    <div class="brand">VINSTER</div>
    <div class="tagline">Your AI Sommelier</div>
    <div class="hr"></div>
    <div class="subhead">${esc(opts.title)}</div>
    <div class="count">${opts.wineCount} ${opts.wineCount === 1 ? 'wine' : 'wines'} · ${opts.bottleCount} ${opts.bottleCount === 1 ? 'bottle' : 'bottles'}</div>
    ${opts.filterSummary ? `<div class="filter">${esc(opts.filterSummary)}</div>` : ''}
    <table>${rows}</table>
    <div class="footer"><div class="get">${esc(VINSTER_GET_LABEL)}</div><div class="cta">${esc(VINSTER_TAGLINE)}</div></div>
  </div>
</body></html>`;
}
