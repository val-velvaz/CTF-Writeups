# CTF Writeups · v4l3r14

A static site (HTML + CSS + JS, no dependencies) for publishing my cybersecurity writeups.
Available in English, Spanish and German. Pastel theme by default plus a **high-contrast** mode (top-right button; the choice is remembered, and it turns on automatically if the system asks for more contrast).

## Languages

The site is in **English (default)**, **Spanish** and **German**. The `EN · ES · DE` buttons in the header switch the language, and the choice is remembered.
You can also link to a language directly with `?lang=es` or `?lang=de`. Everything is static: every translation is written by hand.

- **Interface text** → `assets/i18n/en.json`, `es.json`, `de.json` (same keys in all three; a missing key falls back to English).
- **Catalog data** (`titulo`, `plataforma`, `so`, `tags`, `resumen`, and the filters' `label`) → either plain text or one object per language:
  `"titulo": { "en": "FTP → Web → SSH chain", "es": "Cadena FTP → Web → SSH", "de": "FTP → Web → SSH Kette" }`
- **Writeup content** → `writeups/<lang>/<slug>.md`. If a writeup doesn't exist in the selected language, another version is shown with a notice.

## Structure

```
index.html                 → home page (cards, search and filters, generated automatically)
writeup.html               → single template for ALL writeups (?w=<slug>)
writeups/
  index.json               → catalog: metadata for each writeup, plus the filters
  en/<slug>.md             → writeup in English
  es/<slug>.md             → writeup in Spanish
  de/<slug>.md             → writeup in German
plantillas/
  plantilla-writeup.md     → starting point for a new writeup
assets/i18n/
  en.json · es.json · de.json → interface text
assets/css/
  tokens.css               → palettes (pastel + high contrast) and fonts ← change colors here
  base.css                 → reset and layout
  components.css           → header, chips, cards, article, code
assets/js/
  i18n.js                  → languages (switcher, translations, fallback)
  theme.js                 → theme toggle
  data.js                  → catalog loading + helpers
  home.js                  → renders the home page
  writeup.js               → renders a writeup
  markdown.js              → Markdown → HTML converter (escapes everything, safe)
```

## Adding a new writeup

1. Copy `plantillas/plantilla-writeup.md` to `writeups/<lang>/<slug>.md` (e.g. `writeups/es/dancing.md`) and write it.
   When you translate it, create `writeups/en/dancing.md` and `writeups/de/dancing.md` with the same file name.
2. Add an entry to `writeups/index.json` inside `"writeups"`:

   ```json
   {
     "slug": "dancing",
     "idiomas": ["es", "en"],
     "titulo": "Dancing",
     "plataforma": "Hack The Box · Starting Point",
     "so": "Windows",
     "dificultad": "facil",
     "fecha": "2026-11-20",
     "color": "rose",
     "categorias": ["htb", "facil"],
     "tags": ["smb", { "en": "enumeration", "es": "enumeración", "de": "Enumeration" }],
     "resumen": { "en": "One line…", "es": "Una línea…", "de": "Eine Zeile…" }
   }
   ```

   | Field | Values |
   |---|---|
   | `slug` | lowercase letters, numbers and hyphens; the same in every language |
   | `idiomas` | languages the `.md` exists in (optional; avoids requesting translations that don't exist) — **update it when you add a translation** |
   | `dificultad` | `facil`, `media`, `dificil`, `insane` (the label is translated in `assets/i18n/*.json` → `difficulty`) |
   | `fecha` | date in `YYYY-MM-DD` format |
   | `color` (card bar) | `pink`, `lav`, `mint`, `rose`, `peach` |
   | `categorias` | ids from `"filtros"` (add a new filter there if needed) |
   | `estado` | optional: `"borrador"` (draft) → shown as an "in progress" card with no link |

3. Commit and push. Done: the card, filter, search entry and page are generated automatically.

Screenshots: store them in `img/<slug>/` and use them with `![description](img/<slug>/step1.png)` (they work for every language).

### Markdown syntax supported in writeups

`## Section`, `### Subsection`, `**bold**`, `*italic*`, `` `command` ``, fenced ```` ``` ```` code blocks (lines starting with `#` are highlighted as comments), `-` / `1.` lists, `>` quotes, `[link](https://…)`, `![image](path)`, and `==flag==` to highlight a flag. HTML comments `<!-- … -->` are hidden.

## Viewing locally

Writeups are loaded with `fetch`, so the folder has to be served (double-clicking the HTML file won't work):

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000`.

## Publishing with HTTPS (GitHub Pages)

Settings → Pages → *Deploy from a branch* → branch `main`, folder `/ (root)` → tick **Enforce HTTPS**.
The site will be available at `https://val-velvaz.github.io/CTF-Writeups/`.

Built-in security: a strict Content-Security-Policy (only first-party scripts, `upgrade-insecure-requests`),
external links limited to `https://` with `rel="noopener noreferrer"`, and Markdown is escaped before rendering.
