import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CircleDot,
  Trash2,
  Activity,
  Maximize2,
} from 'lucide-react';
import { EasingType } from '../../types';

interface TimelineToolbarProps {
  currentTime: number;
  duration: number;
  fps: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSetTime: (time: number) => void;
  handleStepFrame: (delta: number) => void;
  handleJumpKeyframe: (direction: 'prev' | 'next') => void;
  autoKeyframe?: boolean;
  onToggleAutoKeyframe?: () => void;
  selectedKeyframesCount: number;
  hasSelectedKeyframe: boolean;
  applyBulkEasing: (easing: EasingType) => void;
  alignSelectedKeyframesToPlayhead: () => void;
  reverseSelectedKeyframes: () => void;
  deleteSelectedKeyframes: () => void;
  isGraphEditor: boolean;
  setIsGraphEditor: (val: boolean) => void;
  handleFitToView: () => void;
  timelineZoom: number;
  setTimelineZoom: (zoom: number) => void;
  onDismiss?: () => void;
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({
  currentTime,
  duration,
  fps,
  isPlaying,
  onTogglePlay,
  onSetTime,
  handleStepFrame,
  handleJumpKeyframe,
  autoKeyframe,
  onToggleAutoKeyframe,
  selectedKeyframesCount,
  hasSelectedKeyframe,
  applyBulkEasing,
  alignSelectedKeyframesToPlayhead,
  reverseSelectedKeyframes,
  deleteSelectedKeyframes,
  isGraphEditor,
  setIsGraphEditor,
  handleFitToView,
  timelineZoom,
  setTimelineZoom,
  onDismiss,
}) => {
  const currentFrame = Math.round(currentTime * fps);

  return (
    <div className="h-9 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between px-3 shrink-0">
      {/* Left: Precise Timecode & Frame Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800/80 px-2 py-1 rounded text-xs font-mono text-zinc-200 shadow-inner">
          <span className="text-blue-400 font-bold">
            {currentTime.toFixed(2)}s
          </span>
          <span className="text-zinc-500">/</span>
          <span className="text-zinc-400">{duration.toFixed(2)}s</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400 text-[10px]">
            {currentFrame}f
          </span>
        </div>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5 bg-zinc-950 border border-zinc-800/80 p-0.5 rounded-lg">
          <button
            onClick={() => onSetTime(0)}
            title="Ir al Inicio (Home)"
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-850 transition-colors cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleJumpKeyframe('prev')}
            title="Keyframe Anterior (J)"
            className="px-1 py-0.5 text-zinc-400 hover:text-amber-400 rounded hover:bg-zinc-850 transition-colors text-[10px] font-mono font-bold cursor-pointer"
          >
            ◀◆
          </button>

          <button
            onClick={() => handleStepFrame(-1)}
            title="1 Frame Atrás (Flecha Izq)"
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-850 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            title="Reproducir / Pausar (Espacio)"
            className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isPlaying ? 'Pausar' : 'Play'}</span>
          </button>

          <button
            onClick={() => handleStepFrame(1)}
            title="1 Frame Adelante (Flecha Der)"
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-850 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleJumpKeyframe('next')}
            title="Keyframe Siguiente (K)"
            className="px-1 py-0.5 text-zinc-400 hover:text-amber-400 rounded hover:bg-zinc-850 transition-colors text-[10px] font-mono font-bold cursor-pointer"
          >
            ◆▶
          </button>

          <button
            onClick={() => onSetTime(duration)}
            title="Ir al Final (End)"
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-850 transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Auto-Keyframe Toggle */}
        {onToggleAutoKeyframe && (
          <button
            onClick={onToggleAutoKeyframe}
            title={`Auto-Keyframe: ${
              autoKeyframe
                ? 'ACTIVADO (Graba automáticamente cambios)'
                : 'DESACTIVADO (Clic para activar)'
            }`}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
              autoKeyframe
                ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-sm'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CircleDot className={`w-3 h-3 ${autoKeyframe ? 'text-rose-400' : 'text-zinc-500'}`} />
            <span className="text-[10px] font-mono font-bold">Auto-KF</span>
          </button>
        )}
      </div>

      {/* Right: Keyframe Actions, Curves, Fit to View, Zoom */}
      <div className="flex items-center gap-2">
        {/* Multi-Keyframe or Single Keyframe Quick Actions Toolbar */}
        {(selectedKeyframesCount > 0 || hasSelectedKeyframe) && (
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-lg text-xs shadow-sm">
            <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {selectedKeyframesCount > 1 ? `${selectedKeyframesCount} Seleccionados` : 'Keyframe'}
            </span>

            <div className="h-3 w-[1px] bg-zinc-800 mx-0.5" />

            {/* Bulk Easing buttons */}
            {(
              [
                { id: 'easeInOut', label: 'F9 Suave', title: 'Curva Suave (F9)' },
                { id: 'easeOut', label: 'Salida', title: 'Desaceleración (Ease Out)' },
                { id: 'easeIn', label: 'Entrada', title: 'Aceleración (Ease In)' },
                { id: 'bounce', label: 'Rebote', title: 'Rebote Elástico' },
                { id: 'linear', label: 'Lineal', title: 'Velocidad Constante' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => applyBulkEasing(item.id as EasingType)}
                title={item.title}
                className="px-1.5 py-0.5 rounded hover:bg-zinc-800 text-[9px] text-zinc-300 hover:text-blue-400 font-medium transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}

            <div className="h-3 w-[1px] bg-zinc-800 mx-0.5" />

            {/* Align to Playhead */}
            <button
              onClick={alignSelectedKeyframesToPlayhead}
              title="Alinear selección al cabezal actual"
              className="px-1.5 py-0.5 rounded hover:bg-zinc-800 text-[10px] text-zinc-300 hover:text-emerald-400 font-mono transition-colors cursor-pointer"
            >
              ◀❚ Alinear
            </button>

            {/* Reverse Keyframe Sequence */}
            {selectedKeyframesCount > 1 && (
              <button
                onClick={reverseSelectedKeyframes}
                title="Invertir secuencia de keyframes seleccionados"
                className="px-1.5 py-0.5 rounded hover:bg-zinc-800 text-[10px] text-zinc-300 hover:text-purple-400 font-mono transition-colors cursor-pointer"
              >
                ⇄ Invertir
              </button>
            )}

            {/* Delete Selection */}
            <button
              onClick={deleteSelectedKeyframes}
              title="Eliminar keyframes seleccionados (Supr)"
              className="p-1 rounded hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Graph Editor Toggle */}
        <button
          onClick={() => setIsGraphEditor(!isGraphEditor)}
          title="Ver Editor de Curvas (Shift+F3)"
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
            isGraphEditor
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800/80'
          }`}
        >
          <Activity className="w-3 h-3 text-indigo-400" />
          <span className="text-[10px]">Curvas</span>
        </button>

        {/* Fit to View Button */}
        <button
          onClick={handleFitToView}
          title="Ajustar Línea de Tiempo al Ancho (Fit to View)"
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-zinc-950 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3 h-3 text-blue-400" />
          <span className="text-[10px]">Ajustar</span>
        </button>

        {/* Timeline Zoom Slider */}
        <div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-950 border border-zinc-800/80 px-2 py-0.5 rounded">
          <span className="text-[9px] font-mono text-zinc-400">Zoom</span>
          <input
            type="range"
            min="0.4"
            max="3.0"
            step="0.1"
            value={timelineZoom}
            onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
            className="w-16 accent-blue-500 cursor-pointer h-1.5"
          />
        </div>

        {/* Collapse/Hide Timeline Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            title="Ocultar Línea de Tiempo (Desliza hacia abajo para ocultar)"
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors cursor-pointer shrink-0"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
