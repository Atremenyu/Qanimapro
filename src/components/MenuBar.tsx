import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Edit,
  Layers,
  Sparkles,
  Sliders,
  Eye,
  Settings,
  HelpCircle,
  Plus,
  FolderOpen,
  Save,
  Download,
  Copy,
  Trash2,
  Maximize2,
  RotateCw,
  Repeat,
  Flame,
  Scissors,
  Zap,
  Activity,
  Grid,
  Magnet,
  Camera,
  Keyboard,
  Info,
  Check,
  ChevronRight,
  FileImage,
  BookOpen,
  Compass,
  Diamond,
  PenTool,
  TrendingUp,
  FileCode2,
  Layout,
  Columns,
  Rows,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LayoutGrid,
  Bot,
} from 'lucide-react';
import { Composition, VectorLayer, EasingType, WorkspaceLayout } from '../types';
import { GuideSectionId } from './LearningGuideModal';
import { FigmaAlignAction } from '../utils/figmaTools';

export interface MenuBarProps {
  className?: string;
  onOpenMcpModal?: () => void;
  composition: Composition;
  onUpdateComposition: (updated: Partial<Composition>) => void;
  onNewBlankComposition: () => void;
  onOpenProjectJson: () => void;
  onSaveProjectJson: () => void;
  onImportSvg: (svgContent: string) => void;
  onOpenPsdModal?: () => void;
  onOpenExportModal: () => void;
  onOpenPresetModal: () => void;
  onOpenCompSettings: () => void;
  onOpenShortcutsModal: () => void;
  onOpenReframeModal?: () => void;
  onApplyFigmaAlign?: (action: FigmaAlignAction, alignToCanvas?: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedLayerIds: string[];
  onSelectLayer: (layerId: string | null, multi?: boolean) => void;
  onAddLayer: (type: VectorLayer['type']) => void;
  onDuplicateLayer: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onReorderLayer: (layerId: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
  onApplyTransformAction?: (action: 'center' | 'centerAnchor' | 'flipH' | 'flipV' | 'reset') => void;
  onApplyEffect?: (effect: 'trim' | 'repeater' | 'wiggle' | 'glow' | 'invert') => void;
  onApplyEasingToSelected?: (easing: EasingType) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onResetTime?: () => void;
  viewportZoom?: number;
  onSetViewportZoom?: (zoom: number) => void;
  onResetViewport?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showRulers?: boolean;
  onToggleRulers?: () => void;
  snapToGrid?: boolean;
  onToggleSnap?: () => void;
  showSafeAreas?: boolean;
  onToggleSafeAreas?: () => void;
  onionSkin?: boolean;
  onToggleOnionSkin?: () => void;
  autoKeyframe?: boolean;
  onToggleAutoKeyframe?: () => void;
  onOpenMotionPresets?: () => void;
  onAddKeyframe?: (type: 'rotation' | 'scale' | 'opacity' | 'position' | 'all') => void;
  onOpenKeyframeGuide?: () => void;
  onOpenLearningGuide?: (section?: GuideSectionId) => void;
  onStartInteractiveTour?: () => void;
  activeLayoutId?: string;
  allLayouts?: WorkspaceLayout[];
  onSelectLayout?: (layout: WorkspaceLayout) => void;
  onOpenWorkspaceManager?: () => void;
  onQuickSaveWorkspace?: () => void;
  onResetDefaultWorkspace?: () => void;
  toolbarVisible?: boolean;
  onToggleToolbarVisible?: () => void;
  inspectorVisible?: boolean;
  onToggleInspectorVisible?: () => void;
  timelineVisible?: boolean;
  onToggleTimelineVisible?: () => void;
  inspectorPosition?: 'left' | 'right';
  onToggleInspectorPosition?: () => void;
  toolbarPosition?: 'left' | 'right';
  onToggleToolbarPosition?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  className,
  onOpenMcpModal,
  composition,
  onUpdateComposition,
  onNewBlankComposition,
  onOpenProjectJson,
  onSaveProjectJson,
  onImportSvg,
  onOpenPsdModal,
  onOpenExportModal,
  onOpenPresetModal,
  onOpenCompSettings,
  onOpenShortcutsModal,
  onOpenReframeModal,
  onApplyFigmaAlign,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedLayerIds,
  onSelectLayer,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onReorderLayer,
  onApplyTransformAction,
  onApplyEffect,
  onApplyEasingToSelected,
  isPlaying,
  onTogglePlay,
  onResetTime,
  viewportZoom = 1,
  onSetViewportZoom,
  onResetViewport,
  showGrid = true,
  onToggleGrid,
  showRulers = true,
  onToggleRulers,
  snapToGrid = false,
  onToggleSnap,
  showSafeAreas = false,
  onToggleSafeAreas,
  onionSkin = false,
  onToggleOnionSkin,
  autoKeyframe = true,
  onToggleAutoKeyframe,
  onOpenMotionPresets,
  onAddKeyframe,
  onOpenKeyframeGuide,
  onOpenLearningGuide,
  onStartInteractiveTour,
  activeLayoutId,
  allLayouts = [],
  onSelectLayout,
  onOpenWorkspaceManager,
  onQuickSaveWorkspace,
  onResetDefaultWorkspace,
  toolbarVisible = true,
  onToggleToolbarVisible,
  inspectorVisible = true,
  onToggleInspectorVisible,
  timelineVisible = true,
  onToggleTimelineVisible,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onImportSvg(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const selectedLayerId = selectedLayerIds[0];

  const toggleMenu = (menuName: string) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  const menuButtonClass = (menuName: string) =>
    `px-2 py-0.5 text-xs rounded transition-colors select-none font-medium ${
      openMenu === menuName
        ? 'bg-blue-600 text-white'
        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
    }`;

  const menuItemClass =
    'w-full px-3 py-1.5 text-xs text-left text-zinc-300 hover:text-white hover:bg-blue-600 flex items-center justify-between group transition-colors cursor-pointer select-none';

  const shortcutBadge = 'text-[10px] font-mono text-zinc-500 group-hover:text-blue-200 ml-4';

  return (
    <div
      ref={menuBarRef}
      className={
        className ||
        'h-7 bg-zinc-950 px-1 flex items-center gap-0.5 select-none relative z-40 shrink-0 text-xs'
      }
    >
      {/* Hidden file input for SVG upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        onChange={handleSvgUpload}
        className="hidden"
      />

      {/* 1. ARCHIVO */}
      <div className="relative">
        <button onClick={() => toggleMenu('file')} className={menuButtonClass('file')}>
          Archivo
        </button>
        {openMenu === 'file' && (
          <div className="absolute top-full left-0 mt-0.5 w-60 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <button
              onClick={() => {
                onNewBlankComposition();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-blue-400" /> Nueva Composición
              </span>
              <span className={shortcutBadge}>Ctrl+N</span>
            </button>

            <button
              onClick={() => {
                onOpenProjectJson();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" /> Abrir Proyecto JSON...
              </span>
              <span className={shortcutBadge}>Ctrl+O</span>
            </button>

            <button
              onClick={() => {
                onSaveProjectJson();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Save className="w-3.5 h-3.5 text-emerald-400" /> Guardar Proyecto JSON
              </span>
              <span className={shortcutBadge}>Ctrl+S</span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => {
                fileInputRef.current?.click();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-purple-400" /> Importar Vector SVG...
              </span>
              <span className={shortcutBadge}>SVG</span>
            </button>

            {onOpenPsdModal && (
              <button
                onClick={() => {
                  onOpenPsdModal();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2">
                  <FileImage className="w-3.5 h-3.5 text-sky-400" /> Importar Photoshop (.psd)...
                </span>
                <span className={shortcutBadge}>PSD</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenPresetModal();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Catálogo de Plantillas...
              </span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => {
                onOpenExportModal();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2 font-semibold text-blue-300">
                <Download className="w-3.5 h-3.5 text-blue-400" /> Exportar (HTML5 / MP4 / JSON)...
              </span>
              <span className={shortcutBadge}>Ctrl+E</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. EDITAR */}
      <div className="relative">
        <button onClick={() => toggleMenu('edit')} className={menuButtonClass('edit')}>
          Editar
        </button>
        {openMenu === 'edit' && (
          <div className="absolute top-full left-0 mt-0.5 w-60 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <button
              onClick={() => {
                onUndo();
                setOpenMenu(null);
              }}
              disabled={!canUndo}
              className={`${menuItemClass} ${!canUndo ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 -scale-x-100" /> Deshacer
              </span>
              <span className={shortcutBadge}>Ctrl+Z</span>
            </button>

            <button
              onClick={() => {
                onRedo();
                setOpenMenu(null);
              }}
              disabled={!canRedo}
              className={`${menuItemClass} ${!canRedo ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5" /> Rehacer
              </span>
              <span className={shortcutBadge}>Ctrl+Y</span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => {
                if (selectedLayerId) onDuplicateLayer(selectedLayerId);
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-blue-400" /> Duplicar Capa
              </span>
              <span className={shortcutBadge}>Ctrl+D</span>
            </button>

            <button
              onClick={() => {
                if (selectedLayerId) onDeleteLayer(selectedLayerId);
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2 text-rose-300">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Eliminar Capa
              </span>
              <span className={shortcutBadge}>Supr</span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => {
                onOpenShortcutsModal();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5 text-zinc-400" /> Atajos de Teclado
              </span>
              <span className={shortcutBadge}>?</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. COMPOSICIÓN */}
      <div className="relative">
        <button onClick={() => toggleMenu('comp')} className={menuButtonClass('comp')}>
          Composición
        </button>
        {openMenu === 'comp' && (
          <div className="absolute top-full left-0 mt-0.5 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <button
              onClick={() => {
                onOpenCompSettings();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-blue-400" /> Ajustes de Composición...
              </span>
              <span className={shortcutBadge}>Ctrl+K</span>
            </button>

            {onOpenReframeModal && (
              <button
                onClick={() => {
                  onOpenReframeModal();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2 text-emerald-300">
                  <Move className="w-3.5 h-3.5 text-emerald-400" /> Reframe Inteligente (1:1, 9:16, 16:9)...
                </span>
                <span className={shortcutBadge}>Reframe</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenPresetModal();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Cargar Plantilla Animada...
              </span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1.5 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Resolución actual:</span>
              <span className="font-mono text-zinc-200 font-bold">
                {composition.width} × {composition.height} px
              </span>
            </div>
            <div className="px-3 py-1 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Duración / FPS:</span>
              <span className="font-mono text-zinc-200">
                {composition.duration}s @ {composition.fps}fps
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. CAPA */}
      <div className="relative">
        <button onClick={() => toggleMenu('layer')} className={menuButtonClass('layer')}>
          Capa
        </button>
        {openMenu === 'layer' && (
          <div className="absolute top-full left-0 mt-0.5 w-60 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Crear Nueva Capa
            </div>
            <button
              onClick={() => {
                onAddLayer('text');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5 text-blue-400" /> Texto
              </span>
              <span className={shortcutBadge}>T</span>
            </button>
            <button
              onClick={() => {
                onAddLayer('rect');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Layout className="w-3.5 h-3.5 text-emerald-400" /> Rectángulo
              </span>
              <span className={shortcutBadge}>R</span>
            </button>
            <button
              onClick={() => {
                onAddLayer('circle');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-amber-400" /> Círculo / Elipse
              </span>
              <span className={shortcutBadge}>O</span>
            </button>
            <button
              onClick={() => {
                onAddLayer('star');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Estrella
              </span>
              <span className={shortcutBadge}>S</span>
            </button>
            <button
              onClick={() => {
                onAddLayer('polygon');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Diamond className="w-3.5 h-3.5 text-pink-400" /> Polígono
              </span>
              <span className={shortcutBadge}>P</span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Organizar &amp; Transformar
            </div>
            <button
              onClick={() => {
                if (selectedLayerId) onReorderLayer(selectedLayerId, 'front');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Traer al Frente</span>
              <span className={shortcutBadge}>Ctrl+]</span>
            </button>
            <button
              onClick={() => {
                if (selectedLayerId) onReorderLayer(selectedLayerId, 'back');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Enviar al Fondo</span>
              <span className={shortcutBadge}>Ctrl+[</span>
            </button>
            <button
              onClick={() => {
                if (onApplyTransformAction) onApplyTransformAction('center');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Centrar en el Lienzo</span>
              <span className={shortcutBadge}>C</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. ANIMACIÓN */}
      <div className="relative">
        <button onClick={() => toggleMenu('animation')} className={menuButtonClass('animation')}>
          Animación
        </button>
        {openMenu === 'animation' && (
          <div className="absolute top-full left-0 mt-0.5 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <button
              onClick={() => {
                if (onOpenMotionPresets) onOpenMotionPresets();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Presets de Animación GSAP...
              </span>
              <span className={shortcutBadge}>P</span>
            </button>

            <button
              onClick={() => {
                if (onAddKeyframe) onAddKeyframe('all');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Diamond className="w-3.5 h-3.5 text-amber-400" /> Añadir Keyframe en Cabezal
              </span>
              <span className={shortcutBadge}>K</span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Efectos &amp; Modificadores
            </div>
            <button
              onClick={() => {
                if (onApplyEffect) onApplyEffect('trim');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2 text-blue-300">
                <Scissors className="w-3.5 h-3.5 text-blue-400" /> Animar Trazo (Trim Paths)
              </span>
            </button>
            <button
              onClick={() => {
                if (onApplyEffect) onApplyEffect('wiggle');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Vibración Continua (Wiggle)
              </span>
            </button>
            <button
              onClick={() => {
                if (onApplyEffect) onApplyEffect('glow');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Resplandor Neón (Glow)
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 6. VER */}
      <div className="relative">
        <button onClick={() => toggleMenu('view')} className={menuButtonClass('view')}>
          Ver
        </button>
        {openMenu === 'view' && (
          <div className="absolute top-full left-0 mt-0.5 w-60 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <button
              onClick={() => {
                if (onResetViewport) onResetViewport();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" /> Ajustar Lienzo al Monitor
              </span>
              <span className={shortcutBadge}>Ctrl+0</span>
            </button>
            <button
              onClick={() => {
                if (onSetViewportZoom) onSetViewportZoom(1);
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Tamaño Real (100%)</span>
              <span className={shortcutBadge}>Ctrl+1</span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => {
                if (onToggleGrid) onToggleGrid();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Grid className="w-3.5 h-3.5" /> Mostrar Cuadrícula
              </span>
              {showGrid && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
            <button
              onClick={() => {
                if (onToggleRulers) onToggleRulers();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Mostrar Reglas Métricas</span>
              {showRulers && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
            <button
              onClick={() => {
                if (onToggleSnap) onToggleSnap();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Magnet className="w-3.5 h-3.5" /> Ajustar a Guías (Snap)
              </span>
              {snapToGrid && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
            <button
              onClick={() => {
                if (onToggleSafeAreas) onToggleSafeAreas();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Áreas Seguras de Difusión</span>
              {showSafeAreas && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
          </div>
        )}
      </div>

      {/* 7. VENTANA */}
      <div className="relative">
        <button onClick={() => toggleMenu('window')} className={menuButtonClass('window')}>
          Ventana
        </button>
        {openMenu === 'window' && (
          <div className="absolute top-full left-0 mt-0.5 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Espacios de Trabajo (Workspaces)
            </div>
            {allLayouts.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  if (onSelectLayout) onSelectLayout(l);
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span>{l.name}</span>
                {activeLayoutId === l.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            ))}

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Alternar Paneles
            </div>
            <button
              onClick={() => {
                if (onToggleToolbarVisible) onToggleToolbarVisible();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Barra de Herramientas</span>
              {toolbarVisible && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
            <button
              onClick={() => {
                if (onToggleInspectorVisible) onToggleInspectorVisible();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Inspector de Propiedades</span>
              {inspectorVisible && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
            <button
              onClick={() => {
                if (onToggleTimelineVisible) onToggleTimelineVisible();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Línea de Tiempo</span>
              {timelineVisible && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
          </div>
        )}
      </div>

      {/* 8. AYUDA */}
      <div className="relative">
        <button onClick={() => toggleMenu('help')} className={menuButtonClass('help')}>
          Ayuda
        </button>
        {openMenu === 'help' && (
          <div className="absolute top-full left-0 mt-0.5 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            {onOpenMcpModal && (
              <button
                onClick={() => {
                  onOpenMcpModal();
                  setOpenMenu(null);
                }}
                className={`${menuItemClass} text-purple-300 hover:bg-purple-600`}
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-purple-400" /> Servidor MCP (OpenCode / IA)...
                </span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded font-mono">
                  IA
                </span>
              </button>
            )}

            {onOpenLearningGuide && (
              <button
                onClick={() => {
                  onOpenLearningGuide('overview');
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Guía Completa de Uso...
                </span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenShortcutsModal();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5 text-indigo-400" /> Atajos de Teclado
              </span>
              <span className={shortcutBadge}>?</span>
            </button>

            {onStartInteractiveTour && (
              <button
                onClick={() => {
                  onStartInteractiveTour();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Tour Interactivo
                </span>
              </button>
            )}

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-2 text-[11px] text-zinc-400 bg-zinc-950/40">
              <div className="font-semibold text-zinc-200">VectorMotion Studio</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                HTML5 Motion Design &amp; Banner Suite v3.0
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
