import { Composition, VectorLayer } from '../types';
import JSZip from 'jszip';

export interface ExportOptions {
  clickTagUrl?: string;
  loopMode?: 'infinite' | 'repeat' | 'once';
  loopCount?: number;
  loopDelay?: number;
  restartOnHover?: boolean;
  isResponsive?: boolean;
  imageMode?: 'files' | 'base64'; // 'files' references relative image paths; 'base64' embeds data URLs
  imageFolder?: string; // Default 'images/'
}

export interface ExtractedImage {
  id: string;
  layerId: string;
  originalSrc: string;
  fileName: string; // e.g. "banner.jpg"
  relativePath: string; // e.g. "images/banner.jpg"
  mimeType: string; // e.g. "image/jpeg"
  format: string; // e.g. "jpg"
  base64Data: string; // Raw base64 payload without data:... prefix
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Extracts and sanitizes all image assets from a composition.
 * Preserves the original file extension (jpg, png, gif, webp, svg) as uploaded by the user.
 */
export function extractCompositionImages(
  comp: Composition,
  folderPrefix: string = 'images/'
): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const usedFileNames = new Set<string>();

  comp.layers.forEach((layer, idx) => {
    if (layer.type !== 'image' || !layer.image || !layer.image.src) return;

    const rawSrc = layer.image.src;
    let format = 'png';
    let mimeType = layer.image.mimeType || '';

    // Check data URL prefix: e.g. data:image/jpeg;base64,...
    if (rawSrc.startsWith('data:')) {
      const match = rawSrc.match(/^data:([^;,]+)(?:;charset=[^;,]+)?(?:;base64)?,/);
      if (match && match[1]) {
        mimeType = match[1].toLowerCase();
      }
    }

    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      format = 'jpg';
      mimeType = 'image/jpeg';
    } else if (mimeType.includes('png')) {
      format = 'png';
      mimeType = 'image/png';
    } else if (mimeType.includes('gif')) {
      format = 'gif';
      mimeType = 'image/gif';
    } else if (mimeType.includes('webp')) {
      format = 'webp';
      mimeType = 'image/webp';
    } else if (mimeType.includes('svg')) {
      format = 'svg';
      mimeType = 'image/svg+xml';
    } else if (layer.image.fileName) {
      const extMatch = layer.image.fileName.match(/\.([a-zA-Z0-9]+)$/);
      if (extMatch) {
        const ext = extMatch[1].toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
          format = ext === 'jpeg' ? 'jpg' : ext;
          mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
        }
      }
    }

    // Determine clean base name
    let baseName = '';
    if (layer.image.fileName) {
      baseName = layer.image.fileName.replace(/\.[a-zA-Z0-9]+$/, '');
    } else if (layer.name && layer.name !== 'Image Layer' && layer.name !== 'IMAGE Layer') {
      baseName = layer.name.replace(/\.[a-zA-Z0-9]+$/, '');
    } else {
      baseName = `image_${idx + 1}`;
    }

    baseName = baseName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '')
      .replace(/-+/g, '-');

    if (!baseName) baseName = `image_${idx + 1}`;

    let candidateName = `${baseName}.${format}`;
    let counter = 2;
    while (usedFileNames.has(candidateName)) {
      candidateName = `${baseName}-${counter}.${format}`;
      counter++;
    }
    usedFileNames.add(candidateName);

    const cleanFolder = folderPrefix.endsWith('/') ? folderPrefix : `${folderPrefix}/`;
    const relativePath = `${cleanFolder}${candidateName}`;

    // Extract base64 payload
    let base64Data = '';
    if (rawSrc.startsWith('data:')) {
      const commaIdx = rawSrc.indexOf(',');
      if (commaIdx !== -1) {
        base64Data = rawSrc.substring(commaIdx + 1);
      }
    }

    const w = typeof layer.image.width?.value === 'number' ? layer.image.width.value : 200;
    const h = typeof layer.image.height?.value === 'number' ? layer.image.height.value : 200;

    images.push({
      id: `img_asset_${layer.id}`,
      layerId: layer.id,
      originalSrc: rawSrc,
      fileName: candidateName,
      relativePath,
      mimeType: mimeType || `image/${format}`,
      format,
      base64Data,
      dataUrl: rawSrc,
      width: w,
      height: h,
    });
  });

  return images;
}

/**
 * Generates initial static SVG & HTML markup for layers.
 * Renders images with the standard HTML <img> tag inside <foreignObject> so standard
 * <img> tags and relative image paths are explicitly visible in the HTML document.
 */
function renderInitialLayerMarkup(
  layers: VectorLayer[],
  extractedMap: Map<string, ExtractedImage>,
  imageMode: 'files' | 'base64'
): string {
  const reversed = [...layers].reverse();
  const items = reversed.map((layer) => {
    if (!layer.visible) return '';

    const pos = layer.transform.position.value || { x: 0, y: 0 };
    const rot = layer.transform.rotation.value || 0;
    const sc = layer.transform.scale.value || { x: 100, y: 100 };
    const anch = layer.transform.anchorPoint.value || { x: 0, y: 0 };
    const op = (layer.transform.opacity.value ?? 100) / 100;
    const transformStr = `translate(${pos.x},${pos.y}) rotate(${rot}) scale(${sc.x / 100},${sc.y / 100}) translate(${-anch.x},${-anch.y})`;

    if (layer.type === 'image' && layer.image) {
      const w = layer.image.width.value || 200;
      const h = layer.image.height.value || 200;
      const extracted = extractedMap.get(layer.id);
      const src = imageMode === 'base64' ? layer.image.src : extracted ? extracted.relativePath : layer.image.src;

      return `      <!-- Capa de Imagen HTML5 (etiqueta <img> estándar) -->
      <g id="layer_${layer.id}" transform="${transformStr}" opacity="${op}">
        <foreignObject id="shape_${layer.id}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" style="overflow: visible;">
          <img id="img_${layer.id}" src="${src}" alt="${layer.name}" width="${w}" height="${h}" style="width:100%;height:100%;display:block;object-fit:contain;pointer-events:none;border:none;" />
        </foreignObject>
      </g>`;
    }

    return `      <g id="layer_${layer.id}" transform="${transformStr}" opacity="${op}"></g>`;
  });

  return items.filter(Boolean).join('\n');
}

/**
 * Generates clean, Google Adsense / Google Ad Manager compliant HTML5 Vector Banner.
 * - Uses standard HTML <img> tags for images (not SVG <image> and not Base64 bloat when in 'files' mode).
 * - Zero external play/pause/scrubber controls overlay.
 * - Supports Infinite Loop, Repeat N Times (with Stop at End), or Play Once.
 * - Configurable pause delay between loops.
 * - Optional replay on hover when stopped.
 * - Supports Responsive / Fluid auto-scaling or Fixed IAB dimensions.
 * - Supports Google Ads standard <meta name="ad.size"> and window.clickTag.
 * - Ultra-lightweight zero-dependency payload.
 */
export function generateStandaloneHTML5(
  comp: Composition,
  options?: ExportOptions
): string {
  const imageMode = options?.imageMode || 'files';
  const folderPrefix = options?.imageFolder || 'images/';
  const extractedImages = extractCompositionImages(comp, folderPrefix);
  const imageMap = new Map<string, ExtractedImage>();
  extractedImages.forEach((img) => imageMap.set(img.layerId, img));

  // Clone layers and replace image.src with clean relative path if in 'files' mode
  const exportedLayers = comp.layers.map((l) => {
    if (l.type === 'image' && l.image) {
      const extracted = imageMap.get(l.id);
      const src = imageMode === 'base64' ? l.image.src : extracted ? extracted.relativePath : l.image.src;
      return {
        ...l,
        image: {
          ...l.image,
          src,
        },
      };
    }
    return l;
  });

  const jsonComp = JSON.stringify({
    width: comp.width,
    height: comp.height,
    fps: comp.fps,
    duration: comp.duration,
    backgroundColor: comp.backgroundColor,
    layers: exportedLayers,
  });

  const clickTagUrl = options?.clickTagUrl || 'https://www.google.com';
  const loopMode = options?.loopMode || 'infinite';
  const loopCount = options?.loopCount || 3;
  const loopDelay = options?.loopDelay || 0;
  const restartOnHover = options?.restartOnHover !== false;
  const isResponsive = options?.isResponsive !== false; // Responsive by default
  const maxLoops = loopMode === 'once' ? 1 : loopMode === 'repeat' ? loopCount : 0;

  const initialLayerMarkup = renderInitialLayerMarkup(comp.layers, imageMap, imageMode);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="ad.size" content="width=${comp.width},height=${comp.height}">
  <title>${comp.name} - Google Ads HTML5 Banner</title>
  <script type="text/javascript">
    var clickTag = "${clickTagUrl}";
  </script>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      -webkit-user-select: none;
    }
    #ad-container {
      ${
        isResponsive
          ? `position: relative; width: 100%; height: 100%; max-width: ${comp.width}px; max-height: ${comp.height}px; aspect-ratio: ${comp.width} / ${comp.height};`
          : `position: relative; width: ${comp.width}px; height: ${comp.height}px;`
      }
      background-color: ${comp.backgroundColor};
      overflow: hidden;
      cursor: pointer;
      box-sizing: border-box;
      border: 1px solid rgba(0, 0, 0, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg.ad-stage {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }
  </style>
</head>
<body>
  <div id="ad-container" role="banner" aria-label="${comp.name}">
    <svg id="adStage" class="ad-stage" viewBox="0 0 ${comp.width} ${comp.height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs id="adDefs"></defs>
      <g id="adRoot">
${initialLayerMarkup}
      </g>
    </svg>
  </div>

  <script>
    (function() {
      const comp = ${jsonComp};
      const svgRoot = document.getElementById('adRoot');
      const adDefs = document.getElementById('adDefs');
      const container = document.getElementById('ad-container');

      // Google Ads ClickTag standard handler
      container.addEventListener('click', function(e) {
        if (window.clickTag) {
          window.open(window.clickTag, '_blank');
        }
      });

      // Micro Cubic Bezier Solver for After Effects / Easing Curves
      function solveBezier(t, p1x, p1y, p2x, p2y) {
        if (t <= 0) return 0; if (t >= 1) return 1;
        let s = 0, e = 1, g = t;
        for (let i = 0; i < 8; i++) {
          const cx = 3*(1-g)*(1-g)*g*p1x + 3*(1-g)*g*g*p2x + g*g*g;
          const diff = cx - t;
          if (Math.abs(diff) < 0.001) break;
          const dx = 3*(1-g)*(1-g)*p1x + 6*(1-g)*g*(p2x-p1x) + 3*g*g*(1-p2x);
          if (Math.abs(dx) > 1e-5) g = g - diff/dx;
          else { if (diff > 0) e = g; else s = g; g = (s+e)/2; }
          g = Math.max(0, Math.min(1, g));
        }
        return 3*(1-g)*(1-g)*g*p1y + 3*(1-g)*g*g*p2y + g*g*g;
      }

      function easeVal(r, type, hIn, hOut) {
        const c = Math.max(0, Math.min(1, r));
        if (type === 'linear') return c;
        if (type === 'easeIn') return c * c * c;
        if (type === 'easeOut') return 1 - Math.pow(1 - c, 3);
        if (type === 'easeInOut') return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
        if (type === 'bounce') {
          let t = c; const n1 = 7.5625, d1 = 2.75;
          if (t < 1/d1) return n1 * t * t;
          if (t < 2/d1) return n1 * (t -= 1.5/d1) * t + 0.75;
          if (t < 2.5/d1) return n1 * (t -= 2.25/d1) * t + 0.9375;
          return n1 * (t -= 2.625/d1) * t + 0.984375;
        }
        if (type === 'elastic') {
          return c === 0 ? 0 : c === 1 ? 1 : -Math.pow(2, 10 * c - 10) * Math.sin((c * 10 - 10.75) * (2 * Math.PI / 3));
        }
        if (type === 'hold') return c >= 1 ? 1 : 0;
        if (type === 'cubicBezier') return solveBezier(c, hOut?.x ?? 0.25, hOut?.y ?? 0.1, hIn?.x ?? 0.25, hIn?.y ?? 1.0);
        return c;
      }

      // Color parsing & lerp
      function parseColor(str) {
        if (!str || str === 'none' || str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
        if (str.startsWith('#')) {
          let hex = str.slice(1);
          if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
          if (hex.length === 6) return { r: parseInt(hex.slice(0,2), 16), g: parseInt(hex.slice(2,4), 16), b: parseInt(hex.slice(4,6), 16), a: 1 };
          if (hex.length === 8) return { r: parseInt(hex.slice(0,2), 16), g: parseInt(hex.slice(2,4), 16), b: parseInt(hex.slice(4,6), 16), a: parseInt(hex.slice(6,8), 16)/255 };
        }
        if (str.startsWith('rgb')) {
          const m = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
          if (m) return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]), a: m[4] !== undefined ? parseFloat(m[4]) : 1 };
        }
        return { r: 255, g: 255, b: 255, a: 1 };
      }

      function lerpColor(c1, c2, t) {
        if (c1 === 'none' && c2 === 'none') return 'none';
        if (c1 === 'none') c1 = '#ffffff00';
        if (c2 === 'none') c2 = '#ffffff00';
        const a = parseColor(c1), b = parseColor(c2);
        const r = Math.round(a.r + (b.r - a.r) * t);
        const g = Math.round(a.g + (b.g - a.g) * t);
        const bl = Math.round(a.b + (b.b - a.b) * t);
        const alpha = +(a.a + (b.a - a.a) * t).toFixed(3);
        if (alpha < 0.99) return \`rgba(\${r},\${g},\${bl},\${alpha})\`;
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
      }

      function evalProp(p, t, isColor) {
        if (!p) return undefined;
        if (!p.isKeyframed || !p.keyframes || p.keyframes.length === 0) return p.value;
        const kfs = p.keyframes.slice().sort((a,b) => a.time - b.time);
        if (t <= kfs[0].time) return kfs[0].value;
        if (t >= kfs[kfs.length-1].time) return kfs[kfs.length-1].value;

        for (let i = 0; i < kfs.length - 1; i++) {
          const k1 = kfs[i], k2 = kfs[i+1];
          if (t >= k1.time && t <= k2.time) {
            const dur = k2.time - k1.time || 0.0001;
            const prog = (t - k1.time) / dur;
            const ep = easeVal(prog, k1.easing, k1.handleIn, k1.handleOut);

            if (isColor && typeof k1.value === 'string' && typeof k2.value === 'string') {
              return lerpColor(k1.value, k2.value, ep);
            }
            if (typeof k1.value === 'number') {
              return k1.value + (k2.value - k1.value) * ep;
            }
            if (typeof k1.value === 'object' && k1.value && 'x' in k1.value) {
              return {
                x: k1.value.x + (k2.value.x - k1.value.x) * ep,
                y: k1.value.y + (k2.value.y - k1.value.y) * ep,
              };
            }
            return ep >= 0.5 ? k2.value : k1.value;
          }
        }
        return p.value;
      }

      // Procedural Star & Polygon geometry formulas
      function generateStarPath(points, outerRadius, innerRadius) {
        const pts = Math.max(3, Math.round(points));
        const step = Math.PI / pts;
        let d = '';
        for (let i = 0; i < 2 * pts; i++) {
          const r = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = i * step - Math.PI / 2;
          const x = r * Math.cos(angle);
          const y = r * Math.sin(angle);
          d += (i === 0 ? 'M ' : ' L ') + x.toFixed(2) + ' ' + y.toFixed(2);
        }
        return d + ' Z';
      }

      function generatePolygonPath(sides, radius) {
        const s = Math.max(3, Math.round(sides));
        const step = (2 * Math.PI) / s;
        let d = '';
        for (let i = 0; i < s; i++) {
          const angle = i * step - Math.PI / 2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          d += (i === 0 ? 'M ' : ' L ') + x.toFixed(2) + ' ' + y.toFixed(2);
        }
        return d + ' Z';
      }

      // Wiggle pseudo-random noise generator
      function getWiggle(seed, time, freq, amp) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i) | 0;
        const bf = freq * 2 * Math.PI;
        const p1 = (hash % 1000) / 100;
        const p2 = ((hash >> 4) % 1000) / 100;
        const p3 = ((hash >> 8) % 1000) / 100;
        return ((Math.sin(time * bf + p1) + Math.sin(time * bf * 1.618 + p2)*0.5 + Math.cos(time * bf * 2.718 + p3)*0.25) / 1.75) * amp;
      }

      // Initialize all SVG layer nodes (built back-to-front so Layer 1 sits on top)
      function buildLayers() {
        [...comp.layers].reverse().forEach((layer) => {
          if (!layer.visible) return;

          let g = document.getElementById('layer_' + layer.id);
          if (!g) {
            g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.id = 'layer_' + layer.id;
            svgRoot.appendChild(g);
          }

          let shape = document.getElementById('shape_' + layer.id);
          if (!shape) {
            if (layer.type === 'rect') {
              shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            } else if (layer.type === 'circle') {
              shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            } else if (layer.type === 'star' || layer.type === 'polygon' || layer.type === 'path') {
              shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            } else if (layer.type === 'text') {
              shape = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              shape.textContent = layer.text?.text || '';
            } else if (layer.type === 'image') {
              // Standard HTML <img> tag wrapped in SVG <foreignObject> for hardware-accelerated transforms
              const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
              fo.setAttribute('style', 'overflow: visible;');
              const img = document.createElement('img');
              img.id = 'img_' + layer.id;
              img.src = layer.image?.src || '';
              img.alt = layer.name || 'image';
              img.setAttribute('style', 'width:100%;height:100%;display:block;object-fit:contain;pointer-events:none;border:none;');
              fo.appendChild(img);
              shape = fo;
            }

            if (shape) {
              shape.id = 'shape_' + layer.id;
              g.appendChild(shape);
            }
          }
        });
      }

      // Continuous 60 FPS Render Tick
      function render(time) {
        comp.layers.forEach((layer) => {
          if (!layer.visible) return;
          const g = document.getElementById('layer_' + layer.id);
          const el = document.getElementById('shape_' + layer.id);
          if (!g || !el) return;

          let pos = evalProp(layer.transform?.position, time) || { x: 0, y: 0 };
          if (typeof pos !== 'object' || pos.x === undefined) pos = { x: 0, y: 0 };

          let sc = evalProp(layer.transform?.scale, time) || { x: 100, y: 100 };
          if (typeof sc !== 'object' || sc.x === undefined) sc = { x: 100, y: 100 };

          let rot = evalProp(layer.transform?.rotation, time) ?? 0;
          if (typeof rot !== 'number' || isNaN(rot)) rot = 0;

          let op = evalProp(layer.transform?.opacity, time) ?? 100;
          if (typeof op !== 'number' || isNaN(op)) op = 100;

          let anch = evalProp(layer.transform?.anchorPoint, time) || { x: 0, y: 0 };
          if (typeof anch !== 'object' || anch.x === undefined) anch = { x: 0, y: 0 };

          // Modifiers (Wiggle expression)
          const wiggleMod = layer.modifiers?.find(m => m.type === 'wiggle' && m.enabled);
          if (wiggleMod && wiggleMod.wiggle) {
            const w = wiggleMod.wiggle;
            if (w.positionAmp > 0) {
              pos = {
                x: pos.x + getWiggle(layer.id + '_x', time, w.frequency, w.positionAmp),
                y: pos.y + getWiggle(layer.id + '_y', time, w.frequency, w.positionAmp)
              };
            }
            if (w.rotationAmp > 0) {
              rot += getWiggle(layer.id + '_r', time, w.frequency, w.rotationAmp);
            }
            if (w.scaleAmp > 0) {
              const so = getWiggle(layer.id + '_s', time, w.frequency, w.scaleAmp);
              sc = { x: sc.x + so, y: sc.y + so };
            }
          }

          const fill = evalProp(layer.style?.fill, time, true) || 'none';
          const stroke = evalProp(layer.style?.stroke, time, true) || 'none';
          const strokeW = evalProp(layer.style?.strokeWidth, time) ?? 0;
          const strokeOp = evalProp(layer.style?.strokeOpacity, time) ?? 100;
          const fillOp = evalProp(layer.style?.fillOpacity, time) ?? 100;
          const trimStart = evalProp(layer.style?.trimStart, time);
          const trimEnd = evalProp(layer.style?.trimEnd, time);
          const trimOffset = evalProp(layer.style?.trimOffset, time);

          // Apply Transform
          g.setAttribute('transform', 'translate(' + pos.x + ',' + pos.y + ') rotate(' + rot + ') scale(' + (sc.x/100) + ',' + (sc.y/100) + ') translate(' + (-anch.x) + ',' + (-anch.y) + ')');
          g.setAttribute('opacity', Math.max(0, Math.min(1, op / 100)).toString());

          // Apply Styles
          el.setAttribute('fill', fill);
          el.setAttribute('fill-opacity', (fillOp / 100).toString());
          el.setAttribute('stroke', stroke);
          el.setAttribute('stroke-width', (strokeW || 0).toString());
          el.setAttribute('stroke-opacity', (strokeOp / 100).toString());

          // Handle Trim Paths (Animated Stroke)
          if (trimStart !== undefined && trimEnd !== undefined && (trimStart > 0 || trimEnd < 100)) {
            const start = Math.max(0, Math.min(100, trimStart));
            const end = Math.max(start, Math.min(100, trimEnd));
            const len = 1000;
            const drawLen = ((end - start) / 100) * len;
            const offset = (-(start / 100) * len) - ((trimOffset || 0) / 360 * len);
            el.setAttribute('pathLength', len.toString());
            el.setAttribute('stroke-dasharray', drawLen + ' ' + (len - drawLen));
            el.setAttribute('stroke-dashoffset', offset.toString());
          } else {
            el.removeAttribute('stroke-dasharray');
            el.removeAttribute('stroke-dashoffset');
            el.removeAttribute('pathLength');
          }

          // Render Shape Geometry
          if (layer.type === 'rect') {
            const w = evalProp(layer.rect?.width, time) || 100;
            const h = evalProp(layer.rect?.height, time) || 100;
            const rx = evalProp(layer.rect?.cornerRadius, time) || 0;
            el.setAttribute('x', (-w / 2).toString());
            el.setAttribute('y', (-h / 2).toString());
            el.setAttribute('width', w.toString());
            el.setAttribute('height', h.toString());
            if (rx > 0) {
              el.setAttribute('rx', rx.toString());
              el.setAttribute('ry', rx.toString());
            } else {
              el.removeAttribute('rx');
              el.removeAttribute('ry');
            }
          } else if (layer.type === 'circle') {
            const rx = evalProp(layer.circle?.radiusX, time) || 50;
            const ry = evalProp(layer.circle?.radiusY, time) || 50;
            el.setAttribute('cx', '0');
            el.setAttribute('cy', '0');
            el.setAttribute('rx', rx.toString());
            el.setAttribute('ry', ry.toString());
          } else if (layer.type === 'star') {
            const points = evalProp(layer.star?.points, time) || 5;
            const outerR = evalProp(layer.star?.outerRadius, time) || 60;
            const innerR = evalProp(layer.star?.innerRadius, time) || 30;
            el.setAttribute('d', generateStarPath(points, outerR, innerR));
          } else if (layer.type === 'polygon') {
            const sides = evalProp(layer.polygon?.sides, time) || 6;
            const radius = evalProp(layer.polygon?.radius, time) || 60;
            el.setAttribute('d', generatePolygonPath(sides, radius));
          } else if (layer.type === 'path' && layer.path) {
            el.setAttribute('d', layer.path.d || '');
          } else if (layer.type === 'text') {
            const fs = evalProp(layer.text?.fontSize, time) || 24;
            el.textContent = layer.text?.text || '';
            el.setAttribute('font-size', fs.toString());
            el.setAttribute('font-family', layer.text?.fontFamily || 'sans-serif');
            el.setAttribute('font-weight', layer.text?.fontWeight || 'bold');
            el.setAttribute('text-anchor', 'middle');
            el.setAttribute('dominant-baseline', 'central');
          } else if (layer.type === 'image' && layer.image) {
            const w = evalProp(layer.image?.width, time) || 100;
            const h = evalProp(layer.image?.height, time) || 100;
            el.setAttribute('x', (-w / 2).toString());
            el.setAttribute('y', (-h / 2).toString());
            el.setAttribute('width', w.toString());
            el.setAttribute('height', h.toString());
            const imgEl = el.querySelector ? el.querySelector('img') : null;
            if (imgEl) {
              if (layer.image.src && imgEl.getAttribute('src') !== layer.image.src) {
                imgEl.src = layer.image.src;
              }
            } else if (el.tagName && el.tagName.toLowerCase() === 'image') {
              if (layer.image.src) el.setAttribute('href', layer.image.src);
            }
          }
        });
      }

      // Animation Playback & Loop Control
      const loopMode = "${loopMode}";
      const maxLoops = ${maxLoops};
      const loopDelay = ${loopDelay};
      const restartOnHover = ${restartOnHover};

      let currentLoop = 0;
      let isPlaying = true;
      let isPausedForDelay = false;
      let delayTimeoutId = null;
      let animFrameId = null;
      let currentTime = 0;
      let lastTimestamp = 0;

      // Smooth, robust Animation Loop
      function animLoop(now) {
        if (!isPlaying || isPausedForDelay) return;

        if (!lastTimestamp) {
          lastTimestamp = now;
        }

        const delta = Math.min(Math.max((now - lastTimestamp) / 1000, 0), 0.1);
        lastTimestamp = now;
        currentTime += delta;

        if (currentTime >= comp.duration) {
          currentLoop++;

          // Check if max loops reached (for 'once' or 'repeat')
          if (maxLoops > 0 && currentLoop >= maxLoops) {
            currentTime = comp.duration;
            isPlaying = false;
            render(currentTime);
            return;
          }

          // Handle pause delay between loops
          if (loopDelay > 0) {
            currentTime = comp.duration;
            render(currentTime);
            isPausedForDelay = true;
            if (delayTimeoutId) clearTimeout(delayTimeoutId);
            delayTimeoutId = setTimeout(function() {
              currentTime = 0;
              isPausedForDelay = false;
              lastTimestamp = performance.now();
              if (isPlaying) {
                animFrameId = requestAnimationFrame(animLoop);
              }
            }, loopDelay * 1000);
            return;
          } else {
            // Infinite or standard repeat without pause
            currentTime = comp.duration > 0 ? (currentTime % comp.duration) : 0;
          }
        }

        render(currentTime);

        if (isPlaying && !isPausedForDelay) {
          animFrameId = requestAnimationFrame(animLoop);
        }
      }

      if (restartOnHover) {
        container.addEventListener('mouseenter', function() {
          if (!isPlaying || isPausedForDelay) {
            if (delayTimeoutId) clearTimeout(delayTimeoutId);
            if (animFrameId) cancelAnimationFrame(animFrameId);
            currentLoop = 0;
            currentTime = 0;
            isPlaying = true;
            isPausedForDelay = false;
            lastTimestamp = performance.now();
            animFrameId = requestAnimationFrame(animLoop);
          }
        });
      }

      buildLayers();
      animFrameId = requestAnimationFrame(animLoop);
    })();
  </script>
</body>
</html>`;
}

/**
 * Generates an embeddable React TSX component
 */
export function generateReactComponent(
  comp: Composition,
  options?: ExportOptions
): string {
  const loopCount = options?.loopMode === 'once' ? 1 : options?.loopMode === 'repeat' ? (options?.loopCount || 3) : 0;
  const loopDelay = options?.loopDelay || 0;
  const isResponsive = options?.isResponsive !== false;

  return `import React, { useEffect, useRef, useState } from 'react';

export interface VectorMotionProps {
  autoPlay?: boolean;
  loop?: boolean;
  maxLoops?: number;
  loopDelay?: number;
  responsive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ${comp.name.replace(/[^a-zA-Z0-9]/g, '') || 'VectorBanner'}: React.FC<VectorMotionProps> = ({
  autoPlay = true,
  loop = ${options?.loopMode !== 'once'},
  maxLoops = ${loopCount},
  loopDelay = ${loopDelay},
  responsive = ${isResponsive},
  className = '',
  onClick,
}) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const timeRef = useRef(0);
  const loopCountRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const duration = ${comp.duration};
  const width = ${comp.width};
  const height = ${comp.height};

  useEffect(() => {
    let lastTime = 0;
    let delayTimer: any = null;

    const render = (now: number) => {
      if (!isPlaying) return;

      if (!lastTime) {
        lastTime = now;
      }

      const delta = Math.min(Math.max((now - lastTime) / 1000, 0), 0.1);
      lastTime = now;

      timeRef.current += delta;
      if (timeRef.current >= duration) {
        loopCountRef.current += 1;
        if (maxLoops > 0 && loopCountRef.current >= maxLoops) {
          timeRef.current = duration;
          setIsPlaying(false);
          return;
        }

        if (loopDelay > 0) {
          timeRef.current = duration;
          if (delayTimer) clearTimeout(delayTimer);
          delayTimer = setTimeout(() => {
            timeRef.current = 0;
            lastTime = performance.now();
            animFrameRef.current = requestAnimationFrame(render);
          }, loopDelay * 1000);
          return;
        } else {
          timeRef.current = duration > 0 ? (timeRef.current % duration) : 0;
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [isPlaying, loop, maxLoops, loopDelay, duration]);

  return (
    <div
      style={
        responsive
          ? {
              width: '100%',
              maxWidth: width,
              aspectRatio: \`\${width} / \${height}\`,
              backgroundColor: '${comp.backgroundColor}',
              overflow: 'hidden',
              cursor: onClick ? 'pointer' : 'default',
              margin: '0 auto',
              position: 'relative',
            }
          : {
              width,
              height,
              backgroundColor: '${comp.backgroundColor}',
              overflow: 'hidden',
              cursor: onClick ? 'pointer' : 'default',
            }
      }
      onClick={onClick}
      className={className}
    >
      <svg
        ref={containerRef}
        viewBox={\`0 0 \${width} \${height}\`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
      >
        {/* Animated Vector Elements */}
      </svg>
    </div>
  );
};

export default ${comp.name.replace(/[^a-zA-Z0-9]/g, '') || 'VectorBanner'};
`;
}

/**
 * Generates pure CSS Keyframe animation code for zero-JS web rendering
 */
export function generateCSSKeyframes(
  comp: Composition,
  options?: ExportOptions
): string {
  const iterCount =
    options?.loopMode === 'once'
      ? '1'
      : options?.loopMode === 'repeat'
      ? (options?.loopCount || 3).toString()
      : 'infinite';
  const isResponsive = options?.isResponsive !== false;

  let css = `/* Google Ads / HTML5 Banner Pure CSS Output - Zero JS */
.vm-banner {
  ${
    isResponsive
      ? `width: 100%;
  max-width: ${comp.width}px;
  aspect-ratio: ${comp.width} / ${comp.height};
  margin: 0 auto;`
      : `width: ${comp.width}px;
  height: ${comp.height}px;`
  }
  background-color: ${comp.backgroundColor};
  position: relative;
  overflow: hidden;
  display: block;
}

.vm-layer {
  position: absolute;
  transform-origin: center center;
  will-change: transform, opacity;
  animation-duration: ${comp.duration}s;
  animation-iteration-count: ${iterCount};
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
`;

  comp.layers.forEach((layer, idx) => {
    if (!layer.visible) return;
    const animName = `vm-anim-layer-${idx}`;
    css += `
#layer-${layer.id} {
  animation-name: ${animName};
}

@keyframes ${animName} {
  0% {
    transform: translate(${layer.transform.position.value.x}px, ${layer.transform.position.value.y}px) rotate(${layer.transform.rotation.value}deg) scale(${layer.transform.scale.value.x / 100});
    opacity: ${layer.transform.opacity.value / 100};
  }
  50% {
    transform: translate(${layer.transform.position.value.x}px, ${layer.transform.position.value.y - 15}px) rotate(${layer.transform.rotation.value + 10}deg) scale(${(layer.transform.scale.value.x / 100) * 1.05});
    opacity: 1;
  }
  100% {
    transform: translate(${layer.transform.position.value.x}px, ${layer.transform.position.value.y}px) rotate(${layer.transform.rotation.value}deg) scale(${layer.transform.scale.value.x / 100});
    opacity: ${layer.transform.opacity.value / 100};
  }
}
`;
  });

  return css;
}

/**
 * Generates Lottie / JSON representation
 */
export function generateLottieJSON(comp: Composition): string {
  const lottieData = {
    v: '5.9.0',
    fr: comp.fps,
    ip: 0,
    op: Math.round(comp.duration * comp.fps),
    w: comp.width,
    h: comp.height,
    nm: comp.name,
    ddd: 0,
    assets: [],
    layers: comp.layers.map((l, i) => ({
      ddd: 0,
      ind: i + 1,
      ty: 4,
      nm: l.name,
      sr: 1,
      ks: {
        o: { a: l.transform.opacity.isKeyframed ? 1 : 0, k: l.transform.opacity.value },
        r: { a: l.transform.rotation.isKeyframed ? 1 : 0, k: l.transform.rotation.value },
        p: { a: l.transform.position.isKeyframed ? 1 : 0, k: [l.transform.position.value.x, l.transform.position.value.y, 0] },
        a: { a: l.transform.anchorPoint.isKeyframed ? 1 : 0, k: [l.transform.anchorPoint.value.x, l.transform.anchorPoint.value.y, 0] },
        s: { a: l.transform.scale.isKeyframed ? 1 : 0, k: [l.transform.scale.value.x, l.transform.scale.value.y, 100] },
      },
      ao: 0,
      shapes: [],
      ip: 0,
      op: Math.round(comp.duration * comp.fps),
      st: 0,
      bm: 0,
    })),
  };
  return JSON.stringify(lottieData, null, 2);
}

/**
 * Generates an iframe embed snippet for easy deployment (Responsive or Fixed)
 */
export function generateIFrameSnippet(
  comp: Composition,
  options?: { fileName?: string; isResponsive?: boolean }
): string {
  const isResponsive = options?.isResponsive !== false;
  const targetFile = options?.fileName || `${comp.name.toLowerCase().replace(/\s+/g, '-')}.html`;

  if (isResponsive) {
    return `<!-- ============================================================== -->
<!-- Responsive HTML5 Banner Embed (Fluid - Scales to any screen)   -->
<!-- Aspect Ratio: ${comp.width}x${comp.height} | Dur: ${comp.duration}s                               -->
<!-- ============================================================== -->
<div style="position:relative;width:100%;max-width:${comp.width}px;aspect-ratio:${comp.width}/${comp.height};margin:0 auto;overflow:hidden;">
  <iframe
    src="${targetFile}"
    title="${comp.name}"
    frameborder="0"
    scrolling="no"
    marginwidth="0"
    marginheight="0"
    allowtransparency="true"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;overflow:hidden;"
  ></iframe>
</div>`;
  }

  return `<!-- ============================================================== -->
<!-- Fixed Dimension Google Ads / AdSense iframe Embed Tag          -->
<!-- Size: ${comp.width}x${comp.height}px | Dur: ${comp.duration}s                          -->
<!-- ============================================================== -->
<iframe
  src="${targetFile}"
  width="${comp.width}"
  height="${comp.height}"
  title="${comp.name}"
  frameborder="0"
  scrolling="no"
  marginwidth="0"
  marginheight="0"
  allowtransparency="true"
  style="width:${comp.width}px;height:${comp.height}px;border:0;overflow:hidden;display:inline-block;vertical-align:top;"
></iframe>`;
}

/**
 * Generates a complete, ready-to-deploy HTML5 Zip package.
 * - index.html references images via <img src="images/..."> tags.
 * - images/ folder contains each image file in its original uploaded format (jpg, png, gif, webp, svg).
 * - manifest.json with standard Google Ads / IAB assets list.
 */
export async function generateHTML5ZipBundle(
  comp: Composition,
  options?: ExportOptions
): Promise<Blob> {
  const zip = new JSZip();
  const folderPrefix = options?.imageFolder || 'images/';
  const extractedImages = extractCompositionImages(comp, folderPrefix);

  // Standalone HTML5 using relative image paths and standard <img> tags
  const htmlCode = generateStandaloneHTML5(comp, {
    ...options,
    imageMode: 'files',
    imageFolder: folderPrefix,
  });

  zip.file('index.html', htmlCode);

  // Add individual image files into images/ directory inside the ZIP
  if (extractedImages.length > 0) {
    const cleanFolder = folderPrefix.replace(/\/$/, '');
    const imgFolder = zip.folder(cleanFolder);

    for (const img of extractedImages) {
      if (img.base64Data) {
        try {
          imgFolder?.file(img.fileName, img.base64Data, { base64: true });
        } catch {
          // Fallback if raw string or non-standard base64
          imgFolder?.file(img.fileName, img.base64Data);
        }
      } else if (img.originalSrc.startsWith('http') || img.originalSrc.startsWith('blob:')) {
        try {
          const resp = await fetch(img.originalSrc);
          const buf = await resp.arrayBuffer();
          imgFolder?.file(img.fileName, buf);
        } catch (e) {
          console.warn('Could not fetch image for ZIP bundle:', img.originalSrc, e);
        }
      }
    }
  }

  // Google Ads / IAB compliant manifest
  const manifest = {
    name: comp.name,
    version: '1.0.0',
    width: comp.width,
    height: comp.height,
    assets: [
      'index.html',
      ...extractedImages.map((i) => i.relativePath),
    ],
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
