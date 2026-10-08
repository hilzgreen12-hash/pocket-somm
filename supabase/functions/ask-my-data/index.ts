// Answer a user's question about their OWN Vinster records — reviews (with their
// scores, the restaurant and date) and restaurant visits. e.g. "which restaurant
// did I drink a Cornas in recently?", "what score did I give Château Latour 2003?".
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
    const { question } = await req.json().catch(() => ({}));
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
    const { data: reviews } = await db
      .from('chosen_wines')
      .select('producer, wine_name, vintage, region, user_score, review_score, restaurant_name, city, review_date, chosen_at, tasting_note')
      .order('chosen_at', { ascending: false })
      .limit(300);

    // Restaurant visits (even those without a written wine review).
    const { data: visits } = await db
      .from('scan_sessions')
      .select('restaurant_name, city, captured_at')
      .not('restaurant_name', 'is', null)
      .order('captured_at', { ascending: false })
      .limit(150);

    const reviewLines = (reviews ?? []).map((r: any) => {
      const wine = [r.producer, r.wine_name, r.vintage].filter(Boolean).join(' ');
      const score = r.user_score ?? r.review_score;
      const where = [r.restaurant_name, r.city].filter(Boolean).join(', ');
      const when = (r.review_date ?? r.chosen_at ?? '').slice(0, 10);
      return `- ${wine}${r.region ? ` (${r.region})` : ''}${score != null ? ` · my score ${score}` : ''}${where ? ` · at ${where}` : ''}${when ? ` · ${when}` : ''}`;
    });
    const visitLines = (visits ?? []).map((v: any) => `- ${[v.restaurant_name, v.city].filter(Boolean).join(', ')}${v.captured_at ? ` · ${String(v.captured_at).slice(0, 10)}` : ''}`);

    if (reviewLines.length === 0 && visitLines.length === 0) {
      return json({ answer: "I don't have any of your reviews or restaurant visits recorded yet, so there's nothing to look this up in." });
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const prompt = `Today is ${todayIso}. Answer the user's question using ONLY their own Vinster records below. Be specific and concise (1–3 sentences) — name the wine, the restaurant, the date and/or their score as relevant. If the records don't contain the answer, say so plainly ("I don't have a record of that"). Do not invent anything not in the data. When the user says "recently", prefer the most recent matching entry.

THEIR WINE REVIEWS (wine · region · my score · where · date):
${reviewLines.join('\n') || '(none)'}

THEIR RESTAURANT VISITS:
${visitLines.join('\n') || '(none)'}

QUESTION: ${question}

Answer:`;

    const resp = await client.messages.create({
      model: 'claude-sonnet-5-5',
      thinking: { type: 'between_tools' },
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    });
    const answer = (resp.content.find((b) => b.type === 'text') as { text?: string } | undefined)?.text?.trim() || null;
    return json({ answer: answer ?? "I couldn't work that out from your records." });
  } catch (err) {
    console.error('ask-my-data error:', err instanceof Error ? err.message : String(err));
    return json({ answer: null, error: 'Something went wrong. Please try again.' }, 500);
  }
});
