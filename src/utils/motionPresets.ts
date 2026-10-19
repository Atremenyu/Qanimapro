import { VectorLayer, Keyframe, AnimatableProp, EasingType } from '../types';

export interface MotionPreset {
  id: string;
  name: string;
  category: 'text' | 'in' | 'emphasis' | 'loop' | 'out';
  description: string;
  duration: number; // in seconds
  icon: string; // identifier or emoji/symbol
  tags: string[];
  apply: (layer: VectorLayer, startTime: number, duration?: number) => VectorLayer;
}

function makeKf<T>(
  time: number,
  value: T,
  easing: EasingType = 'easeOut'
): Keyframe<T> {
  return {
    id: `kf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    time: Math.max(0, +time.toFixed(3)),
    value,
    easing,
  };
}

function ensureKeyframedProp<T>(
  prop: AnimatableProp<T>,
  newKeyframes: Keyframe<T>[]
): AnimatableProp<T> {
  const existingKf = prop.keyframes || [];
  // Merge keyframes, replacing any close in time (<0.03s)
  const merged: Keyframe<T>[] = [...existingKf];

  newKeyframes.forEach((newK) => {
    const idx = merged.findIndex((k) => Math.abs(k.time - newK.time) < 0.03);
    if (idx >= 0) {
      merged[idx] = newK;
    } else {
      merged.push(newK);
    }
  });

  merged.sort((a, b) => a.time - b.time);

  return {
    ...prop,
    isKeyframed: true,
    keyframes: merged,
  };
}

export function createPresetClonedLayer(layer: VectorLayer): VectorLayer {
  const cloned: VectorLayer = JSON.parse(JSON.stringify(layer));
  cloned.expandedInTimeline = true;
  return cloned;
}

export const MOTION_PRESETS: MotionPreset[] = [
  // ==========================================
  // 1. ANIMACIONES DE TEXTO & TIPOGRAFÍA CREATIVA (GSAP & SPLIT STYLE)
  // ==========================================
  {
    id: 'text-kinetic-highlight-box',
    name: 'Kinetic Highlight Box (Estilo Video Viral)',
    category: 'text',
    description: 'Inspirado en el video: bloque de resalte verde lima que entra con aceleración suave y expande bajo las palabras clave.',
    duration: 0.7,
    icon: '🟩',
    tags: ['texto', 'highlight', 'resalte', 'kinetic', 'gsap', 'viral', 'video'],
    apply: (layer, t0, dur = 0.7) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.3, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y + 40 }, 'power2Out'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x * 0.85, y: baseScale.y * 0.85 }, 'power2Out'),
        makeKf(t0 + dur * 0.7, { x: baseScale.x * 1.05, y: baseScale.y * 1.05 }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'text-split-baseline-rise',
    name: 'Split Baseline Rise (Khanh Nguyen Style)',
    category: 'text',
    description: 'Deslizamiento vertical ascendente desde la línea de base con amortiguación suave GSAP SplitText.',
    duration: 0.75,
    icon: '📐',
    tags: ['split text', 'khanh nguyen', 'baseline', 'texto', 'slide up', 'gsap'],
    apply: (layer, t0, dur = 0.75) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.4, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y + 60 }, 'power2Out'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'text-blur-focus-in',
    name: 'Blur to Focus Reveal',
    category: 'text',
    description: 'Efecto de enfoque cinemático: de desenfocado a nítido con escalado de precisión.',
    duration: 0.8,
    icon: '🔍',
    tags: ['blur', 'enfoque', 'focus', 'texto', 'cinematic'],
    apply: (layer, t0, dur = 0.8) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur, targetOp, 'linear'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x * 0.92, y: baseScale.y * 0.92 }, 'power2Out'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      if (cloned.style?.blur) {
        cloned.style.blur = ensureKeyframedProp(cloned.style.blur, [
          makeKf(t0, 16, 'power2Out'),
          makeKf(t0 + dur, 0, 'power2Out'),
        ]);
      }

      return cloned;
    },
  },
  {
    id: 'text-kinetic-stretch',
    name: 'Kinetic Letter Stretch',
    category: 'text',
    description: 'Expansión tipográfica de alta energía: compresión horizontal que se expande a su tamaño natural.',
    duration: 0.65,
    icon: '↔️',
    tags: ['stretch', 'kinetic', 'tracking', 'escala horizontal', 'streetwear'],
    apply: (layer, t0, dur = 0.65) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.3, targetOp, 'linear'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x * 1.35, y: baseScale.y * 0.7 }, 'back'),
        makeKf(t0 + dur * 0.65, { x: baseScale.x * 0.95, y: baseScale.y * 1.05 }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'text-elastic-snap',
    name: 'Elastic Snap Baseline',
    category: 'text',
    description: 'Caída veloz con retroceso elástico en la línea base con personalidad moderna.',
    duration: 0.7,
    icon: '⚡',
    tags: ['elastic', 'snap', 'rebote', 'bounce', 'texto'],
    apply: (layer, t0, dur = 0.7) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.2, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y - 70 }, 'power2Out'),
        makeKf(t0 + dur * 0.65, { x: basePos.x, y: basePos.y + 8 }, 'easeInOut'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'text-video-mask-reveal',
    name: 'Video Mask Wave Reveal',
    category: 'text',
    description: 'Emula el efecto viral de video dentro de tipografía con ascenso cinemático de escala y deslizamiento suave.',
    duration: 0.85,
    icon: '🎬',
    tags: ['video en texto', 'mascara', 'clip', 'reveal', 'cinematic', 'gsap'],
    apply: (layer, t0, dur = 0.85) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.25, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y + 80 }, 'power2Out'),
        makeKf(t0 + dur * 0.7, { x: basePos.x, y: basePos.y - 6 }, 'easeInOut'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x * 0.75, y: baseScale.y * 1.3 }, 'power2Out'),
        makeKf(t0 + dur * 0.6, { x: baseScale.x * 1.06, y: baseScale.y * 0.96 }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'text-drawsvg-outline-reveal',
    name: 'DrawSVG Text Outline Write-On',
    category: 'text',
    description: 'Inspirado en DrawSVG de GSAP: trazo perimetral que se dibuja progresivamente revelando luego el relleno sólido.',
    duration: 1.1,
    icon: '✒️',
    tags: ['draw svg', 'stroke', 'write on', 'contorno', 'gsap', 'khanh nguyen'],
    apply: (layer, t0, dur = 1.1) => {
      const cloned = createPresetClonedLayer(layer);
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.15, targetOp, 'linear'),
      ]);

      if (cloned.style?.trimEnd) {
        cloned.style.trimEnd = ensureKeyframedProp(cloned.style.trimEnd, [
          makeKf(t0, 0, 'power2Out'),
          makeKf(t0 + dur * 0.75, 100, 'power2Out'),
        ]);
      }

      if (cloned.style?.fillOpacity) {
        cloned.style.fillOpacity = ensureKeyframedProp(cloned.style.fillOpacity, [
          makeKf(t0, 0, 'linear'),
          makeKf(t0 + dur * 0.6, 0, 'linear'),
          makeKf(t0 + dur, 100, 'power2Out'),
        ]);
      }

      return cloned;
    },
  },
  {
    id: 'text-skew-glitch-snap',
    name: 'Skew Glitch & Snap (Khanh Nguyen Style)',
    category: 'text',
    description: 'Inclinación angular extrema de -18° inspirada en portfolios contemporáneos con snap instantáneo a 0°.',
    duration: 0.6,
    icon: '📐',
    tags: ['skew', 'glitch', 'khanh nguyen', 'snap', 'inclinacion', 'acid'],
    apply: (layer, t0, dur = 0.6) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseSkew = layer.transform.skew.value || { x: 0, y: 0 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.2, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x - 60, y: basePos.y }, 'power2Out'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'back'),
      ]);

      cloned.transform.skew = ensureKeyframedProp(cloned.transform.skew, [
        makeKf(t0, { x: baseSkew.x - 22, y: baseSkew.y }, 'power2Out'),
        makeKf(t0 + dur * 0.65, { x: baseSkew.x + 4, y: baseSkew.y }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseSkew.x, y: baseSkew.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'text-overshoot-char-drop',
    name: 'Overshoot Character Drop',
    category: 'text',
    description: 'Caída de texto desde arriba con amortiguación elástica de aterrizaje e inercia de rebote.',
    duration: 0.75,
    icon: '🎯',
    tags: ['drop', 'overshoot', 'caida', 'rebote', 'elastic', 'texto'],
    apply: (layer, t0, dur = 0.75) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.2, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y - 120 }, 'power2In'),
        makeKf(t0 + dur * 0.6, { x: basePos.x, y: basePos.y + 12 }, 'easeOut'),
        makeKf(t0 + dur * 0.82, { x: basePos.x, y: basePos.y - 4 }, 'easeInOut'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x * 0.9, y: baseScale.y * 1.2 }, 'linear'),
        makeKf(t0 + dur * 0.6, { x: baseScale.x * 1.15, y: baseScale.y * 0.85 }, 'easeOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },

  // ==========================================
  // 2. ENTRADAS / IN (SMOOTH, MODERN & GSAP TRANSITIONS)
  // ==========================================
  {
    id: 'in-floating-browser-tilt',
    name: '3D Floating Window (Mockup del Video)',
    category: 'in',
    description: 'Inspirado en el video: ventana de navegador que entra flotando desde abajo con leve rotación y asentamiento suave.',
    duration: 0.9,
    icon: '🪟',
    tags: ['browser', 'mockup', 'ventana', 'flotante', '3d', 'tilt', 'video'],
    apply: (layer, t0, dur = 0.9) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseRot = layer.transform.rotation.value || 0;
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.35, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y + 120 }, 'power2Out'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      cloned.transform.rotation = ensureKeyframedProp(cloned.transform.rotation, [
        makeKf(t0, baseRot - 4, 'power2Out'),
        makeKf(t0 + dur, baseRot, 'power2Out'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x * 0.88, y: baseScale.y * 0.88 }, 'power2Out'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'in-bento-card-cascade',
    name: 'Bento Card Stagger Rise',
    category: 'in',
    description: 'Inspirado en la escena de servicios del video: tarjeta Bento que sube con aceleración exponencial y resorte.',
    duration: 0.7,
    icon: '🍱',
    tags: ['bento', 'tarjeta', 'grid', 'stagger', 'cascada', 'video'],
    apply: (layer, t0, dur = 0.7) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.3, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y + 90 }, 'back'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x * 0.9, y: baseScale.y * 0.9 }, 'back'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'in-svg-draw-border',
    name: 'DrawSVG Border Trace',
    category: 'in',
    description: 'Emula el plugin DrawSVG de GSAP: trazo que se dibuja fluidamente recorriendo el contorno del elemento.',
    duration: 1.0,
    icon: '✏️',
    tags: ['draw svg', 'trazo', 'borde', 'stroke', 'gsap', 'dibujar'],
    apply: (layer, t0, dur = 1.0) => {
      const cloned = createPresetClonedLayer(layer);
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.15, targetOp, 'linear'),
      ]);

      if (cloned.style?.trimEnd) {
        cloned.style.trimEnd = ensureKeyframedProp(cloned.style.trimEnd, [
          makeKf(t0, 0, 'easeInOut'),
          makeKf(t0 + dur, 100, 'easeInOut'),
        ]);
      }

      return cloned;
    },
  },
  {
    id: 'in-lateral-camera-pan',
    name: 'Lateral Inertia Pan (Transición de Escena)',
    category: 'in',
    description: 'Inspirado en los cambios de sección del video: entrada horizontal desde la derecha con suave amortiguación de cámara.',
    duration: 0.8,
    icon: '➡️',
    tags: ['pan', 'lateral', 'transicion', 'camara', 'inercia', 'video'],
    apply: (layer, t0, dur = 0.8) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.35, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x + 220, y: basePos.y }, 'power2Out'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'in-counter-number-pop',
    name: 'Metric Counter Spring Pop',
    category: 'in',
    description: 'Inspirado en los contadores métricos del video (45 · 24 · 12): número que salta desde 0 con rebote y energía.',
    duration: 0.7,
    icon: '🔢',
    tags: ['contador', 'metricas', 'pop', 'numero', 'video', 'rebote'],
    apply: (layer, t0, dur = 0.7) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.25, targetOp, 'linear'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: 0, y: 0 }, 'back'),
        makeKf(t0 + dur * 0.7, { x: baseScale.x * 1.15, y: baseScale.y * 1.15 }, 'power2Out'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'easeInOut'),
      ]);

      return cloned;
    },
  },
  {
    id: 'fade-in',
    name: 'Fade In (Aparición Clásica)',
    category: 'in',
    description: 'Aparición suave de opacidad 0% a 100% con aceleración estándar.',
    duration: 0.6,
    icon: '✨',
    tags: ['opacidad', 'suave', 'intro', 'fade', 'gsap'],
    apply: (layer, t0, dur = 0.6) => {
      const cloned = createPresetClonedLayer(layer);
      const targetOp = layer.transform.opacity.value || 100;
      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur, targetOp, 'linear'),
      ]);
      return cloned;
    },
  },
  {
    id: 'pop-bounce-in',
    name: 'Pop Bounce (Rebote Elástico)',
    category: 'in',
    description: 'Aparece escalando desde 0% con un rebote dinámico estilo After Effects.',
    duration: 0.75,
    icon: '💥',
    tags: ['escala', 'rebote', 'pop', 'elastic', 'bounce', 'gsap'],
    apply: (layer, t0, dur = 0.75) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'easeOut'),
        makeKf(t0 + dur * 0.35, targetOp, 'linear'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: 0, y: 0 }, 'back'),
        makeKf(t0 + dur * 0.6, { x: baseScale.x * 1.12, y: baseScale.y * 1.12 }, 'easeOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'easeInOut'),
      ]);

      return cloned;
    },
  },
  {
    id: 'in-diagonal-wipe-zoom',
    name: 'Diagonal Zoom & Settle',
    category: 'in',
    description: 'Entrada diagonal dinámica desde la esquina inferior izquierda con ampliación de 30% a 100% y rotación suave.',
    duration: 0.8,
    icon: '↗️',
    tags: ['diagonal', 'zoom', 'entrada', 'smooth', 'moderno', 'gsap'],
    apply: (layer, t0, dur = 0.8) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const baseRot = layer.transform.rotation.value || 0;
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.3, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x - 140, y: basePos.y + 140 }, 'power2Out'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x * 0.35, y: baseScale.y * 0.35 }, 'back'),
        makeKf(t0 + dur * 0.7, { x: baseScale.x * 1.05, y: baseScale.y * 1.05 }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      cloned.transform.rotation = ensureKeyframedProp(cloned.transform.rotation, [
        makeKf(t0, baseRot - 8, 'power2Out'),
        makeKf(t0 + dur, baseRot, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'in-elastic-jelly-squash',
    name: 'Jelly Squash & Stretch',
    category: 'in',
    description: 'Efecto de gelatina elástica con deformación física coordinada en X e Y para un impacto lúdico y moderno.',
    duration: 0.85,
    icon: '🍮',
    tags: ['jelly', 'squash', 'stretch', 'gelatina', 'elastic', 'alocado'],
    apply: (layer, t0, dur = 0.85) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.2, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y - 100 }, 'power2In'),
        makeKf(t0 + dur * 0.45, { x: basePos.x, y: basePos.y }, 'easeOut'),
        makeKf(t0 + dur * 0.7, { x: basePos.x, y: basePos.y - 12 }, 'easeInOut'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x * 0.6, y: baseScale.y * 1.4 }, 'power2In'),
        makeKf(t0 + dur * 0.45, { x: baseScale.x * 1.35, y: baseScale.y * 0.7 }, 'easeOut'),
        makeKf(t0 + dur * 0.7, { x: baseScale.x * 0.9, y: baseScale.y * 1.1 }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'in-curtain-reveal-swipe',
    name: 'Curtain Reveal Swipe',
    category: 'in',
    description: 'Barrido teatral estilo cortina con apertura de escala horizontal de 0% a 100% y desplazamiento sutil.',
    duration: 0.7,
    icon: '🎭',
    tags: ['curtain', 'cortina', 'swipe', 'reveal', 'smooth'],
    apply: (layer, t0, dur = 0.7) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const targetOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, 0, 'power2Out'),
        makeKf(t0 + dur * 0.25, targetOp, 'linear'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x - 50, y: basePos.y }, 'power2Out'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'power2Out'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: 0, y: baseScale.y }, 'power2Out'),
        makeKf(t0 + dur * 0.7, { x: baseScale.x * 1.05, y: baseScale.y }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },

  // ==========================================
  // 3. BUCLES & LOOPS CONTINUOS (AMBIENT MOTION)
  // ==========================================
  {
    id: 'loop-ambient-hover',
    name: 'Floating Ambient Hover (Levitación Continua)',
    category: 'loop',
    description: 'Inspirado en las tarjetas flotantes del video: levitación armónica suave arriba y abajo en bucle cerrado de 4 segundos.',
    duration: 4.0,
    icon: '🌊',
    tags: ['loop', 'bucle', 'hover', 'flotante', 'levitacion', 'ambient', 'video'],
    apply: (layer, t0, dur = 4.0) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y }, 'easeInOut'),
        makeKf(t0 + dur * 0.25, { x: basePos.x, y: basePos.y - 14 }, 'easeInOut'),
        makeKf(t0 + dur * 0.5, { x: basePos.x, y: basePos.y }, 'easeInOut'),
        makeKf(t0 + dur * 0.75, { x: basePos.x, y: basePos.y + 14 }, 'easeInOut'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'easeInOut'),
      ]);

      return cloned;
    },
  },
  {
    id: 'loop-neon-breathe',
    name: 'Neon Glow Breathing Pulse',
    category: 'loop',
    description: 'Inspirado en los resplandores tecnológicos del video: pulso continuo de brillo y escala sutil.',
    duration: 3.6,
    icon: '💚',
    tags: ['neon', 'glow', 'resplandor', 'respiracion', 'pulse', 'loop'],
    apply: (layer, t0, dur = 3.6) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x, y: baseScale.y }, 'easeInOut'),
        makeKf(t0 + dur * 0.5, { x: baseScale.x * 1.04, y: baseScale.y * 1.04 }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'easeInOut'),
      ]);

      if (cloned.style?.shadowBlur) {
        cloned.style.shadowBlur = ensureKeyframedProp(cloned.style.shadowBlur, [
          makeKf(t0, 15, 'easeInOut'),
          makeKf(t0 + dur * 0.5, 45, 'easeInOut'),
          makeKf(t0 + dur, 15, 'easeInOut'),
        ]);
      }

      return cloned;
    },
  },
  {
    id: 'loop-slow-orbit-spin',
    name: '360° Infinite Orbit (Rotación Infinita)',
    category: 'loop',
    description: 'Giro suave y continuo de 360 grados sin interrupción estilo GSAP linear loop.',
    duration: 6.0,
    icon: '🔄',
    tags: ['rotacion', 'spin', 'orbita', 'loop', 'infinito'],
    apply: (layer, t0, dur = 6.0) => {
      const cloned = createPresetClonedLayer(layer);
      const baseRot = layer.transform.rotation.value || 0;

      cloned.transform.rotation = ensureKeyframedProp(cloned.transform.rotation, [
        makeKf(t0, baseRot, 'linear'),
        makeKf(t0 + dur, baseRot + 360, 'linear'),
      ]);

      return cloned;
    },
  },
  {
    id: 'loop-kinetic-heartbeat',
    name: 'Kinetic Double Heartbeat',
    category: 'loop',
    description: 'Doble pulsación rítmica sutil para botones CTA, insignias o elementos de llamada a la acción.',
    duration: 2.5,
    icon: '💓',
    tags: ['latido', 'heartbeat', 'pulso', 'cta', 'loop'],
    apply: (layer, t0, dur = 2.5) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x, y: baseScale.y }, 'linear'),
        makeKf(t0 + 0.2, { x: baseScale.x * 1.08, y: baseScale.y * 1.08 }, 'power2Out'),
        makeKf(t0 + 0.35, { x: baseScale.x, y: baseScale.y }, 'power2In'),
        makeKf(t0 + 0.55, { x: baseScale.x * 1.05, y: baseScale.y * 1.05 }, 'power2Out'),
        makeKf(t0 + 0.75, { x: baseScale.x, y: baseScale.y }, 'power2In'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'linear'),
      ]);

      return cloned;
    },
  },
  {
    id: 'loop-pendulum-swing',
    name: 'Pendulum Swing Loop (Oscilación de Péndulo)',
    category: 'loop',
    description: 'Oscilación armónica suave de izquierda a derecha simulando la gravedad de un péndulo de precisión.',
    duration: 3.2,
    icon: '🕰️',
    tags: ['pendulo', 'swing', 'oscilacion', 'gravedad', 'loop', 'armonico'],
    apply: (layer, t0, dur = 3.2) => {
      const cloned = createPresetClonedLayer(layer);
      const baseRot = layer.transform.rotation.value || 0;

      cloned.transform.rotation = ensureKeyframedProp(cloned.transform.rotation, [
        makeKf(t0, baseRot, 'easeInOut'),
        makeKf(t0 + dur * 0.25, baseRot - 6, 'easeInOut'),
        makeKf(t0 + dur * 0.5, baseRot, 'easeInOut'),
        makeKf(t0 + dur * 0.75, baseRot + 6, 'easeInOut'),
        makeKf(t0 + dur, baseRot, 'easeInOut'),
      ]);

      return cloned;
    },
  },
  {
    id: 'loop-liquid-jelly-breathe',
    name: 'Liquid Organic Breathing Loop',
    category: 'loop',
    description: 'Deformación continua de proporciones X/Y simulando materia líquida viva y fluida.',
    duration: 3.0,
    icon: '💧',
    tags: ['liquido', 'organico', 'breathe', 'jelly', 'loop', 'alocado'],
    apply: (layer, t0, dur = 3.0) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x, y: baseScale.y }, 'easeInOut'),
        makeKf(t0 + dur * 0.25, { x: baseScale.x * 1.05, y: baseScale.y * 0.95 }, 'easeInOut'),
        makeKf(t0 + dur * 0.5, { x: baseScale.x, y: baseScale.y }, 'easeInOut'),
        makeKf(t0 + dur * 0.75, { x: baseScale.x * 0.95, y: baseScale.y * 1.05 }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'easeInOut'),
      ]);

      return cloned;
    },
  },
  {
    id: 'loop-infinity-eight-float',
    name: 'Infinity Lemniscate Float (Figura 8)',
    category: 'loop',
    description: 'Trayectoria armónica continua en forma de ocho infinito (lemniscata) para ambient motion suave.',
    duration: 4.8,
    icon: '♾️',
    tags: ['infinito', 'figura 8', 'lemniscata', 'flotar', 'ambient', 'loop'],
    apply: (layer, t0, dur = 4.8) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const step = dur / 8;

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y }, 'easeInOut'),
        makeKf(t0 + step * 2, { x: basePos.x + 18, y: basePos.y - 12 }, 'easeInOut'),
        makeKf(t0 + step * 4, { x: basePos.x, y: basePos.y }, 'easeInOut'),
        makeKf(t0 + step * 6, { x: basePos.x - 18, y: basePos.y + 12 }, 'easeInOut'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'easeInOut'),
      ]);

      return cloned;
    },
  },

  // ==========================================
  // 4. ÉNFASIS / EMPHASIS (ATTENTION & POPS)
  // ==========================================
  {
    id: 'emphasis-rubber-band-snap',
    name: 'Rubber Band Snap (Tensión Elástica)',
    category: 'emphasis',
    description: 'Estiramiento horizontal repentino con snap de retroceso instantáneo para resaltar interacciones o momentos clave.',
    duration: 0.6,
    icon: '🪢',
    tags: ['rubber band', 'liga', 'tension', 'snap', 'enfasis', 'alocado'],
    apply: (layer, t0, dur = 0.6) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x, y: baseScale.y }, 'linear'),
        makeKf(t0 + dur * 0.3, { x: baseScale.x * 1.28, y: baseScale.y * 0.75 }, 'power2Out'),
        makeKf(t0 + dur * 0.6, { x: baseScale.x * 0.88, y: baseScale.y * 1.15 }, 'easeInOut'),
        makeKf(t0 + dur * 0.82, { x: baseScale.x * 1.05, y: baseScale.y * 0.98 }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'emphasis-tada-wobble',
    name: 'Tada Highlight Wobble',
    category: 'emphasis',
    description: 'Efecto clásico de celebración con suave compresión, rotaciones oscilantes de alta frecuencia y escala expansiva.',
    duration: 0.7,
    icon: '🎉',
    tags: ['tada', 'celebracion', 'wobble', 'destacado', 'enfasis'],
    apply: (layer, t0, dur = 0.7) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const baseRot = layer.transform.rotation.value || 0;
      const step = dur / 6;

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x, y: baseScale.y }, 'linear'),
        makeKf(t0 + step * 1, { x: baseScale.x * 0.92, y: baseScale.y * 0.92 }, 'easeInOut'),
        makeKf(t0 + step * 2, { x: baseScale.x * 1.14, y: baseScale.y * 1.14 }, 'easeInOut'),
        makeKf(t0 + step * 4, { x: baseScale.x * 1.12, y: baseScale.y * 1.12 }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'power2Out'),
      ]);

      cloned.transform.rotation = ensureKeyframedProp(cloned.transform.rotation, [
        makeKf(t0, baseRot, 'linear'),
        makeKf(t0 + step * 1, baseRot - 4, 'linear'),
        makeKf(t0 + step * 2, baseRot + 5, 'linear'),
        makeKf(t0 + step * 3, baseRot - 4, 'linear'),
        makeKf(t0 + step * 4, baseRot + 4, 'linear'),
        makeKf(t0 + step * 5, baseRot - 2, 'linear'),
        makeKf(t0 + dur, baseRot, 'power2Out'),
      ]);

      return cloned;
    },
  },
  {
    id: 'pulse-glow',
    name: 'Pulse & Glow (Pulsar y Resplandor)',
    category: 'emphasis',
    description: 'Aumenta de tamaño suavemente mientras intensifica su resplandor y vuelve al estado original.',
    duration: 1.0,
    icon: '🌟',
    tags: ['pulso', 'brillo', 'resplandor', 'enfasis', 'gsap'],
    apply: (layer, t0, dur = 1.0) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x, y: baseScale.y }, 'easeInOut'),
        makeKf(t0 + dur * 0.5, { x: baseScale.x * 1.15, y: baseScale.y * 1.15 }, 'easeInOut'),
        makeKf(t0 + dur, { x: baseScale.x, y: baseScale.y }, 'easeInOut'),
      ]);

      return cloned;
    },
  },
  {
    id: 'shake-wiggle',
    name: 'Shake / Wiggle (Sacudida Rápida)',
    category: 'emphasis',
    description: 'Oscilación lateral rápida ideal para errores, llamadas de atención o botones de acción.',
    duration: 0.6,
    icon: '📳',
    tags: ['sacudir', 'shake', 'wiggle', 'alerta', 'enfasis'],
    apply: (layer, t0, dur = 0.6) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const step = dur / 6;

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y }, 'linear'),
        makeKf(t0 + step * 1, { x: basePos.x - 12, y: basePos.y }, 'linear'),
        makeKf(t0 + step * 2, { x: basePos.x + 12, y: basePos.y }, 'linear'),
        makeKf(t0 + step * 3, { x: basePos.x - 8, y: basePos.y }, 'linear'),
        makeKf(t0 + step * 4, { x: basePos.x + 8, y: basePos.y }, 'linear'),
        makeKf(t0 + step * 5, { x: basePos.x - 4, y: basePos.y }, 'linear'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y }, 'linear'),
      ]);

      return cloned;
    },
  },

  // ==========================================
  // 5. SALIDAS / OUT (SMOOTH & CINEMATIC TRANSITIONS)
  // ==========================================
  {
    id: 'out-lateral-slide',
    name: 'Lateral Inertia Wipe Out',
    category: 'out',
    description: 'Inspirado en el video: salida fluida hacia la izquierda con aceleración cinemática.',
    duration: 0.6,
    icon: '⬅️',
    tags: ['salida', 'lateral', 'wipe', 'slide', 'video'],
    apply: (layer, t0, dur = 0.6) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, baseOp, 'linear'),
        makeKf(t0 + dur, 0, 'power2In'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y }, 'power2In'),
        makeKf(t0 + dur, { x: basePos.x - 240, y: basePos.y }, 'power2In'),
      ]);

      return cloned;
    },
  },
  {
    id: 'fade-out',
    name: 'Fade Out (Desvanecer)',
    category: 'out',
    description: 'Desvanecimiento suave de opacidad 100% a 0%.',
    duration: 0.5,
    icon: '💨',
    tags: ['opacidad', 'desvanecer', 'salida', 'fade', 'gsap'],
    apply: (layer, t0, dur = 0.5) => {
      const cloned = createPresetClonedLayer(layer);
      const baseOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, baseOp, 'linear'),
        makeKf(t0 + dur, 0, 'power2In'),
      ]);

      return cloned;
    },
  },
  {
    id: 'pop-collapse-out',
    name: 'Pop Collapse Out (Colapso al Centro)',
    category: 'out',
    description: 'Colapso elástico rápido de escala 100% a 0% con desvanecimiento.',
    duration: 0.5,
    icon: '🌀',
    tags: ['colapso', 'escala', 'salida', 'pop', 'gsap'],
    apply: (layer, t0, dur = 0.5) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const baseOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, baseOp, 'linear'),
        makeKf(t0 + dur, 0, 'power2In'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x, y: baseScale.y }, 'power2In'),
        makeKf(t0 + dur * 0.2, { x: baseScale.x * 1.08, y: baseScale.y * 1.08 }, 'easeInOut'),
        makeKf(t0 + dur, { x: 0, y: 0 }, 'power2In'),
      ]);

      return cloned;
    },
  },
  {
    id: 'out-vortex-spiral-dissolve',
    name: 'Vortex Spiral Dissolve Out',
    category: 'out',
    description: 'Rotación acelerada en espiral de 180° encogiéndose al centro con desvanecimiento alfa.',
    duration: 0.6,
    icon: '🌪️',
    tags: ['vortex', 'espiral', 'spin', 'salida', 'dissolve', 'gsap'],
    apply: (layer, t0, dur = 0.6) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const baseRot = layer.transform.rotation.value || 0;
      const baseOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, baseOp, 'linear'),
        makeKf(t0 + dur, 0, 'power2In'),
      ]);

      cloned.transform.rotation = ensureKeyframedProp(cloned.transform.rotation, [
        makeKf(t0, baseRot, 'power2In'),
        makeKf(t0 + dur, baseRot + 180, 'power2In'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x, y: baseScale.y }, 'power2In'),
        makeKf(t0 + dur, { x: 0, y: 0 }, 'power2In'),
      ]);

      return cloned;
    },
  },
  {
    id: 'out-gravity-fall-down',
    name: 'Gravitational Freefall Out',
    category: 'out',
    description: 'Caída vertical cinemática acelerada por gravedad fuera de los límites de la pantalla con rotación natural.',
    duration: 0.65,
    icon: '⬇️',
    tags: ['gravedad', 'caida', 'fall', 'salida', 'cinematic'],
    apply: (layer, t0, dur = 0.65) => {
      const cloned = createPresetClonedLayer(layer);
      const basePos = layer.transform.position.value || { x: 0, y: 0 };
      const baseRot = layer.transform.rotation.value || 0;
      const baseOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, baseOp, 'linear'),
        makeKf(t0 + dur * 0.4, baseOp, 'linear'),
        makeKf(t0 + dur, 0, 'power2In'),
      ]);

      cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
        makeKf(t0, { x: basePos.x, y: basePos.y }, 'power2In'),
        makeKf(t0 + dur, { x: basePos.x, y: basePos.y + 350 }, 'power2In'),
      ]);

      cloned.transform.rotation = ensureKeyframedProp(cloned.transform.rotation, [
        makeKf(t0, baseRot, 'power2In'),
        makeKf(t0 + dur, baseRot + 12, 'power2In'),
      ]);

      return cloned;
    },
  },
  {
    id: 'out-elastic-snap-shrink',
    name: 'Elastic Snap Shrink Out',
    category: 'out',
    description: 'Anticipación rápida de escala expansiva 112% seguida de un snap inmediato a 0% con retroceso elástico.',
    duration: 0.55,
    icon: '🤏',
    tags: ['elastic', 'anticipacion', 'shrink', 'snap', 'salida', 'alocado'],
    apply: (layer, t0, dur = 0.55) => {
      const cloned = createPresetClonedLayer(layer);
      const baseScale = layer.transform.scale.value || { x: 100, y: 100 };
      const baseOp = layer.transform.opacity.value || 100;

      cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
        makeKf(t0, baseOp, 'linear'),
        makeKf(t0 + dur * 0.35, baseOp, 'linear'),
        makeKf(t0 + dur, 0, 'power2In'),
      ]);

      cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
        makeKf(t0, { x: baseScale.x, y: baseScale.y }, 'easeOut'),
        makeKf(t0 + dur * 0.3, { x: baseScale.x * 1.15, y: baseScale.y * 1.15 }, 'easeInOut'),
        makeKf(t0 + dur, { x: 0, y: 0 }, 'back'),
      ]);

      return cloned;
    },
  },
];

/**
 * Helper to add a transform keyframe at a specific time
 */
export function addTransformKeyframe(
  layer: VectorLayer,
  propertyType: 'rotation' | 'scale' | 'opacity' | 'position' | 'all',
  time: number,
  easing: EasingType = 'easeInOut'
): VectorLayer {
  const cloned = createPresetClonedLayer(layer);

  if (propertyType === 'rotation' || propertyType === 'all') {
    const val = cloned.transform.rotation.value ?? 0;
    cloned.transform.rotation = ensureKeyframedProp(cloned.transform.rotation, [
      makeKf(time, val, easing),
    ]);
  }

  if (propertyType === 'scale' || propertyType === 'all') {
    const val = cloned.transform.scale.value ?? { x: 100, y: 100 };
    cloned.transform.scale = ensureKeyframedProp(cloned.transform.scale, [
      makeKf(time, { x: val.x, y: val.y }, easing),
    ]);
  }

  if (propertyType === 'opacity' || propertyType === 'all') {
    const val = cloned.transform.opacity.value ?? 100;
    cloned.transform.opacity = ensureKeyframedProp(cloned.transform.opacity, [
      makeKf(time, val, easing),
    ]);
  }

  if (propertyType === 'position' || propertyType === 'all') {
    const val = cloned.transform.position.value ?? { x: 0, y: 0 };
    cloned.transform.position = ensureKeyframedProp(cloned.transform.position, [
      makeKf(time, { x: val.x, y: val.y }, easing),
    ]);
  }

  return cloned;
}

/**
 * Remove all animation keyframes from a layer to reset it to static
 */
export function clearLayerKeyframes(layer: VectorLayer): VectorLayer {
  const cloned = createPresetClonedLayer(layer);
  cloned.transform.position.isKeyframed = false;
  cloned.transform.position.keyframes = [];
  cloned.transform.scale.isKeyframed = false;
  cloned.transform.scale.keyframes = [];
  cloned.transform.rotation.isKeyframed = false;
  cloned.transform.rotation.keyframes = [];
  cloned.transform.opacity.isKeyframed = false;
  cloned.transform.opacity.keyframes = [];
  cloned.transform.anchorPoint.isKeyframed = false;
  cloned.transform.anchorPoint.keyframes = [];
  return cloned;
}
