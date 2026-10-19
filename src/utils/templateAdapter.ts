import { Composition, VectorLayer } from '../types';

export interface DimensionPreset {
  id: string;
  name: string;
  category: 'newspaper_ads' | 'google_ads' | 'social' | 'video' | 'custom';
  width: number;
  height: number;
  aspect: string;
  description: string;
  isPriorityStandard?: boolean;
}

export const STANDARD_DIMENSION_PRESETS: DimensionPreset[] = [
  {
    id: 'original',
    name: 'Tamaño Original',
    category: 'custom',
    width: 0,
    height: 0,
    aspect: 'Original',
    description: 'Dimensiones base de la plantilla actual',
  },
  // --- 6 MEDIDAS ESTÁNDAR PRIORITARIAS DEL PERIÓDICO / DISPLAY ---
  {
    id: 'ad_600x500',
    name: '600 × 500 (Portada / Gran Rectángulo)',
    category: 'newspaper_ads',
    width: 600,
    height: 500,
    aspect: '6:5',
    description: 'Estándar para anuncios destacados de portada y módulos principales',
    isPriorityStandard: true,
  },
  {
    id: 'ad_728x90',
    name: '728 × 90 (Leaderboard Horizontal)',
    category: 'newspaper_ads',
    width: 728,
    height: 90,
    aspect: '8:1',
    description: 'Cabecera horizontal superior y barras de noticias destacadas',
    isPriorityStandard: true,
  },
  {
    id: 'ad_640x200',
    name: '640 × 200 (Banner Cabecera / Sección)',
    category: 'newspaper_ads',
    width: 640,
    height: 200,
    aspect: '16:5',
    description: 'Cabecera de sección editorial y entreartículos',
    isPriorityStandard: true,
  },
  {
    id: 'ad_420x200',
    name: '420 × 200 (Módulo Columna / Destacado)',
    category: 'newspaper_ads',
    width: 420,
    height: 200,
    aspect: '21:10',
    description: 'Columna lateral de periódico y widgets de comercios locales',
    isPriorityStandard: true,
  },
  {
    id: 'ad_1100x361',
    name: '1100 × 361 (Super Billboard / Cabecera Principal)',
    category: 'newspaper_ads',
    width: 1100,
    height: 361,
    aspect: '3:1',
    description: 'Gran formato panorámico de máximo impacto visual para portada',
    isPriorityStandard: true,
  },
  {
    id: 'ad_630x250',
    name: '630 × 250 (Noticia Patrocinada / Módulo Central)',
    category: 'newspaper_ads',
    width: 630,
    height: 250,
    aspect: '5:2',
    description: 'Formato rectangular ancho para contenido promocionado en el feed',
    isPriorityStandard: true,
  },

  // --- GOOGLE ADS & IAB TRADICIONALES ---
  {
    id: 'gads_300x250',
    name: '300 × 250 (MPU)',
    category: 'google_ads',
    width: 300,
    height: 250,
    aspect: '6:5',
    description: 'Medium Rectangle - El estándar clásico de Google Ads',
  },
  {
    id: 'gads_300x600',
    name: '300 × 600 (Half Page)',
    category: 'google_ads',
    width: 300,
    height: 600,
    aspect: '1:2',
    description: 'Gran impacto visual vertical lateral',
  },
  {
    id: 'gads_320x50',
    name: '320 × 50 (Mobile Banner)',
    category: 'google_ads',
    width: 320,
    height: 50,
    aspect: '32:5',
    description: 'Banner móvil estándar',
  },
  {
    id: 'gads_970x250',
    name: '970 × 250 (Billboard)',
    category: 'google_ads',
    width: 970,
    height: 250,
    aspect: '39:10',
    description: 'Valla publicitaria de cabecera web',
  },
  {
    id: 'social_1080x1080',
    name: '1080 × 1080 (Cuadrado 1:1)',
    category: 'social',
    width: 1080,
    height: 1080,
    aspect: '1:1',
    description: 'Post para Instagram, Facebook, LinkedIn',
  },
  {
    id: 'social_1080x1920',
    name: '1080 × 1920 (Story / Reels)',
    category: 'social',
    width: 1080,
    height: 1920,
    aspect: '9:16',
    description: 'Vertical para Instagram Stories, TikTok',
  },
  {
    id: 'video_1920x1080',
    name: '1920 × 1080 (Full HD 16:9)',
    category: 'video',
    width: 1920,
    height: 1080,
    aspect: '16:9',
    description: 'Video Widescreen / Pantallas',
  },
  {
    id: 'web_800x600',
    name: '800 × 600 (Canvas Estándar)',
    category: 'custom',
    width: 800,
    height: 600,
    aspect: '4:3',
    description: 'Área de trabajo estándar de animación',
  },
];

export function findDimensionPreset(id: string): DimensionPreset | undefined {
  if (!id) return undefined;
  const exact = STANDARD_DIMENSION_PRESETS.find((p) => p.id === id);
  if (exact) return exact;

  const norm = id.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (norm.includes('1080x1080') || norm.includes('square')) {
    return STANDARD_DIMENSION_PRESETS.find((p) => p.id === 'social_1080x1080');
  }
  if (norm.includes('1080x1920') || norm.includes('story') || norm.includes('reels') || norm.includes('916')) {
    return STANDARD_DIMENSION_PRESETS.find((p) => p.id === 'social_1080x1920');
  }
  if (norm.includes('1920x1080') || norm.includes('video') || norm.includes('169')) {
    return STANDARD_DIMENSION_PRESETS.find((p) => p.id === 'video_1920x1080');
  }
  if (norm.includes('600x500')) {
    return STANDARD_DIMENSION_PRESETS.find((p) => p.id === 'ad_600x500');
  }
  if (norm.includes('728x90')) {
    return STANDARD_DIMENSION_PRESETS.find((p) => p.id === 'ad_728x90');
  }
  if (norm.includes('300x250')) {
    return STANDARD_DIMENSION_PRESETS.find((p) => p.id === 'gads_300x250');
  }
  if (norm.includes('300x600')) {
    return STANDARD_DIMENSION_PRESETS.find((p) => p.id === 'gads_300x600');
  }
  if (norm.includes('640x200')) {
    return STANDARD_DIMENSION_PRESETS.find((p) => p.id === 'ad_640x200');
  }
  if (norm.includes('1100x361')) {
    return STANDARD_DIMENSION_PRESETS.find((p) => p.id === 'ad_1100x361');
  }
  if (norm.includes('800x600')) {
    return STANDARD_DIMENSION_PRESETS.find((p) => p.id === 'web_800x600');
  }
  return undefined;
}

/**
 * Intelligently adapts and reframes a composition to new target dimensions.
 * Re-scales positions, dimensions, keyframes, font sizes, and layout anchors
 * while keeping animations, relative hierarchy, and visual balance intact.
 */
export function adaptCompositionToDimensions(
  sourceComp: Composition,
  targetWidth: number,
  targetHeight: number
): Composition {
  if (!targetWidth || !targetHeight) {
    return JSON.parse(JSON.stringify(sourceComp));
  }

  const origW = sourceComp.width || 1080;
  const origH = sourceComp.height || 1080;

  if (origW === targetWidth && origH === targetHeight) {
    const copy = JSON.parse(JSON.stringify(sourceComp));
    copy.width = targetWidth;
    copy.height = targetHeight;
    return copy;
  }

  const origAspect = origW / origH;
  const targetAspect = targetWidth / targetHeight;

  // Archetype categories
  const isExtremeBanner = targetAspect >= 3.0; // e.g. 728x90, 640x200
  const isTallStory = targetAspect <= 0.72; // e.g. 9:16 / 1080x1920
  const isWideLandscape = targetAspect >= 1.55 && targetAspect < 3.0; // e.g. 16:9 / 1920x1080, 1100x361

  // Base scale calculation
  let geomScale: number;
  if (isExtremeBanner) {
    geomScale = Math.min((targetHeight * 0.78) / origH, 0.45);
  } else if (isTallStory) {
    // In tall story, scale content to comfortably fit 90% of phone width
    geomScale = Math.min((targetWidth * 0.92) / origW, 1.25);
  } else if (isWideLandscape) {
    // In widescreen, scale content to fit 88% of height
    geomScale = Math.min((targetHeight * 0.90) / origH, 1.4);
  } else {
    // Square or similar aspect ratios (e.g. 1:1, 4:5, 6:5)
    geomScale = Math.min(targetWidth / origW, targetHeight / origH) * 0.98;
  }

  // Pre-calculate coordinate transformation function for arbitrary points (x, y)
  const transformPoint = (x: number, y: number, isBg = false): { x: number; y: number } => {
    if (isBg) {
      return { x: Math.round(targetWidth / 2), y: Math.round(targetHeight / 2) };
    }

    const normX = x / origW; // 0..1
    const normY = y / origH; // 0..1

    if (isExtremeBanner) {
      // Flow banner into 3 horizontal zones if original was vertical/square
      let newX: number;
      if (origAspect < 2.0) {
        if (normY < 0.32) {
          // Top kicker / brand -> Left third
          newX = Math.round(targetWidth * (0.12 + normX * 0.15));
        } else if (normY > 0.70) {
          // Bottom CTA / price -> Right third
          newX = Math.round(targetWidth * (0.75 + (normX - 0.5) * 0.2));
        } else {
          // Central title / headline -> Center zone
          newX = Math.round(targetWidth * (0.42 + (normX - 0.5) * 0.25));
        }
      } else {
        newX = Math.round(targetWidth * normX);
      }
      const newY = Math.round(targetHeight / 2 + (y - origH / 2) * geomScale * 0.7);
      return { x: Math.max(10, Math.min(targetWidth - 10, newX)), y: newY };
    }

    if (isTallStory && origAspect > 0.85) {
      // Converting from square (1:1) or landscape to 9:16 vertical
      // Breathe and distribute vertically so content fills the vertical canvas
      let newY: number;
      if (normY <= 0.28) {
        // Top kicker / tags / headers: Anchor smoothly in the top section
        newY = Math.round(targetHeight * 0.12 + normY * (targetHeight * 0.55));
      } else if (normY >= 0.72) {
        // Bottom CTA / social / footer: Anchor in the lower section
        newY = Math.round(targetHeight * 0.80 + (normY - 0.72) * (targetHeight * 0.55));
      } else {
        // Core headlines & hero cards: Center section
        newY = Math.round(targetHeight * 0.30 + ((normY - 0.28) / 0.44) * (targetHeight * 0.46));
      }
      const newX = Math.round(targetWidth / 2 + (x - origW / 2) * geomScale);
      return { x: newX, y: newY };
    }

    if (isWideLandscape && origAspect < 1.3) {
      // Converting from square or vertical to 16:9 widescreen
      const newY = Math.round(targetHeight / 2 + (y - origH / 2) * geomScale);
      // Give horizontal elements more room
      const horizontalSpread = Math.min(targetWidth / (origW * geomScale), 1.25);
      const newX = Math.round(targetWidth / 2 + (x - origW / 2) * geomScale * horizontalSpread);
      return { x: newX, y: newY };
    }

    // Default proportional contain & center
    const offsetX = Math.round((targetWidth - origW * geomScale) / 2);
    const offsetY = Math.round((targetHeight - origH * geomScale) / 2);
    return {
      x: Math.round(offsetX + x * geomScale),
      y: Math.round(offsetY + y * geomScale),
    };
  };

  const adaptedLayers: VectorLayer[] = sourceComp.layers.map((layer) => {
    const copy = JSON.parse(JSON.stringify(layer)) as VectorLayer;
    const nameLower = (layer.name || '').toLowerCase();

    // Identify if the layer is a background / canvas backdrop
    const isBackground =
      nameLower.includes('bg') ||
      nameLower.includes('fondo') ||
      nameLower.includes('background') ||
      nameLower.includes('canvas') ||
      nameLower.includes('wall') ||
      nameLower.includes('tapiz') ||
      nameLower.includes('cuadrícula') ||
      nameLower.includes('grid') ||
      (layer.type === 'rect' &&
        layer.rect &&
        layer.rect.width.value >= origW * 0.72 &&
        layer.rect.height.value >= origH * 0.72);

    if (isBackground && copy.type === 'rect' && copy.rect) {
      copy.rect.width.value = targetWidth;
      copy.rect.height.value = targetHeight;
      const center = { x: Math.round(targetWidth / 2), y: Math.round(targetHeight / 2) };
      copy.transform.position.value = center;
      if (copy.transform.position.isKeyframed && copy.transform.position.keyframes) {
        copy.transform.position.keyframes = copy.transform.position.keyframes.map((kf: any) => ({
          ...kf,
          value: center,
        }));
      }
      return copy;
    }

    // Transform position
    const origPos = layer.transform.position.value;
    const transformed = transformPoint(origPos.x, origPos.y, false);
    copy.transform.position.value = transformed;

    // Transform position keyframes
    if (copy.transform.position.isKeyframed && copy.transform.position.keyframes) {
      copy.transform.position.keyframes = copy.transform.position.keyframes.map((kf: any) => {
        if (typeof kf.value === 'object' && kf.value !== null && 'x' in kf.value) {
          return {
            ...kf,
            value: transformPoint(kf.value.x, kf.value.y, false),
          };
        }
        return kf;
      });
    }

    // Scale geometry and typography proportionally
    if (copy.type === 'rect' && copy.rect) {
      const isFullWidthCard = isTallStory && copy.rect.width.value >= origW * 0.65;
      const newW = isFullWidthCard
        ? Math.round(targetWidth * 0.88)
        : Math.max(12, Math.round(copy.rect.width.value * geomScale));
      const newH = Math.max(8, Math.round(copy.rect.height.value * geomScale));

      copy.rect.width.value = newW;
      copy.rect.height.value = newH;

      if (copy.rect.cornerRadius?.value) {
        copy.rect.cornerRadius.value = Math.max(2, Math.round(copy.rect.cornerRadius.value * geomScale));
      }
      if (copy.rect.width.isKeyframed && copy.rect.width.keyframes) {
        copy.rect.width.keyframes = copy.rect.width.keyframes.map((kf: any) => ({
          ...kf,
          value: Math.max(12, Math.round(kf.value * geomScale)),
        }));
      }
      if (copy.rect.height.isKeyframed && copy.rect.height.keyframes) {
        copy.rect.height.keyframes = copy.rect.height.keyframes.map((kf: any) => ({
          ...kf,
          value: Math.max(8, Math.round(kf.value * geomScale)),
        }));
      }
    } else if (copy.type === 'circle' && copy.circle) {
      copy.circle.radiusX.value = Math.max(4, Math.round(copy.circle.radiusX.value * geomScale));
      copy.circle.radiusY.value = Math.max(4, Math.round(copy.circle.radiusY.value * geomScale));
    } else if (copy.type === 'star' && copy.star) {
      copy.star.outerRadius.value = Math.max(6, Math.round(copy.star.outerRadius.value * geomScale));
      copy.star.innerRadius.value = Math.max(3, Math.round(copy.star.innerRadius.value * geomScale));
    } else if (copy.type === 'polygon' && copy.polygon) {
      copy.polygon.radius.value = Math.max(6, Math.round(copy.polygon.radius.value * geomScale));
    } else if (copy.type === 'text' && copy.text) {
      const origFs = copy.text.fontSize.value;
      const minFs = isExtremeBanner ? 10 : 12;
      const newFs = Math.max(minFs, Math.round(origFs * geomScale));
      copy.text.fontSize.value = newFs;
      if (copy.text.fontSize.isKeyframed && copy.text.fontSize.keyframes) {
        copy.text.fontSize.keyframes = copy.text.fontSize.keyframes.map((kf: any) => ({
          ...kf,
          value: Math.max(minFs, Math.round(kf.value * geomScale)),
        }));
      }
      if (copy.text.letterSpacing?.value) {
        copy.text.letterSpacing.value = Math.round(copy.text.letterSpacing.value * geomScale);
      }
    } else if (copy.type === 'image' && copy.image) {
      copy.image.width.value = Math.max(20, Math.round(copy.image.width.value * geomScale));
      copy.image.height.value = Math.max(20, Math.round(copy.image.height.value * geomScale));
    }

    // Scale strokes proportionally
    if (copy.style.strokeWidth.value > 0) {
      copy.style.strokeWidth.value = Math.max(1, Math.round(copy.style.strokeWidth.value * geomScale));
    }

    return copy;
  });

  // Re-scale custom guides if any exist
  const adaptedGuides = (sourceComp.guides || []).map((g) => {
    if (g.axis === 'horizontal') {
      const p = transformPoint(0, g.position, false);
      return { ...g, position: p.y };
    } else {
      const p = transformPoint(g.position, 0, false);
      return { ...g, position: p.x };
    }
  });

  return {
    ...sourceComp,
    id: 'comp_' + Math.random().toString(36).substring(2, 9),
    width: targetWidth,
    height: targetHeight,
    layers: adaptedLayers,
    guides: adaptedGuides,
  };
}
