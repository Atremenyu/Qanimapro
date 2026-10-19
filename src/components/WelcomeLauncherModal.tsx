import React, { useState } from 'react';
import { Composition } from '../types';
import {
  Film,
  Plus,
  FileCode2,
  Layers,
  Layout,
  Upload,
  Zap,
  Check,
  ChevronRight,
  Shield,
  Smartphone,
  Monitor,
  Megaphone,
} from 'lucide-react';

interface WelcomeLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNewComp: (comp: {
    name: string;
    width: number;
    height: number;
    fps: number;
    duration: number;
    backgroundColor: string;
  }) => void;
  onOpenPsdModal: () => void;
  onOpenPresetModal: () => void;
  onOpenProjectJson: () => void;
}

export const WelcomeLauncherModal: React.FC<WelcomeLauncherModalProps> = ({
  isOpen,
  onClose,
  onCreateNewComp,
  onOpenPsdModal,
  onOpenPresetModal,
  onOpenProjectJson,
}) => {
  const [name, setName] = useState('Mi Animación');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [fps, setFps] = useState(60);
  const [duration, setDuration] = useState(4.0);
  const [backgroundColor, setBackgroundColor] = useState('#0c0f17');

  if (!isOpen) return null;

  const presets = [
    { label: '800 × 600', sub: 'Estándar Web', w: 800, h: 600, icon: Monitor },
    { label: '1080 × 1080', sub: 'Cuadrado 1:1', w: 1080, h: 1080, icon: Layout },
    { label: '1920 × 1080', sub: 'Full HD 16:9', w: 1920, h: 1080, icon: Monitor },
    { label: '300 × 250', sub: 'Google Ad (Medium)', w: 300, h: 250, icon: Megaphone },
    { label: '728 × 90', sub: 'Leaderboard Ad', w: 728, h: 90, icon: Megaphone },
    { label: '320 × 50', sub: 'Banner Móvil', w: 320, h: 50, icon: Smartphone },
  ];

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onCreateNewComp({
      name: name.trim() || 'Nueva Composición',
      width: Math.max(100, Math.min(3840, width)),
      height: Math.max(100, Math.min(2160, height)),
      fps,
      duration: Math.max(0.5, Math.min(30, duration)),
      backgroundColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header with App Identity */}
        <div className="p-6 pb-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Bienvenido al Estudio
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  v2.0
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Selecciona cómo deseas comenzar tu sesión de diseño y animación vectorial
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto custom-scrollbar">
          {/* Left Column: Fast Action Cards */}
          <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r border-zinc-850 space-y-3 bg-zinc-950/50">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Comenzar desde
            </span>

            {/* Action Card: Templates */}
            <div
              onClick={() => {
                onClose();
                onOpenPresetModal();
              }}
              className="group p-3.5 rounded-xl bg-zinc-900/70 hover:bg-indigo-950/30 border border-zinc-800 hover:border-indigo-500/60 cursor-pointer transition-all flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300">
                    Usar un Template / Plantilla
                  </h3>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-400" />
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                  Animaciones completas prediseñadas: HUDs, banners Google Ads, micro-loaders y logotipos.
                </p>
              </div>
            </div>

            {/* Action Card: PSD Import */}
            <div
              onClick={() => {
                onClose();
                onOpenPsdModal();
              }}
              className="group p-3.5 rounded-xl bg-zinc-900/70 hover:bg-blue-950/30 border border-zinc-800 hover:border-blue-500/60 cursor-pointer transition-all flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layout className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-200 group-hover:text-blue-300">
                    Importar desde Photoshop (PSD)
                  </h3>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400" />
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                  Convierte automáticamente las capas, textos y formas vectoriales de un archivo .psd.
                </p>
              </div>
            </div>

            {/* Action Card: Open JSON Project */}
            <div
              onClick={() => {
                onClose();
                onOpenProjectJson();
              }}
              className="group p-3.5 rounded-xl bg-zinc-900/70 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-500/60 cursor-pointer transition-all flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
                    Abrir Proyecto Guardado
                  </h3>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400" />
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                  Cargar archivo de proyecto .vectormotion.json guardado previamente.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Custom New Blank Canvas Configurator */}
          <form onSubmit={handleCreate} className="md:col-span-7 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Crear Nueva Composición en Blanco
                </span>
                <span className="text-[11px] font-mono text-zinc-500">Configuración</span>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Nombre del Proyecto</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mi Animación"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              {/* Presets Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Medidas Rápidas</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {presets.map((p) => {
                    const isSelected = width === p.w && height === p.h;
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setWidth(p.w);
                          setHeight(p.h);
                        }}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/50'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold truncate">{p.label}</div>
                          <div className="text-[9px] text-zinc-500 truncate">{p.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Width & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Ancho (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value) || 100)}
                    min={100}
                    max={3840}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Alto (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value) || 100)}
                    min={100}
                    max={2160}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono outline-none"
                  />
                </div>
              </div>

              {/* Duration & FPS & Background */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Duración (seg)</label>
                  <input
                    type="number"
                    value={duration}
                    step={0.5}
                    min={0.5}
                    max={30}
                    onChange={(e) => setDuration(parseFloat(e.target.value) || 4.0)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">FPS</label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value) || 60)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono outline-none cursor-pointer"
                  >
                    <option value={30}>30 FPS (Banners)</option>
                    <option value={60}>60 FPS (Ultra Smooth)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Color Fondo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-8 h-8 rounded border border-zinc-700 cursor-pointer bg-transparent"
                    />
                    <span className="text-[11px] font-mono text-zinc-400">{backgroundColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-zinc-850 flex items-center justify-end gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Lienzo en Blanco</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
