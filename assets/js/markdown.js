// markdown.js — small, SAFE Markdown renderer (no dependencies).
// Escapes all HTML first, so a writeup can never inject scripts.
// Supports: # headings, paragraphs, **bold**, *italic*, `code`, ```blocks```,
// lists (- / 1.), > quotes, --- rules, [links](https://…), ![img](path),
// and flags with ==text== → <span class="flag">.
// Inside code blocks, lines starting with "#" are styled as comments.

const esc = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Only allows https:, relative paths and anchors. Blocks javascript:, data:, http:
function safeUrl(url) {
  const u = url.trim();
  if (/^https:\/\//i.test(u)) return u;
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return null;   // any other scheme → rejected
  if (u.startsWith('//')) return null;
  return u;                                           // relative path or #anchor
}

function inline(text) {
  const codes = [];
  let s = esc(text).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = s
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
      const u = safeUrl(url.replace(/&amp;/g, '&'));
      return u ? `<img src="${esc(u)}" alt="${alt}" loading="lazy">` : alt;
    })
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      const u = safeUrl(url.replace(/&amp;/g, '&'));
      if (!u) return label;
      const ext = /^https:/i.test(u) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${esc(u)}"${ext}>${label}</a>`;
    })
    .replace(/==([^=]+)==/g, '<span class="flag">$1</span>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}

function codeBlock(lines) {
  const body = lines.map((l) => {
    const e = esc(l);
    return /^\s*#/.test(l) ? `<span class="c">${e}</span>` : e;
  }).join('\n');
  return `<pre><code>${body}</code></pre>`;
}

export function renderMarkdown(src) {
  const lines = src
    .replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')       // comments = private notes, not rendered
    .split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {                       // code block
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(codeBlock(buf));
      continue;
    }
    if (/^\s*$/.test(line)) { i++; continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {                                        // # → h2, ## → h3, ### → h4, #### → h5 (h1 is the page title)
      const md = h[1].length;                       // class md-h<n> = number of # → its own color
      out.push(`<h${md + 1} class="md-h${md}">${inline(h[2])}</h${md + 1}>`);
      i++; continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }

    const ul = /^\s*[-*+]\s+/, ol = /^\s*\d+[.)]\s+/;
    if (ul.test(line) || ol.test(line)) {
      const re = ul.test(line) ? ul : ol;
      const tag = re === ul ? 'ul' : 'ol';
      const items = [];
      while (i < lines.length && re.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(re, ''))}</li>`);
      out.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() !== '' &&
           !/^(```|#{1,4}\s|>|\s*[-*+]\s|\s*\d+[.)]\s|-{3,}\s*$)/.test(lines[i])) {
      buf.push(lines[i++]);
    }
    if (!buf.length) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}
