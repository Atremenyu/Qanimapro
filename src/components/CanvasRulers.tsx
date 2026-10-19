import React, { useState, useEffect, useRef } from 'react';
import { CustomGuide } from '../types';
import { Lock, Unlock, Trash2, Eye, EyeOff, Plus, HelpCircle } from 'lucide-react';

interface CanvasRulersProps {
  compositionWidth: number;
  compositionHeight: number;
  zoom: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  stageRef: React.RefObject<SVGSVGElement | null>;
  selectedBounds?: { minX: number; maxX: number; minY: number; maxY: number } | null;
  guides?: CustomGuide[];
  onStartDragNewGuide: (axis: 'horizontal' | 'vertical', e: React.MouseEvent) => void;
  onToggleRulers?: () => void;
  onClearGuides?: () => void;
  onToggleLockGuides?: () => void;
  guidesLocked?: boolean;
  onAddGuideAtPosition?: (axis: 'horizontal' | 'vertical', pos: number) => void;
}

const RULER_THICKNESS = 24; // Standard 24px thickness for Figma/Adobe rulers

function getRulerStep(zoom: number): { majorStep: number; subTicks: number } {
  // We want major ticks to be separated by roughly 40-90 screen pixels
  const niceSteps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
  let chosenStep = 100;
  for (const step of niceSteps) {
    if (step * zoom >= 45) {
      chosenStep = step;
      break;
    }
  }
  const subTicks = chosenStep >= 100 ? 5 : chosenStep >= 20 ? 4 : 2;
  return { majorStep: chosenStep, subTicks };
}

export const CanvasRulers: React.FC<CanvasRulersProps> = ({
  compositionWidth,
  compositionHeight,
  zoom,
  containerRef,
  stageRef,
  selectedBounds,
  guides = [],
  onStartDragNewGuide,
  onToggleRulers,
  onClearGuides,
  onToggleLockGuides,
  guidesLocked = false,
  onAddGuideAtPosition,
}) => {
  const [containerRect, setContainerRect] = useState<{ width: number; height: number; left: number; top: number } | null>(null);
  const [stageRect, setStageRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isCornerMenuOpen, setIsCornerMenuOpen] = useState(false);
  const cornerMenuRef = useRef<HTMLDivElement>(null);

  // Close corner menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cornerMenuRef.current && !cornerMenuRef.current.contains(e.target as Node)) {
        setIsCornerMenuOpen(false);
      }
    };
    if (isCornerMenuOpen) {
      window.addEventListener('mousedown', handleClickOutside);
      return () => window.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isCornerMenuOpen]);

  // Synchronize container & stage rects
  const updateRects = () => {
    if (containerRef.current) {
      const cr = containerRef.current.getBoundingClientRect();
      setContainerRect({ width: cr.width, height: cr.height, left: cr.left, top: cr.top });
    }
    if (stageRef.current) {
      const sr = stageRef.current.getBoundingClientRect();
      setStageRect({ left: sr.left, top: sr.top, width: sr.width, height: sr.height });
    }
  };

  useEffect(() => {
    updateRects();
    const handleResize = () => updateRects();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [compositionWidth, compositionHeight, zoom]);

  // Track mouse movements to update indicator pips on both rulers
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - cRect.left,
        y: e.clientY - cRect.top,
      });
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, [containerRef]);

  if (!containerRect || !stageRect) {
    return null;
  }

  // Exact relative offset of Canvas (0,0) in container coordinates
  const originX = stageRect.left - containerRect.left;
  const originY = stageRect.top - containerRect.top;

  const { majorStep, subTicks } = getRulerStep(zoom);
  const subStep = majorStep / subTicks;

  // 1. HORIZONTAL RULER CALCULATIONS
  const minCanvasX = (RULER_THICKNESS - originX) / zoom;
  const maxCanvasX = (containerRect.width - originX) / zoom;
  const startMajorX = Math.floor(minCanvasX / majorStep) * majorStep;
  const endMajorX = Math.ceil(maxCanvasX / majorStep) * majorStep;

  const horizontalTicks: { pos: number; label?: string; isMajor: boolean; isBoundary: boolean }[] = [];
  for (let val = startMajorX; val <= endMajorX; val += majorStep) {
    const screenX = originX + val * zoom;
    if (screenX >= RULER_THICKNESS && screenX <= containerRect.width) {
      const isBoundary = val === 0 || val === compositionWidth;
      horizontalTicks.push({
        pos: screenX,
        label: `${val}`,
        isMajor: true,
        isBoundary,
      });
    }

    // Sub-ticks
    for (let s = 1; s < subTicks; s++) {
      const subVal = val + s * subStep;
      const subScreenX = originX + subVal * zoom;
      if (subScreenX >= RULER_THICKNESS && subScreenX <= containerRect.width) {
        horizontalTicks.push({
          pos: subScreenX,
          isMajor: false,
          isBoundary: false,
        });
      }
    }
  }

  // 2. VERTICAL RULER CALCULATIONS
  const minCanvasY = (RULER_THICKNESS - originY) / zoom;
  const maxCanvasY = (containerRect.height - originY) / zoom;
  const startMajorY = Math.floor(minCanvasY / majorStep) * majorStep;
  const endMajorY = Math.ceil(maxCanvasY / majorStep) * majorStep;

  const verticalTicks: { pos: number; label?: string; isMajor: boolean; isBoundary: boolean }[] = [];
  for (let val = startMajorY; val <= endMajorY; val += majorStep) {
    const screenY = originY + val * zoom;
    if (screenY >= RULER_THICKNESS && screenY <= containerRect.height) {
      const isBoundary = val === 0 || val === compositionHeight;
      verticalTicks.push({
        pos: screenY,
        label: `${val}`,
        isMajor: true,
        isBoundary,
      });
    }

    // Sub-ticks
    for (let s = 1; s < subTicks; s++) {
      const subVal = val + s * subStep;
      const subScreenY = originY + subVal * zoom;
      if (subScreenY >= RULER_THICKNESS && subScreenY <= containerRect.height) {
        verticalTicks.push({
          pos: subScreenY,
          isMajor: false,
          isBoundary: false,
        });
      }
    }
  }

  // Canvas bounds on horizontal and vertical rulers
  const canvasSpanXStart = Math.max(RULER_THICKNESS, originX);
  const canvasSpanXEnd = Math.min(containerRect.width, originX + compositionWidth * zoom);
  const canvasSpanYStart = Math.max(RULER_THICKNESS, originY);
  const canvasSpanYEnd = Math.min(containerRect.height, originY + compositionHeight * zoom);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden font-mono">
      {/* --- TOP-LEFT CORNER JUNCTION BLOCK --- */}
      <div
        className="absolute top-0 left-0 w-6 h-6 bg-zinc-900 border-r border-b border-zinc-750 flex items-center justify-center cursor-pointer pointer-events-auto hover:bg-zinc-800 transition-colors z-40 text-zinc-400 hover:text-zinc-200"
        title="Opciones de Reglas y Guías (Clic para menú)"
        onClick={() => setIsCornerMenuOpen((prev) => !prev)}
      >
        <span className="text-[9px] font-bold tracking-tighter">px</span>
      </div>

      {/* Corner Quick Menu */}
      {isCornerMenuOpen && (
        <div
          ref={cornerMenuRef}
          className="absolute top-7 left-1 z-50 w-56 bg-zinc-900 border border-zinc-750 rounded-md shadow-2xl p-1.5 text-xs text-zinc-200 pointer-events-auto flex flex-col gap-1 backdrop-blur-md"
        >
          <div className="px-2 py-1 text-[10px] uppercase font-semibold text-zinc-400 tracking-wider border-b border-zinc-800 flex items-center justify-between">
            <span>Reglas y Guías</span>
            <span className="text-cyan-400 font-mono">Shift+R</span>
          </div>

          <button
            onClick={() => {
              if (onToggleRulers) onToggleRulers();
              setIsCornerMenuOpen(false);
            }}
            className="w-full px-2 py-1.5 hover:bg-zinc-800 rounded flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>Ocultar Reglas</span>
            </span>
          </button>

          <button
            onClick={() => {
              if (onToggleLockGuides) onToggleLockGuides();
              setIsCornerMenuOpen(false);
            }}
            className="w-full px-2 py-1.5 hover:bg-zinc-800 rounded flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {guidesLocked ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{guidesLocked ? 'Desbloquear Guías' : 'Bloquear Guías'}</span>
            </span>
            <span className="text-[10px] text-zinc-500">{guidesLocked ? 'Bloqueadas' : 'Editables'}</span>
          </button>

          {onAddGuideAtPosition && (
            <>
              <button
                onClick={() => {
                  onAddGuideAtPosition('horizontal', Math.round(compositionHeight / 2));
                  setIsCornerMenuOpen(false);
                }}
                className="w-full px-2 py-1.5 hover:bg-zinc-800 rounded flex items-center gap-2 text-left transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Guía Horizontal en Centro ({Math.round(compositionHeight / 2)}px)</span>
              </button>

              <button
                onClick={() => {
                  onAddGuideAtPosition('vertical', Math.round(compositionWidth / 2));
                  setIsCornerMenuOpen(false);
                }}
                className="w-full px-2 py-1.5 hover:bg-zinc-800 rounded flex items-center gap-2 text-left transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Guía Vertical en Centro ({Math.round(compositionWidth / 2)}px)</span>
              </button>
            </>
          )}

          {guides.length > 0 && onClearGuides && (
            <>
              <div className="h-px bg-zinc-800 my-0.5" />
              <button
                onClick={() => {
                  onClearGuides();
                  setIsCornerMenuOpen(false);
                }}
                className="w-full px-2 py-1.5 hover:bg-red-500/20 text-red-400 rounded flex items-center gap-2 text-left transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar Todas las Guías ({guides.length})</span>
              </button>
            </>
          )}

          <div className="px-2 py-1 text-[10px] text-zinc-500 border-t border-zinc-800 mt-1">
            Tip: Arrastra desde las reglas para crear nuevas guías.
          </div>
        </div>
      )}

      {/* --- TOP HORIZONTAL RULER --- */}
      <div
        className="absolute top-0 left-6 right-0 h-6 bg-zinc-900/95 border-b border-zinc-750 pointer-events-auto cursor-ns-resize backdrop-blur-sm"
        style={{ left: `${RULER_THICKNESS}px` }}
        title="Regla Horizontal (Haz clic y arrastra hacia abajo para crear una guía)"
        onMouseDown={(e) => onStartDragNewGuide('horizontal', e)}
      >
        {/* Subtle Canvas Region Highlight */}
        {canvasSpanXEnd > canvasSpanXStart && (
          <div
            className="absolute top-0 bottom-0 bg-white/[0.03] border-l border-r border-cyan-500/30 pointer-events-none"
            style={{
              left: `${canvasSpanXStart - RULER_THICKNESS}px`,
              width: `${Math.max(0, canvasSpanXEnd - canvasSpanXStart)}px`,
            }}
          />
        )}

        {/* Selected Layer Bounding Span on Horizontal Ruler */}
        {selectedBounds && (
          <div
            className="absolute bottom-0 h-1 bg-blue-500/80 rounded-t-sm pointer-events-none transition-all duration-75"
            style={{
              left: `${originX + selectedBounds.minX * zoom - RULER_THICKNESS}px`,
              width: `${Math.max(2, (selectedBounds.maxX - selectedBounds.minX) * zoom)}px`,
            }}
          />
        )}

        {/* Existing Vertical Guide Indicator Pips on Horizontal Ruler */}
        {guides
          .filter((g) => g.axis === 'vertical')
          .map((g) => {
            const pipX = originX + g.position * zoom - RULER_THICKNESS;
            if (pipX < 0 || pipX > containerRect.width - RULER_THICKNESS) return null;
            return (
              <div
                key={g.id}
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 pointer-events-none z-10"
                style={{ left: `${pipX}px` }}
              >
                <div className="absolute top-0 -left-1 w-2.5 h-1.5 bg-cyan-400 rounded-b-sm" />
              </div>
            );
          })}

        {/* Ticks & Number Labels */}
        <svg className="w-full h-full block pointer-events-none">
          {horizontalTicks.map((t, idx) => {
            const relX = t.pos - RULER_THICKNESS;
            if (relX < 0 || relX > containerRect.width - RULER_THICKNESS) return null;
            const tickH = t.isMajor ? (t.isBoundary ? 16 : 10) : 5;
            const strokeColor = t.isBoundary ? '#38bdf8' : t.isMajor ? '#71717a' : '#3f3f46';
            return (
              <g key={`htick_${idx}`}>
                <line
                  x1={relX}
                  y1={24 - tickH}
                  x2={relX}
                  y2={24}
                  stroke={strokeColor}
                  strokeWidth={t.isBoundary ? 1.5 : 1}
                />
                {t.label && (
                  <text
                    x={relX + 2}
                    y={11}
                    fill={t.isBoundary ? '#38bdf8' : '#a1a1aa'}
                    fontSize="9px"
                    fontFamily="monospace"
                    className="select-none"
                  >
                    {t.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Mouse Position Indicator Pip on Horizontal Ruler */}
        {mousePos && mousePos.x >= RULER_THICKNESS && (
          <div
            className="absolute top-0 bottom-0 w-px bg-cyan-400/90 pointer-events-none transition-transform duration-75"
            style={{ transform: `translateX(${mousePos.x - RULER_THICKNESS}px)` }}
          >
            <div className="w-1.5 h-1.5 bg-cyan-400 -ml-[2px] rounded-full" />
          </div>
        )}
      </div>

      {/* --- LEFT VERTICAL RULER --- */}
      <div
        className="absolute left-0 top-6 bottom-0 w-6 bg-zinc-900/95 border-r border-zinc-750 pointer-events-auto cursor-ew-resize backdrop-blur-sm"
        style={{ top: `${RULER_THICKNESS}px` }}
        title="Regla Vertical (Haz clic y arrastra hacia la derecha para crear una guía)"
        onMouseDown={(e) => onStartDragNewGuide('vertical', e)}
      >
        {/* Subtle Canvas Region Highlight */}
        {canvasSpanYEnd > canvasSpanYStart && (
          <div
            className="absolute left-0 right-0 bg-white/[0.03] border-t border-b border-cyan-500/30 pointer-events-none"
            style={{
              top: `${canvasSpanYStart - RULER_THICKNESS}px`,
              height: `${Math.max(0, canvasSpanYEnd - canvasSpanYStart)}px`,
            }}
          />
        )}

        {/* Selected Layer Bounding Span on Vertical Ruler */}
        {selectedBounds && (
          <div
            className="absolute right-0 w-1 bg-blue-500/80 rounded-l-sm pointer-events-none transition-all duration-75"
            style={{
              top: `${originY + selectedBounds.minY * zoom - RULER_THICKNESS}px`,
              height: `${Math.max(2, (selectedBounds.maxY - selectedBounds.minY) * zoom)}px`,
            }}
          />
        )}

        {/* Existing Horizontal Guide Indicator Pips on Vertical Ruler */}
        {guides
          .filter((g) => g.axis === 'horizontal')
          .map((g) => {
            const pipY = originY + g.position * zoom - RULER_THICKNESS;
            if (pipY < 0 || pipY > containerRect.height - RULER_THICKNESS) return null;
            return (
              <div
                key={g.id}
                className="absolute left-0 right-0 h-0.5 bg-cyan-400 pointer-events-none z-10"
                style={{ top: `${pipY}px` }}
              >
                <div className="absolute left-0 -top-1 w-1.5 h-2.5 bg-cyan-400 rounded-r-sm" />
              </div>
            );
          })}

        {/* Ticks & Number Labels */}
        <svg className="w-full h-full block pointer-events-none">
          {verticalTicks.map((t, idx) => {
            const relY = t.pos - RULER_THICKNESS;
            if (relY < 0 || relY > containerRect.height - RULER_THICKNESS) return null;
            const tickW = t.isMajor ? (t.isBoundary ? 16 : 10) : 5;
            const strokeColor = t.isBoundary ? '#38bdf8' : t.isMajor ? '#71717a' : '#3f3f46';
            return (
              <g key={`vtick_${idx}`}>
                <line
                  x1={24 - tickW}
                  y1={relY}
                  x2={24}
                  y2={relY}
                  stroke={strokeColor}
                  strokeWidth={t.isBoundary ? 1.5 : 1}
                />
                {t.label && (
                  <text
                    x={2}
                    y={relY - 2}
                    fill={t.isBoundary ? '#38bdf8' : '#a1a1aa'}
                    fontSize="8px"
                    fontFamily="monospace"
                    className="select-none"
                  >
                    {t.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Mouse Position Indicator Pip on Vertical Ruler */}
        {mousePos && mousePos.y >= RULER_THICKNESS && (
          <div
            className="absolute left-0 right-0 h-px bg-cyan-400/90 pointer-events-none transition-transform duration-75"
            style={{ transform: `translateY(${mousePos.y - RULER_THICKNESS}px)` }}
          >
            <div className="w-1.5 h-1.5 bg-cyan-400 -mt-[2px] rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
