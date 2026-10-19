import React from 'react';
import {
  PenTool,
  MousePointer,
  Sliders,
  Rows,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Hand,
  Layers,
  ChevronUp,
  ChevronDown,
  Layout,
} from 'lucide-react';
import { ToolType, ViewportState } from '../types';

interface TabletFloatingControlsProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  toolbarVisible: boolean;
  onToggleToolbar: () => void;
  inspectorVisible: boolean;
  onToggleInspector: () => void;
  timelineVisible: boolean;
  onToggleTimeline: () => void;
  viewportState: ViewportState;
  onUpdateViewport: (updated: Partial<ViewportState>) => void;
  onResetViewport: () => void;
  isTabletView?: boolean;
}

export const TabletFloatingControls: React.FC<TabletFloatingControlsProps> = ({
  activeTool,
  onSelectTool,
  toolbarVisible,
  onToggleToolbar,
  inspectorVisible,
  onToggleInspector,
  timelineVisible,
  onToggleTimeline,
  viewportState,
  onUpdateViewport,
  onResetViewport,
}) => {
  const isHand = activeTool === 'hand';

  const handleZoom = (delta: number) => {
    const nextZoom = Math.max(0.1, Math.min(5, Math.round((viewportState.zoom + delta) * 10) / 10));
    onUpdateViewport({ zoom: nextZoom });
  };

  return (
    <>
      {/* 1. TOP-LEFT FLOATING CANVAS VIEW CONTROLS */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1 bg-zinc-950/85 backdrop-blur-md border border-zinc-800/90 p-1 rounded-xl shadow-xl select-none">
        {/* Toggle Tool Drawer / Dock if hidden */}
        {!toolbarVisible && (
          <button
            onClick={onToggleToolbar}
            title="Mostrar Barra de Herramientas"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/30 transition-all cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="text-[11px]">Herramientas</span>
          </button>
        )}

        {/* Hand Tool / Pan Toggle */}
        <button
          onClick={() => onSelectTool(isHand ? 'select' : 'hand')}
          title={isHand ? 'Volver a Selección (V)' : 'Activar Mano para Desplazar (H)'}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            isHand
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          {isHand ? <Hand className="w-3.5 h-3.5" /> : <MousePointer className="w-3.5 h-3.5" />}
        </button>

        <div className="w-[1px] h-4 bg-zinc-800 my-auto" />

        {/* Zoom Out */}
        <button
          onClick={() => handleZoom(-0.15)}
          title="Alejar Zoom"
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Level Indicator (Click to 100%) */}
        <button
          onClick={() => onUpdateViewport({ zoom: 1 })}
          title="Restablecer Zoom a 100%"
          className="px-1.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-850 rounded transition-colors cursor-pointer min-w-[42px] text-center"
        >
          {Math.round(viewportState.zoom * 100)}%
        </button>

        {/* Zoom In */}
        <button
          onClick={() => handleZoom(0.15)}
          title="Acercar Zoom"
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-zinc-800 my-auto" />

        {/* Fit / Center Stage */}
        <button
          onClick={onResetViewport}
          title="Centrar y Ajustar Lienzo"
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. TOP-RIGHT FLOATING INSPECTOR TOGGLE (When inspector is collapsed on tablet) */}
      {!inspectorVisible && (
        <div className="absolute top-3 right-3 z-30 select-none">
          <button
            onClick={onToggleInspector}
            title="Mostrar Inspector de Propiedades"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-zinc-200 hover:text-white hover:border-blue-500/40 text-xs font-semibold shadow-xl transition-all cursor-pointer group"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400 group-hover:text-blue-400" />
            <span className="text-[11px]">Propiedades</span>
          </button>
        </div>
      )}

      {/* 3. BOTTOM-RIGHT FLOATING TIMELINE TOGGLE (When timeline is collapsed) */}
      {!timelineVisible && (
        <div className="absolute bottom-3 right-3 z-30 select-none">
          <button
            onClick={onToggleTimeline}
            title="Mostrar Línea de Tiempo de Animación"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-zinc-200 hover:text-white hover:border-blue-500/40 text-xs font-semibold shadow-xl transition-all cursor-pointer group"
          >
            <Rows className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">Línea de Tiempo</span>
          </button>
        </div>
      )}
    </>
  );
};
