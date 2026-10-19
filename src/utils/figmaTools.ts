import { Composition, VectorLayer, CustomGuide } from '../types';
import { evaluateLayer } from './animEngine';

export type FigmaAlignAction =
  | 'alignLeft'
  | 'alignCenterH'
  | 'alignRight'
  | 'alignTop'
  | 'alignCenterV'
  | 'alignBottom'
  | 'distributeH'
  | 'distributeV'
  | 'distributeSpacingH'
  | 'distributeSpacingV';

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  halfW: number;
  halfH: number;
}

export interface SnapGuideLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'center-x' | 'center-y' | 'edge-x' | 'edge-y' | 'gap-x' | 'gap-y';
  label?: string;
}

export interface GuideSnapResult {
  snappedPosition: number;
  isSnapped: boolean;
  targetType: 'layer-edge' | 'layer-center' | 'canvas-edge' | 'canvas-center';
  label: string;
  layerId?: string;
  layerName?: string;
  boundingBox?: BoundingBox;
}

/**
 * Searches layer boundaries and canvas points to snap a guide line while dragging from rulers
 */
export function findGuideSnapPoint(
  axis: 'horizontal' | 'vertical',
  proposedCoord: number,
  layers: VectorLayer[],
  compWidth: number,
  compHeight: number,
  time: number = 0,
  threshold: number = 8
): GuideSnapResult {
  let closestDist = threshold + 1;
  let bestResult: GuideSnapResult = {
    snappedPosition: Math.round(proposedCoord),
    isSnapped: false,
    targetType: 'canvas-edge',
    label: `${axis === 'horizontal' ? 'Y' : 'X'}: ${Math.round(proposedCoord)}px`,
  };

  const checkCandidate = (
    pos: number,
    targetType: GuideSnapResult['targetType'],
    label: string,
    layerId?: string,
    layerName?: string,
    boundingBox?: BoundingBox
  ) => {
    const dist = Math.abs(proposedCoord - pos);
    if (dist <= threshold && dist < closestDist) {
      closestDist = dist;
      bestResult = {
        snappedPosition: Math.round(pos),
        isSnapped: true,
        targetType,
        label,
        layerId,
        layerName,
        boundingBox,
      };
    }
  };

  if (axis === 'horizontal') {
    // Canvas targets
    checkCandidate(0, 'canvas-edge', 'Lienzo: Borde superior (0px)');
    checkCandidate(Math.round(compHeight / 2), 'canvas-center', `Lienzo: Centro (${Math.round(compHeight / 2)}px)`);
    checkCandidate(compHeight, 'canvas-edge', `Lienzo: Borde inferior (${compHeight}px)`);

    // Layer boundary targets (evaluated at current time)
    for (const layer of layers) {
      if (!layer.visible) continue;
      const box = getLayerBoundingBox(layer, time, layers);
      checkCandidate(box.minY, 'layer-edge', `${layer.name}: Borde superior (${Math.round(box.minY)}px)`, layer.id, layer.name, box);
      checkCandidate(box.centerY, 'layer-center', `${layer.name}: Centro Y (${Math.round(box.centerY)}px)`, layer.id, layer.name, box);
      checkCandidate(box.maxY, 'layer-edge', `${layer.name}: Borde inferior (${Math.round(box.maxY)}px)`, layer.id, layer.name, box);
    }
  } else {
    // Vertical axis: check X coordinates
    checkCandidate(0, 'canvas-edge', 'Lienzo: Borde izquierdo (0px)');
    checkCandidate(Math.round(compWidth / 2), 'canvas-center', `Lienzo: Centro (${Math.round(compWidth / 2)}px)`);
    checkCandidate(compWidth, 'canvas-edge', `Lienzo: Borde derecho (${compWidth}px)`);

    // Layer boundary targets
    for (const layer of layers) {
      if (!layer.visible) continue;
      const box = getLayerBoundingBox(layer, time, layers);
      checkCandidate(box.minX, 'layer-edge', `${layer.name}: Borde izquierdo (${Math.round(box.minX)}px)`, layer.id, layer.name, box);
      checkCandidate(box.centerX, 'layer-center', `${layer.name}: Centro X (${Math.round(box.centerX)}px)`, layer.id, layer.name, box);
      checkCandidate(box.maxX, 'layer-edge', `${layer.name}: Borde derecho (${Math.round(box.maxX)}px)`, layer.id, layer.name, box);
    }
  }

  return bestResult;
}

/**
 * Calculates accurate bounding box for any VectorLayer at given time
 */
export function getLayerBoundingBox(
  layer: VectorLayer,
  time: number = 0,
  allLayers?: VectorLayer[]
): BoundingBox {
  const props = evaluateLayer(layer, time, allLayers);
  const { position, scale } = props;
  const scX = Math.abs((scale?.x ?? 100) / 100);
  const scY = Math.abs((scale?.y ?? 100) / 100);

  let halfW = 40 * scX;
  let halfH = 40 * scY;
  let offsetX = 0;
  let offsetY = 0;

  if (layer.type === 'rect' && props.rect) {
    halfW = (props.rect.width / 2) * scX;
    halfH = (props.rect.height / 2) * scY;
  } else if (layer.type === 'circle' && props.circle) {
    halfW = props.circle.radiusX * scX;
    halfH = props.circle.radiusY * scY;
  } else if (layer.type === 'star' && props.star) {
    halfW = props.star.outerRadius * scX;
    halfH = props.star.outerRadius * scY;
  } else if (layer.type === 'polygon' && props.polygon) {
    halfW = props.polygon.radius * scX;
    halfH = props.polygon.radius * scY;
  } else if (layer.type === 'text' && props.text && layer.text) {
    const rawLines = (layer.text.text || '').split('\n');
    const maxChars = Math.max(1, ...rawLines.map((l) => l.length));
    const lineCount = Math.max(1, rawLines.length);
    const fs = props.text.fontSize;
    const letterSpacing = props.text.letterSpacing || 0;
    // Average character width ratio for sans-serif is ~0.55-0.6 of font size
    const estW = (maxChars * fs * 0.58 + maxChars * letterSpacing) * scX;
    const estH = (lineCount * fs * 1.25) * scY;
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
    halfW = (props.image.width / 2) * scX;
    halfH = (props.image.height / 2) * scY;
  } else if (layer.type === 'path') {
    halfW = 50 * scX;
    halfH = 50 * scY;
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

/**
 * Applies exact alignment and proportional distribution to selected layers
 */
export function applyFigmaAlignment(
  composition: Composition,
  selectedLayerIds: string[],
  action: FigmaAlignAction,
  currentTime: number = 0,
  forceAlignToCanvas: boolean = false
): Composition {
  if (selectedLayerIds.length === 0) return composition;

  const layersToAlign = composition.layers.filter((l) =>
    selectedLayerIds.includes(l.id) && l.visible && !l.locked
  );
  if (layersToAlign.length === 0) return composition;

  const copy: Composition = JSON.parse(JSON.stringify(composition));
  const alignToCanvas = forceAlignToCanvas || layersToAlign.length === 1;

  // Compute boxes for all affected layers
  const layerBoxes = layersToAlign.map((l) => ({
    layer: l,
    box: getLayerBoundingBox(l, currentTime, composition.layers),
  }));

  if (alignToCanvas) {
    // Align each layer relative to canvas bounds [0, 0, width, height]
    layerBoxes.forEach(({ layer, box }) => {
      const target = copy.layers.find((cl) => cl.id === layer.id);
      if (!target) return;

      let newX = target.transform.position.value.x;
      let newY = target.transform.position.value.y;

      switch (action) {
        case 'alignLeft':
          newX = Math.round(box.halfW);
          break;
        case 'alignCenterH':
          newX = Math.round(composition.width / 2);
          break;
        case 'alignRight':
          newX = Math.round(composition.width - box.halfW);
          break;
        case 'alignTop':
          newY = Math.round(box.halfH);
          break;
        case 'alignCenterV':
          newY = Math.round(composition.height / 2);
          break;
        case 'alignBottom':
          newY = Math.round(composition.height - box.halfH);
          break;
        default:
          break;
      }

      const deltaX = newX - target.transform.position.value.x;
      const deltaY = newY - target.transform.position.value.y;

      target.transform.position.value = { x: newX, y: newY };
      if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
        target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
          ...kf,
          value: {
            x: Math.round((kf.value?.x ?? 0) + deltaX),
            y: Math.round((kf.value?.y ?? 0) + deltaY),
          },
        }));
      }
    });

    return copy;
  }

  // Multi-layer selection aligned relative to Collective Selection Bounding Box
  const groupMinX = Math.min(...layerBoxes.map((b) => b.box.minX));
  const groupMaxX = Math.max(...layerBoxes.map((b) => b.box.maxX));
  const groupCenterX = Math.round((groupMinX + groupMaxX) / 2);

  const groupMinY = Math.min(...layerBoxes.map((b) => b.box.minY));
  const groupMaxY = Math.max(...layerBoxes.map((b) => b.box.maxY));
  const groupCenterY = Math.round((groupMinY + groupMaxY) / 2);

  switch (action) {
    case 'alignLeft':
      layerBoxes.forEach(({ layer, box }) => {
        const target = copy.layers.find((cl) => cl.id === layer.id);
        if (target) {
          const newX = Math.round(groupMinX + box.halfW);
          const deltaX = newX - target.transform.position.value.x;
          target.transform.position.value.x = newX;
          if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
            target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
              ...kf,
              value: { ...kf.value, x: Math.round((kf.value?.x ?? 0) + deltaX) },
            }));
          }
        }
      });
      break;

    case 'alignCenterH':
      layerBoxes.forEach(({ layer }) => {
        const target = copy.layers.find((cl) => cl.id === layer.id);
        if (target) {
          const deltaX = groupCenterX - target.transform.position.value.x;
          target.transform.position.value.x = groupCenterX;
          if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
            target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
              ...kf,
              value: { ...kf.value, x: Math.round((kf.value?.x ?? 0) + deltaX) },
            }));
          }
        }
      });
      break;

    case 'alignRight':
      layerBoxes.forEach(({ layer, box }) => {
        const target = copy.layers.find((cl) => cl.id === layer.id);
        if (target) {
          const newX = Math.round(groupMaxX - box.halfW);
          const deltaX = newX - target.transform.position.value.x;
          target.transform.position.value.x = newX;
          if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
            target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
              ...kf,
              value: { ...kf.value, x: Math.round((kf.value?.x ?? 0) + deltaX) },
            }));
          }
        }
      });
      break;

    case 'alignTop':
      layerBoxes.forEach(({ layer, box }) => {
        const target = copy.layers.find((cl) => cl.id === layer.id);
        if (target) {
          const newY = Math.round(groupMinY + box.halfH);
          const deltaY = newY - target.transform.position.value.y;
          target.transform.position.value.y = newY;
          if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
            target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
              ...kf,
              value: { ...kf.value, y: Math.round((kf.value?.y ?? 0) + deltaY) },
            }));
          }
        }
      });
      break;

    case 'alignCenterV':
      layerBoxes.forEach(({ layer }) => {
        const target = copy.layers.find((cl) => cl.id === layer.id);
        if (target) {
          const deltaY = groupCenterY - target.transform.position.value.y;
          target.transform.position.value.y = groupCenterY;
          if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
            target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
              ...kf,
              value: { ...kf.value, y: Math.round((kf.value?.y ?? 0) + deltaY) },
            }));
          }
        }
      });
      break;

    case 'alignBottom':
      layerBoxes.forEach(({ layer, box }) => {
        const target = copy.layers.find((cl) => cl.id === layer.id);
        if (target) {
          const newY = Math.round(groupMaxY - box.halfH);
          const deltaY = newY - target.transform.position.value.y;
          target.transform.position.value.y = newY;
          if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
            target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
              ...kf,
              value: { ...kf.value, y: Math.round((kf.value?.y ?? 0) + deltaY) },
            }));
          }
        }
      });
      break;

    case 'distributeH':
    case 'distributeSpacingH': {
      if (layerBoxes.length < 3) return composition;
      // Sort left to right
      const sorted = [...layerBoxes].sort((a, b) => a.box.centerX - b.box.centerX);

      if (action === 'distributeSpacingH') {
        // Proportional distribution: Equal gaps between objects
        const totalObjectsW = sorted.reduce((sum, item) => sum + item.box.width, 0);
        const totalSpan = sorted[sorted.length - 1].box.maxX - sorted[0].box.minX;
        const availableGap = Math.max(0, totalSpan - totalObjectsW);
        const gap = availableGap / (sorted.length - 1);

        let currentCursor = sorted[0].box.minX;
        sorted.forEach((item) => {
          const target = copy.layers.find((cl) => cl.id === item.layer.id);
          if (target) {
            const newX = Math.round(currentCursor + item.box.halfW);
            const deltaX = newX - target.transform.position.value.x;
            target.transform.position.value.x = newX;
            if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
              target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
                ...kf,
                value: { ...kf.value, x: Math.round((kf.value?.x ?? 0) + deltaX) },
              }));
            }
          }
          currentCursor += item.box.width + gap;
        });
      } else {
        // Center-to-center equal step distribution
        const firstX = sorted[0].box.centerX;
        const lastX = sorted[sorted.length - 1].box.centerX;
        const step = (lastX - firstX) / (sorted.length - 1);

        sorted.forEach((item, i) => {
          const target = copy.layers.find((cl) => cl.id === item.layer.id);
          if (target) {
            const newX = Math.round(firstX + step * i);
            const deltaX = newX - target.transform.position.value.x;
            target.transform.position.value.x = newX;
            if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
              target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
                ...kf,
                value: { ...kf.value, x: Math.round((kf.value?.x ?? 0) + deltaX) },
              }));
            }
          }
        });
      }
      break;
    }

    case 'distributeV':
    case 'distributeSpacingV': {
      if (layerBoxes.length < 3) return composition;
      // Sort top to bottom
      const sorted = [...layerBoxes].sort((a, b) => a.box.centerY - b.box.centerY);

      if (action === 'distributeSpacingV') {
        // Equal vertical gap distribution
        const totalObjectsH = sorted.reduce((sum, item) => sum + item.box.height, 0);
        const totalSpan = sorted[sorted.length - 1].box.maxY - sorted[0].box.minY;
        const availableGap = Math.max(0, totalSpan - totalObjectsH);
        const gap = availableGap / (sorted.length - 1);

        let currentCursor = sorted[0].box.minY;
        sorted.forEach((item) => {
          const target = copy.layers.find((cl) => cl.id === item.layer.id);
          if (target) {
            const newY = Math.round(currentCursor + item.box.halfH);
            const deltaY = newY - target.transform.position.value.y;
            target.transform.position.value.y = newY;
            if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
              target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
                ...kf,
                value: { ...kf.value, y: Math.round((kf.value?.y ?? 0) + deltaY) },
              }));
            }
          }
          currentCursor += item.box.height + gap;
        });
      } else {
        const firstY = sorted[0].box.centerY;
        const lastY = sorted[sorted.length - 1].box.centerY;
        const step = (lastY - firstY) / (sorted.length - 1);

        sorted.forEach((item, i) => {
          const target = copy.layers.find((cl) => cl.id === item.layer.id);
          if (target) {
            const newY = Math.round(firstY + step * i);
            const deltaY = newY - target.transform.position.value.y;
            target.transform.position.value.y = newY;
            if (target.transform.position.isKeyframed && target.transform.position.keyframes) {
              target.transform.position.keyframes = target.transform.position.keyframes.map((kf: any) => ({
                ...kf,
                value: { ...kf.value, y: Math.round((kf.value?.y ?? 0) + deltaY) },
              }));
            }
          }
        });
      }
      break;
    }
  }

  return copy;
}

/**
 * Computes Smart Snapping Guides and snapped coordinates when dragging a layer on canvas
 */
export function computeSnapGuidelines(
  activeLayer: VectorLayer,
  proposedPos: { x: number; y: number },
  otherLayers: VectorLayer[],
  compWidth: number,
  compHeight: number,
  time: number = 0,
  threshold: number = 10,
  customGuides?: CustomGuide[]
): {
  snappedPos: { x: number; y: number };
  guides: SnapGuideLine[];
} {
  const currentBox = getLayerBoundingBox(activeLayer, time, otherLayers);
  const halfW = currentBox.halfW;
  const halfH = currentBox.halfH;

  let snappedX = proposedPos.x;
  let snappedY = proposedPos.y;
  const guides: SnapGuideLine[] = [];

  // 0. User Custom Guides Snapping (from horizontal / vertical rulers)
  if (customGuides && customGuides.length > 0) {
    for (const cg of customGuides) {
      if (cg.axis === 'vertical') {
        const guideX = cg.position;
        // Snap left edge
        if (Math.abs((snappedX - halfW) - guideX) <= threshold) {
          snappedX = guideX + halfW;
          guides.push({
            id: `custom_guide_${cg.id}_left`,
            x1: guideX,
            y1: 0,
            x2: guideX,
            y2: compHeight,
            type: 'edge-x',
            label: `Guía (${guideX}px)`,
          });
        }
        // Snap center X
        else if (Math.abs(snappedX - guideX) <= threshold) {
          snappedX = guideX;
          guides.push({
            id: `custom_guide_${cg.id}_center`,
            x1: guideX,
            y1: 0,
            x2: guideX,
            y2: compHeight,
            type: 'center-x',
            label: `Centro en Guía (${guideX}px)`,
          });
        }
        // Snap right edge
        else if (Math.abs((snappedX + halfW) - guideX) <= threshold) {
          snappedX = guideX - halfW;
          guides.push({
            id: `custom_guide_${cg.id}_right`,
            x1: guideX,
            y1: 0,
            x2: guideX,
            y2: compHeight,
            type: 'edge-x',
            label: `Guía (${guideX}px)`,
          });
        }
      } else if (cg.axis === 'horizontal') {
        const guideY = cg.position;
        // Snap top edge
        if (Math.abs((snappedY - halfH) - guideY) <= threshold) {
          snappedY = guideY + halfH;
          guides.push({
            id: `custom_guide_${cg.id}_top`,
            x1: 0,
            y1: guideY,
            x2: compWidth,
            y2: guideY,
            type: 'edge-y',
            label: `Guía (${guideY}px)`,
          });
        }
        // Snap center Y
        else if (Math.abs(snappedY - guideY) <= threshold) {
          snappedY = guideY;
          guides.push({
            id: `custom_guide_${cg.id}_center`,
            x1: 0,
            y1: guideY,
            x2: compWidth,
            y2: guideY,
            type: 'center-y',
            label: `Centro en Guía (${guideY}px)`,
          });
        }
        // Snap bottom edge
        else if (Math.abs((snappedY + halfH) - guideY) <= threshold) {
          snappedY = guideY - halfH;
          guides.push({
            id: `custom_guide_${cg.id}_bottom`,
            x1: 0,
            y1: guideY,
            x2: compWidth,
            y2: guideY,
            type: 'edge-y',
            label: `Guía (${guideY}px)`,
          });
        }
      }
    }
  }

  // 1. Canvas Center Snapping (10px proximity)
  const canvasCenterX = Math.round(compWidth / 2);
  const canvasCenterY = Math.round(compHeight / 2);

  if (Math.abs(snappedX - canvasCenterX) <= threshold) {
    snappedX = canvasCenterX;
    guides.push({
      id: 'canvas_center_x',
      x1: canvasCenterX,
      y1: 0,
      x2: canvasCenterX,
      y2: compHeight,
      type: 'center-x',
      label: `Centro X (${canvasCenterX}px)`,
    });
  }

  if (Math.abs(snappedY - canvasCenterY) <= threshold) {
    snappedY = canvasCenterY;
    guides.push({
      id: 'canvas_center_y',
      x1: 0,
      y1: canvasCenterY,
      x2: compWidth,
      y2: canvasCenterY,
      type: 'center-y',
      label: `Centro Y (${canvasCenterY}px)`,
    });
  }

  // 2. Canvas Margins / Edges & Corners Snapping (0 = border, 16/24 = safe margins)
  const marginsX = [
    { pos: 0, label: 'Borde Izquierdo (0px)' },
    { pos: 16, label: 'Margen Seguro (16px)' },
    { pos: compWidth - 16, label: 'Margen Seguro' },
    { pos: compWidth, label: `Borde Derecho (${compWidth}px)` },
  ];

  for (const m of marginsX) {
    // Left edge of object snaps to margin
    if (Math.abs((snappedX - halfW) - m.pos) <= threshold) {
      snappedX = m.pos + halfW;
      guides.push({
        id: `canvas_margin_x_l_${m.pos}`,
        x1: m.pos,
        y1: 0,
        x2: m.pos,
        y2: compHeight,
        type: 'edge-x',
        label: m.label,
      });
      break;
    }
    // Right edge of object snaps to margin
    if (Math.abs((snappedX + halfW) - m.pos) <= threshold) {
      snappedX = m.pos - halfW;
      guides.push({
        id: `canvas_margin_x_r_${m.pos}`,
        x1: m.pos,
        y1: 0,
        x2: m.pos,
        y2: compHeight,
        type: 'edge-x',
        label: m.label,
      });
      break;
    }
  }

  const marginsY = [
    { pos: 0, label: 'Borde Superior (0px)' },
    { pos: 16, label: 'Margen Seguro (16px)' },
    { pos: compHeight - 16, label: 'Margen Seguro' },
    { pos: compHeight, label: `Borde Inferior (${compHeight}px)` },
  ];

  for (const m of marginsY) {
    // Top edge of object snaps to margin
    if (Math.abs((snappedY - halfH) - m.pos) <= threshold) {
      snappedY = m.pos + halfH;
      guides.push({
        id: `canvas_margin_y_t_${m.pos}`,
        x1: 0,
        y1: m.pos,
        x2: compWidth,
        y2: m.pos,
        type: 'edge-y',
        label: m.label,
      });
      break;
    }
    // Bottom edge of object snaps to margin
    if (Math.abs((snappedY + halfH) - m.pos) <= threshold) {
      snappedY = m.pos - halfH;
      guides.push({
        id: `canvas_margin_y_b_${m.pos}`,
        x1: 0,
        y1: m.pos,
        x2: compWidth,
        y2: m.pos,
        type: 'edge-y',
        label: m.label,
      });
      break;
    }
  }

  // 3. Object-to-Object Snapping (Alignment with other layers within 10px proximity)
  for (const other of otherLayers) {
    if (other.id === activeLayer.id || !other.visible || other.locked) continue;
    const obox = getLayerBoundingBox(other, time, otherLayers);

    // Center alignment X
    if (Math.abs(snappedX - obox.centerX) <= threshold) {
      snappedX = obox.centerX;
      guides.push({
        id: `layer_center_x_${other.id}`,
        x1: obox.centerX,
        y1: Math.min(snappedY - halfH, obox.minY) - 30,
        x2: obox.centerX,
        y2: Math.max(snappedY + halfH, obox.maxY) + 30,
        type: 'center-x',
        label: `Centro con ${other.name}`,
      });
    }

    // Left-to-Left alignment
    if (Math.abs((snappedX - halfW) - obox.minX) <= threshold) {
      snappedX = obox.minX + halfW;
      guides.push({
        id: `layer_left_left_${other.id}`,
        x1: obox.minX,
        y1: Math.min(snappedY - halfH, obox.minY) - 30,
        x2: obox.minX,
        y2: Math.max(snappedY + halfH, obox.maxY) + 30,
        type: 'edge-x',
        label: `Borde Izq con ${other.name}`,
      });
    }

    // Right-to-Right alignment
    if (Math.abs((snappedX + halfW) - obox.maxX) <= threshold) {
      snappedX = obox.maxX - halfW;
      guides.push({
        id: `layer_right_right_${other.id}`,
        x1: obox.maxX,
        y1: Math.min(snappedY - halfH, obox.minY) - 30,
        x2: obox.maxX,
        y2: Math.max(snappedY + halfH, obox.maxY) + 30,
        type: 'edge-x',
        label: `Borde Der con ${other.name}`,
      });
    }

    // Left-to-Right abutting (placing directly next to other layer)
    if (Math.abs((snappedX - halfW) - obox.maxX) <= threshold) {
      snappedX = obox.maxX + halfW;
      guides.push({
        id: `layer_abut_right_${other.id}`,
        x1: obox.maxX,
        y1: Math.min(snappedY - halfH, obox.minY) - 20,
        x2: obox.maxX,
        y2: Math.max(snappedY + halfH, obox.maxY) + 20,
        type: 'edge-x',
        label: `Junto a ${other.name}`,
      });
    }

    // Right-to-Left abutting
    if (Math.abs((snappedX + halfW) - obox.minX) <= threshold) {
      snappedX = obox.minX - halfW;
      guides.push({
        id: `layer_abut_left_${other.id}`,
        x1: obox.minX,
        y1: Math.min(snappedY - halfH, obox.minY) - 20,
        x2: obox.minX,
        y2: Math.max(snappedY + halfH, obox.maxY) + 20,
        type: 'edge-x',
        label: `Junto a ${other.name}`,
      });
    }

    // Center alignment Y
    if (Math.abs(snappedY - obox.centerY) <= threshold) {
      snappedY = obox.centerY;
      guides.push({
        id: `layer_center_y_${other.id}`,
        x1: Math.min(snappedX - halfW, obox.minX) - 30,
        y1: obox.centerY,
        x2: Math.max(snappedX + halfW, obox.maxX) + 30,
        y2: obox.centerY,
        type: 'center-y',
        label: `Centro Y con ${other.name}`,
      });
    }

    // Top-to-Top alignment
    if (Math.abs((snappedY - halfH) - obox.minY) <= threshold) {
      snappedY = obox.minY + halfH;
      guides.push({
        id: `layer_top_top_${other.id}`,
        x1: Math.min(snappedX - halfW, obox.minX) - 30,
        y1: obox.minY,
        x2: Math.max(snappedX + halfW, obox.maxX) + 30,
        y2: obox.minY,
        type: 'edge-y',
        label: `Borde Sup con ${other.name}`,
      });
    }

    // Bottom-to-Bottom alignment
    if (Math.abs((snappedY + halfH) - obox.maxY) <= threshold) {
      snappedY = obox.maxY - halfH;
      guides.push({
        id: `layer_bottom_bottom_${other.id}`,
        x1: Math.min(snappedX - halfW, obox.minX) - 30,
        y1: obox.maxY,
        x2: Math.max(snappedX + halfW, obox.maxX) + 30,
        y2: obox.maxY,
        type: 'edge-y',
        label: `Borde Inf con ${other.name}`,
      });
    }

    // Top-to-Bottom abutting (stacked below)
    if (Math.abs((snappedY - halfH) - obox.maxY) <= threshold) {
      snappedY = obox.maxY + halfH;
      guides.push({
        id: `layer_abut_bottom_${other.id}`,
        x1: Math.min(snappedX - halfW, obox.minX) - 20,
        y1: obox.maxY,
        x2: Math.max(snappedX + halfW, obox.maxX) + 20,
        y2: obox.maxY,
        type: 'edge-y',
        label: `Bajo ${other.name}`,
      });
    }

    // Bottom-to-Top abutting (stacked above)
    if (Math.abs((snappedY + halfH) - obox.minY) <= threshold) {
      snappedY = obox.minY - halfH;
      guides.push({
        id: `layer_abut_top_${other.id}`,
        x1: Math.min(snappedX - halfW, obox.minX) - 20,
        y1: obox.minY,
        x2: Math.max(snappedX + halfW, obox.maxX) + 20,
        y2: obox.minY,
        type: 'edge-y',
        label: `Sobre ${other.name}`,
      });
    }
  }

  return {
    snappedPos: { x: Math.round(snappedX), y: Math.round(snappedY) },
    guides: guides.slice(0, 6), // allow up to 6 guides for compound corner / multi-layer snapping
  };
}
