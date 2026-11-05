// Answer a user's question about their OWN Vinster records — their written reviews
// (their score, restaurant, date), their CELLAR wines (critic score + any review
// score/note of their own, incl. archived), and restaurant visits. e.g. "which
// restaurant did I drink a Cornas in recently?", "what's my score for Latour 2005?".
//
// Retrieval is scoped to the caller via their JWT (RLS), so a user only ever sees
// their own data. We build a compact digest and let the model answer from it.

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  try {
    const { question, history, cellarOwnerId } = await req.json().catch(() => ({}));
    // Earlier turns of the same chat (follow-up questions refer back to them).
    const turns: { q: string; a: string }[] = Array.isArray(history)
      ? history.filter((t: any) => typeof t?.q === 'string' && typeof t?.a === 'string').slice(-6)
      : [];
    if (!question || !String(question).trim()) return json({ answer: null, error: 'question required' }, 400);

    // Scope all reads to the signed-in user via their bearer token (RLS).
    const authHeader = req.headers.get('Authorization') ?? '';
    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // Reviews the user has written (the richest source: wine identity + their
    // score + where/when they drank it). Most recent first, capped.
    // NB column names must match chosen_wines exactly — a wrong one (this used
    // to ask for review_score / review_date) fails the WHOLE query silently and
    // the model then sees no reviews at all.
    const { data: reviews, error: reviewsErr } = await db
      .from('chosen_wines')
      .select('producer, wine_name, vintage, region, appellation, grape, style, user_score, restaurant_name, city, reviewed_at, chosen_at, wishlist, review_dismissed')
      .order('chosen_at', { ascending: false })
      .limit(300);
    if (reviewsErr) console.error('ask-my-data reviews query failed:', reviewsErr.message);

    // Restaurant visits (even those without a written wine review).
    const { data: visits, error: visitsErr } = await db
      .from('scan_sessions')
      .select('restaurant_name, city, captured_at')
      .not('restaurant_name', 'is', null)
      .order('captured_at', { ascending: false })
      .limit(150);
    if (visitsErr) console.error('ask-my-data visits query failed:', visitsErr.message);

    // The user's CELLAR — each wine row carries the critic score AND the user's
    // own review score/note, so "what's my score for X" must look here too, not
    // only in written reviews. Includes archived bottles.
    const { data: cellar, error: cellarErr } = await db
      .from('cellar_wines')
      .select('producer, wine_name, vintage, region, grape_variety, style, critic_score, review_score, review_note, quantity, archived_at, is_wishlist')
      // Shared cellars: only the cellar selected in the app (plus the user's own
      // wishlist — RLS already hides anyone else's). Older apps send nothing.
      .or(typeof cellarOwnerId === 'string' && /^[0-9a-f-]{36}$/i.test(cellarOwnerId)
        ? `user_id.eq.${cellarOwnerId},is_wishlist.eq.true`
        : 'id.not.is.null')
      .order('created_at', { ascending: false })
      .limit(400);
    if (cellarErr) console.error('ask-my-data cellar query failed:', cellarErr.message);

    const reviewLines = (reviews ?? []).filter((r: any) => !r.wishlist && !r.review_dismissed).map((r: any) => {
      const wine = [r.producer, r.wine_name, r.vintage].filter(Boolean).join(' ');
      const score = r.user_score;
      const where = [r.restaurant_name, r.city].filter(Boolean).join(', ');
      const when = String(r.reviewed_at ?? r.chosen_at ?? '').slice(0, 10);
      const place = [r.appellation, r.region].filter(Boolean).join(', ');
      const kind = [r.style, r.grape].filter(Boolean).join(', ');
      return `- ${wine}${place ? ` (${place})` : ''}${kind ? ` [${kind}]` : ''}${score != null ? ` · my score ${score}` : ''}${where ? ` · at ${where}` : ''}${when ? ` · ${when}` : ''}`;
    });
    const visitLines = (visits ?? []).map((v: any) => `- ${[v.restaurant_name, v.city].filter(Boolean).join(', ')}${v.captured_at ? ` · ${String(v.captured_at).slice(0, 10)}` : ''}`);

    const cellarLines = (cellar ?? []).map((c: any) => {
      const wine = [c.producer, c.wine_name, c.vintage].filter(Boolean).join(' ');
      const mine = c.review_score != null ? ` · my review score ${c.review_score}` : '';
      const critic = c.critic_score != null ? ` · critic score ${c.critic_score}` : '';
      const note = c.review_note ? ` · my note: ${String(c.review_note).slice(0, 120)}` : '';
      const kind = [c.style, c.grape_variety].filter(Boolean).join(', ');
      const status = c.archived_at ? ' · (archived)' : c.is_wishlist ? ' · (wishlist — not owned)' : '';
      return `- ${wine}${c.region ? ` (${c.region})` : ''}${kind ? ` [${kind}]` : ''}${mine}${critic}${note}${status}`;
    });

    if (reviewLines.length === 0 && visitLines.length === 0 && cellarLines.length === 0) {
      return json({ answer: "I don't have any of your reviews, cellar wines or restaurant visits recorded yet, so there's nothing to look this up in." });
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const prompt = `Today is ${todayIso}. Answer the user's question using ONLY their own Vinster records below. Be specific and concise (1–3 sentences) — name the wine, the restaurant, the date and/or the score as relevant. If the records don't contain the answer, say so plainly ("I don't have a record of that"). Do not invent anything not in the data. When the user says "recently", prefer the most recent matching entry.

USE YOUR WINE KNOWLEDGE TO MATCH (the records often name only an appellation): a question about a region, country, colour, grape or style matches every record that belongs to it — e.g. "a red Rhône" includes Cornas, Hermitage, Côte-Rôtie, Crozes-Hermitage, Saint-Joseph, Châteauneuf-du-Pape, Gigondas; "Burgundy" includes Gevrey-Chambertin, Meursault, Chablis; "a Syrah" includes Cornas and Hermitage; "Italian" includes Barolo and Brunello. Never say there's no record just because the exact word isn't printed in it.
THE QUESTION WAS SPOKEN: wine words may be misheard by sound — read them as the wine term they sound like ("Roan" = Rhône, "Shablee" = Chablis, "corn ass" = Cornas, "Bar a low" = Barolo). Never repeat the misheard spelling back to the user; use the correct wine term.

A wine can appear in their written REVIEWS and/or in their CELLAR — always check BOTH before concluding anything. When the user asks what THEIR score is (or what they gave) for a specific wine:
- If a review score for that wine is in the records, state it (you may add the critic score for context).
- If the wine IS in their cellar/reviews but has no review score of their own, reply exactly: "Sorry but it appears that this wine hasn't been reviewed by you yet." If that wine has a critic score, you may append " Its critic score is N." (with the number).
- If the wine is NOT found in their cellar or reviews at all, reply exactly: "Sorry but I can't find this wine in your cellar."
For any other question not about a wine's score, if the records don't contain the answer, say "I don't have a record of that."

THEIR WINE REVIEWS (wine · region · my score · where · date):
${reviewLines.join('\n') || '(none)'}

THEIR CELLAR (wine · region · my review score · critic score · my note · status):
${cellarLines.join('\n') || '(none)'}

THEIR RESTAURANT VISITS:
${visitLines.join('\n') || '(none)'}

${turns.length ? `EARLIER IN THIS CHAT (the new question may refer back to these):\n${turns.map((t) => `Q: ${t.q}\nA: ${t.a}`).join('\n')}\n\n` : ''}ONLINE: you may use web search ONLY when the question needs something that isn't in their records (e.g. a restaurant's website, opening hours or address, or general facts about a wine). Their own scores, dates and where they drank it always come from the records above. When you give a link, it MUST be a URL the search actually returned — prefer the restaurant's or producer's official site; if the search shows a restaurant has closed, say so. Never invent a URL, address, phone number or fact. Write any link as the bare URL.

QUESTION: ${question}

Answer:`;

    const resp: any = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 2000,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 3 }] as any,
      messages: [{ role: 'user', content: prompt }],
    });
    // Only links the web search actually returned may reach the user.
    const seen = new Set<string>();
    const key = (u: string) => u.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[?#].*$/, '').replace(/\/+$/, '');
    for (const b of resp.content ?? []) {
      if (b?.type === 'web_search_tool_result' && Array.isArray(b.content)) for (const r of b.content) if (typeof r?.url === 'string') seen.add(key(r.url));
    }
    // Text written before/between searches is narration ("Let me look that up"):
    // keep only what follows the last search result.
    const blocks: any[] = resp.content ?? [];
    let lastTool = -1;
    blocks.forEach((b, i) => { if (b?.type === 'web_search_tool_result' || b?.type === 'server_tool_use') lastTool = i; });
    let answer: string | null = blocks.slice(lastTool + 1).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim() || null;
    if (answer) {
      answer = answer.replace(/https?:\/\/[^\s)\]]+/g, (u: string) => (seen.has(key(u.replace(/[.,;:]+$/, ''))) ? u : '')).replace(/\(\s*\)/g, '').replace(/[ \t]{2,}/g, ' ').trim();
    }
    return json({ answer: answer ?? "I couldn't work that out from your records." });
  } catch (err) {
    console.error('ask-my-data error:', err instanceof Error ? err.message : String(err));
    return json({ answer: null, error: 'Something went wrong. Please try again.' }, 500);
  }
});
