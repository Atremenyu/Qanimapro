import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Composition,
  VectorLayer,
  AnimatableProp,
  Keyframe,
  EasingType,
} from '../types';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  Timer,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Trash2,
  Activity,
  Layers,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  GripVertical,
  RotateCw,
  Scaling,
  SunMedium,
  Move,
  CircleDot,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Sparkles,
  Clock,
} from 'lucide-react';
import { TimelineToolbar } from './timeline/TimelineToolbar';
import { TimelineContextMenu } from './timeline/TimelineContextMenu';
import { evaluateProp } from '../utils/animEngine';

export interface SelectedKeyframeItem {
  layerId: string;
  propPath: string;
  keyframeId: string;
  originalTime: number;
}

interface TimelinePanelProps {
  composition: Composition;
  currentTime: number;
  onSetTime: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  autoKeyframe?: boolean;
  onToggleAutoKeyframe?: () => void;
  selectedLayerIds: string[];
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onUpdateLayer: (layerId: string, updated: Partial<VectorLayer>) => void;
  onDeleteLayer: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
  onReorderLayers: (startIndex: number, endIndex: number) => void;
  onReorderLayerDirection?: (layerId: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
  onOpenKeyframeGuide?: () => void;
  onOpenMotionPresets?: () => void;
  onDismiss?: () => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  time: number;
  layer: VectorLayer;
  propPath?: string;
  keyframeId?: string;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  composition,
  currentTime,
  onSetTime,
  isPlaying,
  onTogglePlay,
  autoKeyframe = true,
  onToggleAutoKeyframe,
  selectedLayerIds,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onReorderLayers,
  onReorderLayerDirection,
  onOpenKeyframeGuide,
  onOpenMotionPresets,
  onDismiss,
}) => {
  const [timelineZoom, setTimelineZoom] = useState<number>(1.2);
  const [isGraphEditor, setIsGraphEditor] = useState<boolean>(false);
  const [selectedKeyframe, setSelectedKeyframe] = useState<{
    layerId: string;
    propPath: string;
    keyframeId: string;
  } | null>(null);

  // Multi-Keyframe Selection Set
  const [selectedKeyframes, setSelectedKeyframes] = useState<{
    layerId: string;
    propPath: string;
    keyframeId: string;
    originalTime: number;
  }[]>([]);

  // Timeline Box/Marquee Selection
  const [isBoxSelecting, setIsBoxSelecting] = useState<boolean>(false);
  const [boxStart, setBoxStart] = useState<{ x: number; y: number } | null>(null);
  const [boxCurrent, setBoxCurrent] = useState<{ x: number; y: number } | null>(null);

  // Swipe / Drag down to Dismiss State (Only active from the top tab/handle strip)
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDraggingY, setIsDraggingY] = useState(false);
  const startYRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleHandlePointerDownY = (e: React.PointerEvent) => {
    e.stopPropagation();
    startYRef.current = e.clientY;
    startTimeRef.current = Date.now();
    setIsDraggingY(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveY = (e: React.PointerEvent) => {
    if (startYRef.current === null) return;
    const diff = e.clientY - startYRef.current;
    // Only drag downwards (positive)
    setDragOffsetY(Math.max(0, Math.min(220, diff)));
  };

  const handlePointerUpY = (e: React.PointerEvent) => {
    if (startYRef.current === null) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    const elapsed = Date.now() - startTimeRef.current;
    // Require deliberate drag distance so it never dismisses accidentally
    if (onDismiss && (dragOffsetY > 70 || (dragOffsetY > 35 && elapsed < 220))) {
      onDismiss();
    }
    setDragOffsetY(0);
    setIsDraggingY(false);
    startYRef.current = null;
  };

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);
  const [dragOverLayerIndex, setDragOverLayerIndex] = useState<number | null>(null);

  const rulerContainerRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const layersScrollRef = useRef<HTMLDivElement>(null);

  // Synchronized bidirectional vertical scroll between layer headers and timeline tracks
  const handleLayersScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (tracksRef.current && Math.abs(tracksRef.current.scrollTop - top) > 0.5) {
      tracksRef.current.scrollTop = top;
    }
  };

  const handleTracksScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Horizontal sync with time ruler
    if (rulerContainerRef.current && Math.abs(rulerContainerRef.current.scrollLeft - target.scrollLeft) > 0.5) {
      rulerContainerRef.current.scrollLeft = target.scrollLeft;
    }
    // Vertical sync with layers list
    const top = target.scrollTop;
    if (layersScrollRef.current && Math.abs(layersScrollRef.current.scrollTop - top) > 0.5) {
      layersScrollRef.current.scrollTop = top;
    }
  };

  const handleRulerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const left = e.currentTarget.scrollLeft;
    if (tracksRef.current && Math.abs(tracksRef.current.scrollLeft - left) > 0.5) {
      tracksRef.current.scrollLeft = left;
    }
  };

  // Keep selected layer visible in both layers and tracks viewports
  useEffect(() => {
    if (selectedLayerIds.length === 1) {
      const layerId = selectedLayerIds[0];
      const el = document.getElementById(`layer_header_${layerId}`);
      if (el && layersScrollRef.current && tracksRef.current) {
        const container = layersScrollRef.current;
        const elTop = el.offsetTop;
        const elHeight = el.offsetHeight;
        const containerScrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;

        if (elTop < containerScrollTop) {
          container.scrollTop = elTop;
          tracksRef.current.scrollTop = elTop;
        } else if (elTop + elHeight > containerScrollTop + containerHeight) {
          const target = elTop + elHeight - containerHeight;
          container.scrollTop = target;
          tracksRef.current.scrollTop = target;
        }
      }
    }
  }, [selectedLayerIds]);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [draggedKeyframe, setDraggedKeyframe] = useState<{
    layerId: string;
    startMouseX: number;
    isAltStretch?: boolean;
    anchorTime?: number;
    draggedOrigTime?: number;
    items: {
      layerId: string;
      propPath: string;
      keyframeId: string;
      originalTime: number;
    }[];
  } | null>(null);

  const pixelsPerSecond = 140 * timelineZoom;
  const totalTimelineWidth = Math.max(800, composition.duration * pixelsPerSecond + 120);

  // Time conversion
  const timeToPixels = useCallback(
    (time: number) => time * pixelsPerSecond,
    [pixelsPerSecond]
  );
  const pixelsToTime = useCallback(
    (px: number) => Math.max(0, Math.min(composition.duration, px / pixelsPerSecond)),
    [composition.duration, pixelsPerSecond]
  );

  // Fit Timeline to View
  const handleFitToView = () => {
    if (!tracksRef.current) return;
    const availableWidth = tracksRef.current.clientWidth - 100;
    if (availableWidth > 200 && composition.duration > 0) {
      const targetPps = availableWidth / composition.duration;
      const targetZoom = Math.max(0.4, Math.min(3.0, targetPps / 140));
      setTimelineZoom(targetZoom);
    }
  };

  // Bulk Easing on Selected Keyframes
  const applyBulkEasing = (easing: EasingType) => {
    if (selectedKeyframes.length === 0 && selectedKeyframe) {
      setKeyframeEasing(
        selectedKeyframe.layerId,
        selectedKeyframe.propPath,
        selectedKeyframe.keyframeId,
        easing
      );
      return;
    }
    const layerGroups: { [layerId: string]: SelectedKeyframeItem[] } = {};
    selectedKeyframes.forEach((item) => {
      if (!layerGroups[item.layerId]) layerGroups[item.layerId] = [];
      layerGroups[item.layerId].push(item);
    });

    Object.entries(layerGroups).forEach(([layerId, items]) => {
      const targetLayer = composition.layers.find((l) => l.id === layerId);
      if (targetLayer) {
        const updatedLayer = JSON.parse(JSON.stringify(targetLayer)) as VectorLayer;
        const props = getLayerProperties(updatedLayer);
        items.forEach((item) => {
          const p = props.find((x) => x.path === item.propPath);
          if (p && p.prop && p.prop.keyframes) {
            const kf = (p.prop.keyframes as any[]).find((k: any) => k.id === item.keyframeId);
            if (kf) {
              kf.easing = easing;
            }
          }
        });
        onUpdateLayer(layerId, updatedLayer);
      }
    });
  };

  // Align selected keyframes to the playhead (shift group so earliest starts at currentTime)
  const alignSelectedKeyframesToPlayhead = () => {
    const items = selectedKeyframes.length > 0
      ? selectedKeyframes
      : selectedKeyframe
      ? [
          {
            layerId: selectedKeyframe.layerId,
            propPath: selectedKeyframe.propPath,
            keyframeId: selectedKeyframe.keyframeId,
            originalTime: currentTime,
          },
        ]
      : [];
    if (items.length === 0) return;

    const minTime = Math.min(...items.map((k) => k.originalTime));
    const deltaTime = currentTime - minTime;

    const layerGroups: { [layerId: string]: SelectedKeyframeItem[] } = {};
    items.forEach((item) => {
      if (!layerGroups[item.layerId]) layerGroups[item.layerId] = [];
      layerGroups[item.layerId].push(item);
    });

    Object.entries(layerGroups).forEach(([layerId, groupItems]) => {
      const targetLayer = composition.layers.find((l) => l.id === layerId);
      if (targetLayer) {
        const updatedLayer = JSON.parse(JSON.stringify(targetLayer)) as VectorLayer;
        const props = getLayerProperties(updatedLayer);
        groupItems.forEach((item) => {
          const p = props.find((x) => x.path === item.propPath);
          if (p && p.prop && p.prop.keyframes) {
            const kf = (p.prop.keyframes as any[]).find((k: any) => k.id === item.keyframeId);
            if (kf) {
              kf.time = Math.max(0, Math.min(composition.duration, kf.time + deltaTime));
            }
          }
        });
        props.forEach((p) => {
          if (p.prop && p.prop.keyframes) {
            (p.prop.keyframes as any[]).sort((a: any, b: any) => a.time - b.time);
          }
        });
        onUpdateLayer(layerId, updatedLayer);
      }
    });
  };

  // Reverse / Invert Keyframes within their group time range
  const reverseSelectedKeyframes = () => {
    if (selectedKeyframes.length < 2) return;
    const minTime = Math.min(...selectedKeyframes.map((k) => k.originalTime));
    const maxTime = Math.max(...selectedKeyframes.map((k) => k.originalTime));
    if (maxTime <= minTime) return;

    const layerGroups: { [layerId: string]: SelectedKeyframeItem[] } = {};
    selectedKeyframes.forEach((item) => {
      if (!layerGroups[item.layerId]) layerGroups[item.layerId] = [];
      layerGroups[item.layerId].push(item);
    });

    Object.entries(layerGroups).forEach(([layerId, groupItems]) => {
      const targetLayer = composition.layers.find((l) => l.id === layerId);
      if (targetLayer) {
        const updatedLayer = JSON.parse(JSON.stringify(targetLayer)) as VectorLayer;
        const props = getLayerProperties(updatedLayer);
        groupItems.forEach((item) => {
          const p = props.find((x) => x.path === item.propPath);
          if (p && p.prop && p.prop.keyframes) {
            const kf = (p.prop.keyframes as any[]).find((k: any) => k.id === item.keyframeId);
            if (kf) {
              kf.time = minTime + (maxTime - kf.time);
            }
          }
        });
        props.forEach((p) => {
          if (p.prop && p.prop.keyframes) {
            (p.prop.keyframes as any[]).sort((a: any, b: any) => a.time - b.time);
          }
        });
        onUpdateLayer(layerId, updatedLayer);
      }
    });
  };

  // Delete all selected keyframes
  const deleteSelectedKeyframes = () => {
    if (selectedKeyframes.length > 0) {
      const layerGroups: { [layerId: string]: SelectedKeyframeItem[] } = {};
      selectedKeyframes.forEach((item) => {
        if (!layerGroups[item.layerId]) layerGroups[item.layerId] = [];
        layerGroups[item.layerId].push(item);
      });
      Object.entries(layerGroups).forEach(([layerId, groupItems]) => {
        const targetLayer = composition.layers.find((l) => l.id === layerId);
        if (targetLayer) {
          const updatedLayer = JSON.parse(JSON.stringify(targetLayer)) as VectorLayer;
          const props = getLayerProperties(updatedLayer);
          const idsToDelete = new Set(groupItems.map((g) => g.keyframeId));
          props.forEach((p) => {
            if (p.prop && p.prop.keyframes) {
              (p.prop.keyframes as any[]) = (p.prop.keyframes as any[]).filter(
                (k: any) => !idsToDelete.has(k.id)
              );
              if (p.prop.keyframes.length === 0) {
                p.prop.isKeyframed = false;
              }
            }
          });
          onUpdateLayer(layerId, updatedLayer);
        }
      });
      setSelectedKeyframes([]);
      setSelectedKeyframe(null);
    } else if (selectedKeyframe) {
      deleteKeyframe(selectedKeyframe.layerId, selectedKeyframe.propPath, selectedKeyframe.keyframeId);
      setSelectedKeyframe(null);
    }
  };

  // Close context menu & keyboard shortcuts (Delete, Escape)
  useEffect(() => {
    const handleOutsideClick = () => {
      if (contextMenu) setContextMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (e.key === 'Escape') {
        if (contextMenu) setContextMenu(null);
        setSelectedKeyframes([]);
        setSelectedKeyframe(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
        if (selectedKeyframes.length > 0 || selectedKeyframe) {
          e.preventDefault();
          deleteSelectedKeyframes();
        }
      }
    };
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu, selectedKeyframes, selectedKeyframe]);

  // Ruler Scrubbing Handlers
  const handleRulerMouseDown = (e: React.MouseEvent) => {
    if (!rulerContainerRef.current) return;
    const containerRect = rulerContainerRef.current.getBoundingClientRect();
    const scrollLeft = rulerContainerRef.current.scrollLeft;
    const clickX = e.clientX - containerRect.left + scrollLeft;
    const newTime = pixelsToTime(clickX);
    onSetTime(newTime);
    setIsScrubbing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing && rulerContainerRef.current) {
        const containerRect = rulerContainerRef.current.getBoundingClientRect();
        const scrollLeft = rulerContainerRef.current.scrollLeft;
        const clickX = e.clientX - containerRect.left + scrollLeft;
        onSetTime(pixelsToTime(clickX));
      }

      if (isBoxSelecting && boxStart && tracksRef.current) {
        const rect = tracksRef.current.getBoundingClientRect();
        const curX = e.clientX - rect.left + tracksRef.current.scrollLeft;
        const curY = e.clientY - rect.top + tracksRef.current.scrollTop;
        setBoxCurrent({ x: curX, y: curY });
      }

      if (draggedKeyframe) {
        const deltaPx = e.clientX - draggedKeyframe.startMouseX;
        const deltaTime = deltaPx / pixelsPerSecond;

        // Group items by layerId
        const layerGroups: { [layerId: string]: typeof draggedKeyframe.items } = {};
        draggedKeyframe.items.forEach((item) => {
          if (!layerGroups[item.layerId]) layerGroups[item.layerId] = [];
          layerGroups[item.layerId].push(item);
        });

        // Check if Alt-Stretch is active
        const isAlt = draggedKeyframe.isAltStretch && draggedKeyframe.anchorTime !== undefined && draggedKeyframe.draggedOrigTime !== undefined;
        const anchorT = draggedKeyframe.anchorTime || 0;
        const origDragT = draggedKeyframe.draggedOrigTime || 1;
        const rawDragT = Math.max(0, Math.min(composition.duration, origDragT + deltaTime));
        const stretchRatio = Math.abs(origDragT - anchorT) > 0.001
          ? (rawDragT - anchorT) / (origDragT - anchorT)
          : 1;

        Object.entries(layerGroups).forEach(([layerId, items]) => {
          const targetLayer = composition.layers.find((l) => l.id === layerId);
          if (targetLayer) {
            const updatedLayer = JSON.parse(JSON.stringify(targetLayer)) as VectorLayer;
            const props = getLayerProperties(updatedLayer);
            let changed = false;

            items.forEach((item) => {
              const p = props.find((x) => x.path === item.propPath);
              if (p && p.prop && p.prop.keyframes) {
                const kf = (p.prop.keyframes as any[]).find((k: any) => k.id === item.keyframeId);
                if (kf) {
                  let targetTime = item.originalTime + deltaTime;
                  if (isAlt) {
                    targetTime = anchorT + (item.originalTime - anchorT) * stretchRatio;
                  }
                  const rawTime = Math.max(0, Math.min(composition.duration, targetTime));
                  const frameSnap = Math.round(rawTime * composition.fps) / composition.fps;
                  if (Math.abs(kf.time - frameSnap) > 0.0001) {
                    kf.time = frameSnap;
                    changed = true;
                  }
                }
              }
            });

            if (changed) {
              props.forEach((p) => {
                if (p.prop && p.prop.keyframes) {
                  (p.prop.keyframes as any[]).sort((a: any, b: any) => a.time - b.time);
                }
              });
              onUpdateLayer(targetLayer.id, updatedLayer);
            }
          }
        });
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggedKeyframe(null);

      if (isBoxSelecting && boxStart && boxCurrent) {
        setIsBoxSelecting(false);
        const minX = Math.min(boxStart.x, boxCurrent.x);
        const maxX = Math.max(boxStart.x, boxCurrent.x);
        const startTime = pixelsToTime(minX);
        const endTime = pixelsToTime(maxX);

        if (Math.abs(maxX - minX) > 4) {
          const matched: SelectedKeyframeItem[] = [];
          composition.layers.forEach((l) => {
            const props = getLayerProperties(l);
            props.forEach((p) => {
              if (p.prop && p.prop.keyframes) {
                p.prop.keyframes.forEach((k) => {
                  if (k.time >= startTime - 0.02 && k.time <= endTime + 0.02) {
                    matched.push({
                      layerId: l.id,
                      propPath: p.path,
                      keyframeId: k.id,
                      originalTime: k.time,
                    });
                  }
                });
              }
            });
          });
          if (matched.length > 0) {
            setSelectedKeyframes(matched);
            setSelectedKeyframe({
              layerId: matched[0].layerId,
              propPath: matched[0].propPath,
              keyframeId: matched[0].keyframeId,
            });
          }
        }
        setBoxStart(null);
        setBoxCurrent(null);
      }
    };

    if (isScrubbing || draggedKeyframe || isBoxSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isScrubbing,
    draggedKeyframe,
    isBoxSelecting,
    boxStart,
    boxCurrent,
    composition.duration,
    composition.fps,
    composition.layers,
    pixelsPerSecond,
    pixelsToTime,
    onSetTime,
    onUpdateLayer,
  ]);

  const updateKeyframeTime = (
    layer: VectorLayer,
    propPath: string,
    keyframeId: string,
    newTime: number,
    initialTime?: number
  ) => {
    const updatedLayer = JSON.parse(JSON.stringify(layer)) as VectorLayer;

    if (propPath === '__group__' && initialTime !== undefined) {
      const props = getLayerProperties(updatedLayer);
      let changed = false;
      props.forEach((p) => {
        if (p.prop && p.prop.keyframes) {
          p.prop.keyframes.forEach((k) => {
            if (Math.abs(k.time - initialTime) < 0.03) {
              k.time = newTime;
              changed = true;
            }
          });
          p.prop.keyframes.sort((a, b) => a.time - b.time);
        }
      });
      if (changed) {
        onUpdateLayer(layer.id, updatedLayer);
      }
      return;
    }

    let propObj: AnimatableProp<any> | null = null;

    if (propPath.startsWith('transform.')) {
      const key = propPath.replace('transform.', '') as keyof VectorLayer['transform'];
      propObj = updatedLayer.transform[key] as AnimatableProp<any>;
    } else if (propPath.startsWith('style.')) {
      const key = propPath.replace('style.', '') as keyof VectorLayer['style'];
      propObj = (updatedLayer.style as any)[key];
    } else if (propPath.startsWith('rect.') && updatedLayer.rect) {
      const key = propPath.replace('rect.', '') as keyof typeof updatedLayer.rect;
      propObj = (updatedLayer.rect as any)[key];
    }

    if (propObj && propObj.keyframes) {
      const kf = propObj.keyframes.find((k) => k.id === keyframeId);
      if (kf) {
        kf.time = newTime;
        propObj.keyframes.sort((a, b) => a.time - b.time);
        onUpdateLayer(layer.id, updatedLayer);
      }
    }
  };

  const deleteKeyframe = (
    layerId: string,
    propPath: string,
    keyframeId?: string,
    time?: number
  ) => {
    const layer = composition.layers.find((l) => l.id === layerId);
    if (!layer) return;
    const updatedLayer = JSON.parse(JSON.stringify(layer)) as VectorLayer;

    if ((propPath === 'all' || propPath === '__group__') && time !== undefined) {
      const props = getLayerProperties(updatedLayer);
      props.forEach((p) => {
        if (p.prop && p.prop.keyframes) {
          (p.prop.keyframes as any[]) = (p.prop.keyframes as any[]).filter(
            (k) => Math.abs(k.time - time) >= 0.03
          );
          if (p.prop.keyframes.length === 0) {
            p.prop.isKeyframed = false;
          }
        }
      });
      onUpdateLayer(layer.id, updatedLayer);
      setSelectedKeyframe(null);
      return;
    }

    let propObj: AnimatableProp<any> | null = null;

    if (propPath.startsWith('transform.')) {
      const key = propPath.replace('transform.', '') as keyof VectorLayer['transform'];
      propObj = updatedLayer.transform[key] as AnimatableProp<any>;
    } else if (propPath.startsWith('style.')) {
      const key = propPath.replace('style.', '') as keyof VectorLayer['style'];
      propObj = (updatedLayer.style as any)[key];
    }

    if (propObj && propObj.keyframes) {
      (propObj.keyframes as any[]) = (propObj.keyframes as any[]).filter(
        (k) => k.id !== keyframeId
      );
      if (propObj.keyframes.length === 0) {
        propObj.isKeyframed = false;
      }
      onUpdateLayer(layer.id, updatedLayer);
      if (selectedKeyframe?.keyframeId === keyframeId) {
        setSelectedKeyframe(null);
      }
    }
  };

  const duplicateKeyframeToPlayhead = (
    layer: VectorLayer,
    sourceTime: number,
    propPath?: string,
    keyframeId?: string
  ) => {
    const updatedLayer = JSON.parse(JSON.stringify(layer)) as VectorLayer;
    const targetTime = currentTime;

    if (!propPath || propPath === 'all' || propPath === '__group__') {
      const props = getLayerProperties(updatedLayer);
      props.forEach((p) => {
        if (p.prop && p.prop.isKeyframed && p.prop.keyframes) {
          const sourceKf = p.prop.keyframes.find((k) => Math.abs(k.time - sourceTime) < 0.03);
          if (sourceKf) {
            const kfs = p.prop.keyframes as any[];
            const existingIdx = kfs.findIndex((k) => Math.abs(k.time - targetTime) < 0.03);
            const newKf = {
              id: 'kf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
              time: targetTime,
              value: JSON.parse(JSON.stringify(sourceKf.value)),
              easing: sourceKf.easing,
            };
            if (existingIdx >= 0) {
              kfs[existingIdx] = newKf;
            } else {
              kfs.push(newKf);
            }
            kfs.sort((a, b) => a.time - b.time);
          }
        }
      });
      onUpdateLayer(layer.id, updatedLayer);
      return;
    }

    let propObj: AnimatableProp<any> | null = null;
    if (propPath.startsWith('transform.')) {
      const key = propPath.replace('transform.', '') as keyof VectorLayer['transform'];
      propObj = updatedLayer.transform[key] as AnimatableProp<any>;
    } else if (propPath.startsWith('style.')) {
      const key = propPath.replace('style.', '') as keyof VectorLayer['style'];
      propObj = (updatedLayer.style as any)[key];
    }

    if (propObj && propObj.keyframes) {
      const sourceKf = propObj.keyframes.find((k) => k.id === keyframeId || Math.abs(k.time - sourceTime) < 0.03);
      if (sourceKf) {
        const kfs = propObj.keyframes as any[];
        const existingIdx = kfs.findIndex((k) => Math.abs(k.time - targetTime) < 0.03);
        const newKf = {
          id: 'kf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          time: targetTime,
          value: JSON.parse(JSON.stringify(sourceKf.value)),
          easing: sourceKf.easing,
        };
        if (existingIdx >= 0) {
          kfs[existingIdx] = newKf;
        } else {
          kfs.push(newKf);
        }
        kfs.sort((a, b) => a.time - b.time);
        onUpdateLayer(layer.id, updatedLayer);
      }
    }
  };

  // Toggle stopwatch on/off for a property
  const toggleStopwatch = (layer: VectorLayer, propPath: string, currentValue: any) => {
    const updatedLayer = JSON.parse(JSON.stringify(layer)) as VectorLayer;
    let propObj: AnimatableProp<any> | null = null;

    if (propPath.startsWith('transform.')) {
      const key = propPath.replace('transform.', '') as keyof VectorLayer['transform'];
      propObj = updatedLayer.transform[key] as AnimatableProp<any>;
    } else if (propPath.startsWith('style.')) {
      const key = propPath.replace('style.', '') as keyof VectorLayer['style'];
      propObj = (updatedLayer.style as any)[key];
    }

    if (propObj) {
      if (propObj.isKeyframed) {
        propObj.isKeyframed = false;
        propObj.keyframes = [];
      } else {
        propObj.isKeyframed = true;
        const evaluatedVal = evaluateProp(propObj, currentTime);
        propObj.keyframes = [
          {
            id: 'kf_' + Date.now(),
            time: currentTime,
            value: JSON.parse(JSON.stringify(evaluatedVal !== undefined ? evaluatedVal : currentValue)),
            easing: 'easeInOut',
          },
        ];
      }
      onUpdateLayer(layer.id, updatedLayer);
    }
  };

  // Add keyframe at playhead or specific time
  const toggleKeyframeAtPlayhead = (layer: VectorLayer, propPath: string, targetTime?: number) => {
    const updatedLayer = JSON.parse(JSON.stringify(layer)) as VectorLayer;
    let propObj: AnimatableProp<any> | null = null;
    const timeToUse = targetTime !== undefined ? targetTime : currentTime;

    if (propPath.startsWith('transform.')) {
      const key = propPath.replace('transform.', '') as keyof VectorLayer['transform'];
      propObj = updatedLayer.transform[key] as AnimatableProp<any>;
    } else if (propPath.startsWith('style.')) {
      const key = propPath.replace('style.', '') as keyof VectorLayer['style'];
      propObj = (updatedLayer.style as any)[key];
    }

    if (propObj) {
      propObj.isKeyframed = true;
      if (!propObj.keyframes) propObj.keyframes = [];

      const existingIdx = propObj.keyframes.findIndex(
        (k) => Math.abs(k.time - timeToUse) < 0.06
      );

      if (existingIdx >= 0) {
        propObj.keyframes.splice(existingIdx, 1);
        if (propObj.keyframes.length === 0) {
          propObj.isKeyframed = false;
        }
      } else {
        const currentVal = evaluateProp(propObj, timeToUse);
        propObj.keyframes.push({
          id: 'kf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          time: timeToUse,
          value: JSON.parse(JSON.stringify(currentVal !== undefined ? currentVal : propObj.value)),
          easing: 'easeInOut',
        });
        propObj.keyframes.sort((a, b) => a.time - b.time);
      }
      onUpdateLayer(layer.id, updatedLayer);
    }
  };

  // Insert keyframe at specific time
  const insertKeyframeAtTime = (
    layer: VectorLayer,
    time: number,
    type: 'all' | 'rotation' | 'scale' | 'opacity' | 'position'
  ) => {
    const updatedLayer = JSON.parse(JSON.stringify(layer)) as VectorLayer;

    const propsToKeyframe: { path: string; prop: AnimatableProp<any> }[] = [];
    if (type === 'all' || type === 'position') {
      propsToKeyframe.push({ path: 'transform.position', prop: updatedLayer.transform.position });
    }
    if (type === 'all' || type === 'scale') {
      propsToKeyframe.push({ path: 'transform.scale', prop: updatedLayer.transform.scale });
    }
    if (type === 'all' || type === 'rotation') {
      propsToKeyframe.push({ path: 'transform.rotation', prop: updatedLayer.transform.rotation });
    }
    if (type === 'all' || type === 'opacity') {
      propsToKeyframe.push({ path: 'transform.opacity', prop: updatedLayer.transform.opacity });
    }

    propsToKeyframe.forEach(({ prop }) => {
      prop.isKeyframed = true;
      if (!prop.keyframes) prop.keyframes = [];

      const currentVal = evaluateProp(prop, time);
      const existingIdx = prop.keyframes.findIndex((k) => Math.abs(k.time - time) < 0.06);
      if (existingIdx >= 0) {
        prop.keyframes[existingIdx].time = time;
        prop.keyframes[existingIdx].value = JSON.parse(JSON.stringify(currentVal !== undefined ? currentVal : prop.value));
      } else {
        prop.keyframes.push({
          id: 'kf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          time,
          value: JSON.parse(JSON.stringify(currentVal !== undefined ? currentVal : prop.value)),
          easing: 'easeInOut',
        });
      }
      prop.keyframes.sort((a, b) => a.time - b.time);
    });

    onUpdateLayer(layer.id, updatedLayer);
  };

  const setKeyframeEasing = (
    layerId: string,
    propPath: string,
    keyframeId: string | undefined,
    easing: EasingType,
    time?: number
  ) => {
    const layer = composition.layers.find((l) => l.id === layerId);
    if (!layer) return;
    const updatedLayer = JSON.parse(JSON.stringify(layer)) as VectorLayer;

    if ((propPath === 'all' || propPath === '__group__') && time !== undefined) {
      const props = getLayerProperties(updatedLayer);
      props.forEach((p) => {
        if (p.prop && p.prop.keyframes) {
          p.prop.keyframes.forEach((k) => {
            if (Math.abs(k.time - time) < 0.03) {
              k.easing = easing;
            }
          });
        }
      });
      onUpdateLayer(layer.id, updatedLayer);
      return;
    }

    let propObj: AnimatableProp<any> | null = null;

    if (propPath.startsWith('transform.')) {
      const key = propPath.replace('transform.', '') as keyof VectorLayer['transform'];
      propObj = updatedLayer.transform[key] as AnimatableProp<any>;
    } else if (propPath.startsWith('style.')) {
      const key = propPath.replace('style.', '') as keyof VectorLayer['style'];
      propObj = (updatedLayer.style as any)[key];
    }

    if (propObj && propObj.keyframes) {
      const kf = propObj.keyframes.find((k) => k.id === keyframeId || (time !== undefined && Math.abs(k.time - time) < 0.03));
      if (kf) {
        kf.easing = easing;
        onUpdateLayer(layer.id, updatedLayer);
      }
    }
  };

  // Jump to Previous / Next keyframe
  const handleJumpKeyframe = (direction: 'prev' | 'next') => {
    const allTimes: number[] = [];
    composition.layers.forEach((l) => {
      const props = [
        l.transform.position,
        l.transform.scale,
        l.transform.rotation,
        l.transform.opacity,
      ];
      props.forEach((p) => {
        if (p.isKeyframed && p.keyframes) {
          p.keyframes.forEach((k) => allTimes.push(k.time));
        }
      });
    });

    const uniqueTimes = Array.from(new Set(allTimes)).sort((a, b) => a - b);
    if (uniqueTimes.length === 0) return;

    if (direction === 'prev') {
      const prevTimes = uniqueTimes.filter((t) => t < currentTime - 0.02);
      if (prevTimes.length > 0) {
        onSetTime(prevTimes[prevTimes.length - 1]);
      } else {
        onSetTime(0);
      }
    } else {
      const nextTimes = uniqueTimes.filter((t) => t > currentTime + 0.02);
      if (nextTimes.length > 0) {
        onSetTime(nextTimes[0]);
      } else {
        onSetTime(composition.duration);
      }
    }
  };

  // Step 1 frame
  const handleStepFrame = (deltaFrames: number) => {
    const newTime = Math.max(
      0,
      Math.min(composition.duration, currentTime + deltaFrames / composition.fps)
    );
    onSetTime(newTime);
  };

  // Generate ruler tick marks
  const rulerTicks = [];
  const totalFrames = Math.round(composition.duration * composition.fps);
  const frameStep = composition.fps >= 60 ? 10 : 5;

  for (let f = 0; f <= totalFrames; f += frameStep) {
    const t = f / composition.fps;
    const x = timeToPixels(t);
    const isMajor = f % (composition.fps / 2) === 0;
    rulerTicks.push({
      time: t,
      frame: f,
      x,
      isMajor,
      label: isMajor ? `${t.toFixed(1)}s` : `${f}f`,
    });
  }

  // Properties to list for each layer in tree
  const getLayerProperties = (layer: VectorLayer) => [
    { label: 'Position', path: 'transform.position', prop: layer.transform.position },
    { label: 'Scale', path: 'transform.scale', prop: layer.transform.scale },
    { label: 'Rotation', path: 'transform.rotation', prop: layer.transform.rotation },
    { label: 'Opacity', path: 'transform.opacity', prop: layer.transform.opacity },
    { label: 'Anchor Point', path: 'transform.anchorPoint', prop: layer.transform.anchorPoint },
    { label: 'Fill Color', path: 'style.fill', prop: layer.style.fill },
    { label: 'Stroke Color', path: 'style.stroke', prop: layer.style.stroke },
    { label: 'Stroke Width', path: 'style.strokeWidth', prop: layer.style.strokeWidth },
    { label: 'Trim Start', path: 'style.trimStart', prop: layer.style.trimStart },
    { label: 'Trim End', path: 'style.trimEnd', prop: layer.style.trimEnd },
  ];

  const getAllLayerKeyframes = (layer: VectorLayer) => {
    const list: { id: string; time: number; propPath: string; label: string; easing: EasingType }[] = [];
    const props = getLayerProperties(layer);
    props.forEach((p) => {
      if (p.prop.isKeyframed && p.prop.keyframes) {
        p.prop.keyframes.forEach((k) => {
          list.push({
            id: k.id || 'kf_' + k.time + '_' + p.path,
            time: k.time,
            propPath: p.path,
            label: p.label,
            easing: k.easing,
          });
        });
      }
    });
    return list;
  };

  interface SummaryKeyframeGroup {
    time: number;
    properties: {
      propPath: string;
      label: string;
      keyframeId: string;
      easing: EasingType;
    }[];
  }

  const getSummaryKeyframeGroups = (layer: VectorLayer): SummaryKeyframeGroup[] => {
    const allKf = getAllLayerKeyframes(layer);
    const groups: SummaryKeyframeGroup[] = [];

    allKf.forEach((kf) => {
      const existingGroup = groups.find((g) => Math.abs(g.time - kf.time) < 0.025);
      if (existingGroup) {
        existingGroup.properties.push({
          propPath: kf.propPath,
          label: kf.label,
          keyframeId: kf.id,
          easing: kf.easing,
        });
      } else {
        groups.push({
          time: kf.time,
          properties: [
            {
              propPath: kf.propPath,
              label: kf.label,
              keyframeId: kf.id,
              easing: kf.easing,
            },
          ],
        });
      }
    });

    return groups.sort((a, b) => a.time - b.time);
  };

  const currentFrame = Math.round(currentTime * composition.fps);

  return (
    <div
      style={{
        transform: `translateY(${dragOffsetY}px)`,
        transition: isDraggingY ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="h-72 bg-zinc-950 border-t border-zinc-800/90 flex flex-col select-none z-20 shrink-0 relative group/timeline"
    >
      {/* Top Edge Drag Tab / Handle Strip (Only this tab triggers hiding/dragging) */}
      {onDismiss && (
        <div
          onPointerDown={handleHandlePointerDownY}
          onPointerMove={handlePointerMoveY}
          onPointerUp={handlePointerUpY}
          onPointerCancel={handlePointerUpY}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.();
          }}
          title="Haz clic o arrastra desde esta pestaña hacia abajo para ocultar la línea de tiempo"
          className="absolute -top-3 left-1/2 -translate-x-1/2 h-4 px-6 z-30 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-zinc-800/90 bg-zinc-900 border border-zinc-700/80 rounded-t-md transition-all shadow-md group/tab"
        >
          <div className="w-10 h-1 rounded-full bg-zinc-500 group-hover/tab:bg-blue-400 group-hover/tab:h-1.5 transition-all shadow-sm" />
        </div>
      )}

      {/* MODULAR TRANSPORT TOOLBAR */}
      <TimelineToolbar
        currentTime={currentTime}
        duration={composition.duration}
        fps={composition.fps}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onSetTime={onSetTime}
        handleStepFrame={handleStepFrame}
        handleJumpKeyframe={handleJumpKeyframe}
        autoKeyframe={autoKeyframe}
        onToggleAutoKeyframe={onToggleAutoKeyframe}
        selectedKeyframesCount={selectedKeyframes.length}
        hasSelectedKeyframe={!!selectedKeyframe}
        applyBulkEasing={applyBulkEasing}
        alignSelectedKeyframesToPlayhead={alignSelectedKeyframesToPlayhead}
        reverseSelectedKeyframes={reverseSelectedKeyframes}
        deleteSelectedKeyframes={deleteSelectedKeyframes}
        isGraphEditor={isGraphEditor}
        setIsGraphEditor={setIsGraphEditor}
        handleFitToView={handleFitToView}
        timelineZoom={timelineZoom}
        setTimelineZoom={setTimelineZoom}
        onDismiss={onDismiss}
      />

      {/* Main Split Body: Left Layers Column | Right Tracks Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Layer Tree with Standard 28px Rows */}
        <div className="w-76 bg-zinc-950 border-r border-zinc-800/80 flex flex-col shrink-0 overflow-hidden select-none">
          <div className="h-7 bg-zinc-900/90 border-b border-zinc-800 px-2 flex items-center justify-between text-[10px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              <span>Capas</span>
              <span className="text-[9px] text-zinc-500 font-mono">({composition.layers.length})</span>
              {composition.layers.length > 0 && (
                <button
                  onClick={() => {
                    const anyExpanded = composition.layers.some((l) => l.expandedInTimeline);
                    composition.layers.forEach((l) => {
                      onUpdateLayer(l.id, { expandedInTimeline: !anyExpanded });
                    });
                  }}
                  title={
                    composition.layers.some((l) => l.expandedInTimeline)
                      ? 'Colapsar todas las capas'
                      : 'Expandir todas las capas'
                  }
                  className="p-0.5 text-zinc-500 hover:text-zinc-200 rounded hover:bg-zinc-800 transition-colors cursor-pointer ml-0.5"
                >
                  {composition.layers.some((l) => l.expandedInTimeline) ? (
                    <ChevronsDown className="w-3 h-3" />
                  ) : (
                    <ChevronsUp className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            {/* Layer Reorder Quick Actions */}
            {selectedLayerIds.length > 0 && onReorderLayerDirection && (
              <div className="flex items-center gap-0.5 bg-zinc-950/80 border border-zinc-800 rounded px-1 py-0.5">
                <button
                  onClick={() => onReorderLayerDirection(selectedLayerIds[0], 'forward')}
                  title="Subir Capa (Ctrl+] o Alt+↑)"
                  className="p-0.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onReorderLayerDirection(selectedLayerIds[0], 'backward')}
                  title="Bajar Capa (Ctrl+[ o Alt+↓)"
                  className="p-0.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500">
              <span>+◆</span>
              <span>Vis</span>
              <span>Bloq</span>
            </div>
          </div>

          {/* Layer List Scroll Container (Synchronized with tracksRef) */}
          <div
            ref={layersScrollRef}
            onScroll={handleLayersScroll}
            className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
          >
            {composition.layers.length === 0 ? (
              /* R-27 Empty State: No layers in timeline */
              <div className="p-4 text-center select-none">
                <p className="text-xs text-zinc-400 font-medium">Sin capas en la composición</p>
                <p className="text-[10px] text-zinc-500 mt-1">Dibuja una forma o pulsa Añadir Capa</p>
              </div>
            ) : (
              composition.layers.map((layer, index) => {
                const isSelected = selectedLayerIds.includes(layer.id);
                const properties = getLayerProperties(layer);
                const isDragOver = dragOverLayerIndex === index;
                const isBeingDragged = draggedLayerIndex === index;

                return (
                  <div
                    id={`layer_header_${layer.id}`}
                    key={layer.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(index));
                      setDraggedLayerIndex(index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverLayerIndex !== index) {
                        setDragOverLayerIndex(index);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverLayerIndex === index) {
                        setDragOverLayerIndex(null);
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedLayerIndex(null);
                      setDragOverLayerIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const srcIndex =
                        draggedLayerIndex !== null
                          ? draggedLayerIndex
                          : parseInt(e.dataTransfer.getData('text/plain'), 10);
                      if (!isNaN(srcIndex) && srcIndex !== index) {
                        onReorderLayers(srcIndex, index);
                      }
                      setDraggedLayerIndex(null);
                      setDragOverLayerIndex(null);
                    }}
                    className={`border-b border-zinc-900/80 transition-all ${
                      isBeingDragged ? 'opacity-40 bg-zinc-900' : ''
                    } ${
                      isDragOver ? 'ring-2 ring-blue-500 ring-inset bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Layer Header Row (Standard 28px Height: h-7) */}
                    <div
                      onClick={(e) => onSelectLayer(layer.id, e.shiftKey || e.metaKey || e.ctrlKey)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectLayer(layer.id, false);
                        setContextMenu({
                          x: Math.min(window.innerWidth - 250, Math.max(10, e.clientX)),
                          y: Math.min(window.innerHeight - 380, Math.max(10, e.clientY)),
                          time: currentTime,
                          layer,
                          propPath: 'all',
                        });
                      }}
                      className={`h-7 px-1.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-950/40 text-blue-200 border-l-2 border-blue-500'
                          : 'text-zinc-300 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-1 min-w-0 truncate">
                        {/* Drag Handle */}
                        <div
                          title="Arrastra para reordenar capa"
                          className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-200 p-0.5 shrink-0"
                        >
                          <GripVertical className="w-3 h-3" />
                        </div>

                        {/* Expand / Collapse Chevron */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateLayer(layer.id, {
                              expandedInTimeline: !layer.expandedInTimeline,
                            });
                          }}
                          className="p-0.5 text-zinc-400 hover:text-zinc-200 shrink-0 cursor-pointer"
                        >
                          {layer.expandedInTimeline ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>

                        {/* Color Tag Swatch */}
                        <div
                          style={{ backgroundColor: layer.colorTag }}
                          className="w-2 h-2 rounded-[2px] shrink-0"
                        />

                        {/* Layer Order Number */}
                        <span className="text-[9px] font-mono text-zinc-400 shrink-0 select-none">
                          #{index + 1}
                        </span>

                        {/* Layer Name */}
                        <span className="truncate font-medium text-[11px]">{layer.name}</span>
                      </div>

                      {/* Quick Layer Controls: +◆, Eye, Lock, Trash */}
                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Add Keyframe Button (+◆) */}
                        <button
                          onClick={() => insertKeyframeAtTime(layer, currentTime, 'all')}
                          title={`Insertar Keyframe a esta capa en ${currentTime.toFixed(2)}s`}
                          className="px-1 py-0.5 bg-amber-500/10 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded text-[9px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                        >
                          <span>+◆</span>
                        </button>

                        <button
                          onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
                          className={`p-0.5 rounded cursor-pointer ${
                            layer.visible ? 'text-zinc-300 hover:text-white' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title={layer.visible ? 'Ocultar Capa' : 'Mostrar Capa'}
                        >
                          {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked })}
                          className={`p-0.5 rounded cursor-pointer ${
                            layer.locked ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Bloquear Capa"
                        >
                          {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={() => onDeleteLayer(layer.id)}
                          className="p-0.5 text-zinc-500 hover:text-rose-400 rounded cursor-pointer transition-colors"
                          title="Eliminar Capa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Properties */}
                    {layer.expandedInTimeline && (
                      <div className="bg-zinc-950/80 border-t border-zinc-900/60 pb-1">
                        {properties.map((p) => {
                          const isKf = p.prop.isKeyframed;
                          const hasKfAtT =
                            isKf &&
                            p.prop.keyframes.some((k) => Math.abs(k.time - currentTime) < 0.04);

                          return (
                            <div
                              key={p.path}
                              className="h-5 px-6 flex items-center justify-between text-[10px] text-zinc-400 hover:bg-zinc-900/30"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <button
                                  onClick={() => toggleStopwatch(layer, p.path, p.prop.value)}
                                  title={isKf ? 'Desactivar animación' : 'Activar animación (Cronómetro)'}
                                  className={`p-0.5 rounded transition-colors cursor-pointer ${
                                    isKf
                                      ? 'text-blue-400 bg-blue-950/60'
                                      : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  <Timer className="w-2.5 h-2.5" />
                                </button>

                                {isKf && (
                                  <button
                                    onClick={() => toggleKeyframeAtPlayhead(layer, p.path)}
                                    title="Añadir/Quitar Keyframe en este punto"
                                    className={`p-0.5 rounded cursor-pointer ${
                                      hasKfAtT ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                  >
                                    ◆
                                  </button>
                                )}

                                <span className="truncate">{p.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div className="h-6 shrink-0 pointer-events-none" />
          </div>
        </div>

        {/* Right Tracks & Time Ruler Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950/60 select-none">
          {/* Top Time Ruler Header Bar (Synchronized X scroll with tracksRef) */}
          <div
            ref={rulerContainerRef}
            onScroll={handleRulerScroll}
            className="h-7 bg-zinc-900 border-b border-zinc-800 overflow-x-hidden overflow-y-hidden shrink-0 relative cursor-pointer select-none"
          >
            <div
              ref={rulerRef}
              onMouseDown={handleRulerMouseDown}
              style={{ width: `${totalTimelineWidth}px` }}
              className="h-full relative select-none"
            >
              {rulerTicks.map((tick) => (
                <div
                  key={tick.frame}
                  style={{ left: `${tick.x}px` }}
                  className="absolute top-0 bottom-0 pointer-events-none"
                >
                  <div
                    className={`w-[1px] ${
                      tick.isMajor ? 'h-3.5 bg-zinc-500' : 'h-2 bg-zinc-700'
                    }`}
                  />
                  {tick.isMajor && (
                    <span className="text-[9px] font-mono text-zinc-400 pl-1 -mt-1 block">
                      {tick.label}
                    </span>
                  )}
                </div>
              ))}

              {/* Scrubber Badge on Ruler */}
              <div
                style={{ left: `${timeToPixels(currentTime)}px` }}
                className="absolute top-0 bottom-0 pointer-events-none z-30"
              >
                <div className="w-2.5 h-3 bg-red-500 -ml-1 top-0 absolute rounded-b-xs shadow shadow-red-500/50" />
              </div>
            </div>
          </div>

          {/* Tracks Viewport (Synchronized Y scroll with layersScrollRef, X scroll with rulerContainerRef) */}
          <div
            ref={tracksRef}
            onScroll={handleTracksScroll}
            onMouseDown={(e) => {
              if (e.button === 0 && !e.altKey && !(e.target as HTMLElement).closest('.cursor-grab')) {
                const rect = tracksRef.current?.getBoundingClientRect();
                if (rect) {
                  const scrollLeft = tracksRef.current?.scrollLeft || 0;
                  const scrollTop = tracksRef.current?.scrollTop || 0;
                  const curX = e.clientX - rect.left + scrollLeft;
                  const curY = e.clientY - rect.top + scrollTop;
                  setIsBoxSelecting(true);
                  setBoxStart({ x: curX, y: curY });
                  setBoxCurrent({ x: curX, y: curY });
                  if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
                    setSelectedKeyframes([]);
                    setSelectedKeyframe(null);
                  }
                }
              }
            }}
            className="flex-1 overflow-auto relative custom-scrollbar"
          >
            <div style={{ width: `${totalTimelineWidth}px` }} className="relative min-h-full">
              {/* Box Marquee Visual Overlay */}
              {isBoxSelecting && boxStart && boxCurrent && (
                <div
                  style={{
                    left: `${Math.min(boxStart.x, boxCurrent.x)}px`,
                    top: `${Math.min(boxStart.y, boxCurrent.y)}px`,
                    width: `${Math.abs(boxCurrent.x - boxStart.x)}px`,
                    height: `${Math.abs(boxCurrent.y - boxStart.y)}px`,
                  }}
                  className="absolute bg-blue-500/20 border border-blue-400/80 rounded-xs pointer-events-none z-40 shadow-sm"
                />
              )}

              {/* Playhead Vertical Needle line spanning all tracks */}
              <div
                style={{ left: `${timeToPixels(currentTime)}px` }}
                className="absolute top-0 bottom-0 w-[1px] bg-red-500 pointer-events-none z-30 shadow-md shadow-red-500/50"
              />

              {/* Layer Tracks & Diamond Keyframes */}
              <div>
              {composition.layers.length === 0 ? (
                <div className="py-10 px-6 flex items-center justify-start text-zinc-400 text-xs font-mono select-none">
                  <span>Línea de tiempo vacía • Agrega una capa para comenzar a animar</span>
                </div>
              ) : (
                composition.layers.map((layer) => {
                const isSelected = selectedLayerIds.includes(layer.id);
                const properties = getLayerProperties(layer);
                const layerKeyframes = getAllLayerKeyframes(layer);
                const trackWidth = timeToPixels(composition.duration);

                const handleTrackClick = (e: React.MouseEvent) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = pixelsToTime(clickX);
                  onSetTime(newTime);
                  onSelectLayer(layer.id);
                };

                const handleTrackDoubleClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = pixelsToTime(clickX);
                  onSetTime(newTime);
                  onSelectLayer(layer.id);
                  insertKeyframeAtTime(layer, newTime, 'all');
                };

                const handleTrackContextMenu = (e: React.MouseEvent, propPath?: string) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = pixelsToTime(clickX);
                  onSetTime(newTime);
                  onSelectLayer(layer.id);
                  setContextMenu({
                    x: Math.min(window.innerWidth - 220, e.clientX),
                    y: Math.min(window.innerHeight - 280, e.clientY),
                    time: newTime,
                    layer,
                    propPath,
                  });
                };

                return (
                  <div id={`layer_track_${layer.id}`} key={layer.id} className="border-b border-zinc-900/80">
                    {/* Layer Main Bar Track (28px: h-7) */}
                    <div
                      onClick={handleTrackClick}
                      onDoubleClick={handleTrackDoubleClick}
                      onContextMenu={(e) => handleTrackContextMenu(e)}
                      title="Doble clic para insertar Keyframe | Clic derecho para opciones"
                      className={`h-7 relative flex items-center cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-950/20' : 'hover:bg-zinc-900/40'
                      }`}
                    >
                      {/* Layer Span Strip */}
                      <div
                        style={{
                          left: '0px',
                          width: `${trackWidth}px`,
                        }}
                        className="h-3 rounded-xs bg-zinc-800/80 border border-zinc-700/60 relative overflow-hidden flex items-center"
                      >
                        <div
                          style={{ backgroundColor: layer.colorTag }}
                          className="absolute inset-y-0 left-0 w-1 opacity-80"
                        />
                      </div>

                      {/* Summary Keyframe Diamonds (Grouped by time) */}
                      {getSummaryKeyframeGroups(layer).map((group, gIdx) => {
                        const kfX = timeToPixels(group.time);
                        const isKfInMulti = selectedKeyframes.some(
                          (sk) =>
                            sk.layerId === layer.id &&
                            group.properties.some((p) => p.keyframeId === sk.keyframeId)
                        );
                        const isKfSelected =
                          isKfInMulti ||
                          (selectedKeyframe &&
                            selectedKeyframe.layerId === layer.id &&
                            group.properties.some((p) => p.keyframeId === selectedKeyframe.keyframeId));

                        const propCount = group.properties.length;
                        const tooltip =
                          propCount === 1
                            ? `${group.properties[0].label} @ ${group.time.toFixed(2)}s (${group.properties[0].easing})\nArrastra para mover | Alt+Arrastra para estirar tiempo | Shift+Clic para multi-selección`
                            : `${propCount} propiedades (${group.properties.map((p) => p.label).join(', ')}) @ ${group.time.toFixed(2)}s\nArrastra para mover | Alt+Arrastra para estirar`;

                        const groupItems = group.properties.map((p) => ({
                          layerId: layer.id,
                          propPath: p.propPath,
                          keyframeId: p.keyframeId,
                          originalTime: group.time,
                        }));

                        return (
                          <div
                            key={`grp_${layer.id}_${group.time.toFixed(3)}_${gIdx}`}
                            style={{ left: `${kfX}px` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetTime(group.time);
                              if (e.shiftKey || e.metaKey || e.ctrlKey) {
                                setSelectedKeyframes((prev) => {
                                  const exists = prev.some(
                                    (k) =>
                                      k.layerId === layer.id &&
                                      group.properties.some((p) => p.keyframeId === k.keyframeId)
                                  );
                                  if (exists) {
                                    return prev.filter(
                                      (k) =>
                                        !(
                                          k.layerId === layer.id &&
                                          group.properties.some((p) => p.keyframeId === k.keyframeId)
                                        )
                                    );
                                  } else {
                                    return [...prev, ...groupItems];
                                  }
                                });
                              } else {
                                setSelectedKeyframes(groupItems);
                                if (group.properties[0]) {
                                  setSelectedKeyframe({
                                    layerId: layer.id,
                                    propPath: group.properties[0].propPath,
                                    keyframeId: group.properties[0].keyframeId,
                                  });
                                }
                              }
                            }}
                            onDoubleClick={(e) => e.stopPropagation()}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setContextMenu({
                                x: Math.min(window.innerWidth - 240, e.clientX),
                                y: Math.min(window.innerHeight - 360, e.clientY),
                                time: group.time,
                                layer,
                                propPath: propCount === 1 ? group.properties[0].propPath : 'all',
                                keyframeId: propCount === 1 ? group.properties[0].keyframeId : undefined,
                              });
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              if (e.button !== 0) return;
                              const isAlt = e.altKey;

                              let dragItems = selectedKeyframes;
                              const alreadySelected = selectedKeyframes.some(
                                (k) =>
                                  k.layerId === layer.id &&
                                  group.properties.some((p) => p.keyframeId === k.keyframeId)
                              );

                              if (!alreadySelected) {
                                dragItems = groupItems;
                                setSelectedKeyframes(groupItems);
                                if (group.properties[0]) {
                                  setSelectedKeyframe({
                                    layerId: layer.id,
                                    propPath: group.properties[0].propPath,
                                    keyframeId: group.properties[0].keyframeId,
                                  });
                                }
                              }

                              let anchorTime = 0;
                              if (isAlt && dragItems.length > 1) {
                                const minT = Math.min(...dragItems.map((k) => k.originalTime));
                                const maxT = Math.max(...dragItems.map((k) => k.originalTime));
                                anchorTime = Math.abs(group.time - minT) < Math.abs(group.time - maxT) ? maxT : minT;
                              }

                              setDraggedKeyframe({
                                layerId: layer.id,
                                startMouseX: e.clientX,
                                isAltStretch: isAlt,
                                anchorTime,
                                draggedOrigTime: group.time,
                                items: dragItems,
                              });
                            }}
                            title={tooltip}
                            className={`absolute -translate-x-1/2 w-3 h-3 rotate-45 cursor-grab active:cursor-grabbing z-10 transition-transform ${
                              isKfSelected
                                ? 'bg-amber-400 border-2 border-white scale-125 shadow-md shadow-amber-400/60 ring-2 ring-amber-400/50'
                                : propCount > 1
                                ? 'bg-amber-500 border border-zinc-950 hover:scale-125 hover:bg-amber-300'
                                : 'bg-blue-400 border border-zinc-950 hover:scale-125 hover:bg-blue-300'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Expanded Property Tracks */}
                    {layer.expandedInTimeline && (
                      <div className="border-t border-zinc-900/60 pb-1 bg-zinc-950/40">
                        {properties.map((p) => {
                          const isKf = p.prop.isKeyframed;

                          const handleSubTrackDoubleClick = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const newTime = pixelsToTime(clickX);
                            onSetTime(newTime);
                            toggleKeyframeAtPlayhead(layer, p.path, newTime);
                          };

                          return (
                            <div
                              key={p.path}
                              onClick={handleTrackClick}
                              onDoubleClick={handleSubTrackDoubleClick}
                              onContextMenu={(e) => handleTrackContextMenu(e, p.path)}
                              title={`Doble clic para insertar keyframe de ${p.label}`}
                              className="h-5 relative flex items-center hover:bg-zinc-900/30 cursor-pointer"
                            >
                              <div
                                style={{ width: `${trackWidth}px` }}
                                className="h-[1px] bg-zinc-800 absolute left-0"
                              />

                              {isKf &&
                                p.prop.keyframes &&
                                p.prop.keyframes.map((kf) => {
                                  const kfX = timeToPixels(kf.time);
                                  const isKfInMulti = selectedKeyframes.some(
                                    (sk) => sk.layerId === layer.id && sk.keyframeId === kf.id
                                  );
                                  const isKfSelected =
                                    isKfInMulti || selectedKeyframe?.keyframeId === kf.id;

                                  const singleItem = {
                                    layerId: layer.id,
                                    propPath: p.path,
                                    keyframeId: kf.id,
                                    originalTime: kf.time,
                                  };

                                  return (
                                    <div
                                      key={kf.id}
                                      style={{ left: `${kfX}px` }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSetTime(kf.time);
                                        if (e.shiftKey || e.metaKey || e.ctrlKey) {
                                          setSelectedKeyframes((prev) => {
                                            const exists = prev.some(
                                              (k) => k.layerId === layer.id && k.keyframeId === kf.id
                                            );
                                            if (exists) {
                                              return prev.filter(
                                                (k) => !(k.layerId === layer.id && k.keyframeId === kf.id)
                                              );
                                            } else {
                                              return [...prev, singleItem];
                                            }
                                          });
                                        } else {
                                          setSelectedKeyframes([singleItem]);
                                          setSelectedKeyframe({
                                            layerId: layer.id,
                                            propPath: p.path,
                                            keyframeId: kf.id,
                                          });
                                        }
                                      }}
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        if (e.button !== 0) return;
                                        const isAlt = e.altKey;

                                        let dragItems = selectedKeyframes;
                                        const alreadySelected = selectedKeyframes.some(
                                          (k) => k.layerId === layer.id && k.keyframeId === kf.id
                                        );

                                        if (!alreadySelected) {
                                          dragItems = [singleItem];
                                          setSelectedKeyframes([singleItem]);
                                          setSelectedKeyframe({
                                            layerId: layer.id,
                                            propPath: p.path,
                                            keyframeId: kf.id,
                                          });
                                        }

                                        let anchorTime = 0;
                                        if (isAlt && dragItems.length > 1) {
                                          const minT = Math.min(...dragItems.map((k) => k.originalTime));
                                          const maxT = Math.max(...dragItems.map((k) => k.originalTime));
                                          anchorTime = Math.abs(kf.time - minT) < Math.abs(kf.time - maxT) ? maxT : minT;
                                        }

                                        setDraggedKeyframe({
                                          layerId: layer.id,
                                          startMouseX: e.clientX,
                                          isAltStretch: isAlt,
                                          anchorTime,
                                          draggedOrigTime: kf.time,
                                          items: dragItems,
                                        });
                                      }}
                                      onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setContextMenu({
                                          x: Math.min(window.innerWidth - 220, e.clientX),
                                          y: Math.min(window.innerHeight - 280, e.clientY),
                                          time: kf.time,
                                          layer,
                                          propPath: p.path,
                                          keyframeId: kf.id,
                                        });
                                      }}
                                      title={`${p.label}: ${typeof kf.value === 'number' ? `${Math.round(kf.value * 10) / 10}` : typeof kf.value === 'object' && kf.value !== null && 'x' in kf.value ? `(${Math.round(kf.value.x)}, ${Math.round(kf.value.y)})` : kf.value} @ ${kf.time.toFixed(2)}s (${kf.easing})`}
                                      className={`absolute -translate-x-1/2 w-2.5 h-2.5 rotate-45 cursor-grab active:cursor-grabbing z-10 transition-transform ${
                                        isKfSelected
                                          ? 'bg-amber-400 border border-white scale-125 shadow-sm ring-1 ring-amber-300'
                                          : 'bg-blue-400 border border-zinc-950 hover:scale-125 hover:bg-blue-300'
                                      }`}
                                    />
                                  );
                                })}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
            {/* Bottom spacer matching layers list */}
            <div className="h-6 shrink-0 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>

      {/* MODULAR FLOATING CONTEXT MENU */}
      {contextMenu && (
        <TimelineContextMenu
          contextMenu={contextMenu}
          currentTime={currentTime}
          onClose={() => setContextMenu(null)}
          onSetTime={onSetTime}
          setKeyframeEasing={setKeyframeEasing}
          duplicateKeyframeToPlayhead={duplicateKeyframeToPlayhead}
          deleteKeyframe={deleteKeyframe}
          insertKeyframeAtTime={insertKeyframeAtTime}
        />
      )}
    </div>
  );
};
