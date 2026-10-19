import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Layers,
  Layout,
} from 'lucide-react';
import { Composition } from '../types';

interface FloatingTransportHUDProps {
  composition: Composition;
  currentTime: number;
  onSetTime: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestoreTimeline: () => void;
  onOpenWorkspaceManager: () => void;
}

export const FloatingTransportHUD: React.FC<FloatingTransportHUDProps> = ({
  composition,
  currentTime,
  onSetTime,
  isPlaying,
  onTogglePlay,
  onRestoreTimeline,
  onOpenWorkspaceManager,
}) => {
  const currentFrame = Math.round(currentTime * composition.fps);
  const progressPercent = Math.min(100, Math.max(0, (currentTime / (composition.duration || 1)) * 100));

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-zinc-900 border border-zinc-750 rounded-xl px-3.5 py-2 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200 select-none">
      {/* Rewind */}
      <button
        onClick={() => onSetTime(0)}
        title="Ir al inicio (Home)"
        className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        <SkipBack className="w-3.5 h-3.5" />
      </button>

      {/* Step Back */}
      <button
        onClick={() => onSetTime(Math.max(0, currentTime - 1 / composition.fps))}
        title="Frame anterior (Flecha Izq)"
        className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Play / Pause Primary Button */}
      <button
        onClick={onTogglePlay}
        title="Reproducir / Pausar (Espacio)"
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
          isPlaying
            ? 'bg-amber-500 text-black hover:bg-amber-400'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        <span>{isPlaying ? 'Pausa' : 'Play'}</span>
      </button>

      {/* Step Fwd */}
      <button
        onClick={() => onSetTime(Math.min(composition.duration, currentTime + 1 / composition.fps))}
        title="Frame siguiente (Flecha Der)"
        className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Timecode Box */}
      <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md text-xs font-mono text-zinc-200">
        <span className="text-blue-400 font-bold">{currentTime.toFixed(2)}s</span>
        <span className="text-zinc-500">/</span>
        <span className="text-zinc-400">{composition.duration.toFixed(2)}s</span>
        <span className="text-zinc-500">|</span>
        <span className="text-zinc-400 text-[10px]">{currentFrame}f</span>
      </div>

      {/* Mini Scrubber Bar */}
      <div
        className="w-24 h-2 bg-zinc-800 rounded-sm overflow-hidden cursor-pointer relative mx-1"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          onSetTime(ratio * composition.duration);
        }}
      >
        <div
          className="h-full bg-blue-500 transition-all rounded-xs"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="w-[1px] h-4 bg-zinc-800 mx-0.5" />

      {/* Restore Full Timeline Button */}
      <button
        onClick={onRestoreTimeline}
        title="Restaurar panel de línea de tiempo completa"
        className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Layers className="w-3 h-3 text-blue-400" />
        <span>Línea de Tiempo</span>
      </button>

      {/* Switch Focus Modes */}
      <button
        onClick={onOpenWorkspaceManager}
        title="Cambiar Espacio de Trabajo / Modo de Enfoque"
        className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        <Layout className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
