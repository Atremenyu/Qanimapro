import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Composition,
  VectorLayer,
  ToolType,
  ViewportState,
  PathNode,
  CustomGuide,
} from '../types';
import { evaluateLayer, generateStarPath, generatePolygonPath } from '../utils/animEngine';
import { CustomLayerOptions } from '../data/presets';
import { FigmaAlignAction, computeSnapGuidelines, SnapGuideLine, findGuideSnapPoint } from '../utils/figmaTools';
import { CanvasRulers } from './CanvasRulers';
import { preloadCompositionFonts } from '../utils/googleFonts';
import {
  Check,
  X,
  CornerDownLeft,
  Sparkles,
  HelpCircle,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Move,
  Scaling,
  RotateCw,
  SunMedium,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Plus,
  ZoomIn,
  Grid,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Square,
  Circle,
  Star,
  Hexagon,
  Type,
  PenTool,
  Clock,
  FlipHorizontal,
  FlipVertical,
} from 'lucide-react';

interface CanvasViewportProps {
  composition: Composition;
  currentTime: number;
  selectedLayerIds: string[];
  autoKeyframe?: boolean;
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onSelectMultipleLayers?: (ids: string[]) => void;
  onUpdateLayerTransform: (layerId: string, transformUpdate: Partial<VectorLayer['transform']>) => void;
  onAddLayerAtPos: (type: VectorLayer['type'], pos: { x: number; y: number }, options?: CustomLayerOptions) => void;
  onSelectTool?: (tool: ToolType) => void;
  onUpdateLayer?: (layerId: string, updated: Partial<VectorLayer>) => void;
  activeTool: ToolType;
  viewportState: ViewportState;
  onUpdateViewport: (updated: Partial<ViewportState>) => void;
  isPlaying: boolean;
  onDuplicateLayer?: (id: string) => void;
  onDeleteLayer?: (id: string) => void;
  onReorderLayer?: (id: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
  onAddKeyframe?: (type: 'rotation' | 'scale' | 'opacity' | 'position' | 'all') => void;
  onApplyFigmaAlign?: (action: FigmaAlignAction) => void;
  onOpenMotionPresets?: () => void;
  onResetViewport?: () => void;
  onTogglePlay?: () => void;
  onHistorySnapshot?: () => void;
  onUpdateCompositionGuides?: (guides: CustomGuide[]) => void;
}

interface InternalPenNode {
  id: string;
  x: number;
  y: number;
  handleIn: { x: number; y: number };
  handleOut: { x: number; y: number };
}

// Helper to build SVG path d string from nodes
function buildSvgPathFromNodes(nodes: { x: number; y: number; handleIn?: { x: number; y: number }; handleOut?: { x: number; y: number } }[], closed: boolean = false): string {
  if (nodes.length === 0) return '';
  let d = `M ${nodes[0].x.toFixed(1)} ${nodes[0].y.toFixed(1)}`;
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const cp1x = prev.x + (prev.handleOut?.x || 0);
    const cp1y = prev.y + (prev.handleOut?.y || 0);
    const cp2x = curr.x + (curr.handleIn?.x || 0);
    const cp2y = curr.y + (curr.handleIn?.y || 0);

    const hasCurves =
      (prev.handleOut && (Math.abs(prev.handleOut.x) > 0.5 || Math.abs(prev.handleOut.y) > 0.5)) ||
      (curr.handleIn && (Math.abs(curr.handleIn.x) > 0.5 || Math.abs(curr.handleIn.y) > 0.5));

    if (hasCurves) {
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    } else {
      d += ` L ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }
  }

  if (closed && nodes.length > 2) {
    const prev = nodes[nodes.length - 1];
    const curr = nodes[0];
    const cp1x = prev.x + (prev.handleOut?.x || 0);
    const cp1y = prev.y + (prev.handleOut?.y || 0);
    const cp2x = curr.x + (curr.handleIn?.x || 0);
    const cp2y = curr.y + (curr.handleIn?.y || 0);

    const hasCurves =
      (prev.handleOut && (Math.abs(prev.handleOut.x) > 0.5 || Math.abs(prev.handleOut.y) > 0.5)) ||
      (curr.handleIn && (Math.abs(curr.handleIn.x) > 0.5 || Math.abs(curr.handleIn.y) > 0.5));

    if (hasCurves) {
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }
    d += ' Z';
  }

  return d;
}

// Calculate approximate bounding box for a layer at a given time
function getLayerBoundingBox(layer: VectorLayer, time: number, allLayers?: VectorLayer[]) {
  const props = evaluateLayer(layer, time, allLayers);
  const { position, scale } = props;
  const scaleX = Math.abs((scale?.x ?? 100) / 100);
  const scaleY = Math.abs((scale?.y ?? 100) / 100);

  let halfW = 40 * scaleX;
  let halfH = 40 * scaleY;
  let offsetX = 0;
  let offsetY = 0;

  if (layer.type === 'rect' && props.rect) {
    halfW = (props.rect.width / 2) * scaleX;
    halfH = (props.rect.height / 2) * scaleY;
  } else if (layer.type === 'circle' && props.circle) {
    halfW = props.circle.radiusX * scaleX;
    halfH = props.circle.radiusY * scaleY;
  } else if (layer.type === 'star' && props.star) {
    halfW = props.star.outerRadius * scaleX;
    halfH = props.star.outerRadius * scaleY;
  } else if (layer.type === 'polygon' && props.polygon) {
    halfW = props.polygon.radius * scaleX;
    halfH = props.polygon.radius * scaleY;
  } else if (layer.type === 'text' && props.text && layer.text) {
    const rawLines = (layer.text.text || '').split('\n');
    const maxChars = Math.max(1, ...rawLines.map((l) => l.length));
    const lineCount = Math.max(1, rawLines.length);
    const fs = props.text.fontSize;
    const letterSpacing = props.text.letterSpacing || 0;
    const estW = (maxChars * fs * 0.58 + maxChars * letterSpacing) * scaleX;
    const estH = (lineCount * fs * 1.25) * scaleY;
    halfW = estW / 2;
    halfH = estH / 2;

    const alignH = layer.text.textAnchor || (
      layer.text.textAlign === 'left' ? 'start' : layer.text.textAlign === 'right' ? 'end' : 'middle'
    );
    if (alignH === 'start') {
      offsetX = halfW;
    } else if (alignH === 'end') {
      offsetX = -halfW;
    }

    const alignV = layer.text.verticalAlign || 'middle';
    if (alignV === 'top') {
      offsetY = halfH;
    } else if (alignV === 'bottom') {
      offsetY = -halfH;
    }
  } else if (layer.type === 'image' && props.image) {
    halfW = (props.image.width / 2) * scaleX;
    halfH = (props.image.height / 2) * scaleY;
  } else if (layer.type === 'path') {
    halfW = 50 * scaleX;
    halfH = 50 * scaleY;
  }

  const posX = (position?.x ?? 0) + offsetX;
  const posY = (position?.y ?? 0) + offsetY;

  return {
    minX: posX - halfW,
    maxX: posX + halfW,
    minY: posY - halfH,
    maxY: posY + halfH,
    centerX: posX,
    centerY: posY,
    width: halfW * 2,
    height: halfH * 2,
    halfW,
    halfH,
  };
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  composition,
  currentTime,
  selectedLayerIds,
  autoKeyframe = true,
  onSelectLayer,
  onSelectMultipleLayers,
  onUpdateLayerTransform,
  onAddLayerAtPos,
  onSelectTool,
  onUpdateLayer,
  activeTool,
  viewportState,
  onUpdateViewport,
  isPlaying,
  onDuplicateLayer,
  onDeleteLayer,
  onReorderLayer,
  onAddKeyframe,
  onApplyFigmaAlign,
  onOpenMotionPresets,
  onResetViewport,
  onTogglePlay,
  onHistorySnapshot,
  onUpdateCompositionGuides,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<SVGSVGElement>(null);

  // Custom Rulers & Guide Lines State
  const [localGuides, setLocalGuides] = useState<CustomGuide[]>(composition.guides || []);
  const [draggingGuide, setDraggingGuide] = useState<{
    id?: string;
    axis: 'horizontal' | 'vertical';
    currentPos: number;
    isSnapped: boolean;
    snapLabel?: string;
    snappedBox?: import('../utils/figmaTools').BoundingBox;
    isDeleteHover?: boolean;
  } | null>(null);
  const [draggingCursorPos, setDraggingCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredGuideId, setHoveredGuideId] = useState<string | null>(null);
  const [guideContextMenu, setGuideContextMenu] = useState<{ x: number; y: number; guideId: string } | null>(null);

  useEffect(() => {
    if (composition.guides) {
      setLocalGuides(composition.guides);
    }
  }, [composition.guides]);

  const activeGuides = composition.guides ?? localGuides;

  const updateGuides = useCallback((newGuides: CustomGuide[]) => {
    setLocalGuides(newGuides);
    if (onHistorySnapshot) {
      onHistorySnapshot();
    }
    if (onUpdateCompositionGuides) {
      onUpdateCompositionGuides(newGuides);
    }
  }, [onHistorySnapshot, onUpdateCompositionGuides]);

  const handleDeleteGuide = useCallback((guideId: string) => {
    updateGuides(activeGuides.filter((g) => g.id !== guideId));
  }, [activeGuides, updateGuides]);

  const handleClearAllGuides = useCallback(() => {
    updateGuides([]);
  }, [updateGuides]);

  const handleAddGuideAtPosition = useCallback((axis: 'horizontal' | 'vertical', pos: number) => {
    const newGuide: CustomGuide = {
      id: `guide_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      axis,
      position: pos,
    };
    updateGuides([...activeGuides, newGuide]);
  }, [activeGuides, updateGuides]);

  // Close guide context menu on outside click
  useEffect(() => {
    const handleCloseMenu = () => setGuideContextMenu(null);
    if (guideContextMenu) {
      window.addEventListener('mousedown', handleCloseMenu);
      return () => window.removeEventListener('mousedown', handleCloseMenu);
    }
  }, [guideContextMenu]);

  // Canvas Right Click Context Menu State
  const [canvasContextMenu, setCanvasContextMenu] = useState<{
    x: number;
    y: number;
    stageX: number;
    stageY: number;
    layerId?: string;
  } | null>(null);

  // Pan & Viewport Drag Interaction States
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Transform Gizmo States
  const [activeGizmoMode, setActiveGizmoMode] = useState<
    'translate' | 'rotate' | 'scale' | 'anchor' | null
  >(null);
  const [activeGizmoHandle, setActiveGizmoHandle] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [layerInitialState, setLayerInitialState] = useState<{
    position: { x: number; y: number };
    scale: { x: number; y: number };
    rotation: number;
    anchorPoint: { x: number; y: number };
    width?: number;
    height?: number;
    targetLayerId?: string;
  } | null>(null);

  const [liveDragInfo, setLiveDragInfo] = useState<{
    x: number;
    y: number;
    dx: number;
    dy: number;
    w?: number;
    h?: number;
    mode: 'translate' | 'scale' | 'rotate';
  } | null>(null);

  const [multiLayerInitialPositions, setMultiLayerInitialPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  // Smart Snapping Guidelines State
  const [activeSnapGuides, setActiveSnapGuides] = useState<SnapGuideLine[]>([]);

  // Preload any Google Fonts dynamically when composition layers change
  useEffect(() => {
    preloadCompositionFonts(composition.layers);
  }, [composition.layers]);

  // Marquee Selection Box State
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [marqueeAdditive, setMarqueeAdditive] = useState<boolean>(false);
  const [marqueeInitialIds, setMarqueeInitialIds] = useState<string[]>([]);
  const isMarqueeRef = useRef(false);
  const marqueeMovedRef = useRef(false);

  // --- 1. INTERACTIVE SHAPE DRAG-TO-CREATE STATE ---
  const [isDrawingShape, setIsDrawingShape] = useState<boolean>(false);
  const [shapeStartPos, setShapeStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shapeCurrentPos, setShapeCurrentPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shapeShiftKey, setShapeShiftKey] = useState<boolean>(false);
  const [shapeAltKey, setShapeAltKey] = useState<boolean>(false);

  // --- 2. PHOTOSHOP-STYLE BEZIER PEN TOOL STATE ---
  const [penNodes, setPenNodes] = useState<InternalPenNode[]>([]);
  const [activePenNodeIndex, setActivePenNodeIndex] = useState<number | null>(null);
  const [isDraggingPenHandle, setIsDraggingPenHandle] = useState<boolean>(false);
  const [penCursorPos, setPenCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringFirstPenNode, setIsHoveringFirstPenNode] = useState<boolean>(false);

  // --- 3. DIRECT SELECTION (A) NODE EDITING STATE ---
  const [draggedNodeIndex, setDraggedNodeIndex] = useState<{
    layerId: string;
    nodeIndex: number;
    type: 'point' | 'handleIn' | 'handleOut';
  } | null>(null);

  // Drag & Drop Image onto Canvas State
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  // Wheel to Zoom / Pan
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
        const newZoom = Math.max(0.2, Math.min(3.5, viewportState.zoom + zoomDelta));
        onUpdateViewport({ zoom: newZoom });
      } else {
        onUpdateViewport({
          pan: {
            x: viewportState.pan.x - e.deltaX * 0.8,
            y: viewportState.pan.y - e.deltaY * 0.8,
          },
        });
      }
    },
    [viewportState, onUpdateViewport]
  );

  // Screen to Stage Coordinate conversion
  const screenToStage = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      if (!stageRef.current) return { x: 0, y: 0 };
      const rect = stageRef.current.getBoundingClientRect();
      const rawX = (clientX - rect.left) / (rect.width / composition.width);
      const rawY = (clientY - rect.top) / (rect.height / composition.height);
      return { x: Math.round(rawX), y: Math.round(rawY) };
    },
    [composition.width, composition.height]
  );

  // Selected layer reference (primary active layer)
  const selectedLayer = (composition.layers || []).find(
    (l) => selectedLayerIds.includes(l.id) && l.visible && !l.locked
  );

  const evaluatedSelected = selectedLayer
    ? evaluateLayer(selectedLayer, currentTime, composition.layers || [])
    : null;

  // Finish Pen Path and create VectorLayer
  const finishPenPath = useCallback(
    (closed: boolean = false) => {
      if (penNodes.length < 2) {
        setPenNodes([]);
        setActivePenNodeIndex(null);
        setIsDraggingPenHandle(false);
        return;
      }

      // Calculate path bounding box to center position
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      penNodes.forEach((n) => {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
      });

      const centerX = Math.round((minX + maxX) / 2);
      const centerY = Math.round((minY + maxY) / 2);

      // Convert nodes to relative coords
      const relativeNodes: PathNode[] = penNodes.map((n) => ({
        x: Math.round(n.x - centerX),
        y: Math.round(n.y - centerY),
        handleIn: { x: Math.round(n.handleIn.x), y: Math.round(n.handleIn.y) },
        handleOut: { x: Math.round(n.handleOut.x), y: Math.round(n.handleOut.y) },
      }));

      const dString = buildSvgPathFromNodes(relativeNodes, closed);

      onAddLayerAtPos(
        'path',
        { x: centerX, y: centerY },
        {
          d: dString,
          nodes: relativeNodes,
          closed,
          fill: closed ? '#38bdf8' : 'none',
          fillOpacity: closed ? 80 : 0,
          stroke: '#60a5fa',
          strokeWidth: 3,
        }
      );

      setPenNodes([]);
      setActivePenNodeIndex(null);
      setIsDraggingPenHandle(false);
      if (onSelectTool) onSelectTool('select');
    },
    [penNodes, onAddLayerAtPos, onSelectTool]
  );

  // Keyboard shortcut listener (Enter/Escape to finish pen path, Backspace to delete last node)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTool === 'pen') {
        if (e.key === 'Enter') {
          e.preventDefault();
          finishPenPath(false);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          if (penNodes.length > 0) {
            setPenNodes([]);
            setActivePenNodeIndex(null);
          }
          if (onSelectTool) onSelectTool('select');
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          if (penNodes.length > 0) {
            e.preventDefault();
            setPenNodes((prev) => prev.slice(0, prev.length - 1));
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, penNodes, finishPenPath, onSelectTool]);

  // Selected layer bounding box for highlighting spans on rulers
  const selectedBounds = selectedLayer
    ? getLayerBoundingBox(selectedLayer, currentTime, composition.layers)
    : null;

  // --- INTERACTIVE RULER & CUSTOM GUIDE DRAG HANDLERS ---
  const handleStartDragNewGuide = useCallback(
    (axis: 'horizontal' | 'vertical', e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!containerRef.current || !stageRef.current) return;

      const containerBounds = containerRef.current.getBoundingClientRect();
      const stageBounds = stageRef.current.getBoundingClientRect();
      const zoom = viewportState.zoom;

      setDraggingCursorPos({ x: e.clientX - containerBounds.left, y: e.clientY - containerBounds.top });

      const rawCoord = axis === 'horizontal'
        ? (e.clientY - stageBounds.top) / zoom
        : (e.clientX - stageBounds.left) / zoom;

      const initialSnap = findGuideSnapPoint(
        axis,
        rawCoord,
        composition.layers,
        composition.width,
        composition.height,
        currentTime,
        8 / zoom
      );

      setDraggingGuide({
        axis,
        currentPos: initialSnap.isSnapped ? initialSnap.snappedPosition : Math.round(rawCoord),
        isSnapped: initialSnap.isSnapped,
        snapLabel: initialSnap.label,
        snappedBox: initialSnap.boundingBox,
        isDeleteHover: false,
      });

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!containerRef.current || !stageRef.current) return;
        const curContainerBounds = containerRef.current.getBoundingClientRect();
        const curStageBounds = stageRef.current.getBoundingClientRect();

        setDraggingCursorPos({
          x: moveEvent.clientX - curContainerBounds.left,
          y: moveEvent.clientY - curContainerBounds.top,
        });

        const isOverRuler = axis === 'horizontal'
          ? moveEvent.clientY <= curContainerBounds.top + 24
          : moveEvent.clientX <= curContainerBounds.left + 24;

        const currentRaw = axis === 'horizontal'
          ? (moveEvent.clientY - curStageBounds.top) / zoom
          : (moveEvent.clientX - curStageBounds.left) / zoom;

        const snap = findGuideSnapPoint(
          axis,
          currentRaw,
          composition.layers,
          composition.width,
          composition.height,
          currentTime,
          8 / zoom
        );

        setDraggingGuide({
          axis,
          currentPos: snap.isSnapped ? snap.snappedPosition : Math.round(currentRaw),
          isSnapped: snap.isSnapped,
          snapLabel: snap.label,
          snappedBox: snap.boundingBox,
          isDeleteHover: isOverRuler,
        });
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        if (!containerRef.current || !stageRef.current) {
          setDraggingGuide(null);
          setDraggingCursorPos(null);
          return;
        }

        const curContainerBounds = containerRef.current.getBoundingClientRect();
        const curStageBounds = stageRef.current.getBoundingClientRect();

        const isOverRuler = axis === 'horizontal'
          ? upEvent.clientY <= curContainerBounds.top + 24
          : upEvent.clientX <= curContainerBounds.left + 24;

        if (!isOverRuler) {
          const currentRaw = axis === 'horizontal'
            ? (upEvent.clientY - curStageBounds.top) / zoom
            : (upEvent.clientX - curStageBounds.left) / zoom;

          const snap = findGuideSnapPoint(
            axis,
            currentRaw,
            composition.layers,
            composition.width,
            composition.height,
            currentTime,
            8 / zoom
          );

          const finalPos = snap.isSnapped ? snap.snappedPosition : Math.round(currentRaw);
          const newGuide: CustomGuide = {
            id: `guide_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            axis,
            position: finalPos,
          };

          updateGuides([...activeGuides, newGuide]);
        }

        setDraggingGuide(null);
        setDraggingCursorPos(null);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [composition.layers, composition.width, composition.height, currentTime, viewportState.zoom, activeGuides, updateGuides]
  );

  const handleStartMoveExistingGuide = useCallback(
    (guide: CustomGuide, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!containerRef.current || !stageRef.current) return;

      const containerBounds = containerRef.current.getBoundingClientRect();
      const stageBounds = stageRef.current.getBoundingClientRect();
      const zoom = viewportState.zoom;
      const axis = guide.axis;

      setDraggingCursorPos({ x: e.clientX - containerBounds.left, y: e.clientY - containerBounds.top });

      setDraggingGuide({
        id: guide.id,
        axis,
        currentPos: guide.position,
        isSnapped: false,
        snapLabel: `${axis === 'horizontal' ? 'Y' : 'X'}: ${guide.position}px`,
        isDeleteHover: false,
      });

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!containerRef.current || !stageRef.current) return;
        const curContainerBounds = containerRef.current.getBoundingClientRect();
        const curStageBounds = stageRef.current.getBoundingClientRect();

        setDraggingCursorPos({
          x: moveEvent.clientX - curContainerBounds.left,
          y: moveEvent.clientY - curContainerBounds.top,
        });

        const isOverRuler = axis === 'horizontal'
          ? moveEvent.clientY <= curContainerBounds.top + 24
          : moveEvent.clientX <= curContainerBounds.left + 24;

        const currentRaw = axis === 'horizontal'
          ? (moveEvent.clientY - curStageBounds.top) / zoom
          : (moveEvent.clientX - curStageBounds.left) / zoom;

        const snap = findGuideSnapPoint(
          axis,
          currentRaw,
          composition.layers,
          composition.width,
          composition.height,
          currentTime,
          8 / zoom
        );

        setDraggingGuide({
          id: guide.id,
          axis,
          currentPos: snap.isSnapped ? snap.snappedPosition : Math.round(currentRaw),
          isSnapped: snap.isSnapped,
          snapLabel: snap.label,
          snappedBox: snap.boundingBox,
          isDeleteHover: isOverRuler,
        });
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        if (!containerRef.current || !stageRef.current) {
          setDraggingGuide(null);
          setDraggingCursorPos(null);
          return;
        }

        const curContainerBounds = containerRef.current.getBoundingClientRect();
        const curStageBounds = stageRef.current.getBoundingClientRect();

        const isOverRuler = axis === 'horizontal'
          ? upEvent.clientY <= curContainerBounds.top + 24
          : upEvent.clientX <= curContainerBounds.left + 24;

        if (isOverRuler) {
          updateGuides(activeGuides.filter((g) => g.id !== guide.id));
        } else {
          const currentRaw = axis === 'horizontal'
            ? (upEvent.clientY - curStageBounds.top) / zoom
            : (upEvent.clientX - curStageBounds.left) / zoom;

          const snap = findGuideSnapPoint(
            axis,
            currentRaw,
            composition.layers,
            composition.width,
            composition.height,
            currentTime,
            8 / zoom
          );

          const finalPos = snap.isSnapped ? snap.snappedPosition : Math.round(currentRaw);
          updateGuides(
            activeGuides.map((g) => (g.id === guide.id ? { ...g, position: finalPos } : g))
          );
        }

        setDraggingGuide(null);
        setDraggingCursorPos(null);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [composition.layers, composition.width, composition.height, currentTime, viewportState.zoom, activeGuides, updateGuides]
  );

  // Handle stage mouse down (marquee selection, shape creation, or pen node adding)
  const handleStageMouseDown = (e: React.MouseEvent) => {
    // Middle click or Hand tool initiates panning
    if (e.button === 1 || activeTool === 'hand' || e.altKey && activeTool !== 'pen' && !['rect', 'circle', 'star', 'polygon', 'text'].includes(activeTool)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewportState.pan.x, y: e.clientY - viewportState.pan.y });
      return;
    }

    if (e.button !== 0) return; // Only left click

    const stagePos = screenToStage(e.clientX, e.clientY);

    // --- PEN TOOL INTERACTION ---
    if (activeTool === 'pen') {
      // Check if clicking near first node to close path
      if (penNodes.length >= 2) {
        const firstNode = penNodes[0];
        const dist = Math.hypot(stagePos.x - firstNode.x, stagePos.y - firstNode.y);
        if (dist < 14) {
          finishPenPath(true);
          return;
        }
      }

      // Add new anchor node
      const newNode: InternalPenNode = {
        id: 'pnode_' + Date.now(),
        x: stagePos.x,
        y: stagePos.y,
        handleIn: { x: 0, y: 0 },
        handleOut: { x: 0, y: 0 },
      };

      const newIndex = penNodes.length;
      setPenNodes((prev) => [...prev, newNode]);
      setActivePenNodeIndex(newIndex);
      setIsDraggingPenHandle(true);
      return;
    }

    // --- SHAPE DRAG-TO-CREATE INITIATION ---
    if (['rect', 'circle', 'star', 'polygon', 'text'].includes(activeTool)) {
      setIsDrawingShape(true);
      setShapeStartPos(stagePos);
      setShapeCurrentPos(stagePos);
      setShapeShiftKey(e.shiftKey);
      setShapeAltKey(e.altKey);
      return;
    }

    // --- SELECTION TOOL: START MARQUEE SELECTION ---
    if (activeTool === 'select' || activeTool === 'directSelect') {
      setIsMarqueeSelecting(true);
      isMarqueeRef.current = true;
      marqueeMovedRef.current = false;
      setMarqueeStart(stagePos);
      setMarqueeCurrent(stagePos);
      setMarqueeAdditive(e.shiftKey);
      setMarqueeInitialIds(e.shiftKey ? [...selectedLayerIds] : []);
    }
  };

  // Handle Gizmo drag start
  const handleGizmoStart = (
    mode: 'translate' | 'rotate' | 'scale' | 'anchor',
    handle: string | null,
    e: React.MouseEvent,
    targetLayerOverride?: VectorLayer
  ) => {
    e.stopPropagation();
    const target = targetLayerOverride || selectedLayer;
    if (!target) return;
    const targetEval = targetLayerOverride
      ? evaluateLayer(targetLayerOverride, currentTime, composition.layers)
      : evaluatedSelected;
    if (!targetEval) return;

    onHistorySnapshot?.();

    setActiveGizmoMode(mode);
    setActiveGizmoHandle(handle);
    setDragStartPos({ x: e.clientX, y: e.clientY });

    let baseW = 100;
    let baseH = 100;
    if (target.type === 'image' && targetEval.image) {
      baseW = targetEval.image.width;
      baseH = targetEval.image.height;
    } else if (target.type === 'rect' && targetEval.rect) {
      baseW = targetEval.rect.width;
      baseH = targetEval.rect.height;
    } else if (target.type === 'circle' && targetEval.circle) {
      baseW = targetEval.circle.radiusX * 2;
      baseH = targetEval.circle.radiusY * 2;
    } else if (target.type === 'star' && targetEval.star) {
      baseW = targetEval.star.outerRadius * 2;
      baseH = targetEval.star.outerRadius * 2;
    } else if (target.type === 'polygon' && targetEval.polygon) {
      baseW = targetEval.polygon.radius * 2;
      baseH = targetEval.polygon.radius * 2;
    } else {
      const box = getLayerBoundingBox(target, currentTime, composition.layers);
      baseW = Math.max(20, box.width);
      baseH = Math.max(20, box.height);
    }

    setLayerInitialState({
      position: { ...targetEval.position },
      scale: { ...targetEval.scale },
      rotation: targetEval.rotation,
      anchorPoint: { ...targetEval.anchorPoint },
      width: baseW,
      height: baseH,
      targetLayerId: target.id,
    });

    const positionsMap: Record<string, { x: number; y: number }> = {};
    selectedLayerIds.forEach((id) => {
      const l = composition.layers.find((layer) => layer.id === id);
      if (l) {
        const evalProps = evaluateLayer(l, currentTime, composition.layers);
        positionsMap[id] = { ...evalProps.position };
      }
    });
    setMultiLayerInitialPositions(positionsMap);
  };

  // Canvas Right Click Context Menu Handler
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const stagePos = screenToStage(e.clientX, e.clientY);

    // Check if right click hits a visible unlocked layer
    const hitLayer = [...composition.layers].find((layer) => {
      if (!layer.visible || layer.locked) return false;
      const box = getLayerBoundingBox(layer, currentTime, composition.layers);
      return (
        stagePos.x >= box.minX &&
        stagePos.x <= box.maxX &&
        stagePos.y >= box.minY &&
        stagePos.y <= box.maxY
      );
    });

    if (hitLayer) {
      if (!selectedLayerIds.includes(hitLayer.id)) {
        onSelectLayer(hitLayer.id, false);
      }
      setCanvasContextMenu({
        x: Math.min(window.innerWidth - 260, Math.max(10, e.clientX)),
        y: Math.min(window.innerHeight - 440, Math.max(10, e.clientY)),
        stageX: Math.round(stagePos.x),
        stageY: Math.round(stagePos.y),
        layerId: hitLayer.id,
      });
    } else {
      setCanvasContextMenu({
        x: Math.min(window.innerWidth - 260, Math.max(10, e.clientX)),
        y: Math.min(window.innerHeight - 380, Math.max(10, e.clientY)),
        stageX: Math.round(stagePos.x),
        stageY: Math.round(stagePos.y),
      });
    }
  };

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleOutsideClick = () => {
      if (canvasContextMenu) setCanvasContextMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canvasContextMenu) {
        setCanvasContextMenu(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasContextMenu]);

  // Global mouse move and up listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        onUpdateViewport({
          pan: {
            x: e.clientX - panStart.x,
            y: e.clientY - panStart.y,
          },
        });
        return;
      }

      const stagePos = screenToStage(e.clientX, e.clientY);

      // --- 1. LIVE SHAPE DRAWING PREVIEW ---
      if (isDrawingShape) {
        setShapeCurrentPos(stagePos);
        setShapeShiftKey(e.shiftKey);
        setShapeAltKey(e.altKey);
        return;
      }

      // --- 2. PEN TOOL HANDLE DRAGGING & HOVER ---
      if (activeTool === 'pen') {
        setPenCursorPos(stagePos);

        if (isDraggingPenHandle && activePenNodeIndex !== null) {
          setPenNodes((prev) => {
            const next = [...prev];
            const node = next[activePenNodeIndex];
            if (node) {
              const dx = stagePos.x - node.x;
              const dy = stagePos.y - node.y;
              node.handleOut = { x: dx, y: dy };
              node.handleIn = { x: -dx, y: -dy }; // Symmetrical Bezier curve handle
            }
            return next;
          });
        } else if (penNodes.length >= 2) {
          const firstNode = penNodes[0];
          const dist = Math.hypot(stagePos.x - firstNode.x, stagePos.y - firstNode.y);
          setIsHoveringFirstPenNode(dist < 14);
        } else {
          setIsHoveringFirstPenNode(false);
        }
        return;
      }

      // --- 3. DIRECT SELECTION (A) NODE DRAGGING ---
      if (draggedNodeIndex && onUpdateLayer) {
        const targetLayer = composition.layers.find((l) => l.id === draggedNodeIndex.layerId);
        if (targetLayer && targetLayer.path && targetLayer.path.nodes) {
          const updatedNodes = [...targetLayer.path.nodes];
          const node = { ...updatedNodes[draggedNodeIndex.nodeIndex] };
          const layerPos = targetLayer.transform.position.value;

          if (draggedNodeIndex.type === 'point') {
            node.x = stagePos.x - layerPos.x;
            node.y = stagePos.y - layerPos.y;
          } else if (draggedNodeIndex.type === 'handleOut') {
            node.handleOut = {
              x: stagePos.x - (layerPos.x + node.x),
              y: stagePos.y - (layerPos.y + node.y),
            };
          } else if (draggedNodeIndex.type === 'handleIn') {
            node.handleIn = {
              x: stagePos.x - (layerPos.x + node.x),
              y: stagePos.y - (layerPos.y + node.y),
            };
          }

          updatedNodes[draggedNodeIndex.nodeIndex] = node;
          const newD = buildSvgPathFromNodes(updatedNodes, targetLayer.path.closed ?? true);
          onUpdateLayer(targetLayer.id, {
            path: {
              ...targetLayer.path,
              d: newD,
              nodes: updatedNodes,
            },
          });
        }
        return;
      }

      // --- 4. MARQUEE SELECTION DRAGGING ---
      if (isMarqueeRef.current) {
        setMarqueeCurrent(stagePos);
        const dist = Math.hypot(stagePos.x - marqueeStart.x, stagePos.y - marqueeStart.y);

        if (dist > 4) {
          marqueeMovedRef.current = true;
          const minX = Math.min(marqueeStart.x, stagePos.x);
          const maxX = Math.max(marqueeStart.x, stagePos.x);
          const minY = Math.min(marqueeStart.y, stagePos.y);
          const maxY = Math.max(marqueeStart.y, stagePos.y);

          const intersectingLayerIds = composition.layers
            .filter((layer) => {
              if (!layer.visible || layer.locked) return false;
              const box = getLayerBoundingBox(layer, currentTime, composition.layers);

              const centerInside =
                box.centerX >= minX &&
                box.centerX <= maxX &&
                box.centerY >= minY &&
                box.centerY <= maxY;

              const overlaps = !(
                box.maxX < minX ||
                box.minX > maxX ||
                box.maxY < minY ||
                box.minY > maxY
              );

              return centerInside || overlaps;
            })
            .map((l) => l.id);

          const finalSelectedIds = marqueeAdditive
            ? Array.from(new Set([...marqueeInitialIds, ...intersectingLayerIds]))
            : intersectingLayerIds;

          if (onSelectMultipleLayers) {
            onSelectMultipleLayers(finalSelectedIds);
          } else if (finalSelectedIds.length > 0) {
            onSelectLayer(finalSelectedIds[0]);
          }
        }
        return;
      }

      // --- 5. GIZMO TRANSFORMS ---
      if (!activeGizmoMode || !layerInitialState) return;
      const targetLayer =
        composition.layers.find((l) => l.id === layerInitialState.targetLayerId) || selectedLayer;
      if (!targetLayer) return;

      const deltaX = (e.clientX - dragStartPos.x) / viewportState.zoom;
      const deltaY = (e.clientY - dragStartPos.y) / viewportState.zoom;

      const applyTransformUpdate = (
        l: VectorLayer,
        updates: {
          position?: { x: number; y: number };
          scale?: { x: number; y: number };
          rotation?: number;
          anchorPoint?: { x: number; y: number };
        }
      ) => {
        const updatedTransform: Partial<VectorLayer['transform']> = {};

        if (updates.position) {
          const posProp = l.transform.position;
          const newPos = updates.position;
          const keyframes = posProp.keyframes ? [...posProp.keyframes] : [];
          if (posProp.isKeyframed || autoKeyframe || keyframes.length > 0) {
            const kfIdx = keyframes.findIndex((k) => Math.abs(k.time - currentTime) < 0.06);
            if (kfIdx >= 0) {
              keyframes[kfIdx] = { ...keyframes[kfIdx], value: newPos };
            } else {
              keyframes.push({
                id: 'kf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                time: currentTime,
                value: newPos,
                easing: 'easeInOut',
              });
              keyframes.sort((a, b) => a.time - b.time);
            }
          }
          updatedTransform.position = {
            ...posProp,
            value: newPos,
            keyframes,
            isKeyframed: posProp.isKeyframed || (autoKeyframe && keyframes.length > 0),
          };
        }

        if (updates.scale) {
          const scProp = l.transform.scale;
          const newScale = updates.scale;
          const keyframes = scProp.keyframes ? [...scProp.keyframes] : [];
          if (scProp.isKeyframed || autoKeyframe || keyframes.length > 0) {
            const kfIdx = keyframes.findIndex((k) => Math.abs(k.time - currentTime) < 0.06);
            if (kfIdx >= 0) {
              keyframes[kfIdx] = { ...keyframes[kfIdx], value: newScale };
            } else {
              keyframes.push({
                id: 'kf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                time: currentTime,
                value: newScale,
                easing: 'easeInOut',
              });
              keyframes.sort((a, b) => a.time - b.time);
            }
          }
          updatedTransform.scale = {
            ...scProp,
            value: newScale,
            keyframes,
            isKeyframed: scProp.isKeyframed || (autoKeyframe && keyframes.length > 0),
          };
        }

        if (updates.rotation !== undefined) {
          const rotProp = l.transform.rotation;
          const newRot = updates.rotation;
          const keyframes = rotProp.keyframes ? [...rotProp.keyframes] : [];
          if (rotProp.isKeyframed || autoKeyframe || keyframes.length > 0) {
            const kfIdx = keyframes.findIndex((k) => Math.abs(k.time - currentTime) < 0.06);
            if (kfIdx >= 0) {
              keyframes[kfIdx] = { ...keyframes[kfIdx], value: newRot };
            } else {
              keyframes.push({
                id: 'kf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                time: currentTime,
                value: newRot,
                easing: 'easeInOut',
              });
              keyframes.sort((a, b) => a.time - b.time);
            }
          }
          updatedTransform.rotation = {
            ...rotProp,
            value: newRot,
            keyframes,
            isKeyframed: rotProp.isKeyframed || (autoKeyframe && keyframes.length > 0),
          };
        }

        if (updates.anchorPoint) {
          updatedTransform.anchorPoint = {
            ...l.transform.anchorPoint,
            value: updates.anchorPoint,
          };
        }

        onUpdateLayerTransform(l.id, updatedTransform);
      };

      if (activeGizmoMode === 'translate') {
        if (selectedLayerIds.length > 1 && Object.keys(multiLayerInitialPositions).length > 0) {
          selectedLayerIds.forEach((id) => {
            const initialPos = multiLayerInitialPositions[id];
            const targetL = composition.layers.find((l) => l.id === id);
            if (initialPos && targetL) {
              const newPos = {
                x: Math.round(initialPos.x + deltaX),
                y: Math.round(initialPos.y + deltaY),
              };
              applyTransformUpdate(targetL, { position: newPos });
            }
          });
          setLiveDragInfo({
            x: Math.round(layerInitialState.position.x + deltaX),
            y: Math.round(layerInitialState.position.y + deltaY),
            dx: Math.round(deltaX),
            dy: Math.round(deltaY),
            mode: 'translate',
          });
        } else {
          let proposedPos = {
            x: Math.round(layerInitialState.position.x + deltaX),
            y: Math.round(layerInitialState.position.y + deltaY),
          };

          // Smart Snapping & Guides with 10px proximity (layers, margins & custom ruler guides)
          if (viewportState.snapToGrid !== false) {
            const snapResult = computeSnapGuidelines(
              targetLayer,
              proposedPos,
              composition.layers,
              composition.width,
              composition.height,
              currentTime,
              10,
              activeGuides
            );
            proposedPos = snapResult.snappedPos;
            setActiveSnapGuides(snapResult.guides);
          } else {
            setActiveSnapGuides([]);
          }

          applyTransformUpdate(targetLayer, { position: proposedPos });
          setLiveDragInfo({
            x: proposedPos.x,
            y: proposedPos.y,
            dx: Math.round(deltaX),
            dy: Math.round(deltaY),
            mode: 'translate',
          });
        }
      } else if (activeGizmoMode === 'scale') {
        const handle = activeGizmoHandle || 'br';
        const initW = Math.max(10, layerInitialState.width || 100);
        const initH = Math.max(10, layerInitialState.height || 100);
        const initScaleX = layerInitialState.scale.x;
        const initScaleY = layerInitialState.scale.y;

        // Rotate mouse delta into object local coordinate space
        const rotRad = (-layerInitialState.rotation * Math.PI) / 180;
        const cos = Math.cos(rotRad);
        const sin = Math.sin(rotRad);
        const localDx = deltaX * cos - deltaY * sin;
        const localDy = deltaX * sin + deltaY * cos;

        let effDx = 0;
        let effDy = 0;
        let affectsX = true;
        let affectsY = true;

        if (handle === 'br') {
          effDx = localDx;
          effDy = localDy;
        } else if (handle === 'tr') {
          effDx = localDx;
          effDy = -localDy;
        } else if (handle === 'bl') {
          effDx = -localDx;
          effDy = localDy;
        } else if (handle === 'tl') {
          effDx = -localDx;
          effDy = -localDy;
        } else if (handle === 'mr') {
          effDx = localDx;
          affectsY = false;
        } else if (handle === 'ml') {
          effDx = -localDx;
          affectsY = false;
        } else if (handle === 'bm') {
          effDy = localDy;
          affectsX = false;
        } else if (handle === 'tm') {
          effDy = -localDy;
          affectsX = false;
        }

        const isCorner = ['tl', 'tr', 'bl', 'br'].includes(handle);
        const lockAspect = targetLayer.type === 'image'
          ? (targetLayer.image?.aspectLocked !== false ? !e.shiftKey : e.shiftKey)
          : !e.shiftKey;

        let newScaleX = initScaleX;
        let newScaleY = initScaleY;

        if (isCorner && lockAspect) {
          const factorX = (effDx / initW) * 100;
          const factorY = (effDy / initH) * 100;
          const factor = Math.abs(effDx) > Math.abs(effDy) ? factorX : factorY;
          newScaleX = Math.round(initScaleX + factor);
          newScaleY = Math.round(initScaleY + factor);
        } else {
          if (affectsX) {
            newScaleX = Math.round(initScaleX + (effDx / initW) * 100);
          }
          if (affectsY) {
            newScaleY = Math.round(initScaleY + (effDy / initH) * 100);
          }
        }

        // Clamp minimum scale to 5% to prevent complete collapse
        if (Math.abs(newScaleX) < 5) newScaleX = newScaleX >= 0 ? 5 : -5;
        if (Math.abs(newScaleY) < 5) newScaleY = newScaleY >= 0 ? 5 : -5;

        applyTransformUpdate(targetLayer, { scale: { x: newScaleX, y: newScaleY } });

        setLiveDragInfo({
          x: Math.round(layerInitialState.position.x),
          y: Math.round(layerInitialState.position.y),
          dx: Math.round(deltaX),
          dy: Math.round(deltaY),
          w: Math.round(initW * (Math.abs(newScaleX) / 100)),
          h: Math.round(initH * (Math.abs(newScaleY) / 100)),
          mode: 'scale',
        });
      } else if (activeGizmoMode === 'rotate') {
        const rotDelta = Math.round(deltaX * 0.8);
        const newRot = (layerInitialState.rotation + rotDelta) % 360;
        applyTransformUpdate(targetLayer, { rotation: newRot });
      } else if (activeGizmoMode === 'anchor') {
        const newAnchor = {
          x: Math.round(layerInitialState.anchorPoint.x + deltaX),
          y: Math.round(layerInitialState.anchorPoint.y + deltaY),
        };
        applyTransformUpdate(targetLayer, { anchorPoint: newAnchor });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setActiveSnapGuides([]);

      // Complete Shape Drag-to-Create
      if (isDrawingShape) {
        const startX = shapeStartPos.x;
        const startY = shapeStartPos.y;
        const currX = shapeCurrentPos.x;
        const currY = shapeCurrentPos.y;

        let dx = currX - startX;
        let dy = currY - startY;

        if (shapeShiftKey) {
          const maxD = Math.max(Math.abs(dx), Math.abs(dy));
          dx = (dx >= 0 ? 1 : -1) * maxD;
          dy = (dy >= 0 ? 1 : -1) * maxD;
        }

        let width = Math.abs(dx);
        let height = Math.abs(dy);
        let centerX = Math.min(startX, startX + dx) + width / 2;
        let centerY = Math.min(startY, startY + dy) + height / 2;

        if (shapeAltKey) {
          width = Math.abs(currX - startX) * 2;
          height = Math.abs(currY - startY) * 2;
          if (shapeShiftKey) {
            const maxD = Math.max(width, height);
            width = maxD;
            height = maxD;
          }
          centerX = startX;
          centerY = startY;
        }

        // If dragged more than 8px, create customized shape
        if (width >= 8 && height >= 8) {
          if (activeTool === 'rect') {
            onAddLayerAtPos('rect', { x: Math.round(centerX), y: Math.round(centerY) }, {
              width: Math.round(width),
              height: Math.round(height),
              cornerRadius: 8,
              fill: '#3b82f6',
            });
          } else if (activeTool === 'circle') {
            onAddLayerAtPos('circle', { x: Math.round(centerX), y: Math.round(centerY) }, {
              radiusX: Math.round(width / 2),
              radiusY: Math.round(height / 2),
              fill: '#10b981',
            });
          } else if (activeTool === 'star') {
            const outerR = Math.round(Math.max(width, height) / 2);
            onAddLayerAtPos('star', { x: Math.round(centerX), y: Math.round(centerY) }, {
              points: 5,
              outerRadius: outerR,
              innerRadius: Math.round(outerR * 0.5),
              fill: '#f59e0b',
            });
          } else if (activeTool === 'polygon') {
            onAddLayerAtPos('polygon', { x: Math.round(centerX), y: Math.round(centerY) }, {
              sides: 6,
              radius: Math.round(Math.max(width, height) / 2),
              fill: '#8b5cf6',
            });
          } else if (activeTool === 'text') {
            onAddLayerAtPos('text', { x: Math.round(centerX), y: Math.round(centerY) }, {
              text: 'Vector Motion',
              fontSize: Math.max(16, Math.min(64, Math.round(height * 0.6))),
              fill: '#ffffff',
            });
          }
        } else {
          // Direct default placement on simple click
          onAddLayerAtPos(activeTool as VectorLayer['type'], { x: startX, y: startY });
        }

        setIsDrawingShape(false);
        if (onSelectTool) onSelectTool('select');
      }

      // Finish Pen handle dragging
      if (isDraggingPenHandle) {
        setIsDraggingPenHandle(false);
      }

      // Finish Direct Selection node dragging
      if (draggedNodeIndex) {
        setDraggedNodeIndex(null);
      }

      // Finish Marquee
      if (isMarqueeRef.current) {
        if (!marqueeMovedRef.current && !marqueeAdditive) {
          onSelectLayer(null);
        }
        setIsMarqueeSelecting(false);
        isMarqueeRef.current = false;
        marqueeMovedRef.current = false;
      }

      setActiveGizmoMode(null);
      setActiveGizmoHandle(null);
      setLiveDragInfo(null);
      setLayerInitialState(null);
      setMultiLayerInitialPositions({});
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isPanning,
    panStart,
    isDrawingShape,
    shapeStartPos,
    shapeCurrentPos,
    shapeShiftKey,
    shapeAltKey,
    activeTool,
    penNodes,
    activePenNodeIndex,
    isDraggingPenHandle,
    draggedNodeIndex,
    activeGizmoMode,
    activeGizmoHandle,
    selectedLayer,
    selectedLayerIds,
    layerInitialState,
    multiLayerInitialPositions,
    dragStartPos,
    marqueeStart,
    marqueeAdditive,
    marqueeInitialIds,
    viewportState.zoom,
    viewportState.snapToGrid,
    autoKeyframe,
    currentTime,
    composition.layers,
    composition.width,
    composition.height,
    onUpdateLayerTransform,
    onUpdateLayer,
    onUpdateViewport,
    onSelectLayer,
    onSelectMultipleLayers,
    onAddLayerAtPos,
    onSelectTool,
    screenToStage,
  ]);

  // Calculate live shape preview dimensions
  let shapePreviewData: {
    type: string;
    cx: number;
    cy: number;
    w: number;
    h: number;
    rx: number;
    ry: number;
    minX: number;
    minY: number;
  } | null = null;

  if (isDrawingShape) {
    const startX = shapeStartPos.x;
    const startY = shapeStartPos.y;
    const currX = shapeCurrentPos.x;
    const currY = shapeCurrentPos.y;

    let dx = currX - startX;
    let dy = currY - startY;

    if (shapeShiftKey) {
      const maxD = Math.max(Math.abs(dx), Math.abs(dy));
      dx = (dx >= 0 ? 1 : -1) * maxD;
      dy = (dy >= 0 ? 1 : -1) * maxD;
    }

    let w = Math.abs(dx);
    let h = Math.abs(dy);
    let cx = Math.min(startX, startX + dx) + w / 2;
    let cy = Math.min(startY, startY + dy) + h / 2;

    if (shapeAltKey) {
      w = Math.abs(currX - startX) * 2;
      h = Math.abs(currY - startY) * 2;
      if (shapeShiftKey) {
        const maxD = Math.max(w, h);
        w = maxD;
        h = maxD;
      }
      cx = startX;
      cy = startY;
    }

    shapePreviewData = {
      type: activeTool,
      cx,
      cy,
      w,
      h,
      rx: w / 2,
      ry: h / 2,
      minX: cx - w / 2,
      minY: cy - h / 2,
    };
  }

  // Render individual SVG Layer item
  const renderLayer = (layer: VectorLayer, isGhost: boolean = false, ghostAlpha: number = 0.25) => {
    if (!layer.visible) return null;

    const props = evaluateLayer(layer, currentTime, composition.layers);
    const {
      position,
      scale,
      rotation,
      opacity,
      anchorPoint,
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeOpacity,
      strokeDashArray,
      trimStart = 0,
      trimEnd = 100,
      trimOffset = 0,
      blur,
      shadowBlur,
    } = props;

    // Repeater clones handler
    const repeaterMod = (layer.modifiers || []).find((m) => m.type === 'repeater' && m.enabled);
    const copies = repeaterMod?.repeater?.copies || 1;

    // Trim Paths Calculation (After Effects / SVG pathLength 100)
    const isTrimmed = (trimStart > 0 || trimEnd < 100 || (trimOffset && trimOffset !== 0));
    const visibleLength = Math.max(0.001, trimEnd - trimStart);
    const gapLength = Math.max(0, 100 - visibleLength);
    const effectiveDashArray = isTrimmed
      ? `${visibleLength} ${gapLength}`
      : (strokeDashArray || undefined);
    const effectiveDashOffset = isTrimmed
      ? `${-(trimStart + ((trimOffset || 0) / 360) * 100)}`
      : undefined;
    const pathLengthProp = isTrimmed ? 100 : undefined;

    const elements = [];

    for (let c = 0; c < copies; c++) {
      const cOffsetX = (repeaterMod?.repeater?.offset.x || 0) * c;
      const cOffsetY = (repeaterMod?.repeater?.offset.y || 0) * c;
      const cRot = (repeaterMod?.repeater?.rotationOffset || 0) * c;
      const cScaleX = 1 + ((repeaterMod?.repeater?.scaleOffset.x || 0) * c) / 100;
      const cScaleY = 1 + ((repeaterMod?.repeater?.scaleOffset.y || 0) * c) / 100;
      const cOp = Math.max(0, 100 - (repeaterMod?.repeater?.opacityOffset || 0) * c);

      const effectiveOp = isGhost
        ? ghostAlpha
        : (opacity / 100) * (cOp / 100);

      const transformStr = `translate(${position.x + cOffsetX}px, ${position.y + cOffsetY}px) rotate(${rotation + cRot}deg) scale(${(scale.x / 100) * cScaleX}, ${(scale.y / 100) * cScaleY}) translate(${-anchorPoint.x}px, ${-anchorPoint.y}px)`;

      const shadowColor = layer.style?.shadowColor || '#38bdf8';
      const shadowOffsetX = layer.style?.shadowOffsetX ?? 0;
      const shadowOffsetY = layer.style?.shadowOffsetY ?? 4;
      const filterParts: string[] = [];
      if (blur > 0) filterParts.push(`blur(${blur}px)`);
      if (shadowBlur > 0) filterParts.push(`drop-shadow(${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor})`);
      const filterStyle = filterParts.length > 0 ? filterParts.join(' ') : undefined;

      let shapeSvg = null;

      if (layer.type === 'rect' && props.rect) {
        const { width, height, cornerRadius } = props.rect;
        shapeSvg = (
          <rect
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            rx={cornerRadius}
            ry={cornerRadius}
            fill={fill}
            fillOpacity={fillOpacity / 100}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity / 100}
            pathLength={pathLengthProp}
            strokeDasharray={effectiveDashArray}
            strokeDashoffset={effectiveDashOffset}
            strokeLinecap={layer.style?.lineCap || 'round'}
            strokeLinejoin={layer.style?.lineJoin || 'round'}
          />
        );
      } else if (layer.type === 'circle' && props.circle) {
        const { radiusX, radiusY } = props.circle;
        shapeSvg = (
          <ellipse
            cx={0}
            cy={0}
            rx={radiusX}
            ry={radiusY}
            fill={fill}
            fillOpacity={fillOpacity / 100}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity / 100}
            pathLength={pathLengthProp}
            strokeDasharray={effectiveDashArray}
            strokeDashoffset={effectiveDashOffset}
            strokeLinecap={layer.style?.lineCap || 'round'}
            strokeLinejoin={layer.style?.lineJoin || 'round'}
          />
        );
      } else if (layer.type === 'star' && props.star) {
        const { points, outerRadius, innerRadius } = props.star;
        const d = generateStarPath(points, outerRadius, innerRadius);
        shapeSvg = (
          <path
            d={d}
            fill={fill}
            fillOpacity={fillOpacity / 100}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity / 100}
            pathLength={pathLengthProp}
            strokeDasharray={effectiveDashArray}
            strokeDashoffset={effectiveDashOffset}
            strokeLinecap={layer.style?.lineCap || 'round'}
            strokeLinejoin={layer.style?.lineJoin || 'round'}
          />
        );
      } else if (layer.type === 'polygon' && props.polygon) {
        const { sides, radius } = props.polygon;
        const d = generatePolygonPath(sides, radius);
        shapeSvg = (
          <path
            d={d}
            fill={fill}
            fillOpacity={fillOpacity / 100}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity / 100}
            pathLength={pathLengthProp}
            strokeDasharray={effectiveDashArray}
            strokeDashoffset={effectiveDashOffset}
            strokeLinecap={layer.style?.lineCap || 'round'}
            strokeLinejoin={layer.style?.lineJoin || 'round'}
          />
        );
      } else if (layer.type === 'path' && layer.path) {
        shapeSvg = (
          <path
            d={layer.path.d}
            fill={fill}
            fillOpacity={fillOpacity / 100}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity / 100}
            pathLength={pathLengthProp}
            strokeDasharray={effectiveDashArray}
            strokeDashoffset={effectiveDashOffset}
            strokeLinecap={layer.style?.lineCap || 'round'}
            strokeLinejoin={layer.style?.lineJoin || 'round'}
          />
        );
      } else if (layer.type === 'text' && layer.text && props.text) {
        const lines = (layer.text.text || '').split('\n');
        const rawLines = lines;
        const maxChars = Math.max(1, ...rawLines.map((l) => l.length));
        const lineCount = Math.max(1, rawLines.length);
        const fs = props.text.fontSize;
        const ls = props.text.letterSpacing || 0;
        const estW = maxChars * fs * 0.58 + maxChars * ls;
        const estH = lineCount * fs * 1.25;

        // Effective alignment
        const effectiveAnchor = layer.text.textAnchor || (
          layer.text.textAlign === 'left' ? 'start' : layer.text.textAlign === 'right' ? 'end' : 'middle'
        );
        const effectiveBaseline = layer.text.verticalAlign === 'top'
          ? 'hanging'
          : layer.text.verticalAlign === 'bottom'
          ? 'text-after-edge'
          : 'central';

        // 9-Point Text Anchor Origin calculation
        let anchorOffsetX = 0;
        let anchorOffsetY = 0;
        const origin = layer.text.anchorOrigin;
        if (origin) {
          if (origin.includes('left')) anchorOffsetX = estW / 2;
          else if (origin.includes('right')) anchorOffsetX = -estW / 2;

          if (origin.includes('top')) anchorOffsetY = estH / 2;
          else if (origin.includes('bottom')) anchorOffsetY = -estH / 2;
        }

        shapeSvg = (
          <text
            x={anchorOffsetX}
            y={anchorOffsetY}
            textAnchor={effectiveAnchor}
            dominantBaseline={effectiveBaseline}
            fill={fill}
            fillOpacity={fillOpacity / 100}
            stroke={stroke}
            strokeWidth={strokeWidth}
            fontSize={props.text.fontSize}
            fontFamily={layer.text.fontFamily || 'Inter, sans-serif'}
            fontWeight={layer.text.fontWeight || 400}
            letterSpacing={props.text.letterSpacing}
            className="select-none"
          >
            {lines.length > 1
              ? lines.map((line, idx) => (
                  <tspan
                    key={idx}
                    x={anchorOffsetX}
                    dy={idx === 0 ? `-${(lines.length - 1) * 0.55}em` : '1.2em'}
                  >
                    {line}
                  </tspan>
                ))
              : layer.text.text}
          </text>
        );
      } else if (layer.type === 'image' && layer.image && props.image && props.image.src) {
        const imgW = props.image.width;
        const imgH = props.image.height;
        const cornerR = props.image.cornerRadius || 0;
        const scalingMode = props.image.scalingMode || 'contain';

        let preserveAspect = 'none';
        if (scalingMode === 'cover') preserveAspect = 'xMidYMid slice';
        else if (scalingMode === 'contain') preserveAspect = 'xMidYMid meet';
        else if (scalingMode === 'none') preserveAspect = 'xMidYMid meet';

        const flipH = props.image.flipHorizontal ? -1 : 1;
        const flipV = props.image.flipVertical ? -1 : 1;
        const imgTransform = flipH !== 1 || flipV !== 1 ? `scale(${flipH}, ${flipV})` : undefined;

        // CSS Filters from ImageFilters & drop-shadow
        const filters = props.image.filters || {};
        const filterList: string[] = [];
        if (filters.brightness !== undefined && filters.brightness !== 100) filterList.push(`brightness(${filters.brightness}%)`);
        if (filters.contrast !== undefined && filters.contrast !== 100) filterList.push(`contrast(${filters.contrast}%)`);
        if (filters.saturate !== undefined && filters.saturate !== 100) filterList.push(`saturate(${filters.saturate}%)`);
        if (filters.blur && filters.blur > 0) filterList.push(`blur(${filters.blur}px)`);
        if (filters.hueRotate && filters.hueRotate !== 0) filterList.push(`hue-rotate(${filters.hueRotate}deg)`);
        if (filters.grayscale && filters.grayscale > 0) filterList.push(`grayscale(${filters.grayscale}%)`);
        if (filters.sepia && filters.sepia > 0) filterList.push(`sepia(${filters.sepia}%)`);
        if (filters.invert && filters.invert > 0) filterList.push(`invert(${filters.invert}%)`);
        if (props.image.shadowBlur && props.image.shadowBlur > 0) {
          const sColor = props.image.shadowColor || 'rgba(0,0,0,0.5)';
          const sX = props.image.shadowOffsetX ?? 0;
          const sY = props.image.shadowOffsetY ?? 4;
          filterList.push(`drop-shadow(${sX}px ${sY}px ${props.image.shadowBlur}px ${sColor})`);
        }
        const imgFilterStyle = filterList.length > 0 ? filterList.join(' ') : undefined;

        const clipId = `img_clip_${layer.id}_${c}`;
        const hasBorder = props.image.borderWidth && props.image.borderWidth > 0;
        const bWidth = props.image.borderWidth || 0;
        const bColor = props.image.borderColor || '#3b82f6';
        const bStyle = props.image.borderStyle || 'solid';
        const bDash = bStyle === 'dashed' ? '6 4' : bStyle === 'dotted' ? '2 2' : undefined;

        shapeSvg = (
          <g>
            <defs>
              <clipPath id={clipId}>
                <rect
                  x={-imgW / 2}
                  y={-imgH / 2}
                  width={imgW}
                  height={imgH}
                  rx={cornerR}
                  ry={cornerR}
                />
              </clipPath>
            </defs>
            <image
              href={props.image.src}
              x={-imgW / 2}
              y={-imgH / 2}
              width={imgW}
              height={imgH}
              preserveAspectRatio={preserveAspect}
              clipPath={`url(#${clipId})`}
              transform={imgTransform}
              style={{ filter: imgFilterStyle }}
              className="select-none"
            />
            {hasBorder && (
              <rect
                x={-imgW / 2}
                y={-imgH / 2}
                width={imgW}
                height={imgH}
                rx={cornerR}
                ry={cornerR}
                fill="none"
                stroke={bColor}
                strokeWidth={bWidth}
                strokeDasharray={bDash}
                className="pointer-events-none"
              />
            )}
          </g>
        );
      }

      elements.push(
        <g
          key={`${layer.id}_${c}`}
          id={`layer_${layer.id}_${c}`}
          style={{
            transform: transformStr,
            opacity: effectiveOp,
            filter: filterStyle,
            mixBlendMode: layer.style.blendMode as any,
          }}
          onMouseDown={(e) => {
            if ((activeTool === 'select' || activeTool === 'directSelect') && !layer.locked) {
              e.stopPropagation();
              if (e.shiftKey) {
                onSelectLayer(layer.id, true);
              } else if (!selectedLayerIds.includes(layer.id)) {
                onSelectLayer(layer.id, false);
              }
              handleGizmoStart('translate', 'layer_body', e, layer);
            }
          }}
          className={
            (activeTool === 'select' || activeTool === 'directSelect') && !layer.locked
              ? 'cursor-pointer hover:opacity-95 transition-opacity'
              : ''
          }
        >
          {shapeSvg}
        </g>
      );
    }

    return <React.Fragment key={layer.id}>{elements}</React.Fragment>;
  };

  // Marquee Rect calculations
  const marqueeMinX = Math.min(marqueeStart.x, marqueeCurrent.x);
  const marqueeMaxX = Math.max(marqueeStart.x, marqueeCurrent.x);
  const marqueeMinY = Math.min(marqueeStart.y, marqueeCurrent.y);
  const marqueeMaxY = Math.max(marqueeStart.y, marqueeCurrent.y);
  const marqueeWidth = marqueeMaxX - marqueeMinX;
  const marqueeHeight = marqueeMaxY - marqueeMinY;
  const showMarqueeRect = isMarqueeSelecting && (marqueeWidth > 3 || marqueeHeight > 3);

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOverCanvas(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const stageCoords = screenToStage(e.clientX, e.clientY);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const img = new Image();
        img.onload = () => {
          let w = img.naturalWidth || 300;
          let h = img.naturalHeight || 200;
          const maxDim = 400;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          onAddLayerAtPos('image', stageCoords, {
            src: result,
            width: w,
            height: h,
            fileName: file.name,
            mimeType: file.type || 'image/png',
          });
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleStageMouseDown}
      onContextMenu={handleCanvasContextMenu}
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
      className={`flex-1 relative bg-zinc-925 overflow-hidden flex items-center justify-center select-none ${
        isDragOverCanvas ? 'ring-2 ring-blue-500/80 bg-zinc-900/90' : ''
      } ${
        activeTool === 'hand' || isPanning
          ? 'cursor-grab active:cursor-grabbing'
          : activeTool === 'pen'
          ? 'cursor-crosshair'
          : ['rect', 'circle', 'star', 'polygon', 'text'].includes(activeTool)
          ? 'cursor-crosshair'
          : activeTool === 'directSelect'
          ? 'cursor-default'
          : 'cursor-default'
      }`}
    >
      {/* Background Pixel Grid Texture */}
      {viewportState.showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #71717a 1px, transparent 1px)`,
            backgroundSize: `${20 * viewportState.zoom}px ${20 * viewportState.zoom}px`,
            backgroundPosition: `${viewportState.pan.x}px ${viewportState.pan.y}px`,
          }}
        />
      )}

      {/* Main Canvas Viewport Container */}
      <div
        style={{
          width: `${composition.width}px`,
          height: `${composition.height}px`,
          transform: `translate(${viewportState.pan.x}px, ${viewportState.pan.y}px) scale(${viewportState.zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.05s linear',
        }}
        className="relative shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_25px_60px_-15px_rgba(0,0,0,0.9)]"
      >
        {/* Floating Artboard Info Header */}
        <div className="absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 border border-zinc-700/80 rounded shadow-md text-[10px] font-mono text-zinc-300 pointer-events-none select-none z-20">
          <span className="font-semibold text-zinc-200 truncate max-w-[140px]">{composition.name}</span>
          <span className="text-zinc-500">|</span>
          <span className="text-blue-400 font-bold">{composition.width} × {composition.height} px</span>
        </div>

        {/* SVG Stage */}
        <svg
          ref={stageRef}
          id="stage-svg"
          width={composition.width}
          height={composition.height}
          viewBox={`0 0 ${composition.width} ${composition.height}`}
          style={{
            overflow: 'visible',
          }}
          className="block"
        >
          {/* Base Canvas Solid Background Fill */}
          <rect
            x={0}
            y={0}
            width={composition.width}
            height={composition.height}
            fill={composition.backgroundColor}
          />
          {/* Safe Area Guides */}
          {viewportState.showSafeAreas && (
            <g className="pointer-events-none opacity-30">
              <rect
                x={composition.width * 0.05}
                y={composition.height * 0.05}
                width={composition.width * 0.9}
                height={composition.height * 0.9}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </g>
          )}

          {/* Onion Skinning Ghost (if enabled) */}
          {viewportState.onionSkin && !isPlaying && (
            <g className="pointer-events-none">
              {[...composition.layers].reverse().map((l) => renderLayer(l, true, 0.15))}
            </g>
          )}

          {/* Regular Vector Layers (rendered back to front) */}
          {(composition.layers || []).length === 0 ? (
            /* R-27 Empty State: Discreet studio guidelines when composition has no layers yet */
            <g className="pointer-events-none select-none">
              <rect
                x={16}
                y={16}
                width={Math.max(10, composition.width - 32)}
                height={Math.max(10, composition.height - 32)}
                fill="none"
                stroke="#3f3f46"
                strokeWidth={1}
                strokeDasharray="6 6"
                opacity={0.6}
                rx={6}
              />
              <text
                x={composition.width / 2}
                y={composition.height / 2 - 8}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#a1a1aa"
                fontSize={Math.max(12, Math.min(18, Math.round(composition.width * 0.035)))}
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="500"
              >
                Composición Vacía
              </text>
              <text
                x={composition.width / 2}
                y={composition.height / 2 + 16}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#71717a"
                fontSize={Math.max(10, Math.min(13, Math.round(composition.width * 0.025)))}
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                Usa las herramientas de dibujo o pulsa Añadir Capa
              </text>
            </g>
          ) : (
            [...composition.layers].reverse().map((l) => renderLayer(l))
          )}

          {/* --- LIVE INTERACTIVE SHAPE DRAWING PREVIEW --- */}
          {isDrawingShape && shapePreviewData && (
            <g className="pointer-events-none">
              {shapePreviewData.type === 'rect' && (
                <rect
                  x={shapePreviewData.minX}
                  y={shapePreviewData.minY}
                  width={shapePreviewData.w}
                  height={shapePreviewData.h}
                  rx={8}
                  ry={8}
                  fill="rgba(59, 130, 246, 0.25)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              )}
              {shapePreviewData.type === 'circle' && (
                <ellipse
                  cx={shapePreviewData.cx}
                  cy={shapePreviewData.cy}
                  rx={shapePreviewData.rx}
                  ry={shapePreviewData.ry}
                  fill="rgba(16, 185, 129, 0.25)"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              )}
              {shapePreviewData.type === 'star' && (
                <path
                  d={generateStarPath(5, Math.max(shapePreviewData.rx, shapePreviewData.ry), Math.max(shapePreviewData.rx, shapePreviewData.ry) * 0.5)}
                  transform={`translate(${shapePreviewData.cx}, ${shapePreviewData.cy})`}
                  fill="rgba(245, 158, 11, 0.25)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              )}
              {shapePreviewData.type === 'polygon' && (
                <path
                  d={generatePolygonPath(6, Math.max(shapePreviewData.rx, shapePreviewData.ry))}
                  transform={`translate(${shapePreviewData.cx}, ${shapePreviewData.cy})`}
                  fill="rgba(139, 92, 246, 0.25)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              )}
              {shapePreviewData.type === 'text' && (
                <g>
                  <rect
                    x={shapePreviewData.minX}
                    y={shapePreviewData.minY}
                    width={shapePreviewData.w}
                    height={shapePreviewData.h}
                    fill="rgba(255, 255, 255, 0.1)"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={shapePreviewData.cx}
                    y={shapePreviewData.cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={Math.max(14, Math.round(shapePreviewData.h * 0.5))}
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    opacity={0.8}
                  >
                    Texto...
                  </text>
                </g>
              )}

              {/* Center point cross */}
              <circle cx={shapePreviewData.cx} cy={shapePreviewData.cy} r={3} fill="#ffffff" stroke="#3b82f6" strokeWidth={1.5} />
            </g>
          )}

          {/* --- PHOTOSHOP-STYLE BEZIER PEN TOOL DRAFTING --- */}
          {activeTool === 'pen' && penNodes.length > 0 && (
            <g className="pointer-events-none">
              {/* Drawn Bezier Path segment */}
              <path
                d={buildSvgPathFromNodes(penNodes, false)}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Live rubberband line from last node to cursor or first node */}
              {penNodes.length > 0 && (
                <line
                  x1={penNodes[penNodes.length - 1].x + penNodes[penNodes.length - 1].handleOut.x}
                  y1={penNodes[penNodes.length - 1].y + penNodes[penNodes.length - 1].handleOut.y}
                  x2={isHoveringFirstPenNode ? penNodes[0].x : penCursorPos.x}
                  y2={isHoveringFirstPenNode ? penNodes[0].y : penCursorPos.y}
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  opacity={0.8}
                />
              )}

              {/* Render Nodes, Tangents & Handles */}
              {penNodes.map((node, i) => {
                const isFirst = i === 0;
                const hasHandles =
                  Math.abs(node.handleIn.x) > 1 ||
                  Math.abs(node.handleIn.y) > 1 ||
                  Math.abs(node.handleOut.x) > 1 ||
                  Math.abs(node.handleOut.y) > 1;

                return (
                  <g key={node.id}>
                    {/* Tangent control arms */}
                    {hasHandles && (
                      <g opacity={0.85}>
                        <line
                          x1={node.x + node.handleIn.x}
                          y1={node.y + node.handleIn.y}
                          x2={node.x + node.handleOut.x}
                          y2={node.y + node.handleOut.y}
                          stroke="#60a5fa"
                          strokeWidth={1}
                        />
                        {/* In Handle Knob */}
                        <circle
                          cx={node.x + node.handleIn.x}
                          cy={node.y + node.handleIn.y}
                          r={3.5}
                          fill="#60a5fa"
                          stroke="#ffffff"
                          strokeWidth={1}
                        />
                        {/* Out Handle Knob */}
                        <circle
                          cx={node.x + node.handleOut.x}
                          cy={node.y + node.handleOut.y}
                          r={3.5}
                          fill="#60a5fa"
                          stroke="#ffffff"
                          strokeWidth={1}
                        />
                      </g>
                    )}

                    {/* Anchor Node Vertex */}
                    <rect
                      x={node.x - 4}
                      y={node.y - 4}
                      width={8}
                      height={8}
                      fill={isFirst && isHoveringFirstPenNode ? '#10b981' : '#38bdf8'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className="shadow"
                    />

                    {/* Pulse ring on first node when hover to close */}
                    {isFirst && isHoveringFirstPenNode && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={8}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={2}
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* --- DIRECT SELECTION (A) EDITABLE PATH NODES --- */}
          {activeTool === 'directSelect' && selectedLayer && selectedLayer.type === 'path' && selectedLayer.path?.nodes && (
            <g>
              {selectedLayer.path.nodes.map((node, i) => {
                const layerPos = selectedLayer.transform.position.value;
                const absX = layerPos.x + node.x;
                const absY = layerPos.y + node.y;

                return (
                  <g key={`dnode_${i}`}>
                    {/* Anchor point knob */}
                    <rect
                      x={absX - 4}
                      y={absY - 4}
                      width={8}
                      height={8}
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className="cursor-move hover:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onHistorySnapshot?.();
                        setDraggedNodeIndex({
                          layerId: selectedLayer.id,
                          nodeIndex: i,
                          type: 'point',
                        });
                      }}
                    />

                    {/* In Handle */}
                    {node.handleIn && (node.handleIn.x !== 0 || node.handleIn.y !== 0) && (
                      <g>
                        <line
                          x1={absX}
                          y1={absY}
                          x2={absX + node.handleIn.x}
                          y2={absY + node.handleIn.y}
                          stroke="#60a5fa"
                          strokeWidth={1}
                        />
                        <circle
                          cx={absX + node.handleIn.x}
                          cy={absY + node.handleIn.y}
                          r={3.5}
                          fill="#38bdf8"
                          stroke="#ffffff"
                          strokeWidth={1}
                          className="cursor-pointer hover:scale-125"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            onHistorySnapshot?.();
                            setDraggedNodeIndex({
                              layerId: selectedLayer.id,
                              nodeIndex: i,
                              type: 'handleIn',
                            });
                          }}
                        />
                      </g>
                    )}

                    {/* Out Handle */}
                    {node.handleOut && (node.handleOut.x !== 0 || node.handleOut.y !== 0) && (
                      <g>
                        <line
                          x1={absX}
                          y1={absY}
                          x2={absX + node.handleOut.x}
                          y2={absY + node.handleOut.y}
                          stroke="#60a5fa"
                          strokeWidth={1}
                        />
                        <circle
                          cx={absX + node.handleOut.x}
                          cy={absY + node.handleOut.y}
                          r={3.5}
                          fill="#60a5fa"
                          stroke="#ffffff"
                          strokeWidth={1}
                          className="cursor-pointer hover:scale-125"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            onHistorySnapshot?.();
                            setDraggedNodeIndex({
                              layerId: selectedLayer.id,
                              nodeIndex: i,
                              type: 'handleOut',
                            });
                          }}
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Live Marquee Selection Dragging Box */}
          {showMarqueeRect && (
            <g className="pointer-events-none">
              <rect
                x={marqueeMinX}
                y={marqueeMinY}
                width={marqueeWidth}
                height={marqueeHeight}
                fill="rgba(59, 130, 246, 0.15)"
                stroke="#38bdf8"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                rx={2}
                ry={2}
              />
            </g>
          )}

          {/* ========================================================================= */}
          {/* ALWAYS-VISIBLE ARTBOARD / CANVAS WORKSPACE BOUNDARY (TOP-LAYER OVERLAY)  */}
          {/* Guarantees the canvas frame and dimensions are never lost with big layers */}
          {/* ========================================================================= */}
          <g className="pointer-events-none" id="canvas-boundary-guides">
            {/* Dark underlying stroke for high contrast on bright/white layers */}
            <rect
              x={0}
              y={0}
              width={composition.width}
              height={composition.height}
              fill="none"
              stroke="rgba(0, 0, 0, 0.75)"
              strokeWidth={3}
            />
            {/* Bright cyan/blue dashed overlay stroke for high contrast on dark layers */}
            <rect
              x={0}
              y={0}
              width={composition.width}
              height={composition.height}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={1.5}
              strokeDasharray="8 5"
              opacity={0.9}
            />

            {/* Corner Crop Marks & Registration Brackets */}
            {/* Top-Left Corner */}
            <path
              d={`M -14 0 H 18 M 0 -14 V 18`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={2}
            />
            <rect x={-2.5} y={-2.5} width={5} height={5} fill="#ffffff" stroke="#0284c7" strokeWidth={1} />

            {/* Top-Right Corner */}
            <path
              d={`M ${composition.width - 18} 0 H ${composition.width + 14} M ${composition.width} -14 V 18`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={2}
            />
            <rect x={composition.width - 2.5} y={-2.5} width={5} height={5} fill="#ffffff" stroke="#0284c7" strokeWidth={1} />

            {/* Bottom-Left Corner */}
            <path
              d={`M -14 ${composition.height} H 18 M 0 ${composition.height - 18} V ${composition.height + 14}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={2}
            />
            <rect x={-2.5} y={composition.height - 2.5} width={5} height={5} fill="#ffffff" stroke="#0284c7" strokeWidth={1} />

            {/* Bottom-Right Corner */}
            <path
              d={`M ${composition.width - 18} ${composition.height} H ${composition.width + 14} M ${composition.width} ${composition.height - 18} V ${composition.height + 14}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={2}
            />
            <rect x={composition.width - 2.5} y={composition.height - 2.5} width={5} height={5} fill="#ffffff" stroke="#0284c7" strokeWidth={1} />

            {/* Mid-Edge Center Alignment Ticks */}
            {/* Top Center */}
            <line
              x1={composition.width / 2}
              y1={-8}
              x2={composition.width / 2}
              y2={8}
              stroke="#60a5fa"
              strokeWidth={1.5}
            />
            {/* Bottom Center */}
            <line
              x1={composition.width / 2}
              y1={composition.height - 8}
              x2={composition.width / 2}
              y2={composition.height + 8}
              stroke="#60a5fa"
              strokeWidth={1.5}
            />
            {/* Left Center */}
            <line
              x1={-8}
              y1={composition.height / 2}
              x2={8}
              y2={composition.height / 2}
              stroke="#60a5fa"
              strokeWidth={1.5}
            />
            {/* Right Center */}
            <line
              x1={composition.width - 8}
              y1={composition.height / 2}
              x2={composition.width + 8}
              y2={composition.height / 2}
              stroke="#60a5fa"
              strokeWidth={1.5}
            />
          </g>

          {/* --- ACTIVE SMART SNAPPING GUIDE LINES --- */}
          {activeSnapGuides.length > 0 && (
            <g className="snap-guidelines pointer-events-none">
              {activeSnapGuides.map((guide) => {
                const isCenter = guide.type === 'center-x' || guide.type === 'center-y';
                const strokeColor = isCenter ? '#ec4899' : guide.type.startsWith('edge') ? '#06b6d4' : '#f59e0b';
                const z = Math.max(0.1, viewportState.zoom);
                const strokeW = 1.8 / z;
                const dash = isCenter ? `${5 / z} ${3 / z}` : guide.type.startsWith('edge') ? undefined : `${4 / z} ${3 / z}`;

                return (
                  <g key={guide.id}>
                    {/* Shadow / dark underlying line for high contrast */}
                    <line
                      x1={guide.x1}
                      y1={guide.y1}
                      x2={guide.x2}
                      y2={guide.y2}
                      stroke="rgba(0, 0, 0, 0.7)"
                      strokeWidth={strokeW + 2 / z}
                    />
                    {/* Main guide line */}
                    <line
                      x1={guide.x1}
                      y1={guide.y1}
                      x2={guide.x2}
                      y2={guide.y2}
                      stroke={strokeColor}
                      strokeWidth={strokeW}
                      strokeDasharray={dash}
                      opacity={0.95}
                    />
                    {/* Snap endpoint ticks */}
                    <circle cx={guide.x1} cy={guide.y1} r={3 / z} fill={strokeColor} stroke="#ffffff" strokeWidth={1 / z} />
                    <circle cx={guide.x2} cy={guide.y2} r={3 / z} fill={strokeColor} stroke="#ffffff" strokeWidth={1 / z} />
                    {guide.label && (
                      <g transform={`translate(${guide.x1 + 6 / z}, ${guide.y1 + 16 / z})`}>
                        <rect
                          x={-3 / z}
                          y={-10 / z}
                          width={(guide.label.length * 6.5 + 8) / z}
                          height={14 / z}
                          rx={3 / z}
                          fill="rgba(15, 23, 42, 0.95)"
                          stroke={strokeColor}
                          strokeWidth={1 / z}
                        />
                        <text
                          x={2 / z}
                          y={0}
                          fill={strokeColor}
                          fontSize={9.5 / z}
                          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                          fontWeight="bold"
                          dominantBaseline="middle"
                        >
                          {guide.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* --- USER-DEFINED CUSTOM RULER GUIDES & SNAPPING PREVIEWS --- */}
          {(activeGuides.length > 0 || draggingGuide) && (
            <g id="custom-ruler-guides" className="custom-guides">
              {/* Highlight layer bounding box snapped to during guide dragging */}
              {draggingGuide?.snappedBox && (
                <g className="pointer-events-none">
                  {/* Outer pulse aura */}
                  <rect
                    x={draggingGuide.snappedBox.minX - 4 / Math.max(0.1, viewportState.zoom)}
                    y={draggingGuide.snappedBox.minY - 4 / Math.max(0.1, viewportState.zoom)}
                    width={draggingGuide.snappedBox.width + 8 / Math.max(0.1, viewportState.zoom)}
                    height={draggingGuide.snappedBox.height + 8 / Math.max(0.1, viewportState.zoom)}
                    fill="rgba(236, 72, 153, 0.08)"
                    stroke="rgba(236, 72, 153, 0.4)"
                    strokeWidth={1 / Math.max(0.1, viewportState.zoom)}
                    rx={2 / Math.max(0.1, viewportState.zoom)}
                  />
                  {/* Main boundary highlight */}
                  <rect
                    x={draggingGuide.snappedBox.minX}
                    y={draggingGuide.snappedBox.minY}
                    width={draggingGuide.snappedBox.width}
                    height={draggingGuide.snappedBox.height}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth={1.5 / Math.max(0.1, viewportState.zoom)}
                    strokeDasharray={`${4 / Math.max(0.1, viewportState.zoom)} ${2 / Math.max(0.1, viewportState.zoom)}`}
                  />
                  {/* Magnetic corners */}
                  <circle cx={draggingGuide.snappedBox.minX} cy={draggingGuide.snappedBox.minY} r={3 / Math.max(0.1, viewportState.zoom)} fill="#ec4899" stroke="#ffffff" strokeWidth={1 / Math.max(0.1, viewportState.zoom)} />
                  <circle cx={draggingGuide.snappedBox.maxX} cy={draggingGuide.snappedBox.minY} r={3 / Math.max(0.1, viewportState.zoom)} fill="#ec4899" stroke="#ffffff" strokeWidth={1 / Math.max(0.1, viewportState.zoom)} />
                  <circle cx={draggingGuide.snappedBox.minX} cy={draggingGuide.snappedBox.maxY} r={3 / Math.max(0.1, viewportState.zoom)} fill="#ec4899" stroke="#ffffff" strokeWidth={1 / Math.max(0.1, viewportState.zoom)} />
                  <circle cx={draggingGuide.snappedBox.maxX} cy={draggingGuide.snappedBox.maxY} r={3 / Math.max(0.1, viewportState.zoom)} fill="#ec4899" stroke="#ffffff" strokeWidth={1 / Math.max(0.1, viewportState.zoom)} />
                </g>
              )}

              {/* Saved Custom Guide Lines */}
              {activeGuides.map((guide) => {
                if (draggingGuide?.id === guide.id) return null;
                const isH = guide.axis === 'horizontal';
                const isHovered = hoveredGuideId === guide.id;
                const strokeColor = guide.color || (isHovered ? '#38bdf8' : '#06b6d4');
                const z = Math.max(0.1, viewportState.zoom);

                return (
                  <g
                    key={guide.id}
                    className="custom-guide-item"
                    onMouseEnter={() => setHoveredGuideId(guide.id)}
                    onMouseLeave={() => setHoveredGuideId((prev) => (prev === guide.id ? null : prev))}
                  >
                    {/* Invisible thick stroke for easy mouse hover and dragging */}
                    <line
                      x1={isH ? -3000 : guide.position}
                      y1={isH ? guide.position : -3000}
                      x2={isH ? composition.width + 3000 : guide.position}
                      y2={isH ? guide.position : composition.height + 3000}
                      stroke="transparent"
                      strokeWidth={14 / z}
                      style={{ pointerEvents: 'stroke' }}
                      className={viewportState.guidesLocked ? 'cursor-default' : isH ? 'cursor-ns-resize' : 'cursor-ew-resize'}
                      onMouseDown={(e) => {
                        if (viewportState.guidesLocked || e.button !== 0) return;
                        e.stopPropagation();
                        handleStartMoveExistingGuide(guide, e);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setGuideContextMenu({ x: e.clientX, y: e.clientY, guideId: guide.id });
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGuide(guide.id);
                      }}
                    />

                    {/* High-visibility contrast backing line */}
                    <line
                      x1={isH ? -3000 : guide.position}
                      y1={isH ? guide.position : -3000}
                      x2={isH ? composition.width + 3000 : guide.position}
                      y2={isH ? guide.position : composition.height + 3000}
                      stroke="rgba(0, 0, 0, 0.6)"
                      strokeWidth={2.5 / z}
                      className="pointer-events-none"
                    />

                    {/* Crisp foreground guide line */}
                    <line
                      x1={isH ? -3000 : guide.position}
                      y1={isH ? guide.position : -3000}
                      x2={isH ? composition.width + 3000 : guide.position}
                      y2={isH ? guide.position : composition.height + 3000}
                      stroke={strokeColor}
                      strokeWidth={1 / z}
                      strokeDasharray={isHovered ? undefined : `${6 / z} ${3 / z}`}
                      className="pointer-events-none"
                    />

                    {/* Hover coordinate badge */}
                    {isHovered && (
                      <g
                        transform={
                          isH
                            ? `translate(${16 / z}, ${guide.position - 14 / z})`
                            : `translate(${guide.position + 8 / z}, ${16 / z})`
                        }
                        className="pointer-events-none"
                      >
                        <rect
                          x={0}
                          y={0}
                          width={60 / z}
                          height={16 / z}
                          rx={3 / z}
                          fill="rgba(15, 23, 42, 0.95)"
                          stroke="#0284c7"
                          strokeWidth={1 / z}
                        />
                        <text
                          x={30 / z}
                          y={11 / z}
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize={`${9 / z}px`}
                          fontFamily="ui-monospace, monospace"
                          fontWeight="bold"
                        >
                          {isH ? `Y: ${guide.position}px` : `X: ${guide.position}px`}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Active Dragging Guide Preview Line */}
              {draggingGuide && (
                <g className="pointer-events-none">
                  {/* Dark backing line */}
                  <line
                    x1={draggingGuide.axis === 'horizontal' ? -3000 : draggingGuide.currentPos}
                    y1={draggingGuide.axis === 'horizontal' ? draggingGuide.currentPos : -3000}
                    x2={draggingGuide.axis === 'horizontal' ? composition.width + 3000 : draggingGuide.currentPos}
                    y2={draggingGuide.axis === 'horizontal' ? draggingGuide.currentPos : composition.height + 3000}
                    stroke="rgba(0, 0, 0, 0.7)"
                    strokeWidth={3 / Math.max(0.1, viewportState.zoom)}
                  />
                  {/* Foreground line */}
                  <line
                    x1={draggingGuide.axis === 'horizontal' ? -3000 : draggingGuide.currentPos}
                    y1={draggingGuide.axis === 'horizontal' ? draggingGuide.currentPos : -3000}
                    x2={draggingGuide.axis === 'horizontal' ? composition.width + 3000 : draggingGuide.currentPos}
                    y2={draggingGuide.axis === 'horizontal' ? draggingGuide.currentPos : composition.height + 3000}
                    stroke={
                      draggingGuide.isDeleteHover
                        ? '#ef4444'
                        : draggingGuide.isSnapped
                        ? '#ec4899'
                        : '#06b6d4'
                    }
                    strokeWidth={1.8 / Math.max(0.1, viewportState.zoom)}
                    strokeDasharray={draggingGuide.isDeleteHover ? `${4 / Math.max(0.1, viewportState.zoom)} ${2 / Math.max(0.1, viewportState.zoom)}` : undefined}
                  />
                </g>
              )}
            </g>
          )}
        </svg>

        {/* --- LIVE OBJECT POSITION / SCALE HUD BADGE --- */}
        {liveDragInfo && selectedLayer && (
          <div
            style={{
              position: 'absolute',
              left: `${liveDragInfo.x}px`,
              top: `${liveDragInfo.y - (layerInitialState?.height ? (layerInitialState.height * (layerInitialState.scale.y / 100)) / 2 + 18 : 28)}px`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
            }}
            className="bg-zinc-950/95 text-white border border-blue-500/80 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md shadow-2xl backdrop-blur-md flex items-center gap-2 z-40 select-none animate-in fade-in zoom-in-95 duration-75"
          >
            {liveDragInfo.mode === 'translate' ? (
              <>
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="text-[10px] text-zinc-400">X:</span>
                  <span className="font-bold">{liveDragInfo.x}px</span>
                </span>
                <span className="text-zinc-600">|</span>
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="text-[10px] text-zinc-400">Y:</span>
                  <span className="font-bold">{liveDragInfo.y}px</span>
                </span>
                {(liveDragInfo.dx !== 0 || liveDragInfo.dy !== 0) && (
                  <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-1 rounded">
                    Δ({liveDragInfo.dx > 0 ? `+${liveDragInfo.dx}` : liveDragInfo.dx}, {liveDragInfo.dy > 0 ? `+${liveDragInfo.dy}` : liveDragInfo.dy})
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 text-indigo-300">
                  <span className="text-[10px] text-zinc-400">W:</span>
                  <span className="font-bold">{liveDragInfo.w}px</span>
                </span>
                <span className="text-zinc-600">×</span>
                <span className="flex items-center gap-1 text-indigo-300">
                  <span className="text-[10px] text-zinc-400">H:</span>
                  <span className="font-bold">{liveDragInfo.h}px</span>
                </span>
              </>
            )}
          </div>
        )}

        {/* --- LIVE DRAWING DIMENSION BADGE --- */}
        {isDrawingShape && shapePreviewData && (
          <div
            style={{
              position: 'absolute',
              left: `${shapePreviewData.cx}px`,
              top: `${shapePreviewData.cy + shapePreviewData.h / 2 + 16}px`,
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
            className="bg-blue-600/90 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-lg backdrop-blur-xs flex items-center gap-1 z-30"
          >
            <span>{Math.round(shapePreviewData.w)} × {Math.round(shapePreviewData.h)} px</span>
            {shapeShiftKey && <span className="text-[9px] text-blue-200 bg-blue-700/80 px-1 rounded">1:1</span>}
            {shapeAltKey && <span className="text-[9px] text-amber-200 bg-amber-700/80 px-1 rounded">Centro</span>}
          </div>
        )}

        {/* Interactive Transform Gizmo & Bounding Box for Primary Selected Layer */}
        {activeTool === 'select' && selectedLayer && evaluatedSelected && (() => {
          let gizmoW = 140;
          let gizmoH = 100;
          if (selectedLayer.type === 'rect' && evaluatedSelected.rect) {
            gizmoW = evaluatedSelected.rect.width;
            gizmoH = evaluatedSelected.rect.height;
          } else if (selectedLayer.type === 'circle' && evaluatedSelected.circle) {
            gizmoW = evaluatedSelected.circle.radiusX * 2;
            gizmoH = evaluatedSelected.circle.radiusY * 2;
          } else if (selectedLayer.type === 'star' && evaluatedSelected.star) {
            gizmoW = evaluatedSelected.star.outerRadius * 2;
            gizmoH = evaluatedSelected.star.outerRadius * 2;
          } else if (selectedLayer.type === 'polygon' && evaluatedSelected.polygon) {
            gizmoW = evaluatedSelected.polygon.radius * 2;
            gizmoH = evaluatedSelected.polygon.radius * 2;
          } else if (selectedLayer.type === 'text' && evaluatedSelected.text && selectedLayer.text) {
            const charCount = Math.max(1, (selectedLayer.text.text || '').length);
            gizmoW = evaluatedSelected.text.fontSize * 0.65 * charCount;
            gizmoH = evaluatedSelected.text.fontSize * 1.2;
          } else if (selectedLayer.type === 'image' && evaluatedSelected.image) {
            gizmoW = evaluatedSelected.image.width;
            gizmoH = evaluatedSelected.image.height;
          }

          return (
            <div
              style={{
                position: 'absolute',
                left: `${evaluatedSelected.position.x}px`,
                top: `${evaluatedSelected.position.y}px`,
                transform: `translate(-50%, -50%) rotate(${evaluatedSelected.rotation}deg) scale(${
                  evaluatedSelected.scale.x / 100
                }, ${evaluatedSelected.scale.y / 100})`,
                transformOrigin: `${evaluatedSelected.anchorPoint.x + 50}% ${
                  evaluatedSelected.anchorPoint.y + 50
                }%`,
                width: `${gizmoW}px`,
                height: `${gizmoH}px`,
                pointerEvents: 'none',
              }}
              className="border border-blue-500/80 ring-1 ring-blue-500/30"
            >
              {/* Multi-item badge */}
              {selectedLayerIds.length > 1 && (
                <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow pointer-events-none ring-2 ring-zinc-900 z-20">
                  {selectedLayerIds.length}
                </div>
              )}

              {/* Center Anchor Point Crosshair */}
              <div
                onMouseDown={(e) => handleGizmoStart('anchor', 'center', e)}
                title="Punto de Anclaje (Pívot)"
                style={{
                  left: `calc(50% + ${evaluatedSelected.anchorPoint.x}px)`,
                  top: `calc(50% + ${evaluatedSelected.anchorPoint.y}px)`,
                  pointerEvents: 'auto',
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-blue-400 bg-blue-500/40 flex items-center justify-center cursor-move shadow-md z-10"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Rotation Handle (top lollipop) */}
              <div
                onMouseDown={(e) => handleGizmoStart('rotate', 'rot', e)}
                title="Arrastra para Rotar"
                style={{ pointerEvents: 'auto' }}
                className="absolute -top-7 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-blue-500 border border-white cursor-grab hover:scale-125 transition-transform flex items-center justify-center shadow-lg z-10"
              >
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-blue-500" />
              </div>

              {/* 8 Bounding Box Scale Handles */}
              {[
                { id: 'tl', pos: '-top-1 -left-1', cursor: 'cursor-nwse-resize' },
                { id: 'tr', pos: '-top-1 -right-1', cursor: 'cursor-nesw-resize' },
                { id: 'bl', pos: '-bottom-1 -left-1', cursor: 'cursor-nesw-resize' },
                { id: 'br', pos: '-bottom-1 -right-1', cursor: 'cursor-nwse-resize' },
                { id: 'tm', pos: '-top-1 left-1/2 -translate-x-1/2', cursor: 'cursor-ns-resize' },
                { id: 'bm', pos: '-bottom-1 left-1/2 -translate-x-1/2', cursor: 'cursor-ns-resize' },
                { id: 'ml', pos: 'top-1/2 -left-1 -translate-y-1/2', cursor: 'cursor-ew-resize' },
                { id: 'mr', pos: 'top-1/2 -right-1 -translate-y-1/2', cursor: 'cursor-ew-resize' },
              ].map((handle) => (
                <div
                  key={handle.id}
                  onMouseDown={(e) => handleGizmoStart('scale', handle.id, e)}
                  style={{ pointerEvents: 'auto' }}
                  className={`absolute w-2 h-2 bg-white border border-blue-600 rounded-[2px] shadow-sm hover:scale-125 transition-transform ${handle.pos} ${handle.cursor} z-10`}
                />
              ))}

              {/* Corner Rotation Hover Zones */}
              {[
                { id: 'rot_tl', pos: '-top-3.5 -left-3.5', cursor: 'cursor-crosshair' },
                { id: 'rot_tr', pos: '-top-3.5 -right-3.5', cursor: 'cursor-crosshair' },
                { id: 'rot_bl', pos: '-bottom-3.5 -left-3.5', cursor: 'cursor-crosshair' },
                { id: 'rot_br', pos: '-bottom-3.5 -right-3.5', cursor: 'cursor-crosshair' },
              ].map((zone) => (
                <div
                  key={zone.id}
                  onMouseDown={(e) => handleGizmoStart('rotate', zone.id, e)}
                  style={{ pointerEvents: 'auto' }}
                  title="Arrastra para Rotar"
                  className={`absolute w-3.5 h-3.5 rounded-full ${zone.pos} ${zone.cursor} z-10 opacity-0 hover:opacity-100 hover:bg-blue-500/20 border border-blue-400/60 transition-opacity`}
                />
              ))}

              {/* Translate Move Zone */}
              <div
                onMouseDown={(e) => handleGizmoStart('translate', 'body', e)}
                style={{ pointerEvents: 'auto' }}
                title={selectedLayerIds.length > 1 ? `Arrastrar ${selectedLayerIds.length} elementos` : 'Arrastrar capa'}
                className="absolute inset-0 cursor-move"
              />
            </div>
          );
        })()}
      </div>

      {/* --- FLOATING PEN TOOL STATUS & FINISH BAR --- */}
      {activeTool === 'pen' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-zinc-900 border border-sky-500/50 px-3.5 py-1.5 rounded-lg text-xs text-zinc-200 shadow-xl z-30 select-none animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-semibold text-sky-400">Pluma Vectorial:</span>
          <span className="text-zinc-400 text-[11px]">
            {penNodes.length === 0
              ? 'Haz clic para colocar el primer punto'
              : `${penNodes.length} puntos • Arrastra para curvar • Clic en nodo 1 para cerrar`}
          </span>

          {penNodes.length >= 2 && (
            <button
              onClick={() => finishPenPath(false)}
              className="ml-2 px-2.5 py-0.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
            >
              <Check className="w-3 h-3" />
              <span>Finalizar</span>
            </button>
          )}

          <button
            onClick={() => {
              setPenNodes([]);
              if (onSelectTool) onSelectTool('select');
            }}
            title="Cancelar trazo (Esc)"
            className="p-1 text-zinc-400 hover:text-white rounded-md cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Minimalist Info Pill */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-zinc-900 border border-zinc-750 px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-300 shadow-lg pointer-events-none select-none">
        <span className="text-zinc-200 font-semibold">{composition.width}×{composition.height}px</span>
        <span className="text-zinc-500">|</span>
        <span className="text-zinc-350">{composition.fps} FPS</span>
        <span className="text-zinc-500">|</span>
        <span className="text-blue-400">{Math.round(viewportState.zoom * 100)}%</span>
        {selectedLayerIds.length > 1 ? (
          <>
            <span className="text-zinc-500">|</span>
            <span className="text-amber-400 font-medium">{selectedLayerIds.length} capas</span>
          </>
        ) : selectedLayer ? (
          <>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-350 truncate max-w-[120px]">{selectedLayer.name}</span>
          </>
        ) : null}
      </div>

      {/* --- CANVAS RIGHT-CLICK CONTEXT MENU --- */}
      {canvasContextMenu && (
        <div
          id="canvas-context-menu"
          style={{ left: `${canvasContextMenu.x}px`, top: `${canvasContextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 min-w-[210px] bg-zinc-900 border border-zinc-750 rounded-lg shadow-2xl p-1.5 text-xs text-zinc-200 animate-in fade-in zoom-in-95 duration-100 select-none font-sans"
        >
          {canvasContextMenu.layerId || selectedLayer ? (
            // Layer Context Menu
            (() => {
              const targetLayer =
                composition.layers.find((l) => l.id === canvasContextMenu.layerId) || selectedLayer;
              if (!targetLayer) return null;

              return (
                <div className="flex flex-col gap-0.5">
                  {/* Layer Header */}
                  <div className="px-2 py-1 text-[11px] font-medium text-zinc-400 border-b border-zinc-800 flex items-center justify-between">
                    <span className="truncate max-w-[140px] text-zinc-200 font-semibold">{targetLayer.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1 bg-zinc-800 rounded text-zinc-400">{targetLayer.type}</span>
                  </div>

                  {/* Add Keyframe Quick Action */}
                  <div className="px-2 py-1 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                    Keyframes
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    <button
                      onClick={() => {
                        onAddKeyframe?.('all');
                        setCanvasContextMenu(null);
                      }}
                      className="px-2 py-1 hover:bg-blue-600/30 hover:text-blue-300 rounded flex items-center justify-between text-[11px] transition-colors cursor-pointer text-left"
                    >
                      <span>Todo</span>
                      <kbd className="text-[9px] bg-zinc-800 px-1 rounded text-zinc-400">F6</kbd>
                    </button>
                    <button
                      onClick={() => {
                        onAddKeyframe?.('position');
                        setCanvasContextMenu(null);
                      }}
                      className="px-2 py-1 hover:bg-blue-600/30 hover:text-blue-300 rounded flex items-center justify-between text-[11px] transition-colors cursor-pointer text-left"
                    >
                      <span>Posición</span>
                      <kbd className="text-[9px] bg-zinc-800 px-1 rounded text-zinc-400">P</kbd>
                    </button>
                    <button
                      onClick={() => {
                        onAddKeyframe?.('scale');
                        setCanvasContextMenu(null);
                      }}
                      className="px-2 py-1 hover:bg-blue-600/30 hover:text-blue-300 rounded flex items-center justify-between text-[11px] transition-colors cursor-pointer text-left"
                    >
                      <span>Escala</span>
                      <kbd className="text-[9px] bg-zinc-800 px-1 rounded text-zinc-400">S</kbd>
                    </button>
                    <button
                      onClick={() => {
                        onAddKeyframe?.('rotation');
                        setCanvasContextMenu(null);
                      }}
                      className="px-2 py-1 hover:bg-blue-600/30 hover:text-blue-300 rounded flex items-center justify-between text-[11px] transition-colors cursor-pointer text-left"
                    >
                      <span>Rotación</span>
                      <kbd className="text-[9px] bg-zinc-800 px-1 rounded text-zinc-400">R</kbd>
                    </button>
                  </div>

                  <div className="h-px bg-zinc-800 my-1" />

                  {/* Motion Presets & AI */}
                  {onOpenMotionPresets && (
                    <button
                      onClick={() => {
                        onOpenMotionPresets();
                        setCanvasContextMenu(null);
                      }}
                      className="w-full px-2 py-1 hover:bg-zinc-800 hover:text-amber-300 rounded flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Presets GSAP & Físicas...</span>
                    </button>
                  )}

                  <div className="h-px bg-zinc-800 my-1" />

                  {/* Layer Ordering */}
                  {onReorderLayer && (
                    <>
                      <button
                        onClick={() => {
                          onReorderLayer(targetLayer.id, 'front');
                          setCanvasContextMenu(null);
                        }}
                        className="w-full px-2 py-1 hover:bg-zinc-800 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-1.5"><ChevronUp className="w-3.5 h-3.5 text-blue-400" /> Traer al frente</span>
                        <span className="text-[10px] text-zinc-500">Ctrl+Shift+]</span>
                      </button>
                      <button
                        onClick={() => {
                          onReorderLayer(targetLayer.id, 'forward');
                          setCanvasContextMenu(null);
                        }}
                        className="w-full px-2 py-1 hover:bg-zinc-800 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-1.5"><ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> Subir capa</span>
                        <span className="text-[10px] text-zinc-500">Ctrl+]</span>
                      </button>
                      <button
                        onClick={() => {
                          onReorderLayer(targetLayer.id, 'backward');
                          setCanvasContextMenu(null);
                        }}
                        className="w-full px-2 py-1 hover:bg-zinc-800 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-1.5"><ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> Bajar capa</span>
                        <span className="text-[10px] text-zinc-500">Ctrl+[</span>
                      </button>
                      <button
                        onClick={() => {
                          onReorderLayer(targetLayer.id, 'back');
                          setCanvasContextMenu(null);
                        }}
                        className="w-full px-2 py-1 hover:bg-zinc-800 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-1.5"><ChevronDown className="w-3.5 h-3.5 text-blue-400" /> Enviar al fondo</span>
                        <span className="text-[10px] text-zinc-500">Ctrl+Shift+[</span>
                      </button>
                    </>
                  )}

                  <div className="h-px bg-zinc-800 my-1" />

                  {/* Transform Utilities */}
                  <div className="flex items-center justify-between px-1 py-0.5">
                    {onApplyFigmaAlign && (
                      <>
                        <button
                          title="Alinear Izquierda"
                          onClick={() => {
                            onApplyFigmaAlign('alignLeft');
                            setCanvasContextMenu(null);
                          }}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Centrar Horizontalmente"
                          onClick={() => {
                            onApplyFigmaAlign('alignCenterH');
                            setCanvasContextMenu(null);
                          }}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Alinear Derecha"
                          onClick={() => {
                            onApplyFigmaAlign('alignRight');
                            setCanvasContextMenu(null);
                          }}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      title="Invertir Horizontal"
                      onClick={() => {
                        onHistorySnapshot?.();
                        onUpdateLayerTransform(targetLayer.id, {
                          scale: {
                            ...targetLayer.transform.scale,
                            value: {
                              x: -targetLayer.transform.scale.value.x,
                              y: targetLayer.transform.scale.value.y,
                            },
                          },
                        });
                        setCanvasContextMenu(null);
                      }}
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Invertir Vertical"
                      onClick={() => {
                        onHistorySnapshot?.();
                        onUpdateLayerTransform(targetLayer.id, {
                          scale: {
                            ...targetLayer.transform.scale,
                            value: {
                              x: targetLayer.transform.scale.value.x,
                              y: -targetLayer.transform.scale.value.y,
                            },
                          },
                        });
                        setCanvasContextMenu(null);
                      }}
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      <FlipVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-px bg-zinc-800 my-1" />

                  {/* Duplicate & Delete */}
                  {onDuplicateLayer && (
                    <button
                      onClick={() => {
                        onDuplicateLayer(targetLayer.id);
                        setCanvasContextMenu(null);
                      }}
                      className="w-full px-2 py-1 hover:bg-zinc-800 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-1.5"><Copy className="w-3.5 h-3.5 text-zinc-400" /> Duplicar Capa</span>
                      <span className="text-[10px] text-zinc-500">Ctrl+D</span>
                    </button>
                  )}
                  {onDeleteLayer && (
                    <button
                      onClick={() => {
                        onDeleteLayer(targetLayer.id);
                        setCanvasContextMenu(null);
                      }}
                      className="w-full px-2 py-1 hover:bg-red-500/20 text-red-400 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Eliminar Capa</span>
                      <span className="text-[10px] text-red-400/70">Supr</span>
                    </button>
                  )}
                </div>
              );
            })()
          ) : (
            // Canvas View Context Menu
            <div className="flex flex-col gap-0.5">
              <div className="px-2 py-1 text-[11px] font-semibold text-zinc-300 border-b border-zinc-800 flex items-center justify-between">
                <span>Lienzo de Animación</span>
                <span className="text-[10px] font-mono text-blue-400">{canvasContextMenu.stageX}, {canvasContextMenu.stageY}px</span>
              </div>

              {/* Insert Layer Here */}
              <div className="px-2 py-1 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                Insertar Capa Aquí
              </div>
              <div className="grid grid-cols-2 gap-1 px-1">
                <button
                  onClick={() => {
                    onAddLayerAtPos('rect', { x: canvasContextMenu.stageX, y: canvasContextMenu.stageY });
                    setCanvasContextMenu(null);
                  }}
                  className="px-2 py-1 hover:bg-zinc-800 rounded flex items-center gap-1.5 text-[11px] cursor-pointer text-left"
                >
                  <Square className="w-3 h-3 text-blue-400" />
                  <span>Rectángulo</span>
                </button>
                <button
                  onClick={() => {
                    onAddLayerAtPos('circle', { x: canvasContextMenu.stageX, y: canvasContextMenu.stageY });
                    setCanvasContextMenu(null);
                  }}
                  className="px-2 py-1 hover:bg-zinc-800 rounded flex items-center gap-1.5 text-[11px] cursor-pointer text-left"
                >
                  <Circle className="w-3 h-3 text-emerald-400" />
                  <span>Círculo</span>
                </button>
                <button
                  onClick={() => {
                    onAddLayerAtPos('star', { x: canvasContextMenu.stageX, y: canvasContextMenu.stageY });
                    setCanvasContextMenu(null);
                  }}
                  className="px-2 py-1 hover:bg-zinc-800 rounded flex items-center gap-1.5 text-[11px] cursor-pointer text-left"
                >
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>Estrella</span>
                </button>
                <button
                  onClick={() => {
                    onAddLayerAtPos('text', { x: canvasContextMenu.stageX, y: canvasContextMenu.stageY });
                    setCanvasContextMenu(null);
                  }}
                  className="px-2 py-1 hover:bg-zinc-800 rounded flex items-center gap-1.5 text-[11px] cursor-pointer text-left"
                >
                  <Type className="w-3 h-3 text-purple-400" />
                  <span>Texto</span>
                </button>
              </div>

              <div className="h-px bg-zinc-800 my-1" />

              {/* Viewport Actions */}
              {onResetViewport && (
                <button
                  onClick={() => {
                    onResetViewport();
                    setCanvasContextMenu(null);
                  }}
                  className="w-full px-2 py-1 hover:bg-zinc-800 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5 text-zinc-400" /> Ajustar a Pantalla</span>
                  <span className="text-[10px] text-zinc-500">Fit</span>
                </button>
              )}
              <button
                onClick={() => {
                  onUpdateViewport({ showGrid: !viewportState.showGrid });
                  setCanvasContextMenu(null);
                }}
                className="w-full px-2 py-1 hover:bg-zinc-800 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <span className="flex items-center gap-1.5"><Grid className="w-3.5 h-3.5 text-zinc-400" /> Alternar Cuadrícula</span>
                <span className={`text-[10px] ${viewportState.showGrid ? 'text-blue-400' : 'text-zinc-500'}`}>{viewportState.showGrid ? 'Activada' : 'Desactivada'}</span>
              </button>
              <button
                onClick={() => {
                  onUpdateViewport({ showRulers: !viewportState.showRulers });
                  setCanvasContextMenu(null);
                }}
                className="w-full px-2 py-1 hover:bg-zinc-800 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-zinc-400" /> Alternar Reglas</span>
                <span className={`text-[10px] ${viewportState.showRulers ? 'text-cyan-400' : 'text-zinc-500'}`}>{viewportState.showRulers ? 'Activadas' : 'Desactivadas'}</span>
              </button>
              {activeGuides.length > 0 && (
                <button
                  onClick={() => {
                    handleClearAllGuides();
                    setCanvasContextMenu(null);
                  }}
                  className="w-full px-2 py-1 hover:bg-red-500/20 text-red-400 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Borrar Guías</span>
                  <span className="text-[10px] text-red-400/70">{activeGuides.length}</span>
                </button>
              )}

              {onTogglePlay && (
                <button
                  onClick={() => {
                    onTogglePlay();
                    setCanvasContextMenu(null);
                  }}
                  className="w-full px-2 py-1 hover:bg-zinc-800 rounded flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-1.5">
                    {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Espacio</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Live Tooltip Badge while Dragging a Guide */}
      {draggingGuide && draggingCursorPos && (
        <div
          className="absolute pointer-events-none z-50 transition-transform duration-75"
          style={{
            left: `${draggingCursorPos.x + 16}px`,
            top: `${draggingCursorPos.y + 16}px`,
          }}
        >
          <div
            className={`px-2.5 py-1 rounded shadow-2xl text-xs font-mono font-semibold flex items-center gap-1.5 border backdrop-blur-md ${
              draggingGuide.isDeleteHover
                ? 'bg-red-950/95 text-red-200 border-red-500/80'
                : draggingGuide.isSnapped
                ? 'bg-pink-950/95 text-pink-200 border-pink-500/80 animate-pulse'
                : 'bg-zinc-900/95 text-cyan-200 border-cyan-500/60'
            }`}
          >
            {draggingGuide.isDeleteHover ? (
              <span className="flex items-center gap-1.5 text-red-300">
                <Trash2 className="w-3 h-3 text-red-400" />
                <span>Soltar para eliminar guía</span>
              </span>
            ) : draggingGuide.isSnapped ? (
              <>
                <span className="text-pink-400">✦</span>
                <span>{draggingGuide.snapLabel}</span>
              </>
            ) : (
              <span>
                {draggingGuide.axis === 'horizontal'
                  ? `Y: ${draggingGuide.currentPos}px`
                  : `X: ${draggingGuide.currentPos}px`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Guide Context Menu */}
      {guideContextMenu && (
        <div
          className="fixed z-50 bg-zinc-900 border border-zinc-750 rounded-md shadow-2xl p-1 text-xs text-zinc-200 pointer-events-auto flex flex-col gap-0.5 backdrop-blur-md min-w-[200px]"
          style={{ left: `${guideContextMenu.x}px`, top: `${guideContextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-[10px] uppercase font-semibold text-zinc-400 tracking-wider border-b border-zinc-800 flex items-center justify-between">
            <span>Guía de Alineación</span>
            <span className="text-cyan-400 font-mono">
              {activeGuides.find((g) => g.id === guideContextMenu.guideId)?.axis === 'horizontal' ? 'Horizontal' : 'Vertical'}
            </span>
          </div>
          <button
            onClick={() => {
              handleDeleteGuide(guideContextMenu.guideId);
              setGuideContextMenu(null);
            }}
            className="px-2 py-1.5 hover:bg-red-500/20 text-red-400 rounded flex items-center gap-2 cursor-pointer text-left transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Guía</span>
          </button>
          <button
            onClick={() => {
              onUpdateViewport({ guidesLocked: !viewportState.guidesLocked });
              setGuideContextMenu(null);
            }}
            className="px-2 py-1.5 hover:bg-zinc-800 rounded flex items-center gap-2 cursor-pointer text-left transition-colors"
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">
              {viewportState.guidesLocked ? '🔓' : '🔒'}
            </span>
            <span>{viewportState.guidesLocked ? 'Desbloquear Guías' : 'Bloquear Guías'}</span>
          </button>
          {selectedLayer && (
            <button
              onClick={() => {
                const targetGuide = activeGuides.find((g) => g.id === guideContextMenu.guideId);
                if (targetGuide) {
                  if (targetGuide.axis === 'horizontal') {
                    onUpdateLayerTransform(selectedLayer.id, {
                      position: {
                        ...selectedLayer.transform.position,
                        value: { ...selectedLayer.transform.position.value, y: targetGuide.position },
                      },
                    });
                  } else {
                    onUpdateLayerTransform(selectedLayer.id, {
                      position: {
                        ...selectedLayer.transform.position,
                        value: { ...selectedLayer.transform.position.value, x: targetGuide.position },
                      },
                    });
                  }
                }
                setGuideContextMenu(null);
              }}
              className="px-2 py-1.5 hover:bg-zinc-800 text-cyan-400 rounded flex items-center gap-2 cursor-pointer text-left transition-colors"
            >
              <Move className="w-3.5 h-3.5" />
              <span>Alinear Capa Seleccionada a esta Guía</span>
            </button>
          )}
          {activeGuides.length > 1 && (
            <>
              <div className="h-px bg-zinc-800 my-0.5" />
              <button
                onClick={() => {
                  handleClearAllGuides();
                  setGuideContextMenu(null);
                }}
                className="px-2 py-1 hover:bg-red-500/20 text-red-400 rounded flex items-center gap-2 cursor-pointer text-left transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar Todas las Guías ({activeGuides.length})</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Horizontal & Vertical Rulers */}
      {viewportState.showRulers && (
        <CanvasRulers
          compositionWidth={composition.width}
          compositionHeight={composition.height}
          zoom={viewportState.zoom}
          containerRef={containerRef}
          stageRef={stageRef}
          selectedBounds={selectedBounds}
          guides={activeGuides}
          onStartDragNewGuide={handleStartDragNewGuide}
          onToggleRulers={() => onUpdateViewport({ showRulers: !viewportState.showRulers })}
          onClearGuides={() => handleClearAllGuides()}
          onToggleLockGuides={() => onUpdateViewport({ guidesLocked: !viewportState.guidesLocked })}
          guidesLocked={viewportState.guidesLocked}
          onAddGuideAtPosition={handleAddGuideAtPosition}
        />
      )}
    </div>
  );
};
