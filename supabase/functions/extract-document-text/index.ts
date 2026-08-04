// Extract plain text from an imported document for the Journal editor.
//
// Writing a long journal entry on a phone keyboard isn't practical, so the
// editor lets users IMPORT the body from a file and tweak it. This returns the
// readable text of that file:
//   • txt  — decoded directly (also handled client-side; kept here as a fallback)
//   • docx — the Word XML is unzipped and its text runs extracted
//   • pdf  — Claude reads the document and returns its text verbatim
//
// Dashboard paste-deploy. Needs ANTHROPIC_API_KEY (already set for the other
// Claude functions). No migration.

import Anthropic from 'npm:@anthropic-ai/sdk';
import JSZip from 'npm:jszip';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// base64 → bytes. Deno exposes atob globally.
function b64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/^data:[^,]+,/, '');
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Turn a Word document.xml into readable text: keep paragraph breaks (</w:p>),
// tabs and line breaks, take the text runs (<w:t>…</w:t>), drop everything else,
// and unescape the handful of XML entities Word emits.
function docxXmlToText(xml: string): string {
  return xml
    .replace(/<w:tab\b[^>]*\/?>/g, '\t')
    .replace(/<w:br\b[^>]*\/?>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g, (_m, t) => t)
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

Deno.serve(async (req) => {
  try {
    const { base64, kind } = await req.json().catch(() => ({}));
    if (typeof base64 !== 'string' || !base64) {
      return json({ error: 'base64 required' }, 400);
    }

    if (kind === 'txt') {
      return json({ text: new TextDecoder().decode(b64ToBytes(base64)) });
    }

    if (kind === 'docx') {
      const zip = await JSZip.loadAsync(b64ToBytes(base64));
      const file = zip.file('word/document.xml');
      if (!file) return json({ text: '' });
      const xml = await file.async('string');
      return json({ text: docxXmlToText(xml) });
    }

    if (kind === 'pdf') {
      const resp = await client.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 16000,
        system:
          'You extract the full readable text of a document verbatim. Return ONLY the document text, preserving paragraph breaks. Do not summarise, comment, translate, or add anything of your own.',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
              { type: 'text', text: 'Return the complete text of this document, verbatim.' },
            ] as any,
          },
        ],
      });
      const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
      return json({ text });
    }

    return json({ error: 'unknown kind' }, 400);
  } catch (err) {
    console.error('extract-document-text error:', err);
    return json({ error: err instanceof Error ? err.message : 'extraction failed' }, 500);
  }
});
