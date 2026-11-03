import { invokeResilient } from './invokeResilient';

// Server-side LLM correction of a speech-to-text transcript (wine/food/query
// vocabulary). Best-effort: on any failure it returns the input unchanged so the
// caller keeps the on-device dictionary result. Kept short-input only (the edge
// function ignores anything long) so a whole tasting note is never rewritten.
export async function correctVoiceTranscript(
  text: string,
  domain: 'wine' | 'food' | 'query' | 'note' = 'wine',
): Promise<string> {
  const input = (text ?? '').trim();
  if (!input) return text;
  try {
    const data = await invokeResilient('correct-voice', { text: input, domain }) as { text?: string };
    const out = (data?.text ?? '').trim();
    return out || text;
  } catch {
    return text;
  }
}
