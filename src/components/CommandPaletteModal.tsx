import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Play,
  Square,
  Circle,
  Star,
  Hexagon,
  Type,
  PenTool,
  Image as ImageIcon,
  Sliders,
  Sparkles,
  Download,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize,
  RotateCw,
  Repeat,
  Flame,
  Zap,
  Layers,
  Settings,
  HelpCircle,
  X,
  Keyboard,
  Share2,
} from 'lucide-react';
import { VectorLayer, EasingType, ToolType } from '../types';
import { FigmaAlignAction } from '../utils/figmaTools';

interface CommandItem {
  id: string;
  title: string;
  category: 'Herramientas' | 'Capas y Formas' | 'Alineación (Figma)' | 'Animación y Efectos' | 'Proyecto y Exportación';
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolType) => void;
  onAddLayer: (type: VectorLayer['type']) => void;
  onApplyFigmaAlign: (action: FigmaAlignAction) => void;
  onApplyEasing: (easing: EasingType) => void;
  onApplyEffect: (effect: 'trim' | 'repeater' | 'wiggle' | 'glow' | 'invert') => void;
  onOpenExportModal: () => void;
  onOpenPsdModal: () => void;
  onOpenPresetModal: () => void;
  onOpenCompSettings: () => void;
  onOpenReframeModal?: () => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onAddLayer,
  onApplyFigmaAlign,
  onApplyEasing,
  onApplyEffect,
  onOpenExportModal,
  onOpenPsdModal,
  onOpenPresetModal,
  onOpenCompSettings,
  onOpenReframeModal,
  onTogglePlay,
  isPlaying,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Herramientas
    { id: 'tool_select', title: 'Herramienta Selección', category: 'Herramientas', shortcut: 'V', icon: Sliders, action: () => onSelectTool('select') },
    { id: 'tool_direct', title: 'Selección Directa de Nodos', category: 'Herramientas', shortcut: 'A', icon: Sliders, action: () => onSelectTool('directSelect') },
    { id: 'tool_pen', title: 'Pluma Bézier Vectorial', category: 'Herramientas', shortcut: 'P', icon: PenTool, action: () => onSelectTool('pen') },
    { id: 'tool_hand', title: 'Mover Vista (Mano)', category: 'Herramientas', shortcut: 'H', icon: Sliders, action: () => onSelectTool('hand') },
    { id: 'toggle_play', title: isPlaying ? 'Pausar Reproducción' : 'Reproducir Animación', category: 'Herramientas', shortcut: 'Espacio', icon: Play, action: onTogglePlay },

    // Capas y Formas
    { id: 'add_rect', title: 'Insertar Rectángulo / Contenedor', category: 'Capas y Formas', shortcut: 'R', icon: Square, action: () => onAddLayer('rect') },
    { id: 'add_circle', title: 'Insertar Círculo / Elipse', category: 'Capas y Formas', shortcut: 'O', icon: Circle, action: () => onAddLayer('circle') },
    { id: 'add_star', title: 'Insertar Estrella', category: 'Capas y Formas', shortcut: 'S', icon: Star, action: () => onAddLayer('star') },
    { id: 'add_polygon', title: 'Insertar Polígono Regular', category: 'Capas y Formas', shortcut: 'G', icon: Hexagon, action: () => onAddLayer('polygon') },
    { id: 'add_text', title: 'Insertar Capa de Texto', category: 'Capas y Formas', shortcut: 'T', icon: Type, action: () => onAddLayer('text') },

    // Alineación Figma
    { id: 'align_left', title: 'Alinear a la Izquierda (Figma)', category: 'Alineación (Figma)', shortcut: 'Alt+A', icon: AlignLeft, action: () => onApplyFigmaAlign('alignLeft') },
    { id: 'align_center_h', title: 'Alinear Centro Horizontal (Figma)', category: 'Alineación (Figma)', shortcut: 'Alt+H', icon: AlignCenter, action: () => onApplyFigmaAlign('alignCenterH') },
    { id: 'align_right', title: 'Alinear a la Derecha (Figma)', category: 'Alineación (Figma)', shortcut: 'Alt+D', icon: AlignRight, action: () => onApplyFigmaAlign('alignRight') },
    { id: 'align_top', title: 'Alinear Arriba (Figma)', category: 'Alineación (Figma)', shortcut: 'Alt+W', icon: Maximize, action: () => onApplyFigmaAlign('alignTop') },
    { id: 'align_center_v', title: 'Alinear Centro Vertical (Figma)', category: 'Alineación (Figma)', shortcut: 'Alt+V', icon: AlignCenter, action: () => onApplyFigmaAlign('alignCenterV') },
    { id: 'align_bottom', title: 'Alinear Abajo (Figma)', category: 'Alineación (Figma)', shortcut: 'Alt+S', icon: Maximize, action: () => onApplyFigmaAlign('alignBottom') },
    { id: 'distribute_h', title: 'Distribuir Espaciado Horizontal', category: 'Alineación (Figma)', icon: AlignJustify, action: () => onApplyFigmaAlign('distributeH') },
    { id: 'distribute_v', title: 'Distribuir Espaciado Vertical', category: 'Alineación (Figma)', icon: AlignJustify, action: () => onApplyFigmaAlign('distributeV') },

    // Efectos y Easing
    { id: 'fx_trim', title: 'Agregar Modificador Trim Paths (Trazo)', category: 'Animación y Efectos', icon: Zap, action: () => onApplyEffect('trim') },
    { id: 'fx_repeater', title: 'Agregar Modificador Repetidor Radial', category: 'Animación y Efectos', icon: Repeat, action: () => onApplyEffect('repeater') },
    { id: 'fx_wiggle', title: 'Agregar Modificador Wiggle / Temblor', category: 'Animación y Efectos', icon: Flame, action: () => onApplyEffect('wiggle') },
    { id: 'fx_glow', title: 'Agregar Modificador Resplandor Neón', category: 'Animación y Efectos', icon: Sparkles, action: () => onApplyEffect('glow') },
    { id: 'ease_inout', title: 'Aplicar Suavizado Ease In-Out', category: 'Animación y Efectos', shortcut: 'F9', icon: Sparkles, action: () => onApplyEasing('easeInOut') },
    { id: 'ease_elastic', title: 'Aplicar Física Spring / Elástico', category: 'Animación y Efectos', icon: Zap, action: () => onApplyEasing('elastic') },
    { id: 'ease_bounce', title: 'Aplicar Rebote Bounce', category: 'Animación y Efectos', icon: Zap, action: () => onApplyEasing('bounce') },

    // Proyecto y Exportación
    { id: 'export_modal', title: 'Exportar HTML5 / Google Ads / Lottie / React', category: 'Proyecto y Exportación', shortcut: 'Ctrl+E', icon: Download, action: onOpenExportModal },
    { id: 'psd_import', title: 'Importar Archivo Photoshop (.psd)', category: 'Proyecto y Exportación', icon: Upload, action: onOpenPsdModal },
    { id: 'preset_modal', title: 'Explorar Galería de Templates', category: 'Proyecto y Exportación', icon: Layers, action: onOpenPresetModal },
    { id: 'comp_settings', title: 'Ajustes del Lienzo y Duración', category: 'Proyecto y Exportación', shortcut: 'Ctrl+K', icon: Settings, action: onOpenCompSettings },
    ...(onOpenReframeModal ? [{ id: 'reframe_modal', title: 'Reframe Inteligente de Composición (Formatos Redes & Ads)', category: 'Proyecto y Exportación' as const, icon: Maximize, action: onOpenReframeModal }] : []),
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[12vh] p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Input */}
        <div className="p-3.5 border-b border-zinc-850 flex items-center gap-3 bg-zinc-900/50">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un comando o busca una acción... (ej. Rectángulo, Exportar, Alinear)"
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          <kbd className="hidden sm:inline text-[10px] font-mono text-zinc-500 bg-zinc-850 px-1.5 py-0.5 rounded border border-zinc-750">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No se encontraron comandos que coincidan con &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 text-white border border-blue-500/50'
                      : 'text-zinc-300 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{cmd.title}</div>
                      <div className="text-[10px] text-zinc-500">{cmd.category}</div>
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded shrink-0">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-zinc-900/40 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navegar</span>
            <span>↵ Ejecutar</span>
          </div>
          <span>Figma-style Quick Actions</span>
        </div>
      </div>
    </div>
  );
};
