export type LayerType = 'rect' | 'circle' | 'star' | 'polygon' | 'path' | 'text' | 'line' | 'group' | 'image';

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
  x: number;
  y: number;
}

export interface Keyframe<T> {
  id: string;
  time: number; // in seconds
  value: T;
  easing: EasingType;
  handleIn?: BezierHandle; // (0..1, 0..1) relative handle for graph editor
  handleOut?: BezierHandle;
}

export interface AnimatableProp<T> {
  value: T;
  isKeyframed: boolean;
  keyframes: Keyframe<T>[];
}

export interface PathNode {
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

export interface LayerTransform {
  position: AnimatableProp<{ x: number; y: number }>;
  scale: AnimatableProp<{ x: number; y: number }>;
  rotation: AnimatableProp<number>; // degrees
  opacity: AnimatableProp<number>; // 0 to 100
  anchorPoint: AnimatableProp<{ x: number; y: number }>;
  skew: AnimatableProp<{ x: number; y: number }>;
}

export interface LayerStyle {
  fill: AnimatableProp<string>;
  fillOpacity: AnimatableProp<number>;
  fillType: 'solid' | 'linear-gradient' | 'radial-gradient' | 'none';
  gradientStops?: { offset: number; color: string }[];
  gradientAngle?: number;
  stroke: AnimatableProp<string>;
  strokeWidth: AnimatableProp<number>;
  strokeOpacity: AnimatableProp<number>;
  strokeDashArray: AnimatableProp<string>;
  trimStart: AnimatableProp<number>; // 0 to 100%
  trimEnd: AnimatableProp<number>;   // 0 to 100%
  trimOffset: AnimatableProp<number>; // 0 to 360 deg
  lineCap: 'round' | 'butt' | 'square';
  lineJoin: 'round' | 'miter' | 'bevel';
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge';
  blur: AnimatableProp<number>;
  shadowColor: string;
  shadowBlur: AnimatableProp<number>;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface RectGeometry {
  width: AnimatableProp<number>;
  height: AnimatableProp<number>;
  cornerRadius: AnimatableProp<number>;
}

export interface CircleGeometry {
  radiusX: AnimatableProp<number>;
  radiusY: AnimatableProp<number>;
}

export interface StarGeometry {
  points: AnimatableProp<number>;
  outerRadius: AnimatableProp<number>;
  innerRadius: AnimatableProp<number>;
}

export interface PolygonGeometry {
  sides: AnimatableProp<number>;
  radius: AnimatableProp<number>;
}

export interface PathGeometry {
  d: string; // SVG path string
  nodes?: PathNode[];
  closed?: boolean;
}

export interface TextGeometry {
  text: string;
  fontSize: AnimatableProp<number>;
  fontFamily: string;
  fontWeight: string | number;
  letterSpacing: AnimatableProp<number>;
  textAlign: 'left' | 'center' | 'right';
  textAnchor?: 'start' | 'middle' | 'end';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  anchorOrigin?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'middle-left'
    | 'center'
    | 'middle-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  lineHeight?: number;
}

export interface ImageFilters {
  brightness?: number; // percentage, default 100
  contrast?: number;   // percentage, default 100
  saturate?: number;   // percentage, default 100
  hueRotate?: number;  // degrees, default 0
  blur?: number;       // px, default 0
  grayscale?: number;  // percentage, default 0
  sepia?: number;      // percentage, default 0
  invert?: number;     // percentage, default 0
}

export interface ImageGeometry {
  src: string; // Data URL or Image URL
  width: AnimatableProp<number>;
  height: AnimatableProp<number>;
  fileName?: string; // Original uploaded file name (e.g. 'foto.jpg', 'logo.png', 'banner.gif')
  mimeType?: string; // MIME type (e.g. 'image/jpeg', 'image/png', 'image/gif')
  naturalWidth?: number; // Original native resolution width
  naturalHeight?: number; // Original native resolution height
  scalingMode?: 'contain' | 'cover' | 'fill' | 'none'; // Google Web Designer scaling mode
  cornerRadius?: AnimatableProp<number>; // Rounded corners in px
  filters?: ImageFilters; // Google Web Designer CSS filters
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  aspectLocked?: boolean;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export interface LayerModifier {
  id: string;
  type: 'repeater' | 'wiggle' | 'wave';
  enabled: boolean;
  repeater?: {
    copies: number;
    offset: { x: number; y: number };
    rotationOffset: number;
    scaleOffset: { x: number; y: number };
    opacityOffset: number;
  };
  wiggle?: {
    frequency: number; // Hz
    positionAmp: number;
    rotationAmp: number;
    scaleAmp: number;
  };
  wave?: {
    amplitude: number;
    frequency: number;
    speed: number;
  };
}

export interface VectorLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  solo: boolean;
  colorTag: string;
  parentLayerId?: string | null;
  parentFollowOptions?: {
    followPosition?: boolean;
    followRotation?: boolean;
    followScale?: boolean;
    lagSeconds?: number; // Organic inertia delay (e.g. 0.08s)
  };
  springDynamics?: {
    enabled: boolean;
    tension: number; // 20 to 300
    damping: number; // 5 to 50
    mass: number; // 0.5 to 3.0
  };
  motionBlur: boolean;
  expandedInTimeline: boolean;
  // Ad Tech & Interactivity
  isTapArea?: boolean;
  clickTag?: string; // Optional custom target URL per layer
  ctaShine?: boolean; // Dynamic shimmer / sweep light effect on buttons
  transform: LayerTransform;
  style: LayerStyle;
  rect?: RectGeometry;
  circle?: CircleGeometry;
  star?: StarGeometry;
  polygon?: PolygonGeometry;
  path?: PathGeometry;
  text?: TextGeometry;
  image?: ImageGeometry;
  modifiers: LayerModifier[];
}

export interface CustomGuide {
  id: string;
  axis: 'horizontal' | 'vertical';
  position: number; // In canvas pixels (Y for horizontal, X for vertical)
  color?: string; // Optional custom guide color (e.g. #06b6d4)
  locked?: boolean;
}

export interface Composition {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number; // 30 or 60
  duration: number; // in seconds, e.g. 4.0
  backgroundColor: string;
  layers: VectorLayer[];
  guides?: CustomGuide[]; // User-created guide lines from rulers
  // Global Ad Tech Settings (IAB / Google Web Designer standard)
  clickTagUrl?: string;
  adStandardFormat?: string; // e.g. '600x500', '728x90', '640x200', '420x200', '1100x361', '630x250'
}

export type ToolType =
  | 'select'
  | 'directSelect'
  | 'pen'
  | 'rect'
  | 'circle'
  | 'star'
  | 'polygon'
  | 'text'
  | 'hand'
  | 'zoom'
  | 'anchorPoint';

export interface ViewportState {
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showSafeAreas: boolean;
  snapToGrid: boolean;
  onionSkin: boolean;
  guidesLocked?: boolean;
  snapToGuides?: boolean;
}

export interface ProjectHistoryState {
  past: Composition[];
  future: Composition[];
}

export type PanelPosition = 'left' | 'right';
export type InspectorTab = 'transform' | 'motion' | 'style' | 'fx';

export interface WorkspaceLayout {
  id: string;
  name: string;
  description: string;
  icon: string;
  isBuiltIn?: boolean;
  shortcut?: string;
  updatedAt?: number;
  toolbar: {
    visible: boolean;
    position: PanelPosition;
    compact?: boolean;
  };
  inspector: {
    visible: boolean;
    position: PanelPosition;
    width: number;
    activeTab?: InspectorTab;
  };
  timeline: {
    visible: boolean;
    height: number;
    collapsed?: boolean;
  };
  viewport: {
    showGrid: boolean;
    showRulers: boolean;
    showSafeAreas: boolean;
    snapToGrid: boolean;
    onionSkin: boolean;
  };
}
