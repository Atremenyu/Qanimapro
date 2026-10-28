import React, { useState, useEffect, useRef } from 'react';
import {
  VectorLayer,
  Composition,
  AnimatableProp,
  LayerModifier,
  EasingType,
} from '../types';
import {
  Maximize,
  Repeat,
  Flame,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Type,
  Layers,
  Palette,
  Download,
  Settings,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
  Zap,
  Diamond,
  Move,
  Scaling,
  RotateCw,
  SunMedium,
  Crosshair,
  Sparkles,
  Paintbrush,
  Square,
  Circle,
  Star,
  Hexagon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Search,
  Activity,
  Sliders,
  LayoutGrid,
  Link2,
  Unlink2,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Globe,
  Wand2,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { MOTION_PRESETS, clearLayerKeyframes, MotionPreset } from '../utils/motionPresets';
import { evaluateProp } from '../utils/animEngine';
import { GOOGLE_FONTS_CATALOG, loadGoogleFont } from '../utils/googleFonts';
import { AlignmentToolbar } from './AlignmentToolbar';
import { FigmaAlignAction } from '../utils/figmaTools';

interface PropertyInspectorProps {
  layer: VectorLayer | null;
  composition: Composition;
  currentTime: number;
  selectedLayersCount?: number;
  autoKeyframe?: boolean;
  width?: number;
  defaultTab?: 'transform' | 'motion' | 'style' | 'fx';
  position?: 'left' | 'right';
  onDismiss?: () => void;
  onUpdateLayer: (layerId: string, updated: Partial<VectorLayer>) => void;
  onDuplicateLayer: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onUpdateComposition: (updated: Partial<Composition>) => void;
  onAddLayer?: (type: VectorLayer['type']) => void;
  onOpenExportModal?: () => void;
  onOpenCompSettings?: () => void;
  onReorderLayer?: (layerId: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
  onOpenMotionPresets?: () => void;
  onAddKeyframeQuick?: (type: 'rotation' | 'scale' | 'opacity' | 'position' | 'all') => void;
  onApplyFigmaAlign?: (action: FigmaAlignAction, alignToCanvas?: boolean) => void;
}

interface ScrubbableInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  precision?: number;
  onChange: (val: number) => void;
  isKeyframed?: boolean;
  onToggleKeyframe?: () => void;
}

export const ScrubbableInput: React.FC<ScrubbableInputProps> = ({
  label,
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  unit = '',
  precision = 0,
  onChange,
  isKeyframed,
  onToggleKeyframe,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(String(value));

  const handleLabelMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startVal = Number(value) || 0;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const multiplier = moveEvent.shiftKey ? 10 : moveEvent.altKey ? 0.1 : 1;
      let nextVal = startVal + deltaX * step * multiplier;
      if (min !== undefined) nextVal = Math.max(min, nextVal);
      if (max !== undefined) nextVal = Math.min(max, nextVal);
      if (precision === 0) nextVal = Math.round(nextVal);
      else nextVal = parseFloat(nextVal.toFixed(precision));
      onChange(nextVal);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.body.style.cursor = 'ew-resize';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleBlur = () => {
    setIsEditing(false);
    let parsed = parseFloat(tempVal);
    if (isNaN(parsed)) parsed = value;
    if (min !== undefined) parsed = Math.max(min, parsed);
    if (max !== undefined) parsed = Math.min(max, parsed);
    if (precision === 0) parsed = Math.round(parsed);
    else parsed = parseFloat(parsed.toFixed(precision));
    onChange(parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempVal(String(value));
    }
  };

  return (
    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs hover:border-zinc-700 transition-colors group">
      <span
        onMouseDown={handleLabelMouseDown}
        title="Arrastra para ajustar o haz clic en el número para escribir"
        className="text-[10px] font-mono text-zinc-400 font-bold select-none cursor-ew-resize mr-1.5 hover:text-blue-400 shrink-0"
      >
        {label}
      </span>
      {isEditing ? (
        <input
          type="number"
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full bg-transparent font-mono text-zinc-100 font-semibold outline-none text-xs"
        />
      ) : (
        <span
          onClick={() => {
            setTempVal(precision > 0 ? Number(value).toFixed(precision) : String(Math.round(value)));
            setIsEditing(true);
          }}
          className="w-full font-mono text-zinc-200 font-semibold cursor-text truncate text-xs"
        >
          {precision > 0 ? Number(value).toFixed(precision) : Math.round(value)}
          {unit && <span className="text-[10px] text-zinc-500 ml-0.5">{unit}</span>}
        </span>
      )}
      {onToggleKeyframe && (
        <button
          onClick={onToggleKeyframe}
          title={isKeyframed ? 'Keyframe activo' : 'Crear keyframe'}
          className={`ml-1 p-0.5 rounded cursor-pointer transition-colors ${
            isKeyframed
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-zinc-500 hover:text-zinc-200 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Diamond className={`w-2.5 h-2.5 ${isKeyframed ? 'fill-current' : ''}`} />
        </button>
      )}
    </div>
  );
};

const STOCK_IMAGE_PRESETS = [
  {
    name: 'Trabajo & Tech',
    category: 'Oficina',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ciudad Neón',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Estudio Minimal',
    category: 'Diseño',
    url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Montañas Sunset',
    category: 'Naturaleza',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Retrato Moderno',
    category: 'Persona',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ondas Vibrantes 3D',
    category: 'Abstracto',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Producto Calzado',
    category: 'E-commerce',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Formas Geométricas',
    category: 'Creativo',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
  },
];

const IMAGE_FILTER_PRESETS = [
  { name: 'Original', filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0, hueRotate: 0, grayscale: 0, sepia: 0, invert: 0 } },
  { name: 'Vibrante', filters: { brightness: 105, contrast: 115, saturate: 145, blur: 0, hueRotate: 0, grayscale: 0, sepia: 0, invert: 0 } },
  { name: 'B&W Drama', filters: { brightness: 105, contrast: 130, saturate: 0, blur: 0, hueRotate: 0, grayscale: 100, sepia: 0, invert: 0 } },
  { name: 'Vintage', filters: { brightness: 105, contrast: 95, saturate: 85, blur: 0, hueRotate: 0, grayscale: 0, sepia: 55, invert: 0 } },
  { name: 'Cálido', filters: { brightness: 100, contrast: 105, saturate: 125, blur: 0, hueRotate: 345, grayscale: 0, sepia: 25, invert: 0 } },
  { name: 'Cyber Neón', filters: { brightness: 110, contrast: 130, saturate: 160, blur: 0, hueRotate: 180, grayscale: 0, sepia: 0, invert: 0 } },
  { name: 'Invertido', filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0, hueRotate: 0, grayscale: 0, sepia: 0, invert: 100 } },
  { name: 'Dramático', filters: { brightness: 90, contrast: 140, saturate: 80, blur: 0, hueRotate: 0, grayscale: 20, sepia: 10, invert: 0 } },
];

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  layer,
  composition,
  currentTime,
  selectedLayersCount = 1,
  autoKeyframe = true,
  width = 320,
  defaultTab = 'transform',
  position = 'right',
  onDismiss,
  onUpdateLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onUpdateComposition,
  onAddLayer,
  onOpenExportModal,
  onOpenCompSettings,
  onReorderLayer,
  onOpenMotionPresets,
  onApplyFigmaAlign,
}) => {
  const [activeTab, setActiveTab] = useState<'transform' | 'motion' | 'style' | 'fx'>(defaultTab);
  const [isAspectLocked, setIsAspectLocked] = useState(true);
  const [fontSearch, setFontSearch] = useState('');
  const [fontCategory, setFontCategory] = useState<'all' | 'sans-serif' | 'serif' | 'display' | 'monospace'>('all');
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isStockPickerOpen, setIsStockPickerOpen] = useState(false);
  const imageReplaceInputRef = useRef<HTMLInputElement>(null);

  // Swipe / Drag to Dismiss state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Drag to dismiss gestures (Only active from the edge tab/handle)
  const handleHandlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    startXRef.current = e.clientX;
    startTimeRef.current = Date.now();
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startXRef.current === null) return;
    const diff = e.clientX - startXRef.current;
    if (position === 'right') {
      setDragOffset(Math.max(0, Math.min(width, diff)));
    } else {
      setDragOffset(Math.min(0, Math.max(-width, diff)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (startXRef.current === null) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    const elapsed = Date.now() - startTimeRef.current;
    const absOffset = Math.abs(dragOffset);
    // Require deliberate drag distance so it never dismisses accidentally
    if (onDismiss && (absOffset > 70 || (absOffset > 35 && elapsed < 220))) {
      onDismiss();
    }
    setDragOffset(0);
    setIsDragging(false);
    startXRef.current = null;
  };

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const adPresets = [
    { label: '600×500 (Portada Estándar)', w: 600, h: 500 },
    { label: '728×90 (Leaderboard)', w: 728, h: 90 },
    { label: '640×200 (Banner Horizontal)', w: 640, h: 200 },
    { label: '420×200 (Banner Compacto)', w: 420, h: 200 },
    { label: '1100×361 (Billboard / Header)', w: 1100, h: 361 },
    { label: '630×250 (Banner Rectangular)', w: 630, h: 250 },
    { label: '300×250 (Medium Rect)', w: 300, h: 250 },
    { label: '300×600 (Half Page)', w: 300, h: 600 },
    { label: '1080×1080 (Square 1:1)', w: 1080, h: 1080 },
    { label: '800×600 (Standard Web)', w: 800, h: 600 },
  ];

  // ----------------------------------------------------
  // RENDER COMPOSITION INSPECTOR WHEN NO LAYER IS SELECTED
  // ----------------------------------------------------
  if (!layer) {
    return (
      <aside
        style={{
          width: `${width}px`,
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`bg-zinc-950 flex flex-col select-none shrink-0 overflow-y-auto custom-scrollbar relative z-20 group/inspector ${
          position === 'right' ? 'border-l border-zinc-800/80' : 'border-r border-zinc-800/80'
        }`}
      >
        {/* Edge Drag Tab / Handle Strip (Only this tab triggers hiding/dragging) */}
        {onDismiss && (
          <div
            onPointerDown={handleHandlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.();
            }}
            title={`Haz clic o arrastra desde esta pestaña hacia ${position === 'right' ? 'la derecha' : 'la izquierda'} para ocultar`}
            className={`absolute top-1/2 -translate-y-1/2 ${
              position === 'right' ? '-left-3' : '-right-3'
            } w-3.5 h-14 z-30 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-zinc-800/90 bg-zinc-900 border border-zinc-700/80 rounded-full transition-all shadow-md group/handle`}
          >
            <div className="w-1 h-8 rounded-full bg-zinc-500 group-hover/handle:bg-blue-400 group-hover/handle:w-1.5 transition-all shadow-sm" />
          </div>
        )}

        {/* Header: Composition Settings */}
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className="w-5 h-5 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Layers className="w-3 h-3" />
            </div>
            <div className="truncate">
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                Composición
              </div>
              <input
                type="text"
                value={composition.name}
                onChange={(e) => onUpdateComposition({ name: e.target.value })}
                className="bg-transparent text-xs font-bold text-zinc-100 focus:bg-zinc-900 px-1 py-0.5 rounded outline-none border border-transparent focus:border-blue-500 truncate w-full"
              />
            </div>
          </div>

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
            {(composition.layers || []).length} {(composition.layers || []).length === 1 ? 'Capa' : 'Capas'}
          </span>
        </div>

        {/* Composition Controls Body */}
        <div className="p-3 space-y-4 flex-1 text-xs">
          {/* Dimensions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-[11px] font-bold font-mono flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-blue-400" />
                Dimensiones del Lienzo
              </span>
              <span className="text-[10px] font-mono text-blue-400 font-semibold">
                {composition.width} × {composition.height}px
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ScrubbableInput
                label="W"
                value={composition.width}
                min={50}
                max={3840}
                unit="px"
                onChange={(w) => onUpdateComposition({ width: w })}
              />
              <ScrubbableInput
                label="H"
                value={composition.height}
                min={50}
                max={2160}
                unit="px"
                onChange={(h) => onUpdateComposition({ height: h })}
              />
            </div>

            {/* Presets */}
            <div>
              <span className="text-[10px] font-mono text-zinc-500 block mb-1">
                Formatos Google Ads &amp; Web:
              </span>
              <div className="flex flex-wrap gap-1">
                {adPresets.map((preset) => {
                  const isCurrent =
                    composition.width === preset.w && composition.height === preset.h;
                  return (
                    <button
                      key={preset.label}
                      onClick={() =>
                        onUpdateComposition({ width: preset.w, height: preset.h })
                      }
                      className={`text-[10px] px-2 py-1 rounded font-mono transition-all text-left cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      {preset.w}×{preset.h}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-[11px] font-bold font-mono flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-400" />
                Color de Fondo
              </span>
              <span className="font-mono text-zinc-400 text-[10px]">
                {composition.backgroundColor}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={composition.backgroundColor}
                onChange={(e) => onUpdateComposition({ backgroundColor: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={composition.backgroundColor}
                onChange={(e) => onUpdateComposition({ backgroundColor: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 font-mono text-zinc-100 text-xs uppercase"
              />
            </div>
          </div>

          {/* Export / Settings Action */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-2">
            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-sm text-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar HTML5 Google Ads</span>
              </button>
            )}

            {onOpenCompSettings && (
              <button
                onClick={onOpenCompSettings}
                className="w-full py-1.5 px-3 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white font-medium flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-400" />
                <span>Configuración de Composición (Ctrl+K)</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // ----------------------------------------------------
  // RENDER LAYER INSPECTOR WHEN A LAYER IS SELECTED
  // ----------------------------------------------------

  // Real-time evaluated values
  const currentPos = evaluateProp(layer.transform.position, currentTime) as { x: number; y: number };
  const currentScale = evaluateProp(layer.transform.scale, currentTime) as { x: number; y: number };
  const currentRot = evaluateProp(layer.transform.rotation, currentTime) as number;
  const currentOpacity = evaluateProp(layer.transform.opacity, currentTime) as number;
  const currentAnchor = evaluateProp(layer.transform.anchorPoint, currentTime) as { x: number; y: number };

  const currentFill = (evaluateProp(layer.style.fill, currentTime) || '#3b82f6') as string;
  const currentStroke = (evaluateProp(layer.style.stroke, currentTime) || '#60a5fa') as string;
  const currentStrokeWidth = evaluateProp(layer.style.strokeWidth, currentTime) as number;
  const currentTrimStart = evaluateProp(layer.style.trimStart, currentTime) as number;
  const currentTrimEnd = evaluateProp(layer.style.trimEnd, currentTime) as number;
  const currentShadowBlur = evaluateProp(layer.style.shadowBlur, currentTime) as number;

  const currentRectWidth = layer.rect ? (evaluateProp(layer.rect.width, currentTime) as number) : 100;
  const currentRectHeight = layer.rect ? (evaluateProp(layer.rect.height, currentTime) as number) : 100;
  const currentRectRadius = layer.rect ? (evaluateProp(layer.rect.cornerRadius, currentTime) as number) : 0;

  const currentCircleRadiusX = layer.circle ? (evaluateProp(layer.circle.radiusX, currentTime) as number) : 50;
  const currentCircleRadiusY = layer.circle ? (evaluateProp(layer.circle.radiusY, currentTime) as number) : 50;

  const currentStarPoints = layer.star ? (evaluateProp(layer.star.points, currentTime) as number) : 5;
  const currentStarInnerRadius = layer.star ? (evaluateProp(layer.star.innerRadius, currentTime) as number) : 25;
  const currentStarOuterRadius = layer.star ? (evaluateProp(layer.star.outerRadius, currentTime) as number) : 50;

  const currentPolySides = layer.polygon ? (evaluateProp(layer.polygon.sides, currentTime) as number) : 6;
  const currentPolyRadius = layer.polygon ? (evaluateProp(layer.polygon.radius, currentTime) as number) : 50;

  const currentFontSize = layer.text ? (evaluateProp(layer.text.fontSize, currentTime) as number) : 32;
  const currentLetterSpacing = layer.text ? (evaluateProp(layer.text.letterSpacing, currentTime) as number) : 0;

  const currentImageWidth = layer.image ? (evaluateProp(layer.image.width, currentTime) as number) : 200;
  const currentImageHeight = layer.image ? (evaluateProp(layer.image.height, currentTime) as number) : 200;
  const currentImageCornerRadius = layer.image?.cornerRadius
    ? (evaluateProp(layer.image.cornerRadius, currentTime) as number)
    : 0;

  const handleImageSrcUpdate = (src: string, fileName?: string, mimeType?: string) => {
    if (!layer.image) return;
    const img = new Image();
    img.onload = () => {
      const nw = img.naturalWidth || 400;
      const nh = img.naturalHeight || 300;
      let w = nw;
      let h = nh;
      const maxDim = 400;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      onUpdateLayer(layer.id, {
        image: {
          ...layer.image!,
          src,
          fileName: fileName || layer.image!.fileName || 'imagen.png',
          mimeType: mimeType || layer.image!.mimeType || 'image/png',
          naturalWidth: nw,
          naturalHeight: nh,
          width: { ...layer.image!.width, value: w },
          height: { ...layer.image!.height, value: h },
        },
      });
    };
    img.src = src;
  };

  const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !layer.image) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handleImageSrcUpdate(result, file.name, file.type || 'image/png');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Generic animatable property updater
  const updateAnimProp = <T,>(
    prop: AnimatableProp<T>,
    newValue: T,
    onApply: (updated: AnimatableProp<T>) => void
  ) => {
    const updated: AnimatableProp<T> = {
      ...prop,
      value: JSON.parse(JSON.stringify(newValue)),
      keyframes: prop.keyframes ? [...prop.keyframes] : [],
    };

    if (autoKeyframe || prop.isKeyframed) {
      updated.isKeyframed = true;

      const existingIdx = updated.keyframes.findIndex(
        (k) => Math.abs(k.time - currentTime) < 0.06
      );
      if (existingIdx >= 0) {
        updated.keyframes[existingIdx] = {
          ...updated.keyframes[existingIdx],
          value: JSON.parse(JSON.stringify(newValue)),
        };
      } else {
        updated.keyframes.push({
          id: 'kf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          time: currentTime,
          value: JSON.parse(JSON.stringify(newValue)),
          easing: 'easeInOut',
        });
      }
      updated.keyframes.sort((a, b) => a.time - b.time);
    }

    onApply(updated);
  };

  const addModifier = (type: LayerModifier['type']) => {
    const newMod: LayerModifier = {
      id: 'mod_' + Date.now(),
      type,
      enabled: true,
      repeater:
        type === 'repeater'
          ? {
              copies: 4,
              offset: { x: 30, y: 0 },
              rotationOffset: 30,
              scaleOffset: { x: -10, y: -10 },
              opacityOffset: 15,
            }
          : undefined,
      wiggle:
        type === 'wiggle'
          ? {
              frequency: 2.5,
              positionAmp: 15,
              rotationAmp: 10,
              scaleAmp: 5,
            }
          : undefined,
    };
    onUpdateLayer(layer.id, {
      modifiers: [...(layer.modifiers || []), newMod],
    });
  };

  const removeModifier = (modId: string) => {
    onUpdateLayer(layer.id, {
      modifiers: (layer.modifiers || []).filter((m) => m.id !== modId),
    });
  };

  return (
    <aside
      style={{
        width: `${width}px`,
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`bg-zinc-950 flex flex-col select-none shrink-0 overflow-y-auto custom-scrollbar relative z-20 group/inspector ${
        position === 'right' ? 'border-l border-zinc-800/80' : 'border-r border-zinc-800/80'
      }`}
    >
      {/* Edge Drag Tab / Handle Strip (Only this tab triggers hiding/dragging) */}
      {onDismiss && (
        <div
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.();
          }}
          title={`Haz clic o arrastra desde esta pestaña hacia ${position === 'right' ? 'la derecha' : 'la izquierda'} para ocultar`}
          className={`absolute top-1/2 -translate-y-1/2 ${
            position === 'right' ? '-left-3' : '-right-3'
          } w-3.5 h-14 z-30 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-zinc-800/90 bg-zinc-900 border border-zinc-700/80 rounded-full transition-all shadow-md group/handle`}
        >
          <div className="w-1 h-8 rounded-full bg-zinc-500 group-hover/handle:bg-blue-400 group-hover/handle:w-1.5 transition-all shadow-sm" />
        </div>
      )}

      {/* Layer Title & Actions */}
      <div className="p-2.5 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate min-w-0">
          <div
            style={{ backgroundColor: layer.colorTag }}
            className="w-2.5 h-2.5 rounded-full shrink-0"
          />
          <input
            type="text"
            value={layer.name}
            onChange={(e) => onUpdateLayer(layer.id, { name: e.target.value })}
            className="bg-transparent text-xs font-semibold text-zinc-100 focus:bg-zinc-900 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-blue-500 truncate"
          />
          {selectedLayersCount > 1 && (
            <span className="text-[9px] bg-blue-900/60 border border-blue-700 text-blue-300 font-bold px-1.5 py-0.5 rounded-full shrink-0">
              +{selectedLayersCount - 1}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onDuplicateLayer(layer.id)}
            title="Duplicar Capa (Ctrl+D)"
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-850 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteLayer(layer.id)}
            title="Eliminar Capa (Supr)"
            className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-850 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer Stack Reordering Strip */}
      {onReorderLayer && (
        <div className="px-3 py-1 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-zinc-400 font-mono text-[10px]">
            <Layers className="w-3 h-3 text-blue-400" />
            <span>
              Capa {Math.max(1, (composition.layers || []).findIndex((l) => l.id === layer.id) + 1)} de {(composition.layers || []).length}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onReorderLayer(layer.id, 'front')}
              disabled={(composition.layers || []).findIndex((l) => l.id === layer.id) === 0}
              title="Traer al Frente (Ctrl+Shift+])"
              className="p-1 text-zinc-400 hover:text-white disabled:text-zinc-700 disabled:cursor-not-allowed hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            >
              <ChevronsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onReorderLayer(layer.id, 'forward')}
              disabled={(composition.layers || []).findIndex((l) => l.id === layer.id) === 0}
              title="Subir (Ctrl+] o Alt+↑)"
              className="p-1 text-zinc-400 hover:text-white disabled:text-zinc-700 disabled:cursor-not-allowed hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onReorderLayer(layer.id, 'backward')}
              disabled={(composition.layers || []).findIndex((l) => l.id === layer.id) === Math.max(0, (composition.layers || []).length - 1)}
              title="Bajar (Ctrl+[ o Alt+↓)"
              className="p-1 text-zinc-400 hover:text-white disabled:text-zinc-700 disabled:cursor-not-allowed hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => onReorderLayer(layer.id, 'back')}
              disabled={(composition.layers || []).findIndex((l) => l.id === layer.id) === Math.max(0, (composition.layers || []).length - 1)}
              title="Enviar al Fondo (Ctrl+Shift+[)"
              className="p-1 text-zinc-400 hover:text-white disabled:text-zinc-700 disabled:cursor-not-allowed hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            >
              <ChevronsDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 4 ORGANIZED TABS: Transform, Motion, Style, FX */}
      <div className="grid grid-cols-4 border-b border-zinc-800/80 bg-zinc-900/40 text-[11px] font-medium text-zinc-400">
        <button
          onClick={() => setActiveTab('transform')}
          className={`py-1.5 text-center transition-colors border-b-2 cursor-pointer ${
            activeTab === 'transform'
              ? 'text-blue-400 border-blue-500 bg-blue-950/20 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          Transform
        </button>
        <button
          onClick={() => setActiveTab('motion')}
          className={`py-1.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'motion'
              ? 'text-amber-400 border-amber-500 bg-amber-950/20 font-semibold'
              : 'border-transparent hover:text-amber-300'
          }`}
        >
          <Zap className="w-2.5 h-2.5 fill-current text-amber-400" />
          <span>Motion</span>
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`py-1.5 text-center transition-colors border-b-2 cursor-pointer ${
            activeTab === 'style'
              ? 'text-blue-400 border-blue-500 bg-blue-950/20 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          Style
        </button>
        <button
          onClick={() => setActiveTab('fx')}
          className={`py-1.5 text-center transition-colors border-b-2 cursor-pointer ${
            activeTab === 'fx'
              ? 'text-blue-400 border-blue-500 bg-blue-950/20 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          FX {(layer.modifiers || []).length > 0 && `(${(layer.modifiers || []).length})`}
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="p-3 space-y-3 flex-1 text-xs">
        {/* 1. TRANSFORM TAB */}
        {activeTab === 'transform' && (
          <div className="space-y-3">
            {/* Alignment & Distribution Quick Bar */}
            <AlignmentToolbar
              selectedLayerCount={selectedLayersCount}
              onAlign={(action, alignToCanvas) => {
                onApplyFigmaAlign?.(action, alignToCanvas);
              }}
              onReorder={(direction) => {
                onReorderLayer?.(layer.id, direction);
              }}
            />

            {/* Position (X, Y) */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Move className="w-3 h-3 text-sky-400" />
                Posición
              </span>
              <div className="grid grid-cols-2 gap-2">
                <ScrubbableInput
                  label="X"
                  value={currentPos.x}
                  unit="px"
                  isKeyframed={layer.transform.position.isKeyframed}
                  onChange={(x) =>
                    updateAnimProp(
                      layer.transform.position,
                      { x, y: currentPos.y },
                      (pos) => onUpdateLayer(layer.id, { transform: { ...layer.transform, position: pos } })
                    )
                  }
                />
                <ScrubbableInput
                  label="Y"
                  value={currentPos.y}
                  unit="px"
                  isKeyframed={layer.transform.position.isKeyframed}
                  onChange={(y) =>
                    updateAnimProp(
                      layer.transform.position,
                      { x: currentPos.x, y },
                      (pos) => onUpdateLayer(layer.id, { transform: { ...layer.transform, position: pos } })
                    )
                  }
                />
              </div>
            </div>

            {/* Scale (SX, SY) with Aspect Lock */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Scaling className="w-3 h-3 text-indigo-400" />
                  Escala
                </span>
                <button
                  onClick={() => setIsAspectLocked(!isAspectLocked)}
                  className="p-0.5 text-zinc-400 hover:text-zinc-100 cursor-pointer"
                  title={isAspectLocked ? 'Desbloquear Proporción' : 'Bloquear Proporción'}
                >
                  {isAspectLocked ? <Lock className="w-3 h-3 text-blue-400" /> : <Unlock className="w-3 h-3" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ScrubbableInput
                  label="SX"
                  value={currentScale.x}
                  unit="%"
                  isKeyframed={layer.transform.scale.isKeyframed}
                  onChange={(sx) => {
                    const sy = isAspectLocked ? sx : currentScale.y;
                    updateAnimProp(
                      layer.transform.scale,
                      { x: sx, y: sy },
                      (sc) => onUpdateLayer(layer.id, { transform: { ...layer.transform, scale: sc } })
                    );
                  }}
                />
                <ScrubbableInput
                  label="SY"
                  value={currentScale.y}
                  unit="%"
                  isKeyframed={layer.transform.scale.isKeyframed}
                  onChange={(sy) => {
                    const sx = isAspectLocked ? sy : currentScale.x;
                    updateAnimProp(
                      layer.transform.scale,
                      { x: sx, y: sy },
                      (sc) => onUpdateLayer(layer.id, { transform: { ...layer.transform, scale: sc } })
                    );
                  }}
                />
              </div>
            </div>

            {/* Rotation & Opacity in compact 2-column grid */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-emerald-400" />
                Rotación &amp; Opacidad
              </span>
              <div className="grid grid-cols-2 gap-2">
                <ScrubbableInput
                  label="R"
                  value={currentRot}
                  unit="°"
                  isKeyframed={layer.transform.rotation.isKeyframed}
                  onChange={(rot) =>
                    updateAnimProp(layer.transform.rotation, rot, (r) =>
                      onUpdateLayer(layer.id, { transform: { ...layer.transform, rotation: r } })
                    )
                  }
                />
                <ScrubbableInput
                  label="Op"
                  value={currentOpacity}
                  min={0}
                  max={100}
                  unit="%"
                  isKeyframed={layer.transform.opacity.isKeyframed}
                  onChange={(op) =>
                    updateAnimProp(layer.transform.opacity, op, (o) =>
                      onUpdateLayer(layer.id, { transform: { ...layer.transform, opacity: o } })
                    )
                  }
                />
              </div>
            </div>

            {/* Anchor Point (AX, AY) */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-amber-400" />
                Punto de Anclaje
              </span>
              <div className="grid grid-cols-2 gap-2">
                <ScrubbableInput
                  label="AX"
                  value={currentAnchor.x}
                  unit="px"
                  onChange={(ax) =>
                    updateAnimProp(
                      layer.transform.anchorPoint,
                      { x: ax, y: currentAnchor.y },
                      (ap) => onUpdateLayer(layer.id, { transform: { ...layer.transform, anchorPoint: ap } })
                    )
                  }
                />
                <ScrubbableInput
                  label="AY"
                  value={currentAnchor.y}
                  unit="px"
                  onChange={(ay) =>
                    updateAnimProp(
                      layer.transform.anchorPoint,
                      { x: currentAnchor.x, y: ay },
                      (ap) => onUpdateLayer(layer.id, { transform: { ...layer.transform, anchorPoint: ap } })
                    )
                  }
                />
              </div>
            </div>

            {/* Parenting / Motion Linking (Vínculo de Movimiento) */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-purple-400" />
                  Vincular a Capa Padre (Parenting)
                </span>
                {layer.parentLayerId && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 font-semibold border border-purple-800/40">
                    Activo
                  </span>
                )}
              </span>

              <select
                value={layer.parentLayerId || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  onUpdateLayer(layer.id, { parentLayerId: val });
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 font-sans text-zinc-200 text-xs outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="">Ninguna (Capa Independiente)</option>
                {composition.layers
                  .filter((l) => l.id !== layer.id)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.type})
                    </option>
                  ))}
              </select>

              {layer.parentLayerId && (
                <div className="p-2 bg-zinc-900/60 border border-zinc-850 rounded-lg space-y-2 mt-1">
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={layer.parentFollowOptions?.followPosition !== false}
                        onChange={(e) =>
                          onUpdateLayer(layer.id, {
                            parentFollowOptions: {
                              ...layer.parentFollowOptions,
                              followPosition: e.target.checked,
                            },
                          })
                        }
                        className="rounded accent-purple-600"
                      />
                      <span>Posición</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={layer.parentFollowOptions?.followRotation !== false}
                        onChange={(e) =>
                          onUpdateLayer(layer.id, {
                            parentFollowOptions: {
                              ...layer.parentFollowOptions,
                              followRotation: e.target.checked,
                            },
                          })
                        }
                        className="rounded accent-purple-600"
                      />
                      <span>Rotación</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={layer.parentFollowOptions?.followScale !== false}
                        onChange={(e) =>
                          onUpdateLayer(layer.id, {
                            parentFollowOptions: {
                              ...layer.parentFollowOptions,
                              followScale: e.target.checked,
                            },
                          })
                        }
                        className="rounded accent-purple-600"
                      />
                      <span>Escala</span>
                    </label>
                  </div>

                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                      <span>Inercia / Retardo elástico:</span>
                      <span className="font-mono text-purple-400">
                        {((layer.parentFollowOptions?.lagSeconds || 0) * 1000).toFixed(0)}ms
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={0.25}
                      step={0.01}
                      value={layer.parentFollowOptions?.lagSeconds || 0}
                      onChange={(e) =>
                        onUpdateLayer(layer.id, {
                          parentFollowOptions: {
                            ...layer.parentFollowOptions,
                            lagSeconds: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-purple-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shape Geometry Controls (Rect, Circle, Star, Polygon, Text, Image) */}
            {layer.rect && (
              <div className="space-y-1 pt-2 border-t border-zinc-800/80">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Square className="w-3 h-3 text-blue-400" />
                  Dimensiones Rectángulo
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <ScrubbableInput
                    label="W"
                    value={currentRectWidth}
                    min={5}
                    unit="px"
                    onChange={(w) =>
                      updateAnimProp(layer.rect!.width, w, (rw) =>
                        onUpdateLayer(layer.id, { rect: { ...layer.rect!, width: rw } })
                      )
                    }
                  />
                  <ScrubbableInput
                    label="H"
                    value={currentRectHeight}
                    min={5}
                    unit="px"
                    onChange={(h) =>
                      updateAnimProp(layer.rect!.height, h, (rh) =>
                        onUpdateLayer(layer.id, { rect: { ...layer.rect!, height: rh } })
                      )
                    }
                  />
                </div>
                <div className="pt-1">
                  <ScrubbableInput
                    label="Radio"
                    value={currentRectRadius}
                    min={0}
                    max={100}
                    unit="px"
                    onChange={(cr) =>
                      updateAnimProp(layer.rect!.cornerRadius, cr, (rcr) =>
                        onUpdateLayer(layer.id, { rect: { ...layer.rect!, cornerRadius: rcr } })
                      )
                    }
                  />
                </div>
              </div>
            )}

            {layer.circle && (
              <div className="space-y-1 pt-2 border-t border-zinc-800/80">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Circle className="w-3 h-3 text-emerald-400" />
                  Radio Círculo / Elipse
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <ScrubbableInput
                    label="RX"
                    value={currentCircleRadiusX}
                    min={2}
                    unit="px"
                    onChange={(rx) =>
                      updateAnimProp(layer.circle!.radiusX, rx, (crx) =>
                        onUpdateLayer(layer.id, { circle: { ...layer.circle!, radiusX: crx } })
                      )
                    }
                  />
                  <ScrubbableInput
                    label="RY"
                    value={currentCircleRadiusY}
                    min={2}
                    unit="px"
                    onChange={(ry) =>
                      updateAnimProp(layer.circle!.radiusY, ry, (cry) =>
                        onUpdateLayer(layer.id, { circle: { ...layer.circle!, radiusY: cry } })
                      )
                    }
                  />
                </div>
              </div>
            )}

            {layer.star && (
              <div className="space-y-1 pt-2 border-t border-zinc-800/80">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  Propiedades Estrella
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <ScrubbableInput
                    label="Puntas"
                    value={currentStarPoints}
                    min={3}
                    max={16}
                    onChange={(p) =>
                      updateAnimProp(layer.star!.points, p, (sp) =>
                        onUpdateLayer(layer.id, { star: { ...layer.star!, points: sp } })
                      )
                    }
                  />
                  <ScrubbableInput
                    label="Radio Ext"
                    value={currentStarOuterRadius}
                    min={5}
                    unit="px"
                    onChange={(or) =>
                      updateAnimProp(layer.star!.outerRadius, or, (sor) =>
                        onUpdateLayer(layer.id, { star: { ...layer.star!, outerRadius: sor } })
                      )
                    }
                  />
                </div>
              </div>
            )}

            {layer.polygon && (
              <div className="space-y-1 pt-2 border-t border-zinc-800/80">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Hexagon className="w-3 h-3 text-purple-400" />
                  Propiedades Polígono
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <ScrubbableInput
                    label="Lados"
                    value={currentPolySides}
                    min={3}
                    max={12}
                    onChange={(s) =>
                      updateAnimProp(layer.polygon!.sides, s, (ps) =>
                        onUpdateLayer(layer.id, { polygon: { ...layer.polygon!, sides: ps } })
                      )
                    }
                  />
                  <ScrubbableInput
                    label="Radio"
                    value={currentPolyRadius}
                    min={5}
                    unit="px"
                    onChange={(r) =>
                      updateAnimProp(layer.polygon!.radius, r, (pr) =>
                        onUpdateLayer(layer.id, { polygon: { ...layer.polygon!, radius: pr } })
                      )
                    }
                  />
                </div>
              </div>
            )}

            {layer.text && (
              <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Type className="w-3 h-3 text-blue-400" />
                    Tipografía &amp; Texto
                  </span>
                  <span className="text-[9px] text-zinc-400 font-mono">Google Fonts</span>
                </span>

                {/* Text Content */}
                <textarea
                  rows={2}
                  value={layer.text.text}
                  onChange={(e) =>
                    onUpdateLayer(layer.id, { text: { ...layer.text!, text: e.target.value } })
                  }
                  placeholder="Escribe el texto aquí..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 font-sans text-zinc-100 text-xs resize-none outline-none focus:border-blue-500"
                />

                {/* Google Fonts Family Selector */}
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="font-mono uppercase font-bold">Fuente:</span>
                    <button
                      type="button"
                      onClick={() => setIsFontPickerOpen(!isFontPickerOpen)}
                      className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      {isFontPickerOpen ? 'Cerrar' : 'Cambiar Fuente'}
                    </button>
                  </div>

                  {/* Active Font Display Button */}
                  <button
                    type="button"
                    onClick={() => setIsFontPickerOpen(!isFontPickerOpen)}
                    style={{ fontFamily: layer.text.fontFamily || 'sans-serif' }}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded px-2.5 py-1.5 text-left text-zinc-100 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="truncate text-sm font-semibold">
                      {layer.text.fontFamily || 'Inter'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded ml-2 shrink-0">
                      Google Font
                    </span>
                  </button>

                  {/* Google Fonts Flyout Picker */}
                  {isFontPickerOpen && (
                    <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl space-y-2 z-40 mt-1 animate-in fade-in duration-150">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2" />
                        <input
                          type="text"
                          value={fontSearch}
                          onChange={(e) => setFontSearch(e.target.value)}
                          placeholder="Buscar fuentes Google..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded pl-7 pr-2 py-1 text-xs text-zinc-200 outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Category Strip */}
                      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 text-[10px]">
                        {(['all', 'sans-serif', 'serif', 'display', 'monospace'] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFontCategory(cat)}
                            className={`px-2 py-0.5 rounded font-mono font-semibold capitalize whitespace-nowrap cursor-pointer ${
                              fontCategory === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {cat === 'all' ? 'Todas' : cat}
                          </button>
                        ))}
                      </div>

                      {/* Font List */}
                      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 divide-y divide-zinc-900">
                        {GOOGLE_FONTS_CATALOG.filter((f) => {
                          const matchesCat = fontCategory === 'all' || f.category === fontCategory;
                          const matchesQuery =
                            !fontSearch ||
                            f.family.toLowerCase().includes(fontSearch.toLowerCase()) ||
                            f.label.toLowerCase().includes(fontSearch.toLowerCase());
                          return matchesCat && matchesQuery;
                        }).map((f) => {
                          const isSelected = (layer.text?.fontFamily || '').toLowerCase() === f.family.toLowerCase();
                          return (
                            <button
                              key={f.family}
                              type="button"
                              onClick={() => {
                                loadGoogleFont(f.family);
                                onUpdateLayer(layer.id, {
                                  text: { ...layer.text!, fontFamily: f.family },
                                });
                                setIsFontPickerOpen(false);
                              }}
                              className={`w-full p-1.5 text-left rounded hover:bg-zinc-900 transition-colors flex items-center justify-between cursor-pointer ${
                                isSelected ? 'bg-blue-950/40 text-blue-300 font-bold' : 'text-zinc-300'
                              }`}
                            >
                              <span style={{ fontFamily: f.family }} className="text-sm truncate">
                                {f.label}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase ml-2 shrink-0">
                                {f.category}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Font Weight Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                    Grosor (Peso):
                  </label>
                  <select
                    value={String(layer.text.fontWeight || '400')}
                    onChange={(e) =>
                      onUpdateLayer(layer.id, { text: { ...layer.text!, fontWeight: e.target.value } })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 font-sans text-zinc-200 text-xs outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">SemiBold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">ExtraBold (800)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>

                {/* Horizontal Alignment & Vertical Alignment */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-850">
                  {/* Horizontal Alignment */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 block font-bold">
                      Alineación H:
                    </span>
                    <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded border border-zinc-800">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateLayer(layer.id, {
                            text: { ...layer.text!, textAlign: 'left', textAnchor: 'start' },
                          })
                        }
                        title="Alinear a la Izquierda"
                        className={`flex-1 py-1 rounded flex items-center justify-center transition-colors cursor-pointer ${
                          layer.text.textAlign === 'left'
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateLayer(layer.id, {
                            text: { ...layer.text!, textAlign: 'center', textAnchor: 'middle' },
                          })
                        }
                        title="Centrar"
                        className={`flex-1 py-1 rounded flex items-center justify-center transition-colors cursor-pointer ${
                          layer.text.textAlign === 'center' || !layer.text.textAlign
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateLayer(layer.id, {
                            text: { ...layer.text!, textAlign: 'right', textAnchor: 'end' },
                          })
                        }
                        title="Alinear a la Derecha"
                        className={`flex-1 py-1 rounded flex items-center justify-center transition-colors cursor-pointer ${
                          layer.text.textAlign === 'right'
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Vertical Alignment */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 block font-bold">
                      Alineación V:
                    </span>
                    <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded border border-zinc-800">
                      {(['top', 'middle', 'bottom'] as const).map((va) => {
                        const isSelected = (layer.text?.verticalAlign || 'middle') === va;
                        return (
                          <button
                            key={va}
                            type="button"
                            onClick={() =>
                              onUpdateLayer(layer.id, {
                                text: { ...layer.text!, verticalAlign: va },
                              })
                            }
                            className={`flex-1 py-1 rounded text-[10px] font-mono capitalize transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {va === 'top' ? 'Arr' : va === 'middle' ? 'Med' : 'Abj'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 9-Point Text Anchor Selector Grid */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-850">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="font-bold flex items-center gap-1">
                      <Crosshair className="w-3 h-3 text-amber-400" />
                      Anclaje de Origen (9 Puntos):
                    </span>
                    <span className="text-zinc-500 uppercase">{layer.text.anchorOrigin || 'center'}</span>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
                      {[
                        { id: 'top-left', label: '↖' },
                        { id: 'top-center', label: '↑' },
                        { id: 'top-right', label: '↗' },
                        { id: 'middle-left', label: '←' },
                        { id: 'center', label: '•' },
                        { id: 'middle-right', label: '→' },
                        { id: 'bottom-left', label: '↙' },
                        { id: 'bottom-center', label: '↓' },
                        { id: 'bottom-right', label: '↘' },
                      ].map((item) => {
                        const activeAnchor = layer.text?.anchorOrigin || 'center';
                        const isSelected = activeAnchor === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onUpdateLayer(layer.id, {
                                text: { ...layer.text!, anchorOrigin: item.id as any },
                              });
                            }}
                            title={`Anclar a ${item.id}`}
                            className={`w-7 h-7 rounded text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/50'
                                : 'bg-zinc-850 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Dimensions (Font Size & Letter Spacing) */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-850">
                  <ScrubbableInput
                    label="Tamaño"
                    value={currentFontSize}
                    min={6}
                    max={200}
                    unit="px"
                    onChange={(fs) =>
                      updateAnimProp(layer.text!.fontSize, fs, (tfs) =>
                        onUpdateLayer(layer.id, { text: { ...layer.text!, fontSize: tfs } })
                      )
                    }
                  />
                  <ScrubbableInput
                    label="Espaciado"
                    value={currentLetterSpacing}
                    min={-10}
                    max={50}
                    unit="px"
                    onChange={(ls) =>
                      updateAnimProp(layer.text!.letterSpacing, ls, (tls) =>
                        onUpdateLayer(layer.id, { text: { ...layer.text!, letterSpacing: tls } })
                      )
                    }
                  />
                </div>
              </div>
            )}

            {layer.image && (
              <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3 text-emerald-400" />
                    Herramientas de Imagen (GWD)
                  </span>
                  {layer.image.naturalWidth && layer.image.naturalHeight && (
                    <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                      {layer.image.naturalWidth}×{layer.image.naturalHeight}px
                    </span>
                  )}
                </div>

                {/* 1. Thumbnail, Source, and Actions */}
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-center gap-2.5">
                    {layer.image.src ? (
                      <div className="relative w-12 h-12 rounded border border-zinc-800 bg-zinc-950 overflow-hidden shrink-0 group/img">
                        <img
                          src={layer.image.src}
                          alt={layer.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-zinc-950 rounded border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-zinc-200 truncate" title={layer.image.fileName || 'Imagen'}>
                          {layer.image.fileName || 'Imagen Vectorial'}
                        </span>
                        <span className="text-[8px] font-mono uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-1 py-0.5 rounded shrink-0">
                          {layer.image.fileName?.split('.').pop() || 'IMG'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <button
                          type="button"
                          onClick={() => imageReplaceInputRef.current?.click()}
                          title="Subir archivo local (PNG, JPG, SVG, WebP)"
                          className="flex-1 px-1.5 py-1 text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded border border-zinc-700 transition-colors cursor-pointer text-center truncate"
                        >
                          Subir Archivo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUrlModalOpen(!isUrlModalOpen);
                            setIsStockPickerOpen(false);
                          }}
                          title="Pegar URL externa de imagen"
                          className={`p-1 rounded border transition-colors cursor-pointer ${
                            isUrlModalOpen
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750 hover:text-white'
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsStockPickerOpen(!isStockPickerOpen);
                            setIsUrlModalOpen(false);
                          }}
                          title="Explorar fotos de stock Unsplash"
                          className={`p-1 rounded border transition-colors cursor-pointer ${
                            isStockPickerOpen
                              ? 'bg-amber-600 text-white border-amber-500'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750 hover:text-white'
                          }`}
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <input
                    ref={imageReplaceInputRef}
                    type="file"
                    accept="image/*,.svg,.png,.jpg,.jpeg,.webp,.gif"
                    onChange={handleImageReplace}
                    className="hidden"
                  />

                  {/* External URL Input Drawer */}
                  {isUrlModalOpen && (
                    <div className="pt-2 border-t border-zinc-800 space-y-1.5 animate-in fade-in duration-150">
                      <span className="text-[10px] text-zinc-400 block font-medium">URL Directa de Imagen:</span>
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          placeholder="https://ejemplo.com/foto.jpg"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customUrlInput.trim()) {
                              handleImageSrcUpdate(customUrlInput.trim(), 'web-image.jpg', 'image/jpeg');
                              setIsUrlModalOpen(false);
                            }
                          }}
                          className="flex-1 bg-zinc-950 border border-zinc-700 text-zinc-100 px-2 py-1 rounded text-xs outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customUrlInput.trim()) {
                              handleImageSrcUpdate(customUrlInput.trim(), 'web-image.jpg', 'image/jpeg');
                              setIsUrlModalOpen(false);
                            }
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs transition-colors cursor-pointer"
                        >
                          Cargar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stock Photo Presets Drawer */}
                  {isStockPickerOpen && (
                    <div className="pt-2 border-t border-zinc-800 space-y-1.5 animate-in fade-in duration-150">
                      <span className="text-[10px] text-zinc-400 block font-medium">Fotos de Stock para Anuncios:</span>
                      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                        {STOCK_IMAGE_PRESETS.map((stock) => (
                          <button
                            key={stock.name}
                            type="button"
                            onClick={() => {
                              handleImageSrcUpdate(stock.url, `${stock.name}.jpg`, 'image/jpeg');
                              setIsStockPickerOpen(false);
                            }}
                            className="flex items-center gap-1.5 p-1 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 text-left transition-colors cursor-pointer group/stock"
                          >
                            <img
                              src={stock.url}
                              alt={stock.name}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 object-cover rounded bg-zinc-900 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-[9px] font-semibold text-zinc-300 group-hover/stock:text-amber-300 truncate">
                                {stock.name}
                              </div>
                              <div className="text-[8px] text-zinc-500 truncate">{stock.category}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Dimensions, Proportions & Quick Scale (Google Web Designer) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Scaling className="w-3 h-3 text-indigo-400" />
                      Dimensiones
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLayer(layer.id, {
                          image: {
                            ...layer.image!,
                            aspectLocked: layer.image!.aspectLocked === false ? true : false,
                          },
                        })
                      }
                      title={layer.image.aspectLocked !== false ? 'Bloquear proporción activo' : 'Proporción libre'}
                      className="text-[10px] flex items-center gap-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {layer.image.aspectLocked !== false ? (
                        <>
                          <Lock className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-400 font-mono">1:1</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" />
                          <span className="font-mono">Libre</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <ScrubbableInput
                      label="W"
                      value={currentImageWidth}
                      min={10}
                      unit="px"
                      onChange={(w) => {
                        const isLocked = layer.image?.aspectLocked !== false;
                        if (isLocked && currentImageWidth > 0) {
                          const ratio = currentImageHeight / currentImageWidth;
                          const newH = Math.round(w * ratio);
                          updateAnimProp(layer.image!.width, w, (iw) =>
                            updateAnimProp(layer.image!.height, newH, (ih) =>
                              onUpdateLayer(layer.id, {
                                image: { ...layer.image!, width: iw, height: ih },
                              })
                            )
                          );
                        } else {
                          updateAnimProp(layer.image!.width, w, (iw) =>
                            onUpdateLayer(layer.id, { image: { ...layer.image!, width: iw } })
                          );
                        }
                      }}
                    />
                    <ScrubbableInput
                      label="H"
                      value={currentImageHeight}
                      min={10}
                      unit="px"
                      onChange={(h) => {
                        const isLocked = layer.image?.aspectLocked !== false;
                        if (isLocked && currentImageHeight > 0) {
                          const ratio = currentImageWidth / currentImageHeight;
                          const newW = Math.round(h * ratio);
                          updateAnimProp(layer.image!.height, h, (ih) =>
                            updateAnimProp(layer.image!.width, newW, (iw) =>
                              onUpdateLayer(layer.id, {
                                image: { ...layer.image!, width: iw, height: ih },
                              })
                            )
                          );
                        } else {
                          updateAnimProp(layer.image!.height, h, (ih) =>
                            onUpdateLayer(layer.id, { image: { ...layer.image!, height: ih } })
                          );
                        }
                      }}
                    />
                  </div>

                  {/* 1:1 Reset & Fit to Canvas buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const nw = layer.image?.naturalWidth || 300;
                        const nh = layer.image?.naturalHeight || 200;
                        updateAnimProp(layer.image!.width, nw, (iw) =>
                          updateAnimProp(layer.image!.height, nh, (ih) =>
                            onUpdateLayer(layer.id, {
                              image: { ...layer.image!, width: iw, height: ih },
                            })
                          )
                        );
                      }}
                      title="Restablecer a resolución nativa exacta de la imagen"
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer text-center truncate flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-zinc-400" />
                      <span>1:1 Original</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateAnimProp(layer.image!.width, composition.width, (iw) =>
                          updateAnimProp(layer.image!.height, composition.height, (ih) =>
                            onUpdateLayer(layer.id, {
                              image: { ...layer.image!, width: iw, height: ih },
                            })
                          )
                        );
                      }}
                      title="Ajustar dimensiones para coincidir con el lienzo completo"
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer text-center truncate flex items-center justify-center gap-1"
                    >
                      <Maximize className="w-2.5 h-2.5 text-zinc-400" />
                      <span>Ajustar Lienzo</span>
                    </button>
                  </div>
                </div>

                {/* 3. Sizing Mode / Modo de Ajuste (Google Web Designer Standard) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Modo de Ajuste (Sizing Mode):</span>
                    <span className="text-[9px] text-blue-400 font-mono lowercase">
                      {layer.image.scalingMode || 'contain'}
                    </span>
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'contain', label: 'Contain', desc: 'Ajustar dentro con proporción' },
                      { id: 'cover', label: 'Cover', desc: 'Rellenar área recortando excedente' },
                      { id: 'fill', label: 'Fill', desc: 'Estirar libremente a W×H' },
                      { id: 'none', label: 'None', desc: 'Escala 1:1 centrada' },
                    ].map((mode) => {
                      const isActive = (layer.image?.scalingMode || 'contain') === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() =>
                            onUpdateLayer(layer.id, {
                              image: { ...layer.image!, scalingMode: mode.id as any },
                            })
                          }
                          title={mode.desc}
                          className={`py-1 text-[10px] font-semibold rounded border transition-all cursor-pointer text-center ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-sm'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Quick Orientation / Flip & 90° Rotations */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                    Orientación &amp; Volteo:
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLayer(layer.id, {
                          image: {
                            ...layer.image!,
                            flipHorizontal: !layer.image!.flipHorizontal,
                          },
                        })
                      }
                      title="Voltear Horizontalmente"
                      className={`py-1 flex items-center justify-center gap-1 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                        layer.image.flipHorizontal
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <FlipHorizontal className="w-3 h-3" />
                      <span>Flip H</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLayer(layer.id, {
                          image: {
                            ...layer.image!,
                            flipVertical: !layer.image!.flipVertical,
                          },
                        })
                      }
                      title="Voltear Verticalmente"
                      className={`py-1 flex items-center justify-center gap-1 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                        layer.image.flipVertical
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <FlipVertical className="w-3 h-3" />
                      <span>Flip V</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newR = (currentRot - 90 + 360) % 360;
                        updateAnimProp(layer.transform.rotation, newR, (r) =>
                          onUpdateLayer(layer.id, { transform: { ...layer.transform, rotation: r } })
                        );
                      }}
                      title="Girar 90° a la izquierda"
                      className="py-1 flex items-center justify-center gap-1 text-[10px] font-semibold rounded border bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>-90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newR = (currentRot + 90) % 360;
                        updateAnimProp(layer.transform.rotation, newR, (r) =>
                          onUpdateLayer(layer.id, { transform: { ...layer.transform, rotation: r } })
                        );
                      }}
                      title="Girar 90° a la derecha"
                      className="py-1 flex items-center justify-center gap-1 text-[10px] font-semibold rounded border bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>+90°</span>
                    </button>
                  </div>
                </div>

                {/* 5. Corner Radius & Border (Google Web Designer Appearance) */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Square className="w-3 h-3 text-sky-400" />
                    Bordes y Esquinas Redondeadas
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <ScrubbableInput
                      label="Radio"
                      value={currentImageCornerRadius}
                      min={0}
                      max={200}
                      unit="px"
                      onChange={(r) => {
                        if (layer.image!.cornerRadius) {
                          updateAnimProp(layer.image!.cornerRadius, r, (cr) =>
                            onUpdateLayer(layer.id, { image: { ...layer.image!, cornerRadius: cr } })
                          );
                        } else {
                          onUpdateLayer(layer.id, {
                            image: {
                              ...layer.image!,
                              cornerRadius: { value: r, isKeyframed: false, keyframes: [] },
                            },
                          });
                        }
                      }}
                    />
                    <ScrubbableInput
                      label="Borde"
                      value={layer.image.borderWidth || 0}
                      min={0}
                      max={30}
                      unit="px"
                      onChange={(bw) =>
                        onUpdateLayer(layer.id, {
                          image: { ...layer.image!, borderWidth: bw },
                        })
                      }
                    />
                  </div>

                  {layer.image.borderWidth && layer.image.borderWidth > 0 ? (
                    <div className="flex items-center gap-2 p-1.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]">
                      <span className="text-zinc-400 shrink-0">Color Borde:</span>
                      <input
                        type="color"
                        value={layer.image.borderColor || '#3b82f6'}
                        onChange={(e) =>
                          onUpdateLayer(layer.id, {
                            image: { ...layer.image!, borderColor: e.target.value },
                          })
                        }
                        className="w-5 h-5 rounded border border-zinc-700 cursor-pointer bg-transparent"
                      />
                      <div className="flex-1 flex gap-1">
                        {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() =>
                              onUpdateLayer(layer.id, {
                                image: { ...layer.image!, borderStyle: style },
                              })
                            }
                            className={`flex-1 py-0.5 rounded text-[9px] capitalize cursor-pointer border ${
                              (layer.image?.borderStyle || 'solid') === style
                                ? 'bg-zinc-800 text-white border-zinc-600 font-bold'
                                : 'text-zinc-400 border-transparent hover:text-zinc-200'
                            }`}
                          >
                            {style === 'solid' ? 'Sólido' : style === 'dashed' ? 'Guiones' : 'Puntos'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* 6. Google Web Designer CSS Filters & Image Adjustments */}
                <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                      Filtros de Color (GWD FX)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLayer(layer.id, {
                          image: {
                            ...layer.image!,
                            filters: {
                              brightness: 100,
                              contrast: 100,
                              saturate: 100,
                              blur: 0,
                              hueRotate: 0,
                              grayscale: 0,
                              sepia: 0,
                              invert: 0,
                            },
                          },
                        })
                      }
                      title="Restablecer filtros a valores originales"
                      className="text-[9px] font-mono text-zinc-400 hover:text-amber-400 cursor-pointer"
                    >
                      Reset Filtros
                    </button>
                  </div>

                  {/* 1-Click Filter Presets */}
                  <div className="grid grid-cols-4 gap-1">
                    {IMAGE_FILTER_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          onUpdateLayer(layer.id, {
                            image: { ...layer.image!, filters: { ...preset.filters } },
                          })
                        }
                        className="py-1 px-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 text-[9px] font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer text-center truncate"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* Detailed Sliders */}
                  <div className="space-y-2 pt-1">
                    {/* Brillo */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>Brillo (Brightness):</span>
                        <span className="font-mono text-amber-400">
                          {layer.image.filters?.brightness ?? 100}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={layer.image.filters?.brightness ?? 100}
                        onChange={(e) =>
                          onUpdateLayer(layer.id, {
                            image: {
                              ...layer.image!,
                              filters: {
                                ...layer.image!.filters,
                                brightness: parseInt(e.target.value, 10),
                              },
                            },
                          })
                        }
                        className="w-full accent-amber-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Contraste */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>Contraste (Contrast):</span>
                        <span className="font-mono text-amber-400">
                          {layer.image.filters?.contrast ?? 100}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={layer.image.filters?.contrast ?? 100}
                        onChange={(e) =>
                          onUpdateLayer(layer.id, {
                            image: {
                              ...layer.image!,
                              filters: {
                                ...layer.image!.filters,
                                contrast: parseInt(e.target.value, 10),
                              },
                            },
                          })
                        }
                        className="w-full accent-amber-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Saturación */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>Saturación (Saturate):</span>
                        <span className="font-mono text-amber-400">
                          {layer.image.filters?.saturate ?? 100}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={layer.image.filters?.saturate ?? 100}
                        onChange={(e) =>
                          onUpdateLayer(layer.id, {
                            image: {
                              ...layer.image!,
                              filters: {
                                ...layer.image!.filters,
                                saturate: parseInt(e.target.value, 10),
                              },
                            },
                          })
                        }
                        className="w-full accent-amber-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Desenfoque */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>Desenfoque (Blur):</span>
                        <span className="font-mono text-amber-400">
                          {layer.image.filters?.blur ?? 0}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={layer.image.filters?.blur ?? 0}
                        onChange={(e) =>
                          onUpdateLayer(layer.id, {
                            image: {
                              ...layer.image!,
                              filters: {
                                ...layer.image!.filters,
                                blur: parseInt(e.target.value, 10),
                              },
                            },
                          })
                        }
                        className="w-full accent-amber-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Tono / Hue Rotate */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>Rotación de Tono (Hue):</span>
                        <span className="font-mono text-amber-400">
                          {layer.image.filters?.hueRotate ?? 0}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={layer.image.filters?.hueRotate ?? 0}
                        onChange={(e) =>
                          onUpdateLayer(layer.id, {
                            image: {
                              ...layer.image!,
                              filters: {
                                ...layer.image!.filters,
                                hueRotate: parseInt(e.target.value, 10),
                              },
                            },
                          })
                        }
                        className="w-full accent-amber-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Escala de grises */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>Escala de Grises:</span>
                        <span className="font-mono text-amber-400">
                          {layer.image.filters?.grayscale ?? 0}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={layer.image.filters?.grayscale ?? 0}
                        onChange={(e) =>
                          onUpdateLayer(layer.id, {
                            image: {
                              ...layer.image!,
                              filters: {
                                ...layer.image!.filters,
                                grayscale: parseInt(e.target.value, 10),
                              },
                            },
                          })
                        }
                        className="w-full accent-amber-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. Drop Shadow / Sombra Proyectada */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Sombra Proyectada (Drop Shadow):</span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLayer(layer.id, {
                          image: {
                            ...layer.image!,
                            shadowBlur: 16,
                            shadowOffsetX: 0,
                            shadowOffsetY: 8,
                            shadowColor: 'rgba(0,0,0,0.6)',
                          },
                        })
                      }
                      className="text-[9px] text-blue-400 hover:underline cursor-pointer"
                    >
                      Añadir Sombra
                    </button>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <ScrubbableInput
                      label="Blur"
                      value={layer.image.shadowBlur || 0}
                      min={0}
                      max={50}
                      unit="px"
                      onChange={(sb) =>
                        onUpdateLayer(layer.id, {
                          image: { ...layer.image!, shadowBlur: sb },
                        })
                      }
                    />
                    <ScrubbableInput
                      label="Offset Y"
                      value={layer.image.shadowOffsetY || 0}
                      min={-50}
                      max={50}
                      unit="px"
                      onChange={(sy) =>
                        onUpdateLayer(layer.id, {
                          image: { ...layer.image!, shadowOffsetY: sy },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. MOTION TAB */}
        {activeTab === 'motion' && (
          <div className="space-y-3">
            {/* Motion Presets Library Trigger */}
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Biblioteca GSAP Motion
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                  {MOTION_PRESETS.length} presets
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Aplica animaciones preconfiguradas con keyframes profesionales directamente en la línea de tiempo.
              </p>
              {onOpenMotionPresets && (
                <button
                  onClick={onOpenMotionPresets}
                  className="w-full py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Explorar Biblioteca Completa
                </button>
              )}
            </div>

            {/* Elasticidad & Dinámica Spring (Física Elástica) */}
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  Elasticidad &amp; Rebote (Spring)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateLayer(layer.id, {
                      springDynamics: {
                        enabled: !layer.springDynamics?.enabled,
                        tension: layer.springDynamics?.tension || 160,
                        damping: layer.springDynamics?.damping || 16,
                        mass: layer.springDynamics?.mass || 1,
                      },
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                    layer.springDynamics?.enabled
                      ? 'bg-sky-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {layer.springDynamics?.enabled ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {/* Quick Elastic Easings */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const updated = JSON.parse(JSON.stringify(layer)) as VectorLayer;
                    const applyEasing = (prop: any) => {
                      if (prop?.keyframes) {
                        prop.keyframes = prop.keyframes.map((kf: any) => ({ ...kf, easing: 'elastic' }));
                      }
                    };
                    applyEasing(updated.transform.position);
                    applyEasing(updated.transform.scale);
                    applyEasing(updated.transform.rotation);
                    onUpdateLayer(layer.id, updated);
                  }}
                  className="px-2 py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 text-[10px] font-semibold text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Pop Elástico</span>
                  <span className="text-[9px] font-mono text-sky-400">elastic</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const updated = JSON.parse(JSON.stringify(layer)) as VectorLayer;
                    const applyEasing = (prop: any) => {
                      if (prop?.keyframes) {
                        prop.keyframes = prop.keyframes.map((kf: any) => ({ ...kf, easing: 'bounce' }));
                      }
                    };
                    applyEasing(updated.transform.position);
                    applyEasing(updated.transform.scale);
                    onUpdateLayer(layer.id, updated);
                  }}
                  className="px-2 py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 text-[10px] font-semibold text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Rebote Gelatina</span>
                  <span className="text-[9px] font-mono text-emerald-400">bounce</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const updated = JSON.parse(JSON.stringify(layer)) as VectorLayer;
                    const applyEasing = (prop: any) => {
                      if (prop?.keyframes) {
                        prop.keyframes = prop.keyframes.map((kf: any) => ({ ...kf, easing: 'back' }));
                      }
                    };
                    applyEasing(updated.transform.position);
                    applyEasing(updated.transform.scale);
                    onUpdateLayer(layer.id, updated);
                  }}
                  className="px-2 py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 text-[10px] font-semibold text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Anticipación</span>
                  <span className="text-[9px] font-mono text-amber-400">back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const updated = JSON.parse(JSON.stringify(layer)) as VectorLayer;
                    const applyEasing = (prop: any) => {
                      if (prop?.keyframes) {
                        prop.keyframes = prop.keyframes.map((kf: any) => ({ ...kf, easing: 'power2Out' }));
                      }
                    };
                    applyEasing(updated.transform.position);
                    applyEasing(updated.transform.scale);
                    onUpdateLayer(layer.id, updated);
                  }}
                  className="px-2 py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 text-[10px] font-semibold text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Settle Suave</span>
                  <span className="text-[9px] font-mono text-indigo-400">smooth</span>
                </button>
              </div>

              {layer.springDynamics?.enabled && (
                <div className="space-y-2 pt-2 border-t border-zinc-800 text-[10px]">
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-0.5">
                      <span>Rigidez / Tensión:</span>
                      <span className="font-mono text-sky-400">{layer.springDynamics?.tension || 160}</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={300}
                      value={layer.springDynamics?.tension || 160}
                      onChange={(e) =>
                        onUpdateLayer(layer.id, {
                          springDynamics: {
                            ...layer.springDynamics!,
                            tension: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-sky-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-0.5">
                      <span>Amortiguación / Damping:</span>
                      <span className="font-mono text-sky-400">{layer.springDynamics?.damping || 16}</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={40}
                      value={layer.springDynamics?.damping || 16}
                      onChange={(e) =>
                        onUpdateLayer(layer.id, {
                          springDynamics: {
                            ...layer.springDynamics!,
                            damping: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-sky-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Direct Quick Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                  Aplicar Preset Rápido:
                </span>
                <span className="text-[9px] text-zinc-500">en {currentTime.toFixed(2)}s</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {MOTION_PRESETS.slice(0, 8).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      const updated = preset.apply(layer, currentTime, preset.duration);
                      updated.expandedInTimeline = true;
                      onUpdateLayer(layer.id, updated);
                    }}
                    title={`Aplicar ${preset.name} (${preset.duration}s)\n${preset.description}`}
                    className="p-2 bg-zinc-900 hover:bg-zinc-850 hover:border-amber-500/40 border border-zinc-800 rounded-lg text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{preset.icon}</span>
                      <span className="font-semibold text-zinc-200 group-hover:text-amber-300 text-[11px] truncate">
                        {preset.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[9px] text-zinc-500">
                      <span className="capitalize">{preset.category}</span>
                      <span className="font-mono text-amber-400/80">{preset.duration}s</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Keyframe Summary & Clear */}
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">
                Estado de Animación en Capa:
              </span>
              <div className="space-y-1 text-[11px] text-zinc-300">
                {[
                  { label: 'Posición', prop: layer.transform.position },
                  { label: 'Escala', prop: layer.transform.scale },
                  { label: 'Rotación', prop: layer.transform.rotation },
                  { label: 'Opacidad', prop: layer.transform.opacity },
                ].map((item) => {
                  const count = item.prop.keyframes?.length || 0;
                  return (
                    <div key={item.label} className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-amber-400' : 'bg-zinc-700'}`} />
                        {item.label}
                      </span>
                      <span className={count > 0 ? 'text-amber-400 font-mono font-bold' : 'text-zinc-400 font-mono'}>
                        {count > 0 ? `${count} keyframes` : 'estático'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1.5 border-t border-zinc-800 flex gap-1.5">
                <button
                  onClick={() => {
                    const cleaned = clearLayerKeyframes(layer);
                    onUpdateLayer(layer.id, cleaned);
                  }}
                  className="w-full py-1 bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/50 rounded text-[10px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpiar Animación (Quitar Keyframes)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. STYLE TAB */}
        {activeTab === 'style' && (
          <div className="space-y-3">
            {/* Fill Color */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-3 h-3 text-blue-400" />
                Color de Relleno
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentFill.startsWith('#') ? currentFill : '#3b82f6'}
                  onChange={(e) =>
                    updateAnimProp(layer.style.fill, e.target.value, (f) =>
                      onUpdateLayer(layer.id, { style: { ...layer.style, fill: f } })
                    )
                  }
                  className="w-7 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentFill}
                  onChange={(e) =>
                    updateAnimProp(layer.style.fill, e.target.value, (f) =>
                      onUpdateLayer(layer.id, { style: { ...layer.style, fill: f } })
                    )
                  }
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 font-mono text-zinc-100 text-xs"
                />
              </div>
            </div>

            {/* Stroke Color & Width */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Paintbrush className="w-3 h-3 text-indigo-400" />
                Trazo / Borde
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentStroke.startsWith('#') ? currentStroke : '#60a5fa'}
                  onChange={(e) =>
                    updateAnimProp(layer.style.stroke, e.target.value, (s) =>
                      onUpdateLayer(layer.id, { style: { ...layer.style, stroke: s } })
                    )
                  }
                  className="w-7 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentStroke}
                  onChange={(e) =>
                    updateAnimProp(layer.style.stroke, e.target.value, (s) =>
                      onUpdateLayer(layer.id, { style: { ...layer.style, stroke: s } })
                    )
                  }
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 font-mono text-zinc-100 text-xs"
                />
              </div>
              <div className="pt-1">
                <ScrubbableInput
                  label="Grosor"
                  value={currentStrokeWidth}
                  min={0}
                  max={50}
                  unit="px"
                  onChange={(sw) =>
                    updateAnimProp(layer.style.strokeWidth, sw, (w) =>
                      onUpdateLayer(layer.id, { style: { ...layer.style, strokeWidth: w } })
                    )
                  }
                />
              </div>
            </div>

            {/* Trim Path Animation */}
            <div className="space-y-1 pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                Recorte de Trazo (Trim Path)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <ScrubbableInput
                  label="Inicio"
                  value={currentTrimStart}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(ts) =>
                    updateAnimProp(layer.style.trimStart, ts, (sts) =>
                      onUpdateLayer(layer.id, { style: { ...layer.style, trimStart: sts } })
                    )
                  }
                />
                <ScrubbableInput
                  label="Fin"
                  value={currentTrimEnd}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(te) =>
                    updateAnimProp(layer.style.trimEnd, te, (ste) =>
                      onUpdateLayer(layer.id, { style: { ...layer.style, trimEnd: ste } })
                    )
                  }
                />
              </div>
            </div>

            {/* Glow / Shadow Blur */}
            <div className="space-y-1 pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                Resplandor / Sombra (Glow)
              </span>
              <ScrubbableInput
                label="Blur"
                value={currentShadowBlur}
                min={0}
                max={100}
                unit="px"
                onChange={(sb) =>
                  updateAnimProp(layer.style.shadowBlur, sb, (ssb) =>
                    onUpdateLayer(layer.id, { style: { ...layer.style, shadowBlur: ssb } })
                  )
                }
              />
            </div>
          </div>
        )}

        {/* 4. FX / MODIFIERS TAB */}
        {activeTab === 'fx' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => addModifier('repeater')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-[11px] font-medium text-zinc-200 cursor-pointer"
              >
                <Repeat className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Repeater</span>
              </button>
              <button
                onClick={() => addModifier('wiggle')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-[11px] font-medium text-zinc-200 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Wiggle</span>
              </button>
            </div>

            {(layer.modifiers || []).length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                No hay modificadores activos. Agrega un Repeater o Wiggle para crear efectos dinámicos.
              </div>
            ) : (
              (layer.modifiers || []).map((mod) => (
                <div
                  key={mod.id}
                  className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 capitalize text-[11px]">
                      {mod.type} Modificador
                    </span>
                    <button
                      onClick={() => removeModifier(mod.id)}
                      className="p-0.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {mod.type === 'repeater' && mod.repeater && (
                    <div className="space-y-2">
                      <ScrubbableInput
                        label="Copias"
                        value={mod.repeater.copies}
                        min={1}
                        max={30}
                        onChange={(copies) => {
                          onUpdateLayer(layer.id, {
                            modifiers: (layer.modifiers || []).map((m) =>
                              m.id === mod.id
                                ? { ...m, repeater: { ...m.repeater!, copies } }
                                : m
                            ),
                          });
                        }}
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                          Desplazamiento X / Y
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <ScrubbableInput
                            label="X"
                            value={mod.repeater.offset.x}
                            step={1}
                            unit="px"
                            onChange={(x) => {
                              onUpdateLayer(layer.id, {
                                modifiers: (layer.modifiers || []).map((m) =>
                                  m.id === mod.id
                                    ? { ...m, repeater: { ...m.repeater!, offset: { ...m.repeater!.offset, x } } }
                                    : m
                                ),
                              });
                            }}
                          />
                          <ScrubbableInput
                            label="Y"
                            value={mod.repeater.offset.y}
                            step={1}
                            unit="px"
                            onChange={(y) => {
                              onUpdateLayer(layer.id, {
                                modifiers: (layer.modifiers || []).map((m) =>
                                  m.id === mod.id
                                    ? { ...m, repeater: { ...m.repeater!, offset: { ...m.repeater!.offset, y } } }
                                    : m
                                ),
                              });
                            }}
                          />
                        </div>
                      </div>
                      <ScrubbableInput
                        label="Rotación / Copia"
                        value={mod.repeater.rotationOffset}
                        min={-360}
                        max={360}
                        unit="°"
                        onChange={(rotationOffset) => {
                          onUpdateLayer(layer.id, {
                            modifiers: (layer.modifiers || []).map((m) =>
                              m.id === mod.id
                                ? { ...m, repeater: { ...m.repeater!, rotationOffset } }
                                : m
                            ),
                          });
                        }}
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                          Escala / Copia (%)
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <ScrubbableInput
                            label="X"
                            value={mod.repeater.scaleOffset.x}
                            step={1}
                            unit="%"
                            onChange={(x) => {
                              onUpdateLayer(layer.id, {
                                modifiers: (layer.modifiers || []).map((m) =>
                                  m.id === mod.id
                                    ? { ...m, repeater: { ...m.repeater!, scaleOffset: { ...m.repeater!.scaleOffset, x } } }
                                    : m
                                ),
                              });
                            }}
                          />
                          <ScrubbableInput
                            label="Y"
                            value={mod.repeater.scaleOffset.y}
                            step={1}
                            unit="%"
                            onChange={(y) => {
                              onUpdateLayer(layer.id, {
                                modifiers: (layer.modifiers || []).map((m) =>
                                  m.id === mod.id
                                    ? { ...m, repeater: { ...m.repeater!, scaleOffset: { ...m.repeater!.scaleOffset, y } } }
                                    : m
                                ),
                              });
                            }}
                          />
                        </div>
                      </div>
                      <ScrubbableInput
                        label="Opacidad / Copia"
                        value={mod.repeater.opacityOffset}
                        min={0}
                        max={100}
                        unit="%"
                        onChange={(opacityOffset) => {
                          onUpdateLayer(layer.id, {
                            modifiers: (layer.modifiers || []).map((m) =>
                              m.id === mod.id
                                ? { ...m, repeater: { ...m.repeater!, opacityOffset } }
                                : m
                            ),
                          });
                        }}
                      />
                    </div>
                  )}

                  {mod.type === 'wiggle' && mod.wiggle && (
                    <div className="space-y-2">
                      <ScrubbableInput
                        label="Frecuencia"
                        value={mod.wiggle.frequency}
                        step={0.2}
                        unit="Hz"
                        precision={1}
                        onChange={(frequency) => {
                          onUpdateLayer(layer.id, {
                            modifiers: (layer.modifiers || []).map((m) =>
                              m.id === mod.id
                                ? { ...m, wiggle: { ...m.wiggle!, frequency } }
                                : m
                            ),
                          });
                        }}
                      />
                      <ScrubbableInput
                        label="Amplitud Posición"
                        value={mod.wiggle.positionAmp}
                        step={1}
                        min={0}
                        max={500}
                        unit="px"
                        onChange={(positionAmp) => {
                          onUpdateLayer(layer.id, {
                            modifiers: (layer.modifiers || []).map((m) =>
                              m.id === mod.id
                                ? { ...m, wiggle: { ...m.wiggle!, positionAmp } }
                                : m
                            ),
                          });
                        }}
                      />
                      <ScrubbableInput
                        label="Amplitud Rotación"
                        value={mod.wiggle.rotationAmp}
                        step={1}
                        min={0}
                        max={360}
                        unit="°"
                        onChange={(rotationAmp) => {
                          onUpdateLayer(layer.id, {
                            modifiers: (layer.modifiers || []).map((m) =>
                              m.id === mod.id
                                ? { ...m, wiggle: { ...m.wiggle!, rotationAmp } }
                                : m
                            ),
                          });
                        }}
                      />
                      <ScrubbableInput
                        label="Amplitud Escala"
                        value={mod.wiggle.scaleAmp}
                        step={1}
                        min={0}
                        max={200}
                        unit="%"
                        onChange={(scaleAmp) => {
                          onUpdateLayer(layer.id, {
                            modifiers: (layer.modifiers || []).map((m) =>
                              m.id === mod.id
                                ? { ...m, wiggle: { ...m.wiggle!, scaleAmp } }
                                : m
                            ),
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
