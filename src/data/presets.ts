import { Composition, VectorLayer } from '../types';

export const createBlankLayer = (
  type: VectorLayer['type'],
  name: string,
  x: number = 400,
  y: number = 300
): VectorLayer => {
  const id = 'layer_' + Math.random().toString(36).substring(2, 9);
  return {
    id,
    name,
    type,
    visible: true,
    locked: false,
    solo: false,
    colorTag: '#3b82f6',
    motionBlur: false,
    expandedInTimeline: false,
    transform: {
      position: { value: { x, y }, isKeyframed: false, keyframes: [] },
      scale: { value: { x: 100, y: 100 }, isKeyframed: false, keyframes: [] },
      rotation: { value: 0, isKeyframed: false, keyframes: [] },
      opacity: { value: 100, isKeyframed: false, keyframes: [] },
      anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
      skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
    },
    style: {
      fill: { value: '#3b82f6', isKeyframed: false, keyframes: [] },
      fillOpacity: { value: 100, isKeyframed: false, keyframes: [] },
      fillType: 'solid',
      stroke: { value: '#60a5fa', isKeyframed: false, keyframes: [] },
      strokeWidth: { value: 2, isKeyframed: false, keyframes: [] },
      strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
      strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
      trimStart: { value: 0, isKeyframed: false, keyframes: [] },
      trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
      trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
      lineCap: 'round',
      lineJoin: 'round',
      blendMode: 'normal',
      blur: { value: 0, isKeyframed: false, keyframes: [] },
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: { value: 0, isKeyframed: false, keyframes: [] },
      shadowOffsetX: 0,
      shadowOffsetY: 4,
    },
    rect: type === 'rect' ? {
      width: { value: 160, isKeyframed: false, keyframes: [] },
      height: { value: 100, isKeyframed: false, keyframes: [] },
      cornerRadius: { value: 12, isKeyframed: false, keyframes: [] },
    } : undefined,
    circle: type === 'circle' ? {
      radiusX: { value: 60, isKeyframed: false, keyframes: [] },
      radiusY: { value: 60, isKeyframed: false, keyframes: [] },
    } : undefined,
    star: type === 'star' ? {
      points: { value: 5, isKeyframed: false, keyframes: [] },
      outerRadius: { value: 70, isKeyframed: false, keyframes: [] },
      innerRadius: { value: 35, isKeyframed: false, keyframes: [] },
    } : undefined,
    polygon: type === 'polygon' ? {
      sides: { value: 6, isKeyframed: false, keyframes: [] },
      radius: { value: 65, isKeyframed: false, keyframes: [] },
    } : undefined,
    path: type === 'path' ? {
      d: 'M -50 -50 L 50 -50 L 0 50 Z',
    } : undefined,
    text: type === 'text' ? {
      text: 'Vector Motion',
      fontSize: { value: 36, isKeyframed: false, keyframes: [] },
      fontFamily: 'Inter, sans-serif',
      fontWeight: '700',
      letterSpacing: { value: 0, isKeyframed: false, keyframes: [] },
      textAlign: 'center',
    } : undefined,
    image: type === 'image' ? {
      src: '',
      width: { value: 200, isKeyframed: false, keyframes: [] },
      height: { value: 200, isKeyframed: false, keyframes: [] },
    } : undefined,
    modifiers: [],
  };
};

export interface CustomLayerOptions {
  width?: number;
  height?: number;
  cornerRadius?: number;
  radiusX?: number;
  radiusY?: number;
  radius?: number;
  sides?: number;
  points?: number;
  outerRadius?: number;
  innerRadius?: number;
  d?: string;
  nodes?: any[];
  closed?: boolean;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  src?: string;
  fileName?: string;
  mimeType?: string;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
}

export const createCustomLayer = (
  type: VectorLayer['type'],
  name: string,
  x: number = 400,
  y: number = 300,
  options: CustomLayerOptions = {}
): VectorLayer => {
  const base = createBlankLayer(type, name, x, y);
  
  if (options.fill !== undefined) base.style.fill.value = options.fill;
  if (options.fillOpacity !== undefined) base.style.fillOpacity.value = options.fillOpacity;
  if (options.stroke !== undefined) base.style.stroke.value = options.stroke;
  if (options.strokeWidth !== undefined) base.style.strokeWidth.value = options.strokeWidth;
  if (options.strokeOpacity !== undefined) base.style.strokeOpacity.value = options.strokeOpacity;

  if (type === 'rect' && base.rect) {
    if (options.width !== undefined) base.rect.width.value = options.width;
    if (options.height !== undefined) base.rect.height.value = options.height;
    if (options.cornerRadius !== undefined) base.rect.cornerRadius.value = options.cornerRadius;
  } else if (type === 'circle' && base.circle) {
    if (options.radiusX !== undefined) base.circle.radiusX.value = options.radiusX;
    if (options.radiusY !== undefined) base.circle.radiusY.value = options.radiusY;
  } else if (type === 'star' && base.star) {
    if (options.points !== undefined) base.star.points.value = options.points;
    if (options.outerRadius !== undefined) base.star.outerRadius.value = options.outerRadius;
    if (options.innerRadius !== undefined) base.star.innerRadius.value = options.innerRadius;
  } else if (type === 'polygon' && base.polygon) {
    if (options.sides !== undefined) base.polygon.sides.value = options.sides;
    if (options.radius !== undefined) base.polygon.radius.value = options.radius;
  } else if (type === 'path') {
    base.path = {
      d: options.d || 'M -50 -50 L 50 -50 L 0 50 Z',
      nodes: options.nodes,
      closed: options.closed ?? true,
    };
  } else if (type === 'text' && base.text) {
    if (options.text !== undefined) base.text.text = options.text;
    if (options.fontSize !== undefined) base.text.fontSize.value = options.fontSize;
    if (options.fontFamily !== undefined) base.text.fontFamily = options.fontFamily;
  } else if (type === 'image' && base.image) {
    if (options.src !== undefined) base.image.src = options.src;
    if (options.width !== undefined) base.image.width.value = options.width;
    if (options.height !== undefined) base.image.height.value = options.height;
    if (options.fileName !== undefined) base.image.fileName = options.fileName;
    if (options.mimeType !== undefined) base.image.mimeType = options.mimeType;
    base.style.fill.value = 'none';
    base.style.fillOpacity.value = 0;
    base.style.stroke.value = 'none';
    base.style.strokeWidth.value = 0;
  }

  return base;
};

const RAW_PRESET_COMPOSITIONS: Composition[] = [
  {
    id: 'comp_cyber_loader',
    name: 'Cyber Pulse Ring Loader',
    width: 800,
    height: 600,
    fps: 60,
    duration: 3.0,
    backgroundColor: '#0c0f17',
    layers: [
      {
        id: 'bg_glow',
        name: 'Ambient Center Glow',
        type: 'circle',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#8b5cf6',
        motionBlur: false,
        expandedInTimeline: false,
        transform: {
          position: { value: { x: 400, y: 300 }, isKeyframed: false, keyframes: [] },
          scale: {
            value: { x: 100, y: 100 },
            isKeyframed: true,
            keyframes: [
              { id: 'k1', time: 0, value: { x: 80, y: 80 }, easing: 'easeInOut' },
              { id: 'k2', time: 1.5, value: { x: 130, y: 130 }, easing: 'easeInOut' },
              { id: 'k3', time: 3.0, value: { x: 80, y: 80 }, easing: 'easeInOut' },
            ],
          },
          rotation: { value: 0, isKeyframed: false, keyframes: [] },
          opacity: {
            value: 40,
            isKeyframed: true,
            keyframes: [
              { id: 'op1', time: 0, value: 30, easing: 'easeInOut' },
              { id: 'op2', time: 1.5, value: 65, easing: 'easeInOut' },
              { id: 'op3', time: 3.0, value: 30, easing: 'easeInOut' },
            ],
          },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: '#3b82f6', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 35, isKeyframed: false, keyframes: [] },
          fillType: 'solid',
          stroke: { value: '#60a5fa', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 0, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'screen',
          blur: { value: 40, isKeyframed: false, keyframes: [] },
          shadowColor: 'transparent',
          shadowBlur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        circle: {
          radiusX: { value: 120, isKeyframed: false, keyframes: [] },
          radiusY: { value: 120, isKeyframed: false, keyframes: [] },
        },
        modifiers: [],
      },
      {
        id: 'outer_spin_ring',
        name: 'Outer Orbit Ring (Trimmed)',
        type: 'circle',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#06b6d4',
        motionBlur: true,
        expandedInTimeline: true,
        transform: {
          position: { value: { x: 400, y: 300 }, isKeyframed: false, keyframes: [] },
          scale: { value: { x: 100, y: 100 }, isKeyframed: false, keyframes: [] },
          rotation: {
            value: 0,
            isKeyframed: true,
            keyframes: [
              { id: 'r1', time: 0, value: 0, easing: 'linear' },
              { id: 'r2', time: 3.0, value: 360, easing: 'linear' },
            ],
          },
          opacity: { value: 100, isKeyframed: false, keyframes: [] },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: 'none', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 0, isKeyframed: false, keyframes: [] },
          fillType: 'none',
          stroke: {
            value: '#06b6d4',
            isKeyframed: true,
            keyframes: [
              { id: 's1', time: 0, value: '#06b6d4', easing: 'easeInOut' },
              { id: 's2', time: 1.5, value: '#3b82f6', easing: 'easeInOut' },
              { id: 's3', time: 3.0, value: '#06b6d4', easing: 'easeInOut' },
            ],
          },
          strokeWidth: { value: 8, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '180 60 40 80', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: '#06b6d4',
          shadowBlur: { value: 12, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        circle: {
          radiusX: { value: 90, isKeyframed: false, keyframes: [] },
          radiusY: { value: 90, isKeyframed: false, keyframes: [] },
        },
        modifiers: [],
      },
      {
        id: 'inner_hex_core',
        name: 'Geometric Core Polygon',
        type: 'polygon',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#ec4899',
        motionBlur: true,
        expandedInTimeline: true,
        transform: {
          position: { value: { x: 400, y: 300 }, isKeyframed: false, keyframes: [] },
          scale: {
            value: { x: 100, y: 100 },
            isKeyframed: true,
            keyframes: [
              { id: 'sc1', time: 0, value: { x: 90, y: 90 }, easing: 'easeInOut' },
              { id: 'sc2', time: 1.5, value: { x: 115, y: 115 }, easing: 'easeInOut' },
              { id: 'sc3', time: 3.0, value: { x: 90, y: 90 }, easing: 'easeInOut' },
            ],
          },
          rotation: {
            value: 0,
            isKeyframed: true,
            keyframes: [
              { id: 'kr1', time: 0, value: 0, easing: 'easeInOut' },
              { id: 'kr2', time: 3.0, value: -360, easing: 'easeInOut' },
            ],
          },
          opacity: { value: 95, isKeyframed: false, keyframes: [] },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: '#1e1b4b', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 80, isKeyframed: false, keyframes: [] },
          fillType: 'solid',
          stroke: { value: '#f43f5e', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 4, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: '#f43f5e',
          shadowBlur: { value: 16, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        polygon: {
          sides: { value: 6, isKeyframed: false, keyframes: [] },
          radius: { value: 45, isKeyframed: false, keyframes: [] },
        },
        modifiers: [],
      },
      {
        id: 'center_star_spark',
        name: 'Center Spark Star',
        type: 'star',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#fbbf24',
        motionBlur: false,
        expandedInTimeline: false,
        transform: {
          position: { value: { x: 400, y: 300 }, isKeyframed: false, keyframes: [] },
          scale: {
            value: { x: 100, y: 100 },
            isKeyframed: true,
            keyframes: [
              { id: 'st1', time: 0, value: { x: 70, y: 70 }, easing: 'bounce' },
              { id: 'st2', time: 1.5, value: { x: 130, y: 130 }, easing: 'bounce' },
              { id: 'st3', time: 3.0, value: { x: 70, y: 70 }, easing: 'bounce' },
            ],
          },
          rotation: {
            value: 0,
            isKeyframed: true,
            keyframes: [
              { id: 'sr1', time: 0, value: 0, easing: 'linear' },
              { id: 'sr2', time: 3.0, value: 180, easing: 'linear' },
            ],
          },
          opacity: { value: 100, isKeyframed: false, keyframes: [] },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: '#fbbf24', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          fillType: 'solid',
          stroke: { value: '#f59e0b', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 2, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: '#fbbf24',
          shadowBlur: { value: 10, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        star: {
          points: { value: 4, isKeyframed: false, keyframes: [] },
          outerRadius: { value: 22, isKeyframed: false, keyframes: [] },
          innerRadius: { value: 8, isKeyframed: false, keyframes: [] },
        },
        modifiers: [],
      },
      {
        id: 'label_text',
        name: 'Status Label',
        type: 'text',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#10b981',
        motionBlur: false,
        expandedInTimeline: false,
        transform: {
          position: {
            value: { x: 400, y: 440 },
            isKeyframed: true,
            keyframes: [
              { id: 'tp1', time: 0, value: { x: 400, y: 440 }, easing: 'easeInOut' },
              { id: 'tp2', time: 1.5, value: { x: 400, y: 446 }, easing: 'easeInOut' },
              { id: 'tp3', time: 3.0, value: { x: 400, y: 440 }, easing: 'easeInOut' },
            ],
          },
          scale: { value: { x: 100, y: 100 }, isKeyframed: false, keyframes: [] },
          rotation: { value: 0, isKeyframed: false, keyframes: [] },
          opacity: {
            value: 90,
            isKeyframed: true,
            keyframes: [
              { id: 'to1', time: 0, value: 70, easing: 'easeInOut' },
              { id: 'to2', time: 1.5, value: 100, easing: 'easeInOut' },
              { id: 'to3', time: 3.0, value: 70, easing: 'easeInOut' },
            ],
          },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: '#38bdf8', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          fillType: 'solid',
          stroke: { value: 'none', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 0, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: 'transparent',
          shadowBlur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        text: {
          text: 'INITIALIZING SYSTEM',
          fontSize: { value: 14, isKeyframed: false, keyframes: [] },
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: '700',
          letterSpacing: { value: 4, isKeyframed: false, keyframes: [] },
          textAlign: 'center',
        },
        modifiers: [],
      },
    ],
  },
  {
    id: 'comp_success_pop',
    name: 'Bouncy Success Badge',
    width: 800,
    height: 600,
    fps: 60,
    duration: 2.5,
    backgroundColor: '#090d16',
    layers: [
      {
        id: 'badge_circle',
        name: 'Background Circle Badge',
        type: 'circle',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#10b981',
        motionBlur: true,
        expandedInTimeline: true,
        transform: {
          position: { value: { x: 400, y: 300 }, isKeyframed: false, keyframes: [] },
          scale: {
            value: { x: 100, y: 100 },
            isKeyframed: true,
            keyframes: [
              { id: 'b1', time: 0, value: { x: 0, y: 0 }, easing: 'elastic' },
              { id: 'b2', time: 0.8, value: { x: 100, y: 100 }, easing: 'easeOut' },
            ],
          },
          rotation: { value: 0, isKeyframed: false, keyframes: [] },
          opacity: { value: 100, isKeyframed: false, keyframes: [] },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: '#10b981', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          fillType: 'solid',
          stroke: { value: '#34d399', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 6, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: '#10b981',
          shadowBlur: { value: 24, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 8,
        },
        circle: {
          radiusX: { value: 80, isKeyframed: false, keyframes: [] },
          radiusY: { value: 80, isKeyframed: false, keyframes: [] },
        },
        modifiers: [],
      },
      {
        id: 'checkmark_path',
        name: 'Checkmark Vector Path',
        type: 'path',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#ffffff',
        motionBlur: true,
        expandedInTimeline: true,
        transform: {
          position: { value: { x: 400, y: 300 }, isKeyframed: false, keyframes: [] },
          scale: {
            value: { x: 100, y: 100 },
            isKeyframed: true,
            keyframes: [
              { id: 'cp1', time: 0, value: { x: 0, y: 0 }, easing: 'linear' },
              { id: 'cp2', time: 0.5, value: { x: 0, y: 0 }, easing: 'linear' },
              { id: 'cp3', time: 1.1, value: { x: 100, y: 100 }, easing: 'bounce' },
            ],
          },
          rotation: { value: 0, isKeyframed: false, keyframes: [] },
          opacity: { value: 100, isKeyframed: false, keyframes: [] },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: 'none', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 0, isKeyframed: false, keyframes: [] },
          fillType: 'none',
          stroke: { value: '#ffffff', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 12, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: 'transparent',
          shadowBlur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        path: {
          d: 'M -35 -5 L -10 25 L 35 -25',
        },
        modifiers: [],
      },
      {
        id: 'success_label',
        name: 'Success Title',
        type: 'text',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#6ee7b7',
        motionBlur: false,
        expandedInTimeline: false,
        transform: {
          position: {
            value: { x: 400, y: 430 },
            isKeyframed: true,
            keyframes: [
              { id: 'tl1', time: 0, value: { x: 400, y: 460 }, easing: 'easeOut' },
              { id: 'tl2', time: 0.9, value: { x: 400, y: 460 }, easing: 'easeOut' },
              { id: 'tl3', time: 1.5, value: { x: 400, y: 430 }, easing: 'easeOut' },
            ],
          },
          scale: { value: { x: 100, y: 100 }, isKeyframed: false, keyframes: [] },
          rotation: { value: 0, isKeyframed: false, keyframes: [] },
          opacity: {
            value: 100,
            isKeyframed: true,
            keyframes: [
              { id: 'to1', time: 0, value: 0, easing: 'linear' },
              { id: 'to2', time: 0.8, value: 0, easing: 'linear' },
              { id: 'to3', time: 1.3, value: 100, easing: 'linear' },
            ],
          },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: '#f9fafb', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          fillType: 'solid',
          stroke: { value: 'none', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 0, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: 'transparent',
          shadowBlur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        text: {
          text: 'PAYMENT COMPLETED',
          fontSize: { value: 20, isKeyframed: false, keyframes: [] },
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: '800',
          letterSpacing: { value: 2, isKeyframed: false, keyframes: [] },
          textAlign: 'center',
        },
        modifiers: [],
      },
    ],
  },
  {
    id: 'comp_notification_card',
    name: 'Floating App Notification',
    width: 800,
    height: 600,
    fps: 60,
    duration: 3.5,
    backgroundColor: '#0a0a0f',
    layers: [
      {
        id: 'card_bg',
        name: 'Frosted Glass Container',
        type: 'rect',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#6366f1',
        motionBlur: true,
        expandedInTimeline: true,
        transform: {
          position: {
            value: { x: 400, y: 300 },
            isKeyframed: true,
            keyframes: [
              { id: 'p1', time: 0, value: { x: 400, y: 220 }, easing: 'easeOut' },
              { id: 'p2', time: 0.8, value: { x: 400, y: 300 }, easing: 'bounce' },
              { id: 'p3', time: 2.8, value: { x: 400, y: 300 }, easing: 'easeIn' },
              { id: 'p4', time: 3.4, value: { x: 400, y: 200 }, easing: 'easeIn' },
            ],
          },
          scale: {
            value: { x: 100, y: 100 },
            isKeyframed: true,
            keyframes: [
              { id: 's1', time: 0, value: { x: 80, y: 80 }, easing: 'easeOut' },
              { id: 's2', time: 0.8, value: { x: 100, y: 100 }, easing: 'easeOut' },
              { id: 's3', time: 2.8, value: { x: 100, y: 100 }, easing: 'easeIn' },
              { id: 's4', time: 3.4, value: { x: 60, y: 60 }, easing: 'easeIn' },
            ],
          },
          rotation: {
            value: 0,
            isKeyframed: true,
            keyframes: [
              { id: 'r1', time: 0, value: -6, easing: 'easeOut' },
              { id: 'r2', time: 0.8, value: 0, easing: 'easeOut' },
              { id: 'r3', time: 2.8, value: 0, easing: 'easeIn' },
              { id: 'r4', time: 3.4, value: 8, easing: 'easeIn' },
            ],
          },
          opacity: {
            value: 100,
            isKeyframed: true,
            keyframes: [
              { id: 'o1', time: 0, value: 0, easing: 'easeOut' },
              { id: 'o2', time: 0.4, value: 100, easing: 'easeOut' },
              { id: 'o3', time: 2.9, value: 100, easing: 'easeIn' },
              { id: 'o4', time: 3.4, value: 0, easing: 'easeIn' },
            ],
          },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: '#18181b', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 92, isKeyframed: false, keyframes: [] },
          fillType: 'solid',
          stroke: { value: '#3f3f46', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 1.5, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: '#000000',
          shadowBlur: { value: 30, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 12,
        },
        rect: {
          width: { value: 380, isKeyframed: false, keyframes: [] },
          height: { value: 100, isKeyframed: false, keyframes: [] },
          cornerRadius: { value: 18, isKeyframed: false, keyframes: [] },
        },
        modifiers: [],
      },
      {
        id: 'bell_star',
        name: 'Notification Icon Badge',
        type: 'star',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#eab308',
        motionBlur: false,
        expandedInTimeline: false,
        transform: {
          position: { value: { x: 260, y: 300 }, isKeyframed: false, keyframes: [] },
          scale: {
            value: { x: 100, y: 100 },
            isKeyframed: true,
            keyframes: [
              { id: 'sk1', time: 0.4, value: { x: 0, y: 0 }, easing: 'elastic' },
              { id: 'sk2', time: 1.1, value: { x: 100, y: 100 }, easing: 'elastic' },
            ],
          },
          rotation: {
            value: 0,
            isKeyframed: true,
            keyframes: [
              { id: 'rk1', time: 0.9, value: 0, easing: 'easeInOut' },
              { id: 'rk2', time: 1.1, value: 20, easing: 'easeInOut' },
              { id: 'rk3', time: 1.3, value: -20, easing: 'easeInOut' },
              { id: 'rk4', time: 1.5, value: 0, easing: 'easeInOut' },
            ],
          },
          opacity: { value: 100, isKeyframed: false, keyframes: [] },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: '#f59e0b', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          fillType: 'solid',
          stroke: { value: '#fbbf24', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 2, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: '#f59e0b',
          shadowBlur: { value: 12, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        star: {
          points: { value: 5, isKeyframed: false, keyframes: [] },
          outerRadius: { value: 24, isKeyframed: false, keyframes: [] },
          innerRadius: { value: 12, isKeyframed: false, keyframes: [] },
        },
        modifiers: [],
      },
      {
        id: 'notif_title',
        name: 'Card Header Text',
        type: 'text',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#ffffff',
        motionBlur: false,
        expandedInTimeline: false,
        transform: {
          position: { value: { x: 375, y: 288 }, isKeyframed: false, keyframes: [] },
          scale: { value: { x: 100, y: 100 }, isKeyframed: false, keyframes: [] },
          rotation: { value: 0, isKeyframed: false, keyframes: [] },
          opacity: { value: 100, isKeyframed: false, keyframes: [] },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: '#ffffff', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          fillType: 'solid',
          stroke: { value: 'none', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 0, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: 'transparent',
          shadowBlur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        text: {
          text: 'New Project Shared',
          fontSize: { value: 17, isKeyframed: false, keyframes: [] },
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: '700',
          letterSpacing: { value: 0, isKeyframed: false, keyframes: [] },
          textAlign: 'left',
        },
        modifiers: [],
      },
      {
        id: 'notif_sub',
        name: 'Card Subtitle Text',
        type: 'text',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#a1a1aa',
        motionBlur: false,
        expandedInTimeline: false,
        transform: {
          position: { value: { x: 375, y: 314 }, isKeyframed: false, keyframes: [] },
          scale: { value: { x: 100, y: 100 }, isKeyframed: false, keyframes: [] },
          rotation: { value: 0, isKeyframed: false, keyframes: [] },
          opacity: { value: 80, isKeyframed: false, keyframes: [] },
          anchorPoint: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
          skew: { value: { x: 0, y: 0 }, isKeyframed: false, keyframes: [] },
        },
        style: {
          fill: { value: '#94a3b8', isKeyframed: false, keyframes: [] },
          fillOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          fillType: 'solid',
          stroke: { value: 'none', isKeyframed: false, keyframes: [] },
          strokeWidth: { value: 0, isKeyframed: false, keyframes: [] },
          strokeOpacity: { value: 100, isKeyframed: false, keyframes: [] },
          strokeDashArray: { value: '', isKeyframed: false, keyframes: [] },
          trimStart: { value: 0, isKeyframed: false, keyframes: [] },
          trimEnd: { value: 100, isKeyframed: false, keyframes: [] },
          trimOffset: { value: 0, isKeyframed: false, keyframes: [] },
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowColor: 'transparent',
          shadowBlur: { value: 0, isKeyframed: false, keyframes: [] },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        text: {
          text: 'Sarah invited you to edit "Motion Specs"',
          fontSize: { value: 13, isKeyframed: false, keyframes: [] },
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: '400',
          letterSpacing: { value: 0, isKeyframed: false, keyframes: [] },
          textAlign: 'left',
        },
        modifiers: [],
      },
    ],
  },
];

import { TEMPLATE_CATALOG } from './richTemplates';

// Export with modern template compositions
export const PRESET_COMPOSITIONS: Composition[] = TEMPLATE_CATALOG.map((t) => t.composition);
