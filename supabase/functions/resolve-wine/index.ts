import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';
import { checkRateLimit } from '../_shared/rateLimit.ts';

// Live "which real wine did they mean?" lookup — the last resort before Vinster
// says it couldn't find a wine. Called only when Wine Intel's identity gate
// didn't recognise a name AND Wine-Searcher had no listing (typically a misheard
// or misread name: "Ebensady Palladiums" → Sadie Family Wines Palladius).
//
// Claude searches the WEB for the real wine. A result is accepted only when the
// model cites a page that the web search actually returned — so it can't answer
// from memory or invent a wine. Accepted wines are added to wines_catalog so the
// next lookup is instant (catalogue + sound-alike match, no web search).

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const HOURLY_LIMIT = 30;
const DAILY_LIMIT = 120;

function norm(s: string): string {
  return (s ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}

// Compare URLs loosely (no scheme, www, query, fragment or trailing slash).
const urlKey = (u: string) => u.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[?#].*$/, '').replace(/\/+$/, '');

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'resolve-wine', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const { producer, wineName, region, vintage } = await req.json().catch(() => ({}));
    const said = [producer, wineName].map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean).join(' ');
    if (said.length < 3) return json({ found: false });

    // Catalogue near-matches as hints (sound-alike), so the search starts warm.
    let hints: string[] = [];
    try {
      const { data } = await admin.rpc('catalog_sounds_like', { q: said, lim: 6 });
      hints = (Array.isArray(data) ? data : []).map((r: any) => [r.producer, r.wine_name, r.region ? `(${r.region})` : ''].filter(Boolean).join(' '));
    } catch { /* hints are optional */ }

    const prompt = `A user named a wine, but the name may be garbled — misheard by speech-to-text (words merged or split, sound-alike spellings), misread from a label, or mistyped.

What they gave: "${said}"${region ? `\nRegion they gave: "${region}"` : ''}${vintage ? `\nVintage: ${vintage}` : ''}
${hints.length ? `\nWines in our catalogue that sound similar (may or may not be it):\n${hints.map((h) => `- ${h}`).join('\n')}\n` : ''}
USE WEB SEARCH to find the REAL wine they most plausibly meant. A name may be the winemaker rather than the estate (e.g. "Eben Sadie" = Sadie Family Wines).

Accept a wine ONLY if BOTH are true:
1. A web page you found shows this exact producer makes this wine (cuvée).
2. It genuinely sounds/looks like what the user gave — not merely a famous wine from the same region.
If no real wine meets both, it is NOT found. Never guess, never answer from memory.

Return ONLY JSON (no prose):
{"found": true, "producer": "<correct producer name>", "wineName": "<cuvée, or null if the wine is the producer's eponymous wine>", "region": "<region / appellation>", "grape": "<grape or blend, or null>", "style": "Red"|"White"|"Rosé"|"Sparkling"|"Fortified"|null, "sourceUrl": "<URL of the page that confirms it>"}
or {"found": false}`;

    const resp: any = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 6000,
      thinking: { type: 'between_tools' } as any,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 4 }] as any,
      messages: [{ role: 'user', content: prompt }],
    });

    // URLs the web search really returned — the only acceptable evidence.
    const seen = new Set<string>();
    for (const b of resp.content ?? []) {
      if (b?.type === 'web_search_tool_result' && Array.isArray(b.content)) {
        for (const r of b.content) if (typeof r?.url === 'string') seen.add(urlKey(r.url));
      }
    }
    const text = (resp.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
    const m = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').match(/\{[\s\S]*\}/);
    if (!m) return json({ found: false });
    let out: any;
    try { out = JSON.parse(m[0]); } catch { return json({ found: false }); }

    const prod = str(out?.producer);
    const url = str(out?.sourceUrl);
    if (out?.found !== true || !prod || !url || !seen.has(urlKey(url))) {
      console.warn('resolve-wine: not found', JSON.stringify({ said, found: out?.found, url, cited: url ? seen.has(urlKey(url)) : false }));
      return json({ found: false });
    }

    const wine = {
      producer: prod,
      wineName: str(out.wineName),
      region: str(out.region),
      grape: str(out.grape),
      style: str(out.style),
    };

    // Add to the catalogue so the next lookup is instant. Best-effort.
    try {
      const key = wine.wineName ? `${norm(wine.producer)}|${norm(wine.wineName)}` : norm(wine.producer);
      const now = new Date().toISOString();
      await admin.from('wines_catalog').upsert({
        producer: wine.producer,
        wine_name: wine.wineName,
        region: wine.region,
        grape: wine.grape,
        style: wine.style,
        search_key: key,
        display: [wine.producer, wine.wineName].filter(Boolean).join(' '),
        source: 'web-lookup',
        verification_status: 'plausible',
        verified_source: 'web-search',
        verified_at: now,
        verification_notes: `web lookup from "${said}" · ${url}`.slice(0, 400),
      }, { onConflict: 'search_key', ignoreDuplicates: true });
    } catch (e) {
      console.error('resolve-wine: catalogue insert failed', e instanceof Error ? e.message : e);
    }

    return json({ found: true, ...wine, sourceUrl: url });
  } catch (err) {
    console.error('resolve-wine error:', err instanceof Error ? err.message : String(err));
    return json({ found: false });
  }
});
