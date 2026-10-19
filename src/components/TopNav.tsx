import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  SlidersHorizontal,
  Edit2,
  FileCode2,
  BookOpen,
  Layers,
  FileImage,
  Radio,
  CheckCircle2,
  Search,
  DownloadCloud,
  Layout,
  ChevronDown,
  Save,
  Check,
  RotateCw,
  Columns,
  Rows,
  Plus,
  Undo2,
  Redo2,
  Move,
} from 'lucide-react';
import { Composition, VectorLayer, EasingType, WorkspaceLayout } from '../types';
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
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(composition.name);
  const [syncStatus, setSyncStatus] = useState<ConnectionStatus>(realtimeSync.status);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return realtimeSync.onStatusChange((s) => setSyncStatus(s));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(e.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      onUpdateComposition({ name: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  const currentLayoutName = activeWorkspaceLayout?.name || 'Estudio Completo';

  return (
    <header className="h-10 px-3 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between select-none z-30 shrink-0">
      {/* LEFT: LOGO ICON ONLY + EDITABLE FILE NAME + SAVED STATE */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Brand Logo (Icon Only) */}
        <div
          title="VectorMotion Studio"
          className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center shadow-xs shrink-0 cursor-default"
        >
          <Film className="w-3 h-3 text-white" />
        </div>

        <div className="w-[1px] h-3.5 bg-zinc-800 shrink-0" />

        {/* Project Name (Editable) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isEditingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              autoFocus
              className="bg-zinc-900 text-zinc-100 text-xs px-2 py-0.5 rounded border border-blue-500 outline-none font-medium max-w-[150px]"
            />
          ) : (
            <button
              onClick={() => {
                setNameInput(composition.name);
                setIsEditingName(true);
              }}
              title="Haz clic para renombrar el proyecto"
              className="group flex items-center gap-1 text-xs font-semibold text-zinc-200 hover:text-white px-1.5 py-0.5 rounded hover:bg-zinc-850 transition-colors max-w-[160px] truncate cursor-pointer"
            >
              <span className="truncate">{composition.name}</span>
              <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-70 text-zinc-400" />
            </button>
          )}

          {/* Saved Status Indicator */}
          <div
            className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono select-none pl-1"
            title="Cambios guardados localmente de forma automática"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            <span className="hidden md:inline">Guardado</span>
          </div>

          {/* Quick Reframe Dimensions Pill */}
          {onOpenReframeModal && (
            <button
              type="button"
              onClick={onOpenReframeModal}
              title={`Reframe inteligente: ${composition.width} × ${composition.height}px (Clic para adaptar a Story, Post, YouTube, etc.)`}
              className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 px-2 py-0.5 rounded-md transition-colors cursor-pointer shadow-xs ml-1"
            >
              <Move className="w-2.5 h-2.5 text-emerald-400" />
              <span>{composition.width}×{composition.height}</span>
              <span className="text-[9px] text-emerald-400 opacity-80">Reframe</span>
            </button>
          )}
        </div>

        <div className="w-[1px] h-3.5 bg-zinc-800 shrink-0 hidden md:block" />

        {/* CENTER: DESKTOP CONDENSED MENUBAR */}
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

      {/* RIGHT: WORKSPACE SWITCHER + QUICK PANEL TOGGLES + UTILITIES + EXPORT */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* QUICK UNDO / REDO BUTTONS */}
        <div className="flex items-center gap-0.5 bg-zinc-900/90 border border-zinc-800 p-0.5 rounded-lg">
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
            title="Rehacer (Ctrl+Y o Ctrl+Shift+Z)"
            className={`p-1 rounded transition-colors cursor-pointer ${
              canRedo ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 opacity-40 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* WORKSPACE & FOCUS MODE DROPDOWN SELECTOR */}
        <div className="relative" ref={workspaceDropdownRef}>
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            title="Cambiar Modo de Enfoque Creativo / Espacio de Trabajo"
            className="flex items-center gap-1.5 text-[11px] text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 px-2 py-1 rounded transition-all font-medium cursor-pointer shadow-xs"
          >
            <Layout className="w-3 h-3 text-indigo-400" />
            <span className="hidden md:inline font-semibold max-w-[130px] truncate text-indigo-200">
              {currentLayoutName}
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-zinc-900 border border-zinc-750 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold flex items-center justify-between">
                <span>Modos de Enfoque</span>
                <span className="text-zinc-500">Atajo</span>
              </div>

              {allWorkspaceLayouts.map((l) => {
                const isActive = activeLayoutId === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      if (onSelectWorkspaceLayout) onSelectWorkspaceLayout(l);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-300 font-bold'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {isActive ? (
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      ) : (
                        <span className="w-3.5 shrink-0" />
                      )}
                      <span className="truncate">{l.name}</span>
                    </span>
                    {l.shortcut && (
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {l.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="h-[1px] bg-zinc-800 my-1" />

              {/* Quick Save Current Workspace */}
              {onQuickSaveWorkspace && (
                <button
                  onClick={() => {
                    onQuickSaveWorkspace();
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-blue-300 hover:bg-blue-950/40 hover:text-blue-200 transition-colors font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-blue-400" />
                  <span>Guardar diseño actual...</span>
                </button>
              )}

              {/* Open Manager */}
              {onOpenWorkspaceManager && (
                <button
                  onClick={() => {
                    onOpenWorkspaceManager();
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Layout className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Gestionar espacios...</span>
                  </span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                    Shift+W
                  </span>
                </button>
              )}

              {/* Reset to standard layout */}
              {onResetDefaultWorkspace && (
                <button
                  onClick={() => {
                    onResetDefaultWorkspace();
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Restablecer estándar</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* QUICK PANEL TOGGLES PILL (Toolbar, Timeline, Inspector) */}
        <div className="hidden lg:flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg gap-0.5">
          {onToggleToolbarVisible && (
            <button
              onClick={onToggleToolbarVisible}
              title={`Barra de herramientas (${toolbarVisible ? 'Visible' : 'Oculta'})`}
              className={`p-1 rounded transition-colors cursor-pointer ${
                toolbarVisible ? 'bg-zinc-800 text-blue-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Columns className="w-3 h-3" />
            </button>
          )}

          {onToggleTimelineVisible && (
            <button
              onClick={onToggleTimelineVisible}
              title={`Línea de tiempo (${timelineVisible ? 'Visible' : 'Oculta'})`}
              className={`p-1 rounded transition-colors cursor-pointer ${
                timelineVisible ? 'bg-zinc-800 text-blue-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Rows className="w-3 h-3" />
            </button>
          )}

          {onToggleInspectorVisible && (
            <button
              onClick={onToggleInspectorVisible}
              title={`Inspector de propiedades (${inspectorVisible ? 'Visible' : 'Oculto'})`}
              className={`p-1 rounded transition-colors cursor-pointer ${
                inspectorVisible ? 'bg-zinc-800 text-blue-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Layout className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Primary Accent: Export HTML5 Action */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-2.5 sm:px-3 py-1 rounded shadow-sm shadow-blue-600/30 transition-all cursor-pointer shrink-0"
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export HTML5</span>
          <span className="sm:hidden">Export</span>
        </button>

        {/* Secondary: Import PSD Button (Desktop) */}
        {onOpenPsdModal && (
          <button
            onClick={onOpenPsdModal}
            title="Importar capas desde archivo Photoshop (.psd / .psb)"
            className="hidden 2xl:flex items-center gap-1.5 text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded transition-all cursor-pointer hover:text-white shrink-0"
          >
            <FileImage className="w-3 h-3 text-blue-400" />
            <span>Importar PSD</span>
            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.2 rounded font-mono font-bold">
              .PSD
            </span>
          </button>
        )}

        {/* Templates Modal Trigger (Desktop) */}
        <button
          onClick={onOpenPresetModal}
          title="Ver Plantillas de Animación"
          className="hidden 2xl:flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-1 rounded transition-colors font-medium cursor-pointer shrink-0"
        >
          <Layers className="w-3 h-3 text-indigo-400" />
          <span>Plantillas</span>
        </button>

        {/* Guides Quick Trigger (Desktop) */}
        {onOpenLearningGuide && (
          <button
            onClick={() => onOpenLearningGuide('overview')}
            title="Abrir Centro de Aprendizaje y Guías"
            className="hidden 2xl:flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-1 rounded transition-all font-medium cursor-pointer shrink-0"
          >
            <BookOpen className="w-3 h-3 text-blue-400" />
            <span>Guías</span>
          </button>
        )}

        {/* Real-time Collaboration Trigger (Desktop) */}
        {onOpenRealtimeModal && (
          <button
            onClick={onOpenRealtimeModal}
            title={
              syncStatus === 'connected'
                ? 'WebSocket Conectado'
                : syncStatus === 'connecting'
                ? 'Conectando...'
                : 'Sincronización Local / Broadcast'
            }
            className={`hidden 2xl:flex items-center gap-1 text-[11px] px-2 py-1 rounded transition-all font-medium cursor-pointer border shrink-0 ${
              syncStatus === 'connected'
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60'
                : syncStatus === 'connecting'
                ? 'bg-amber-950/50 text-amber-300 border-amber-800/60 hover:bg-amber-900/60'
                : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                syncStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : syncStatus === 'connecting'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-blue-500'
              }`}
            />
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>{syncStatus === 'connected' ? 'Live' : 'Sync'}</span>
          </button>
        )}

        {/* Figma-Style Quick Command Palette (Desktop) */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            title="Abrir Paleta de Comandos Rápidos (Ctrl+K o /)"
            className="hidden 2xl:flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 px-2 py-1 rounded transition-colors font-medium cursor-pointer shrink-0"
          >
            <Search className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 font-mono">Buscar</span>
          </button>
        )}

        {/* RESPONSIVE TOOLS OVERFLOW DROPDOWN (For < 2xl screens & tablets) */}
        <div className="relative 2xl:hidden" ref={toolsDropdownRef}>
          <button
            onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
            title="Más herramientas y accesos rápidos"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
              isToolsMenuOpen
                ? 'bg-zinc-800 text-white border-zinc-700'
                : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-300" />
          </button>

          {isToolsMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-bold">
                Herramientas y Extras
              </div>

              {onOpenPsdModal && (
                <button
                  onClick={() => {
                    onOpenPsdModal();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left text-zinc-300 hover:text-white hover:bg-blue-600 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <FileImage className="w-3.5 h-3.5 text-blue-400" /> Importar PSD (.psd)
                  </span>
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded font-mono">Photoshop</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenPresetModal();
                  setIsToolsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-xs text-left text-zinc-300 hover:text-white hover:bg-blue-600 flex items-center justify-between group transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> Plantillas de Banners
                </span>
              </button>

              {onOpenLearningGuide && (
                <button
                  onClick={() => {
                    onOpenLearningGuide('overview');
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left text-zinc-300 hover:text-white hover:bg-blue-600 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Guías y Tutoriales
                  </span>
                </button>
              )}

              {onOpenCommandPalette && (
                <button
                  onClick={() => {
                    onOpenCommandPalette();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left text-zinc-300 hover:text-white hover:bg-blue-600 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Search className="w-3.5 h-3.5 text-zinc-400" /> Paleta de Comandos
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-blue-200">Ctrl+K</span>
                </button>
              )}

              {onOpenRealtimeModal && (
                <button
                  onClick={() => {
                    onOpenRealtimeModal();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left text-zinc-300 hover:text-white hover:bg-blue-600 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" /> Sincronización en Vivo
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">{syncStatus}</span>
                </button>
              )}

              {deferredPrompt && !isInstalled && (
                <button
                  onClick={() => {
                    handleInstallPwa();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left text-blue-300 hover:text-white hover:bg-blue-600 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <DownloadCloud className="w-3.5 h-3.5 text-blue-400" /> Instalar Aplicación
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

