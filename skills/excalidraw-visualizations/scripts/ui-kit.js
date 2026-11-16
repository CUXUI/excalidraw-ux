// ui-kit — piezas de wireframe reutilizables sobre excalidraw-builder.
//
// Convención: cada función devuelve un array de elementos donde el [0] es el
// contenedor. Ese [0] es el que se le pasa a connect() para enlazar pantallas.
//
//   const home = screen({ x: 0, y: 0, name: 'Home' });
//   const detail = screen({ x: 400, y: 0, name: 'Detalle' });
//   elements.push(...home, ...detail, ...connect(home[0], detail[0], { label: 'Tocar' }));
'use strict';

const B = require('./excalidraw-builder.js');

const PHONE = { w: 240, h: 460 };
const DESKTOP = { w: 420, h: 300 };

/** Pantalla de teléfono. `name` va arriba, fuera del marco (no es contenido). */
function screen(opts) {
  const {
    x, y, w = PHONE.w, h = PHONE.h, name,
    color = '#1e1e1e', children = [],
  } = opts;
  const out = [];
  if (name) {
    const size = 20;
    out.push(B.text({
      x: x + w / 2 - B.textWidth(name, size, B.FONT.hand) / 2,
      y: y - 34,
      text: name,
      size,
      color,
    }));
  }
  const container = B.rect({ x, y, w, h, color });
  out.unshift(container);
  out.push(...children);
  return [container, ...out.filter((e) => e !== container)];
}

/** Ventana de navegador: barra de chrome + área de contenido. */
function browser(opts) {
  const {
    x, y, w = DESKTOP.w, h = DESKTOP.h, name, url,
    color = '#1e1e1e', children = [],
  } = opts;
  const out = [];
  if (name) {
    const size = 20;
    out.push(B.text({
      x: x + w / 2 - B.textWidth(name, size, B.FONT.hand) / 2,
      y: y - 34,
      text: name,
      size,
      color,
    }));
  }
  const container = B.rect({ x, y, w, h, color });
  const chromeH = 28;
  out.push(B.line({ x, y: y + chromeH, points: [[0, 0], [w, 0]], color }));
  [12, 28, 44].forEach((dx) => {
    out.push(B.ellipse({ x: x + dx, y: y + 9, w: 9, h: 9, color }));
  });
  if (url) {
    out.push(B.text({
      x: x + 66, y: y + 7, text: url, size: 12, color, font: B.FONT.mono,
    }));
  }
  out.unshift(container);
  out.push(...children);
  return [container, ...out.filter((e) => e !== container)];
}

/** Botón. `state`: 'default' | 'primary' | 'disabled'. */
function button(opts) {
  const {
    x, y, w = 160, h = 44, label = 'Acción', state = 'default',
    color = '#1e1e1e', accent = '#2f9e44',
  } = opts;
  const stroke = state === 'primary' ? accent : color;
  const el = B.rect({ x, y, w, h, color: stroke, dashed: state === 'disabled' });
  return [el, B.boundText(el, label, { size: 16, color: stroke, font: B.FONT.mono })];
}

/** Campo de formulario con etiqueta arriba. */
function input(opts) {
  const {
    x, y, w = 180, h = 38, label, placeholder = '', color = '#1e1e1e',
  } = opts;
  const out = [];
  let top = y;
  if (label) {
    out.push(B.text({ x, y, text: label, size: 13, color, font: B.FONT.mono }));
    top = y + 20;
  }
  const el = B.rect({ x, y: top, w, h, color });
  out.unshift(el);
  if (placeholder) {
    out.push(B.text({
      x: x + 10, y: top + h / 2 - 8, text: placeholder, size: 13,
      color: '#868e96', font: B.FONT.mono,
    }));
  }
  return [el, ...out.filter((e) => e !== el)];
}

/** Toggle. Contorno siempre, nunca relleno: el estado lo dice color + posición. */
function toggle(opts) {
  const { x, y, on = false, color = '#1e1e1e', accent = '#2f9e44' } = opts;
  const stroke = on ? accent : color;
  const track = B.rect({ x, y, w: 60, h: 30, color: stroke });
  const knob = B.ellipse({ x: on ? x + 32 : x + 4, y: y + 4, w: 22, h: 22, color: stroke });
  return [track, knob];
}

/** Placeholder de imagen: rectángulo con la diagonal cruzada. */
function imageBox(opts) {
  const { x, y, w = 160, h = 100, color = '#868e96' } = opts;
  return [
    B.rect({ x, y, w, h, color, rounded: false }),
    B.line({ x, y, points: [[0, 0], [w, h]], color }),
    B.line({ x, y, points: [[w, 0], [0, h]], color }),
  ];
}

/**
 * Líneas de texto simuladas. Para content massing y wireframes lo-fi donde el
 * contenido real todavía no existe. La última sale más corta, como un párrafo.
 */
function textLines(opts) {
  const { x, y, w = 180, lines = 3, gap = 14, color = '#868e96' } = opts;
  return Array.from({ length: lines }, (_, i) => B.line({
    x,
    y: y + i * gap,
    points: [[0, 0], [i === lines - 1 ? w * 0.6 : w, 0]],
    color,
    strokeWidth: 2,
  }));
}

/**
 * Bloque de content massing: un rectángulo proporcional al peso del contenido,
 * rotulado por TIPO y no por texto real ("Hero", "3 cards", "Testimonios").
 */
function massBlock(opts) {
  const {
    x, y, w, h, label, fill = '#ced4da', color = '#868e96', labelColor = '#1e1e1e',
  } = opts;
  // Única forma del sistema con relleno: acá el bloque de color ES la
  // información (cuánto espacio ocupa ese contenido), no decoración.
  const el = B.rect({ x, y, w, h, color, fill, rounded: false });
  if (!label) return [el];
  return [el, B.boundText(el, label, { size: 15, color: labelColor, font: B.FONT.mono })];
}

/** Nota de anotación: comentario SOBRE el diseño, no parte del diseño. */
function note(opts) {
  const { x, y, w = 200, text: content, color = '#e8590c' } = opts;
  const h = B.textHeight(content, 14) + 20;
  const el = B.rect({ x, y, w, h, color, dashed: true });
  return [el, B.boundText(el, content, { size: 14, color, font: B.FONT.hand })];
}

/** Fila de lista con chevron — patrón de settings/listados. */
function listRow(opts) {
  const { x, y, w = 200, h = 40, label, color = '#1e1e1e' } = opts;
  return [
    B.rect({ x, y, w, h, color, rounded: false }),
    B.text({ x: x + 12, y: y + h / 2 - 8, text: label, size: 14, color, font: B.FONT.mono }),
    B.line({
      x: x + w - 20, y: y + h / 2 - 6, points: [[0, 0], [6, 6], [0, 12]], color,
    }),
  ];
}

/** Barra de navegación superior con título y botón de volver. */
function navbar(opts) {
  const { x, y, w = 240, h = 40, label = '', back = true, color = '#1e1e1e' } = opts;
  const out = [B.rect({ x, y, w, h, color, rounded: false })];
  if (back) {
    out.push(B.line({ x: x + 14, y: y + h / 2 - 6, points: [[6, 0], [0, 6], [6, 12]], color }));
  }
  if (label) {
    out.push(B.text({
      x: x + w / 2 - B.textWidth(label, 14, B.FONT.mono) / 2,
      y: y + h / 2 - 8,
      text: label,
      size: 14,
      color,
      font: B.FONT.mono,
    }));
  }
  return out;
}

/** Ícono de check — confirmación. */
function check(opts) {
  const { x, y, size = 40, color = '#2f9e44' } = opts;
  return [B.line({
    x,
    y,
    points: [[0, size * 0.5], [size * 0.35, size * 0.85], [size, 0]],
    color,
    strokeWidth: 3,
  })];
}

/** Ícono de cruz — error, descartado, "no". */
function cross(opts) {
  const { x, y, size = 32, color = '#e8590c' } = opts;
  return [
    B.line({ x, y, points: [[0, 0], [size, size]], color, strokeWidth: 3 }),
    B.line({ x, y, points: [[size, 0], [0, size]], color, strokeWidth: 3 }),
  ];
}

module.exports = {
  PHONE, DESKTOP,
  screen, browser, navbar,
  button, input, toggle, listRow,
  imageBox, textLines, massBlock,
  note, check, cross,
};
