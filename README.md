# CTF Writeups · v4l3r14

Web estática (HTML + CSS + JS sin dependencias) para publicar mis writeups de ciberseguridad.
Tema pastel por defecto y modo **alto contraste** (botón arriba a la derecha; se recuerda la elección y se activa solo si el sistema pide más contraste).

## Estructura

```
index.html                 → portada (tarjetas + filtros, generados solos)
writeup.html               → plantilla única para TODOS los writeups (?w=<slug>)
writeups/
  index.json               → catálogo: metadatos de cada writeup y filtros
  <slug>.md                → contenido de cada writeup en Markdown
plantillas/
  plantilla-writeup.md     → punto de partida para un writeup nuevo
assets/css/
  tokens.css               → paletas (pastel + alto contraste) y fuentes ← cambia colores aquí
  base.css                 → reset y layout
  components.css           → header, chips, tarjetas, artículo, código
assets/js/
  theme.js                 → cambio de tema
  data.js                  → carga del catálogo + utilidades
  home.js                  → pinta la portada
  writeup.js               → pinta un writeup
  markdown.js              → conversor Markdown → HTML (escapa todo, seguro)
```

## Añadir un writeup nuevo (3 pasos)

1. Copia `plantillas/plantilla-writeup.md` a `writeups/<slug>.md` (p. ej. `writeups/dancing.md`) y escríbelo.
2. Añade una entrada en `writeups/index.json` dentro de `"writeups"`:

   ```json
   {
     "slug": "dancing",
     "titulo": "Dancing",
     "plataforma": "Hack The Box · Starting Point",
     "so": "Windows",
     "dificultad": "facil",
     "fecha": "2026-11-20",
     "color": "rose",
     "categorias": ["htb", "facil"],
     "tags": ["smb", "enumeración"],
     "resumen": "Una línea que describa el writeup."
   }
   ```

   | Campo | Valores |
   |---|---|
   | `dificultad` | `facil`, `media`, `dificil`, `insane` |
   | `color` (barra de la tarjeta) | `pink`, `lav`, `mint`, `rose`, `peach` |
   | `categorias` | ids de `"filtros"` (añade un filtro nuevo ahí si hace falta) |
   | `estado` | opcional: `"borrador"` → aparece como tarjeta "en progreso" sin enlace |

3. Commit y push. Listo: la tarjeta, el filtro y la página se generan solos.

Capturas: guárdalas en `img/<slug>/` y úsalas con `![descripción](img/<slug>/paso1.png)`.

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
