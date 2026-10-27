# Plan de Reestructuración UI/UX Profesional (After Effects & Huashu-Design)

Reorganización integral de la interfaz de **VectorMotion Studio** para eliminar colisiones de menús, solapamientos en pantalla completa y elementos flotantes redundantes, implementando una arquitectura de espacio de trabajo modular acoplado de alto rendimiento inspirada en Adobe After Effects / Premiere Pro y en los principios de diseño de **Huashu-Design** y **UI/UX Pro Max**.

---

## 1. Diagnóstico de Problemas Actuales en la Interfaz

1. **Colisión en la Barra Superior (`TopNav`)**:
   - Se renderiza simultáneamente una barra de menú de escritorio completa (11 menús desplegables) junto con más de 12 botones de acción directa (Plantillas, Guías, Live Sync, MCP IA, PSD, Zoom, Reframe, Exportar, etc.).
   - En monitores 1080p, laptops o pantallas divididas, los elementos colapsan o se sobreponen entre sí al no caber en una sola línea.
2. **Duplicidad de Menús y Acciones**:
   - Las mismas funciones (Deshacer, Ajustes, Plantillas, Easing, Exportar) aparecen triplicadas: en la barra de menú superior, en botones de barra de herramientas, en el inspector y en menús contextuales.
3. **Solapas Flotantes Invasivas en Bordes de Pantalla**:
   - Los botones de restauración flotantes a los lados (`#restore-toolbar-left-tab` y `#restore-inspector-right-tab`) interfieren con el puntero en el lienzo y con las barras de desplazamiento.
4. **Superposición de HUDs en el Canvas**:
   - El HUD flotante de transporte inferior compite por espacio con el cabezal de reproducción y la línea de tiempo.

---

## 2. Arquitectura de la Nueva Interfaz Profesional (Estilo After Effects)

La aplicación se dividirá en 4 niveles estrictamente delimitados con layout `flex-col h-screen overflow-hidden bg-zinc-950`:

### Nivel 1: Barra de Menú Global Compacta (32px de altura)
* **Izquierda**: Logo VectorMotion + Menús desplegables estándar de estudio:
  - `Archivo` (Nuevo, Abrir JSON, Guardar JSON, Importar SVG, Importar PSD, Exportar MP4/HTML5/JSON).
  - `Editar` (Deshacer Ctrl+Z, Rehacer Ctrl+Y, Duplicar Ctrl+D, Eliminar Del, Paleta de Comandos Ctrl+K).
  - `Composición` (Ajustes de Composición, Reframe Inteligente, Color de Fondo, Plantillas).
  - `Capa` (Nueva Capa: Texto, Rectángulo, Círculo, Estrella, Polígono, Ordenar capas, Transformar).
  - `Animación` (Presets GSAP, Curvas de Easing, Animar Trazo/Trim, Vibración/Wiggle, Resplandor/Glow).
  - `Ventana / Espacios` (Espacio por Defecto, Animación, Efectos, Banners, Alternar Paneles).
  - `Ayuda / MCP` (Servidor MCP OpenCode, Huashu Design Guide, Atajos de Teclado).
* **Centro**: Selector de Espacio de Trabajo rápido (segmented tabs: `Animación`, `Diseño`, `Efectos`, `Compacto`).
* **Derecha**: Estado del Servidor MCP (`MCP IA`), Conexión en Vivo y Botón primario de `Exportar`.

### Nivel 2: Ribbon Contextual y Herramientas (40px de altura)
* **Bloque Izquierdo (Herramientas de Edición)**:
  - Botones iconográficos estilizados con atajos: Selección (`V`), Mano/Pan (`H`), Rectángulo (`R`), Círculo (`O`), Estrella (`S`), Polígono (`P`), Texto (`T`).
* **Bloque Central (Alineación y Ayudas Visuales)**:
  - Alinear (Izquierda, Centro H/V, Derecha), Imán/Snap a cuadrícula, Mostrar Cuadrícula, Mostrar Reglas, Guías de Seguridad.
* **Bloque Derecho (Transporte y Visualización)**:
  - Timecode numérico editable `00:00:00 / 04:00`, Play/Pause con barra espaciadora, Zoom de Viewport desplegable (`50%`, `75%`, `100%`, `Ajustar`), y selector de formato rápido (`1:1`, `9:16`, `16:9`).

### Nivel 3: Zona de Trabajo Modular Acoplada (3 Paneles Flexibles)
* **Panel Izquierdo (Proyecto y Capas / Plantillas)**:
  - Pestañas acopladas: `Capas del Proyecto` (árbol con visibilidad, bloqueo y solo) y `Librería & PSD` (catálogo de plantillas y assets).
  - Botón de colapso directo en la cabecera del panel (sin solapas flotantes molestas).
* **Panel Central (Monitor de Composición)**:
  - Lienzo SVG/HTML5 flotante con fondo damero/oscuro, centrado automático y soporte para pan/zoom con rueda y barra espaciadora.
  - Sin elementos flotantes superpuestos; visión despejada del banner.
* **Panel Derecho (Inspector Unificado de Propiedades)**:
  - Pestañas profesionales: `Transformar` (X, Y, Escala, Rotación, Opacidad), `Estilo` (Relleno, Borde, Sombra), `Animación & Easing` (curvas GSAP, presets de entrada/salida) y `Efectos` (Glow, Wiggle, Repeater, Trim).

### Nivel 4: Panel de Línea de Tiempo (Dock Inferior Ajustable)
* Cabecera integrada con regla de segundos y frames, control de bucle, In/Out markers y zoom de línea de tiempo.
* Pista de capas con keyframes visibles en formato rombo (diamond), arrastrables y con interpolación visual.
* Botón de minimizar/maximizar integrado en la barra de título del timeline.

---

## 3. Principios de Diseño Huashu-Design & UI/UX Pro Max Aplicados

1. **Eliminación de Clichés y Píldoras Innecesarias**: Metadatos limpios con separadores tipográficos sutiles (`·`), tipografía tabular para números de tiempo y coordenadas.
2. **Regla de Contraste 60-30-10**:
   - 60% lienzo oscuro neutro (`bg-zinc-950`).
   - 30% superficies estructuradas acopladas (`bg-zinc-900` con bordes ultrafinos `border-zinc-800`).
   - 10% acentos de alta intención (Azul After Effects `#3b82f6` y púrpura MCP `#8b5cf6` en botones activos y keyframes).
3. **Respuesta Elástica en Todo Dispositivo**: Uso de `min-w-0`, `shrink-0` y desbordamiento inteligente con menú overflow ("...") para que nunca colisionen los elementos.

---

## 4. Archivos a Modificar

1. `src/components/TopNav.tsx`:
   - Rediseñar en dos barras compactas de altura fija: MenuBar superior (32px) + Ribbon de Herramientas (40px).
   - Ocultar duplicados y agrupar acciones secundarias en menús desplegables limpios.
2. `src/components/MenuBar.tsx`:
   - Reorganizar menús para consolidar todas las opciones de la aplicación sin redundancia.
3. `src/App.tsx`:
   - Eliminar solapas flotantes en los bordes y el HUD flotante inferior.
   - Ajustar el contenedor principal a un grid o flex acoplado de 3 columnas + timeline inferior.
4. `src/components/Timeline.tsx`:
   - Asegurar que la cabecera del timeline integre sus propios controles de reproducción y zoom sin requerir HUDs flotantes externos.
5. `src/components/Inspector.tsx` y `src/components/Toolbar.tsx`:
   - Integrar perfectamente en los docks izquierdo y derecho con cabeceras estilizadas al estilo After Effects.

---

## 5. Criterios de Aceptación y Verificación

1. **Prueba de Pantalla Completa y Responsive**: Redimensionar la ventana desde 1024px hasta 4K; ningún menú debe colapsar, romperse o superponerse.
2. **Flujo de Trabajo After Effects**: Los paneles deben sentirse profesionales, integrados y predecibles.
3. **Compilación y Cero Errores**: Ejecutar `compile_applet` y `lint_applet` para garantizar 0 errores de TypeScript y empaquetado.
