import { readPsd, initializeCanvas } from 'ag-psd';
import { Composition, VectorLayer, LayerStyle } from '../types';
import { createBlankLayer } from '../data/presets';

export interface PsdParsedLayerInfo {
  id: string;
  name: string;
  type: 'image' | 'text' | 'group';
  width: number;
  height: number;
  left: number;
  top: number;
  opacity: number;
  visible: boolean;
  blendMode: string;
  thumbnailUrl?: string;
  textContent?: string;
}

export interface PsdImportResult {
  fileName: string;
  width: number;
  height: number;
  layers: VectorLayer[];
  layerInfos: PsdParsedLayerInfo[];
  previewUrl?: string;
}

// Convert PSD RGBA color to hex string
function rgbaToHex(color?: { r?: number; g?: number; b?: number; a?: number }): string {
  if (!color) return '#ffffff';
  const r = Math.round(color.r || 0).toString(16).padStart(2, '0');
  const g = Math.round(color.g || 0).toString(16).padStart(2, '0');
  const b = Math.round(color.b || 0).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

// Map Photoshop blend modes to CSS / SVG blend modes
function mapPsdBlendMode(mode?: string): LayerStyle['blendMode'] {
  switch (mode) {
    case 'multiply':
      return 'multiply';
    case 'screen':
      return 'screen';
    case 'overlay':
      return 'overlay';
    case 'darken':
      return 'darken';
    case 'lighten':
      return 'lighten';
    case 'color dodge':
    case 'color-dodge':
      return 'color-dodge';
    default:
      return 'normal';
  }
}

/**
 * Parses a Photoshop .PSD or .PSB file in the browser and converts its layers
 * into Vector Animation layers with positions, dimensions, opacity, and text/bitmap content.
 */
export async function parsePsdFile(file: File): Promise<PsdImportResult> {
  const arrayBuffer = await file.arrayBuffer();

  // Read PSD with full canvas rendering
  const psd = readPsd(arrayBuffer, {
    skipThumbnail: false,
    useImageData: false,
  });

  const docWidth = psd.width || 800;
  const docHeight = psd.height || 600;

  // Flattened preview thumbnail of the whole PSD if available
  let previewUrl: string | undefined;
  if (psd.canvas) {
    try {
      previewUrl = (psd.canvas as HTMLCanvasElement).toDataURL('image/jpeg', 0.85);
    } catch {
      // ignore
    }
  }

  const rawLayers: any[] = [];

  // Recursive extraction of all layers (flattening group hierarchy while preserving order)
  function extractLayers(items: any[], parentFolder?: string) {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        // Folder / Group
        extractLayers(item.children, item.name || parentFolder);
      } else {
        // Individual Layer
        rawLayers.push({
          ...item,
          folder: parentFolder,
        });
      }
    }
  }

  if (psd.children && psd.children.length > 0) {
    extractLayers(psd.children);
  }

  // In Photoshop, the PSD layer record stream lists layers from bottom to top.
  // We reverse rawLayers so that the TOP-MOST layer in Photoshop becomes index 0 (Top layer in VectorMotion Studio),
  // and the bottom-most layer (background) becomes the last index.
  const orderedLayers = rawLayers.slice().reverse();

  const vectorLayers: VectorLayer[] = [];
  const layerInfos: PsdParsedLayerInfo[] = [];

  const colorPalette = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185', '#34d399', '#fbbf24'];

  for (let i = 0; i < orderedLayers.length; i++) {
    const pLayer = orderedLayers[i];
    const layerName = pLayer.name || `Layer ${i + 1}`;
    const isHidden = pLayer.hidden === true;
    const opacity = typeof pLayer.opacity === 'number' ? Math.round(pLayer.opacity * 100) : 100;
    const blendMode = mapPsdBlendMode(pLayer.blendMode);

    // Calculate dimensions and coordinates
    const left = pLayer.left ?? 0;
    const top = pLayer.top ?? 0;
    const right = pLayer.right ?? left;
    const bottom = pLayer.bottom ?? top;
    const width = Math.max(1, pLayer.width || right - left || 100);
    const height = Math.max(1, pLayer.height || bottom - top || 100);

    // Center point in document space
    const posX = left + width / 2;
    const posY = top + height / 2;

    const colorTag = colorPalette[i % colorPalette.length];

    // Case 1: Photoshop Text Layer
    if (pLayer.text && pLayer.text.text) {
      const textContent = pLayer.text.text.trim();
      const fontSize = Math.round(pLayer.text.style?.fontSize || 28);
      const fontColor = rgbaToHex(pLayer.text.style?.fillColor);
      const fontFamily = pLayer.text.style?.font?.name || 'Inter, sans-serif';

      const layer = createBlankLayer('text', layerName, posX, posY);
      layer.visible = !isHidden;
      layer.expandedInTimeline = false;
      layer.colorTag = colorTag;
      layer.transform.opacity.value = opacity;
      layer.style.blendMode = blendMode;
      layer.style.fill.value = fontColor;
      layer.text = {
        text: textContent,
        fontSize: { value: fontSize, isKeyframed: false, keyframes: [] },
        fontFamily: fontFamily.includes('Arial') ? 'Arial, sans-serif' : 'Inter, sans-serif',
        fontWeight: '700',
        letterSpacing: { value: 0, isKeyframed: false, keyframes: [] },
        textAlign: 'center',
      };

      vectorLayers.push(layer);
      layerInfos.push({
        id: layer.id,
        name: layerName,
        type: 'text',
        width,
        height,
        left,
        top,
        opacity,
        visible: !isHidden,
        blendMode,
        textContent,
      });
      continue;
    }

    // Case 2: Bitmap / Raster / Shape Layer with Canvas
    if (pLayer.canvas) {
      let dataUrl = '';
      try {
        const canvas = pLayer.canvas as HTMLCanvasElement;
        dataUrl = canvas.toDataURL('image/png');
      } catch (err) {
        console.warn(`Could not export canvas for layer ${layerName}:`, err);
      }

      if (dataUrl) {
        const layer = createBlankLayer('image', layerName, posX, posY);
        layer.visible = !isHidden;
        layer.expandedInTimeline = false;
        layer.colorTag = colorTag;
        layer.transform.opacity.value = opacity;
        layer.style.blendMode = blendMode;
        layer.image = {
          src: dataUrl,
          fileName: `${layerName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.png`,
          mimeType: 'image/png',
          width: { value: width, isKeyframed: false, keyframes: [] },
          height: { value: height, isKeyframed: false, keyframes: [] },
        };

        vectorLayers.push(layer);
        layerInfos.push({
          id: layer.id,
          name: layerName,
          type: 'image',
          width,
          height,
          left,
          top,
          opacity,
          visible: !isHidden,
          blendMode,
          thumbnailUrl: dataUrl,
        });
        continue;
      }
    }

    // Case 3: Empty / Solid shape or bounding box fallback
    const layer = createBlankLayer('rect', layerName, posX, posY);
    layer.visible = !isHidden;
    layer.expandedInTimeline = false;
    layer.colorTag = colorTag;
    layer.transform.opacity.value = opacity;
    layer.style.blendMode = blendMode;
    layer.rect = {
      width: { value: width, isKeyframed: false, keyframes: [] },
      height: { value: height, isKeyframed: false, keyframes: [] },
      cornerRadius: { value: 0, isKeyframed: false, keyframes: [] },
    };
    layer.style.fill.value = 'transparent';
    layer.style.stroke.value = colorTag;
    layer.style.strokeWidth.value = 1;

    vectorLayers.push(layer);
    layerInfos.push({
      id: layer.id,
      name: layerName,
      type: 'image',
      width,
      height,
      left,
      top,
      opacity,
      visible: !isHidden,
      blendMode,
    });
  }

  return {
    fileName: file.name,
    width: docWidth,
    height: docHeight,
    layers: vectorLayers,
    layerInfos,
    previewUrl,
  };
}
