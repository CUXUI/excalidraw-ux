// Muestrario: los 16 casos de uso del skill aplicados a una app de tabatas HIIT.
const fs = require('fs');
const B = require('../scripts/excalidraw-builder.js');
const UI = require('../scripts/ui-kit.js');

const T = B.THEMES.light;
const F = B.FONT;
const frames = [];
const els = [];

// Cada sección se registra con su nombre para que quede un frame exportable aparte.
// El frame se calcula desde el contenido real, no a ojo: declarar el tamaño a mano
// hace que textos largos queden afuera y que dos secciones se pisen.
// Cada bloque se arma en el origen y se guarda acá; al final packRows los ubica
// sin que se pisen y recién entonces se les calza el frame.
const bloques = [];
function seccion(nombre, contenido) {
  const b = B.bounds(contenido);
  const titulo = B.text({
    x: b.x, y: b.y - 46, text: nombre, size: 26, color: T.ink, font: F.hand,
  });
  bloques.push({ nombre, els: [titulo, ...contenido] });
}

// ═══ 1. WIREFRAME — una pantalla, lo-fi, sin diseño visual ═══
{
  const x = 0, y = 0, c = [];
  const p = UI.screen({ x, y, name: null, color: T.ink });
  c.push(...p);
  c.push(...UI.navbar({ x, y, w: 240, label: 'Tabata clásica', color: T.ink }));
  c.push(B.text({ x: x + 60, y: y + 70, text: 'RONDA 3 / 8', size: 14, color: T.muted, font: F.mono }));
  c.push(...B.box({ x: x + 30, y: y + 100, w: 180, h: 90, label: '00:14', color: T.ink, labelSize: 44, labelFont: F.mono }));
  c.push(B.text({ x: x + 78, y: y + 200, text: 'TRABAJO', size: 18, color: T.ok, font: F.mono }));
  c.push(...UI.textLines({ x: x + 30, y: y + 240, w: 180, lines: 2, color: T.muted }));
  c.push(...UI.button({ x: x + 40, y: y + 300, w: 160, h: 44, label: 'Pausar', color: T.ink }));
  c.push(...UI.button({ x: x + 40, y: y + 360, w: 160, h: 40, label: 'Saltar', state: 'disabled', color: T.muted }));
  seccion('1 · Wireframe', c);
}

// ═══ 2. TASK FLOW — lineal, SIN ramas (regla dura: ningún rombo) ═══
{
  const x = 0, y = 0, c = [];
  const pasos = ['Abrir app', 'Elegir rutina', 'Ver preview', 'Entrenar', 'Ver resumen'];
  const xs = B.rowX(x, 5, 150, 55);
  const cajas = pasos.map((p, i) => {
    const forma = i === 0 || i === 4
      ? B.box({ x: xs[i], y: y + 40, w: 150, h: 60, label: p, color: T.ink, labelSize: 15 })
      : B.box({ x: xs[i], y: y + 40, w: 150, h: 60, label: p, color: T.ink, labelSize: 15 });
    c.push(...forma);
    return forma;
  });
  for (let i = 0; i < cajas.length - 1; i++) c.push(...B.connect(cajas[i][0], cajas[i + 1][0], { color: T.ink }));
  c.push(B.text({ x, y: y + 130, text: 'Una sola tarea, camino feliz. Sin decisiones ni errores:\nen cuanto aparece un rombo, pasa a ser user flow.', size: 13, color: T.muted }));
  seccion('2 · Task flow — "iniciar una tabata guardada"', c);
}

// ═══ 3. USER FLOW — con decisiones, persona usuaria declarada ═══
{
  const x = 0, y = 0, c = [];
  c.push(B.text({ x, y, text: 'Persona usuaria: alguien que entrena en casa, 20 min, sin equipamiento', size: 13, color: T.muted }));
  const ini = B.box({ x: x + 20, y: y + 40, w: 130, h: 50, label: 'Abre app', color: T.ink, labelSize: 14 });
  const d1 = B.decision({ x: x + 200, y: y + 20, w: 170, h: 90, label: '¿Tiene rutinas?', color: T.ink, labelSize: 13 });
  const elegir = B.box({ x: x + 430, y: y - 40, w: 140, h: 50, label: 'Elegir rutina', color: T.ok, labelSize: 13 });
  const crear = B.box({ x: x + 430, y: y + 110, w: 140, h: 50, label: 'Crear rutina', color: T.alert, labelSize: 13 });
  const conf = B.box({ x: x + 630, y: y + 35, w: 140, h: 50, label: 'Configurar', color: T.ink, labelSize: 13 });
  const train = B.box({ x: x + 830, y: y + 35, w: 140, h: 50, label: 'Entrenar', color: T.ink, labelSize: 14 });
  const d2 = B.decision({ x: x + 1020, y: y + 15, w: 165, h: 90, label: '¿Completó?', color: T.ink, labelSize: 13 });
  const fin = B.box({ x: x + 1240, y: y - 40, w: 140, h: 50, label: 'Resumen', color: T.ok, labelSize: 14 });
  const aband = B.box({ x: x + 1240, y: y + 110, w: 140, h: 50, label: 'Descartada', color: T.alert, labelSize: 13 });
  c.push(...ini, ...d1, ...elegir, ...crear, ...conf, ...train, ...d2, ...fin, ...aband);
  c.push(...B.connect(ini[0], d1[0], { color: T.ink }));
  c.push(...B.connect(d1[0], elegir[0], { label: 'Sí', color: T.ok }));
  c.push(...B.connect(d1[0], crear[0], { label: 'No', color: T.alert, dashed: true }));
  c.push(...B.connect(elegir[0], conf[0], { color: T.ok }));
  c.push(...B.connect(crear[0], conf[0], { color: T.alert, dashed: true }));
  c.push(...B.connect(conf[0], train[0], { color: T.ink }));
  c.push(...B.connect(train[0], d2[0], { color: T.ink }));
  c.push(...B.connect(d2[0], fin[0], { label: 'Sí', color: T.ok }));
  c.push(...B.connect(d2[0], aband[0], { label: 'No', color: T.alert, dashed: true }));
  c.push(...B.legend([[T.ok, 'camino principal'], [T.alert, 'alternativo / error']], { x, y: y + 200 }));
  seccion('3 · User flow — todos los caminos, con decisiones', c);
}

// ═══ 4. WIREFLOW — la flecha sale DEL BOTÓN, no del borde ═══
{
  const x = 0, y = 0, c = [];
  const s1 = UI.screen({ x, y: y + 20, w: 200, h: 340, name: 'Lista', color: T.ink });
  c.push(...s1);
  c.push(...UI.navbar({ x, y: y + 20, w: 200, h: 34, label: 'Mis rutinas', back: false, color: T.ink }));
  const fila = UI.listRow({ x: x + 15, y: y + 80, w: 170, h: 38, label: 'Tabata clásica', color: T.ink });
  c.push(...fila);
  c.push(...UI.listRow({ x: x + 15, y: y + 130, w: 170, h: 38, label: 'HIIT 30/15', color: T.muted }));

  const s2 = UI.screen({ x: x + 360, y: y + 20, w: 200, h: 340, name: 'Preview', color: T.ink });
  c.push(...s2);
  c.push(...UI.navbar({ x: x + 360, y: y + 20, w: 200, h: 34, label: 'Tabata clásica', color: T.ink }));
  c.push(B.text({ x: x + 380, y: y + 80, text: '20s / 10s × 8', size: 14, color: T.muted, font: F.mono }));
  c.push(B.text({ x: x + 380, y: y + 105, text: 'Total 4:00', size: 13, color: T.muted, font: F.mono }));
  const btn = UI.button({ x: x + 380, y: y + 280, w: 160, h: 40, label: 'Empezar', state: 'primary', accent: T.ok });
  c.push(...btn);

  const s3 = UI.screen({ x: x + 720, y: y + 20, w: 200, h: 340, name: 'Timer', color: T.ink });
  c.push(...s3);
  c.push(...B.box({ x: x + 740, y: y + 130, w: 160, h: 80, label: '00:20', color: T.ink, labelSize: 36, labelFont: F.mono }));
  c.push(B.text({ x: x + 782, y: y + 225, text: 'TRABAJO', size: 15, color: T.ok, font: F.mono }));

  // La regla que define el formato: origen = el elemento que dispara.
  c.push(...B.connect(fila[0], s2[0], { label: 'tocar fila', color: T.ink }));
  c.push(...B.connect(btn[0], s3[0], { label: 'tocar Empezar', color: T.ok }));
  c.push(B.text({ x, y: y + 400, text: 'La flecha nace en el control que dispara la transición (la fila, el botón),\nno en el borde de la pantalla. Eso es lo que lo hace un wireflow y no un user flow.', size: 13, color: T.muted }));
  seccion('4 · Wireflow — wireframes como nodos', c);
}

// ═══ 5. DIAGRAMA DE FLUJO — lógica de sistema, formas ISO 5807 ═══
{
  const x = 0, y = 0, c = [];
  const ini = B.box({ x: x + 60, y, w: 150, h: 46, label: 'Inicio sesión', color: T.ink, labelSize: 13 });
  const load = B.box({ x: x + 60, y: y + 90, w: 150, h: 46, label: 'Cargar config', color: T.ink, labelSize: 13 });
  const d1 = B.decision({ x: x + 45, y: y + 175, w: 180, h: 85, label: '¿Quedan rondas?', color: T.ink, labelSize: 12 });
  const work = B.box({ x: x + 300, y: y + 185, w: 150, h: 46, label: 'Fase trabajo 20s', color: T.ok, labelSize: 12 });
  const beep = B.box({ x: x + 300, y: y + 265, w: 150, h: 46, label: 'Emitir señal', color: T.group, labelSize: 12, dashed: true });
  const rest = B.box({ x: x + 300, y: y + 345, w: 150, h: 46, label: 'Fase descanso 10s', color: T.muted, labelSize: 11 });
  const save = B.box({ x: x + 60, y: y + 300, w: 150, h: 46, label: 'Guardar en BD', color: T.ink, labelSize: 13 });
  const fin = B.box({ x: x + 60, y: y + 390, w: 150, h: 46, label: 'Fin', color: T.ink, labelSize: 13 });
  c.push(...ini, ...load, ...d1, ...work, ...beep, ...rest, ...save, ...fin);
  c.push(...B.connect(ini[0], load[0], { color: T.ink }));
  c.push(...B.connect(load[0], d1[0], { color: T.ink }));
  c.push(...B.connect(d1[0], work[0], { label: 'Sí', color: T.ok }));
  c.push(...B.connect(work[0], beep[0], { color: T.group }));
  c.push(...B.connect(beep[0], rest[0], { color: T.muted }));
  c.push(...B.connect(rest[0], d1[0], { color: T.muted }));
  c.push(...B.connect(d1[0], save[0], { label: 'No', color: T.ink }));
  c.push(...B.connect(save[0], fin[0], { color: T.ink }));
  c.push(B.text({ x: x + 500, y: y + 190, text: 'Documenta lógica del sistema,\nno la experiencia. "Emitir señal"\nes salida del sistema: la persona\nusuaria nunca ve ese paso.', size: 12, color: T.muted }));
  seccion('5 · Diagrama de flujo — motor de intervalos', c);
}

// ═══ 6. SITEMAP — LÍNEAS SIN PUNTA (contenencia, no secuencia) ═══
{
  const x = 0, y = 0, c = [];
  const home = B.box({ x: x + 240, y, w: 140, h: 46, label: 'Home', color: T.ink, labelSize: 15 });
  c.push(...home);
  const n1 = [
    ['1.0 Rutinas', T.ink], ['2.0 Historial', T.ink], ['3.0 Ajustes', T.ink],
  ];
  const xs = B.rowX(x, 3, 160, 50);
  n1.forEach(([label, col], i) => {
    const n = B.box({ x: xs[i], y: y + 140, w: 160, h: 46, label, color: col, labelSize: 13 });
    c.push(...n, ...B.link(home[0], n[0], { color: T.muted }));
    const hijos = [
      ['1.1 Detalle', '1.2 Editor'],
      ['2.1 Sesión'],
      ['3.1 Sonido', '3.2 Cuenta'],
    ][i];
    hijos.forEach((h, j) => {
      const sub = B.box({ x: xs[i] - 10 + j * 85, y: y + 270 + j * 62, w: 150, h: 40, label: h, color: T.muted, labelSize: 12 });
      c.push(...sub, ...B.link(n[0], sub[0], { color: T.muted }));
    });
  });
  c.push(B.text({ x, y: y + 430, text: 'Líneas SIN punta: significan "contiene", no "el usuario va hacia".\nCon flechas diría que se navega en ese orden, que es falso.', size: 13, color: T.alert }));
  seccion('6 · Sitemap / arquitectura de información', c);
}

// ═══ 7. STATE DIAGRAM — estados de la MISMA UI, con ciclos ═══
{
  const x = 0, y = 0, c = [];
  c.push(B.ellipse({ x: x + 20, y: y + 10, w: 18, h: 18, color: T.ink, fill: T.ink }));
  const idle = B.box({ x: x + 5, y: y + 60, w: 130, h: 48, label: 'Inactivo', color: T.ink, labelSize: 14 });
  const prep = B.box({ x: x + 5, y: y + 160, w: 130, h: 48, label: 'Preparación', color: T.ink, labelSize: 13 });
  const work = B.box({ x: x + 5, y: y + 265, w: 130, h: 48, label: 'Trabajo', color: T.ok, labelSize: 14 });
  const rest = B.box({ x: x + 200, y: y + 265, w: 130, h: 48, label: 'Descanso', color: T.ink, labelSize: 14 });
  const paus = B.box({ x: x + 200, y: y + 160, w: 130, h: 48, label: 'Pausado', color: T.alert, labelSize: 13 });
  const done = B.box({ x: x + 200, y: y + 380, w: 130, h: 48, label: 'Completado', color: T.ok, labelSize: 12 });
  c.push(...idle, ...prep, ...work, ...rest, ...paus, ...done);
  c.push(...B.connect(idle[0], prep[0], { label: 'iniciar', color: T.ink }));
  c.push(...B.connect(prep[0], work[0], { label: 'fin 3s', color: T.ink }));
  c.push(...B.connect(work[0], rest[0], { label: '20s', color: T.ok }));
  c.push(...B.connect(rest[0], work[0], { label: '10s [quedan]', color: T.ink }));
  c.push(...B.connect(rest[0], done[0], { label: '[última]', color: T.ok }));
  c.push(...B.connect(work[0], paus[0], { label: 'pausar', color: T.alert, dashed: true }));
  c.push(...B.connect(paus[0], work[0], { label: 'reanudar', color: T.alert, dashed: true }));
  c.push(...B.connect(done[0], idle[0], { label: 'cerrar', color: T.muted, dashed: true }));
  c.push(B.text({ x, y: y + 460, text: 'Los nodos son CONDICIONES de la misma pantalla, no pantallas distintas.\nLos ciclos son correctos. Transiciones etiquetadas evento [condición].', size: 12, color: T.muted }));
  seccion('7 · Diagrama de estados — temporizador', c);
}

// ═══ 8. PRIORITY GUIDE — UNA columna, sin layout ═══
{
  const x = 0, y = 0, c = [];
  const items = [
    ['1', 'Tiempo restante del intervalo', 'lo único que se mira en movimiento'],
    ['2', 'Fase actual: trabajo o descanso', 'nunca solo por color'],
    ['3', 'Ronda 3 de 8', 'orientación en el total'],
    ['4', 'Pausar', 'alcanzable con el pulgar'],
    ['5', 'Progreso total de la sesión', ''],
    ['6', 'Saltar intervalo', 'secundario'],
    ['7', 'Salir', 'requiere confirmación'],
  ];
  items.forEach(([n, txt, nota], i) => {
    const yy = y + i * 56;
    c.push(B.text({ x, y: yy, text: n, size: 16, color: T.muted, font: F.mono }));
    c.push(B.text({ x: x + 30, y: yy, text: txt, size: 15, color: T.ink, font: F.mono }));
    if (nota) c.push(B.text({ x: x + 30, y: yy + 22, text: nota, size: 12, color: T.muted }));
  });
  c.push(B.text({ x, y: y + 410, text: 'Una sola columna, de mayor a menor prioridad. Sin ninguna\ndecisión de layout: así la jerarquía sobrevive a todo breakpoint.', size: 12, color: T.muted }));
  seccion('8 · Priority guide — pantalla del timer', c);
}

// ═══ 9. GRAY-BOX — bloques 2D con relleno (única excepción de relleno) ═══
{
  const x = 0, y = 0, c = [];
  const bloques = [
    ['Header', 40], ['Rutina destacada', 110], ['3 cards de rutina', 90],
    ['Historial reciente', 70], ['Nav', 44],
  ];
  let yy = y;
  bloques.forEach(([label, h]) => {
    c.push(...UI.massBlock({ x, y: yy, w: 240, h, label, fill: T.massing, color: T.muted }));
    yy += h + 10;
  });
  c.push(B.text({ x, y: yy + 10, text: 'Rotulado por TIPO y volumen, nunca con texto real.\nEl relleno acá SÍ va: el bloque gris es la información.', size: 12, color: T.muted }));
  seccion('9 · Gray-box — masa de contenido del Home', c);
}

// ═══ 10. CRÍTICA ANOTADA — el caso de mentorías ═══
{
  const x = 0, y = 0, c = [];
  const p = UI.screen({ x, y: y + 20, w: 220, h: 400, color: T.ink });
  c.push(...p);
  c.push(...UI.navbar({ x, y: y + 20, w: 220, h: 34, label: 'Entrenando', color: T.ink }));
  c.push(...B.box({ x: x + 55, y: y + 90, w: 110, h: 50, label: '00:14', color: T.ink, labelSize: 22, labelFont: F.mono }));
  c.push(B.text({ x: x + 78, y: y + 160, text: 'TRABAJO', size: 13, color: T.ok, font: F.mono }));
  c.push(...UI.button({ x: x + 30, y: y + 320, w: 160, h: 40, label: 'Pausar', color: T.ink }));
  const n1 = UI.note({ x: x + 290, y: y + 70, w: 230, text: 'El número compite en tamaño\ncon el resto. A 2 m de distancia\nes lo único que debería leerse.', color: T.alert });
  const n2 = UI.note({ x: x + 290, y: y + 175, w: 230, text: 'Trabajo/descanso se distingue\nsolo por color: falla con\ndaltonismo. Sumar forma o texto.', color: T.alert });
  const n3 = UI.note({ x: x + 290, y: y + 300, w: 230, text: 'Bien: Pausar queda en zona\nde pulgar y es el objetivo\nmás grande de la pantalla.', color: T.ok });
  c.push(...n1, ...n2, ...n3);
  c.push(B.line({ x: x + 170, y: y + 115, points: [[0, 0], [118, -20]], color: T.alert }));
  c.push(B.line({ x: x + 150, y: y + 168, points: [[0, 0], [138, 40]], color: T.alert }));
  c.push(B.line({ x: x + 190, y: y + 340, points: [[0, 0], [98, 0]], color: T.ok }));
  c.push(B.text({ x, y: y + 450, text: 'La nota nunca encima de lo que comenta: al costado, con línea fina.\nContorno punteado para que no se confunda con el diseño.', size: 12, color: T.muted }));
  seccion('10 · Crítica anotada — revisión de pantalla', c);
}

// ═══ 11. MATRIZ 2×2 — ejes etiquetados en AMBOS extremos ═══
{
  const x = 0, y = 0, c = [];
  const S = 380;
  c.push(B.rect({ x, y, w: S, h: S, color: T.muted, rounded: false }));
  c.push(B.line({ x, y: y + S / 2, points: [[0, 0], [S, 0]], color: T.muted }));
  c.push(B.line({ x: x + S / 2, y, points: [[0, 0], [0, S]], color: T.muted }));
  c.push(B.text({ x: x - 10, y: y - 30, text: '↑ más impacto', size: 13, color: T.ink }));
  c.push(B.text({ x: x - 10, y: y + S + 10, text: '↓ menos impacto', size: 13, color: T.muted }));
  c.push(B.text({ x: x - 10, y: y + S + 34, text: '← menos esfuerzo', size: 13, color: T.muted }));
  c.push(B.text({ x: x + S - 130, y: y + S + 34, text: 'más esfuerzo →', size: 13, color: T.muted }));
  c.push(B.text({ x: x + 12, y: y + 10, text: 'HACER YA', size: 13, color: T.ok, font: F.mono }));
  c.push(B.text({ x: x + S / 2 + 12, y: y + 10, text: 'PLANIFICAR', size: 13, color: T.ink, font: F.mono }));
  c.push(B.text({ x: x + 12, y: y + S / 2 + 10, text: 'RELLENO', size: 13, color: T.muted, font: F.mono }));
  c.push(B.text({ x: x + S / 2 + 12, y: y + S / 2 + 10, text: 'DESCARTAR', size: 13, color: T.alert, font: F.mono }));
  const feats = [
    ['Voz en cuenta regresiva', 60, 70], ['Bloqueo de pantalla', 40, 150],
    ['Apple Watch', 250, 60], ['Rutinas compartidas', 245, 130],
    ['Temas de color', 70, 250], ['Integración redes', 250, 300],
  ];
  feats.forEach(([label, dx, dy]) => {
    c.push(B.ellipse({ x: x + dx, y: y + dy, w: 10, h: 10, color: T.ink, fill: T.ink }));
    c.push(B.text({ x: x + dx + 16, y: y + dy - 4, text: label, size: 11, color: T.ink }));
  });
  seccion('11 · Matriz 2×2 — priorización de features', c);
}

// ═══ 12. JOURNEY MAP — 3 zonas, UNA persona, línea de emoción continua ═══
{
  const x = 0, y = 0, c = [];
  c.push(B.text({ x, y, text: 'Actor: Dani, entrena en casa 3× por semana · Escenario: primera sesión después de 2 semanas parada', size: 13, color: T.ink }));
  const fases = ['Decide entrenar', 'Configura', 'Entrena', 'Termina'];
  const xs = B.rowX(x, 4, 220, 30);
  fases.forEach((f, i) => {
    c.push(...B.box({ x: xs[i], y: y + 40, w: 220, h: 40, label: f, color: T.ink, labelSize: 14 }));
  });
  const acciones = [
    'Abre la app sin\nsaber qué hacer', 'Elige una rutina\nde 4 minutos', 'Sigue el timer,\nse queda sin aire', 'Ve el resumen\ny la racha rota',
  ];
  const pensam = [
    '"¿me va a costar\nmucho volver?"', '"4 minutos los\nhago tranquila"', '"esto era más\nfácil antes"', '"perdí la racha,\n¿para qué sigo?"',
  ];
  acciones.forEach((a, i) => c.push(B.text({ x: xs[i] + 8, y: y + 100, text: a, size: 12, color: T.ink })));
  pensam.forEach((p, i) => c.push(B.text({ x: xs[i] + 8, y: y + 155, text: p, size: 12, color: T.muted })));
  c.push(B.text({ x: x - 100, y: y + 100, text: 'Acciones', size: 12, color: T.muted }));
  c.push(B.text({ x: x - 100, y: y + 155, text: 'Piensa', size: 12, color: T.muted }));
  c.push(B.text({ x: x - 100, y: y + 225, text: 'Emoción', size: 12, color: T.muted }));
  // Una sola línea continua cruzando las fases.
  c.push(B.line({
    x, y: y + 215,
    points: [[110, 40], [330, 10], [560, 55], [790, 70]],
    color: T.alert, strokeWidth: 3,
  }));
  [[110, 40], [330, 10], [560, 55], [790, 70]].forEach(([dx, dy]) => {
    c.push(B.ellipse({ x: x + dx - 5, y: y + 210 + dy, w: 10, h: 10, color: T.alert, fill: T.alert }));
  });
  c.push(B.text({ x, y: y + 310, text: 'Oportunidad', size: 12, color: T.muted }));
  const ops = ['Sugerir rutina\nsegún ausencia', 'Mostrar el total\nreal: 4 min', 'Aliento en el\nintervalo 6', 'Racha por semana,\nno por día'];
  ops.forEach((o, i) => c.push(B.text({ x: xs[i] + 8, y: y + 340, text: o, size: 12, color: T.ok })));
  c.push(B.text({ x, y: y + 400, text: 'Basado en supuestos, no en research: rotulado como hipótesis hasta validarlo.', size: 12, color: T.alert }));
  seccion('12 · Journey map', c);
}

// ═══ 13. SERVICE BLUEPRINT — las TRES líneas nombradas son obligatorias ═══
{
  const x = 0, y = 0, c = [];
  const W = 1180;
  const carriles = [
    ['Acciones de la persona', T.ink, 0],
    ['Frontstage (lo que ve)', T.ink, 110],
    ['Backstage (no lo ve)', T.muted, 220],
    ['Procesos de soporte', T.muted, 330],
  ];
  carriles.forEach(([nombre, col, dy]) => {
    c.push(B.text({ x, y: y + dy + 8, text: nombre, size: 12, color: col }));
  });
  const cols = B.rowX(x + 230, 4, 210, 25);
  const contenido = [
    ['Abre la app', 'Elige rutina', 'Entrena', 'Ve resumen'],
    ['Home con rutinas', 'Preview 20/10×8', 'Timer + audio', 'Resumen + racha'],
    ['Cache local', 'Motor de intervalos', 'Registro de sesión', 'Sync a la nube'],
    ['CDN de sonidos', 'Catálogo de rutinas', 'Analytics', 'Base de datos'],
  ];
  contenido.forEach((fila, r) => {
    fila.forEach((txt, i) => {
      c.push(...B.box({
        x: cols[i], y: y + r * 110, w: 210, h: 56,
        label: txt, color: r < 2 ? T.ink : T.muted, labelSize: 12,
      }));
    });
  });
  const lineas = [
    ['línea de interacción', 90], ['línea de visibilidad', 200], ['línea de interacción interna', 310],
  ];
  lineas.forEach(([nombre, dy]) => {
    c.push(B.line({ x, y: y + dy, points: [[0, 0], [W, 0]], color: T.group, strokeWidth: 2 }));
    c.push(B.text({ x: x + W + 10, y: y + dy - 8, text: nombre, size: 11, color: T.group }));
  });
  c.push(B.text({ x, y: y + 420, text: 'Sin las tres líneas nombradas esto es apenas un swimlane.\nLa profundidad hacia abajo es distancia a la persona usuaria.', size: 12, color: T.muted }));
  seccion('13 · Service blueprint', c);
}

// ═══ 14. SWIMLANES — lo importante son los cruces de carril ═══
{
  const x = 0, y = 0, c = [];
  const W = 1000;
  const lanes = ['Persona usuaria', 'App (dispositivo)', 'Servicio de sync'];
  lanes.forEach((l, i) => {
    c.push(B.text({ x, y: y + i * 140 + 40, text: l, size: 13, color: T.ink }));
    c.push(B.line({ x: x + 180, y: y + i * 140 + 130, points: [[0, 0], [W, 0]], color: T.muted }));
  });
  const a1 = B.box({ x: x + 220, y: y + 20, w: 170, h: 50, label: 'Termina sesión', color: T.ink, labelSize: 13 });
  const b1 = B.box({ x: x + 460, y: y + 160, w: 170, h: 50, label: 'Guarda local', color: T.ink, labelSize: 13 });
  const b2 = B.box({ x: x + 700, y: y + 160, w: 170, h: 50, label: 'Encola sync', color: T.ink, labelSize: 13 });
  const c1 = B.box({ x: x + 940, y: y + 300, w: 170, h: 50, label: 'Persiste', color: T.muted, labelSize: 13 });
  const a2 = B.box({ x: x + 940, y: y + 20, w: 170, h: 50, label: 'Ve la racha', color: T.ok, labelSize: 13 });
  c.push(...a1, ...b1, ...b2, ...c1, ...a2);
  c.push(...B.connect(a1[0], b1[0], { color: T.alert }));
  c.push(...B.connect(b1[0], b2[0], { color: T.ink }));
  c.push(...B.connect(b2[0], c1[0], { color: T.alert }));
  c.push(...B.connect(c1[0], a2[0], { color: T.alert }));
  c.push(B.text({ x, y: y + 400, text: 'Cada flecha que cruza un carril es un traspaso de responsabilidad (en coral).\nSi una sola persona hiciera todo, un flujo común comunicaría igual y sería más simple.', size: 12, color: T.muted }));
  seccion('14 · Swimlanes — guardar una sesión', c);
}

// ═══ 15. MAPA DE AFINIDAD — agrupación por tema, contorno punteado ═══
{
  const x = 0, y = 0, c = [];
  const grupos = [
    ['Motivación', T.ok, ['"si pierdo la racha\nabandono"', '"quiero ver que\nprogreso"']],
    ['Interrupciones', T.alert, ['"suena el timbre\ny pierdo la ronda"', '"me llaman y\nno sé pausar"']],
    ['Sonido', T.group, ['"no escucho el\nbeep con música"', '"vibración sí,\nsonido no"']],
  ];
  grupos.forEach(([tema, col, notas], i) => {
    const gx = x + i * 260;
    c.push(B.rect({ x: gx, y, w: 230, h: 250, color: col, dashed: true }));
    c.push(B.text({ x: gx + 12, y: y + 10, text: tema, size: 15, color: col }));
    notas.forEach((n, j) => {
      c.push(...B.box({ x: gx + 15, y: y + 50 + j * 95, w: 200, h: 80, label: n, color: T.muted, labelSize: 11 }));
    });
  });
  c.push(B.text({ x, y: y + 270, text: 'El grupo se marca con contorno punteado, no con relleno.\nNotas del mismo tamaño: ninguna pesa más que otra.', size: 12, color: T.muted }));
  seccion('15 · Mapa de afinidad — síntesis de research', c);
}

// ═══ 16. STORYBOARD — paneles iguales, numerados, banda de texto ═══
{
  const x = 0, y = 0, c = [];
  const paneles = [
    ['Dani llega del trabajo,\nno tiene ganas', 'depto, 19 h'],
    ['Abre la app: le sugiere\n4 minutos', 'sugerencia por ausencia'],
    ['Entrena mirando el\ntimer grande', 'living, sin equipamiento'],
    ['Ve la racha semanal\nintacta', 'refuerzo positivo'],
  ];
  const xs = B.rowX(x, 4, 210, 25);
  paneles.forEach(([txt, pie], i) => {
    c.push(B.rect({ x: xs[i], y, w: 210, h: 150, color: T.ink, rounded: false }));
    c.push(B.text({ x: xs[i] + 8, y: y + 8, text: String(i + 1), size: 16, color: T.muted, font: F.mono }));
    c.push(B.text({ x: xs[i] + 14, y: y + 55, text: txt, size: 12, color: T.ink }));
    c.push(B.rect({ x: xs[i], y: y + 150, w: 210, h: 40, color: T.muted, rounded: false }));
    c.push(B.text({ x: xs[i] + 10, y: y + 162, text: pie, size: 11, color: T.muted }));
  });
  seccion('16 · Storyboard — escenario de uso', c);
}

// ─── Ubicar los bloques y recién ahí calzarles el frame ──────────────────────
B.packRows(bloques.map((b) => b.els), { x: 0, y: 0, maxWidth: 3000, gap: 160 });

bloques.forEach(({ nombre, els: contenido }) => {
  const b = B.bounds(contenido);
  const pad = 26;
  frames.push(B.frame({
    x: b.x - pad, y: b.y - pad, w: b.width + pad * 2, h: b.height + pad * 2,
    name: nombre, children: contenido,
  }));
  els.push(...contenido);
});

// Chequeo final: ningún frame puede pisar a otro.
frames.forEach((a, i) => frames.slice(i + 1).forEach((b) => {
  if (a.x < b.x + b.width && a.x + a.width > b.x
    && a.y < b.y + b.height && a.y + a.height > b.y) {
    throw new Error(`frames superpuestos: "${a.name}" / "${b.name}"`);
  }
}));

const todo = B.bounds(els);
els.unshift(B.text({
  x: todo.x, y: todo.y - 190,
  text: 'App de tabatas HIIT — los 16 casos de uso',
  size: 44, color: T.ink, font: F.hand,
}));
els.unshift(B.text({
  x: todo.x, y: todo.y - 125,
  text: 'Cada bloque aplica las reglas de casos-de-uso.md. Comparar el conector del bloque 3\n(flechas = secuencia) contra el del 6 (líneas sin punta = contenencia).',
  size: 16, color: T.muted, font: F.hand,
}));

const doc = B.document([...frames, ...els], { theme: 'light', name: 'tabatas-hiit-casos-de-uso' });
fs.writeFileSync(process.argv[2], JSON.stringify(doc, null, 2));
console.log('secciones:', frames.length, '| elementos:', doc.elements.length);
