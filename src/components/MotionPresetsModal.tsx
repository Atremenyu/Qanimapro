import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Clock,
  Check,
  X,
  RotateCcw,
  Zap,
  Sliders,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import { VectorLayer } from '../types';
import { MOTION_PRESETS, MotionPreset, clearLayerKeyframes } from '../utils/motionPresets';

interface MotionPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLayer: VectorLayer | null;
  currentTime: number;
  onUpdateLayer: (layerId: string, updated: Partial<VectorLayer>) => void;
}

export const MotionPresetsModal: React.FC<MotionPresetsModalProps> = ({
  isOpen,
  onClose,
  selectedLayer,
  currentTime,
  onUpdateLayer,
}) => {
  const [activeCategory, setActiveCategory] = useState<'text' | 'in' | 'emphasis' | 'loop' | 'out'>('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [applyAtCurrentTime, setApplyAtCurrentTime] = useState(true);
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPresets = MOTION_PRESETS.filter((preset) => {
    const matchesCategory = preset.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleApply = (preset: MotionPreset) => {
    if (!selectedLayer) return;

    const startTime = applyAtCurrentTime ? currentTime : 0;
    const duration = customDuration !== null ? customDuration : preset.duration;
    const updated = preset.apply(selectedLayer, startTime, duration);
    updated.expandedInTimeline = true;

    onUpdateLayer(selectedLayer.id, updated);
    setAppliedPresetId(preset.id);
    setTimeout(() => setAppliedPresetId(null), 1800);
  };

  const handleClearAnimation = () => {
    if (!selectedLayer) return;
    const cleared = clearLayerKeyframes(selectedLayer);
    onUpdateLayer(selectedLayer.id, cleared);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="h-14 px-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <span>Animaciones Pre-establecidas (GSAP & Motion)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                  Biblioteca Pro
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                {selectedLayer
                  ? `Aplicar efectos de movimiento preestablecidos a "${selectedLayer.name}"`
                  : 'Selecciona una capa en el lienzo para aplicar animaciones'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="px-5 py-2.5 bg-zinc-900/40 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setApplyAtCurrentTime(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                applyAtCurrentTime
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              En cabezal actual ({currentTime.toFixed(2)}s)
            </button>
            <button
              onClick={() => setApplyAtCurrentTime(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                !applyAtCurrentTime
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Al inicio (0:00s)
            </button>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar animación (ej: rebote, rotar, fade, slide)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs px-3 py-1 rounded-md outline-none focus:border-blue-500 w-64"
            />
            {selectedLayer && (
              <button
                onClick={handleClearAnimation}
                title="Eliminar todos los fotogramas clave de la capa"
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 px-2 py-1 rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpiar Animación</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-5 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveCategory('text')}
            className={`py-3 px-3.5 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeCategory === 'text'
                ? 'text-amber-400 border-amber-400 bg-amber-500/10'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <span>🔤 Tipografía GSAP</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 font-mono">
              {MOTION_PRESETS.filter((p) => p.category === 'text').length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('in')}
            className={`py-3 px-3.5 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeCategory === 'in'
                ? 'text-amber-400 border-amber-400 bg-amber-500/10'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <span>✨ Entradas Modernas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 font-mono">
              {MOTION_PRESETS.filter((p) => p.category === 'in').length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('emphasis')}
            className={`py-3 px-3.5 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeCategory === 'emphasis'
                ? 'text-amber-400 border-amber-400 bg-amber-500/10'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <span>💥 Énfasis</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 font-mono">
              {MOTION_PRESETS.filter((p) => p.category === 'emphasis').length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('loop')}
            className={`py-3 px-3.5 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeCategory === 'loop'
                ? 'text-amber-400 border-amber-400 bg-amber-500/10'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <span>🔄 Bucles &amp; Loops</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 font-mono">
              {MOTION_PRESETS.filter((p) => p.category === 'loop').length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('out')}
            className={`py-3 px-3.5 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeCategory === 'out'
                ? 'text-amber-400 border-amber-400 bg-amber-500/10'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <span>💨 Salidas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 font-mono">
              {MOTION_PRESETS.filter((p) => p.category === 'out').length}
            </span>
          </button>
        </div>

        {/* Presets Grid */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          {!selectedLayer && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <span className="text-base">💡</span>
                <span>Modo Exploración: Selecciona una capa en el lienzo o en la línea de tiempo para aplicar las animaciones directamente.</span>
              </div>
            </div>
          )}

          {filteredPresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3 text-xl">
                🔍
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                No se encontraron animaciones
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mb-4">
                No hay resultados para "{searchQuery}" en la categoría seleccionada. Intenta con otra palabra clave o limpia la búsqueda.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
              >
                Limpiar Búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPresets.map((preset) => {
                const isApplied = appliedPresetId === preset.id;

                return (
                  <div
                    key={preset.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between group ${
                      isApplied
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{preset.icon}</span>
                          <h3 className="text-xs font-bold text-zinc-100 group-hover:text-white">
                            {preset.name}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                          {preset.duration}s
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {preset.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] bg-zinc-800/80 text-zinc-400 px-1.5 py-0.2 rounded font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        GSAP Easing Curves
                      </span>

                      <button
                        disabled={!selectedLayer}
                        onClick={() => handleApply(preset)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                          !selectedLayer
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : isApplied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Aplicado!</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Aplicar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 px-5 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0 text-xs text-zinc-400">
          <div>
            💡 <span className="text-zinc-300">Consejo:</span> Puedes editar o desplazar los fotogramas clave creados en la línea de tiempo inferior.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
