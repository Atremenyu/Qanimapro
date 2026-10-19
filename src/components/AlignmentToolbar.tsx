import React, { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
  Columns,
  Rows,
  Maximize2,
  Minimize2,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import { FigmaAlignAction } from '../utils/figmaTools';

interface AlignmentToolbarProps {
  selectedLayerCount: number;
  onAlign: (action: FigmaAlignAction, alignToCanvas: boolean) => void;
  onReorder?: (direction: 'front' | 'back' | 'forward' | 'backward') => void;
  compact?: boolean;
  className?: string;
}

export const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({
  selectedLayerCount,
  onAlign,
  onReorder,
  compact = false,
  className = '',
}) => {
  const [alignToCanvas, setAlignToCanvas] = useState<boolean>(selectedLayerCount <= 1);

  if (selectedLayerCount === 0) return null;

  return (
    <div
      className={`flex flex-col gap-2 p-2 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-lg backdrop-blur-md ${className}`}
    >
      {/* Header & Canvas Mode Toggle */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <LayoutGrid className="w-3 h-3 text-blue-400" />
          <span>Alinear ({selectedLayerCount} {selectedLayerCount === 1 ? 'capa' : 'capas'})</span>
        </span>
        <button
          type="button"
          onClick={() => setAlignToCanvas(!alignToCanvas)}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
            alignToCanvas
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700/60 hover:text-zinc-200'
          }`}
          title={alignToCanvas ? 'Alinear respecto al Lienzo' : 'Alinear respecto a la Selección'}
        >
          {alignToCanvas ? 'Lienzo' : 'Selección'}
        </button>
      </div>

      {/* Primary 6-Way Alignment Grid */}
      <div className="grid grid-cols-6 gap-1 bg-zinc-950/60 p-1 rounded-lg border border-zinc-850">
        <button
          type="button"
          onClick={() => onAlign('alignLeft', alignToCanvas)}
          title="Alinear a la Izquierda"
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onAlign('alignCenterH', alignToCanvas)}
          title="Centrar Horizontalmente"
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onAlign('alignRight', alignToCanvas)}
          title="Alinear a la Derecha"
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onAlign('alignTop', alignToCanvas)}
          title="Alinear Arriba"
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onAlign('alignCenterV', alignToCanvas)}
          title="Centrar Verticalmente"
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
        >
          <span className="font-mono text-xs font-bold leading-none">≡</span>
        </button>
        <button
          type="button"
          onClick={() => onAlign('alignBottom', alignToCanvas)}
          title="Alinear Abajo"
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Proportional Distribution (Multi-layer) & Layer Reorder */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-800/60">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAlign('distributeSpacingH', false)}
            disabled={selectedLayerCount < 3}
            title={selectedLayerCount < 3 ? 'Selecciona 3+ capas para distribuir' : 'Distribuir Espaciado Horizontalmente (Proporcional)'}
            className="px-2 py-1 rounded bg-zinc-950/80 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white border border-zinc-800 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Columns className="w-3 h-3 text-emerald-400" />
            <span>Espaciado H</span>
          </button>
          <button
            type="button"
            onClick={() => onAlign('distributeSpacingV', false)}
            disabled={selectedLayerCount < 3}
            title={selectedLayerCount < 3 ? 'Selecciona 3+ capas para distribuir' : 'Distribuir Espaciado Verticalmente (Proporcional)'}
            className="px-2 py-1 rounded bg-zinc-950/80 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white border border-zinc-800 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Rows className="w-3 h-3 text-emerald-400" />
            <span>Espaciado V</span>
          </button>
        </div>

        {onReorder && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onReorder('front')}
              title="Traer al Frente (Cima)"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onReorder('forward')}
              title="Avanzar una capa"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onReorder('backward')}
              title="Retroceder una capa"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onReorder('back')}
              title="Enviar al Fondo"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
