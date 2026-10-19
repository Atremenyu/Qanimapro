import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Composition,
  VectorLayer,
  ToolType,
  ViewportState,
  EasingType,
  WorkspaceLayout,
  InspectorTab,
  PanelPosition,
  CustomGuide,
} from './types';
import { PRESET_COMPOSITIONS, createBlankLayer, createCustomLayer } from './data/presets';
import {
  getAllWorkspaceLayouts,
  saveCustomLayout,
  deleteCustomLayout,
  getActiveLayoutId,
  setActiveLayoutId as setActiveLayoutIdStorage,
  BUILT_IN_FOCUS_MODES,
} from './data/workspaceLayouts';
import { TopNav } from './components/TopNav';
import { Toolbar } from './components/Toolbar';
import { CanvasViewport } from './components/CanvasViewport';
import { TimelinePanel } from './components/TimelinePanel';
import { PropertyInspector } from './components/PropertyInspector';
import { ExportModal } from './components/ExportModal';
import { PresetLibraryModal } from './components/PresetLibraryModal';
import { CompSettingsModal } from './components/CompSettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { NewCompModal } from './components/NewCompModal';
import { PsdImportModal } from './components/PsdImportModal';
import { MotionPresetsModal } from './components/MotionPresetsModal';
import { KeyframeGuideModal } from './components/KeyframeGuideModal';
import { LearningGuideModal, GuideSectionId } from './components/LearningGuideModal';
import { InteractiveTour } from './components/InteractiveTour';
import { RealtimeSyncModal } from './components/RealtimeSyncModal';
import { WelcomeLauncherModal } from './components/WelcomeLauncherModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { WorkspaceLayoutModal } from './components/WorkspaceLayoutModal';
import { SaveLayoutQuickModal } from './components/SaveLayoutQuickModal';
import { ReframeModal } from './components/ReframeModal';
import { McpModal } from './components/McpModal';
import { FloatingTransportHUD } from './components/FloatingTransportHUD';
import { TabletFloatingControls } from './components/TabletFloatingControls';
import { realtimeSync, SyncMessage } from './utils/realtimeSync';
import { applyFigmaAlignment, FigmaAlignAction } from './utils/figmaTools';
import { evaluateProp } from './utils/animEngine';
import { adaptCompositionToDimensions } from './utils/templateAdapter';
import { TEMPLATE_CATALOG } from './data/richTemplates';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Wrench,
  Sliders,
  Film,
} from 'lucide-react';

const DEFAULT_BLANK_COMPOSITION: Composition = {
  id: 'comp_' + Math.random().toString(36).substring(2, 9),
  name: 'Nueva Composición',
  width: 800,
  height: 600,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#0c0f17',
  layers: [],
};

export default function App() {
  // Active Composition State (Starts clean and asks user via Welcome Launcher)
  const [composition, setComposition] = useState<Composition>(() =>
    JSON.parse(JSON.stringify(DEFAULT_BLANK_COMPOSITION))
  );
  const compositionRef = useRef<Composition>(composition);
  compositionRef.current = composition;

  // Undo / Redo History
  const [historyPast, setHistoryPast] = useState<Composition[]>([]);
  const [historyFuture, setHistoryFuture] = useState<Composition[]>([]);
  const historyPastRef = useRef<Composition[]>(historyPast);
  historyPastRef.current = historyPast;
  const historyFutureRef = useRef<Composition[]>(historyFuture);
  historyFutureRef.current = historyFuture;

  // Time & Playback State (Disabled autoplay by default)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoKeyframe, setAutoKeyframe] = useState<boolean>(true);

  // Interaction & Tool Selection
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');

  // Viewport Settings
  const [viewportState, setViewportState] = useState<ViewportState>({
    zoom: 0.9,
    pan: { x: 0, y: 0 },
    showGrid: true,
    gridSize: 20,
    showRulers: true,
    showSafeAreas: false,
    snapToGrid: false,
    onionSkin: false,
  });

  // Workspace Layout & Focus Modes State
  const [allLayouts, setAllLayouts] = useState<WorkspaceLayout[]>(() => getAllWorkspaceLayouts());
  const [activeLayoutId, setActiveLayoutId] = useState<string>(() => getActiveLayoutId());
  const [isWorkspaceManagerOpen, setIsWorkspaceManagerOpen] = useState<boolean>(false);
  const [isSaveLayoutQuickOpen, setIsSaveLayoutQuickOpen] = useState<boolean>(false);

  // Dynamic Panels Layout Configuration
  const [toolbarVisible, setToolbarVisible] = useState<boolean>(true);
  const [toolbarPosition, setToolbarPosition] = useState<PanelPosition>('left');
  const [toolbarCompact, setToolbarCompact] = useState<boolean>(false);

  const [inspectorVisible, setInspectorVisible] = useState<boolean>(true);
  const [inspectorPosition, setInspectorPosition] = useState<PanelPosition>('right');
  const [inspectorWidth, setInspectorWidth] = useState<number>(320);
  const [inspectorActiveTab, setInspectorActiveTab] = useState<InspectorTab>('transform');

  const [timelineVisible, setTimelineVisible] = useState<boolean>(true);
  const [timelineHeight, setTimelineHeight] = useState<number>(260);
  const [timelineCollapsed, setTimelineCollapsed] = useState<boolean>(false);

  // Modals
  const [isWelcomeLauncherOpen, setIsWelcomeLauncherOpen] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isCompSettingsOpen, setIsCompSettingsOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isNewCompModalOpen, setIsNewCompModalOpen] = useState<boolean>(false);
  const [isPsdModalOpen, setIsPsdModalOpen] = useState<boolean>(false);
  const [isMotionPresetsOpen, setIsMotionPresetsOpen] = useState<boolean>(false);
  const [isKeyframeGuideOpen, setIsKeyframeGuideOpen] = useState<boolean>(false);
  const [isLearningGuideOpen, setIsLearningGuideOpen] = useState<boolean>(false);
  const [learningGuideSection, setLearningGuideSection] = useState<GuideSectionId>('overview');
  const [isInteractiveTourOpen, setIsInteractiveTourOpen] = useState<boolean>(false);
  const [isRealtimeModalOpen, setIsRealtimeModalOpen] = useState<boolean>(false);
  const [isReframeModalOpen, setIsReframeModalOpen] = useState<boolean>(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState<boolean>(false);

  // Responsive Screen Size & Tablet Mode Tracking
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth < 1024;

  const handleOpenLearningGuide = (section: GuideSectionId = 'overview') => {
    setLearningGuideSection(section);
    setIsLearningGuideOpen(true);
  };

  // Hidden JSON File Input Ref
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Apply Workspace Layout helper
  const handleApplyLayout = useCallback((layout: WorkspaceLayout) => {
    setActiveLayoutId(layout.id);
    setActiveLayoutIdStorage(layout.id);

    setToolbarVisible(layout.toolbar.visible);
    setToolbarPosition(layout.toolbar.position);
    setToolbarCompact(layout.toolbar.compact ?? false);

    setInspectorVisible(layout.inspector.visible);
    setInspectorPosition(layout.inspector.position);
    setInspectorWidth(layout.inspector.width);
    if (layout.inspector.activeTab) {
      setInspectorActiveTab(layout.inspector.activeTab);
    }

    setTimelineVisible(layout.timeline.visible);
    setTimelineHeight(layout.timeline.height);
    setTimelineCollapsed(layout.timeline.collapsed ?? false);

    if (layout.viewport) {
      setViewportState((prev) => ({
        ...prev,
        showGrid: layout.viewport?.showGrid ?? prev.showGrid,
        showRulers: layout.viewport?.showRulers ?? prev.showRulers,
        showSafeAreas: layout.viewport?.showSafeAreas ?? prev.showSafeAreas,
        snapToGrid: layout.viewport?.snapToGrid ?? prev.snapToGrid,
        onionSkin: layout.viewport?.onionSkin ?? prev.onionSkin,
      }));
    }
  }, []);

  // On mount: restore active layout if saved
  useEffect(() => {
    const active = allLayouts.find((l) => l.id === activeLayoutId) || allLayouts[0];
    if (active) {
      handleApplyLayout(active);
    }
  }, []);

  // Save current UI state as a custom layout
  const handleSaveCurrentAsLayout = (layoutData: {
    name: string;
    description: string;
    icon: string;
    shortcut?: string;
  }) => {
    const saved = saveCustomLayout({
      name: layoutData.name,
      description: layoutData.description,
      icon: layoutData.icon,
      shortcut: layoutData.shortcut,
      toolbar: {
        visible: toolbarVisible,
        position: toolbarPosition,
        compact: toolbarCompact,
      },
      inspector: {
        visible: inspectorVisible,
        position: inspectorPosition,
        width: inspectorWidth,
        activeTab: inspectorActiveTab,
      },
      timeline: {
        visible: timelineVisible,
        height: timelineHeight,
        collapsed: timelineCollapsed,
      },
      viewport: {
        showGrid: viewportState.showGrid,
        showRulers: viewportState.showRulers,
        showSafeAreas: viewportState.showSafeAreas,
        snapToGrid: viewportState.snapToGrid,
        onionSkin: viewportState.onionSkin,
      },
    });

    const refreshed = getAllWorkspaceLayouts();
    setAllLayouts(refreshed);
    handleApplyLayout(saved);
  };

  const handleDeleteCustomLayout = (id: string) => {
    deleteCustomLayout(id);
    const refreshed = getAllWorkspaceLayouts();
    setAllLayouts(refreshed);
    if (activeLayoutId === id) {
      handleApplyLayout(refreshed[0]);
    }
  };

  const handleResetDefaultLayout = () => {
    const defaultLayout = allLayouts.find((l) => l.id === 'layout_default') || allLayouts[0];
    if (defaultLayout) {
      handleApplyLayout(defaultLayout);
    }
  };

  // Push history snapshot before mutating composition
  const pushHistory = useCallback((currentComp?: Composition) => {
    const compToSave = currentComp || compositionRef.current;
    if (!compToSave) return;
    const past = historyPastRef.current;
    if (past.length > 0) {
      const last = past[past.length - 1];
      if (JSON.stringify(last) === JSON.stringify(compToSave)) {
        return;
      }
    }
    setHistoryPast((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(compToSave))]);
    setHistoryFuture([]);
  }, []);

  const debounceHistoryTimerRef = useRef<number | null>(null);

  const pushHistoryDebounced = useCallback(
    (currentComp?: Composition) => {
      const compToSave = currentComp || compositionRef.current;
      if (!compToSave) return;

      if (!debounceHistoryTimerRef.current) {
        pushHistory(compToSave);
      }
      if (debounceHistoryTimerRef.current) {
        clearTimeout(debounceHistoryTimerRef.current);
      }
      debounceHistoryTimerRef.current = window.setTimeout(() => {
        debounceHistoryTimerRef.current = null;
      }, 400);
    },
    [pushHistory]
  );

  const handleImportAsNewComposition = (newComp: Composition) => {
    if (composition.layers.length > 0) {
      pushHistory(composition);
    } else {
      setHistoryPast([]);
      setHistoryFuture([]);
    }
    const unexpandedComp: Composition = {
      ...newComp,
      layers: newComp.layers.map((l) => ({
        ...l,
        expandedInTimeline: false,
      })),
    };
    setComposition(unexpandedComp);
    setSelectedLayerIds(unexpandedComp.layers.length > 0 ? [unexpandedComp.layers[0].id] : []);
    setCurrentTime(0);
  };

  const handleInsertPsdLayers = (newLayers: VectorLayer[]) => {
    pushHistory(composition);
    const unexpandedLayers = newLayers.map((l) => ({
      ...l,
      expandedInTimeline: false,
    }));
    setComposition((prev) => ({
      ...prev,
      layers: [...unexpandedLayers, ...prev.layers],
    }));
    if (unexpandedLayers.length > 0) {
      setSelectedLayerIds([unexpandedLayers[0].id]);
    }
  };

  const handleUndo = useCallback(() => {
    const past = historyPastRef.current;
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const current = compositionRef.current;

    setHistoryPast(newPast);
    setHistoryFuture((prev) => [JSON.parse(JSON.stringify(current)), ...prev]);
    setComposition(JSON.parse(JSON.stringify(previous)));
  }, []);

  const handleRedo = useCallback(() => {
    const future = historyFutureRef.current;
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const current = compositionRef.current;

    setHistoryFuture(newFuture);
    setHistoryPast((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(current))]);
    setComposition(JSON.parse(JSON.stringify(next)));
  }, []);

  // Update Composition handler
  const handleUpdateComposition = (updated: Partial<Composition>) => {
    pushHistory(composition);
    setComposition((prev) => {
      if (
        !updated.layers &&
        ((updated.width && updated.width !== prev.width) ||
          (updated.height && updated.height !== prev.height))
      ) {
        const targetW = updated.width || prev.width;
        const targetH = updated.height || prev.height;
        const reframed = adaptCompositionToDimensions(prev, targetW, targetH);
        return { ...reframed, ...updated };
      }
      return { ...prev, ...updated };
    });
    realtimeSync.broadcast({
      type: 'SYNC_COMPOSITION',
      payload: { composition: { ...compositionRef.current, ...updated } },
    });
  };

  // Custom guide lines update handler (from horizontal / vertical rulers)
  const handleUpdateGuides = (guides: CustomGuide[]) => {
    pushHistory(compositionRef.current);
    setComposition((prev) => ({
      ...prev,
      guides,
    }));
    realtimeSync.broadcast({
      type: 'SYNC_COMPOSITION',
      payload: { composition: { ...compositionRef.current, guides } },
    });
  };

  // Layer update handler
  const handleUpdateLayer = (layerId: string, updated: Partial<VectorLayer>) => {
    const isOnlyUiState = Object.keys(updated).every((key) => key === 'expandedInTimeline');
    if (!isOnlyUiState) {
      pushHistoryDebounced(compositionRef.current);
    }
    setComposition((prev) => {
      return {
        ...prev,
        layers: prev.layers.map((l) => (l.id === layerId ? { ...l, ...updated } : l)),
      };
    });
    realtimeSync.broadcast({
      type: 'SYNC_LAYER_UPDATE',
      payload: { layerId, updated },
    });
  };

  const handleUpdateLayerTransform = (
    layerId: string,
    transformUpdate: Partial<VectorLayer['transform']>
  ) => {
    setComposition((prev) => {
      return {
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === layerId ? { ...l, transform: { ...l.transform, ...transformUpdate } } : l
        ),
      };
    });
    realtimeSync.broadcast({
      type: 'SYNC_LAYER_UPDATE',
      payload: { layerId, updated: { transform: transformUpdate as any } },
    });
  };

  // Add new layer
  const handleAddLayer = (
    type: VectorLayer['type'],
    pos?: { x: number; y: number },
    options?: any
  ) => {
    pushHistory(composition);
    const x = pos?.x ?? composition.width / 2;
    const y = pos?.y ?? composition.height / 2;
    const layerName =
      type === 'image' && options?.fileName
        ? options.fileName
        : type === 'rect'
        ? 'Rectangle'
        : type === 'circle'
        ? 'Circle'
        : type === 'star'
        ? 'Star'
        : type === 'polygon'
        ? 'Polygon'
        : type === 'path'
        ? 'Vector Path'
        : type === 'text'
        ? 'Text Layer'
        : type === 'image'
        ? 'Image Layer'
        : `${type.toUpperCase()} Layer`;
    const newLayer = createCustomLayer(type, layerName, x, y, options);
    setComposition((prev) => ({
      ...prev,
      layers: [newLayer, ...prev.layers],
    }));
    setSelectedLayerIds([newLayer.id]);
    setActiveTool('select');
  };

  // Delete layer
  const handleDeleteLayer = (layerId: string) => {
    pushHistory(composition);
    setComposition((prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== layerId),
    }));
    setSelectedLayerIds((prev) => prev.filter((id) => id !== layerId));
  };

  // Duplicate layer
  const handleDuplicateLayer = (layerId: string) => {
    const layer = composition.layers.find((l) => l.id === layerId);
    if (!layer) return;
    pushHistory(composition);
    const dup: VectorLayer = JSON.parse(JSON.stringify(layer));
    dup.id = 'layer_' + Math.random().toString(36).substring(2, 9);
    dup.name = `${layer.name} Copy`;
    dup.transform.position.value.x += 20;
    dup.transform.position.value.y += 20;
    setComposition((prev) => ({
      ...prev,
      layers: [dup, ...prev.layers],
    }));
    setSelectedLayerIds([dup.id]);
  };

  // Reorder layers by direction
  const handleReorderLayerDirection = (
    layerId: string,
    direction: 'front' | 'back' | 'forward' | 'backward'
  ) => {
    const idx = composition.layers.findIndex((l) => l.id === layerId);
    if (idx < 0) return;
    pushHistory(composition);
    const newLayers = [...composition.layers];
    const [layer] = newLayers.splice(idx, 1);

    if (direction === 'front') {
      newLayers.unshift(layer);
    } else if (direction === 'back') {
      newLayers.push(layer);
    } else if (direction === 'forward' && idx > 0) {
      newLayers.splice(idx - 1, 0, layer);
    } else if (direction === 'backward' && idx < newLayers.length) {
      newLayers.splice(idx + 1, 0, layer);
    } else {
      newLayers.splice(idx, 0, layer);
    }

    setComposition((prev) => ({ ...prev, layers: newLayers }));
  };

  // Reorder layers by drag & drop or direct start/end indices
  const handleReorderLayersByIndex = (startIndex: number, endIndex: number) => {
    if (
      startIndex === endIndex ||
      startIndex < 0 ||
      startIndex >= composition.layers.length ||
      endIndex < 0 ||
      endIndex >= composition.layers.length
    ) {
      return;
    }
    pushHistory(composition);
    const newLayers = [...composition.layers];
    const [removed] = newLayers.splice(startIndex, 1);
    newLayers.splice(endIndex, 0, removed);
    setComposition((prev) => ({ ...prev, layers: newLayers }));
  };

  // Transform Actions from Menu
  const handleApplyTransformAction = (
    action: 'center' | 'centerAnchor' | 'flipH' | 'flipV' | 'reset'
  ) => {
    const id = selectedLayerIds[0];
    if (!id) return;
    const layer = composition.layers.find((l) => l.id === id);
    if (!layer) return;

    pushHistory(composition);

    if (action === 'center') {
      handleUpdateLayerTransform(id, {
        position: {
          ...layer.transform.position,
          value: { x: composition.width / 2, y: composition.height / 2 },
        },
      });
    } else if (action === 'centerAnchor') {
      handleUpdateLayerTransform(id, {
        anchorPoint: {
          ...layer.transform.anchorPoint,
          value: { x: 0, y: 0 },
        },
      });
    } else if (action === 'flipH') {
      handleUpdateLayerTransform(id, {
        scale: {
          ...layer.transform.scale,
          value: { x: -layer.transform.scale.value.x, y: layer.transform.scale.value.y },
        },
      });
    } else if (action === 'flipV') {
      handleUpdateLayerTransform(id, {
        scale: {
          ...layer.transform.scale,
          value: { x: layer.transform.scale.value.x, y: -layer.transform.scale.value.y },
        },
      });
    } else if (action === 'reset') {
      handleUpdateLayerTransform(id, {
        position: { ...layer.transform.position, value: { x: composition.width / 2, y: composition.height / 2 } },
        scale: { ...layer.transform.scale, value: { x: 100, y: 100 } },
        rotation: { ...layer.transform.rotation, value: 0 },
        opacity: { ...layer.transform.opacity, value: 100 },
        anchorPoint: { ...layer.transform.anchorPoint, value: { x: 0, y: 0 } },
      });
    }
  };

  // Effects & Modifiers from Menu
  const handleApplyEffect = (effect: 'trim' | 'repeater' | 'wiggle' | 'glow' | 'invert') => {
    let id = selectedLayerIds[0];
    if (!id && composition.layers.length > 0) {
      id = composition.layers[0].id;
      setSelectedLayerIds([id]);
    }
    if (!id) return;
    const layer = composition.layers.find((l) => l.id === id);
    if (!layer) return;

    pushHistory(composition);

    if (effect === 'trim') {
      const currentStroke = layer.style?.stroke?.value;
      const effectiveStroke = !currentStroke || currentStroke === 'none' ? '#38bdf8' : currentStroke;
      const currentStrokeWidth = layer.style?.strokeWidth?.value ?? 0;
      const effectiveStrokeWidth = currentStrokeWidth <= 0 ? 4 : currentStrokeWidth;

      handleUpdateLayer(id, {
        expandedInTimeline: true,
        style: {
          ...layer.style,
          stroke: { ...layer.style.stroke, value: effectiveStroke },
          strokeWidth: { ...layer.style.strokeWidth, value: effectiveStrokeWidth },
          trimStart: {
            ...layer.style.trimStart,
            isKeyframed: true,
            keyframes: [
              { id: 'kf_trim_1', time: 0, value: 0, easing: 'easeInOut' },
              { id: 'kf_trim_2', time: Math.min(2.0, composition.duration), value: 100, easing: 'easeInOut' },
            ],
          },
          trimEnd: { ...layer.style.trimEnd, value: 100 },
        },
      });
    } else if (effect === 'repeater') {
      const newMod = {
        id: 'mod_' + Date.now(),
        type: 'repeater' as const,
        enabled: true,
        repeater: {
          copies: 6,
          offset: { x: 30, y: 0 },
          rotationOffset: 45,
          scaleOffset: { x: -8, y: -8 },
          opacityOffset: 12,
        },
      };
      handleUpdateLayer(id, {
        expandedInTimeline: true,
        modifiers: [...(layer.modifiers || []), newMod],
      });
    } else if (effect === 'wiggle') {
      const newMod = {
        id: 'mod_' + Date.now(),
        type: 'wiggle' as const,
        enabled: true,
        wiggle: {
          frequency: 3,
          positionAmp: 20,
          rotationAmp: 15,
          scaleAmp: 8,
        },
      };
      handleUpdateLayer(id, {
        expandedInTimeline: true,
        modifiers: [...(layer.modifiers || []), newMod],
      });
    } else if (effect === 'glow') {
      handleUpdateLayer(id, {
        style: {
          ...layer.style,
          shadowColor: '#38bdf8',
          shadowBlur: { ...layer.style.shadowBlur, value: 24 },
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
      });
    } else if (effect === 'invert') {
      const oldFill = layer.style.fill?.value || '#3b82f6';
      const oldStroke = layer.style.stroke?.value || 'none';
      handleUpdateLayer(id, {
        style: {
          ...layer.style,
          fill: { ...layer.style.fill, value: oldStroke !== 'none' ? oldStroke : '#3b82f6' },
          stroke: { ...layer.style.stroke, value: oldFill !== 'none' ? oldFill : '#60a5fa' },
        },
      });
    }
  };

  // Apply Easing to Selected Keyframes
  const handleApplyEasingToSelected = (easing: EasingType) => {
    const id = selectedLayerIds[0];
    if (!id) return;
    const layer = composition.layers.find((l) => l.id === id);
    if (!layer) return;

    pushHistory(composition);

    const updatePropKeyframes = <T,>(prop: any) => {
      if (!prop?.isKeyframed || !prop.keyframes) return prop;
      return {
        ...prop,
        keyframes: prop.keyframes.map((k: any) => ({ ...k, easing })),
      };
    };

    const newTransform = {
      position: updatePropKeyframes(layer.transform.position),
      scale: updatePropKeyframes(layer.transform.scale),
      rotation: updatePropKeyframes(layer.transform.rotation),
      opacity: updatePropKeyframes(layer.transform.opacity),
      anchorPoint: updatePropKeyframes(layer.transform.anchorPoint),
      skew: updatePropKeyframes(layer.transform.skew),
    };

    handleUpdateLayer(id, { transform: newTransform });
  };

  // Figma Alignment & Distribution Handler
  const handleApplyFigmaAlign = (action: FigmaAlignAction, alignToCanvas?: boolean) => {
    if (selectedLayerIds.length === 0) return;
    pushHistory(composition);
    const updated = applyFigmaAlignment(composition, selectedLayerIds, action, currentTime, alignToCanvas ?? false);
    setComposition(updated);
  };

  // Intelligent Reframe Handler (Proportional Dimension Adapting)
  const handleApplyReframe = (reframedComp: Composition) => {
    pushHistory(composition);
    setComposition(reframedComp);
  };

  // Save Project JSON
  const handleSaveProjectJson = () => {
    const jsonStr = JSON.stringify(composition, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${composition.name.toLowerCase().replace(/\s+/g, '-')}.vectormotion.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open Project JSON file
  const handleOpenProjectJson = () => {
    jsonFileInputRef.current?.click();
  };

  const handleJsonFileUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.layers && parsed.width) {
            pushHistory(composition);
            setComposition(parsed);
            setSelectedLayerIds(parsed.layers.length > 0 ? [parsed.layers[0].id] : []);
            setCurrentTime(0);
          }
        } catch (err) {
          console.error('Error parsing project JSON:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  // Import SVG Vector Asset
  const handleImportSvg = (svgContent: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');
      const paths = doc.querySelectorAll('path');
      const rects = doc.querySelectorAll('rect');
      const circles = doc.querySelectorAll('circle');

      pushHistory(composition);
      const newLayers: VectorLayer[] = [];

      paths.forEach((p, i) => {
        const d = p.getAttribute('d');
        const fill = p.getAttribute('fill') || '#3b82f6';
        const stroke = p.getAttribute('stroke') || 'none';
        if (d) {
          const layer = createBlankLayer('path', `SVG Path ${i + 1}`, composition.width / 2, composition.height / 2);
          layer.path = { d };
          layer.style.fill.value = fill === 'none' ? 'none' : fill;
          layer.style.stroke.value = stroke;
          newLayers.push(layer);
        }
      });

      rects.forEach((r, i) => {
        const w = parseFloat(r.getAttribute('width') || '80');
        const h = parseFloat(r.getAttribute('height') || '80');
        const fill = r.getAttribute('fill') || '#6366f1';
        const layer = createBlankLayer('rect', `SVG Rect ${i + 1}`, composition.width / 2, composition.height / 2);
        layer.rect = { width: { value: w, isKeyframed: false, keyframes: [] }, height: { value: h, isKeyframed: false, keyframes: [] }, cornerRadius: { value: 8, isKeyframed: false, keyframes: [] } };
        layer.style.fill.value = fill;
        newLayers.push(layer);
      });

      if (newLayers.length > 0) {
        setComposition((prev) => ({
          ...prev,
          layers: [...newLayers, ...prev.layers],
        }));
        setSelectedLayerIds([newLayers[0].id]);
      }
    } catch (err) {
      console.error('Failed to import SVG:', err);
    }
  };

  // Select layer
  const handleSelectLayer = (id: string | null, multi: boolean = false) => {
    if (!id) {
      setSelectedLayerIds([]);
      return;
    }
    if (multi) {
      setSelectedLayerIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setSelectedLayerIds([id]);
    }
  };

  // Multi-layer selection (from marquee drag / selection box)
  const handleSelectMultipleLayers = (ids: string[]) => {
    setSelectedLayerIds(ids);
  };

  // New Blank Composition Dialog Opener
  const handleOpenNewCompModal = () => {
    setIsNewCompModalOpen(true);
  };

  const handleCreateNewComposition = (newComp: Composition) => {
    pushHistory(composition);
    setComposition(newComp);
    setSelectedLayerIds([]);
    setCurrentTime(0);
  };

  // Viewport reset
  const handleResetViewport = () => {
    setViewportState((prev) => ({ ...prev, zoom: 1.0, pan: { x: 0, y: 0 } }));
  };

  // Add Keyframe to selected layer(s) at current playhead time
  const handleAddKeyframe = (type: 'rotation' | 'scale' | 'opacity' | 'position' | 'all') => {
    if (selectedLayerIds.length === 0) return;
    pushHistory(composition);
    setComposition((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => {
        if (!selectedLayerIds.includes(l.id)) return l;
        const copy = JSON.parse(JSON.stringify(l)) as VectorLayer;

        const insertKf = <T,>(prop: any, val: T) => {
          prop.isKeyframed = true;
          if (!prop.keyframes) prop.keyframes = [];
          const existingIdx = prop.keyframes.findIndex(
            (k: any) => Math.abs(k.time - currentTime) < 0.06
          );
          if (existingIdx >= 0) {
            prop.keyframes[existingIdx].value = JSON.parse(JSON.stringify(val));
          } else {
            prop.keyframes.push({
              id: 'kf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              time: currentTime,
              value: JSON.parse(JSON.stringify(val)),
              easing: 'easeInOut',
            });
            prop.keyframes.sort((a: any, b: any) => a.time - b.time);
          }
        };

        if (type === 'rotation' || type === 'all') {
          const curRot = evaluateProp(copy.transform.rotation, currentTime);
          insertKf(copy.transform.rotation, curRot);
        }
        if (type === 'scale' || type === 'all') {
          const curScale = evaluateProp(copy.transform.scale, currentTime);
          insertKf(copy.transform.scale, curScale);
        }
        if (type === 'opacity' || type === 'all') {
          const curOp = evaluateProp(copy.transform.opacity, currentTime);
          insertKf(copy.transform.opacity, curOp);
        }
        if (type === 'position' || type === 'all') {
          const curPos = evaluateProp(copy.transform.position, currentTime);
          insertKf(copy.transform.position, curPos);
        }

        return copy;
      }),
    }));
  };

  // 60 FPS requestAnimationFrame playback loop
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    let frameId: number;

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= composition.duration) {
          return 0;
        }
        return next;
      });
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isPlaying, composition.duration]);

  // Real-time synchronization receiver (BroadcastChannel / WebSockets / MCP Bridge)
  useEffect(() => {
    // Auto-connect to local MCP Bridge if running in browser
    if (typeof window !== 'undefined' && !realtimeSync.serverUrl) {
      try {
        realtimeSync.connectWebSocket('ws://localhost:49222');
      } catch {
        // bridge not running yet, user can start it via npm run mcp
      }
    }

    const unsubscribe = realtimeSync.subscribe((msg: SyncMessage) => {
      if (msg.type === 'SYNC_COMPOSITION' && msg.payload?.composition) {
        setComposition(msg.payload.composition);
      } else if (msg.type === 'SYNC_LAYER_UPDATE' && msg.payload?.layerId && msg.payload?.updated) {
        setComposition((prev) => ({
          ...prev,
          layers: prev.layers.map((l) =>
            l.id === msg.payload.layerId ? { ...l, ...msg.payload.updated } : l
          ),
        }));
      } else if (msg.type === 'SYNC_LAYER_CREATE' && msg.payload?.layer) {
        setComposition((prev) => ({
          ...prev,
          layers: [...prev.layers, msg.payload.layer],
        }));
      } else if (msg.type === 'SYNC_LAYER_DELETE' && msg.payload?.layerId) {
        setComposition((prev) => ({
          ...prev,
          layers: prev.layers.filter((l) => l.id !== msg.payload.layerId),
        }));
      } else if (msg.type === 'SYNC_REFRAME' && msg.payload?.width && msg.payload?.height) {
        setComposition((prev) =>
          adaptCompositionToDimensions(prev, msg.payload.width, msg.payload.height)
        );
      } else if (msg.type === 'SYNC_APPLY_TEMPLATE' && msg.payload?.keyword) {
        const kw = (msg.payload.keyword || '').toLowerCase();
        const found = TEMPLATE_CATALOG.find(
          (t) =>
            t.id.toLowerCase().includes(kw) ||
            t.name.toLowerCase().includes(kw) ||
            t.category.toLowerCase().includes(kw) ||
            t.description.toLowerCase().includes(kw)
        );
        if (found) {
          setComposition(found.composition);
          setSelectedLayerIds(found.composition.layers.length > 0 ? [found.composition.layers[0].id] : []);
          setCurrentTime(0);
        }
      } else if (msg.type === 'SET_CANVAS_BACKGROUND' && msg.payload?.color) {
        setComposition((prev) => ({
          ...prev,
          backgroundColor: msg.payload.color,
        }));
      } else if (msg.type === 'SYNC_PLAYHEAD') {
        const action = msg.payload?.action;
        if (action === 'play') {
          setIsPlaying(true);
        } else if (action === 'pause') {
          setIsPlaying(false);
        } else if (action === 'toggle') {
          setIsPlaying((prev) => !prev);
        }
        if (typeof msg.payload?.time === 'number') {
          setCurrentTime(msg.payload.time);
        }
        if (typeof msg.payload?.isPlaying === 'boolean') {
          setIsPlaying(msg.payload.isPlaying);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts if typing in input field
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;

      // 1. MODIFIER COMBINATIONS (Ctrl / Cmd)
      if (isMod) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          return;
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRedo();
          return;
        } else if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          setIsCommandPaletteOpen(true);
          return;
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setIsNewCompModalOpen(true);
          return;
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          setIsExportModalOpen(true);
          return;
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          handleSaveProjectJson();
          return;
        } else if (e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          handleOpenProjectJson();
          return;
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          if (selectedLayerIds.length > 0) {
            handleDuplicateLayer(selectedLayerIds[0]);
          }
          return;
        } else if (e.shiftKey && (e.key === ']' || e.key === '}')) {
          e.preventDefault();
          if (selectedLayerIds.length > 0) {
            handleReorderLayerDirection(selectedLayerIds[0], 'front');
          }
          return;
        } else if (e.shiftKey && (e.key === '[' || e.key === '{')) {
          e.preventDefault();
          if (selectedLayerIds.length > 0) {
            handleReorderLayerDirection(selectedLayerIds[0], 'back');
          }
          return;
        } else if (e.key === ']' || e.key === '}') {
          e.preventDefault();
          if (selectedLayerIds.length > 0) {
            handleReorderLayerDirection(selectedLayerIds[0], 'forward');
          }
          return;
        } else if (e.key === '[' || e.key === '{') {
          e.preventDefault();
          if (selectedLayerIds.length > 0) {
            handleReorderLayerDirection(selectedLayerIds[0], 'backward');
          }
          return;
        }
      }

      // 2. PLAYBACK & SINGLE-KEY SHORTCUTS (When not holding Ctrl/Cmd/Alt)
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (!isMod && !e.altKey && (e.key === 'v' || e.key === 'V')) {
        setActiveTool('select');
      } else if (!isMod && !e.altKey && (e.key === 'a' || e.key === 'A')) {
        setActiveTool('directSelect');
      } else if (!isMod && !e.altKey && (e.key === 'p' || e.key === 'P')) {
        setActiveTool('pen');
      } else if (!isMod && !e.altKey && (e.key === 'r' || e.key === 'R')) {
        setActiveTool('rect');
      } else if (!isMod && !e.altKey && (e.key === 'o' || e.key === 'O')) {
        setActiveTool('circle');
      } else if (!isMod && !e.altKey && (e.key === 's' || e.key === 'S')) {
        setActiveTool('star');
      } else if (!isMod && !e.altKey && (e.key === 'g' || e.key === 'G')) {
        setActiveTool('polygon');
      } else if (!isMod && !e.altKey && (e.key === 't' || e.key === 'T')) {
        setActiveTool('text');
      } else if (!isMod && !e.altKey && (e.key === 'h' || e.key === 'H')) {
        setActiveTool('hand');
      } else if (!isMod && !e.altKey && (e.key === 'y' || e.key === 'Y')) {
        setActiveTool('anchorPoint');
      } else if (e.key === '/') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleApplyEasingToSelected('easeInOut');
      } else if (e.key === 'F6') {
        e.preventDefault();
        handleAddKeyframe('all');
      } else if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleApplyFigmaAlign('alignLeft');
      } else if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        handleApplyFigmaAlign('alignCenterH');
      } else if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        handleApplyFigmaAlign('alignRight');
      } else if (e.altKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        handleApplyFigmaAlign('alignTop');
      } else if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        handleApplyFigmaAlign('alignCenterV');
      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleApplyFigmaAlign('alignBottom');
      } else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedLayerIds.length > 0) {
          handleReorderLayerDirection(selectedLayerIds[0], 'forward');
        }
      } else if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedLayerIds.length > 0) {
          handleReorderLayerDirection(selectedLayerIds[0], 'backward');
        }
      } else if (
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') &&
        !e.altKey &&
        selectedLayerIds.length > 0
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        pushHistory(composition);
        setComposition((prev) => ({
          ...prev,
          layers: prev.layers.map((l) => {
            if (!selectedLayerIds.includes(l.id)) return l;
            return {
              ...l,
              transform: {
                ...l.transform,
                position: {
                  ...l.transform.position,
                  value: {
                    x: Math.round(l.transform.position.value.x + dx),
                    y: Math.round(l.transform.position.value.y + dy),
                  },
                },
              },
            };
          }),
        }));
      } else if (e.key === '?') {
        setIsShortcutsModalOpen(true);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerIds.length > 0) {
          e.preventDefault();
          selectedLayerIds.forEach((id) => handleDeleteLayer(id));
        }
      } else if (e.key === 'Home') {
        setCurrentTime(0);
      } else if (e.key === 'End') {
        setCurrentTime(composition.duration);
      } else if (e.shiftKey && (e.key === 'W' || e.key === 'w')) {
        e.preventDefault();
        setIsWorkspaceManagerOpen(true);
      } else if ((e.shiftKey && (e.key === 'R' || e.key === 'r')) || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        setViewportState((prev) => ({ ...prev, showRulers: !prev.showRulers }));
      } else if (e.altKey && e.key === '1') {
        e.preventDefault();
        const l = allLayouts.find((x) => x.id === 'layout_default');
        if (l) handleApplyLayout(l);
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        const l = allLayouts.find((x) => x.id === 'layout_animation');
        if (l) handleApplyLayout(l);
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        const l = allLayouts.find((x) => x.id === 'layout_illustration');
        if (l) handleApplyLayout(l);
      } else if (e.altKey && e.key === '4') {
        e.preventDefault();
        const l = allLayouts.find((x) => x.id === 'layout_cinema');
        if (l) handleApplyLayout(l);
      } else if (e.altKey && e.key === '5') {
        e.preventDefault();
        const l = allLayouts.find((x) => x.id === 'layout_typography');
        if (l) handleApplyLayout(l);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerIds, composition.duration, composition.layers, allLayouts, handleApplyLayout]);

  const selectedLayer = composition.layers.find((l) => selectedLayerIds.includes(l.id)) || null;

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.name.toLowerCase().endsWith('.psd') || file.name.toLowerCase().endsWith('.psb')) {
            setIsPsdModalOpen(true);
          }
        }
      }}
      className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none"
    >
      {/* Hidden JSON input for loading projects */}
      <input
        ref={jsonFileInputRef}
        type="file"
        accept=".json"
        onChange={handleJsonFileUploaded}
        className="hidden"
      />

      {/* Top Application Bar with Full Desktop MenuBar */}
      <TopNav
        composition={composition}
        onUpdateComposition={handleUpdateComposition}
        onNewBlankComposition={handleOpenNewCompModal}
        onOpenProjectJson={handleOpenProjectJson}
        onSaveProjectJson={handleSaveProjectJson}
        onImportSvg={handleImportSvg}
        onOpenPsdModal={() => setIsPsdModalOpen(true)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onResetTime={() => setCurrentTime(0)}
        currentTime={currentTime}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPresetModal={() => setIsPresetModalOpen(true)}
        onOpenCompSettings={() => setIsCompSettingsOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onOpenReframeModal={() => setIsReframeModalOpen(true)}
        onOpenMcpModal={() => setIsMcpModalOpen(true)}
        onApplyFigmaAlign={handleApplyFigmaAlign}
        viewportZoom={viewportState.zoom}
        onSetViewportZoom={(zoom) => setViewportState((prev) => ({ ...prev, zoom }))}
        onResetViewport={handleResetViewport}
        selectedLayerIds={selectedLayerIds}
        onSelectLayer={handleSelectLayer}
        onAddLayer={(type) => handleAddLayer(type)}
        onDuplicateLayer={handleDuplicateLayer}
        onDeleteLayer={handleDeleteLayer}
        onReorderLayer={handleReorderLayerDirection}
        onApplyTransformAction={handleApplyTransformAction}
        onApplyEffect={handleApplyEffect}
        onApplyEasingToSelected={handleApplyEasingToSelected}
        showGrid={viewportState.showGrid}
        onToggleGrid={() =>
          setViewportState((prev) => ({ ...prev, showGrid: !prev.showGrid }))
        }
        showRulers={viewportState.showRulers}
        onToggleRulers={() =>
          setViewportState((prev) => ({ ...prev, showRulers: !prev.showRulers }))
        }
        snapToGrid={viewportState.snapToGrid}
        onToggleSnap={() =>
          setViewportState((prev) => ({ ...prev, snapToGrid: !prev.snapToGrid }))
        }
        showSafeAreas={viewportState.showSafeAreas}
        onToggleSafeAreas={() =>
          setViewportState((prev) => ({ ...prev, showSafeAreas: !prev.showSafeAreas }))
        }
        onionSkin={viewportState.onionSkin}
        onToggleOnionSkin={() =>
          setViewportState((prev) => ({ ...prev, onionSkin: !prev.onionSkin }))
        }
        autoKeyframe={autoKeyframe}
        onToggleAutoKeyframe={() => setAutoKeyframe((prev) => !prev)}
        onOpenMotionPresets={() => setIsMotionPresetsOpen(true)}
        onAddKeyframe={handleAddKeyframe}
        onOpenKeyframeGuide={() => handleOpenLearningGuide('keyframes')}
        onOpenLearningGuide={handleOpenLearningGuide}
        onStartInteractiveTour={() => setIsInteractiveTourOpen(true)}
        onOpenRealtimeModal={() => setIsRealtimeModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        activeLayoutId={activeLayoutId}
        activeWorkspaceLayout={allLayouts.find((l) => l.id === activeLayoutId) || allLayouts[0]}
        allWorkspaceLayouts={allLayouts}
        onSelectWorkspaceLayout={handleApplyLayout}
        onOpenWorkspaceManager={() => setIsWorkspaceManagerOpen(true)}
        onQuickSaveWorkspace={() => setIsSaveLayoutQuickOpen(true)}
        onResetDefaultWorkspace={handleResetDefaultLayout}
        toolbarVisible={toolbarVisible}
        onToggleToolbarVisible={() => setToolbarVisible(!toolbarVisible)}
        inspectorVisible={inspectorVisible}
        onToggleInspectorVisible={() => setInspectorVisible(!inspectorVisible)}
        timelineVisible={timelineVisible}
        onToggleTimelineVisible={() => setTimelineVisible(!timelineVisible)}
        inspectorPosition={inspectorPosition}
        onToggleInspectorPosition={() =>
          setInspectorPosition(inspectorPosition === 'right' ? 'left' : 'right')
        }
        toolbarPosition={toolbarPosition}
        onToggleToolbarPosition={() =>
          setToolbarPosition(toolbarPosition === 'left' ? 'right' : 'left')
        }
      />

      {/* Main Workspace (Toolbar + Canvas Stage + Inspector) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar if positioned on left */}
        {toolbarVisible && toolbarPosition === 'left' && (
          <Toolbar
            position="left"
            onDismiss={() => setToolbarVisible(false)}
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            onAddLayer={(type) => handleAddLayer(type)}
            showGrid={viewportState.showGrid}
            onToggleGrid={() =>
              setViewportState((prev) => ({ ...prev, showGrid: !prev.showGrid }))
            }
            snapToGrid={viewportState.snapToGrid}
            onToggleSnap={() =>
              setViewportState((prev) => ({ ...prev, snapToGrid: !prev.snapToGrid }))
            }
            showSafeAreas={viewportState.showSafeAreas}
            onToggleSafeAreas={() =>
              setViewportState((prev) => ({ ...prev, showSafeAreas: !prev.showSafeAreas }))
            }
            onionSkin={viewportState.onionSkin}
            onToggleOnionSkin={() =>
              setViewportState((prev) => ({ ...prev, onionSkin: !prev.onionSkin }))
            }
            autoKeyframe={autoKeyframe}
            onToggleAutoKeyframe={() => setAutoKeyframe((prev) => !prev)}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onResetTime={() => setCurrentTime(0)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyPast.length > 0}
            canRedo={historyFuture.length > 0}
            viewportZoom={viewportState.zoom}
            onSetViewportZoom={(zoom) => setViewportState((prev) => ({ ...prev, zoom }))}
            onResetViewport={handleResetViewport}
            selectedLayerIds={selectedLayerIds}
            onOpenMotionPresets={() => setIsMotionPresetsOpen(true)}
            onAddKeyframe={handleAddKeyframe}
          />
        )}

        {/* Left Inspector if positioned on left */}
        {inspectorVisible && inspectorPosition === 'left' && (
          <PropertyInspector
            position="left"
            onDismiss={() => setInspectorVisible(false)}
            layer={selectedLayer}
            composition={composition}
            currentTime={currentTime}
            selectedLayersCount={selectedLayerIds.length}
            autoKeyframe={autoKeyframe}
            width={inspectorWidth}
            defaultTab={inspectorActiveTab}
            onUpdateLayer={handleUpdateLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onDeleteLayer={handleDeleteLayer}
            onUpdateComposition={handleUpdateComposition}
            onAddLayer={handleAddLayer}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenCompSettings={() => setIsCompSettingsOpen(true)}
            onReorderLayer={handleReorderLayerDirection}
            onOpenMotionPresets={() => setIsMotionPresetsOpen(true)}
            onAddKeyframeQuick={handleAddKeyframe}
          />
        )}

        {/* Center Canvas Viewport */}
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden h-full">
          <CanvasViewport
            composition={composition}
            currentTime={currentTime}
            selectedLayerIds={selectedLayerIds}
            autoKeyframe={autoKeyframe}
            onSelectLayer={handleSelectLayer}
            onSelectMultipleLayers={handleSelectMultipleLayers}
            onUpdateLayerTransform={handleUpdateLayerTransform}
            onAddLayerAtPos={(type, pos, options) => handleAddLayer(type, pos, options)}
            onSelectTool={setActiveTool}
            onUpdateLayer={handleUpdateLayer}
            activeTool={activeTool}
            viewportState={viewportState}
            onUpdateViewport={(up) => setViewportState((prev) => ({ ...prev, ...up }))}
            isPlaying={isPlaying}
            onDuplicateLayer={handleDuplicateLayer}
            onDeleteLayer={handleDeleteLayer}
            onReorderLayer={handleReorderLayerDirection}
            onAddKeyframe={handleAddKeyframe}
            onApplyFigmaAlign={handleApplyFigmaAlign}
            onOpenMotionPresets={() => setIsMotionPresetsOpen(true)}
            onResetViewport={handleResetViewport}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onHistorySnapshot={() => pushHistory(composition)}
            onUpdateCompositionGuides={handleUpdateGuides}
          />

          {/* Tablet & Floating HUD Workspace Controls (Maximize Animation Canvas) */}
          <TabletFloatingControls
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            toolbarVisible={toolbarVisible}
            onToggleToolbar={() => setToolbarVisible((prev) => !prev)}
            inspectorVisible={inspectorVisible}
            onToggleInspector={() => setInspectorVisible((prev) => !prev)}
            timelineVisible={timelineVisible}
            onToggleTimeline={() => setTimelineVisible((prev) => !prev)}
            viewportState={viewportState}
            onUpdateViewport={(up) => setViewportState((prev) => ({ ...prev, ...up }))}
            onResetViewport={handleResetViewport}
            isTabletView={isTablet}
          />

          {/* Floating Transport HUD when timeline is hidden */}
          {!timelineVisible && (
            <FloatingTransportHUD
              composition={composition}
              currentTime={currentTime}
              onSetTime={setCurrentTime}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onRestoreTimeline={() => setTimelineVisible(true)}
              onOpenWorkspaceManager={() => setIsWorkspaceManagerOpen(true)}
            />
          )}

          {/* Edge Restore Solapas / Tabs for Collapsed Side Panels */}
          {/* Left Edge Tabs */}
          {((!toolbarVisible && toolbarPosition === 'left') ||
            (!inspectorVisible && inspectorPosition === 'left')) && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 items-start pointer-events-auto">
              {!toolbarVisible && toolbarPosition === 'left' && (
                <button
                  id="restore-toolbar-left-tab"
                  onClick={() => setToolbarVisible(true)}
                  title="Mostrar Barra de Herramientas (Clic para expandir)"
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-blue-400 border border-zinc-750 border-l-0 rounded-r-md shadow-lg px-2 py-3 flex flex-col items-center gap-1.5 transition-all group cursor-pointer hover:pl-2.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                  <Wrench className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400" />
                  <span className="[writing-mode:vertical-rl] text-[9px] uppercase font-bold tracking-wider text-zinc-400 group-hover:text-zinc-200">
                    Herramientas
                  </span>
                </button>
              )}
              {!inspectorVisible && inspectorPosition === 'left' && (
                <button
                  id="restore-inspector-left-tab"
                  onClick={() => setInspectorVisible(true)}
                  title="Mostrar Inspector de Propiedades (Clic para expandir)"
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-blue-400 border border-zinc-750 border-l-0 rounded-r-md shadow-lg px-2 py-3 flex flex-col items-center gap-1.5 transition-all group cursor-pointer hover:pl-2.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                  <Sliders className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400" />
                  <span className="[writing-mode:vertical-rl] text-[9px] uppercase font-bold tracking-wider text-zinc-400 group-hover:text-zinc-200">
                    Propiedades
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Right Edge Tabs */}
          {((!toolbarVisible && toolbarPosition === 'right') ||
            (!inspectorVisible && inspectorPosition === 'right')) && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 items-end pointer-events-auto">
              {!toolbarVisible && toolbarPosition === 'right' && (
                <button
                  id="restore-toolbar-right-tab"
                  onClick={() => setToolbarVisible(true)}
                  title="Mostrar Barra de Herramientas (Clic para expandir)"
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-blue-400 border border-zinc-750 border-r-0 rounded-l-md shadow-lg px-2 py-3 flex flex-col items-center gap-1.5 transition-all group cursor-pointer hover:pr-2.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400 transition-transform group-hover:-translate-x-0.5" />
                  <Wrench className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400" />
                  <span className="[writing-mode:vertical-rl] text-[9px] uppercase font-bold tracking-wider text-zinc-400 group-hover:text-zinc-200">
                    Herramientas
                  </span>
                </button>
              )}
              {!inspectorVisible && inspectorPosition === 'right' && (
                <button
                  id="restore-inspector-right-tab"
                  onClick={() => setInspectorVisible(true)}
                  title="Mostrar Inspector de Propiedades (Clic para expandir)"
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-blue-400 border border-zinc-750 border-r-0 rounded-l-md shadow-lg px-2 py-3 flex flex-col items-center gap-1.5 transition-all group cursor-pointer hover:pr-2.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400 transition-transform group-hover:-translate-x-0.5" />
                  <Sliders className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400" />
                  <span className="[writing-mode:vertical-rl] text-[9px] uppercase font-bold tracking-wider text-zinc-400 group-hover:text-zinc-200">
                    Propiedades
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Bottom Edge Tab for Collapsed Timeline */}
          {!timelineVisible && (
            <button
              id="restore-timeline-bottom-tab"
              onClick={() => setTimelineVisible(true)}
              title="Mostrar Línea de Tiempo (Clic para expandir)"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-blue-400 border border-zinc-750 border-b-0 rounded-t-md shadow-xl px-4 py-1.5 flex items-center gap-2 transition-all group cursor-pointer hover:pb-2"
            >
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400 transition-transform group-hover:-translate-y-0.5" />
              <Film className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                Línea de Tiempo
              </span>
            </button>
          )}
        </div>

        {/* Right Toolbar if positioned on right */}
        {toolbarVisible && toolbarPosition === 'right' && (
          <Toolbar
            position="right"
            onDismiss={() => setToolbarVisible(false)}
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            onAddLayer={(type) => handleAddLayer(type)}
            showGrid={viewportState.showGrid}
            onToggleGrid={() =>
              setViewportState((prev) => ({ ...prev, showGrid: !prev.showGrid }))
            }
            snapToGrid={viewportState.snapToGrid}
            onToggleSnap={() =>
              setViewportState((prev) => ({ ...prev, snapToGrid: !prev.snapToGrid }))
            }
            showSafeAreas={viewportState.showSafeAreas}
            onToggleSafeAreas={() =>
              setViewportState((prev) => ({ ...prev, showSafeAreas: !prev.showSafeAreas }))
            }
            onionSkin={viewportState.onionSkin}
            onToggleOnionSkin={() =>
              setViewportState((prev) => ({ ...prev, onionSkin: !prev.onionSkin }))
            }
            autoKeyframe={autoKeyframe}
            onToggleAutoKeyframe={() => setAutoKeyframe((prev) => !prev)}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onResetTime={() => setCurrentTime(0)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyPast.length > 0}
            canRedo={historyFuture.length > 0}
            viewportZoom={viewportState.zoom}
            onSetViewportZoom={(zoom) => setViewportState((prev) => ({ ...prev, zoom }))}
            onResetViewport={handleResetViewport}
            selectedLayerIds={selectedLayerIds}
            onOpenMotionPresets={() => setIsMotionPresetsOpen(true)}
            onAddKeyframe={handleAddKeyframe}
          />
        )}

        {/* Right Property Inspector if positioned on right */}
        {inspectorVisible && inspectorPosition === 'right' && (
          <PropertyInspector
            position="right"
            onDismiss={() => setInspectorVisible(false)}
            layer={selectedLayer}
            composition={composition}
            currentTime={currentTime}
            selectedLayersCount={selectedLayerIds.length}
            autoKeyframe={autoKeyframe}
            width={inspectorWidth}
            defaultTab={inspectorActiveTab}
            onUpdateLayer={handleUpdateLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onDeleteLayer={handleDeleteLayer}
            onUpdateComposition={handleUpdateComposition}
            onAddLayer={handleAddLayer}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenCompSettings={() => setIsCompSettingsOpen(true)}
            onReorderLayer={handleReorderLayerDirection}
            onOpenMotionPresets={() => setIsMotionPresetsOpen(true)}
            onAddKeyframeQuick={handleAddKeyframe}
          />
        )}
      </div>

      {/* Bottom Timeline & Keyframe Panel */}
      {timelineVisible && (
        <TimelinePanel
          composition={composition}
          currentTime={currentTime}
          onSetTime={setCurrentTime}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          autoKeyframe={autoKeyframe}
          onToggleAutoKeyframe={() => setAutoKeyframe((prev) => !prev)}
          selectedLayerIds={selectedLayerIds}
          onSelectLayer={handleSelectLayer}
          onUpdateLayer={handleUpdateLayer}
          onDeleteLayer={handleDeleteLayer}
          onDuplicateLayer={handleDuplicateLayer}
          onReorderLayers={handleReorderLayersByIndex}
          onReorderLayerDirection={handleReorderLayerDirection}
          onOpenMotionPresets={() => setIsMotionPresetsOpen(true)}
          onDismiss={() => setTimelineVisible(false)}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        composition={composition}
      />

      {/* New Composition Modal (Prompts Dimensions / Google Ads Presets) */}
      <NewCompModal
        isOpen={isNewCompModalOpen}
        onClose={() => setIsNewCompModalOpen(false)}
        onCreateComposition={handleCreateNewComposition}
      />

      {/* Presets Modal */}
      <PresetLibraryModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectComposition={(comp) => {
          pushHistory(composition);
          setComposition(comp);
          setSelectedLayerIds(comp.layers.length > 0 ? [comp.layers[0].id] : []);
          setCurrentTime(0);
        }}
        onNewBlankComposition={handleOpenNewCompModal}
      />

      {/* Motion Presets (GSAP Animation Library) Modal */}
      <MotionPresetsModal
        isOpen={isMotionPresetsOpen}
        onClose={() => setIsMotionPresetsOpen(false)}
        selectedLayer={selectedLayer}
        currentTime={currentTime}
        onUpdateLayer={handleUpdateLayer}
      />

      {/* Keyframe Guide Modal (Google Web Designer Style Tutorial) */}
      <KeyframeGuideModal
        isOpen={isKeyframeGuideOpen}
        onClose={() => setIsKeyframeGuideOpen(false)}
        onOpenPresets={() => setIsMotionPresetsOpen(true)}
      />

      {/* Master Interactive Learning Guide Modal */}
      <LearningGuideModal
        isOpen={isLearningGuideOpen}
        onClose={() => setIsLearningGuideOpen(false)}
        initialSection={learningGuideSection}
        onStartInteractiveTour={() => setIsInteractiveTourOpen(true)}
        onOpenPresets={() => setIsMotionPresetsOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Interactive Step-by-Step UI Tour */}
      <InteractiveTour
        isOpen={isInteractiveTourOpen}
        onClose={() => setIsInteractiveTourOpen(false)}
        onOpenGuidesModal={() => handleOpenLearningGuide('overview')}
      />

      {/* Composition Settings Dialog (Ctrl+K) */}
      <CompSettingsModal
        isOpen={isCompSettingsOpen}
        onClose={() => setIsCompSettingsOpen(false)}
        composition={composition}
        onSave={handleUpdateComposition}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Photoshop PSD Importer Modal */}
      <PsdImportModal
        isOpen={isPsdModalOpen}
        onClose={() => setIsPsdModalOpen(false)}
        currentComposition={composition}
        onImportAsNewComposition={handleImportAsNewComposition}
        onInsertLayersIntoCurrent={handleInsertPsdLayers}
      />

      {/* Real-time Collaboration & WebSocket Modal */}
      <RealtimeSyncModal
        isOpen={isRealtimeModalOpen}
        onClose={() => setIsRealtimeModalOpen(false)}
      />

      {/* Welcome / Startup Project Launcher (Always asks what to do on startup) */}
      <WelcomeLauncherModal
        isOpen={isWelcomeLauncherOpen}
        onClose={() => setIsWelcomeLauncherOpen(false)}
        onCreateNewComp={(newCompData) => {
          pushHistory(composition);
          setComposition({
            id: 'comp_' + Math.random().toString(36).substring(2, 9),
            ...newCompData,
            layers: [],
          });
          setSelectedLayerIds([]);
          setCurrentTime(0);
        }}
        onOpenPsdModal={() => setIsPsdModalOpen(true)}
        onOpenPresetModal={() => setIsPresetModalOpen(true)}
        onOpenProjectJson={handleOpenProjectJson}
      />

      {/* Figma-Style Quick Command Palette (Ctrl+K or /) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={setActiveTool}
        onAddLayer={(type) => handleAddLayer(type)}
        onApplyFigmaAlign={handleApplyFigmaAlign}
        onApplyEasing={handleApplyEasingToSelected}
        onApplyEffect={handleApplyEffect}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPsdModal={() => setIsPsdModalOpen(true)}
        onOpenPresetModal={() => setIsPresetModalOpen(true)}
        onOpenCompSettings={() => setIsCompSettingsOpen(true)}
        onOpenReframeModal={() => setIsReframeModalOpen(true)}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        isPlaying={isPlaying}
      />

      {/* Intelligent Reframe Modal (Dimension Adapting) */}
      <ReframeModal
        isOpen={isReframeModalOpen}
        onClose={() => setIsReframeModalOpen(false)}
        composition={composition}
        onApplyReframe={handleApplyReframe}
      />

      {/* Model Context Protocol (MCP) Integration Modal for OpenCode / Claude / Cursor */}
      <McpModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
      />

      {/* Workspace Layouts & Creative Focus Modes Modal */}
      <WorkspaceLayoutModal
        isOpen={isWorkspaceManagerOpen}
        onClose={() => setIsWorkspaceManagerOpen(false)}
        activeLayoutId={activeLayoutId}
        onApplyLayout={handleApplyLayout}
        currentConfig={{
          toolbar: {
            visible: toolbarVisible,
            position: toolbarPosition,
            compact: toolbarCompact,
          },
          inspector: {
            visible: inspectorVisible,
            position: inspectorPosition,
            width: inspectorWidth,
            activeTab: inspectorActiveTab,
          },
          timeline: {
            visible: timelineVisible,
            height: timelineHeight,
            collapsed: timelineCollapsed,
          },
          viewport: {
            showGrid: viewportState.showGrid,
            showRulers: viewportState.showRulers,
            showSafeAreas: viewportState.showSafeAreas,
            snapToGrid: viewportState.snapToGrid,
            onionSkin: viewportState.onionSkin,
          },
        }}
      />

      {/* Quick Save Custom Workspace Preset Modal */}
      <SaveLayoutQuickModal
        isOpen={isSaveLayoutQuickOpen}
        onClose={() => setIsSaveLayoutQuickOpen(false)}
        currentConfig={{
          toolbar: {
            visible: toolbarVisible,
            position: toolbarPosition,
            compact: toolbarCompact,
          },
          inspector: {
            visible: inspectorVisible,
            position: inspectorPosition,
            width: inspectorWidth,
            activeTab: inspectorActiveTab,
          },
          timeline: {
            visible: timelineVisible,
            height: timelineHeight,
            collapsed: timelineCollapsed,
          },
          viewport: {
            showGrid: viewportState.showGrid,
            showRulers: viewportState.showRulers,
            showSafeAreas: viewportState.showSafeAreas,
            snapToGrid: viewportState.snapToGrid,
            onionSkin: viewportState.onionSkin,
          },
        }}
        onSave={handleSaveCurrentAsLayout}
      />
    </div>
  );
}
