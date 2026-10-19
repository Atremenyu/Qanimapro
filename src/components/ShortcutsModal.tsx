import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Tools & Navigation',
      items: [
        { key: 'V', desc: 'Selection Tool' },
        { key: 'P', desc: 'Pen Tool (Draw Paths)' },
        { key: 'R', desc: 'Rectangle Shape Tool' },
        { key: 'O', desc: 'Ellipse / Circle Tool' },
        { key: 'S', desc: 'Star Shape Tool' },
        { key: 'G', desc: 'Polygon Shape Tool' },
        { key: 'T', desc: 'Horizontal Type Tool' },
        { key: 'Y', desc: 'Anchor Point (Pan Behind)' },
        { key: 'H / Space+Drag', desc: 'Hand / Pan Canvas Viewport' },
        { key: 'Ctrl + Scroll', desc: 'Zoom In / Out Canvas' },
        { key: 'Shift + R', desc: 'Mostrar / Ocultar Reglas' },
      ],
    },
    {
      title: 'Timeline & Keyframing',
      items: [
        { key: 'Doble Clic', desc: 'Insertar Keyframe (Estilo GWD)' },
        { key: 'Clic Derecho', desc: 'Menú Contextual de Keyframes' },
        { key: 'F6 / Alt+K', desc: 'Insertar Keyframe a Capa' },
        { key: 'Spacebar', desc: 'Play / Pause Animation' },
        { key: 'Home / End', desc: 'Ir al Inicio / Final' },
        { key: 'F9', desc: 'Suavizado Easy Ease (Curva)' },
        { key: 'Shift + F3', desc: 'Editor de Curvas (Graph)' },
      ],
    },
    {
      title: 'Layer Stack & Arrange',
      items: [
        { key: 'Ctrl + Shift + ]', desc: 'Bring Layer to Front' },
        { key: 'Ctrl + ] / Alt + ↑', desc: 'Bring Layer Forward (Up)' },
        { key: 'Ctrl + [ / Alt + ↓', desc: 'Send Layer Backward (Down)' },
        { key: 'Ctrl + Shift + [', desc: 'Send Layer to Back' },
        { key: 'Drag & Drop', desc: 'Reorder in Timeline' },
      ],
    },
    {
      title: 'Workspaces & Focus Modes',
      items: [
        { key: 'Shift + W', desc: 'Gestionar Espacios de Trabajo' },
        { key: 'Alt + 1', desc: 'Estudio Completo (Default)' },
        { key: 'Alt + 2', desc: 'Modo Animación & Timeline' },
        { key: 'Alt + 3', desc: 'Modo Ilustración & Vector' },
        { key: 'Alt + 4', desc: 'Modo Cinema Zen (Lienzo)' },
        { key: 'Alt + 5', desc: 'Modo Tipografía & Layout' },
      ],
    },
    {
      title: 'Edit & Composition',
      items: [
        { key: 'Ctrl + Z', desc: 'Undo' },
        { key: 'Ctrl + Y / Ctrl+Shift+Z', desc: 'Redo' },
        { key: 'Ctrl + D', desc: 'Duplicate Selected Layer' },
        { key: 'Delete / Backspace', desc: 'Delete Selected Layer' },
        { key: 'Ctrl + K', desc: 'Composition Settings' },
        { key: 'Ctrl + E', desc: 'Export HTML5 Vector Animation' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 px-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              After Effects & VectorMotion Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-1">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div key={item.key} className="flex flex-col text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">{item.desc}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-750 font-mono text-[10px] text-zinc-200 font-semibold shadow-xs">
                        {item.key}
                      </kbd>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Optimized for fast desktop workflow</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
