// excalidraw-builder — construye archivos .excalidraw nativos y editables.
//
// No genera imágenes: genera los elementos reales de Excalidraw, así que el
// resultado se abre en la app y se sigue editando. El estilo hand-drawn lo
// pone el motor de Excalidraw, no una IA.
//
// Ver ../style-guide.md para la paleta y las reglas de forma.
'use strict';

// ---------------------------------------------------------------- constantes

const FONT = {
  hand: 1, // Excalifont/Virgil — títulos, anotaciones, etiquetas de flujo
  normal: 2, // Nunito — evitar salvo pedido explícito
  mono: 3, // Cascadia — contenido DENTRO de una pantalla o wireframe
};

const THEMES = {
  light: {
    background: '#ffffff',
    ink: '#1e1e1e',
    muted: '#868e96',
    ok: '#2f9e44',
    alert: '#e8590c',
    group: '#6741d9',
    massing: '#ced4da',
  },
  dark: {
    background: '#0d0d0d',
    ink: '#e9ecef',
    muted: '#868e96',
    ok: '#40c057',
    alert: '#ff8787',
    group: '#b197fc',
    massing: '#343a40',
  },
};

// Anchos de caracter aproximados, como fracción del fontSize. Excalidraw
// recalcula el layout del texto ligado al abrir, pero estos valores evitan que
// una etiqueta larga nazca desbordada.
const CHAR_RATIO = { [FONT.hand]: 0.53, [FONT.normal]: 0.5, [FONT.mono]: 0.6 };

let seq = 0;

function uid(prefix = 'el') {
  seq += 1;
  return `${prefix}-${seq.toString(36)}-${(seq * 2654435761 % 100000).toString(36)}`;
}

// Determinista a propósito: dos corridas con la misma entrada dan el mismo
// archivo, así los diffs en git son legibles.
function pseudoSeed() {
  seq += 1;
  return (seq * 1103515245 + 12345) % 2147483647;
}

function base(overrides) {
  return {
    angle: 0,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: pseudoSeed(),
    version: 1,
    versionNonce: pseudoSeed(),
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    strokeWidth: 1,
    strokeStyle: 'solid',
    fillStyle: 'solid',
    roughness: 1,
    opacity: 100,
    backgroundColor: 'transparent',
    ...overrides,
  };
}

// ------------------------------------------------------------------- texto

function textWidth(str, fontSize, fontFamily) {
  const longest = String(str).split('\n').reduce((a, l) => Math.max(a, l.length), 0);
  return Math.ceil(longest * fontSize * (CHAR_RATIO[fontFamily] || 0.53));
}

function textHeight(str, fontSize) {
  return Math.ceil(String(str).split('\n').length * fontSize * 1.25);
}

/** Texto suelto (no ligado a una forma). */
function text(opts) {
  const {
    x, y, text: content, size = 20, color = '#1e1e1e',
    font = FONT.hand, align = 'left', width, height, id,
  } = opts;
  return base({
    id: id || uid('txt'),
    type: 'text',
    x,
    y,
    width: width ?? textWidth(content, size, font),
    height: height ?? textHeight(content, size),
    strokeColor: color,
    text: content,
    originalText: content,
    fontSize: size,
    fontFamily: font,
    textAlign: align,
    verticalAlign: 'top',
    containerId: null,
    lineHeight: 1.25,
  });
}

/** Texto ligado a una forma: al mover la forma, el texto la sigue. */
function boundText(container, content, { size = 18, color, font = FONT.hand } = {}) {
  const id = uid('txt');
  container.boundElements = [...(container.boundElements || []), { type: 'text', id }];
  const h = textHeight(content, size);
  return base({
    id,
    type: 'text',
    x: container.x + 8,
    y: container.y + container.height / 2 - h / 2,
    width: Math.max(container.width - 16, 20),
    height: h,
    strokeColor: color || container.strokeColor,
    text: content,
    originalText: content,
    fontSize: size,
    fontFamily: font,
    textAlign: 'center',
    verticalAlign: 'middle',
    containerId: container.id,
    lineHeight: 1.25,
  });
}

// ------------------------------------------------------------------ formas

function shape(type, opts) {
  const {
    x, y, w, h, color = '#1e1e1e', fill = 'transparent',
    rounded = true, dashed = false, id, strokeWidth = 1,
  } = opts;
  return base({
    id: id || uid(type.slice(0, 3)),
    type,
    x,
    y,
    width: w,
    height: h,
    strokeColor: color,
    backgroundColor: fill,
    fillStyle: 'solid',
    strokeWidth,
    strokeStyle: dashed ? 'dashed' : 'solid',
    roundness: type === 'diamond' ? { type: 2 } : rounded ? { type: 3 } : null,
  });
}

const rect = (o) => shape('rectangle', o);
const diamond = (o) => shape('diamond', { ...o, rounded: false });
const ellipse = (o) => shape('ellipse', { ...o, rounded: false });

/** Caja con etiqueta ligada. Devuelve [forma, texto]; la forma es [0]. */
function box(opts) {
  const { label, labelSize = 18, labelFont = FONT.hand, labelColor, ...rest } = opts;
  const el = rect(rest);
  if (!label) return [el];
  return [el, boundText(el, label, { size: labelSize, font: labelFont, color: labelColor })];
}

function decision(opts) {
  const { label, labelSize = 16, ...rest } = opts;
  const el = diamond(rest);
  if (!label) return [el];
  return [el, boundText(el, label, { size: labelSize })];
}

/** Polilínea libre — para checks, tildes, íconos simples. */
function line(opts) {
  const { x, y, points, color = '#1e1e1e', strokeWidth = 1, id } = opts;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return base({
    id: id || uid('lin'),
    type: 'line',
    x,
    y,
    width: Math.max(...xs) - Math.min(...xs) || 1,
    height: Math.max(...ys) - Math.min(...ys) || 1,
    strokeColor: color,
    strokeWidth,
    points,
    lastCommittedPoint: null,
  });
}

// ----------------------------------------------------------------- flechas

function edgeAnchor(el, side) {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  switch (side) {
    case 'right': return [el.x + el.width, cy];
    case 'left': return [el.x, cy];
    case 'top': return [cx, el.y];
    case 'bottom': return [cx, el.y + el.height];
    default: return [cx, cy];
  }
}

function autoSides(from, to) {
  const dx = (to.x + to.width / 2) - (from.x + from.width / 2);
  const dy = (to.y + to.height / 2) - (from.y + from.height / 2);
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? ['right', 'left'] : ['left', 'right'];
  }
  return dy > 0 ? ['bottom', 'top'] : ['top', 'bottom'];
}

/**
 * Flecha ANCLADA entre dos formas. Al mover una caja en Excalidraw, la flecha
 * la sigue — esto es lo que diferencia un diagrama editable de uno decorativo.
 * Devuelve [flecha] o [flecha, etiqueta].
 */
function connect(from, to, opts = {}) {
  const {
    label, color = '#1e1e1e', dashed = false, labelSize = 14,
    gap = 6, from: fromSide, to: toSide,
  } = opts;
  const [sideA, sideB] = fromSide && toSide ? [fromSide, toSide] : autoSides(from, to);
  const [sx, sy] = edgeAnchor(from, sideA);
  const [ex, ey] = edgeAnchor(to, sideB);

  const id = uid('arr');
  const arrow = base({
    id,
    type: 'arrow',
    x: sx,
    y: sy,
    width: Math.abs(ex - sx) || 1,
    height: Math.abs(ey - sy) || 1,
    strokeColor: color,
    strokeStyle: dashed ? 'dashed' : 'solid',
    points: [[0, 0], [ex - sx, ey - sy]],
    lastCommittedPoint: null,
    startBinding: { elementId: from.id, focus: 0, gap },
    endBinding: { elementId: to.id, focus: 0, gap },
    startArrowhead: null,
    endArrowhead: 'triangle',
    elbowed: false,
  });

  from.boundElements = [...(from.boundElements || []), { type: 'arrow', id }];
  to.boundElements = [...(to.boundElements || []), { type: 'arrow', id }];

  if (!label) return [arrow];

  // La etiqueta de flecha va suelta, no ligada: ligada, Excalidraw la centra
  // sobre la línea y tapa el trazo.
  const lbl = text({
    x: (sx + ex) / 2 - textWidth(label, labelSize, FONT.hand) / 2,
    y: (sy + ey) / 2 - labelSize * 1.6,
    text: label,
    size: labelSize,
    color,
    align: 'center',
  });
  return [arrow, lbl];
}

// ------------------------------------------------------------------ frames

/**
 * Enlace SIN punta de flecha — significa CONTENENCIA / jerarquía, no secuencia.
 * Regla dura: sitemaps, árboles de IA, mapas mentales y organigramas usan esto.
 * Una punta de flecha ahí significaría "el usuario va de A a B", que es falso:
 * significa "B está dentro de A".
 */
function link(from, to, opts = {}) {
  const { color = '#1e1e1e', gap = 6, from: fromSide, to: toSide } = opts;
  const [sideA, sideB] = fromSide && toSide ? [fromSide, toSide] : autoSides(from, to);
  const [sx, sy] = edgeAnchor(from, sideA);
  const [ex, ey] = edgeAnchor(to, sideB);
  const id = uid('lnk');
  const el = base({
    id,
    type: 'arrow',
    x: sx,
    y: sy,
    width: Math.abs(ex - sx) || 1,
    height: Math.abs(ey - sy) || 1,
    strokeColor: color,
    points: [[0, 0], [ex - sx, ey - sy]],
    lastCommittedPoint: null,
    startBinding: { elementId: from.id, focus: 0, gap },
    endBinding: { elementId: to.id, focus: 0, gap },
    startArrowhead: null,
    endArrowhead: null, // <- la diferencia semántica
    elbowed: false,
  });
  from.boundElements = [...(from.boundElements || []), { type: 'arrow', id }];
  to.boundElements = [...(to.boundElements || []), { type: 'arrow', id }];
  return [el];
}

/**
 * Frame de Excalidraw: agrupa elementos en una región nombrada del canvas.
 * Clave para canvases con muchas pantallas — cada frame se puede exportar solo.
 */
function frame(opts) {
  const { x, y, w, h, name, children = [] } = opts;
  const id = uid('frm');
  children.forEach((el) => { el.frameId = id; });
  return base({
    id,
    type: 'frame',
    x,
    y,
    width: w,
    height: h,
    name: name || null,
    strokeColor: '#bbb',
    backgroundColor: 'transparent',
    roundness: null,
    children: children.map((el) => el.id),
  });
}

// ------------------------------------------------------------------ layout

/** Posiciones X para n items en fila, con separación fija. */
function rowX(startX, count, itemWidth, gap = 80) {
  return Array.from({ length: count }, (_, i) => startX + i * (itemWidth + gap));
}

/** Posiciones Y para n items en columna. */
function colY(startY, count, itemHeight, gap = 60) {
  return Array.from({ length: count }, (_, i) => startY + i * (itemHeight + gap));
}

/**
 * Bounding box real de un conjunto de elementos.
 *
 * Ojo con flechas y líneas: su `width`/`height` son magnitudes absolutas, pero
 * los puntos pueden ir en negativo (una flecha hacia arriba o hacia la
 * izquierda). Usar x+width para esos casos da un recuadro corrido. Por eso acá
 * se recorren los puntos en vez de confiar en width/height.
 */
function extent(e) {
  if (Array.isArray(e.points) && e.points.length) {
    const xs = e.points.map((p) => e.x + p[0]);
    const ys = e.points.map((p) => e.y + p[1]);
    return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
  }
  return { x1: e.x, y1: e.y, x2: e.x + (e.width || 0), y2: e.y + (e.height || 0) };
}

function bounds(elements) {
  const els = elements.flat().filter((e) => e && typeof e.x === 'number');
  if (!els.length) return { x: 0, y: 0, width: 0, height: 0 };
  const ex = els.map(extent);
  const minX = Math.min(...ex.map((e) => e.x1));
  const minY = Math.min(...ex.map((e) => e.y1));
  const maxX = Math.max(...ex.map((e) => e.x2));
  const maxY = Math.max(...ex.map((e) => e.y2));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Mueve un conjunto de elementos. Solo toca `x`/`y`: los `points` de flechas y
 * líneas son relativos al elemento, así que se trasladan solos.
 *
 * Sirve para el patrón "armar cada bloque en el origen, medirlo, y recién
 * después ubicarlo" — mucho más robusto que calcular coordenadas absolutas a
 * mano, que es de donde salen las secciones que se pisan.
 */
function translate(elements, dx, dy) {
  elements.flat().filter(Boolean).forEach((e) => {
    if (typeof e.x === 'number') { e.x += dx; e.y += dy; }
  });
  return elements;
}

/**
 * Acomoda bloques ya construidos en filas, sin que se pisen. Cada bloque es un
 * array de elementos; se los traslada in-place y se devuelve el alto total.
 */
function packRows(bloques, { x = 0, y = 0, maxWidth = 3200, gap = 120 } = {}) {
  let cx = x;
  let cy = y;
  let altoFila = 0;
  bloques.forEach((bloque) => {
    const b = bounds(bloque);
    if (cx !== x && cx + b.width > x + maxWidth) {
      cx = x;
      cy += altoFila + gap;
      altoFila = 0;
    }
    translate(bloque, cx - b.x, cy - b.y);
    cx += b.width + gap;
    altoFila = Math.max(altoFila, b.height);
  });
  return cy + altoFila - y;
}

/** Título centrado sobre el contenido ya posicionado. */
function title(content, elements, { size = 36, color = '#1e1e1e', offset = 70 } = {}) {
  const b = bounds(elements);
  const w = textWidth(content, size, FONT.hand);
  return text({
    x: b.x + b.width / 2 - w / 2,
    y: b.y - offset,
    text: content,
    size,
    color,
    align: 'center',
  });
}

/**
 * Leyenda de color. Obligatoria cuando el diagrama usa 3+ colores semánticos
 * o cuando lo va a leer alguien que no estuvo en la conversación.
 */
function legend(entries, { x, y, size = 14 } = {}) {
  const out = [];
  entries.forEach(([color, meaning], i) => {
    const ly = y + i * 26;
    out.push(line({ x, y: ly + size / 2, points: [[0, 0], [24, 0]], color, strokeWidth: 2 }));
    out.push(text({ x: x + 34, y: ly, text: meaning, size, color }));
  });
  return out;
}

// ---------------------------------------------------------------- documento

function document(elements, { theme = 'light', name } = {}) {
  const palette = typeof theme === 'string' ? THEMES[theme] : theme;
  return {
    type: 'excalidraw',
    version: 2,
    source: 'excalidraw-visualizations',
    ...(name ? { name } : {}),
    elements: elements.flat().filter(Boolean),
    appState: {
      gridSize: 20,
      gridStep: 5,
      gridModeEnabled: false,
      viewBackgroundColor: palette.background,
    },
    files: {},
  };
}

module.exports = {
  FONT, THEMES,
  base, uid,
  text, boundText, textWidth, textHeight,
  rect, diamond, ellipse, box, decision, line,
  connect, link, frame,
  rowX, colY, bounds, extent, translate, packRows, title, legend,
  document,
};
