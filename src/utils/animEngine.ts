import { AnimatableProp, EasingType, Keyframe, VectorLayer, BezierHandle } from '../types';

/**
 * Cubic Bezier solver using Newton-Raphson method with bisection fallback
 */
export function solveCubicBezier(
  t: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number
): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  // Find t for given x(t) = t
  let start = 0;
  let end = 1;
  let guess = t;

  for (let i = 0; i < 8; i++) {
    const currentX = 3 * (1 - guess) * (1 - guess) * guess * p1x +
                     3 * (1 - guess) * guess * guess * p2x +
                     guess * guess * guess;
    const diff = currentX - t;
    if (Math.abs(diff) < 0.001) break;

    // Derivative
    const dx = 3 * (1 - guess) * (1 - guess) * p1x +
               6 * (1 - guess) * guess * (p2x - p1x) +
               3 * guess * guess * (1 - p2x);

    if (Math.abs(dx) > 1e-5) {
      guess = guess - diff / dx;
    } else {
      if (diff > 0) end = guess;
      else start = guess;
      guess = (start + end) / 2;
    }
    guess = Math.max(0, Math.min(1, guess));
  }

  // Calculate Y at that guess
  return 3 * (1 - guess) * (1 - guess) * guess * p1y +
         3 * (1 - guess) * guess * guess * p2y +
         guess * guess * guess;
}

export function evaluateEasing(
  ratio: number,
  easing: EasingType,
  handleIn?: BezierHandle,
  handleOut?: BezierHandle
): number {
  const r = Math.max(0, Math.min(1, ratio));

  switch (easing) {
    case 'linear':
      return r;
    case 'easeIn':
      return r * r * r;
    case 'easeOut':
      return 1 - Math.pow(1 - r, 3);
    case 'easeInOut':
      return r < 0.5 ? 4 * r * r * r : 1 - Math.pow(-2 * r + 2, 3) / 2;
    case 'bounce': {
      const n1 = 7.5625;
      const d1 = 2.75;
      let t = r;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }
    case 'elastic': {
      const c4 = (2 * Math.PI) / 3;
      return r === 0
        ? 0
        : r === 1
        ? 1
        : -Math.pow(2, 10 * r - 10) * Math.sin((r * 10 - 10.75) * c4);
    }
    case 'elasticOut': {
      const c4 = (2 * Math.PI) / 3;
      return r === 0
        ? 0
        : r === 1
        ? 1
        : Math.pow(2, -10 * r) * Math.sin((r * 10 - 0.75) * c4) + 1;
    }
    case 'back': {
      const s = 1.70158;
      const t = r - 1;
      return t * t * ((s + 1) * t + s) + 1;
    }
    case 'power2In':
      return r * r;
    case 'power2Out':
      return 1 - (1 - r) * (1 - r);
    case 'power2InOut':
      return r < 0.5 ? 2 * r * r : 1 - Math.pow(-2 * r + 2, 2) / 2;
    case 'expoOut':
      return r === 1 ? 1 : 1 - Math.pow(2, -10 * r);
    case 'circOut':
      return Math.sqrt(1 - Math.pow(r - 1, 2));
    case 'hold':
      return r >= 1 ? 1 : 0;
    case 'cubicBezier': {
      const p1x = handleOut?.x ?? 0.25;
      const p1y = handleOut?.y ?? 0.1;
      const p2x = handleIn?.x ?? 0.25;
      const p2y = handleIn?.y ?? 1.0;
      return solveCubicBezier(r, p1x, p1y, p2x, p2y);
    }
    default:
      return r;
  }
}

// Color parsing & interpolation
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseColor(colorStr: string): RGBA {
  if (!colorStr || colorStr === 'none' || colorStr === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      return { r, g, b, a };
    }
  }
  if (colorStr.startsWith('rgb')) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: match[4] !== undefined ? parseFloat(match[4]) : 1,
      };
    }
  }
  // Default fallback
  return { r: 255, g: 255, b: 255, a: 1 };
}

export function lerpColor(colorA: string, colorB: string, t: number): string {
  if (colorA === 'none' && colorB === 'none') return 'none';
  if (colorA === 'none') colorA = '#ffffff00';
  if (colorB === 'none') colorB = '#ffffff00';

  const a = parseColor(colorA);
  const b = parseColor(colorB);

  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  const alpha = +(a.a + (b.a - a.a) * t).toFixed(3);

  if (alpha < 0.99) {
    return `rgba(${r}, ${g}, ${bl}, ${alpha})`;
  }
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

export function lerpNumber(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPoint(
  a: { x: number; y: number },
  b: { x: number; y: number },
  t: number
): { x: number; y: number } {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

/**
 * Physical Damped Harmonic Oscillator (Spring Dynamics) for Elasticity & Bounce
 */
export function evaluateSpring(
  progress: number,
  tension: number = 160,
  damping: number = 16,
  mass: number = 1
): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;

  const k = Math.max(10, tension);
  const c = Math.max(1, damping);
  const m = Math.max(0.1, mass);
  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(m * k));
  const t = progress * 2.8;

  if (zeta < 1) {
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * omega0 * t * 0.35);
    return 1 - decay * (Math.cos(omegaD * t * 0.35) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * t * 0.35));
  } else {
    const decay = Math.exp(-omega0 * t * 0.35);
    return 1 - decay * (1 + omega0 * t * 0.35);
  }
}

/**
 * Generic evaluation of an animatable property at time `time`
 */
export function evaluateProp<T>(
  prop: AnimatableProp<T> | undefined,
  time: number,
  lerpFn?: (a: T, b: T, progress: number) => T,
  springDynamics?: { enabled: boolean; tension: number; damping: number; mass: number }
): T {
  if (!prop) {
    return undefined as unknown as T;
  }
  if (!prop.isKeyframed || !prop.keyframes || prop.keyframes.length === 0) {
    return prop.value;
  }

  const sortedKeyframes = [...prop.keyframes].sort((a, b) => a.time - b.time);

  // Before first keyframe
  if (time <= sortedKeyframes[0].time) {
    return sortedKeyframes[0].value;
  }

  // After last keyframe
  if (time >= sortedKeyframes[sortedKeyframes.length - 1].time) {
    return sortedKeyframes[sortedKeyframes.length - 1].value;
  }

  // Between keyframes
  for (let i = 0; i < sortedKeyframes.length - 1; i++) {
    const k1 = sortedKeyframes[i];
    const k2 = sortedKeyframes[i + 1];

    if (time >= k1.time && time <= k2.time) {
      const duration = k2.time - k1.time;
      if (duration === 0) return k1.value;

      // Exact match optimization: If both keyframes have identical values, return immediately with zero drift
      if (k1.value === k2.value) {
        return k1.value;
      }
      if (
        typeof k1.value === 'object' &&
        k1.value !== null &&
        typeof k2.value === 'object' &&
        k2.value !== null &&
        'x' in k1.value &&
        'y' in k1.value &&
        'x' in k2.value &&
        'y' in k2.value &&
        (k1.value as any).x === (k2.value as any).x &&
        (k1.value as any).y === (k2.value as any).y
      ) {
        return k1.value;
      }

      const rawProgress = (time - k1.time) / duration;
      const easedProgress = springDynamics?.enabled
        ? evaluateSpring(rawProgress, springDynamics.tension, springDynamics.damping, springDynamics.mass)
        : evaluateEasing(rawProgress, k1.easing, k1.handleIn, k1.handleOut);

      if (lerpFn) {
        return lerpFn(k1.value, k2.value, easedProgress);
      }

      // Convert numeric string values if necessary
      const num1 = typeof k1.value === 'number' ? k1.value : (typeof k1.value === 'string' && !k1.value.startsWith('#') && !k1.value.startsWith('rgb') && !isNaN(Number(k1.value)) ? Number(k1.value) : null);
      const num2 = typeof k2.value === 'number' ? k2.value : (typeof k2.value === 'string' && !k2.value.startsWith('#') && !k2.value.startsWith('rgb') && !isNaN(Number(k2.value)) ? Number(k2.value) : null);

      if (num1 !== null && num2 !== null) {
        if (num1 === num2) return num1 as unknown as T;
        return lerpNumber(num1, num2, easedProgress) as unknown as T;
      }

      // Default lerpers
      if (
        typeof k1.value === 'object' &&
        k1.value !== null &&
        'x' in k1.value &&
        'y' in k1.value
      ) {
        return lerpPoint(
          k1.value as { x: number; y: number },
          k2.value as { x: number; y: number },
          easedProgress
        ) as unknown as T;
      }
      if (typeof k1.value === 'string' && (k1.value.startsWith('#') || k1.value.startsWith('rgb'))) {
        return lerpColor(k1.value, k2.value as unknown as string, easedProgress) as unknown as T;
      }

      return easedProgress >= 0.5 ? k2.value : k1.value;
    }
  }

  return prop.value;
}

/**
 * Deterministic pseudo-noise for After Effects Wiggle effect
 */
export function getWiggleOffset(
  seed: string,
  time: number,
  frequency: number,
  amplitude: number
): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const baseFreq = frequency * 2 * Math.PI;
  const phase1 = (hash % 1000) / 100;
  const phase2 = ((hash >> 4) % 1000) / 100;
  const phase3 = ((hash >> 8) % 1000) / 100;

  const v1 = Math.sin(time * baseFreq + phase1);
  const v2 = Math.sin(time * baseFreq * 1.618 + phase2) * 0.5;
  const v3 = Math.cos(time * baseFreq * 2.718 + phase3) * 0.25;

  return (v1 + v2 + v3) / 1.75 * amplitude;
}

/**
 * Evaluates all layer properties at time `t`
 */
export interface EvaluatedLayerProps {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  opacity: number;
  anchorPoint: { x: number; y: number };
  skew: { x: number; y: number };
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
  strokeDashArray: string;
  trimStart: number;
  trimEnd: number;
  trimOffset: number;
  blur: number;
  shadowBlur: number;
  rect?: {
    width: number;
    height: number;
    cornerRadius: number;
  };
  circle?: {
    radiusX: number;
    radiusY: number;
  };
  star?: {
    points: number;
    outerRadius: number;
    innerRadius: number;
  };
  polygon?: {
    sides: number;
    radius: number;
  };
  text?: {
    fontSize: number;
    letterSpacing: number;
  };
  image?: {
    width: number;
    height: number;
    src: string;
    cornerRadius?: number;
    scalingMode?: 'contain' | 'cover' | 'fill' | 'none';
    filters?: import('../types').ImageFilters;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
}

export function evaluateLayer(
  layer: VectorLayer,
  time: number,
  allLayers?: VectorLayer[],
  depth: number = 0
): EvaluatedLayerProps {
  const springOpt = layer.springDynamics?.enabled ? layer.springDynamics : undefined;
  let position = layer.transform?.position ? evaluateProp(layer.transform.position, time, undefined, springOpt) : { x: 0, y: 0 };
  let scale = layer.transform?.scale ? evaluateProp(layer.transform.scale, time, undefined, springOpt) : { x: 100, y: 100 };
  let rotation = layer.transform?.rotation ? evaluateProp(layer.transform.rotation, time, undefined, springOpt) : 0;
  const rawOpacity = layer.transform?.opacity ? (evaluateProp(layer.transform.opacity, time) ?? 100) : 100;
  let opacity = Math.max(0, Math.min(100, typeof rawOpacity === 'number' ? rawOpacity : Number(rawOpacity) || 0));
  const anchorPoint = layer.transform?.anchorPoint ? evaluateProp(layer.transform.anchorPoint, time) : { x: 0, y: 0 };
  const skew = layer.transform?.skew ? evaluateProp(layer.transform.skew, time) : { x: 0, y: 0 };

  // Apply Wiggle modifiers if enabled
  const modifiers = layer.modifiers || [];
  const wiggleMod = modifiers.find(m => m.type === 'wiggle' && m.enabled);
  if (wiggleMod && wiggleMod.wiggle) {
    const { frequency = 2.5, positionAmp = 0, rotationAmp = 0, scaleAmp = 0 } = wiggleMod.wiggle;
    if (positionAmp > 0) {
      const offsetX = getWiggleOffset(layer.id + '_x', time, frequency, positionAmp);
      const offsetY = getWiggleOffset(layer.id + '_y', time, frequency, positionAmp);
      position = { x: position.x + offsetX, y: position.y + offsetY };
    }
    if (rotationAmp > 0) {
      const rotOffset = getWiggleOffset(layer.id + '_rot', time, frequency, rotationAmp);
      rotation += rotOffset;
    }
    if (scaleAmp > 0) {
      const scOffset = getWiggleOffset(layer.id + '_scale', time, frequency, scaleAmp);
      scale = { x: scale.x + scOffset, y: scale.y + scOffset };
    }
  }

  // Parenting & Motion Linking: Inherit parent layer transformation
  if (layer.parentLayerId && allLayers && depth < 6) {
    const parent = allLayers.find((l) => l.id === layer.parentLayerId);
    if (parent && parent.id !== layer.id) {
      const followOpt = layer.parentFollowOptions || {
        followPosition: true,
        followRotation: true,
        followScale: true,
        lagSeconds: 0,
      };

      const parentTime = Math.max(0, time - (followOpt.lagSeconds || 0));
      const parentProps = evaluateLayer(parent, parentTime, allLayers, depth + 1);

      // Parent position delta relative to its baseline
      if (followOpt.followPosition !== false) {
        const parentBaseX = parent.transform.position.value?.x ?? parentProps.position.x;
        const parentBaseY = parent.transform.position.value?.y ?? parentProps.position.y;
        const deltaX = parentProps.position.x - parentBaseX;
        const deltaY = parentProps.position.y - parentBaseY;
        position = { x: position.x + deltaX, y: position.y + deltaY };
      }

      // Parent rotation inheritance
      if (followOpt.followRotation !== false) {
        rotation += parentProps.rotation;
      }

      // Parent scale inheritance
      if (followOpt.followScale !== false) {
        scale = {
          x: Math.round((scale.x * parentProps.scale.x) / 100),
          y: Math.round((scale.y * parentProps.scale.y) / 100),
        };
      }

      // Opacity inheritance
      opacity = Math.max(0, Math.min(100, Math.round((opacity * parentProps.opacity) / 100)));
    }
  }

  const fill = layer.style?.fill ? (evaluateProp(layer.style.fill, time, lerpColor) || '#3b82f6') : '#3b82f6';
  const fillOpacity = layer.style?.fillOpacity ? (evaluateProp(layer.style.fillOpacity, time) ?? 100) : 100;
  const stroke = layer.style?.stroke ? (evaluateProp(layer.style.stroke, time, lerpColor) || 'none') : 'none';
  const strokeWidth = layer.style?.strokeWidth ? (evaluateProp(layer.style.strokeWidth, time) ?? 0) : 0;
  const strokeOpacity = layer.style?.strokeOpacity ? (evaluateProp(layer.style.strokeOpacity, time) ?? 100) : 100;
  const strokeDashArray = layer.style?.strokeDashArray ? (evaluateProp(layer.style.strokeDashArray, time) || '') : '';
  const trimStart = layer.style?.trimStart ? (evaluateProp(layer.style.trimStart, time) ?? 0) : 0;
  const trimEnd = layer.style?.trimEnd ? (evaluateProp(layer.style.trimEnd, time) ?? 100) : 100;
  const trimOffset = layer.style?.trimOffset ? (evaluateProp(layer.style.trimOffset, time) ?? 0) : 0;
  const blur = layer.style?.blur ? (evaluateProp(layer.style.blur, time) ?? 0) : 0;
  const shadowBlur = layer.style?.shadowBlur ? (evaluateProp(layer.style.shadowBlur, time) ?? 0) : 0;

  const res: EvaluatedLayerProps = {
    position,
    scale,
    rotation,
    opacity,
    anchorPoint,
    skew,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    strokeDashArray,
    trimStart,
    trimEnd,
    trimOffset,
    blur,
    shadowBlur,
  };

  if (layer.type === 'rect' && layer.rect) {
    res.rect = {
      width: evaluateProp(layer.rect.width, time),
      height: evaluateProp(layer.rect.height, time),
      cornerRadius: evaluateProp(layer.rect.cornerRadius, time),
    };
  } else if (layer.type === 'circle' && layer.circle) {
    res.circle = {
      radiusX: evaluateProp(layer.circle.radiusX, time),
      radiusY: evaluateProp(layer.circle.radiusY, time),
    };
  } else if (layer.type === 'star' && layer.star) {
    res.star = {
      points: evaluateProp(layer.star.points, time),
      outerRadius: evaluateProp(layer.star.outerRadius, time),
      innerRadius: evaluateProp(layer.star.innerRadius, time),
    };
  } else if (layer.type === 'polygon' && layer.polygon) {
    res.polygon = {
      sides: evaluateProp(layer.polygon.sides, time),
      radius: evaluateProp(layer.polygon.radius, time),
    };
  } else if (layer.type === 'text' && layer.text) {
    res.text = {
      fontSize: evaluateProp(layer.text.fontSize, time),
      letterSpacing: evaluateProp(layer.text.letterSpacing, time),
    };
  } else if (layer.type === 'image' && layer.image) {
    res.image = {
      src: layer.image.src,
      width: evaluateProp(layer.image.width, time),
      height: evaluateProp(layer.image.height, time),
      cornerRadius: layer.image.cornerRadius ? evaluateProp(layer.image.cornerRadius, time) : 0,
      scalingMode: layer.image.scalingMode || 'contain',
      filters: layer.image.filters,
      flipHorizontal: layer.image.flipHorizontal,
      flipVertical: layer.image.flipVertical,
      borderWidth: layer.image.borderWidth,
      borderColor: layer.image.borderColor,
      borderStyle: layer.image.borderStyle,
      shadowColor: layer.image.shadowColor,
      shadowBlur: layer.image.shadowBlur,
      shadowOffsetX: layer.image.shadowOffsetX,
      shadowOffsetY: layer.image.shadowOffsetY,
    };
  }

  return res;
}

/**
 * Generates an SVG path `d` attribute for a Star shape
 */
export function generateStarPath(points: number, outerRadius: number, innerRadius: number): string {
  const pts = Math.max(3, Math.round(points));
  const step = Math.PI / pts;
  let d = '';

  for (let i = 0; i < 2 * pts; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    if (i === 0) {
      d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }
  return d + ' Z';
}

/**
 * Generates an SVG path `d` attribute for a Polygon shape
 */
export function generatePolygonPath(sides: number, radius: number): string {
  const s = Math.max(3, Math.round(sides));
  const step = (2 * Math.PI) / s;
  let d = '';

  for (let i = 0; i < s; i++) {
    const angle = i * step - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) {
      d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }
  return d + ' Z';
}
