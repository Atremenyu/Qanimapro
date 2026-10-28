# DOCUMENTACIÓN TÉCNICA Y OPERATIVA INTEGRAL: VECTORBITMAP / HTMLMOTION ENGINE
> **Destinatario:** Agentes de Inteligencia Artificial e Ingenieros de Software de Sistemas.  
> **Propósito:** Especificación técnica completa, formal, matemática y operativa del núcleo funcional, motores de cálculo, estructuras de datos, pipelines de exportación y protocolos de integración, omitiendo detalles de UI/UX visual para permitir la reconstrucción determinista y fidedigna de la aplicación.

---

## 1. VISIÓN GENERAL DEL SISTEMA Y ARQUITECTURA CORE

VectorMotion Studio es un motor de gráficos vectoriales 2D animados y entorno de autoría de banners web interactivos concebido para estándares de la industria digital publicitaria (Google Ads, IAB, DoubleClick) y motion graphics programáticos.

### 1.1 Principios de Diseño del Motor
1. **Independencia en Tiempo de Ejecución (Zero-Dependency Exports):** Las animaciones exportadas para Google Ads y banners web no contienen librerías de terceros (ni GSAP, ni Lottie Web, ni Anime.js). Todo el cálculo de curvas cúbicas de Bézier, interpolaciones escalares/vectoriales, cálculo de color y ticks de 60 FPS está resuelto en un micro-motor JavaScript puro (~3 KB) embebido directamente en el HTML.
2. **Evaluación Funcional Pura:** La posición, rotación, escala, opacidad y parámetros de estilo de cada capa en un instante $t$ se obtienen mediante funciones puras de evaluación temporal: $S(t) = f(\text{Layer}, t, \text{Composition})$.
3. **Representación Vectorial Estándar:** El modelo interno serializa directamente a primitivas SVG (`<rect>`, `<ellipse>`, `<path>`, `<text>`, `<image>`) con aceleración por hardware (`will-change: transform`, `transform-origin`).
4. **Cumplimiento Estricto de Especificaciones Publicitarias:**
   - Salida compatible con Google Ads / IAB: etiqueta `<meta name="ad.size">`, soporte para variable global `clickTag`, límites de peso (<150 KB gzip), y bloqueo dimensional estricto en píxeles tanto para contenedores `<iframe>` fijos como adaptables.

---

## 2. MODELO DE DATOS Y CONTRATOS DE TIPOS (DATA SCHEMAS)

Toda la aplicación opera sobre estructuras de datos JSON serializables e inmutables. El archivo central de definiciones es `src/types.ts`.

### 2.1 Primitivas Animables y Keyframing

```typescript
export type LayerType =
  | 'rect'
  | 'circle'
  | 'star'
  | 'polygon'
  | 'path'
  | 'text'
  | 'line'
  | 'group'
  | 'image';

export type EasingType =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'cubicBezier'
  | 'bounce'
  | 'elastic'
  | 'elasticOut'
  | 'back'
  | 'hold'
  | 'power2In'
  | 'power2Out'
  | 'power2InOut'
  | 'expoOut'
  | 'circOut';

export interface BezierHandle {
  x: number; // Coordenada X normalizada [0..1]
  y: number; // Coordenada Y normalizada [0..1]
}

export interface Keyframe<T> {
  id: string;              // Identificador único (ej: "kf_171920_ab3f")
  time: number;            // Posición en la línea de tiempo en segundos (>= 0)
  value: T;                // Valor de la propiedad en este keyframe
  easing: EasingType;      // Curva de aceleración hacia el siguiente keyframe
  handleIn?: BezierHandle; // Handle tangente de entrada para cubicBezier (ej: {x: 0.25, y: 1.0})
  handleOut?: BezierHandle;// Handle tangente de salida para cubicBezier (ej: {x: 0.25, y: 0.1})
}

export interface AnimatableProp<T> {
  value: T;                // Valor estático por defecto si isKeyframed === false
  isKeyframed: boolean;   // Booleano indicador de interpolación activa
  keyframes: Keyframe<T>[];// Lista ordenada de keyframes cronológicos
}
```

### 2.2 Transformaciones Geométricas (`LayerTransform`)

```typescript
export interface LayerTransform {
  position: AnimatableProp<{ x: number; y: number }>;
  scale: AnimatableProp<{ x: number; y: number }>;      // Porcentaje: 100 = 1x escala normal
  rotation: AnimatableProp<number>;                    // Grados angulares (-360 a +360)
  opacity: AnimatableProp<number>;                     // Escala porcentual [0..100]
  anchorPoint: AnimatableProp<{ x: number; y: number }>; // Punto de anclaje relativo al centro
  skew: AnimatableProp<{ x: number; y: number }>;        // Grados de cizallamiento
}
```

### 2.3 Estilos de Capa (`LayerStyle`)

```typescript
export interface LayerStyle {
  fill: AnimatableProp<string>;           // Hexadecimal (#ffffff), rgb() o 'none'
  fillOpacity: AnimatableProp<number>;    // 0..100
  fillType: 'solid' | 'linear-gradient' | 'radial-gradient' | 'none';
  gradientStops?: { offset: number; color: string }[];
  gradientAngle?: number;                 // Grados (0..360)
  stroke: AnimatableProp<string>;
  strokeWidth: AnimatableProp<number>;
  strokeOpacity: AnimatableProp<number>;
  strokeDashArray: AnimatableProp<string>; // SVG stroke-dasharray (ej: "5 5")
  trimStart: AnimatableProp<number>;      // Animación de trazo (0..100%)
  trimEnd: AnimatableProp<number>;        // Animación de trazo (0..100%)
  trimOffset: AnimatableProp<number>;     // Desplazamiento angular (0..360 deg)
  lineCap: 'round' | 'butt' | 'square';
  lineJoin: 'round' | 'miter' | 'bevel';
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge';
  blur: AnimatableProp<number>;           // Píxeles de desenfoque gaussiano
  shadowColor: string;
  shadowBlur: AnimatableProp<number>;
  shadowOffsetX: number;
  shadowOffsetY: number;
}
```

### 2.4 Geometrías Específicas de Capa

- **Rectángulo (`RectGeometry`):** `width: AnimatableProp<number>`, `height: AnimatableProp<number>`, `cornerRadius: AnimatableProp<number>`.
- **Círculo / Elipse (`CircleGeometry`):** `radiusX: AnimatableProp<number>`, `radiusY: AnimatableProp<number>`.
- **Estrella (`StarGeometry`):** `points: AnimatableProp<number>`, `outerRadius: AnimatableProp<number>`, `innerRadius: AnimatableProp<number>`.
- **Polígono Regular (`PolygonGeometry`):** `sides: AnimatableProp<number>`, `radius: AnimatableProp<number>`.
- **Trazado Bézier Arbitrario (`PathGeometry`):** `d: string` (trazado SVG), `nodes?: PathNode[]` (nodos de edición continua con `handleIn` y `handleOut`), `closed?: boolean`.
- **Texto Vectorial (`TextGeometry`):** `text: string`, `fontSize: AnimatableProp<number>`, `fontFamily: string`, `fontWeight: string | number`, `letterSpacing: AnimatableProp<number>`, `textAlign: 'left' | 'center' | 'right'`, `textAnchor?: 'start' | 'middle' | 'end'`, `lineHeight?: number`.
- **Imagen Bitmap (`ImageGeometry`):** `src: string` (DataURL base64 o URL estática), `width: AnimatableProp<number>`, `height: AnimatableProp<number>`, `fileName?: string`, `mimeType?: string`, `scalingMode?: 'contain' | 'cover' | 'fill' | 'none'`, `filters?: ImageFilters` (brightness, contrast, saturate, hueRotate, blur, grayscale, sepia, invert), `flipHorizontal?: boolean`, `flipVertical?: boolean`.

### 2.5 Modificadores Procedurales (`LayerModifier`)

Permite aplicar expresiones y multiplicadores dinámicos similares a After Effects sin requerir keyframes explícitos:

```typescript
export interface LayerModifier {
  id: string;
  type: 'repeater' | 'wiggle' | 'wave';
  enabled: boolean;
  repeater?: {
    copies: number;                   // Cantidad de réplicas en cascada
    offset: { x: number; y: number }; // Desplazamiento vectorial por copia
    rotationOffset: number;           // Rotación incremental por copia (grados)
    scaleOffset: { x: number; y: number }; // Multiplicador de escala por copia
    opacityOffset: number;            // Caída de opacidad por copia
  };
  wiggle?: {
    frequency: number;                // Frecuencia en Hercios (Hz)
    positionAmp: number;              // Amplitud de oscilación espacial (px)
    rotationAmp: number;              // Amplitud de oscilación angular (grados)
    scaleAmp: number;                 // Amplitud de escala oscilatoria (%)
  };
}
```

### 2.6 Esquema de Composición (`Composition`)

```typescript
export interface Composition {
  id: string;
  name: string;
  width: number;            // Ancho del lienzo en píxeles
  height: number;           // Alto del lienzo en píxeles
  fps: number;              // Frecuencia de muestreo (30 o 60 FPS)
  duration: number;         // Duración total en segundos
  backgroundColor: string;  // Color de fondo hexadecimal (#000000) o rgba
  layers: VectorLayer[];    // Array ordenado de capas (índice 0 = fondo, N = frente)
  guides?: CustomGuide[];   // Guías de alineación de usuario
  clickTagUrl?: string;     // URL por defecto para anuncios Google Ads
  adStandardFormat?: string;// Identificador IAB (ej: '300x250', '1080x1920', '728x90')
}
```

---

## 3. MOTOR MATEMÁTICO Y DE ANIMACIÓN (`animEngine.ts`)

El archivo `src/utils/animEngine.ts` constituye el procesador matemático de la aplicación.

### 3.1 Solucionador de Bézier Cúbico por Newton-Raphson con Fallback de Bisección

Calcula el progreso temporal $y(t)$ dado un parámetro temporal $x(t) = t$:

$$\begin{aligned}
x(g) &= 3(1-g)^2 g \cdot p_{1x} + 3(1-g) g^2 \cdot p_{2x} + g^3 \\
x'(g) &= 3(1-g)^2 p_{1x} + 6(1-g) g (p_{2x} - p_{1x}) + 3g^2 (1 - p_{2x})
\end{aligned}$$

**Algoritmo Numérico:**
1. Inicializar límites de búsqueda: $\text{start} = 0, \text{end} = 1, g = t$.
2. Ejecutar un bucle iterativo de 8 pasos máximo:
   - Calcular $x(g)$ y la discrepancia $\Delta = x(g) - t$.
   - Si $|\Delta| < 0.001$, convergió la estimación.
   - Calcular la derivada $x'(g)$.
   - Si $|x'(g)| > 10^{-5}$, aplicar paso Newton-Raphson: $g_{k+1} = g_k - \frac{\Delta}{x'(g)}$.
   - En caso contrario (derivada plana), fallback a Bisección: si $\Delta > 0$, $\text{end} = g$; si $\Delta \le 0$, $\text{start} = g$; $g_{k+1} = \frac{\text{start} + \text{end}}{2}$.
   - Clamp de seguridad: $g \in [0, 1]$.
3. Obtener el valor espacial $y(g)$:
   $$y(g) = 3(1-g)^2 g \cdot p_{1y} + 3(1-g) g^2 \cdot p_{2y} + g^3$$

### 3.2 Fórmulas Analíticas de Easing (`evaluateEasing`)

Dado $r \in [0, 1]$:
- **`linear`:** $r$
- **`easeIn`:** $r^3$
- **`easeOut`:** $1 - (1 - r)^3$
- **`easeInOut`:** Si $r < 0.5 \Rightarrow 4r^3$, sino $1 - \frac{(-2r + 2)^3}{2}$
- **`bounce`:** Función cuadrática seccional dividida en 4 zonas de rebote simétrico gravitatorio ($n_1 = 7.5625, d_1 = 2.75$).
- **`elastic`:** $-2^{10r - 10} \cdot \sin\left((10r - 10.75) \cdot \frac{2\pi}{3}\right)$
- **`elasticOut`:** $2^{-10r} \cdot \sin\left((10r - 0.75) \cdot \frac{2\pi}{3}\right) + 1$
- **`back`:** Overshoot cuadrático con factor $s = 1.70158$: $(r - 1)^2 \cdot ((s + 1)(r - 1) + s) + 1$
- **`power2In` / `power2Out` / `power2InOut`:** Aceleración parabólica de segundo orden ($r^2$).
- **`expoOut`:** $1 - 2^{-10r}$
- **`circOut`:** $\sqrt{1 - (r - 1)^2}$

### 3.3 Oscilador Armónico Físico Amortiguado (`evaluateSpring`)

Simula físicas elásticas reales mediante la ecuación diferencial de segundo orden:
$$m \frac{d^2 x}{dt^2} + c \frac{dx}{dt} + k x = 0$$

Parámetros de entrada:
- Tensión $k \in [10, 300]$
- Amortiguamiento $c \in [1, 50]$
- Masa $m \in [0.1, 5.0]$
- Frecuencia natural no amortiguada: $\omega_0 = \sqrt{\frac{k}{m}}$
- Razón de amortiguamiento adimensional: $\zeta = \frac{c}{2\sqrt{m \cdot k}}$

**Comportamiento según $\zeta$:**
- **Régimen Subamortiguado ($\zeta < 1$):**
  $$\omega_d = \omega_0 \sqrt{1 - \zeta^2}$$
  $$x(t) = 1 - e^{-\zeta \omega_0 t} \left(\cos(\omega_d t) + \frac{\zeta}{\sqrt{1 - \zeta^2}} \sin(\omega_d t)\right)$$
- **Régimen Sobreamortiguado ($\zeta \ge 1$):**
  $$x(t) = 1 - e^{-\omega_0 t} (1 + \omega_0 t)$$

### 3.4 Interpolación de Datos Tipados (`lerpNumber`, `lerpPoint`, `lerpColor`)

1. **Escalares:** $\text{lerp}(a, b, t) = a + (b - a) \cdot t$.
2. **Puntos 2D:** $\{x: \text{lerp}(a_x, b_x, t), y: \text{lerp}(a_y, b_y, t)\}$.
3. **Colores RGBA:**
   - Deserializa Hex (#RGB, #RRGGBB, #RRGGBBAA) y cadenas `rgba(r, g, b, a)` a cuartetos numéricos enteros $[r, g, b] \in [0..255]$ y $\alpha \in [0..1]$.
   - Interpola independientemente cada canal en espacio de color lineal.
   - Serializa nuevamente a string optimizado: si $\alpha < 0.99 \Rightarrow \text{rgba}(r,g,b,\alpha)$, si $\alpha \ge 0.99 \Rightarrow \text{#RRGGBB}$.

### 3.5 Pseudo-Ruido Armónico Determinista para Expresiones Wiggle

Para evitar saltos erráticos y garantizar reproducibilidad determinista cuadro a cuadro sin almacenar buffers infinitos:
1. Genera un hash entero de 32 bits a partir del `seed` (ID de la capa + sufijo del eje).
2. Genera 3 fases sinusoidales desfasadas en proporciones de la razón áurea $\phi \approx 1.618$ y el número de Euler $e \approx 2.718$:
   $$v_1 = \sin(\omega t + \phi_1), \quad v_2 = 0.5 \sin(1.618 \omega t + \phi_2), \quad v_3 = 0.25 \cos(2.718 \omega t + \phi_3)$$
3. La desviación final es: $\text{offset} = \frac{v_1 + v_2 + v_3}{1.75} \cdot \text{amplitud}$.

### 3.6 Generadores Geométricos de Trazados SVG

- **Estrella Regular (`generateStarPath(points, outerRadius, innerRadius)`):**
  Calcula $2N$ vértices alternando entre radio exterior e interior con ángulo incremental $\theta_i = \frac{i \pi}{N} - \frac{\pi}{2}$. Retorna la cadena de comando SVG: `M x0 y0 L x1 y1 ... Z`.
- **Polígono Regular (`generatePolygonPath(sides, radius)`):**
  Calcula $N$ vértices equiespaciados angularmente con ángulo $\theta_i = \frac{2\pi i}{N} - \frac{\pi}{2}$.

### 3.7 Evaluación Cinemática con Jerarquía Padre/Hijo (`evaluateLayer`)

Cuando una capa posee `parentLayerId`:
1. El motor evalúa recursivamente la capa padre en el instante $t - \text{lagSeconds}$ (lo que produce el efecto orgánico de arrastre por inercia).
2. La posición absoluta se calcula como:
   $$\vec{P}_{\text{final}} = \vec{P}_{\text{padre}} + \vec{P}_{\text{hijo}}$$
3. La rotación y la escala se multiplican por los factores del padre si están habilitadas en `parentFollowOptions`.
4. El motor cuenta con un protector de recursión finita (`depth > 10`) para prevenir bloqueos por referencias circulares.

---

## 4. MOTOR DE EXPORTACIÓN Y PIPELINE DE SALIDA (`exportEngine.ts`)

El archivo `src/utils/exportEngine.ts` genera los artefactos finales para producción publicitaria y de software.

### 4.1 Exportador Google Ads / IAB HTML5 Autónomo (`generateStandaloneHTML5`)

Produce un archivo HTML5 monolítico, autónomo y listo para incrustarse en redes programáticas (Google Display Network, DoubleClick, AdSense, Sizmek, Adform).

#### Reglas Estrictas de Dimensionamiento:
- En `<head>`: `<meta name="ad.size" content="width=${comp.width},height=${comp.height}">`.
- En el script: declaración global estándar de `clickTag`:
  ```html
  <script type="text/javascript">
    var clickTag = "${clickTagUrl}";
  </script>
  ```
- **Dimensiones Exactas del Canvas (Fixing Viewport Sizing):**
  Tanto `html` como `body` deben poseer dimensiones fijas coincidentes con el lienzo del usuario:
  ```css
  html {
    width: ${comp.width}px;
    height: ${comp.height}px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: ${comp.backgroundColor};
  }
  body {
    width: ${comp.width}px;
    height: ${comp.height}px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: ${comp.backgroundColor};
    user-select: none;
    -webkit-user-select: none;
    position: absolute;
    top: 0;
    left: 0;
  }
  #ad-container {
    position: absolute;
    top: 0;
    left: 0;
    width: ${comp.width}px;
    height: ${comp.height}px;
    background-color: ${comp.backgroundColor};
    overflow: hidden;
    cursor: pointer;
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
  }
  svg.ad-stage {
    width: ${comp.width}px;
    height: ${comp.height}px;
    display: block;
    overflow: hidden;
  }
  ```
- **Auto-escalado Proporcional en iframes Fluidos:**
  Si `isResponsive === true` y el contenedor iframe padre posee dimensiones distintas a la base del banner, la función interna `fitStageToIframe` computa:
  $$\text{scale} = \min\left(\frac{W_{\text{iframe}}}{W_{\text{base}}}, \frac{H_{\text{iframe}}}{H_{\text{base}}}\right)$$
  Aplica `document.body.style.transform = 'scale(' + scale + ')'` con origen en `0 0`, manteniendo los vectores infinitamente nítidos y sin letterboxing.

### 4.2 Empaquetador de Paquetes ZIP (`generateHTML5ZipBundle`)

Utiliza `jszip` para generar el bundle comprimido estándar para envío a plataformas de publicidad:
1. `index.html`: Banner HTML que enlaza a imágenes relativas mediante etiquetas estándar `<img>` (modo `files`), eliminando cadenas pesadas en base64 para maximizar el rendimiento de descarga.
2. Carpeta `images/`: Contiene los archivos binarios de imagen (PNG, JPG, SVG, WebP, GIF) en su resolución nativa.
3. `manifest.json`: Manifiesto IAB oficial con nombre de campaña, versión, dimensiones y lista exhaustiva de activos.

### 4.3 Generador de Snippets de Incrustación `<iframe>` (`generateIFrameSnippet`)

- **Modo Fijo (Google Ads IAB):**
  ```html
  <iframe
    src="banner.html"
    width="300"
    height="250"
    title="Banner"
    frameborder="0"
    scrolling="no"
    marginwidth="0"
    marginheight="0"
    allowtransparency="true"
    style="width:300px;height:250px;border:0;overflow:hidden;display:inline-block;vertical-align:top;"
  ></iframe>
  ```
- **Modo Adaptable Proporcional:**
  ```html
  <div style="position:relative;width:100%;max-width:1080px;aspect-ratio:1080/1920;margin:0 auto;overflow:hidden;">
    <iframe
      src="banner.html"
      title="Banner"
      width="1080"
      height="1920"
      frameborder="0"
      scrolling="no"
      marginwidth="0"
      marginheight="0"
      allowtransparency="true"
      style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;overflow:hidden;display:block;"
    ></iframe>
  </div>
  ```

### 4.4 Generador de Componentes React TSX (`generateReactComponent`)

Genera un componente funcional autónomo con `useRef`, `useEffect` y loop `requestAnimationFrame` embebido, exponiendo propiedades: `autoPlay`, `loop`, `maxLoops`, `loopDelay`, `responsive`, `className` y `onClick`.

### 4.5 Generador de Animaciones CSS Puras (`generateCSSKeyframes`)

Traduce los keyframes del motor a reglas CSS `@keyframes vm-anim-layer-N` con propiedades de aceleración por hardware (`translate3d`, `rotate`, `scale`, `opacity`). No requiere JavaScript para su ejecución en navegadores.

### 4.6 Generador Lottie JSON (`generateLottieJSON`)

Serializa la composición a la especificación estándar Bodymovin v5.9.0, mapeando:
- Propiedades transformadas: $o \rightarrow$ opacidad, $r \rightarrow$ rotación, $p \rightarrow$ posición, $a \rightarrow$ punto de anclaje, $s \rightarrow$ escala.
- Cuadros de entrada (`ip = 0`) y de salida (`op = duration * fps`).

---

## 5. HERRAMIENTAS CINEMÁTICAS, ESPACIALES Y DE ALINEACIÓN (`figmaTools.ts`)

### 5.1 Algoritmos de Alineación y Distribución Espacial

Opera sobre las Cajas Envolventes Alineadas con los Ejes (AABB):
$$\text{AABB} = \{\min X, \max X, \min Y, \max Y, \text{centerX}, \text{centerY}, \text{width}, \text{height}\}$$

1. **Alineación a Límites:**
   - Izquierda: $X_{\text{nuevo}} = X_{\text{objetivo}} + \frac{W_i}{2}$.
   - Centro Horizontal: $X_{\text{nuevo}} = X_{\text{objetivo\_centro}}$.
   - Derecha: $X_{\text{nuevo}} = X_{\text{objetivo}} - \frac{W_i}{2}$.
   - Arriba: $Y_{\text{nuevo}} = Y_{\text{objetivo}} + \frac{H_i}{2}$.
   - Centro Vertical: $Y_{\text{nuevo}} = Y_{\text{objetivo\_centro}}$.
   - Abajo: $Y_{\text{nuevo}} = Y_{\text{objetivo}} - \frac{H_i}{2}$.
2. **Distribución Equidistante:**
   - Ordena los centros de capas por su eje coordenado.
   - Calcula el espacio disponible: $\text{gap} = \frac{\text{Espacio Total} - \sum \text{Dimensiones}}{N - 1}$.
   - Reubica cada elemento $i$ de manera determinista preservando el orden original.

### 5.2 Detección Magnética Inteligente (Smart Snapping)

Evalúa la posición propuesta de un elemento durante el arrastre frente a todas las demás capas visibles, bordes del lienzo y guías personalizadas:
- **Umbral de Proximidad:** 10 píxeles métricos en espacio de pantalla.
- **Puntos Magnéticos Analizados por Capa:** Min, Centro y Max en ambos ejes X e Y (9 puntos de anclaje por objeto).
- Retorna las coordenadas bloqueadas y las líneas guía de visualización magnética (`SnapGuideLine`).

### 5.3 Motor de Re-encuadre Inteligente (`Reframe`)

Permite migrar instantáneamente una composición completa entre diferentes formatos y relaciones de aspecto (ej: de 16:9 [1920x1080] a 9:16 [1080x1920] para Instagram Stories o 1:1 [1080x1080] para Feed):
1. Calcula el factor de escala uniforme: $S = \min\left(\frac{W_{\text{nuevo}}}{W_{\text{viejo}}}, \frac{H_{\text{nuevo}}}{H_{\text{viejo}}}\right)$.
2. Calcula los desplazamientos de centrado:
   $$\Delta X = \frac{W_{\text{nuevo}} - W_{\text{viejo}} \cdot S}{2}, \quad \Delta Y = \frac{H_{\text{nuevo}} - H_{\text{viejo}} \cdot S}{2}$$
3. Transforma proporcionalmente los keyframes de posición, tamaño de fuentes, dimensiones de imágenes y radios de todas las capas sin perder coherencia visual.

---

## 6. PROCESADOR E IMPORTADOR DE ARCHIVOS PHOTOSHOP PSD (`psdImporter.ts`)

Permite importar archivos nativos de Adobe Photoshop (`.psd`, `.psb`) directamente en el navegador utilizando la librería `ag-psd`.

### 6.1 Pipeline de Decodificación
1. **Lectura Binaria:** Lee el archivo mediante `FileReader` como `ArrayBuffer`.
2. **Extracción Estructurada:** Ejecuta `readPsd(buffer, { skipThumbnail: true })`.
3. **Mapeo Recursivo de Capas:**
   - Dimensiones absolutas de capa: `width = layer.right - layer.left`, `height = layer.bottom - layer.top`.
   - Centroide de posición: $X = \text{left} + \frac{W}{2}, Y = \text{top} + \frac{H}{2}$.
   - Opacidad: Normalizada de $[0..1]$ a $[0..100]$.
   - Modos de fusión de Photoshop mapeados a blend-modes de CSS (`multiply`, `screen`, `overlay`, etc.).
   - Extracción de contenido de texto: Fuentes, tamaños, colores y alineación de capas tipográficas nativas de Photoshop.
   - Rasterización de capas de mapa de bits a DataURLs PNG de alta fidelidad vía HTML Canvas.
4. Genera un arreglo de `VectorLayer` directamente compatible con el motor de composición.

---

## 7. PROTOCOLO DE SINCRONIZACIÓN EN TIEMPO REAL Y MODEL CONTEXT PROTOCOL (`realtimeSync.ts` & MCP SERVER)

### 7.1 Arquitectura Híbrida de Sincronización
La aplicación se comunica entre pestañas locales, ventanas remotas y asistentes AI mediante tres canales concurrentes:
1. **`BroadcastChannel` ('vectormotion_sync_channel'):** Comunicación inter-pestañas en el mismo navegador sin latencia de red.
2. **WebSocket Client (`ws://localhost:49222`):** Sincronización en red local para entornos colaborativos multi-dispositivo.
3. **Servidor MCP (`mcp-server/index.ts`):** Protocolo JSON-RPC estándar para que agentes autónomos de IA manipulen el proyecto en caliente.

### 7.2 Diccionario de Eventos de Sincronización (`SyncMessage`)

```typescript
export interface SyncMessage {
  type:
    | 'STATE_UPDATE'        // Transmisión de composición completa
    | 'LAYER_TRANSFORM'     // Actualización delta de transform de capa
    | 'LAYER_SELECTION'     // Sincronización de selección de elementos
    | 'TIMELINE_SCRUB'      // Movimiento del cabezal de reproducción (playhead)
    | 'PLAY_STATE'          // Reproducción / Pausa
    | 'TOOL_SELECT'         // Cambio de herramienta activa
    | 'UNDO_TRIGGER'        // Petición remota de Undo
    | 'REDO_TRIGGER'        // Petición remota de Redo
    | 'HEARTBEAT';          // Pulso de presencia
  clientId: string;
  timestamp: number;
  payload: any;
}
```

### 7.3 Herramientas Expuestas para Agentes AI en el Servidor MCP

El servidor (`mcp-server/index.ts`) expone las siguientes herramientas estructuradas vía JSON-RPC:
- `get_composition_state`: Devuelve el árbol completo de composición serializado en JSON.
- `update_layer_transform`: Modifica posición, escala, rotación u opacidad de una capa específica.
- `add_keyframe`: Inserta un nuevo punto clave con valor e interpolación en un segundo $t$ determinado.
- `add_vector_layer`: Crea una nueva capa de tipo rectángulo, elipse, estrella, texto o trazado en las coordenadas especificadas.
- `apply_motion_preset`: Inyecta una biblioteca de curvas y keyframes predefinidos sobre la capa seleccionada.
- `trigger_export`: Ejecuta la exportación programática a HTML5 standalone o paquete ZIP.

---

## 8. CATÁLOGO DE PRESETS Y PLANTILLAS DE MOVIMIENTO (`presets.ts` & `richTemplates.ts`)

La aplicación cuenta con más de 40 definiciones matemáticas de animación que los agentes pueden reutilizar directamente en sus operaciones:

### 8.1 Categorías de Presets
1. **Tipografía Cinética (`text-*`):**
   - *Kinetic Highlight Box:* Genera caja envolvente animada con revelado simultáneo de texto.
   - *Split Baseline Rise:* Aparición vertical desde línea de base con aceleración de potencia 3 y rebote sutil.
   - *Kinetic Letter Stretch:* Distorsión temporal del ancho de caracteres vía escala horizontal compensada.
   - *DrawSVG Text Outline Write-On:* Animación procedural de `trimStart` y `trimEnd` emulando escritura caligráfica.
2. **Entrada Dinámica (`in-*`):**
   - *Bento Card Stagger Rise:* Cascada vertical con amortiguamiento físico spring ($k=180, c=18$).
   - *Lateral Inertia Pan:* Desplazamiento horizontal de cámara con retraso inercial entre capas hijas.
3. **Bucles Continuos (`loop-*`):**
   - *Neon Glow Breathing Pulse:* Modulación senoidal periódica de `shadowBlur` y `strokeOpacity`.
   - *360° Infinite Orbit:* Rotación continua infinita calculada sobre el punto de anclaje.
   - *Infinity Lemniscate Float:* Oscilación orbital en forma de figura 8 combinando componentes armónicos cruzados.
4. **Énfasis (`emphasis-*`):**
   - *Rubber Band Snap:* Estiramiento en eje X con compresión proporcional en eje Y conservando el área visual.
   - *Tada Wobble:* Serie de micro-oscilaciones angulares alternas con pico de escala a mitad de ciclo.

---

## 9. CICLO DE VIDA OPERATIVO Y MÁQUINA DE ESTADOS (STATE ENGINE & GAME LOOP)

### 9.1 Bucle de Animación a 60 FPS (Game Loop)
La actualización de la interfaz y la reproducción continua se rigen por un loop estricto de `requestAnimationFrame`:
```typescript
let lastTime = performance.now();
const loop = (now: number) => {
  const delta = (now - lastTime) / 1000;
  lastTime = now;
  setCurrentTime((prev) => {
    const next = prev + delta;
    if (next >= composition.duration) {
      return 0; // Reinicio en bucle continuo
    }
    return next;
  });
  frameId = requestAnimationFrame(loop);
};
```

### 9.2 Máquina de Estados del Historial de Deshacer/Rehacer (Undo/Redo)
Para garantizar determinismo absoluto sin efectos secundarios ni mutaciones no deseadas:
- **`past`:** Pila inmutable de estados anteriores `Composition[]` (límite: 30 pasos).
- **`present`:** Estado activo `Composition`.
- **`future`:** Pila inmutable de estados posteriores para avance de rehacer.
- Toda acción que modifica estructura o propiedades (mover capas, añadir keyframes, aplicar estilos) invoca previamente `pushHistory(composition)` clonando profundamente el estado mediante `JSON.parse(JSON.stringify(composition))`.

### 9.3 Gestión Asíncrona de Fuentes Tipográficas (`preloadCompositionFonts`)
Antes de renderizar o exportar capas de texto, el motor inspecciona todas las fuentes de las capas tipográficas y construye de forma asíncrona las hojas de estilo dinámicas de Google Fonts mediante la API `@import url('https://fonts.googleapis.com/css2?family=...')`, precargando los pesos 400, 600, 700 y 900 para garantizar que los anchos de los glifos se computen con exactitud sin retrasos de layout.

---

## 10. GUÍA PASO A PASO PARA RECREACIÓN DE LA APLICACIÓN POR UN AGENTE AI

Si un agente de IA necesita reimplementar o crear un nuevo frontend/backend sobre este motor, debe seguir el siguiente orden secuencial de construcción:

1. **Paso 1: Definir los Contratos de Datos (`types.ts`):** Copiar e implementar las interfaces inmutables de `Composition`, `VectorLayer`, `AnimatableProp<T>`, `Keyframe<T>` y `LayerModifier`.
2. **Paso 2: Implementar el Motor Matemático (`animEngine.ts`):** Construir en primer lugar `solveCubicBezier`, `evaluateEasing`, `evaluateSpring`, `lerpNumber`, `lerpPoint`, `lerpColor` y el evaluador jerárquico `evaluateLayer`.
3. **Paso 3: Construir el Canvas Viewport y Renderizador SVG:** Implementar un componente de lienzo que tome una `Composition` y un `currentTime` numérico, evalúe todas las capas con `evaluateLayer(layer, currentTime)` y pinte nodos SVG puros (`<rect>`, `<ellipse>`, `<path>`, `<text>`, `<foreignObject>`).
4. **Paso 4: Integrar el Bucle de Tiempo y Controles de Transporte:** Conectar un hook de 60 FPS con `requestAnimationFrame` que controle el parámetro `currentTime` entre $0$ y `duration`.
5. **Paso 5: Implementar el Motor de Exportación (`exportEngine.ts`):**
   - Asegurar el bloqueo de tamaño de lienzo estricto en píxeles sobre `html, body` para evitar fugas en iframes.
   - Embeber el micro-solucionador de Bézier de 8 iteraciones dentro de la plantilla autónoma HTML5.
   - Proveer la generación de paquete ZIP con `manifest.json` y carpeta `images/` mediante `jszip`.
6. **Paso 6: Conectar las Herramientas Cinemáticas y Espaciales (`figmaTools.ts`):** Añadir alineación espacial basada en AABB, snapping magnético con umbral de 10px y re-encuadre inteligente entre relaciones de aspecto.
7. **Paso 7: Conectar Protocolos de Integración:** Habilitar el servidor MCP (`mcp-server/index.ts`) para control programático externo y canal de sincronización `BroadcastChannel` para tiempo real.
