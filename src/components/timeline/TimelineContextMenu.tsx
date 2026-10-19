import React from 'react';
import {
  Copy,
  Clock,
  Trash2,
  Move,
  Scaling,
  RotateCw,
  SunMedium,
} from 'lucide-react';
import { VectorLayer, EasingType } from '../../types';

export interface ContextMenuState {
  x: number;
  y: number;
  time: number;
  layer: VectorLayer;
  propPath?: string;
  keyframeId?: string;
}

interface TimelineContextMenuProps {
  contextMenu: ContextMenuState;
  currentTime: number;
  onClose: () => void;
  onSetTime: (time: number) => void;
  setKeyframeEasing: (
    layerId: string,
    propPath: string,
    keyframeId: string | undefined,
    easing: EasingType,
    time: number
  ) => void;
  duplicateKeyframeToPlayhead: (
    layer: VectorLayer,
    sourceTime: number,
    propPath?: string,
    keyframeId?: string
  ) => void;
  deleteKeyframe: (
    layerId: string,
    propPath: string,
    keyframeId?: string,
    time?: number
  ) => void;
  insertKeyframeAtTime: (
    layer: VectorLayer,
    time: number,
    type: 'position' | 'scale' | 'rotation' | 'opacity' | 'all'
  ) => void;
}

export const TimelineContextMenu: React.FC<TimelineContextMenuProps> = ({
  contextMenu,
  currentTime,
  onClose,
  onSetTime,
  setKeyframeEasing,
  duplicateKeyframeToPlayhead,
  deleteKeyframe,
  insertKeyframeAtTime,
}) => {
  return (
    <div
      style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1 text-xs text-zinc-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
        <span className="truncate max-w-[130px] font-bold text-zinc-300">
          {contextMenu.layer.name}
        </span>
        <span className="text-amber-400 font-bold">{contextMenu.time.toFixed(2)}s</span>
      </div>

      <div className="p-1.5 space-y-1">
        {/* Keyframe Easing Palette & Actions */}
        {(contextMenu.keyframeId || contextMenu.propPath) && (
          <>
            <div className="px-1.5 pt-0.5 pb-1">
              <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Curva de Aceleración (Easing):
              </span>
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    { id: 'easeInOut', label: 'Suave (F9)' },
                    { id: 'easeOut', label: 'Frenar' },
                    { id: 'easeIn', label: 'Acelerar' },
                    { id: 'elastic', label: 'Elástico' },
                    { id: 'bounce', label: 'Rebote' },
                    { id: 'back', label: 'Back' },
                    { id: 'linear', label: 'Lineal' },
                    { id: 'hold', label: 'Hold' },
                  ] as const
                ).map((eItem) => (
                  <button
                    key={eItem.id}
                    onClick={() => {
                      setKeyframeEasing(
                        contextMenu.layer.id,
                        contextMenu.propPath || 'all',
                        contextMenu.keyframeId,
                        eItem.id as EasingType,
                        contextMenu.time
                      );
                      onClose();
                    }}
                    className="px-1.5 py-1 rounded bg-zinc-900 hover:bg-amber-500/20 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 text-[10px] text-center font-medium transition-colors cursor-pointer truncate"
                  >
                    {eItem.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => {
                duplicateKeyframeToPlayhead(
                  contextMenu.layer,
                  contextMenu.time,
                  contextMenu.propPath,
                  contextMenu.keyframeId
                );
                onClose();
              }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-zinc-850 flex items-center gap-2 text-left text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span className="flex-1">Duplicar a cabezal ({currentTime.toFixed(2)}s)</span>
            </button>

            <button
              onClick={() => {
                onSetTime(contextMenu.time);
                onClose();
              }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-zinc-850 flex items-center gap-2 text-left text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="flex-1">Mover cabezal a este fotograma</span>
            </button>

            <button
              onClick={() => {
                deleteKeyframe(
                  contextMenu.layer.id,
                  contextMenu.propPath || 'all',
                  contextMenu.keyframeId,
                  contextMenu.time
                );
                onClose();
              }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-rose-950/50 text-rose-400 flex items-center gap-2 text-left font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {contextMenu.propPath === 'all'
                  ? 'Eliminar todos los keyframes en este tiempo'
                  : 'Eliminar este keyframe'}
              </span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />
          </>
        )}

        {/* Insert Keyframes */}
        <div className="px-1.5 pt-0.5">
          <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider block mb-1">
            Insertar Keyframe en {contextMenu.time.toFixed(2)}s:
          </span>
        </div>

        <button
          onClick={() => {
            insertKeyframeAtTime(contextMenu.layer, contextMenu.time, 'all');
            onClose();
          }}
          className="w-full px-2 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white flex items-center gap-2 text-left font-medium transition-colors cursor-pointer"
        >
          <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 shrink-0" />
          <div className="flex-1">
            <span>Todas las Transformaciones</span>
            <span className="text-[9px] block text-zinc-400">
              (Posición, Escala, Rotación, Opacidad)
            </span>
          </div>
          <span className="text-[9px] font-mono opacity-60">F6</span>
        </button>

        <div className="grid grid-cols-2 gap-1 pt-0.5">
          <button
            onClick={() => {
              insertKeyframeAtTime(contextMenu.layer, contextMenu.time, 'position');
              onClose();
            }}
            className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 flex items-center gap-1.5 text-left transition-colors cursor-pointer"
          >
            <Move className="w-3 h-3 text-blue-400" />
            <span className="text-[11px]">Posición (P)</span>
          </button>

          <button
            onClick={() => {
              insertKeyframeAtTime(contextMenu.layer, contextMenu.time, 'scale');
              onClose();
            }}
            className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 flex items-center gap-1.5 text-left transition-colors cursor-pointer"
          >
            <Scaling className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px]">Escala (S)</span>
          </button>

          <button
            onClick={() => {
              insertKeyframeAtTime(contextMenu.layer, contextMenu.time, 'rotation');
              onClose();
            }}
            className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 flex items-center gap-1.5 text-left transition-colors cursor-pointer"
          >
            <RotateCw className="w-3 h-3 text-indigo-400" />
            <span className="text-[11px]">Rotación (R)</span>
          </button>

          <button
            onClick={() => {
              insertKeyframeAtTime(contextMenu.layer, contextMenu.time, 'opacity');
              onClose();
            }}
            className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 flex items-center gap-1.5 text-left transition-colors cursor-pointer"
          >
            <SunMedium className="w-3 h-3 text-amber-400" />
            <span className="text-[11px]">Opacidad (T)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
