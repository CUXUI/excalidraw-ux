# Guía de estilo

## Regla central

**Contorno fino, sin relleno.** El interior de cada forma queda transparente. Esto es lo que separa este estilo del "explicador colorido" genérico (cajas rellenas de pastel): aquí el registro es el de documentación técnica dibujada a mano, no el de infografía.

El color va en el **contorno y el texto**, nunca en el relleno.

Única excepción: los bloques de gray-box / content massing, que sí llevan relleno gris — ahí el relleno *es* la información (volumen de contenido).

## Color — semántico, nunca decorativo

| Rol | Claro | Oscuro | Significa |
|---|---|---|---|
| Neutro | `#1e1e1e` | `#e9ecef` | Estructura, texto sin marcar |
| Apagado | `#868e96` | `#868e96` | Secundario, placeholder, deshabilitado |
| Verde | `#2f9e44` | `#40c057` | Positivo, activo, confirmado, camino default |
| Coral | `#e8590c` | `#ff8787` | Alerta, error, excepción, anotación crítica |
| Violeta | `#6741d9` | `#b197fc` | Agrupación, contenedor, metadato |
| Masa | `#ced4da` | `#343a40` | Relleno de bloques de contenido |

Regla: si el color no cambia el significado, no va. Tres colores es lo habitual; más de tres exige leyenda.

**Contraste:** en modo oscuro el coral y el verde suben de luminosidad a propósito. No usar los valores del modo claro sobre fondo oscuro: pierden legibilidad.

## Tipografía — dos familias

| Familia | `FONT` | Para qué |
|---|---|---|
| Hand-drawn (Excalifont) | `FONT.hand` (1) | Títulos, anotaciones, nombres de pantalla, etiquetas de flecha |
| Mono (Cascadia) | `FONT.mono` (3) | Contenido **dentro** de una pantalla o wireframe |

La lógica: lo hand-drawn es la voz de quien dibuja; lo mono es el contenido del producto. Esa distinción hace que se lea de un vistazo qué es comentario y qué es interfaz.

En diagramas puramente conceptuales, sin pantallas, todo puede ir en hand-drawn.

**Tamaños mínimos:** 14px para texto de contenido, 13px para etiquetas auxiliares. Más chico no se lee proyectado ni en una captura comprimida.

## Forma

| Propiedad | Valor | Por qué |
|---|---|---|
| `strokeWidth` | 1 | Trazo fino; 2+ es para énfasis puntual (íconos, líneas de blueprint) |
| `roughness` | 1 | Wobble medio. `0` parece hecho por computadora, `2` parece caricatura |
| `backgroundColor` | `transparent` | Siempre, salvo gray-box |
| Rectángulos | `roundness: {type: 3}` | Esquinas redondeadas |
| Rombos | `roundness: {type: 2}` | |
| Punteado | `strokeStyle: 'dashed'` | Camino alternativo, agrupación, anotación, estado deshabilitado |

## Fondo

- Claro: `#ffffff`
- Oscuro: `#0d0d0d` — casi negro, no negro puro ni gris

## Íconos

Líneas simples, no ilustraciones. Una campana con una diagonal = silenciado. Un círculo = indicador. Un trazo de tres puntos = check. Si un ícono necesita más detalle del que dan dos o tres formas, es señal de que ese diagrama conviene por la vía de imagen IA y no construido a mano.

---

## Prefijo de estilo para el pipeline de IA

Este texto va al principio del prompt. Está escrito para funcionar **sin** imagen de referencia; si se pasa una, mejora la fidelidad pero no es requisito.

### Modo claro

```
Excalidraw-style hand-drawn sketch on a completely plain white background (#ffffff) — no texture, no paper grain, no noise, flat and uniform.

Shapes have THIN OUTLINE ONLY — absolutely no solid color fill. The interior of every shape stays white, exactly like an unfilled shape in Excalidraw. Outlines are 1-2px with a RESTRAINED hand-drawn wobble: slightly uneven and clearly drawn by hand, but precise and neat — closer to a careful architect's sketch than to a cartoon. Corners are soft and may not meet perfectly.

Two typefaces coexist: loose hand-drawn lettering (like Virgil/Excalifont) for titles, annotations and labels; and a small plain monospace hand-lettering (like a code font) for any content shown INSIDE a screen or interface mockup.

Color is used ONLY to carry meaning, never decoratively: dark charcoal (#1e1e1e) for neutral structure, green (#2f9e44) for active/confirmed/default paths, coral-orange (#e8590c) for alerts, errors and exceptions, gray (#868e96) for secondary or placeholder content. Arrows are thin freehand lines with small rough triangular heads, colored to match the branch they belong to.

Do NOT include: solid color fills inside shapes, gradients, drop shadows, 3D effects, textured or off-white backgrounds, hatching, pencil shading, photos, stock illustration.
```

### Modo oscuro

Igual al anterior, cambiando el primer párrafo y los colores:

```
…on a completely plain dark background — EXACTLY #0d0d0d, not pure black, not gray, flat and uniform everywhere.

Outlines and hand-lettering are light gray (#e9ecef). Color meanings: light gray (#e9ecef) neutral structure, green (#40c057) active/confirmed, coral (#ff8787) alert/exception, gray (#868e96) secondary. The interior of every shape stays the same #0d0d0d as the background.

Do NOT include: light or white backgrounds, solid fills, gradients, shadows, texture.
```

### Reglas al describir los elementos

- Cada elemento lleva **posición explícita** ("arriba a la izquierda", "debajo del rombo") y **color explícito con hex**. Nunca dejar el color a criterio del modelo.
- Repetir "thin outline only, no fill" en cada elemento. Es la instrucción que más se pierde.
- Describir los íconos como escena física ("una campanita dibujada a mano con una línea diagonal cruzándola"), no como concepto ("ícono de silencio").
- Entrecomillar el texto exacto de cada etiqueta y aclarar que no se agregue nada más.
- Mantener el texto total corto: menos de 30 palabras en toda la imagen. Los modelos de imagen deforman las palabras largas.
