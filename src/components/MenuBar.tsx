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

interface MenuBarProps {
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
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onAddLayer: (type: VectorLayer['type']) => void;
  onDuplicateLayer: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onReorderLayer: (layerId: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
  onApplyTransformAction: (action: 'center' | 'centerAnchor' | 'flipH' | 'flipV' | 'reset') => void;
  onApplyEffect: (effect: 'trim' | 'repeater' | 'wiggle' | 'glow' | 'invert') => void;
  onApplyEasingToSelected: (easing: EasingType) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetTime: () => void;
  viewportZoom: number;
  onSetViewportZoom: (z: number) => void;
  onResetViewport: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showRulers?: boolean;
  onToggleRulers?: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  showSafeAreas: boolean;
  onToggleSafeAreas: () => void;
  onionSkin: boolean;
  onToggleOnionSkin: () => void;
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
  viewportZoom,
  onSetViewportZoom,
  onResetViewport,
  showGrid,
  onToggleGrid,
  showRulers = true,
  onToggleRulers,
  snapToGrid,
  onToggleSnap,
  showSafeAreas,
  onToggleSafeAreas,
  onionSkin,
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
  inspectorPosition = 'right',
  onToggleInspectorPosition,
  toolbarPosition = 'left',
  onToggleToolbarPosition,
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
    `px-2.5 py-1 text-xs rounded transition-colors ${
      openMenu === menuName
        ? 'bg-zinc-800 text-white'
        : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
    }`;

  const menuItemClass =
    'w-full px-3 py-1.5 text-xs text-left text-zinc-300 hover:text-white hover:bg-blue-600 flex items-center justify-between group transition-colors cursor-pointer';

  const shortcutBadge = 'text-[10px] font-mono text-zinc-500 group-hover:text-blue-200 ml-4';

  return (
    <div
      ref={menuBarRef}
      className={
        className ||
        'h-7 bg-zinc-950 border-b border-zinc-850 px-2 flex items-center gap-0.5 select-none relative z-40 shrink-0 text-xs'
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

      {/* 1. FILE MENU (Archivo) */}
      <div className="relative">
        <button onClick={() => toggleMenu('file')} className={menuButtonClass('file')}>
          File
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
                <Plus className="w-3.5 h-3.5 text-blue-400" /> New Composition
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
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" /> Open Project JSON...
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
                <Save className="w-3.5 h-3.5 text-emerald-400" /> Save Project JSON
              </span>
              <span className={shortcutBadge}>Ctrl+S</span>
            </button>

            <button
              onClick={() => {
                fileInputRef.current?.click();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-indigo-400" /> Import Vector / SVG...
              </span>
            </button>

            {onOpenPsdModal && (
              <button
                onClick={() => {
                  onOpenPsdModal();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2 text-blue-300">
                  <FileImage className="w-3.5 h-3.5 text-blue-400" /> Importar Archivo PSD / Photoshop...
                </span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded font-mono">.PSD</span>
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
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Animation Templates...
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
              <span className="flex items-center gap-2 font-semibold text-blue-300 group-hover:text-white">
                <Zap className="w-3.5 h-3.5 text-blue-400" /> Export HTML5 Micro-Package
              </span>
              <span className={shortcutBadge}>Ctrl+E</span>
            </button>

            <button
              onClick={() => {
                onOpenCompSettings();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-zinc-400" /> Composition Settings...
              </span>
              <span className={shortcutBadge}>Ctrl+K</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. EDIT MENU (Edición) */}
      <div className="relative">
        <button onClick={() => toggleMenu('edit')} className={menuButtonClass('edit')}>
          Edit
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
              <span>Undo</span>
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
              <span>Redo</span>
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
              <span>Duplicate Layer</span>
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
              <span className="text-rose-400 group-hover:text-white">Delete Selected Layer</span>
              <span className={shortcutBadge}>Del</span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => {
                onSelectLayer(null);
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Deselect All</span>
              <span className={shortcutBadge}>Ctrl+Shift+A</span>
            </button>

            <button
              onClick={() => {
                onApplyTransformAction('reset');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Reset Transform to Default</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. COMPOSITION MENU (Composición / Image) */}
      <div className="relative">
        <button onClick={() => toggleMenu('comp')} className={menuButtonClass('comp')}>
          Composition
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
              <span className="font-semibold text-blue-400 group-hover:text-white">
                Composition Settings...
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
                <span className="flex items-center gap-2 font-semibold text-emerald-400 group-hover:text-white">
                  <Move className="w-3.5 h-3.5 text-emerald-400" /> Reframe Inteligente (Formatos Redes &amp; Ads)...
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-mono">Reframe</span>
              </button>
            )}

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500">
              Quick Resolution Presets
            </div>

            {[
              { label: '800 × 600 (Web Standard)', w: 800, h: 600 },
              { label: '1080 × 1080 (Square 1:1)', w: 1080, h: 1080 },
              { label: '1920 × 1080 (Full HD 16:9)', w: 1920, h: 1080 },
              { label: '600 × 600 (Badge / Icon)', w: 600, h: 600 },
              { label: '400 × 400 (Micro Loader)', w: 400, h: 400 },
            ].map((res) => (
              <button
                key={res.label}
                onClick={() => {
                  onUpdateComposition({ width: res.w, height: res.h });
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span>{res.label}</span>
                {composition.width === res.w && composition.height === res.h && (
                  <Check className="w-3 h-3 text-emerald-400" />
                )}
              </button>
            ))}

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500">
              Frame Rate (FPS)
            </div>

            {[60, 30, 24].map((fpsVal) => (
              <button
                key={fpsVal}
                onClick={() => {
                  onUpdateComposition({ fps: fpsVal });
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span>{fpsVal} FPS {fpsVal === 60 ? '(Silky Smooth)' : ''}</span>
                {composition.fps === fpsVal && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. LAYER MENU (Capas) */}
      <div className="relative">
        <button onClick={() => toggleMenu('layer')} className={menuButtonClass('layer')}>
          Layer
        </button>
        {openMenu === 'layer' && (
          <div className="absolute top-full left-0 mt-0.5 w-60 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500">
              New Shape Layer
            </div>

            <button
              onClick={() => {
                onAddLayer('rect');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Rectangle</span>
              <span className={shortcutBadge}>R</span>
            </button>

            <button
              onClick={() => {
                onAddLayer('circle');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Ellipse / Circle</span>
              <span className={shortcutBadge}>O</span>
            </button>

            <button
              onClick={() => {
                onAddLayer('star');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Star</span>
              <span className={shortcutBadge}>S</span>
            </button>

            <button
              onClick={() => {
                onAddLayer('polygon');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Polygon</span>
              <span className={shortcutBadge}>G</span>
            </button>

            <button
              onClick={() => {
                onAddLayer('path');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Custom Vector Path</span>
              <span className={shortcutBadge}>P</span>
            </button>

            <button
              onClick={() => {
                onAddLayer('text');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Text Layer</span>
              <span className={shortcutBadge}>T</span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500">
              Transform & Arrange
            </div>

            <button
              onClick={() => {
                onApplyTransformAction('center');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Center Layer on Canvas</span>
            </button>

            <button
              onClick={() => {
                onApplyTransformAction('centerAnchor');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Center Anchor Point in Layer</span>
              <span className={shortcutBadge}>Ctrl+Alt+Home</span>
            </button>

            <button
              onClick={() => {
                onApplyTransformAction('flipH');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Flip Horizontal</span>
            </button>

            <button
              onClick={() => {
                onApplyTransformAction('flipV');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Flip Vertical</span>
            </button>

            {onApplyFigmaAlign && (
              <>
                <div className="h-[1px] bg-zinc-800 my-1" />
                <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1.5">
                  <LayoutGrid className="w-3 h-3 text-blue-400" />
                  <span>Alinear y Distribuir</span>
                </div>
                <button
                  onClick={() => {
                    onApplyFigmaAlign('alignCenterH', true);
                    setOpenMenu(null);
                  }}
                  disabled={!selectedLayerId}
                  className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <span>Centrar en Lienzo (H)</span>
                </button>
                <button
                  onClick={() => {
                    onApplyFigmaAlign('alignCenterV', true);
                    setOpenMenu(null);
                  }}
                  disabled={!selectedLayerId}
                  className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <span>Centrar en Lienzo (V)</span>
                </button>
                <button
                  onClick={() => {
                    onApplyFigmaAlign('distributeSpacingH');
                    setOpenMenu(null);
                  }}
                  disabled={selectedLayerIds.length < 3}
                  className={`${menuItemClass} ${selectedLayerIds.length < 3 ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    <Columns className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Distribuir Espaciado H</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Proporcional</span>
                </button>
                <button
                  onClick={() => {
                    onApplyFigmaAlign('distributeSpacingV');
                    setOpenMenu(null);
                  }}
                  disabled={selectedLayerIds.length < 3}
                  className={`${menuItemClass} ${selectedLayerIds.length < 3 ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    <Rows className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Distribuir Espaciado V</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Proporcional</span>
                </button>
              </>
            )}

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500">
              Stack Order & Arrange
            </div>

            <button
              onClick={() => {
                if (selectedLayerId) onReorderLayer(selectedLayerId, 'front');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Bring to Front</span>
              <span className={shortcutBadge}>Ctrl+Shift+]</span>
            </button>

            <button
              onClick={() => {
                if (selectedLayerId) onReorderLayer(selectedLayerId, 'forward');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Bring Forward (Move Up)</span>
              <span className={shortcutBadge}>Ctrl+] / Alt+↑</span>
            </button>

            <button
              onClick={() => {
                if (selectedLayerId) onReorderLayer(selectedLayerId, 'backward');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Send Backward (Move Down)</span>
              <span className={shortcutBadge}>Ctrl+[ / Alt+↓</span>
            </button>

            <button
              onClick={() => {
                if (selectedLayerId) onReorderLayer(selectedLayerId, 'back');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Send to Back</span>
              <span className={shortcutBadge}>Ctrl+Shift+[</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. ANIMATION MENU (Animación / Keyframes) */}
      <div className="relative">
        <button onClick={() => toggleMenu('animation')} className={menuButtonClass('animation')}>
          Animation
        </button>
        {openMenu === 'animation' && (
          <div className="absolute top-full left-0 mt-0.5 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            {onToggleAutoKeyframe && (
              <>
                <button
                  onClick={() => {
                    onToggleAutoKeyframe();
                    setOpenMenu(null);
                  }}
                  className={`${menuItemClass} ${autoKeyframe ? 'text-rose-300 font-semibold bg-rose-500/10' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${autoKeyframe ? 'bg-rose-500 animate-ping' : 'bg-zinc-600'}`} />
                    <span>Auto-Keyframe (Grabar al editar)</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      autoKeyframe ? 'bg-rose-500/30 text-rose-200' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {autoKeyframe ? 'ON' : 'OFF'}
                  </span>
                </button>
                <div className="h-[1px] bg-zinc-800 my-1" />
              </>
            )}

            {onOpenMotionPresets && (
              <>
                <button
                  onClick={() => {
                    onOpenMotionPresets();
                    setOpenMenu(null);
                  }}
                  className={`${menuItemClass} text-amber-400 hover:text-amber-300 font-semibold`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Motion Presets (GSAP)</span>
                  </div>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">Pro</span>
                </button>
                <div className="h-[1px] bg-zinc-800 my-1" />
              </>
            )}

            {onAddKeyframe && (
              <>
                <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500">
                  Insertar Keyframe ({selectedLayerId ? 'Capa seleccionada' : 'Selecciona capa'})
                </div>

                <button
                  onClick={() => {
                    onAddKeyframe('rotation');
                    setOpenMenu(null);
                  }}
                  disabled={!selectedLayerId}
                  className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <span>Rotar (Rotation)</span>
                  <span className={shortcutBadge}>R</span>
                </button>

                <button
                  onClick={() => {
                    onAddKeyframe('scale');
                    setOpenMenu(null);
                  }}
                  disabled={!selectedLayerId}
                  className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <span>Estirar / Escala (Scale)</span>
                  <span className={shortcutBadge}>S</span>
                </button>

                <button
                  onClick={() => {
                    onAddKeyframe('opacity');
                    setOpenMenu(null);
                  }}
                  disabled={!selectedLayerId}
                  className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <span>Aparecer / Opacidad</span>
                  <span className={shortcutBadge}>T</span>
                </button>

                <button
                  onClick={() => {
                    onAddKeyframe('position');
                    setOpenMenu(null);
                  }}
                  disabled={!selectedLayerId}
                  className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <span>Posición (X, Y)</span>
                  <span className={shortcutBadge}>P</span>
                </button>

                <button
                  onClick={() => {
                    onAddKeyframe('all');
                    setOpenMenu(null);
                  }}
                  disabled={!selectedLayerId}
                  className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <span className="font-bold text-blue-400">Keyframe a Todo</span>
                  <span className={shortcutBadge}>F6</span>
                </button>

                {onOpenKeyframeGuide && (
                  <button
                    onClick={() => {
                      onOpenKeyframeGuide();
                      setOpenMenu(null);
                    }}
                    className={`${menuItemClass} text-amber-300 font-semibold`}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      Guía: Cómo colocar Keyframes
                    </span>
                    <span className={shortcutBadge}>Ayuda</span>
                  </button>
                )}

                <div className="h-[1px] bg-zinc-800 my-1" />
              </>
            )}

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500">
              Keyframe Assistant & Easing
            </div>

            <button
              onClick={() => {
                onApplyEasingToSelected('easeInOut');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="font-semibold text-blue-400 group-hover:text-white">
                Easy Ease
              </span>
              <span className={shortcutBadge}>F9</span>
            </button>

            <button
              onClick={() => {
                onApplyEasingToSelected('easeIn');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Easy Ease In</span>
              <span className={shortcutBadge}>Shift+F9</span>
            </button>

            <button
              onClick={() => {
                onApplyEasingToSelected('easeOut');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Easy Ease Out</span>
              <span className={shortcutBadge}>Ctrl+Shift+F9</span>
            </button>

            <button
              onClick={() => {
                onApplyEasingToSelected('bounce');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Elastic Bounce</span>
            </button>

            <button
              onClick={() => {
                onApplyEasingToSelected('linear');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Linear</span>
            </button>

            <button
              onClick={() => {
                onApplyEasingToSelected('hold');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Toggle Hold Keyframe</span>
              <span className={shortcutBadge}>Ctrl+Alt+H</span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => {
                onTogglePlay();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>{isPlaying ? 'Pause Animation' : 'Play Animation'}</span>
              <span className={shortcutBadge}>Space</span>
            </button>

            <button
              onClick={() => {
                onResetTime();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Go to Beginning (0.00s)</span>
              <span className={shortcutBadge}>Home</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. FILTER & EFFECTS MENU (Filtros / FX) - Accessible in Más */}
      <div className="relative hidden min-[1900px]:block">
        <button onClick={() => toggleMenu('filter')} className={menuButtonClass('filter')}>
          Filter & FX
        </button>
        {openMenu === 'filter' && (
          <div className="absolute top-full left-0 mt-0.5 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500">
              Shape Modifiers
            </div>

            <button
              onClick={() => {
                onApplyEffect('trim');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2 font-medium text-blue-300 group-hover:text-white">
                <Scissors className="w-3.5 h-3.5 text-blue-400" /> Animated Stroke Trim
              </span>
            </button>

            <button
              onClick={() => {
                onApplyEffect('repeater');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-indigo-400" /> Add Repeater (Clones Matrix)
              </span>
            </button>

            <button
              onClick={() => {
                onApplyEffect('wiggle');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Add Wiggle Expression
              </span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500">
              Stylize & Lighting
            </div>

            <button
              onClick={() => {
                onApplyEffect('glow');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Add Neon Glow & Ambient Aura
              </span>
            </button>

            <button
              onClick={() => {
                onApplyEffect('invert');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>Invert Fill & Stroke Colors</span>
            </button>
          </div>
        )}
      </div>

      {/* 7. VIEW MENU (Ver) - Accessible in Más */}
      <div className="relative hidden min-[1900px]:block">
        <button onClick={() => toggleMenu('view')} className={menuButtonClass('view')}>
          View
        </button>
        {openMenu === 'view' && (
          <div className="absolute top-full left-0 mt-0.5 w-60 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <button
              onClick={() => {
                onSetViewportZoom(Math.min(3.5, viewportZoom + 0.2));
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Zoom In</span>
              <span className={shortcutBadge}>Ctrl++</span>
            </button>

            <button
              onClick={() => {
                onSetViewportZoom(Math.max(0.2, viewportZoom - 0.2));
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Zoom Out</span>
              <span className={shortcutBadge}>Ctrl+-</span>
            </button>

            <button
              onClick={() => {
                onResetViewport();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Fit to Screen (100%)</span>
              <span className={shortcutBadge}>Shift+0</span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <button
              onClick={() => {
                onToggleGrid();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Show Pixel Grid</span>
              {showGrid && <Check className="w-3 h-3 text-blue-400" />}
            </button>

            <button
              onClick={() => {
                if (onToggleRulers) onToggleRulers();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Show Rulers & Guides</span>
              <div className="flex items-center gap-1.5">
                <span className={shortcutBadge}>Shift+R</span>
                {showRulers && <Check className="w-3 h-3 text-cyan-400" />}
              </div>
            </button>

            <button
              onClick={() => {
                onToggleSnap();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Snap to Grid</span>
              {snapToGrid && <Check className="w-3 h-3 text-indigo-400" />}
            </button>

            <button
              onClick={() => {
                onToggleSafeAreas();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Show Safe Area Guides</span>
              {showSafeAreas && <Check className="w-3 h-3 text-blue-400" />}
            </button>

            <button
              onClick={() => {
                onToggleOnionSkin();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Onion Skinning Ghost</span>
              {onionSkin && <Check className="w-3 h-3 text-amber-400" />}
            </button>
          </div>
        )}
      </div>

      {/* 8. GUÍAS & APRENDIZAJE MENU (Interactive Learning Guides) - Hidden on standard screens */}
      <div className="relative hidden min-[1900px]:block">
        <button
          onClick={() => toggleMenu('guides')}
          className={`${menuButtonClass('guides')} font-semibold text-blue-300 hover:text-white flex items-center gap-1`}
        >
          <BookOpen className="w-3 h-3 text-blue-400" />
          <span>Guías</span>
        </button>
        {openMenu === 'guides' && (
          <div className="absolute top-full left-0 mt-0.5 w-72 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            {/* Master Guide Portal */}
            <button
              onClick={() => {
                if (onOpenLearningGuide) onOpenLearningGuide('overview');
                setOpenMenu(null);
              }}
              className={`${menuItemClass} bg-blue-950/40 text-blue-200 hover:bg-blue-900/60 font-semibold`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Centro de Aprendizaje Interactivo
              </span>
              <span className={shortcutBadge}>Academy</span>
            </button>

            {/* Interactive Workspace Tour */}
            {onStartInteractiveTour && (
              <button
                onClick={() => {
                  onStartInteractiveTour();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2 text-indigo-300">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" /> Tour Guiado por la Interfaz
                </span>
                <span className={shortcutBadge}>Paso a paso</span>
              </button>
            )}

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-semibold">
              Guías Específicas por Tema
            </div>

            {/* 1. Keyframes & Timeline */}
            <button
              onClick={() => {
                if (onOpenLearningGuide) onOpenLearningGuide('keyframes');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Diamond className="w-3.5 h-3.5 text-amber-400" /> 1. Keyframes y Línea de Tiempo (GWD)
              </span>
            </button>

            {/* 2. Curves & Easing */}
            <button
              onClick={() => {
                if (onOpenLearningGuide) onOpenLearningGuide('curves_easing');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> 2. Curvas Bézier y Graph Editor
              </span>
            </button>

            {/* 3. Shapes & Pen Tool */}
            <button
              onClick={() => {
                if (onOpenLearningGuide) onOpenLearningGuide('shapes_vector');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5 text-indigo-400" /> 3. Formas y Pluma Bézier
              </span>
            </button>

            {/* 4. Styles & Trim Paths */}
            <button
              onClick={() => {
                if (onOpenLearningGuide) onOpenLearningGuide('styles_trim');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-pink-400" /> 4. Estilos y Trim Paths (Trazos)
              </span>
            </button>

            {/* 5. Modifiers Repeater & Wiggle */}
            <button
              onClick={() => {
                if (onOpenLearningGuide) onOpenLearningGuide('modifiers_fx');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-cyan-400" /> 5. Modificadores (Repeater & Wiggle)
              </span>
            </button>

            {/* 6. Motion Presets */}
            <button
              onClick={() => {
                if (onOpenLearningGuide) onOpenLearningGuide('presets_motion');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> 6. Presets de Movimiento GSAP
              </span>
            </button>

            {/* 7. HTML5 Micro-package */}
            <button
              onClick={() => {
                if (onOpenLearningGuide) onOpenLearningGuide('export_html5');
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <FileCode2 className="w-3.5 h-3.5 text-orange-400" /> 7. Exportación HTML5 (&lt;4KB)
              </span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            {/* Shortcuts */}
            <button
              onClick={() => {
                onOpenShortcutsModal();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5 text-zinc-400" /> Atajos de Teclado Profesionales
              </span>
              <span className={shortcutBadge}>?</span>
            </button>
          </div>
        )}
      </div>

      {/* 9. VENTANA / ESPACIOS DE TRABAJO (Workspace Layouts & Focus Modes) - Hidden on standard screens */}
      <div className="relative hidden min-[1900px]:block">
        <button
          onClick={() => toggleMenu('window')}
          className={`${menuButtonClass('window')} flex items-center gap-1`}
        >
          <Layout className="w-3 h-3 text-indigo-400" />
          <span>Ventana</span>
        </button>
        {openMenu === 'window' && (
          <div className="absolute top-full left-0 mt-0.5 w-72 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Modos de Enfoque Creativo
            </div>

            {/* List all workspaces */}
            {allLayouts.map((layout) => {
              const isActive = activeLayoutId === layout.id;
              return (
                <button
                  key={layout.id}
                  onClick={() => {
                    if (onSelectLayout) onSelectLayout(layout);
                    setOpenMenu(null);
                  }}
                  className={menuItemClass}
                >
                  <span className="flex items-center gap-2 truncate">
                    {isActive ? (
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 shrink-0" />
                    )}
                    <span className={isActive ? 'font-bold text-blue-300' : 'text-zinc-300'}>
                      {layout.name}
                    </span>
                  </span>
                  {layout.shortcut && <span className={shortcutBadge}>{layout.shortcut}</span>}
                </button>
              );
            })}

            <div className="h-[1px] bg-zinc-800 my-1" />

            {/* Save Current Layout */}
            {onQuickSaveWorkspace && (
              <button
                onClick={() => {
                  onQuickSaveWorkspace();
                  setOpenMenu(null);
                }}
                className={`${menuItemClass} text-blue-300 font-semibold`}
              >
                <span className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-blue-400" /> Guardar Espacio Actual...
                </span>
              </button>
            )}

            {/* Manage Workspaces */}
            {onOpenWorkspaceManager && (
              <button
                onClick={() => {
                  onOpenWorkspaceManager();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5 text-indigo-400" /> Gestionar Espacios de Trabajo...
                </span>
                <span className={shortcutBadge}>Shift+W</span>
              </button>
            )}

            {/* Reset to default */}
            {onResetDefaultWorkspace && (
              <button
                onClick={() => {
                  onResetDefaultWorkspace();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2 text-zinc-400">
                  <RotateCw className="w-3.5 h-3.5 text-zinc-500" /> Restablecer Diseño Estándar
                </span>
              </button>
            )}

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Visibilidad de Paneles
            </div>

            {/* Toggle Toolbar */}
            {onToggleToolbarVisible && (
              <button
                onClick={() => {
                  onToggleToolbarVisible();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2">
                  {toolbarVisible ? (
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <span className="w-3.5" />
                  )}
                  Barra de Herramientas
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">({toolbarPosition})</span>
              </button>
            )}

            {/* Toggle Inspector */}
            {onToggleInspectorVisible && (
              <button
                onClick={() => {
                  onToggleInspectorVisible();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2">
                  {inspectorVisible ? (
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <span className="w-3.5" />
                  )}
                  Inspector de Propiedades
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">({inspectorPosition})</span>
              </button>
            )}

            {/* Toggle Timeline */}
            {onToggleTimelineVisible && (
              <button
                onClick={() => {
                  onToggleTimelineVisible();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2">
                  {timelineVisible ? (
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <span className="w-3.5" />
                  )}
                  Línea de Tiempo & Keyframes
                </span>
              </button>
            )}

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Posicionamiento de Paneles
            </div>

            {onToggleInspectorPosition && (
              <button
                onClick={() => {
                  onToggleInspectorPosition();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2">
                  <Columns className="w-3.5 h-3.5 text-zinc-400" />
                  Inspector a la {inspectorPosition === 'right' ? 'Izquierda' : 'Derecha'}
                </span>
              </button>
            )}

            {onToggleToolbarPosition && (
              <button
                onClick={() => {
                  onToggleToolbarPosition();
                  setOpenMenu(null);
                }}
                className={menuItemClass}
              >
                <span className="flex items-center gap-2">
                  <Columns className="w-3.5 h-3.5 text-zinc-400" />
                  Herramientas a la {toolbarPosition === 'left' ? 'Derecha' : 'Izquierda'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 10. SETTINGS & HELP MENU (Ajustes) - Hidden on standard screens */}
      <div className="relative hidden min-[1900px]:block">
        <button onClick={() => toggleMenu('settings')} className={menuButtonClass('settings')}>
          Settings
        </button>
        {openMenu === 'settings' && (
          <div className="absolute top-full left-0 mt-0.5 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
            <button
              onClick={() => {
                onOpenCompSettings();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-blue-400" /> Composition Settings
              </span>
              <span className={shortcutBadge}>Ctrl+K</span>
            </button>

            <button
              onClick={() => {
                onOpenShortcutsModal();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5 text-indigo-400" /> Keyboard Shortcuts
              </span>
              <span className={shortcutBadge}>?</span>
            </button>

            <button
              onClick={() => {
                if (onOpenLearningGuide) onOpenLearningGuide('keyframes');
                setOpenMenu(null);
              }}
              className={`${menuItemClass} text-amber-300`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Guía Completa de Uso
              </span>
              <span className={shortcutBadge}>Academy</span>
            </button>

            <button
              onClick={() => {
                onOpenExportModal();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Engine Benchmarks (&lt;4KB)
              </span>
            </button>

            {onOpenMcpModal && (
              <button
                onClick={() => {
                  onOpenMcpModal();
                  setOpenMenu(null);
                }}
                className={`${menuItemClass} text-purple-300 hover:bg-purple-600`}
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-purple-400" /> Servidor MCP (OpenCode / IA)
                </span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono px-1 py-0.5 rounded">MCP</span>
              </button>
            )}

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-2 text-[11px] text-zinc-400 bg-zinc-950/40">
              <div className="font-semibold text-zinc-200">VectorMotion Studio</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Lightweight HTML5 Vector Animation v2.4
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 11. ADAPTIVE OVERFLOW "MÁS / MORE ▾" MENU */}
      <div className="relative min-[1900px]:hidden">
        <button
          onClick={() => toggleMenu('more')}
          className={`${menuButtonClass('more')} font-semibold text-zinc-300 hover:text-white flex items-center gap-1`}
        >
          <span>Más</span>
          <span className="text-[9px] text-zinc-500">▾</span>
        </button>
        {openMenu === 'more' && (
          <div className="absolute top-full left-0 mt-0.5 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Efectos y Modificadores
            </div>
            <button
              onClick={() => {
                onApplyEffect('trim');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2 text-blue-300">
                <Scissors className="w-3.5 h-3.5 text-blue-400" /> Trim Paths (Animar trazo)
              </span>
            </button>
            <button
              onClick={() => {
                onApplyEffect('repeater');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-indigo-400" /> Repeater (Matriz de clones)
              </span>
            </button>
            <button
              onClick={() => {
                onApplyEffect('wiggle');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Wiggle (Vibración)
              </span>
            </button>
            <button
              onClick={() => {
                onApplyEffect('glow');
                setOpenMenu(null);
              }}
              disabled={!selectedLayerId}
              className={`${menuItemClass} ${!selectedLayerId ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Neon Glow / Resplandor
              </span>
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Vista y Guías
            </div>
            <button
              onClick={() => {
                onToggleGrid();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Cuadrícula Pixel</span>
              {showGrid && <Check className="w-3 h-3 text-blue-400" />}
            </button>
            <button
              onClick={() => {
                if (onToggleRulers) onToggleRulers();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Reglas y Guías</span>
              <div className="flex items-center gap-1.5">
                <span className={shortcutBadge}>Shift+R</span>
                {showRulers && <Check className="w-3 h-3 text-cyan-400" />}
              </div>
            </button>
            <button
              onClick={() => {
                onToggleSnap();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Ajuste a Cuadrícula (Snap)</span>
              {snapToGrid && <Check className="w-3 h-3 text-indigo-400" />}
            </button>
            <button
              onClick={() => {
                onToggleSafeAreas();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Zonas Seguras (Safe Areas)</span>
              {showSafeAreas && <Check className="w-3 h-3 text-blue-400" />}
            </button>
            <button
              onClick={() => {
                onToggleOnionSkin();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span>Papel Cebolla (Onion Skin)</span>
              {onionSkin && <Check className="w-3 h-3 text-amber-400" />}
            </button>

            <div className="h-[1px] bg-zinc-800 my-1" />

            <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
              Configuración y Ayuda
            </div>
            <button
              onClick={() => {
                onOpenCompSettings();
                setOpenMenu(null);
              }}
              className={menuItemClass}
            >
              <span className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-blue-400" /> Ajustes del Banner...
              </span>
            </button>
            <button
              onClick={() => {
                if (onOpenLearningGuide) onOpenLearningGuide('overview');
                setOpenMenu(null);
              }}
              className={`${menuItemClass} text-amber-300`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Guías y Tutoriales
              </span>
            </button>
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
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
