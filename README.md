# VectorMotion Studio

**VectorMotion Studio** es una estación de trabajo completa para diseño y animación gráfica basada en vectores y capas estilo After Effects / Animate en la web. Permite componer gráficos, importar archivos PSD con extracción automática de capas, generar curvas de animación mediante keyframes bezier/easing y exportar paquetes interactivos ultraligeros en HTML5/GSAP listos para producción y publicidad digital.

---

## 📸 Guía Visual & Capturas de Pantalla

> *A continuación encontrarás las secciones preparadas con el pie de foto y descripción exacta de lo que debes capturar en pantalla para reemplazarlas posteriormente.*

### 1. Interfaz Principal & Espacio de Trabajo
<!-- Espacio para Captura 1: Vista general del editor completo -->
![Vista General del Editor](https://placehold.co/1200x675/18181b/ffffff?text=Captura+1:+Vista+General+del+Editor)
* **Pie de foto sugerido:** *Captura de la interfaz completa de VectorMotion Studio con el lienzo central, la barra de herramientas lateral, la línea de tiempo inferior con keyframes y el inspector de propiedades a la derecha.*
* **Qué capturar:** Abre cualquier banner o proyecto de ejemplo (ej. "Anuncio: Minimal Swiss"), asegurándote de que la línea de tiempo y el inspector lateral estén desplegados.

---

### 2. Inspector de Propiedades & Curvas de Animación
<!-- Espacio para Captura 2: Inspector de Transformación, Estilo y Editor de Curvas -->
![Inspector y Curvas](https://placehold.co/1200x675/18181b/ffffff?text=Captura+2:+Inspector+de+Propiedades+y+Curvas)
* **Pie de foto sugerido:** *Panel de inspección de capa activa mostrando controles de Transformación (Posición, Escala, Rotación, Opacidad, Anclaje), Estilos Vectoriales y el Editor de Curvas de velocidad (Graph Editor).*
* **Qué capturar:** Selecciona una capa con movimiento (como un botón CTA o titular), abre la pestaña **Transform** o activa el botón **Curvas** en la línea de tiempo para mostrar el editor gráfico de curvas bézier.

---

### 3. Importador de PSD con Extracción de Capas
<!-- Espacio para Captura 3: Modal de Importación PSD -->
![Importador PSD](https://placehold.co/1200x675/18181b/ffffff?text=Captura+3:+Importador+PSD+a+Capas+Vectoriales)
* **Pie de foto sugerido:** *Herramienta de extracción automática de archivos Photoshop (.PSD), convirtiendo grupos, textos y formas en capas editables y animables en HTML5.*
* **Qué capturar:** Haz clic en el botón superior **Importar PSD** para desplegar el modal interactivo de subida y previsualización de capas.

---

### 4. Exportador Micro-Package HTML5 & Formatos Publicitarios
<!-- Espacio para Captura 4: Modal de Exportación HTML5 / ZIP -->
![Exportador HTML5](https://placehold.co/1200x675/18181b/ffffff?text=Captura+4:+Exportador+HTML5+Micro-Package)
* **Pie de foto sugerido:** *Exportación de animaciones en paquetes HTML5 ZIP autónomos optimizados (<150KB), compatibles con Google Ads, Display & Video 360, IAB y banners web estándar.*
* **Qué capturar:** Haz clic en **Export HTML5** en la barra superior para mostrar el panel de previsualización de código, ajustes de compresión y botón de descarga directa en ZIP.

---

### 5. Modo Tablet & Gestos Táctiles (Swipe to Dismiss)
<!-- Espacio para Captura 5: Interfaz adaptable / Modo Tablet -->
![Modo Tablet y Gestos](https://placehold.co/1200x675/18181b/ffffff?text=Captura+5:+Modo+Tablet+y+Controles+Flotantes)
* **Pie de foto sugerido:** *Modo táctil adaptable con soporte para gestos swipe para ocultar paneles y HUD flotante de transporte para animación en pantalla completa.*
* **Qué capturar:** Activa el modo de vista Tablet o desliza la línea de tiempo hacia abajo para visualizar el HUD flotante de reproducción rápida sobre el lienzo despejado.

---

## 🚀 Características Principales

1. **Línea de Tiempo Multipista Avanzada**:
   - Soporte para keyframes independientes por propiedad (Posición X/Y, Escala, Rotación, Opacidad, Bordes, Colores).
   - Interpolación Bézier personalizada con presets (*Ease In, Ease Out, Elastic, Bounce, Linear*).
   - Grabación automática de fotogramas clave (*Auto-Keyframing*).
   - Marcador de reproducción con ajuste milimétrico y visualización de fotogramas/tiempo.

2. **Herramientas Vectoriales y de Diseño**:
   - Capas de Texto, Rectángulos, Elipses, Vectores SVG e Imágenes rasterizadas.
   - Puntos de anclaje interactivos con transformaciones de pivote en tiempo real.
   - Gestión de jerarquías de capas con bloqueo, visibilidad y reordenamiento por arrastre.

3. **Importación Inteligente**:
   - Parser nativo de Photoshop `.PSD` que descompone capas, textos, vectores y estilos para animar al instante.
   - Biblioteca de plantillas preconfiguradas con estándares IAB (Medium Rectangle 300x250, Leaderboard 728x90, Half Page 300x600, etc.).

4. **Exportación de Alto Rendimiento**:
   - Generación de código HTML5 + CSS3 + GSAP ultra-optimizado.
   - Empaquetado automático en archivo `.ZIP` listo para subir a servidores de anuncios y plataformas web.
   - Vista previa interactiva en tiempo real sin recargar.

5. **Ergonomía y Espacios de Trabajo Flexibles**:
   - Modos de visualización: Estándar, Modo Enfoque (*Focus Canvas*), Modo Tablet táctil.
   - Gestos táctiles de deslizamiento (*Swipe-to-dismiss*) para despejar paneles secundarios.
   - Sistema de menús adaptativos con menú de desbordamiento "*Más ▾*" para evitar solapamientos en cualquier resolución.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
* **Animación:** Motion, GSAP
* **Procesamiento de Archivos:** ag-psd (Photoshop PSD Parser), JSZip
* **Iconografía:** Lucide Icons
