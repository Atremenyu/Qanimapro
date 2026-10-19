import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer,
  Square,
  Circle,
  Star,
  Hexagon,
  Type,
  Hand,
  Crosshair,
  PenTool,
  Image as ImageIcon,
  CircleDot,
  Diamond,
  ChevronRight,
  MousePointerClick,
  Undo2,
  Redo2,
} from 'lucide-react';
import { ToolType, VectorLayer } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onAddLayer: (type: VectorLayer['type'], pos?: { x: number; y: number }, options?: any) => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  snapToGrid?: boolean;
  onToggleSnap?: () => void;
  showSafeAreas?: boolean;
  onToggleSafeAreas?: () => void;
  onionSkin?: boolean;
  onToggleOnionSkin?: () => void;
  autoKeyframe?: boolean;
  onToggleAutoKeyframe?: () => void;
  selectedLayerIds?: string[];
  onOpenMotionPresets?: () => void;
  onAddKeyframe?: (type: 'rotation' | 'scale' | 'opacity' | 'position' | 'all') => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onResetTime?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  viewportZoom?: number;
  onSetViewportZoom?: (z: number) => void;
  onResetViewport?: () => void;
  position?: 'left' | 'right';
  onDismiss?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  onAddLayer,
  autoKeyframe = true,
  onToggleAutoKeyframe,
  selectedLayerIds = [],
  onAddKeyframe,
  position = 'left',
  onDismiss,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const [isShapeFlyoutOpen, setIsShapeFlyoutOpen] = useState(false);
  const [isKeyframeFlyoutOpen, setIsKeyframeFlyoutOpen] = useState(false);
  const [activeShapeType, setActiveShapeType] = useState<'rect' | 'circle' | 'star' | 'polygon'>('rect');
  
  // Swipe / Drag to Dismiss state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const shapeFlyoutRef = useRef<HTMLDivElement>(null);
  const keyframeFlyoutRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasSelection = selectedLayerIds.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shapeFlyoutRef.current && !shapeFlyoutRef.current.contains(e.target as Node)) {
        setIsShapeFlyoutOpen(false);
      }
      if (keyframeFlyoutRef.current && !keyframeFlyoutRef.current.contains(e.target as Node)) {
        setIsKeyframeFlyoutOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const img = new Image();
        img.onload = () => {
          let w = img.naturalWidth || 300;
          let h = img.naturalHeight || 200;
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
          onAddLayer('image', undefined, {
            src: result,
            width: w,
            height: h,
            fileName: file.name,
            mimeType: file.type || 'image/png',
          });
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Active shape icon
  const getShapeIcon = () => {
    switch (activeShapeType) {
      case 'circle':
        return Circle;
      case 'star':
        return Star;
      case 'polygon':
        return Hexagon;
      case 'rect':
      default:
        return Square;
    }
  };

  const ActiveShapeIcon = getShapeIcon();
  const isAnyShapeActive = ['rect', 'circle', 'star', 'polygon'].includes(activeTool);

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
    if (position === 'left') {
      setDragOffset(Math.min(0, Math.max(-60, diff)));
    } else {
      setDragOffset(Math.max(0, Math.min(60, diff)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (startXRef.current === null) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    const elapsed = Date.now() - startTimeRef.current;
    const absOffset = Math.abs(dragOffset);
    // Require deliberate drag distance to prevent accidental dismiss
    if (onDismiss && (absOffset > 38 || (absOffset > 24 && elapsed < 220))) {
      onDismiss();
    }
    setDragOffset(0);
    setIsDragging(false);
    startXRef.current = null;
  };

  return (
    <aside
      style={{
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`w-11 bg-zinc-950 flex flex-col items-center py-2 select-none z-20 shrink-0 relative group/toolbar ${
        position === 'left' ? 'border-r border-zinc-850' : 'border-l border-zinc-850'
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
          title={`Haz clic o arrastra desde esta pestaña hacia ${position === 'left' ? 'la izquierda' : 'la derecha'} para ocultar`}
          className={`absolute top-1/2 -translate-y-1/2 ${
            position === 'left' ? '-right-3' : '-left-3'
          } w-3.5 h-12 z-30 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-zinc-800/90 bg-zinc-900 border border-zinc-700/80 rounded-full transition-all shadow-md group/handle`}
        >
          <div className="w-1 h-6 rounded-full bg-zinc-500 group-hover/handle:bg-blue-400 group-hover/handle:w-1.5 transition-all shadow-sm" />
        </div>
      )}

      {/* Hidden file input for image/asset import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.svg"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* 1. SELECCIÓN Y NAVEGACIÓN */}
      <div className="flex flex-col items-center gap-1 w-full px-1">
        {/* Move / Selection Tool (V) */}
        <button
          onClick={() => onSelectTool('select')}
          title="Herramienta Mover / Selección (V)"
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-all relative group cursor-pointer ${
            activeTool === 'select'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono opacity-50 font-bold leading-none">
            V
          </span>
        </button>

        {/* Direct Selection Tool (A) */}
        <button
          onClick={() => onSelectTool('directSelect')}
          title="Herramienta Selección Directa (A)"
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-all relative group cursor-pointer ${
            activeTool === 'directSelect'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850'
          }`}
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono opacity-50 font-bold leading-none">
            A
          </span>
        </button>

        {/* Pan / Hand Tool (H) */}
        <button
          onClick={() => onSelectTool('hand')}
          title="Herramienta Mano / Desplazar (H o Barra espaciadora)"
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-all relative group cursor-pointer ${
            activeTool === 'hand'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono opacity-50 font-bold leading-none">
            H
          </span>
        </button>
      </div>

      {/* SUBTLE DIVIDER 1 */}
      <div className="w-5 h-[1px] bg-zinc-800/80 my-1.5 shrink-0" />

      {/* 2. CREACIÓN VECTORIAL */}
      <div className="flex flex-col items-center gap-1 w-full px-1">
        {/* Pen Tool (P) */}
        <button
          onClick={() => onSelectTool('pen')}
          title="Herramienta Pluma Vectorial (P)"
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-all relative group cursor-pointer ${
            activeTool === 'pen'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono opacity-50 font-bold leading-none">
            P
          </span>
        </button>

        {/* Shapes Flyout Menu (R / Shape Flyout) */}
        <div className="relative" ref={shapeFlyoutRef}>
          <button
            onClick={() => {
              onSelectTool(activeShapeType as ToolType);
              setIsShapeFlyoutOpen(!isShapeFlyoutOpen);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsShapeFlyoutOpen(true);
            }}
            title="Herramientas de Formas Geométricas (Clic derecho o clic para menú)"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all relative group cursor-pointer ${
              isAnyShapeActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850'
            }`}
          >
            <ActiveShapeIcon className="w-3.5 h-3.5" />
            <span className="absolute bottom-0.5 right-0.5 text-[6px] text-zinc-400 font-mono">
              ▾
            </span>
          </button>

          {/* Flyout Submenu */}
          {isShapeFlyoutOpen && (
            <div className="absolute left-10 top-0 bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-2xl flex flex-col gap-0.5 z-50 min-w-[130px]">
              <div className="px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono border-b border-zinc-800/80 mb-0.5">
                Formas Vectoriales
              </div>
              <button
                onClick={() => {
                  setActiveShapeType('rect');
                  onSelectTool('rect');
                  setIsShapeFlyoutOpen(false);
                }}
                className="flex items-center justify-between px-2 py-1 text-xs text-zinc-200 hover:text-white hover:bg-blue-600/80 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Square className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rectángulo</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">R</span>
              </button>

              <button
                onClick={() => {
                  setActiveShapeType('circle');
                  onSelectTool('circle');
                  setIsShapeFlyoutOpen(false);
                }}
                className="flex items-center justify-between px-2 py-1 text-xs text-zinc-200 hover:text-white hover:bg-blue-600/80 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Circle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Círculo</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">O</span>
              </button>

              <button
                onClick={() => {
                  setActiveShapeType('star');
                  onSelectTool('star');
                  setIsShapeFlyoutOpen(false);
                }}
                className="flex items-center justify-between px-2 py-1 text-xs text-zinc-200 hover:text-white hover:bg-blue-600/80 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>Estrella</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">S</span>
              </button>

              <button
                onClick={() => {
                  setActiveShapeType('polygon');
                  onSelectTool('polygon');
                  setIsShapeFlyoutOpen(false);
                }}
                className="flex items-center justify-between px-2 py-1 text-xs text-zinc-200 hover:text-white hover:bg-blue-600/80 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Hexagon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Polígono</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">G</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUBTLE DIVIDER 2 */}
      <div className="w-5 h-[1px] bg-zinc-800/80 my-1.5 shrink-0" />

      {/* 3. TIPOGRAFÍA Y CONTENIDO */}
      <div className="flex flex-col items-center gap-1 w-full px-1">
        {/* Text Tool (T) */}
        <button
          onClick={() => onSelectTool('text')}
          title="Herramienta Texto (T)"
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-all relative group cursor-pointer ${
            activeTool === 'text'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono opacity-50 font-bold leading-none">
            T
          </span>
        </button>

        {/* Image / Asset Import */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Importar Imagen / Asset Vectorial"
          className="w-8 h-8 rounded-md flex items-center justify-center transition-all relative group cursor-pointer text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SUBTLE DIVIDER 3 */}
      <div className="w-5 h-[1px] bg-zinc-800/80 my-1.5 shrink-0" />

      {/* 4. MODIFICADORES Y KEYFRAMES */}
      <div className="flex flex-col items-center gap-1 w-full px-1">
        {/* Anchor Point Tool (Y) */}
        <button
          onClick={() => onSelectTool('anchorPoint')}
          title="Herramienta Punto de Anclaje (Y)"
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-all relative group cursor-pointer ${
            activeTool === 'anchorPoint'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono opacity-50 font-bold leading-none">
            Y
          </span>
        </button>

        {/* Auto-Keyframe Toggle */}
        {onToggleAutoKeyframe && (
          <button
            onClick={onToggleAutoKeyframe}
            title={`Auto-Keyframe (Alt+A): ${
              autoKeyframe
                ? 'ACTIVADO (Graba automáticamente cambios como keyframes)'
                : 'DESACTIVADO (Clic para activar)'
            }`}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all relative cursor-pointer group ${
              autoKeyframe
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-sm shadow-rose-500/20'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850 border border-transparent'
            }`}
          >
            <CircleDot className={`w-3.5 h-3.5 ${autoKeyframe ? 'text-rose-400' : 'text-zinc-500'}`} />
            {autoKeyframe && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1 right-1 animate-ping" />
            )}
          </button>
        )}

        {/* Quick Keyframe Inserter (When selection is active) */}
        {hasSelection && onAddKeyframe && (
          <div className="relative" ref={keyframeFlyoutRef}>
            <button
              onClick={() => setIsKeyframeFlyoutOpen(!isKeyframeFlyoutOpen)}
              title="Insertar Keyframe Manual en el tiempo actual"
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                isKeyframeFlyoutOpen
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-400 bg-blue-950/40 border border-blue-800/60 hover:bg-blue-900/60'
              }`}
            >
              <Diamond className="w-3.5 h-3.5 fill-current" />
            </button>

            {isKeyframeFlyoutOpen && (
              <div className="absolute left-10 top-0 bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-2xl flex flex-col gap-0.5 z-50 min-w-[140px]">
                <div className="px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono border-b border-zinc-800/80 mb-0.5">
                  Insertar Keyframe
                </div>
                <button
                  onClick={() => {
                    onAddKeyframe('position');
                    setIsKeyframeFlyoutOpen(false);
                  }}
                  className="flex items-center justify-between px-2 py-1 text-xs text-zinc-200 hover:text-white hover:bg-blue-600/80 rounded"
                >
                  <span>Posición</span>
                  <span className="text-[10px] font-mono text-zinc-400">P</span>
                </button>
                <button
                  onClick={() => {
                    onAddKeyframe('scale');
                    setIsKeyframeFlyoutOpen(false);
                  }}
                  className="flex items-center justify-between px-2 py-1 text-xs text-zinc-200 hover:text-white hover:bg-blue-600/80 rounded"
                >
                  <span>Escala</span>
                  <span className="text-[10px] font-mono text-zinc-400">S</span>
                </button>
                <button
                  onClick={() => {
                    onAddKeyframe('rotation');
                    setIsKeyframeFlyoutOpen(false);
                  }}
                  className="flex items-center justify-between px-2 py-1 text-xs text-zinc-200 hover:text-white hover:bg-blue-600/80 rounded"
                >
                  <span>Rotación</span>
                  <span className="text-[10px] font-mono text-zinc-400">R</span>
                </button>
                <button
                  onClick={() => {
                    onAddKeyframe('opacity');
                    setIsKeyframeFlyoutOpen(false);
                  }}
                  className="flex items-center justify-between px-2 py-1 text-xs text-zinc-200 hover:text-white hover:bg-blue-600/80 rounded"
                >
                  <span>Opacidad</span>
                  <span className="text-[10px] font-mono text-zinc-400">T</span>
                </button>
                <div className="w-full h-[1px] bg-zinc-800 my-0.5" />
                <button
                  onClick={() => {
                    onAddKeyframe('all');
                    setIsKeyframeFlyoutOpen(false);
                  }}
                  className="flex items-center justify-between px-2 py-1 text-xs text-amber-300 hover:text-white hover:bg-blue-600/80 rounded font-semibold"
                >
                  <span>Todas</span>
                  <span className="text-[10px] font-mono text-amber-400">All</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 5. UNDO & REDO QUICK ACTION BUTTONS */}
        {(onUndo || onRedo) && (
          <div className="flex flex-col items-center gap-1 w-full pt-1 border-t border-zinc-800/80 mt-1">
            {onUndo && (
              <button
                onClick={onUndo}
                disabled={!canUndo}
                title="Deshacer (Ctrl+Z)"
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                  canUndo
                    ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    : 'text-zinc-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onRedo && (
              <button
                onClick={onRedo}
                disabled={!canRedo}
                title="Rehacer (Ctrl+Y o Ctrl+Shift+Z)"
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                  canRedo
                    ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    : 'text-zinc-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
