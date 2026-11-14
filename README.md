# CTF Writeups · v4l3r14

Web estática (HTML + CSS + JS sin dependencias) para publicar mis writeups de ciberseguridad.
Disponible en inglés, español y alemán. Tema pastel por defecto y modo **alto contraste** (botón arriba a la derecha; se recuerda la elección y se activa solo si el sistema pide más contraste).

## Idiomas

La web está en **inglés (por defecto)**, **español** y **alemán**; los botones `EN · ES · DE` del header cambian el idioma y la elección se recuerda.
También se puede enlazar directamente con `?lang=es` o `?lang=de`. Todo es estático: tú escribes cada traducción.

- **Textos de la interfaz** → `assets/i18n/en.json`, `es.json`, `de.json` (mismas claves en los tres; si falta una clave se usa la inglesa).
- **Datos del catálogo** (`titulo`, `plataforma`, `so`, `tags`, `resumen`, `label` de los filtros) → pueden ser texto normal o un objeto por idioma:
  `"titulo": { "en": "FTP → Web → SSH chain", "es": "Cadena FTP → Web → SSH", "de": "FTP → Web → SSH Kette" }`
- **Contenido de cada writeup** → `writeups/<idioma>/<slug>.md`. Si un writeup no existe en el idioma elegido, se muestra otra versión con un aviso.

## Estructura

```
index.html                 → portada (tarjetas, buscador y filtros, generados solos)
writeup.html               → plantilla única para TODOS los writeups (?w=<slug>)
writeups/
  index.json               → catálogo: metadatos de cada writeup y filtros
  en/<slug>.md             → writeup en inglés
  es/<slug>.md             → writeup en español
  de/<slug>.md             → writeup en alemán
plantillas/
  plantilla-writeup.md     → punto de partida para un writeup nuevo
assets/i18n/
  en.json · es.json · de.json → textos de la interfaz
assets/css/
  tokens.css               → paletas (pastel + alto contraste) y fuentes ← cambia colores aquí
  base.css                 → reset y layout
  components.css           → header, chips, tarjetas, artículo, código
assets/js/
  i18n.js                  → idiomas (selector, traducciones, respaldo)
  theme.js                 → cambio de tema
  data.js                  → carga del catálogo + utilidades
  home.js                  → pinta la portada
  writeup.js               → pinta un writeup
  markdown.js              → conversor Markdown → HTML (escapa todo, seguro)
```

## Añadir un writeup nuevo

1. Copia `plantillas/plantilla-writeup.md` a `writeups/<idioma>/<slug>.md` (p. ej. `writeups/es/dancing.md`) y escríbelo.
   Cuando lo traduzcas, crea `writeups/en/dancing.md` y `writeups/de/dancing.md` con el mismo nombre.
2. Añade una entrada en `writeups/index.json` dentro de `"writeups"`:

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

   | Campo | Valores |
   |---|---|
   | `idiomas` | idiomas en los que existe el `.md` (opcional, evita peticiones a traducciones que no existen) — **actualízalo al traducir** |
   | `dificultad` | `facil`, `media`, `dificil`, `insane` (su texto se traduce en `assets/i18n/*.json` → `difficulty`) |
   | `color` (barra de la tarjeta) | `pink`, `lav`, `mint`, `rose`, `peach` |
   | `categorias` | ids de `"filtros"` (añade un filtro nuevo ahí si hace falta) |
   | `estado` | opcional: `"borrador"` → aparece como tarjeta "en progreso" sin enlace |

3. Commit y push. Listo: la tarjeta, el filtro, la búsqueda y la página se generan solos.

Capturas: guárdalas en `img/<slug>/` y úsalas con `![descripción](img/<slug>/paso1.png)` (sirven para todos los idiomas).

## Ver en local

Los writeups se cargan con `fetch`, así que hay que servir la carpeta (abrir el HTML con doble clic no funciona):

```bash
python3 -m http.server 8000
```

y abre `http://localhost:8000`.

## Publicar con HTTPS (GitHub Pages)

Settings → Pages → *Deploy from a branch* → rama `main`, carpeta `/ (root)` → marca **Enforce HTTPS**.
La web queda en `https://val-velvaz.github.io/CTF-Writeups/`.

Seguridad incluida: Content-Security-Policy estricta (solo scripts propios, `upgrade-insecure-requests`),
enlaces externos solo `https://` con `rel="noopener noreferrer"`, y el Markdown se escapa antes de renderizarse.
