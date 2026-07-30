// HTML port of the app's MarkdownLite renderer (src/components/MarkdownLite.tsx)
// so posts read identically in-app and on the web: ## / ### headings,
// > blockquotes, - / * bullet lists, blank-line paragraphs, **bold** / *italic*.
// Text is escaped before any markup is applied — posts are owner-authored, but
// escaping keeps stray < or & in copy from breaking the page.

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(text: string): string {
  return esc(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export function renderMarkdown(body: string): string {
  const lines = (body ?? '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(' '))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(`<ul>${list.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`);
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    if (/^###\s+/.test(line)) {
      flushPara();
      flushList();
      out.push(`<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      flushPara();
      flushList();
      out.push(`<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flushPara();
      flushList();
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return out.join('\n');
}
