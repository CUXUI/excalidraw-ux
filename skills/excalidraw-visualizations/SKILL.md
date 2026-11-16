---
name: excalidraw-visualizations
description: Genera diagramas, wireframes, flujos y mapas en estilo hand-drawn — como archivo .excalidraw nativo y editable, o como imagen PNG. Cubre wireframes, user flows, task flows, wireflows, sitemaps, diagramas de estado, journey maps, priority guides, críticas anotadas y matrices. Usar cuando se pide un diagrama, flujo, wireframe, sketch, boceto, mapa o esquema de algo, o cuando alguien dice "dibújame", "haz un diagrama de esto" o "en estilo excalidraw".
argument-hint: "[qué diagramar]"
---

Produce diagramas hechos a mano para trabajo de producto y UX. Dos salidas posibles: archivo `.excalidraw` nativo (editable, sin costo, sin IA) o imagen PNG generada por IA.

**Antes de dibujar nada, leer [casos-de-uso.md](casos-de-uso.md).** Ahí está qué tipo de diagrama corresponde a cada pedido y las reglas de cada uno. Un user flow y un task flow se parecen y no son lo mismo; un sitemap con flechas comunica algo falso. Esas reglas no son opinión: vienen de práctica establecida y romperlas cambia lo que el diagrama dice.

Para la paleta, tipografías y reglas de forma: [style-guide.md](style-guide.md).

## Paso 0 — Identificar el tipo

El pedido casi nunca viene con el nombre técnico. "Muéstrame cómo sería la app" puede ser un wireframe, un wireflow o un user flow, y son tres cosas distintas. Usar la tabla de decisión al final de `casos-de-uso.md` para resolverlo, y **decir cuál se eligió y por qué** al entregar — si estaba mal, se corrige rápido.

Si el pedido implica dos tipos a la vez (por ejemplo "el flujo y cómo se ve cada pantalla"), son dos diagramas, no uno mezclado. Ver la regla de escalera de fidelidad.

## Paso 1 — Elegir la salida

| Situación | Salida |
|---|---|
| Va a seguir editándose, iterándose o compartiéndose para editar | **`.excalidraw`** |
| Es un flujo, wireframe, sitemap, estado o matriz | **`.excalidraw`** |
| Necesita ilustración o íconos expresivos difíciles de armar con formas simples | **Imagen IA** |
| Va pegado directo en una presentación o documento, sin edición | **Imagen IA** |

Ante la duda, `.excalidraw`: no cuesta nada, es exacto porque se controla cada coordenada, y se puede seguir trabajando encima. La imagen por IA se reserva para cuando hace falta ilustración.

## Opción A — Archivo .excalidraw nativo

No se le pide a una IA que imite el estilo: se construyen los elementos reales de Excalidraw y el estilo hand-drawn lo pone el motor de la propia app. Es literalmente Excalidraw, no una imitación.

Dos módulos:

- **`scripts/excalidraw-builder.js`** — primitivas y estructura: `box`, `decision`, `text`, `line`, `frame`, layout (`rowX`, `colY`, `title`, `legend`, `bounds`), temas (`THEMES.light` / `THEMES.dark`), tipografías (`FONT.hand` / `FONT.mono`).
- **`scripts/ui-kit.js`** — piezas de wireframe: `screen`, `browser`, `navbar`, `button`, `input`, `toggle`, `listRow`, `imageBox`, `textLines`, `massBlock`, `note`, `check`, `cross`.

Los dos conectores, que significan cosas distintas (ver regla 1 de `casos-de-uso.md`):

- `connect(a, b, {label})` — flecha: secuencia, transición.
- `link(a, b)` — línea sin punta: contenencia, jerarquía.

Ambos dejan la flecha **anclada**: al mover una caja en Excalidraw, la línea la sigue. Cada función de `ui-kit` devuelve un array donde el `[0]` es el contenedor — ese es el que se pasa a `connect`/`link`.

```js
const B = require('./scripts/excalidraw-builder.js');
const UI = require('./scripts/ui-kit.js');
const T = B.THEMES.light;
const els = [];

const home = UI.screen({ x: 0, y: 0, name: 'Home', color: T.ink });
const cta = UI.button({ x: 40, y: 380, label: 'Empezar', state: 'primary', accent: T.ok });
const paso2 = UI.screen({ x: 420, y: 0, name: 'Datos', color: T.ink });

els.push(...home, ...cta, ...paso2);
els.push(...B.connect(cta[0], paso2[0], { label: 'Tocar', color: T.ink })); // desde el botón
els.push(B.title('Alta de cuenta', els, { color: T.ink }));

require('fs').writeFileSync(salida, JSON.stringify(B.document(els, { theme: 'light' }), null, 2));
```

**Verificar antes de entregar.** Abrir el archivo en excalidraw.com y mirarlo. Que el JSON se haya escrito sin error no significa que se vea bien: etiquetas desbordadas, cajas superpuestas y flechas cruzadas solo se ven mirando.

## Opción B — Imagen PNG por IA

Requiere una API key de [kie.ai](https://kie.ai) (modelo `nano-banana-2`). **Sin key, la Opción A funciona igual** — es la mitad del skill que no depende de ningún servicio.

Setup: copiar `.env.example` a `.env` y poner la key.

```bash
node scripts/generate-visual.js "<PROMPT>" "<salida.png>" "<aspect_ratio>"
```

El prompt se arma con el prefijo de estilo de `style-guide.md` + la descripción del diagrama, elemento por elemento, con posición y color explícitos. Nunca dejar el color a criterio del modelo.

Opcionalmente se puede pasar una imagen de referencia de estilo con `--input <ruta.png>`, que mejora bastante la fidelidad. El prefijo de estilo en texto está escrito para funcionar sin ella.

**Limitación conocida:** el modelo a veces rellena de color sólido los toggles y botones en estado activo aunque el prompt pida contorno sin relleno. Si eso molesta, usar la Opción A, donde el relleno se controla directamente.

**Notas de la API** (para no volver a descubrirlas):
- Subida de archivos: `https://kieai.redpandaai.co/api/file-stream-upload` — el host es distinto al de generación.
- Generación: `POST https://api.kie.ai/api/v1/jobs/createTask`, modelo `nano-banana-2`.
- Consulta: `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=…` hasta `state: "success"`; el resultado sale en `resultJson.resultUrls[0]` y **expira a las 24 h**, así que hay que descargarlo en el momento.

## Claro u oscuro

No hay un default único: depende de qué es.

- Wireframes de producto, flujos de pantallas, documentación técnica → **oscuro**.
- Diagramas conceptuales, material didáctico, algo que se va a imprimir o proyectar → **claro**.
- Si se pide un modo explícitamente, ese gana.

## Estructura

```
excalidraw-visualizations/
├── README.md           ← instalación y arranque rápido (para humanos)
├── SKILL.md            ← esto
├── casos-de-uso.md     ← qué diagrama corresponde y sus reglas (leer siempre)
├── style-guide.md      ← paleta, tipografías, formas, prefijo de estilo para IA
├── .env.example        ← plantilla de configuración (solo para modo IA)
├── scripts/
│   ├── excalidraw-builder.js   ← primitivas, conectores, layout
│   ├── ui-kit.js               ← componentes de wireframe
│   └── generate-visual.js      ← pipeline de imagen por IA
└── ejemplos/
    ├── muestrario.js           ← genera los 16 tipos (referencia de código)
    └── muestrario.excalidraw   ← el resultado, para abrir directo
```

Las salidas van donde tenga sentido en cada proyecto, con nombre `AAAA-MM-DD-descripcion.excalidraw` o `.png`.
