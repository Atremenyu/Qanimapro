import React, { useState } from 'react';
import {
  Maximize2,
  X,
  Smartphone,
  Monitor,
  Layout,
  Megaphone,
  Check,
  ArrowRight,
  Sparkles,
  Move,
} from 'lucide-react';
import { Composition } from '../types';
import { adaptCompositionToDimensions, STANDARD_DIMENSION_PRESETS, DimensionPreset } from '../utils/templateAdapter';

interface ReframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  composition: Composition;
  onApplyReframe: (reframedComp: Composition) => void;
}

export const ReframeModal: React.FC<ReframeModalProps> = ({
  isOpen,
  onClose,
  composition,
  onApplyReframe,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('social_1080x1080');
  const [customWidth, setCustomWidth] = useState<number>(composition.width);
  const [customHeight, setCustomHeight] = useState<number>(composition.height);

  if (!isOpen) return null;

  const currentPreset = STANDARD_DIMENSION_PRESETS.find((p) => p.id === selectedPresetId);
  const targetW = currentPreset && currentPreset.width > 0 ? currentPreset.width : customWidth;
  const targetH = currentPreset && currentPreset.height > 0 ? currentPreset.height : customHeight;

  const handleApply = () => {
    const reframed = adaptCompositionToDimensions(composition, targetW, targetH);
    reframed.name = `${composition.name} (${targetW}×${targetH})`;
    onApplyReframe(reframed);
    onClose();
  };

  const priorityPresets = [
    { id: 'social_1080x1080', name: '1:1 Cuadrado', w: 1080, h: 1080, sub: 'Instagram / Feed / LinkedIn', icon: Layout },
    { id: 'social_1080x1920', name: '9:16 Vertical', w: 1080, h: 1920, sub: 'TikTok / Reels / Stories', icon: Smartphone },
    { id: 'video_1920x1080', name: '16:9 Panorámico', w: 1920, h: 1080, sub: 'YouTube / Pantallas / Web', icon: Monitor },
    { id: 'ad_600x500', name: '600 × 500', w: 600, h: 500, sub: 'Portada Periódico / Módulo', icon: Megaphone },
    { id: 'ad_728x90', name: '728 × 90', w: 728, h: 90, sub: 'Leaderboard Google Ads', icon: Megaphone },
    { id: 'ad_1100x361', name: '1100 × 361', w: 1100, h: 361, sub: 'Super Billboard Periódico', icon: Megaphone },
    { id: 'gads_300x250', name: '300 × 250 (MPU)', w: 300, h: 250, sub: 'Medium Rectangle Display', icon: Megaphone },
    { id: 'gads_300x600', name: '300 × 600 (Half Page)', w: 300, h: 600, sub: 'Rascacielos Lateral', icon: Smartphone },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
              <Move className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                Reframe Inteligente de Composición
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Auto-Escalado
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Adapta automáticamente capas, fuentes, posiciones y keyframes a otro formato sin romper el diseño
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Current vs Target status */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Tamaño actual:</span>
              <span className="font-mono font-bold text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">
                {composition.width} × {composition.height} px
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Nuevo tamaño:</span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                {targetW} × {targetH} px
              </span>
            </div>
          </div>

          {/* Formats Grid */}
          <div>
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Seleccionar Formato Destino
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {priorityPresets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomWidth(preset.w);
                      setCustomHeight(preset.h);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-950/40'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                          {preset.name}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {preset.w}×{preset.h}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate pt-0.5">{preset.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Size Option */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                O Medidas Personalizadas
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">Ancho (px)</label>
                <input
                  type="number"
                  min={100}
                  max={3840}
                  value={targetW}
                  onChange={(e) => {
                    setSelectedPresetId('custom');
                    setCustomWidth(parseInt(e.target.value, 10) || 1080);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">Alto (px)</label>
                <input
                  type="number"
                  min={100}
                  max={3840}
                  value={targetH}
                  onChange={(e) => {
                    setSelectedPresetId('custom');
                    setCustomHeight(parseInt(e.target.value, 10) || 1080);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preserva keyframes y jerarquía de capas</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Reframe ({targetW} × {targetH})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
