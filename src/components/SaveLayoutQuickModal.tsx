import React, { useState } from 'react';
import {
  X,
  Save,
  Layout,
  Activity,
  PenTool,
  Eye,
  Type,
  Sparkles,
  Sliders,
  Palette,
  Layers,
  Monitor,
  Zap,
  Check,
} from 'lucide-react';
import { WorkspaceLayout } from '../types';

interface SaveLayoutQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: {
    toolbar: WorkspaceLayout['toolbar'];
    inspector: WorkspaceLayout['inspector'];
    timeline: WorkspaceLayout['timeline'];
    viewport: WorkspaceLayout['viewport'];
  };
  onSave: (layoutData: {
    name: string;
    description: string;
    icon: string;
    shortcut?: string;
  }) => void;
}

const AVAILABLE_ICONS = [
  { id: 'layout', label: 'Estudio', icon: Layout },
  { id: 'activity', label: 'Animación', icon: Activity },
  { id: 'pen-tool', label: 'Vector', icon: PenTool },
  { id: 'eye', label: 'Visor', icon: Eye },
  { id: 'type', label: 'Texto', icon: Type },
  { id: 'sparkles', label: 'Efectos', icon: Sparkles },
  { id: 'sliders', label: 'Ajustes', icon: Sliders },
  { id: 'palette', label: 'Color', icon: Palette },
  { id: 'layers', label: 'Capas', icon: Layers },
  { id: 'monitor', label: 'Pantalla', icon: Monitor },
  { id: 'zap', label: 'Rápido', icon: Zap },
];

export const SaveLayoutQuickModal: React.FC<SaveLayoutQuickModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('layout');
  const [shortcut, setShortcut] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || 'Espacio de trabajo personalizado creado por el usuario.',
      icon: selectedIcon,
      shortcut: shortcut.trim() || undefined,
    });
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Guardar Espacio de Trabajo</h3>
              <p className="text-[11px] text-zinc-400">Almacena la disposición y visibilidad actual de los paneles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-zinc-300">
              Nombre del Espacio <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="p. ej., Edición 4K, Motion Banners, Clean Mode..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-zinc-300">
              Descripción Opcional
            </label>
            <input
              type="text"
              placeholder="Breve nota sobre el propósito de este modo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 outline-none text-xs"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-zinc-300">
              Icono Distintivo
            </label>
            <div className="grid grid-cols-6 gap-1.5 p-2 bg-zinc-950 rounded-lg border border-zinc-800">
              {AVAILABLE_ICONS.map((ic) => {
                const IconComponent = ic.icon;
                const isSelected = selectedIcon === ic.id;
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setSelectedIcon(ic.id)}
                    title={ic.label}
                    className={`p-2 rounded flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-[9px] truncate max-w-full">{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current State Summary Card */}
          <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center justify-between">
              <span>Configuración a Guardar</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Estado en Vivo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-zinc-400 font-mono">
              <div>
                Herramientas:{' '}
                <span className={currentConfig.toolbar.visible ? 'text-blue-400' : 'text-zinc-500'}>
                  {currentConfig.toolbar.visible ? `Visible (${currentConfig.toolbar.position})` : 'Oculto'}
                </span>
              </div>
              <div>
                Inspector:{' '}
                <span className={currentConfig.inspector.visible ? 'text-blue-400' : 'text-zinc-500'}>
                  {currentConfig.inspector.visible ? `${currentConfig.inspector.width}px (${currentConfig.inspector.position})` : 'Oculto'}
                </span>
              </div>
              <div>
                Timeline:{' '}
                <span className={currentConfig.timeline.visible ? 'text-blue-400' : 'text-zinc-500'}>
                  {currentConfig.timeline.visible ? `${currentConfig.timeline.height}px` : 'Oculto / Minimizado'}
                </span>
              </div>
              <div>
                Rejilla / Guías:{' '}
                <span className="text-zinc-300">
                  {currentConfig.viewport.showGrid ? 'Rejilla ON' : 'Rejilla OFF'}
                  {currentConfig.viewport.showSafeAreas ? ', Safe ON' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Espacio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
