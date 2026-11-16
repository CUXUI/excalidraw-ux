# Casos de uso y reglas

Qué diagrama corresponde a cada pedido, y las reglas de cada uno. Las convenciones vienen de práctica establecida (NN/g, IxDF, ISO 5807, Garrett) — no son gusto personal, y romperlas hace que el diagrama comunique otra cosa de la que se quiso decir.

---

## Reglas transversales

Estas cuatro aplican a todo. Son las que más rápido delatan un diagrama mal hecho.

### 1. Dos tipos de conector, nunca mezclados

| Conector | Significa | Se usa en |
|---|---|---|
| Línea **con** punta (`connect`) | Secuencia, transición, "va hacia" | Flujos, journeys, estados, blueprints |
| Línea **sin** punta (`link`) | Contenencia, jerarquía, "está dentro de" | Sitemaps, árboles de IA, mapas mentales |

Un sitemap con flechas está mal: dice que el usuario navega en ese orden, cuando en realidad dice que una sección contiene a otra.

### 2. Un eje, un significado

- **Horizontal = tiempo** (flujos, journey, blueprint, swimlanes).
- **Vertical = profundidad jerárquica** (sitemap) **o** distancia a la persona usuaria (blueprint) **o** actor (swimlane).

Nunca dos significados en el mismo eje del mismo diagrama. Si la posición vertical significa "es más profundo en el árbol" y además "pasa después", el diagrama es ilegible.

### 3. Escalera de fidelidad — no mezclar peldaños

```
caja abstracta  →  wireframe  →  pantalla hi-fi
(task/user flow)   (wireflow)     (screenflow)
```

Mezclar niveles en un mismo diagrama es la marca más visible de trabajo amateur. Si tres nodos son cajas con una palabra y el cuarto es una pantalla dibujada, hay que elegir uno.

### 4. Leyenda obligatoria

Si el diagrama usa **3+ formas distintas**, **2+ estilos de línea**, o **sale del equipo que lo dibujó** → lleva leyenda. Usar `legend()` del builder.

### 5. Reglas de contenido

- **Nada de lorem ipsum.** Contenido real o etiqueta de tipo ("3 cards", "titular"), nunca texto falso: el texto falso esconde problemas de longitud y jerarquía.
- **Anotación ≠ contenido.** El comentario sobre el diseño va visualmente distinto del diseño (usar `note()`, contorno punteado y color de alerta). Si se confunden, alguien va a implementar la nota.
- **Etiquetas específicas.** "Continuar" y "Procesar" no dicen nada. "Confirmar pago" sí.

---

## Nivel 1 — Los que más se usan

### Wireframe

Layout de una pantalla, sin diseño visual.

- **Layout:** una pantalla por marco; si hay varias, misma medida y alineadas en grilla.
- **Notación:** `screen()` o `browser()` de `ui-kit`, con `navbar`, `button`, `input`, `listRow`, `imageBox`, `textLines` adentro.
- **NO va:** color decorativo, tipografía de marca, fotos reales, sombras. Cualquier cosa que invite feedback de estética en vez de estructura.
- **Fidelidad:** empezar lo-fi. Si el pedido es "¿dónde va cada cosa?", `textLines` y `massBlock` alcanzan; no dibujar contenido real todavía.

### User flow

Todos los caminos viables de una persona usuaria para lograr algo, **con** decisiones.

- **Layout:** izquierda→derecha el camino principal, ramas hacia abajo. El camino feliz tiene que ser una línea recta visualmente dominante.
- **Notación:** óvalo = inicio/fin, rectángulo = pantalla, **rombo = decisión** con las dos salidas etiquetadas. Línea sólida = camino principal, punteada (`dashed: true`) = alternativo.
- **NO va:** mezclar granularidad (una pantalla y un micro-gesto al mismo nivel); rombos con una sola salida; nodos sueltos sin conectar; omitir estados de error y el botón "volver".
- **Siempre lleva persona usuaria declarada.** Un user flow sin decir de quién es, es un task flow mal hecho.

### Task flow

Los pasos para **una** tarea concreta. **Sin ramas.**

- **Layout:** cadena lineal, un inicio y un fin. Sin loops.
- **Notación:** cajas y flechas, nada más. No hace falta vocabulario de formas porque no hay nada que desambiguar.
- **NO va:** ningún rombo. En cuanto aparece una decisión, dejó de ser task flow y pasó a ser user flow. Tampoco varias personas usuarias, ni emociones, ni casos de error.

### Wireflow

La combinación: **wireframes como nodos**, conectados por flechas. Es lo que corresponde cuando importa qué ve la persona en cada paso, no solo el orden.

- **Cuándo:** apps con pocas pantallas únicas cuyo contenido cambia según la interacción — ahí un user flow abstracto pierde el contexto de pantalla.
- **Regla que lo define:** la flecha sale **del elemento de UI que dispara la transición** (el botón), no del borde del marco. Es todo el punto del formato. Con el builder: `connect(boton[0], siguientePantalla[0])`, no `connect(pantallaA[0], pantallaB[0])`.
- **NO va:** diseño visual hi-fi (eso es screenflow); el set completo de símbolos ANSI — la capa de flujo se mantiene simple; wireflows para sitios estáticos multipágina (ahí van wireframes + sitemap).

### Diagrama de flujo (lógica de sistema)

Cuando lo que se documenta es la lógica, incluyendo lo que la persona usuaria nunca ve.

- **Layout:** izquierda→derecha y arriba→abajo. Un terminador de entrada, uno o más de salida.
- **Notación (ISO 5807):** óvalo = inicio/fin, rectángulo = proceso, rombo = decisión, paralelogramo = entrada/salida, cilindro = base de datos.
- **NO va:** formas inventadas; rombos sin etiquetar las salidas; decisiones con una sola salida; personas usuarias o pantallas (eso es user flow).

---

## Nivel 2 — Frecuentes

### Arquitectura de información / sitemap

Ojo: **no son sinónimos.** La IA es la práctica de organizar y nombrar; el sitemap es el diagrama. El sitemap es una parte de la IA, no toda.

- **Layout:** árbol **de arriba hacia abajo**. Home es la raíz única. Hermanos ordenados de izquierda a derecha por prioridad. Nunca secuencial horizontal.
- **Notación:** `link()` — **líneas sin punta**. Numeración jerárquica (1.0, 1.1, 1.1.1). Color o forma para distinguir tipos de página (estática, listado dinámico, externa, con login).
- **NO va:** flechas; estados de interacción; modales como si fueran páginas; layouts de pantalla.

### Estados de UI (state diagram)

Todos los estados que puede tener un componente o pantalla, y qué evento lleva de uno a otro.

- **Diferencia clave con user flow:** los nodos son **condiciones de la misma UI**, no pantallas en secuencia. No es cronológico: los ciclos son correctos y esperables.
- **Layout:** sin eje temporal. Radial alrededor del estado default, o izquierda→derecha desde el inicial.
- **Notación:** rectángulo redondeado = estado; círculo lleno = pseudoestado inicial; transiciones etiquetadas `evento [condición] / acción`; auto-loops permitidos.
- **NO va:** pantallas como nodos; transiciones sin etiquetar; y sobre todo — **faltar los estados vacío, de carga y de error**, que es la omisión más común y la que más rompe en desarrollo.

### Priority guide (lista priorizada de contenido)

Lo que se pide como "content massing" casi siempre es esto, y no es lo mismo que un gray-box. Ver la nota de abajo.

- **Qué es:** una lista **de una sola columna**, ordenada de mayor a menor prioridad, **sin ninguna decisión de layout**.
- **Layout:** una columna. Arriba = más importante. Sin dimensión horizontal (la posición horizontal metería layout por la ventana de atrás).
- **NO va:** columnas, menús de navegación, copy final, ningún estilo visual.
- **Por qué sirve:** la jerarquía sobrevive a todos los breakpoints, cosa que un wireframe no hace.

### Gray-box / bloques de contenido

El pariente 2D del anterior: bloques grises sobre el marco real de la pantalla.

- **Layout:** 2D, sigue la pantalla real.
- **Notación:** `massBlock()` rotulado por **tipo y volumen** ("Hero", "3 cards", "Testimonios ×2"), nunca con texto real.
- **NO va:** color decorativo, tipografía de marca, fotos. Fidelidad suficiente como para que alguien opine del diseño visual.

### Crítica anotada

Una pantalla existente con comentarios flotantes. **Es el caso de uso más directo para mentorías y revisiones de portfolio.**

- **Notación:** la pantalla en neutro; los comentarios con `note()` — contorno punteado, color semántico (coral = problema, verde = está bien resuelto), con línea fina hacia el punto exacto.
- **Regla:** el comentario nunca encima de lo que comenta. Al costado, con línea.

### Matriz 2×2 / priorización

Impacto-esfuerzo, valor-complejidad. Barata de hacer y se usa constantemente.

- **Notación:** dos ejes etiquetados **en los dos extremos** (no solo en uno), cuatro cuadrantes nombrados, ítems como puntos o cajas chicas.
- **NO va:** cuadrantes sin nombre; ejes sin dirección declarada (¿arriba es más o menos?).

---

## Nivel 3 — Menos frecuentes pero valen

### Journey map

El recorrido de **una** persona usuaria hacia un objetivo, con emoción.

- **Layout:** línea de tiempo horizontal, tres zonas apiladas: (A) actor + escenario, (B) fases × acciones / pensamientos / emoción, (C) hallazgos y oportunidades.
- **Notación:** la emoción es **una línea continua** que cruza las fases, no íconos sueltos. Los pensamientos, idealmente citas textuales de research.
- **NO va:** procesos internos de la organización (eso es blueprint); pantallas; más de una persona usuaria por mapa; una línea de emoción plana (si es plana, no hay nada que mostrar).
- **Honestidad:** si está basado en supuestos y no en research, hay que rotularlo como hipótesis.

### Service blueprint

Extiende el journey hacia abajo, hacia la organización.

- **Layout:** acciones de la persona usuaria arriba en horizontal; carriles hacia abajo en orden fijo: acciones → frontstage → backstage → procesos de soporte.
- **Notación:** las **tres líneas nombradas** son obligatorias — interacción, visibilidad, interacción interna. Sin ellas es apenas un swimlane. Flechas verticales para las dependencias entre carriles.
- **NO va:** hacerlo antes de tener el journey del estado actual.

### Swimlanes

Un flujo partido por quién es responsable de cada paso.

- **Cuándo:** solo si hay más de un actor **y** la responsabilidad importa. Si una sola persona hace todo el proceso, un flujo común comunica igual y es más simple.
- **Notación:** carriles horizontales, tiempo hacia la derecha. Lo importante son **las flechas que cruzan carriles** — cada cruce es un traspaso.
- **NO va:** un paso a caballo entre dos carriles; un carril con una sola caja; carriles para cosas que no son actores (las fases son columnas, no carriles).

### Mapa de afinidad

Agrupación de notas por tema. Sale de toda síntesis de research.

- **Notación:** notas chicas del mismo tamaño, agrupadas por cercanía física, con etiqueta de tema arriba de cada grupo. El grupo se marca con contorno punteado, no con relleno.

### Storyboard

Secuencia de viñetas para contar un escenario.

- **Notación:** grilla de paneles del mismo tamaño, con banda de texto abajo de cada uno. Numerados.

---

## Cuándo NO usar este skill

- **Necesita ser clickeable o navegable** → Figma o prototipo. Esto genera imágenes y archivos de dibujo, no prototipos.
- **Es una pieza final para redes o presentación** → esto no tiene identidad de marca; usar el sistema visual que corresponda.
- **Son datos** (barras, líneas, torta, dashboards) → un gráfico hecho a mano miente sobre la precisión de los datos. Usar una herramienta de visualización de datos.
- **Es un diagrama que alguien más tiene que editar en su herramienta** → exportar a `.excalidraw` sí sirve; a imagen, no.

---

## Tabla de decisión rápida

| El pedido suena a… | Es | Conector |
|---|---|---|
| "los pasos para hacer X" | Task flow | Flecha |
| "todo lo que puede pasar cuando alguien intenta X" | User flow | Flecha |
| "cómo se ve cada paso" | Wireflow | Flecha desde el botón |
| "cómo se organiza el sitio / las secciones" | Sitemap | **Línea sin punta** |
| "qué estados tiene este componente" | State diagram | Flecha etiquetada |
| "qué va primero en esta pantalla" | Priority guide | Ninguno (lista) |
| "cuánto espacio ocupa cada cosa" | Gray-box | Ninguno |
| "qué está mal en esta pantalla" | Crítica anotada | Línea fina a la nota |
| "cómo se siente la persona a lo largo de" | Journey map | Línea de emoción |
| "quién hace qué parte" | Swimlanes | Flecha que cruza carriles |
| "qué priorizamos" | Matriz 2×2 | Ninguno |
