import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Edit2,
  FileCode2,
  FileImage,
  Radio,
  Download,
  Layout,
  Columns,
  Rows,
  RotateCw,
  Move,
  MousePointer,
  Hand,
  Square,
  Circle,
  Star,
  Hexagon,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Grid,
  Magnet,
  Camera,
  Play,
  Pause,
  RotateCcw,
  Bot,
  Layers,
  ChevronDown,
  Check,
  Undo2,
  Redo2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Composition, VectorLayer, EasingType, WorkspaceLayout, ToolType } from '../types';
import { MenuBar } from './MenuBar';
import { realtimeSync, ConnectionStatus } from '../utils/realtimeSync';
import { FigmaAlignAction } from '../utils/figmaTools';

interface TopNavProps {
  composition: Composition;
  onUpdateComposition: (updated: Partial<Composition>) => void;
  onNewBlankComposition: () => void;
  onOpenProjectJson: () => void;
  onSaveProjectJson: () => void;
  onImportSvg: (svgString: string) => void;
  onOpenPsdModal?: () => void;
  onOpenExportModal: () => void;
  onOpenPresetModal: () => void;
  onOpenCompSettings: () => void;
  onOpenShortcutsModal: () => void;
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
  currentTime?: number;
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
  onOpenLearningGuide?: (section?: any) => void;
  onStartInteractiveTour?: () => void;
  onOpenRealtimeModal?: () => void;
  onOpenCommandPalette?: () => void;
  activeLayoutId?: string;
  activeWorkspaceLayout?: WorkspaceLayout;
  allWorkspaceLayouts?: WorkspaceLayout[];
  onSelectWorkspaceLayout?: (layout: WorkspaceLayout) => void;
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
  onOpenReframeModal?: () => void;
  onApplyFigmaAlign?: (action: FigmaAlignAction, alignToCanvas?: boolean) => void;
  onOpenMcpModal?: () => void;
  activeTool?: ToolType;
  onSelectTool?: (tool: ToolType) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
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
  onOpenMcpModal,
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
  isPlaying = false,
  onTogglePlay,
  onResetTime,
  currentTime = 0,
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
  onOpenRealtimeModal,
  onOpenCommandPalette,
  activeLayoutId = 'layout_default',
  activeWorkspaceLayout,
  allWorkspaceLayouts = [],
  onSelectWorkspaceLayout,
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
  activeTool = 'select',
  onSelectTool,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(composition.name);
  const [syncStatus, setSyncStatus] = useState<ConnectionStatus>(realtimeSync.status);
  const [isZoomDropdownOpen, setIsZoomDropdownOpen] = useState(false);
  const zoomDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return realtimeSync.onStatusChange((s) => setSyncStatus(s));
  }, []);

  useEffect(() => {
    setNameInput(composition.name);
  }, [composition.name]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (zoomDropdownRef.current && !zoomDropdownRef.current.contains(e.target as Node)) {
        setIsZoomDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateComposition({ name: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * composition.fps);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  return (
    <header className="flex flex-col w-full select-none shrink-0 z-30 bg-zinc-950 border-b border-zinc-800">
      {/* TIER 1: GLOBAL STUDIO MENU STRIP (32px) */}
      <div className="h-8 px-2.5 flex items-center justify-between gap-3 border-b border-zinc-850/80 bg-zinc-950 text-xs">
        {/* Left: Brand + Project Title + MenuBar */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0 pr-1">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center shadow-xs">
              <Film className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-zinc-100 tracking-tight hidden sm:inline">
              VectorMotion
            </span>
          </div>

          <div className="w-[1px] h-3.5 bg-zinc-800 shrink-0" />

          {/* Inline Project Rename */}
          {isEditingName ? (
            <form onSubmit={handleNameSubmit} className="flex items-center">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSubmit}
                autoFocus
                className="bg-zinc-900 border border-blue-500 text-zinc-100 px-1.5 py-0.5 rounded text-xs focus:outline-none w-32 font-medium"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setNameInput(composition.name);
                setIsEditingName(true);
              }}
              title="Clic para renombrar proyecto"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 px-1 py-0.5 rounded hover:bg-zinc-850 transition-colors max-w-[140px] truncate cursor-pointer font-medium"
            >
              <span className="truncate">{composition.name}</span>
              <Edit2 className="w-2.5 h-2.5 text-zinc-500 hover:text-zinc-300" />
            </button>
          )}

          <div className="w-[1px] h-3.5 bg-zinc-800 shrink-0 hidden md:block" />

          {/* Studio Standard Menus (8 standard categories) */}
          <MenuBar
            className="hidden md:flex items-center gap-0.5 select-none relative z-40 text-xs"
            composition={composition}
            onUpdateComposition={onUpdateComposition}
            onNewBlankComposition={onNewBlankComposition}
            onOpenProjectJson={onOpenProjectJson}
            onSaveProjectJson={onSaveProjectJson}
            onImportSvg={onImportSvg}
            onOpenPsdModal={onOpenPsdModal}
            onOpenExportModal={onOpenExportModal}
            onOpenPresetModal={onOpenPresetModal}
            onOpenCompSettings={onOpenCompSettings}
            onOpenShortcutsModal={onOpenShortcutsModal}
            onOpenReframeModal={onOpenReframeModal}
            onOpenMcpModal={onOpenMcpModal}
            onApplyFigmaAlign={onApplyFigmaAlign}
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            selectedLayerIds={selectedLayerIds}
            onSelectLayer={onSelectLayer}
            onAddLayer={onAddLayer}
            onDuplicateLayer={onDuplicateLayer}
            onDeleteLayer={onDeleteLayer}
            onReorderLayer={onReorderLayer}
            onApplyTransformAction={onApplyTransformAction}
            onApplyEffect={onApplyEffect}
            onApplyEasingToSelected={onApplyEasingToSelected}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            onResetTime={onResetTime}
            viewportZoom={viewportZoom}
            onSetViewportZoom={onSetViewportZoom}
            onResetViewport={onResetViewport}
            showGrid={showGrid}
            onToggleGrid={onToggleGrid}
            showRulers={showRulers}
            onToggleRulers={onToggleRulers}
            snapToGrid={snapToGrid}
            onToggleSnap={onToggleSnap}
            showSafeAreas={showSafeAreas}
            onToggleSafeAreas={onToggleSafeAreas}
            onionSkin={onionSkin}
            onToggleOnionSkin={onToggleOnionSkin}
            autoKeyframe={autoKeyframe}
            onToggleAutoKeyframe={onToggleAutoKeyframe}
            onOpenMotionPresets={onOpenMotionPresets}
            onAddKeyframe={onAddKeyframe}
            onOpenKeyframeGuide={onOpenKeyframeGuide}
            onOpenLearningGuide={onOpenLearningGuide}
            onStartInteractiveTour={onStartInteractiveTour}
            activeLayoutId={activeLayoutId}
            allLayouts={allWorkspaceLayouts}
            onSelectLayout={onSelectWorkspaceLayout}
            onOpenWorkspaceManager={onOpenWorkspaceManager}
            onQuickSaveWorkspace={onQuickSaveWorkspace}
            onResetDefaultWorkspace={onResetDefaultWorkspace}
            toolbarVisible={toolbarVisible}
            onToggleToolbarVisible={onToggleToolbarVisible}
            inspectorVisible={inspectorVisible}
            onToggleInspectorVisible={onToggleInspectorVisible}
            timelineVisible={timelineVisible}
            onToggleTimelineVisible={onToggleTimelineVisible}
            inspectorPosition={inspectorPosition}
            onToggleInspectorPosition={onToggleInspectorPosition}
            toolbarPosition={toolbarPosition}
            onToggleToolbarPosition={onToggleToolbarPosition}
          />
        </div>

        {/* Center: Workspace Panels Toggle Icons (Toolbar, Timeline, Inspector) */}
        <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
          {onToggleToolbarVisible && (
            <button
              onClick={onToggleToolbarVisible}
              title={`Barra de Herramientas (${toolbarVisible ? 'Visible' : 'Oculta'})`}
              className={`p-1 rounded transition-colors cursor-pointer ${
                toolbarVisible ? 'bg-zinc-800 text-blue-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          )}
          {onToggleTimelineVisible && (
            <button
              onClick={onToggleTimelineVisible}
              title={`Línea de Tiempo (${timelineVisible ? 'Visible' : 'Oculta'})`}
              className={`p-1 rounded transition-colors cursor-pointer ${
                timelineVisible ? 'bg-zinc-800 text-blue-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
          )}
          {onToggleInspectorVisible && (
            <button
              onClick={onToggleInspectorVisible}
              title={`Inspector de Propiedades (${inspectorVisible ? 'Visible' : 'Oculto'})`}
              className={`p-1 rounded transition-colors cursor-pointer ${
                inspectorVisible ? 'bg-zinc-800 text-blue-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Reframe + Undo/Redo + Export CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Dimensions Reframe */}
          {onOpenReframeModal && (
            <button
              onClick={onOpenReframeModal}
              title={`Dimensiones activas: ${composition.width} × ${composition.height} px (Clic para reframe)`}
              className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              <Move className="w-2.5 h-2.5 text-zinc-400" />
              <span>{composition.width}×{composition.height}</span>
            </button>
          )}

          {/* Quick Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Deshacer (Ctrl+Z)"
              className={`p-1 rounded transition-colors cursor-pointer ${
                canUndo ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Rehacer (Ctrl+Y)"
              className={`p-1 rounded transition-colors cursor-pointer ${
                canRedo ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Export CTA */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* TIER 2: UNIFIED CONTEXT RIBBON & TOOLS STRIP (38px) */}
      <div className="h-9.5 px-2 bg-zinc-925 flex items-center justify-between gap-3 text-xs overflow-x-auto custom-scrollbar select-none">
        {/* Left Section: Creation & Selection Tools */}
        <div className="flex items-center gap-1 shrink-0">
          {onSelectTool && (
            <>
              <button
                onClick={() => onSelectTool('select')}
                title="Herramienta Selección (V)"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  activeTool === 'select'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850'
                }`}
              >
                <MousePointer className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSelectTool('hand')}
                title="Herramienta Mano / Desplazar Lienzo (H)"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  activeTool === 'hand'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850'
                }`}
              >
                <Hand className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-3.5 bg-zinc-800 mx-0.5" />
            </>
          )}

          {/* Layer Creation Quick Buttons */}
          <button
            onClick={() => onAddLayer('text')}
            title="Añadir Capa de Texto (T)"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 rounded transition-colors cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-blue-400" />
          </button>
          <button
            onClick={() => onAddLayer('rect')}
            title="Añadir Rectángulo (R)"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 rounded transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button
            onClick={() => onAddLayer('circle')}
            title="Añadir Círculo (O)"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 rounded transition-colors cursor-pointer"
          >
            <Circle className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            onClick={() => onAddLayer('star')}
            title="Añadir Estrella (S)"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 rounded transition-colors cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 text-purple-400" />
          </button>
          <button
            onClick={() => onAddLayer('polygon')}
            title="Añadir Polígono (P)"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 rounded transition-colors cursor-pointer"
          >
            <Hexagon className="w-3.5 h-3.5 text-pink-400" />
          </button>

          <div className="w-[1px] h-3.5 bg-zinc-800 mx-0.5" />

          {/* Align Helpers */}
          {onApplyFigmaAlign && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onApplyFigmaAlign('alignLeft', true)}
                title="Alinear al borde izquierdo"
                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 rounded cursor-pointer"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onApplyFigmaAlign('alignCenterH', true)}
                title="Centrar horizontalmente"
                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 rounded cursor-pointer"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onApplyFigmaAlign('alignRight', true)}
                title="Alinear al borde derecho"
                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 rounded cursor-pointer"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="w-[1px] h-3.5 bg-zinc-800 mx-0.5" />

          {/* Grid, Snap & Rulers */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onToggleGrid}
              title={`Cuadrícula (${showGrid ? 'Activa' : 'Oculta'})`}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                showGrid ? 'text-blue-400 bg-blue-950/40' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleSnap}
              title={`Imán / Snap a guías (${snapToGrid ? 'Activo' : 'Inactivo'})`}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                snapToGrid ? 'text-blue-400 bg-blue-950/40' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Magnet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleSafeAreas}
              title={`Áreas seguras (${showSafeAreas ? 'Activas' : 'Inactivas'})`}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                showSafeAreas ? 'text-blue-400 bg-blue-950/40' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Section: Viewport Zoom */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative" ref={zoomDropdownRef}>
            <button
              onClick={() => setIsZoomDropdownOpen(!isZoomDropdownOpen)}
              title="Ajustar zoom del monitor"
              className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-xs"
            >
              <span className="font-mono">{Math.round(viewportZoom * 100)}%</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {isZoomDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl py-1 z-50 text-xs">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((z) => (
                  <button
                    key={z}
                    onClick={() => {
                      if (onSetViewportZoom) onSetViewportZoom(z);
                      setIsZoomDropdownOpen(false);
                    }}
                    className="w-full px-3 py-1 text-left text-zinc-300 hover:text-white hover:bg-blue-600 flex items-center justify-between cursor-pointer"
                  >
                    <span>{z * 100}%</span>
                    {Math.abs(viewportZoom - z) < 0.05 && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
                <div className="h-[1px] bg-zinc-800 my-1" />
                <button
                  onClick={() => {
                    if (onResetViewport) onResetViewport();
                    setIsZoomDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1 text-left text-blue-400 hover:text-white hover:bg-blue-600 cursor-pointer"
                >
                  Ajustar a Pantalla
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
