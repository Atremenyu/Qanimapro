import { Composition, VectorLayer, Keyframe, AnimatableProp, EasingType } from '../types';

export type TemplateCategory = 'eventos' | 'restaurantes' | 'pastelerias' | 'talleres' | 'productos' | 'servicios';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  categoryLabel: string;
  description: string;
  aspectRatio: '1:1' | '9:16' | '16:9';
  recommendedSize: string;
  tags: string[];
  composition: Composition;
}

// -------------------------------------------------------------
// HELPER BUILDERS FOR CONCISE, HIGH-PERFORMANCE TEMPLATE DEFINITIONS
// -------------------------------------------------------------

function prop<T>(value: T, keyframes?: Keyframe<T>[]): AnimatableProp<T> {
  if (keyframes && keyframes.length > 0) {
    return { value, isKeyframed: true, keyframes };
  }
  return { value, isKeyframed: false, keyframes: [] };
}

function baseLayer(
  id: string,
  name: string,
  type: VectorLayer['type'],
  colorTag: string = '#6366f1'
): Omit<VectorLayer, 'transform' | 'style'> {
  return {
    id,
    name,
    type,
    visible: true,
    locked: false,
    solo: false,
    colorTag,
    motionBlur: false,
    expandedInTimeline: false,
    modifiers: [],
  };
}

function defaultStyle(fill: string, stroke: string = 'none', strokeWidth: number = 0) {
  return {
    fill: prop(fill),
    fillOpacity: prop(100),
    fillType: (fill === 'none' ? 'none' : 'solid') as any,
    stroke: prop(stroke),
    strokeWidth: prop(strokeWidth),
    strokeOpacity: prop(stroke === 'none' ? 0 : 100),
    strokeDashArray: prop(''),
    trimStart: prop(0),
    trimEnd: prop(100),
    trimOffset: prop(0),
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
    blendMode: 'normal' as const,
    blur: prop(0),
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: prop(0),
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  };
}

function defaultTransform(x: number, y: number) {
  return {
    position: prop({ x, y }),
    scale: prop({ x: 100, y: 100 }),
    rotation: prop(0),
    opacity: prop(100),
    anchorPoint: prop({ x: 0, y: 0 }),
    skew: prop({ x: 0, y: 0 }),
  };
}

let _tkfSeed = 0;
function makeTemplateKf<T>(time: number, value: T, easing: EasingType = 'power2Out'): Keyframe<T> {
  _tkfSeed++;
  return {
    id: 'tkf_' + _tkfSeed + '_' + Math.random().toString(36).substring(2, 7),
    time: Math.max(0, +time.toFixed(3)),
    value,
    easing,
  };
}

// 1. Text & Label rising entrance from baseline with smooth fade and subtle settle
function animRise(x: number, y: number, delay = 0.2, offsetY = 45, duration = 0.65) {
  return {
    position: prop({ x, y }, [
      makeTemplateKf(0, { x, y: y + offsetY }, 'power2Out'),
      makeTemplateKf(delay, { x, y: y + offsetY }, 'power2Out'),
      makeTemplateKf(delay + duration, { x, y }, 'power2Out'),
      makeTemplateKf(3.5, { x, y }, 'linear'),
      makeTemplateKf(4.0, { x, y: y - 10 }, 'power2In'),
    ]),
    scale: prop({ x: 100, y: 100 }, [
      makeTemplateKf(0, { x: 92, y: 92 }, 'power2Out'),
      makeTemplateKf(delay, { x: 92, y: 92 }, 'power2Out'),
      makeTemplateKf(delay + duration, { x: 100, y: 100 }, 'power2Out'),
    ]),
    rotation: prop(0),
    opacity: prop(100, [
      makeTemplateKf(0, 0, 'linear'),
      makeTemplateKf(delay, 0, 'linear'),
      makeTemplateKf(delay + duration * 0.4, 100, 'power2Out'),
      makeTemplateKf(3.6, 100, 'linear'),
      makeTemplateKf(4.0, 0, 'power2In'),
    ]),
    anchorPoint: prop({ x: 0, y: 0 }),
    skew: prop({ x: 0, y: 0 }),
  };
}

// 2. Card / Bento grid / Window frame entrance with elastic pop and ambient floating hover
function animCard(x: number, y: number, delay = 0.3, offsetY = 75, duration = 0.7, hoverAmp = 8) {
  return {
    position: prop({ x, y }, [
      makeTemplateKf(0, { x, y: y + offsetY }, 'power2Out'),
      makeTemplateKf(delay, { x, y: y + offsetY }, 'power2Out'),
      makeTemplateKf(delay + duration, { x, y }, 'back'),
      makeTemplateKf(2.2, { x, y: y - hoverAmp }, 'easeInOut'),
      makeTemplateKf(3.4, { x, y }, 'easeInOut'),
      makeTemplateKf(4.0, { x, y: y + offsetY * 0.5 }, 'power2In'),
    ]),
    scale: prop({ x: 100, y: 100 }, [
      makeTemplateKf(0, { x: 88, y: 88 }, 'power2Out'),
      makeTemplateKf(delay, { x: 88, y: 88 }, 'power2Out'),
      makeTemplateKf(delay + duration, { x: 100, y: 100 }, 'back'),
    ]),
    rotation: prop(0),
    opacity: prop(100, [
      makeTemplateKf(0, 0, 'linear'),
      makeTemplateKf(delay, 0, 'linear'),
      makeTemplateKf(delay + duration * 0.35, 100, 'power2Out'),
      makeTemplateKf(3.6, 100, 'linear'),
      makeTemplateKf(4.0, 0, 'power2In'),
    ]),
    anchorPoint: prop({ x: 0, y: 0 }),
    skew: prop({ x: 0, y: 0 }),
  };
}

// 3. CTA button entrance with attention heartbeat/pulse
function animCta(x: number, y: number, delay = 0.55) {
  return {
    position: prop({ x, y }, [
      makeTemplateKf(0, { x, y: y + 35 }, 'power2Out'),
      makeTemplateKf(delay, { x, y: y + 35 }, 'power2Out'),
      makeTemplateKf(delay + 0.5, { x, y }, 'back'),
    ]),
    scale: prop({ x: 100, y: 100 }, [
      makeTemplateKf(0, { x: 0, y: 0 }, 'power2Out'),
      makeTemplateKf(delay, { x: 0, y: 0 }, 'back'),
      makeTemplateKf(delay + 0.45, { x: 108, y: 108 }, 'back'),
      makeTemplateKf(delay + 0.65, { x: 100, y: 100 }, 'power2Out'),
      makeTemplateKf(2.1, { x: 105, y: 105 }, 'power2Out'),
      makeTemplateKf(2.35, { x: 100, y: 100 }, 'power2In'),
      makeTemplateKf(3.1, { x: 105, y: 105 }, 'power2Out'),
      makeTemplateKf(3.35, { x: 100, y: 100 }, 'power2In'),
    ]),
    rotation: prop(0),
    opacity: prop(100, [
      makeTemplateKf(0, 0, 'linear'),
      makeTemplateKf(delay, 0, 'linear'),
      makeTemplateKf(delay + 0.25, 100, 'power2Out'),
    ]),
    anchorPoint: prop({ x: 0, y: 0 }),
    skew: prop({ x: 0, y: 0 }),
  };
}

// 4. Badge / Star / Chip pop in with bounce and rotation
function animBadge(x: number, y: number, delay = 0.35, rotateAngle = 0, spin = false) {
  return {
    position: prop({ x, y }),
    scale: prop({ x: 100, y: 100 }, [
      makeTemplateKf(0, { x: 0, y: 0 }, 'power2Out'),
      makeTemplateKf(delay, { x: 0, y: 0 }, 'back'),
      makeTemplateKf(delay + 0.5, { x: 114, y: 114 }, 'back'),
      makeTemplateKf(delay + 0.7, { x: 100, y: 100 }, 'power2Out'),
      makeTemplateKf(2.0, { x: 106, y: 106 }, 'easeInOut'),
      makeTemplateKf(3.2, { x: 100, y: 100 }, 'easeInOut'),
      makeTemplateKf(4.0, { x: 0, y: 0 }, 'power2In'),
    ]),
    rotation: prop(rotateAngle, [
      makeTemplateKf(0, spin ? -90 : rotateAngle - 8, 'power2Out'),
      makeTemplateKf(delay, spin ? -90 : rotateAngle - 8, 'power2Out'),
      makeTemplateKf(delay + 0.6, rotateAngle, 'back'),
      makeTemplateKf(4.0, spin ? 90 : rotateAngle + 4, 'linear'),
    ]),
    opacity: prop(100, [
      makeTemplateKf(0, 0, 'linear'),
      makeTemplateKf(delay, 0, 'linear'),
      makeTemplateKf(delay + 0.2, 100, 'power2Out'),
      makeTemplateKf(3.7, 100, 'linear'),
      makeTemplateKf(4.0, 0, 'power2In'),
    ]),
    anchorPoint: prop({ x: 0, y: 0 }),
    skew: prop({ x: 0, y: 0 }),
  };
}

// 5. Glow / Ambient orb continuous breathing
function animGlow(x: number, y: number, minScale = 85, maxScale = 120, baseOpacity = 80) {
  return {
    position: prop({ x, y }),
    scale: prop({ x: 100, y: 100 }, [
      makeTemplateKf(0, { x: minScale, y: minScale }, 'easeInOut'),
      makeTemplateKf(2.0, { x: maxScale, y: maxScale }, 'easeInOut'),
      makeTemplateKf(4.0, { x: minScale, y: minScale }, 'easeInOut'),
    ]),
    rotation: prop(0),
    opacity: prop(baseOpacity, [
      makeTemplateKf(0, baseOpacity * 0.7, 'easeInOut'),
      makeTemplateKf(2.0, baseOpacity * 1.1, 'easeInOut'),
      makeTemplateKf(4.0, baseOpacity * 0.7, 'easeInOut'),
    ]),
    anchorPoint: prop({ x: 0, y: 0 }),
    skew: prop({ x: 0, y: 0 }),
  };
}

// =============================================================
// 1. CATEGORÍA: EVENTOS Y FECHAS DEL AÑO ('eventos')
// =============================================================

// 1.1 Black Friday / Cyber Drop (1:1 Square 1080x1080)
const blackFridayComp: Composition = {
  id: 'ad_black_friday',
  name: 'Black Friday Mega Drop (Cyber Neon)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#09090b',
  layers: [
    // Kicker Top
    {
      ...baseLayer('bf_kicker', 'Tag Superior Oferta', 'text', '#a3e635'),
      transform: animRise(540, 320, 0.1, 35),
      style: defaultStyle('#a3e635'),
      text: {
        text: 'OFERTA EXCLUSIVA // TIEMPO LIMITADO',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    // Main Title
    {
      ...baseLayer('bf_title', 'Titular BLACK FRIDAY', 'text', '#ffffff'),
      transform: {
        position: prop({ x: 540, y: 440 }, [
          { id: 'bf_t_p1', time: 0, value: { x: 540, y: 380 }, easing: 'power2Out' },
          { id: 'bf_t_p2', time: 0.6, value: { x: 540, y: 440 }, easing: 'power2Out' },
          { id: 'bf_t_p3', time: 3.5, value: { x: 540, y: 440 }, easing: 'linear' },
          { id: 'bf_t_p4', time: 4.0, value: { x: 540, y: 400 }, easing: 'power2In' },
        ]),
        scale: prop({ x: 100, y: 100 }),
        rotation: prop(0),
        opacity: prop(100, [
          { id: 'bf_t_o1', time: 0, value: 0, easing: 'power2Out' },
          { id: 'bf_t_o2', time: 0.4, value: 100, easing: 'power2Out' },
          { id: 'bf_t_o3', time: 3.6, value: 100, easing: 'linear' },
          { id: 'bf_t_o4', time: 4.0, value: 0, easing: 'power2In' },
        ]),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#ffffff'),
        shadowBlur: prop(25),
        shadowColor: 'rgba(255, 255, 255, 0.4)',
      },
      text: {
        text: 'BLACK FRIDAY',
        fontSize: prop(76),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bf_star_txt', 'Texto 70% OFF', 'text', '#ffffff'),
      transform: animBadge(540, 650, 0.4, 0, true),
      style: defaultStyle('#ffffff'),
      text: {
        text: '70% OFF',
        fontSize: prop(36),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(0),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bf_cta_txt', 'Texto CTA', 'text', '#000000'),
      transform: animCta(540, 880, 0.55),
      style: defaultStyle('#000000'),
      text: {
        text: 'ACCEDER AHORA · ENVÍO GRATIS',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Discount Badge (Star)
    {
      ...baseLayer('bf_star_badge', 'Insignia Descuento Estrella', 'star', '#ec4899'),
      transform: {
        position: prop({ x: 540, y: 650 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'bf_sb_s1', time: 0, value: { x: 0, y: 0 }, easing: 'power2Out' },
          { id: 'bf_sb_s2', time: 0.7, value: { x: 100, y: 100 }, easing: 'back' },
          { id: 'bf_sb_s3', time: 2.0, value: { x: 110, y: 110 }, easing: 'easeInOut' },
          { id: 'bf_sb_s4', time: 3.4, value: { x: 100, y: 100 }, easing: 'easeInOut' },
          { id: 'bf_sb_s5', time: 4.0, value: { x: 0, y: 0 }, easing: 'power2In' },
        ]),
        rotation: prop(0, [
          { id: 'bf_sb_r1', time: 0, value: -90, easing: 'power2Out' },
          { id: 'bf_sb_r2', time: 0.8, value: 0, easing: 'power2Out' },
          { id: 'bf_sb_r3', time: 4.0, value: 45, easing: 'linear' },
        ]),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#ec4899', '#f43f5e', 3),
        shadowBlur: prop(40),
        shadowColor: 'rgba(236, 72, 153, 0.5)',
      },
      star: { points: prop(8), outerRadius: prop(110), innerRadius: prop(75) },
    },
    // CTA Button
    {
      ...baseLayer('bf_cta_bg', 'Botón CTA Lima', 'rect', '#a3e635'),
      transform: {
        position: prop({ x: 540, y: 880 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'bf_cta_s1', time: 0, value: { x: 70, y: 70 }, easing: 'power2Out' },
          { id: 'bf_cta_s2', time: 0.6, value: { x: 100, y: 100 }, easing: 'power2Out' },
          { id: 'bf_cta_s3', time: 1.8, value: { x: 106, y: 106 }, easing: 'easeInOut' },
          { id: 'bf_cta_s4', time: 3.2, value: { x: 100, y: 100 }, easing: 'easeInOut' },
          { id: 'bf_cta_s5', time: 4.0, value: { x: 70, y: 70 }, easing: 'power2In' },
        ]),
        rotation: prop(0),
        opacity: prop(100, [
          { id: 'bf_cta_o1', time: 0, value: 0, easing: 'power2Out' },
          { id: 'bf_cta_o2', time: 0.4, value: 100, easing: 'power2Out' },
          { id: 'bf_cta_o3', time: 3.5, value: 100, easing: 'linear' },
          { id: 'bf_cta_o4', time: 4.0, value: 0, easing: 'power2In' },
        ]),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#a3e635', '#bef264', 2),
        shadowBlur: prop(30),
        shadowColor: 'rgba(163, 230, 53, 0.45)',
      },
      rect: { width: prop(420), height: prop(76), cornerRadius: prop(38) },
    },
    // Background Accent Glow
    {
      ...baseLayer('bf_bg_glow', 'Resplandor Violeta Fondo', 'circle', '#8b5cf6'),
      transform: {
        position: prop({ x: 540, y: 500 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'bf_g_s1', time: 0, value: { x: 80, y: 80 }, easing: 'easeInOut' },
          { id: 'bf_g_s2', time: 2.0, value: { x: 120, y: 120 }, easing: 'easeInOut' },
          { id: 'bf_g_s3', time: 4.0, value: { x: 80, y: 80 }, easing: 'easeInOut' },
        ]),
        rotation: prop(0),
        opacity: prop(25),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#581c87'),
        blur: prop(60),
      },
      circle: { radiusX: prop(380), radiusY: prop(380) },
    },
  ],
};

// 1.2 New Year Gala / Countdown (9:16 Vertical 1080x1920)
const newYearGalaComp: Composition = {
  id: 'ad_new_year_gala',
  name: 'New Year Gala & Countdown (Gold & Midnight)',
  width: 1080,
  height: 1920,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#030712',
  layers: [
    // Main Title
    {
      ...baseLayer('ny_title', 'Titular Gran Fiesta', 'text', '#ffffff'),
      transform: animRise(540, 850, 0.25, 50),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'GALA DE AÑO NUEVO',
        fontSize: prop(52),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    // Year 2026 Big Kinetic
    {
      ...baseLayer('ny_year', 'Año 2026 Dorado', 'text', '#fbbf24'),
      transform: {
        position: prop({ x: 540, y: 1100 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'ny_y_s1', time: 0, value: { x: 60, y: 60 }, easing: 'power2Out' },
          { id: 'ny_y_s2', time: 0.8, value: { x: 100, y: 100 }, easing: 'power2Out' },
          { id: 'ny_y_s3', time: 2.0, value: { x: 105, y: 105 }, easing: 'easeInOut' },
          { id: 'ny_y_s4', time: 4.0, value: { x: 60, y: 60 }, easing: 'power2In' },
        ]),
        rotation: prop(0),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#fbbf24'),
        shadowBlur: prop(40),
        shadowColor: 'rgba(251, 191, 36, 0.6)',
      },
      text: {
        text: '2026',
        fontSize: prop(150),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(6),
        textAlign: 'center',
      },
    },
    // Date & Venue Details
    {
      ...baseLayer('ny_details', 'Detalle Fecha & Hora', 'text', '#e2e8f0'),
      transform: animRise(540, 1480, 0.45, 30),
      style: defaultStyle('#e2e8f0'),
      text: {
        text: '31 DE DICIEMBRE · 21:00 HS · GALA EXCLUSIVA',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '600',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ny_cta_txt', 'Texto Botón', 'text', '#000000'),
      transform: animCta(540, 1650, 0.65),
      style: defaultStyle('#000000'),
      text: {
        text: 'RESERVAR MESA VIP',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    // CTA Button
    {
      ...baseLayer('ny_cta_bg', 'Botón Dorado Reserva', 'rect', '#f59e0b'),
      transform: {
        position: prop({ x: 540, y: 1650 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'ny_cta_s1', time: 0, value: { x: 85, y: 85 }, easing: 'power2Out' },
          { id: 'ny_cta_s2', time: 0.7, value: { x: 100, y: 100 }, easing: 'power2Out' },
          { id: 'ny_cta_s3', time: 2.0, value: { x: 104, y: 104 }, easing: 'easeInOut' },
          { id: 'ny_cta_s4', time: 3.4, value: { x: 100, y: 100 }, easing: 'easeInOut' },
          { id: 'ny_cta_s5', time: 4.0, value: { x: 85, y: 85 }, easing: 'power2In' },
        ]),
        rotation: prop(0),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#f59e0b', '#fbbf24', 2),
        shadowBlur: prop(35),
        shadowColor: 'rgba(245, 158, 11, 0.4)',
      },
      rect: { width: prop(460), height: prop(84), cornerRadius: prop(42) },
    },
    // Golden Ring Ornament
    {
      ...baseLayer('ny_ring', 'Anillo Dorado Zen', 'circle', '#f59e0b'),
      transform: {
        position: prop({ x: 540, y: 1100 }),
        scale: prop({ x: 100, y: 100 }),
        rotation: prop(0, [
          { id: 'ny_r_r1', time: 0, value: 0, easing: 'linear' },
          { id: 'ny_r_r2', time: 4.0, value: 180, easing: 'linear' },
        ]),
        opacity: prop(35),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('none', '#f59e0b', 4),
        shadowBlur: prop(25),
        shadowColor: 'rgba(245, 158, 11, 0.5)',
      },
      circle: { radiusX: prop(320), radiusY: prop(320) },
    },
  ],
};

// 1.3 Summer Music Fest (16:9 Landscape 1920x1080)
const summerFestivalComp: Composition = {
  id: 'ad_summer_festival',
  name: 'Summer Fest Sunset Vibes (Coral & Amber)',
  width: 1920,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#1e1b4b',
  layers: [
    // Left Content Block: Title
    {
      ...baseLayer('sf_title', 'Titular Festival', 'text', '#ffffff'),
      transform: animRise(600, 480, 0.2, 50),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'SUNSET SESSIONS 2026',
        fontSize: prop(70),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'left',
      },
    },
    // Subtitle Lineup
    {
      ...baseLayer('sf_lineup', 'Lineup Artistas', 'text', '#fbbf24'),
      transform: animRise(600, 580, 0.38, 35),
      style: defaultStyle('#fbbf24'),
      text: {
        text: 'MÚSICA EN VIVO · GASTRONOMÍA · PLAYA CENTRAL · 18 AL 20 JULIO',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(1.5),
        textAlign: 'left',
      },
    },
    {
      ...baseLayer('sf_cta_txt', 'Texto Botón Entradas', 'text', '#ffffff'),
      transform: animCta(400, 720, 0.58),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'COMPRAR ENTRADAS FASE 1',
        fontSize: prop(17),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    // CTA Button
    {
      ...baseLayer('sf_cta', 'Botón Comprar Entradas', 'rect', '#f43f5e'),
      transform: animCta(400, 720, 0.58),
      style: {
        ...defaultStyle('#f43f5e', '#fb7185', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(244, 63, 94, 0.5)',
      },
      rect: { width: prop(360), height: prop(68), cornerRadius: prop(34) },
    },
    // Sunset Orb
    {
      ...baseLayer('sf_sun', 'Sol de Atardecer Coral', 'circle', '#f43f5e'),
      transform: {
        position: prop({ x: 1400, y: 540 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'sf_s_s1', time: 0, value: { x: 80, y: 80 }, easing: 'easeInOut' },
          { id: 'sf_s_s2', time: 2.0, value: { x: 110, y: 110 }, easing: 'easeInOut' },
          { id: 'sf_s_s3', time: 4.0, value: { x: 80, y: 80 }, easing: 'easeInOut' },
        ]),
        rotation: prop(0),
        opacity: prop(80),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#f43f5e'),
        shadowBlur: prop(80),
        shadowColor: 'rgba(244, 63, 94, 0.6)',
      },
      circle: { radiusX: prop(300), radiusY: prop(300) },
    },
  ],
};

// 1.4 Spooky Flash Sale / Halloween (1:1 Square 1080x1080)
const spookySaleComp: Composition = {
  id: 'ad_spooky_halloween',
  name: 'Spooky Flash Sale (Midnight Orange & Violet)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#0c0a09',
  layers: [
    // Kicker
    {
      ...baseLayer('hl_kicker', 'Subtítulo 48 Horas', 'text', '#d6d3d1'),
      transform: animRise(540, 340, 0.1, 30),
      style: defaultStyle('#d6d3d1'),
      text: {
        text: 'DESCUENTOS DE MIEDO · SOLO 48 HORAS',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    // Title
    {
      ...baseLayer('hl_title', 'Titular SPOOKY SALE', 'text', '#f97316'),
      transform: animRise(540, 440, 0.25, 45),
      style: {
        ...defaultStyle('#f97316'),
        shadowBlur: prop(30),
        shadowColor: 'rgba(249, 115, 22, 0.4)',
      },
      text: {
        text: 'SPOOKY FLASH SALE',
        fontSize: prop(68),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('hl_star_txt', 'Texto 2x1', 'text', '#ffffff'),
      transform: animBadge(540, 640, 0.4, 0, true),
      style: defaultStyle('#ffffff'),
      text: {
        text: '2X1 HOY',
        fontSize: prop(34),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(0),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('hl_cta_txt', 'Texto Botón Oferta', 'text', '#ffffff'),
      transform: animCta(540, 880, 0.6),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'EXPLORAR CATÁLOGO ➔',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Star Badge
    {
      ...baseLayer('hl_star', 'Estrella Noche Terror', 'star', '#9333ea'),
      transform: {
        position: prop({ x: 540, y: 640 }),
        scale: prop({ x: 100, y: 100 }),
        rotation: prop(0, [
          { id: 'hl_s_r1', time: 0, value: 0, easing: 'linear' },
          { id: 'hl_s_r2', time: 4.0, value: 90, easing: 'linear' },
        ]),
        opacity: prop(90),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: defaultStyle('#9333ea', '#c084fc', 3),
      star: { points: prop(6), outerRadius: prop(105), innerRadius: prop(65) },
    },
    // CTA Button
    {
      ...baseLayer('hl_cta_bg', 'Botón Naranja Halloween', 'rect', '#ea580c'),
      transform: animCta(540, 880, 0.6),
      style: {
        ...defaultStyle('#ea580c', '#fb923c', 2),
        shadowBlur: prop(30),
        shadowColor: 'rgba(234, 88, 12, 0.5)',
      },
      rect: { width: prop(400), height: prop(74), cornerRadius: prop(37) },
    },
  ],
};

// 1.5 San Valentín / Valentine Love (1:1 Square 1080x1080)
const valentineComp: Composition = {
  id: 'ad_valentine_special',
  name: 'Valentine Special (Crimson & Blush Rose)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#4c0519',
  layers: [
    {
      ...baseLayer('val_sub', 'Subtítulo San Valentín', 'text', '#fecdd3'),
      transform: animRise(540, 310, 0.1, 30),
      style: defaultStyle('#fecdd3'),
      text: {
        text: 'COLECCIÓN SAN VALENTÍN 2026',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    // Title
    {
      ...baseLayer('val_title', 'Titular Love Stories', 'text', '#ffffff'),
      transform: animRise(540, 410, 0.25, 45),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'MOMENTOS INOLVIDABLES',
        fontSize: prop(56),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('val_tag_txt', 'Texto Joyas & Regalos', 'text', '#ffffff'),
      transform: animBadge(540, 620, 0.42),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'SPECIAL GIFT\nEDITION',
        fontSize: prop(26),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('val_cta_txt', 'Texto Botón', 'text', '#000000'),
      transform: animCta(540, 870, 0.6),
      style: defaultStyle('#000000'),
      text: {
        text: 'ENCONTRAR EL REGALO IDEAL',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Center Heart Halo
    {
      ...baseLayer('val_halo', 'Halo Rosa Concéntrico', 'circle', '#e11d48'),
      transform: {
        position: prop({ x: 540, y: 620 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'val_h_s1', time: 0, value: { x: 85, y: 85 }, easing: 'easeInOut' },
          { id: 'val_h_s2', time: 2.0, value: { x: 108, y: 108 }, easing: 'easeInOut' },
          { id: 'val_h_s3', time: 4.0, value: { x: 85, y: 85 }, easing: 'easeInOut' },
        ]),
        rotation: prop(0),
        opacity: prop(85),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: defaultStyle('#e11d48', '#fda4af', 4),
      circle: { radiusX: prop(150), radiusY: prop(150) },
    },
    {
      ...baseLayer('val_cta_bg', 'Botón Regalo Especial', 'rect', '#fb7185'),
      transform: animCta(540, 870, 0.6),
      style: {
        ...defaultStyle('#fb7185', '#fda4af', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(251, 113, 133, 0.4)',
      },
      rect: { width: prop(420), height: prop(74), cornerRadius: prop(37) },
    },
  ],
};

// =============================================================
// 2. CATEGORÍA: GASTRONOMÍA & RESTAURANTES ('restaurantes')
// =============================================================

// 2.1 Gourmet Smash Burger (1:1 Square 1080x1080)
const smashBurgerComp: Composition = {
  id: 'ad_smash_burger',
  name: 'Gourmet Smash Burger Drop (Dark Kitchen)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#18181b',
  layers: [
    // Kicker
    {
      ...baseLayer('bg_kicker', 'Tag Nuevo en el Menú', 'text', '#ef4444'),
      transform: animRise(540, 360, 0.1, 30),
      style: defaultStyle('#ef4444'),
      text: {
        text: 'NUEVO LANZAMIENTO // EDICIÓN LIMITADA',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    // Main Title
    {
      ...baseLayer('bg_title', 'Titular DOUBLE SMASH', 'text', '#ffffff'),
      transform: animRise(540, 480, 0.25, 50),
      style: {
        ...defaultStyle('#ffffff'),
        shadowBlur: prop(20),
        shadowColor: 'rgba(0,0,0,0.8)',
      },
      text: {
        text: 'THE DOUBLE SMASH',
        fontSize: prop(70),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    // Subtitle
    {
      ...baseLayer('bg_sub', 'Ingredientes Premium', 'text', '#fbbf24'),
      transform: animRise(540, 560, 0.38, 30),
      style: defaultStyle('#fbbf24'),
      text: {
        text: 'CARNE ANGUS MADURADA · CHEDDAR FUNDIDO · PAN BRIOCHE',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bg_price_txt', 'Texto Precio Combo', 'text', '#ffffff'),
      transform: animBadge(540, 680, 0.45),
      style: defaultStyle('#ffffff'),
      text: {
        text: '$11.99\nCOMBO',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bg_cta_txt', 'Texto Botón Delivery', 'text', '#000000'),
      transform: animCta(540, 890, 0.65),
      style: defaultStyle('#000000'),
      text: {
        text: 'PEDIR A DOMICILIO · 25 MIN',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Price Badge
    {
      ...baseLayer('bg_price_bg', 'Fondo Badge Precio', 'circle', '#dc2626'),
      transform: {
        position: prop({ x: 540, y: 680 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'bg_pb_s1', time: 0, value: { x: 80, y: 80 }, easing: 'easeInOut' },
          { id: 'bg_pb_s2', time: 2.0, value: { x: 110, y: 110 }, easing: 'easeInOut' },
          { id: 'bg_pb_s3', time: 4.0, value: { x: 80, y: 80 }, easing: 'easeInOut' },
        ]),
        rotation: prop(0),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: defaultStyle('#dc2626', '#ef4444', 3),
      circle: { radiusX: prop(85), radiusY: prop(85) },
    },
    // CTA Button
    {
      ...baseLayer('bg_cta', 'Botón Pedir a Domicilio', 'rect', '#f59e0b'),
      transform: animCta(540, 890, 0.65),
      style: {
        ...defaultStyle('#f59e0b', '#fbbf24', 2),
        shadowBlur: prop(30),
        shadowColor: 'rgba(245, 158, 11, 0.45)',
      },
      rect: { width: prop(420), height: prop(76), cornerRadius: prop(38) },
    },
  ],
};

// 2.2 Artisan Coffee & Bakery (9:16 Vertical 1080x1920)
const artisanCoffeeComp: Composition = {
  id: 'ad_artisan_coffee',
  name: 'Artisan Specialty Coffee (Espresso & Foam)',
  width: 1080,
  height: 1920,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#1c1917',
  layers: [
    // Top Kicker
    {
      ...baseLayer('ac_kicker', 'Tag Café Especialidad', 'text', '#f59e0b'),
      transform: animRise(540, 580, 0.1, 30),
      style: defaultStyle('#f59e0b'),
      text: {
        text: 'CAFETERÍA DE ESPECIALIDAD',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    // Title
    {
      ...baseLayer('ac_title', 'Titular Morning Ritual', 'text', '#fef3c7'),
      transform: animRise(540, 720, 0.25, 45),
      style: defaultStyle('#fef3c7'),
      text: {
        text: 'MORNING RITUAL',
        fontSize: prop(64),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ac_sub', 'Subtítulo Granos Tostados', 'text', '#d6d3d1'),
      transform: animRise(540, 810, 0.38, 30),
      style: defaultStyle('#d6d3d1'),
      text: {
        text: 'GRANOS 100% ARÁBICA TOSTADOS EN CASA',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ac_cta_txt', 'Texto Botón Café', 'text', '#ffffff'),
      transform: animCta(540, 1660, 0.65),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'VER CARTA DE CAFÉS & BRUNCH',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // CTA Button
    {
      ...baseLayer('ac_cta', 'Botón Ver Carta', 'rect', '#d97706'),
      transform: animCta(540, 1660, 0.65),
      style: {
        ...defaultStyle('#d97706', '#f59e0b', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(217, 119, 6, 0.4)',
      },
      rect: { width: prop(440), height: prop(80), cornerRadius: prop(40) },
    },
    {
      ...baseLayer('ac_cup_inner', 'Crema de Café Espumosa', 'circle', '#451a03'),
      transform: {
        position: prop({ x: 540, y: 1150 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'ac_c_s1', time: 0, value: { x: 92, y: 92 }, easing: 'easeInOut' },
          { id: 'ac_c_s2', time: 2.0, value: { x: 105, y: 105 }, easing: 'easeInOut' },
          { id: 'ac_c_s3', time: 4.0, value: { x: 92, y: 92 }, easing: 'easeInOut' },
        ]),
        rotation: prop(0),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: defaultStyle('#451a03', '#fef3c7', 3),
      circle: { radiusX: prop(200), radiusY: prop(200) },
    },
    // Coffee Cup Art Graphic (Concentric Rings)
    {
      ...baseLayer('ac_cup_outer', 'Taza de Café Exterior', 'circle', '#292524'),
      transform: animCard(540, 1150, 0.45, 60),
      style: defaultStyle('#292524', '#78350f', 6),
      circle: { radiusX: prop(260), radiusY: prop(260) },
    },
  ],
};

// 2.3 Sushi & Omakase (16:9 Landscape 1920x1080)
const sushiOmakaseComp: Composition = {
  id: 'ad_sushi_omakase',
  name: 'Sushi & Omakase Experience (Zen Slate & Salmon)',
  width: 1920,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#0f172a',
  layers: [
    // Left Block: Title
    {
      ...baseLayer('su_title', 'Titular OMAKASE', 'text', '#ffffff'),
      transform: animRise(600, 460, 0.2, 50),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'OMAKASE EXPERIENCE',
        fontSize: prop(68),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'left',
      },
    },
    {
      ...baseLayer('su_sub', 'Subtítulo Pescado Fresco', 'text', '#94a3b8'),
      transform: animRise(600, 550, 0.35, 30),
      style: defaultStyle('#94a3b8'),
      text: {
        text: 'PESCADO FRESCO DE TEMPORADA · 14 PASOS DE AUTOR · RESERVA PREVIA',
        fontSize: prop(21),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '600',
        letterSpacing: prop(1.5),
        textAlign: 'left',
      },
    },
    {
      ...baseLayer('su_cta_txt', 'Texto Botón Reserva', 'text', '#ffffff'),
      transform: animCta(380, 680, 0.58),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'RESERVAR EXPERIENCIA ➔',
        fontSize: prop(17),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    // CTA Button
    {
      ...baseLayer('su_cta', 'Botón Reservar Mesa', 'rect', '#f43f5e'),
      transform: animCta(380, 680, 0.58),
      style: {
        ...defaultStyle('#f43f5e', '#fb7185', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(244, 63, 94, 0.4)',
      },
      rect: { width: prop(360), height: prop(68), cornerRadius: prop(34) },
    },
    // Zen Ring Graphic
    {
      ...baseLayer('su_zen_ring', 'Círculo Ensō Zen', 'circle', '#0f172a'),
      transform: {
        position: prop({ x: 1420, y: 540 }),
        scale: prop({ x: 100, y: 100 }),
        rotation: prop(0, [
          { id: 'su_z_r1', time: 0, value: 0, easing: 'linear' },
          { id: 'su_z_r2', time: 4.0, value: 120, easing: 'linear' },
        ]),
        opacity: prop(80),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('none', '#f43f5e', 5),
        shadowBlur: prop(30),
        shadowColor: 'rgba(244, 63, 94, 0.4)',
      },
      circle: { radiusX: prop(280), radiusY: prop(280) },
    },
  ],
};

// 2.4 Pizza 2x1 Flash Promo (1:1 Square 1080x1080)
const pizzaPromoComp: Composition = {
  id: 'ad_pizza_promo',
  name: 'Pizza Night 2x1 Flash Promo (Italian Rosso)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#991b1b',
  layers: [
    // Main Title
    {
      ...baseLayer('pz_title', 'Titular PIZZA NIGHT', 'text', '#ffffff'),
      transform: animRise(540, 420, 0.25, 45),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'PIZZA NIGHT',
        fontSize: prop(76),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('pz_sub', 'Subtítulo Horno de Leña', 'text', '#fecaca'),
      transform: animRise(540, 310, 0.1, 30),
      style: defaultStyle('#fecaca'),
      text: {
        text: 'MASA MADRE 48H · HORNO DE LEÑA ITALIANO',
        fontSize: prop(21),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('pz_badge_txt', 'Texto 2X1 HOY', 'text', '#7f1d1d'),
      transform: animBadge(540, 640, 0.45),
      style: defaultStyle('#7f1d1d'),
      text: {
        text: '2X1\nHOY',
        fontSize: prop(36),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('pz_cta_txt', 'Texto Botón', 'text', '#000000'),
      transform: animCta(540, 880, 0.65),
      style: defaultStyle('#000000'),
      text: {
        text: 'ORDENAR AHORA · ENTREGA 30M',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Promo Badge
    {
      ...baseLayer('pz_badge', 'Badge 2x1 Martes', 'circle', '#f59e0b'),
      transform: {
        position: prop({ x: 540, y: 640 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'pz_b_s1', time: 0, value: { x: 80, y: 80 }, easing: 'easeInOut' },
          { id: 'pz_b_s2', time: 2.0, value: { x: 110, y: 110 }, easing: 'easeInOut' },
          { id: 'pz_b_s3', time: 4.0, value: { x: 80, y: 80 }, easing: 'easeInOut' },
        ]),
        rotation: prop(0),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: defaultStyle('#f59e0b', '#ffffff', 4),
      circle: { radiusX: prop(110), radiusY: prop(110) },
    },
    // CTA Button
    {
      ...baseLayer('pz_cta', 'Botón Ordenar Pizza', 'rect', '#fbbf24'),
      transform: animCta(540, 880, 0.65),
      style: {
        ...defaultStyle('#fbbf24', '#fde047', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(251, 191, 36, 0.5)',
      },
      rect: { width: prop(400), height: prop(74), cornerRadius: prop(37) },
    },
  ],
};

// =============================================================
// 3. CATEGORÍA: PRODUCTOS Y E-COMMERCE ('productos')
// =============================================================

// 3.1 Velocity Sneaker Drop (9:16 Vertical 1080x1920)
const velocitySneakerComp: Composition = {
  id: 'ad_velocity_sneakers',
  name: 'Velocity Sneaker Drop (Kinetic Streetwear)',
  width: 1080,
  height: 1920,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#0a0a0c',
  layers: [
    {
      ...baseLayer('vs_tag', 'Tag Solo 300 Pares', 'text', '#a1a1aa'),
      transform: animRise(540, 560, 0.1, 30),
      style: defaultStyle('#a1a1aa'),
      text: {
        text: 'STOCK LIMITADO A 300 UNIDADES MUNDIALES',
        fontSize: prop(21),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    // Title Big
    {
      ...baseLayer('vs_title', 'Titular LIMITED DROP', 'text', '#ffffff'),
      transform: animRise(540, 680, 0.25, 50),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'VELOCITY DROP',
        fontSize: prop(68),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('vs_card_txt', 'Texto Modelo Zapatilla', 'text', '#22c55e'),
      transform: animCard(540, 1100, 0.45, 80),
      style: defaultStyle('#22c55e'),
      text: {
        text: 'AERO-X RUNNER // 2026\nSISTEMA DE AMORTIGUACIÓN NITRO',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('vs_cta_txt', 'Texto Botón Sneaker', 'text', '#000000'),
      transform: animCta(540, 1680, 0.65),
      style: defaultStyle('#000000'),
      text: {
        text: 'COMPRAR EDICIÓN LIMITADA ➔',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Sneaker Silhouette Card Mockup
    {
      ...baseLayer('vs_card_bg', 'Tarjeta Producto Sneaker', 'rect', '#18181b'),
      transform: {
        position: prop({ x: 540, y: 1100 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'vs_c_s1', time: 0, value: { x: 80, y: 80 }, easing: 'power2Out' },
          { id: 'vs_c_s2', time: 0.8, value: { x: 100, y: 100 }, easing: 'power2Out' },
          { id: 'vs_c_s3', time: 2.0, value: { x: 104, y: 104 }, easing: 'easeInOut' },
          { id: 'vs_c_s4', time: 4.0, value: { x: 80, y: 80 }, easing: 'power2In' },
        ]),
        rotation: prop(-8, [
          { id: 'vs_c_r1', time: 0, value: -16, easing: 'power2Out' },
          { id: 'vs_c_r2', time: 0.8, value: -6, easing: 'power2Out' },
          { id: 'vs_c_r3', time: 4.0, value: 4, easing: 'linear' },
        ]),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#18181b', '#22c55e', 2),
        shadowBlur: prop(50),
        shadowColor: 'rgba(34, 197, 94, 0.3)',
      },
      rect: { width: prop(640), height: prop(460), cornerRadius: prop(32) },
    },
    // CTA Button
    {
      ...baseLayer('vs_cta', 'Botón Comprar Sneaker', 'rect', '#22c55e'),
      transform: animCta(540, 1680, 0.65),
      style: {
        ...defaultStyle('#22c55e', '#4ade80', 2),
        shadowBlur: prop(35),
        shadowColor: 'rgba(34, 197, 94, 0.5)',
      },
      rect: { width: prop(460), height: prop(84), cornerRadius: prop(42) },
    },
  ],
};

// 3.2 Smartwatch Titan Pro (1:1 Square 1080x1080)
const smartwatchTechComp: Composition = {
  id: 'ad_smartwatch_titan',
  name: 'Smartwatch Titan Pro (Matte Titanium & Cyan)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#030712',
  layers: [
    // Title
    {
      ...baseLayer('sw_title', 'Titular TITAN CHRONO', 'text', '#ffffff'),
      transform: animRise(540, 420, 0.25, 45),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'TITAN CHRONO PRO',
        fontSize: prop(64),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('sw_sub', 'Subtítulo Titanio Grado 5', 'text', '#94a3b8'),
      transform: animRise(540, 320, 0.1, 30),
      style: defaultStyle('#94a3b8'),
      text: {
        text: 'TITANIO AEROESPACIAL GRADO 5 · CRISTAL ZAFIRO · ECG',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('sw_dial_txt', 'Métrica Batería 14 Días', 'text', '#06b6d4'),
      transform: animBadge(540, 640, 0.45),
      style: defaultStyle('#06b6d4'),
      text: {
        text: '14 DÍAS\nBATERÍA',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('sw_cta_txt', 'Texto Botón Reloj', 'text', '#000000'),
      transform: animCta(540, 890, 0.65),
      style: defaultStyle('#000000'),
      text: {
        text: 'ORDENAR AHORA · TITAN PRO',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Radar / Dial Rings
    {
      ...baseLayer('sw_dial_outer', 'Esfera Exterior Reloj', 'circle', '#030712'),
      transform: {
        position: prop({ x: 540, y: 640 }),
        scale: prop({ x: 100, y: 100 }),
        rotation: prop(0, [
          { id: 'sw_d_r1', time: 0, value: 0, easing: 'linear' },
          { id: 'sw_d_r2', time: 4.0, value: 360, easing: 'linear' },
        ]),
        opacity: prop(90),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: defaultStyle('none', '#06b6d4', 3),
      circle: { radiusX: prop(150), radiusY: prop(150) },
    },
    // CTA Button
    {
      ...baseLayer('sw_cta', 'Botón Comprar Reloj', 'rect', '#06b6d4'),
      transform: animCta(540, 890, 0.65),
      style: {
        ...defaultStyle('#06b6d4', '#22d3ee', 2),
        shadowBlur: prop(30),
        shadowColor: 'rgba(6, 182, 212, 0.5)',
      },
      rect: { width: prop(400), height: prop(74), cornerRadius: prop(37) },
    },
  ],
};

// 3.3 Beauty Glow Serum (9:16 Vertical 1080x1920)
const glowSkincareComp: Composition = {
  id: 'ad_glow_skincare',
  name: 'Beauty & Skincare Glow Serum (Pastel Rose)',
  width: 1080,
  height: 1920,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#fff1f2',
  layers: [
    {
      ...baseLayer('gs_sub', 'Subtítulo Cuidado de Piel', 'text', '#e11d48'),
      transform: animRise(540, 810, 0.25, 30),
      style: defaultStyle('#e11d48'),
      text: {
        text: 'DERMATOLÓGICAMENTE PROBADO · 100% VEGANO',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    // Title
    {
      ...baseLayer('gs_title', 'Titular HYDRA GLOW', 'text', '#881337'),
      transform: animRise(540, 720, 0.1, 45),
      style: defaultStyle('#881337'),
      text: {
        text: 'HYDRA GLOW SERUM',
        fontSize: prop(62),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('gs_drop_txt', 'Texto Ácido Hialurónico', 'text', '#9f1239'),
      transform: animCard(540, 1140, 0.45, 60),
      style: defaultStyle('#9f1239'),
      text: {
        text: 'ÁCIDO HIALURÓNICO\n+ VITAMINA C',
        fontSize: prop(26),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('gs_cta_txt', 'Texto Botón Belleza', 'text', '#ffffff'),
      transform: animCta(540, 1660, 0.65),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'COMPRAR SERUM ILUMINADOR',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Hydration Drop Graphic
    {
      ...baseLayer('gs_drop_outer', 'Gota de Suero Exterior', 'circle', '#ffe4e6'),
      transform: {
        position: prop({ x: 540, y: 1140 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'gs_d_s1', time: 0, value: { x: 88, y: 88 }, easing: 'easeInOut' },
          { id: 'gs_d_s2', time: 2.0, value: { x: 108, y: 108 }, easing: 'easeInOut' },
          { id: 'gs_d_s3', time: 4.0, value: { x: 88, y: 88 }, easing: 'easeInOut' },
        ]),
        rotation: prop(0),
        opacity: prop(80),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: defaultStyle('#ffe4e6', '#fb7185', 3),
      circle: { radiusX: prop(240), radiusY: prop(240) },
    },
    // CTA Button
    {
      ...baseLayer('gs_cta', 'Botón Comprar Serum', 'rect', '#fb7185'),
      transform: animCta(540, 1660, 0.65),
      style: {
        ...defaultStyle('#fb7185', '#f43f5e', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(251, 113, 133, 0.4)',
      },
      rect: { width: prop(440), height: prop(80), cornerRadius: prop(40) },
    },
  ],
};

// 3.4 Fashion Capsule Lookbook (16:9 Landscape 1920x1080)
const fashionLookbookComp: Composition = {
  id: 'ad_fashion_lookbook',
  name: 'Minimal Fashion Lookbook (Editorial Monolith)',
  width: 1920,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#f8fafc',
  layers: [
    // Left Text Block
    {
      ...baseLayer('fl_title', 'Titular ESSENTIALS', 'text', '#0f172a'),
      transform: animRise(600, 460, 0.18, 45),
      style: defaultStyle('#0f172a'),
      text: {
        text: 'ESSENTIALS 2026',
        fontSize: prop(76),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'left',
      },
    },
    {
      ...baseLayer('fl_sub', 'Subtítulo Moda Sostenible', 'text', '#64748b'),
      transform: animRise(600, 550, 0.32, 30),
      style: defaultStyle('#64748b'),
      text: {
        text: 'LÍNEAS PURAS · SILUETAS ATEMPORALES · PRODUCCIÓN ÉTICA',
        fontSize: prop(21),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '600',
        letterSpacing: prop(1.5),
        textAlign: 'left',
      },
    },
    {
      ...baseLayer('fl_frame_txt', 'Texto Colección Cápsula', 'text', '#0f172a'),
      transform: animCard(1400, 540, 0.38, 70),
      style: defaultStyle('#0f172a'),
      text: {
        text: 'EDICIÓN OTOÑO/INVIERNO\nLINO & ALGODÓN ORGÁNICO',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('fl_cta_txt', 'Texto Botón', 'text', '#ffffff'),
      transform: animCta(380, 680, 0.58),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'EXPLORAR LOOKBOOK',
        fontSize: prop(17),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    // Visual Frame
    {
      ...baseLayer('fl_frame', 'Marco Editorial Ropa', 'rect', '#f1f5f9'),
      transform: animCard(1400, 540, 0.38, 70),
      style: defaultStyle('#f1f5f9', '#cbd5e1', 2),
      rect: { width: prop(500), height: prop(650), cornerRadius: prop(24) },
    },
    // CTA Button
    {
      ...baseLayer('fl_cta', 'Botón Ver Colección', 'rect', '#0f172a'),
      transform: animCta(380, 680, 0.58),
      style: defaultStyle('#0f172a'),
      rect: { width: prop(340), height: prop(64), cornerRadius: prop(32) },
    },
  ],
};

// =============================================================
// 4. CATEGORÍA: SERVICIOS Y NEGOCIOS ('servicios')
// =============================================================

// 4.1 Real Estate Luxury Home Tour (1:1 Square 1080x1080)
const realEstateComp: Composition = {
  id: 'ad_real_estate_luxury',
  name: 'Real Estate Luxury Villa (Prestige Navy & Brass)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#0f172a',
  layers: [
    {
      ...baseLayer('re_kicker', 'Tag Propiedad Exclusiva', 'text', '#f59e0b'),
      transform: animRise(540, 360, 0.1, 30),
      style: defaultStyle('#f59e0b'),
      text: {
        text: 'PROPIEDAD DE LUJO // OPEN HOUSE ESTE SÁBADO',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(2.5),
        textAlign: 'center',
      },
    },
    // Title
    {
      ...baseLayer('re_title', 'Titular VILLA HORIZONTE', 'text', '#ffffff'),
      transform: animRise(540, 460, 0.25, 45),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'VILLA HORIZONTE',
        fontSize: prop(66),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('re_card_txt', 'Texto Habitaciones Baños', 'text', '#e2e8f0'),
      transform: animCard(540, 680, 0.42, 60),
      style: defaultStyle('#e2e8f0'),
      text: {
        text: '4 HABITACIONES · 5 BAÑOS · 480 M²\nPISCINA INFINITY & VISTAS PANORÁMICAS',
        fontSize: prop(21),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('re_cta_txt', 'Texto Botón Visita', 'text', '#000000'),
      transform: animCta(540, 890, 0.62),
      style: defaultStyle('#000000'),
      text: {
        text: 'AGENDAR VISITA PRIVADA ➔',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Metrics Card
    {
      ...baseLayer('re_card', 'Tarjeta Especificaciones', 'rect', '#1e293b'),
      transform: animCard(540, 680, 0.42, 60),
      style: defaultStyle('#1e293b', '#334155', 2),
      rect: { width: prop(620), height: prop(130), cornerRadius: prop(20) },
    },
    // CTA Button
    {
      ...baseLayer('re_cta', 'Botón Agendar Visita', 'rect', '#f59e0b'),
      transform: animCta(540, 890, 0.62),
      style: {
        ...defaultStyle('#f59e0b', '#fbbf24', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(245, 158, 11, 0.45)',
      },
      rect: { width: prop(420), height: prop(74), cornerRadius: prop(37) },
    },
  ],
};

// 4.2 High-Intensity Fitness & Gym Club (9:16 Vertical 1080x1920)
const fitnessClubComp: Composition = {
  id: 'ad_fitness_club',
  name: 'Fitness & Gym Club (Hyper Lime & Charcoal)',
  width: 1080,
  height: 1920,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#18181b',
  layers: [
    // Title
    {
      ...baseLayer('fc_title', 'Titular REVOLUTION FITNESS', 'text', '#ffffff'),
      transform: animRise(540, 750, 0.25, 55),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'TRANSFORMA\nTU CUERPO',
        fontSize: prop(72),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('fc_sub', 'Subtítulo Disciplinas', 'text', '#a1a1aa'),
      transform: animRise(540, 600, 0.1, 30),
      style: defaultStyle('#a1a1aa'),
      text: {
        text: 'CROSSFIT · BOXEO · ZONA DE RECUPERACIÓN',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('fc_badge_txt', 'Texto Oferta Matrícula', 'text', '#a3e635'),
      transform: animBadge(540, 1200, 0.45),
      style: defaultStyle('#a3e635'),
      text: {
        text: '50% DE DESCUENTO\nEN TU PRIMER MES\n+ MATRÍCULA BONIFICADA',
        fontSize: prop(28),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('fc_cta_txt', 'Texto Botón Gym', 'text', '#000000'),
      transform: animCta(540, 1680, 0.65),
      style: defaultStyle('#000000'),
      text: {
        text: 'INICIAR PRUEBA GRATIS · 7 DÍAS',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Promo Badge 50%
    {
      ...baseLayer('fc_badge', 'Badge 50% Primer Mes', 'rect', '#27272a'),
      transform: animBadge(540, 1200, 0.45),
      style: defaultStyle('#27272a', '#a3e635', 3),
      rect: { width: prop(560), height: prop(240), cornerRadius: prop(28) },
    },
    // CTA Button
    {
      ...baseLayer('fc_cta', 'Botón Prueba Gratis', 'rect', '#a3e635'),
      transform: animCta(540, 1680, 0.65),
      style: {
        ...defaultStyle('#a3e635', '#bef264', 2),
        shadowBlur: prop(35),
        shadowColor: 'rgba(163, 230, 53, 0.5)',
      },
      rect: { width: prop(460), height: prop(84), cornerRadius: prop(42) },
    },
  ],
};

// 4.3 Creative Agency Showreel (16:9 Landscape 1920x1080)
const creativeAgencyComp: Composition = {
  id: 'ad_creative_agency',
  name: 'Creative Agency Showreel (Swiss Cobalt & Black)',
  width: 1920,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#000000',
  layers: [
    // Left Content
    {
      ...baseLayer('ca_title', 'Titular CREATIVIDAD', 'text', '#ffffff'),
      transform: animRise(600, 460, 0.15, 50),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'DISEÑO QUE IMPACTA',
        fontSize: prop(72),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'left',
      },
    },
    {
      ...baseLayer('ca_sub', 'Subtítulo Branding & 3D', 'text', '#94a3b8'),
      transform: animRise(600, 550, 0.3, 30),
      style: defaultStyle('#94a3b8'),
      text: {
        text: 'BRANDING · MOTION GRAPHICS · PUBLICIDAD DIGITAL 3D',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(2),
        textAlign: 'left',
      },
    },
    {
      ...baseLayer('ca_card_txt', 'Texto Proyectos de Marca', 'text', '#38bdf8'),
      transform: animCard(1400, 540, 0.4, 70),
      style: defaultStyle('#38bdf8'),
      text: {
        text: 'MÁS DE 120 PROYECTOS\nPREMIADOS EN 2025/2026',
        fontSize: prop(26),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ca_cta_txt', 'Texto Botón Reel', 'text', '#ffffff'),
      transform: animCta(360, 680, 0.6),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'VER NUESTRO REEL ➔',
        fontSize: prop(17),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    // Visual Geometric Monolith
    {
      ...baseLayer('ca_card', 'Tarjeta Showreel', 'rect', '#111827'),
      transform: animCard(1400, 540, 0.4, 70),
      style: defaultStyle('#111827', '#2563eb', 3),
      rect: { width: prop(540), height: prop(600), cornerRadius: prop(24) },
    },
    // CTA Button
    {
      ...baseLayer('ca_cta', 'Botón Ver Reel', 'rect', '#2563eb'),
      transform: animCta(360, 680, 0.6),
      style: {
        ...defaultStyle('#2563eb', '#3b82f6', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(37, 99, 235, 0.5)',
      },
      rect: { width: prop(320), height: prop(64), cornerRadius: prop(32) },
    },
  ],
};

// 4.4 SaaS B2B Cloud Platform (1:1 Square 1080x1080)
const saasPlatformComp: Composition = {
  id: 'ad_saas_cloud',
  name: 'SaaS B2B Cloud Platform (Deep Indigo & Metrics)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#0b0f19',
  layers: [
    {
      ...baseLayer('sc_kicker', 'Tag B2B Cloud', 'text', '#6366f1'),
      transform: animRise(540, 340, 0.1, 30),
      style: defaultStyle('#6366f1'),
      text: {
        text: 'INFRAESTRUCTURA CLOUD PARA EMPRESAS MODERNAS',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    // Title
    {
      ...baseLayer('sc_title', 'Titular ESCALA TU NUBE', 'text', '#ffffff'),
      transform: animRise(540, 450, 0.25, 50),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'ESCALA SIN LÍMITES',
        fontSize: prop(68),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('sc_card_txt', 'Texto Rendimiento 99.99%', 'text', '#818cf8'),
      transform: animCard(540, 670, 0.42, 60),
      style: defaultStyle('#818cf8'),
      text: {
        text: '300% MÁS RÁPIDO QUE LA COMPETENCIA\n99.99% DISPONIBILIDAD GARANTIZADA',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('sc_cta_txt', 'Texto Botón SaaS', 'text', '#ffffff'),
      transform: animCta(540, 890, 0.62),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'COMENZAR DEMO GRATUITA',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Live Metric Badge
    {
      ...baseLayer('sc_card', 'Tarjeta Métricas 300%', 'rect', '#1e1b4b'),
      transform: animCard(540, 670, 0.42, 60),
      style: defaultStyle('#1e1b4b', '#4f46e5', 2),
      rect: { width: prop(580), height: prop(140), cornerRadius: prop(24) },
    },
    // CTA Button
    {
      ...baseLayer('sc_cta', 'Botón Comenzar Demo', 'rect', '#4f46e5'),
      transform: animCta(540, 890, 0.62),
      style: {
        ...defaultStyle('#4f46e5', '#6366f1', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(79, 70, 229, 0.45)',
      },
      rect: { width: prop(400), height: prop(74), cornerRadius: prop(37) },
    },
  ],
};

// =============================================================
// 5. NUEVAS PLANTILLAS VIRALES & GSAP KINETIC (INSPIRADAS EN EL VIDEO Y KHANH NGUYEN)
// =============================================================

// 5.1 AI Creator & Studio Showcase (Estilo Directo del Video del Usuario)
const aiCreatorShowcaseComp: Composition = {
  id: 'ad_ai_creator_showcase',
  name: 'AI Creator Showcase (Viral Video Style)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#041f17',
  layers: [
    // Top Kicker
    {
      ...baseLayer('ai_kicker', 'Tag Superior Studio', 'text', '#86efac'),
      transform: animRise(540, 240, 0.1, 30),
      style: defaultStyle('#86efac'),
      text: {
        text: '• XITANG · AI VIDEO •',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    // Headline Line 1
    {
      ...baseLayer('ai_title_l1', 'Titular Línea 1', 'text', '#ffffff'),
      transform: {
        position: prop({ x: 540, y: 360 }, [
          { id: 'ai_t1_p1', time: 0, value: { x: 540, y: 400 }, easing: 'power2Out' },
          { id: 'ai_t1_p2', time: 0.5, value: { x: 540, y: 360 }, easing: 'power2Out' },
          { id: 'ai_t1_p3', time: 3.5, value: { x: 540, y: 360 }, easing: 'linear' },
          { id: 'ai_t1_p4', time: 4.0, value: { x: 540, y: 320 }, easing: 'power2In' },
        ]),
        scale: prop({ x: 100, y: 100 }),
        rotation: prop(0),
        opacity: prop(100, [
          { id: 'ai_t1_o1', time: 0, value: 0, easing: 'power2Out' },
          { id: 'ai_t1_o2', time: 0.35, value: 100, easing: 'power2Out' },
          { id: 'ai_t1_o3', time: 3.6, value: 100, easing: 'linear' },
          { id: 'ai_t1_o4', time: 4.0, value: 0, easing: 'power2In' },
        ]),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: defaultStyle('#ffffff'),
      text: {
        text: 'DE CREAR CÓDIGO,',
        fontSize: prop(52),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    // Headline Line 2
    {
      ...baseLayer('ai_title_l2', 'Titular Línea 2', 'text', '#ffffff'),
      transform: animRise(540, 460, 0.32, 45),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'A CREAR Y EMPRENDER',
        fontSize: prop(50),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ai_win_card1_txt', 'Texto Tarjeta Interna', 'text', '#86efac'),
      transform: animCard(400, 740, 0.5, 90, 0.75),
      style: defaultStyle('#86efac'),
      text: {
        text: 'Producción Digital · Guiones IA\nIngeniería Creativa · Alto Rendimiento',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ai_win_card2_txt', 'Insignia Estudio Creativo', 'text', '#ffffff'),
      transform: animCard(700, 740, 0.62, 90, 0.75),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'ESTUDIO\nCREATIVO 2026',
        fontSize: prop(16),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Bottom Tracker Bar
    {
      ...baseLayer('ai_tracker', 'Tracker Inferior URL', 'text', '#6ee7b7'),
      transform: animRise(540, 995, 0.8, 20),
      style: defaultStyle('#6ee7b7'),
      text: {
        text: 'CREATIVOS.PRO · AGENCIA DIGITAL',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(2.5),
        textAlign: 'center',
      },
    },
    // Highlight Box (Lime Green Highlight under key characters)
    {
      ...baseLayer('ai_hl_box', 'Highlight Box Verde Lima', 'rect', '#22c55e'),
      transform: {
        position: prop({ x: 420, y: 460 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'ai_hl_s1', time: 0, value: { x: 0, y: 100 }, easing: 'power2Out' },
          { id: 'ai_hl_s2', time: 0.6, value: { x: 100, y: 100 }, easing: 'power2Out' },
          { id: 'ai_hl_s3', time: 3.5, value: { x: 100, y: 100 }, easing: 'linear' },
          { id: 'ai_hl_s4', time: 4.0, value: { x: 0, y: 100 }, easing: 'power2In' },
        ]),
        rotation: prop(0),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#22c55e'),
        shadowBlur: prop(25),
        shadowColor: 'rgba(34, 197, 94, 0.45)',
      },
      rect: { width: prop(250), height: prop(74), cornerRadius: prop(10) },
    },
    // Window Card Internal Left
    {
      ...baseLayer('ai_win_card1', 'Tarjeta Interna Artículos', 'rect', '#144636'),
      transform: animCard(400, 740, 0.5, 90, 0.75),
      style: defaultStyle('#144636', '#22c55e', 1),
      rect: { width: prop(300), height: prop(200), cornerRadius: prop(14) },
    },
    // Window Card Internal Right (Preview)
    {
      ...baseLayer('ai_win_card2', 'Tarjeta Interna Avatar', 'rect', '#185642'),
      transform: animCard(700, 740, 0.62, 90, 0.75),
      style: defaultStyle('#185642', '#34d399', 1),
      rect: { width: prop(220), height: prop(200), cornerRadius: prop(14) },
    },
    // Window Controls (Traffic Lights)
    {
      ...baseLayer('ai_dot_red', 'Botón Rojo macOS', 'circle', '#ef4444'),
      transform: animCard(220, 600, 0.35, 120, 0.85),
      style: defaultStyle('#ef4444'),
      circle: { radiusX: prop(7), radiusY: prop(7) },
    },
    {
      ...baseLayer('ai_dot_yel', 'Botón Amarillo macOS', 'circle', '#eab308'),
      transform: animCard(242, 600, 0.37, 120, 0.85),
      style: defaultStyle('#eab308'),
      circle: { radiusX: prop(7), radiusY: prop(7) },
    },
    {
      ...baseLayer('ai_dot_grn', 'Botón Verde macOS', 'circle', '#22c55e'),
      transform: animCard(264, 600, 0.39, 120, 0.85),
      style: defaultStyle('#22c55e'),
      circle: { radiusX: prop(7), radiusY: prop(7) },
    },
    // Floating macOS Browser Window
    {
      ...baseLayer('ai_browser_bg', 'Ventana Navegador macOS', 'rect', '#0a3528'),
      transform: {
        position: prop({ x: 540, y: 750 }, [
          { id: 'ai_bw_p1', time: 0, value: { x: 540, y: 880 }, easing: 'power2Out' },
          { id: 'ai_bw_p2', time: 0.85, value: { x: 540, y: 750 }, easing: 'power2Out' },
          { id: 'ai_bw_p3', time: 2.2, value: { x: 540, y: 742 }, easing: 'easeInOut' },
          { id: 'ai_bw_p4', time: 3.5, value: { x: 540, y: 750 }, easing: 'easeInOut' },
          { id: 'ai_bw_p5', time: 4.0, value: { x: 540, y: 880 }, easing: 'power2In' },
        ]),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'ai_bw_s1', time: 0, value: { x: 88, y: 88 }, easing: 'power2Out' },
          { id: 'ai_bw_s2', time: 0.85, value: { x: 100, y: 100 }, easing: 'power2Out' },
          { id: 'ai_bw_s3', time: 3.5, value: { x: 100, y: 100 }, easing: 'linear' },
          { id: 'ai_bw_s4', time: 4.0, value: { x: 88, y: 88 }, easing: 'power2In' },
        ]),
        rotation: prop(0, [
          { id: 'ai_bw_r1', time: 0, value: -3, easing: 'power2Out' },
          { id: 'ai_bw_r2', time: 0.85, value: 0, easing: 'power2Out' },
          { id: 'ai_bw_r3', time: 4.0, value: 0, easing: 'linear' },
        ]),
        opacity: prop(100, [
          { id: 'ai_bw_o1', time: 0, value: 0, easing: 'power2Out' },
          { id: 'ai_bw_o2', time: 0.4, value: 100, easing: 'power2Out' },
          { id: 'ai_bw_o3', time: 3.6, value: 100, easing: 'linear' },
          { id: 'ai_bw_o4', time: 4.0, value: 0, easing: 'power2In' },
        ]),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#0a3528', '#166534', 2),
        shadowBlur: prop(45),
        shadowColor: 'rgba(4, 31, 23, 0.8)',
      },
      rect: { width: prop(720), height: prop(360), cornerRadius: prop(20) },
    },
  ],
};

// 5.2 Bento Grid 4-Pillar Services (Escena 02 del Video - 9:16 Vertical 1080x1920)
const bentoServicesCascadeComp: Composition = {
  id: 'ad_bento_services_cascade',
  name: 'Bento Grid 4-Pillar Services (Video Scene 02)',
  width: 1080,
  height: 1920,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#05231a',
  layers: [
    // Kicker
    {
      ...baseLayer('bs_kicker', 'Tag Seccion 02', 'text', '#86efac'),
      transform: animRise(540, 560, 0.1, 30),
      style: defaultStyle('#86efac'),
      text: {
        text: '• 02 · WORK WITH ME •',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    // Title
    {
      ...baseLayer('bs_title', 'Titular Cuatro Negocios', 'text', '#ffffff'),
      transform: animRise(540, 680, 0.25, 45),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'Cuatro Servicios, Una Estrategia Completa',
        fontSize: prop(52),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bs_card1_txt', 'Texto Tarjeta 01', 'text', '#a3e635'),
      transform: animCard(540, 910, 0.4, 90, 0.7),
      style: defaultStyle('#a3e635'),
      text: {
        text: '01  Alianzas & Medios  ·  Casos de Éxito · Contenido Digital',
        fontSize: prop(23),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bs_card2_txt', 'Texto Tarjeta 02', 'text', '#ffffff'),
      transform: animCard(540, 1080, 0.55, 90, 0.7),
      style: defaultStyle('#ffffff'),
      text: {
        text: '02  Capacitación Práctica  ·  Talleres · Masterclasses · Equipos',
        fontSize: prop(23),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bs_card3_txt', 'Texto Tarjeta 03', 'text', '#ffffff'),
      transform: animCard(540, 1250, 0.7, 90, 0.7),
      style: defaultStyle('#ffffff'),
      text: {
        text: '03  Consultoría Estratégica  ·  Sesiones 1 a 1 · Empresas',
        fontSize: prop(23),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bs_card4_txt', 'Texto Tarjeta 04', 'text', '#ffffff'),
      transform: animCard(540, 1420, 0.85, 90, 0.7),
      style: defaultStyle('#ffffff'),
      text: {
        text: '04  Producción Audiovisual  ·  Comerciales · Spots · Animación',
        fontSize: prop(23),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bs_summary_txt', 'Texto Barra Resumen', 'text', '#86efac'),
      transform: animCard(540, 1680, 1.0, 70, 0.65),
      style: defaultStyle('#86efac'),
      text: {
        text: 'Alianzas Estratégicas · Capacitación · Asesoría · Audiovisual',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Bento Card 01: Alianzas (Active Lime Focus)
    {
      ...baseLayer('bs_card1', 'Tarjeta 01 Alianzas', 'rect', '#124c3a'),
      transform: animCard(540, 910, 0.4, 90, 0.7),
      style: {
        ...defaultStyle('#124c3a', '#a3e635', 2),
        shadowBlur: prop(30),
        shadowColor: 'rgba(163, 230, 53, 0.35)',
      },
      rect: { width: prop(780), height: prop(130), cornerRadius: prop(18) },
    },
    // Bento Card 02: Capacitación
    {
      ...baseLayer('bs_card2', 'Tarjeta 02 Capacitación', 'rect', '#0c382b'),
      transform: animCard(540, 1080, 0.55, 90, 0.7),
      style: defaultStyle('#0c382b', '#166534', 2),
      rect: { width: prop(780), height: prop(130), cornerRadius: prop(18) },
    },
    // Bento Card 03: Asesoría
    {
      ...baseLayer('bs_card3', 'Tarjeta 03 Asesoría', 'rect', '#0c382b'),
      transform: animCard(540, 1250, 0.7, 90, 0.7),
      style: defaultStyle('#0c382b', '#166534', 2),
      rect: { width: prop(780), height: prop(130), cornerRadius: prop(18) },
    },
    // Bento Card 04: Producción
    {
      ...baseLayer('bs_card4', 'Tarjeta 04 Producción', 'rect', '#0c382b'),
      transform: animCard(540, 1420, 0.85, 90, 0.7),
      style: defaultStyle('#0c382b', '#166534', 2),
      rect: { width: prop(780), height: prop(130), cornerRadius: prop(18) },
    },
    // Bottom Summary
    {
      ...baseLayer('bs_summary', 'Barra Resumen Inferior', 'rect', '#093627'),
      transform: animCard(540, 1680, 1.0, 70, 0.65),
      style: {
        ...defaultStyle('#093627', '#22c55e', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(34, 197, 94, 0.4)',
      },
      rect: { width: prop(780), height: prop(70), cornerRadius: prop(35) },
    },
  ],
};

// 5.3 Metric Counters Showcase (Escena 03 del Video - 1080x1080)
const metricImpactCountersComp: Composition = {
  id: 'ad_metric_impact_counters',
  name: 'Métricas de Impacto 45·24·12 (Resultados Reales)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#06281e',
  layers: [
    // Kicker
    {
      ...baseLayer('mc_kicker', 'Tag Seccion 03', 'text', '#86efac'),
      transform: animRise(540, 260, 0.1, 30),
      style: defaultStyle('#86efac'),
      text: {
        text: '• 03 · CASOS DE ÉXITO •',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    // Title Line 1
    {
      ...baseLayer('mc_title1', 'Titular Línea 1', 'text', '#ffffff'),
      transform: animRise(540, 380, 0.22, 40),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'Metodología Real,',
        fontSize: prop(60),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    // Title Line 2
    {
      ...baseLayer('mc_title2', 'Titular Línea 2', 'text', '#ffffff'),
      transform: animRise(540, 480, 0.32, 40),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'Resultados Visibles',
        fontSize: prop(60),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    // Metric 1: 45 (Proyectos Entregados)
    {
      ...baseLayer('mc_num1', 'Número 45', 'text', '#ffffff'),
      transform: animBadge(280, 700, 0.45),
      style: defaultStyle('#ffffff'),
      text: {
        text: '45',
        fontSize: prop(108),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mc_lbl1', 'Label Proyectos', 'text', '#6ee7b7'),
      transform: animRise(280, 790, 0.55, 30),
      style: defaultStyle('#6ee7b7'),
      text: {
        text: 'Proyectos de Alto Impacto',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    // Metric 2: 24 (Mil Vistas Orgánicas - Lime Green Accent)
    {
      ...baseLayer('mc_num2', 'Número 24 Lima', 'text', '#a3e635'),
      transform: animBadge(540, 700, 0.6),
      style: {
        ...defaultStyle('#a3e635'),
        shadowBlur: prop(30),
        shadowColor: 'rgba(163, 230, 53, 0.4)',
      },
      text: {
        text: '24',
        fontSize: prop(108),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mc_lbl2', 'Label Alcance', 'text', '#a3e635'),
      transform: animRise(540, 790, 0.68, 30),
      style: defaultStyle('#a3e635'),
      text: {
        text: 'Mil Vistas Orgánicas',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    // Metric 3: 12 (Marcas Aliadas)
    {
      ...baseLayer('mc_num3', 'Número 12', 'text', '#ffffff'),
      transform: animBadge(800, 700, 0.75),
      style: defaultStyle('#ffffff'),
      text: {
        text: '12',
        fontSize: prop(108),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mc_lbl3', 'Label Marcas', 'text', '#6ee7b7'),
      transform: animRise(800, 790, 0.82, 30),
      style: defaultStyle('#6ee7b7'),
      text: {
        text: 'Marcas Internacionales',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mc_brands_txt', 'Texto Marcas Aliadas', 'text', '#86efac'),
      transform: animCard(540, 940, 0.95, 50, 0.6),
      style: defaultStyle('#86efac'),
      text: {
        text: 'Adobe · Figma · Google · Spotify · Vercel · Shopify',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Brand Partner Chips Row
    {
      ...baseLayer('mc_brands_bg', 'Fondo Chips Marcas', 'rect', '#093627'),
      transform: animCard(540, 940, 0.95, 50, 0.6),
      style: defaultStyle('#093627', '#166534', 1.5),
      rect: { width: prop(760), height: prop(64), cornerRadius: prop(32) },
    },
  ],
};

// 5.4 Khanh Nguyen Style Kinetic Typo & Split Reveal (16:9 Landscape 1920x1080)
const khanhNguyenEditorialComp: Composition = {
  id: 'ad_khanhnguyen_editorial',
  name: 'Khanh Nguyen Kinetic Typo (Split & Stretch)',
  width: 1920,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#000000',
  layers: [
    // Top Kicker
    {
      ...baseLayer('kn_kicker', 'Tag Khanh Nguyen', 'text', '#71717a'),
      transform: animRise(620, 320, 0.1, 30),
      style: defaultStyle('#71717a'),
      text: {
        text: 'KHANHNGUYEN.DESIGN // CRAFT & CODE',
        fontSize: prop(21),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(5),
        textAlign: 'left',
      },
    },
    {
      ...baseLayer('kn_title_l1', 'Titular INTERACTION', 'text', '#ffffff'),
      transform: {
        position: prop({ x: 620, y: 440 }, [
          { id: 'kn_t1_p1', time: 0, value: { x: 620, y: 510 }, easing: 'power2Out' },
          { id: 'kn_t1_p2', time: 0.55, value: { x: 620, y: 440 }, easing: 'power2Out' },
          { id: 'kn_t1_p3', time: 3.5, value: { x: 620, y: 440 }, easing: 'linear' },
          { id: 'kn_t1_p4', time: 4.0, value: { x: 620, y: 390 }, easing: 'power2In' },
        ]),
        scale: prop({ x: 100, y: 100 }),
        rotation: prop(0),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: defaultStyle('#ffffff'),
      text: {
        text: 'DIGITAL INTERACTION',
        fontSize: prop(76),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(4),
        textAlign: 'left',
      },
    },
    // Main Kinetic Headline (Split Baseline Stretch)
    {
      ...baseLayer('kn_title_l2', 'Titular MOTION DESIGN', 'text', '#22c55e'),
      transform: {
        position: prop({ x: 620, y: 550 }, [
          { id: 'kn_t2_p1', time: 0, value: { x: 620, y: 620 }, easing: 'power2Out' },
          { id: 'kn_t2_p2', time: 0.7, value: { x: 620, y: 550 }, easing: 'power2Out' },
          { id: 'kn_t2_p3', time: 3.5, value: { x: 620, y: 550 }, easing: 'linear' },
          { id: 'kn_t2_p4', time: 4.0, value: { x: 620, y: 490 }, easing: 'power2In' },
        ]),
        scale: prop({ x: 100, y: 100 }),
        rotation: prop(0),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: defaultStyle('#22c55e'),
      text: {
        text: '& MOTION DESIGN',
        fontSize: prop(76),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(4),
        textAlign: 'left',
      },
    },
    {
      ...baseLayer('kn_card_txt', 'Texto Tarjeta Arte Digital', 'text', '#a1a1aa'),
      transform: animCard(1420, 540, 0.4, 75, 0.7),
      style: defaultStyle('#a1a1aa'),
      text: {
        text: 'INTERACTIVE DESIGN\n& MOTION ARCHITECTURE\nEST. 2026 // HO CHI MINH',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('kn_cta_txt', 'Texto Botón Portfolio', 'text', '#000000'),
      transform: animCta(360, 760, 0.65),
      style: defaultStyle('#000000'),
      text: {
        text: 'VIEW SELECTED WORKS ➔',
        fontSize: prop(17),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    // Right Floating Monolith Frame (Interactive Card Mockup)
    {
      ...baseLayer('kn_card_bg', 'Marco Flotante Avant-Garde', 'rect', '#09090b'),
      transform: {
        position: prop({ x: 1420, y: 540 }),
        scale: prop({ x: 100, y: 100 }, [
          { id: 'kn_c_s1', time: 0, value: { x: 90, y: 90 }, easing: 'power2Out' },
          { id: 'kn_c_s2', time: 0.9, value: { x: 100, y: 100 }, easing: 'power2Out' },
          { id: 'kn_c_s3', time: 3.5, value: { x: 100, y: 100 }, easing: 'linear' },
          { id: 'kn_c_s4', time: 4.0, value: { x: 90, y: 90 }, easing: 'power2In' },
        ]),
        rotation: prop(-3, [
          { id: 'kn_c_r1', time: 0, value: -6, easing: 'power2Out' },
          { id: 'kn_c_r2', time: 0.9, value: -2, easing: 'power2Out' },
          { id: 'kn_c_r3', time: 4.0, value: 2, easing: 'linear' },
        ]),
        opacity: prop(100),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#09090b', '#27272a', 2),
        shadowBlur: prop(50),
        shadowColor: 'rgba(255, 255, 255, 0.1)',
      },
      rect: { width: prop(540), height: prop(620), cornerRadius: prop(28) },
    },
    // CTA Button
    {
      ...baseLayer('kn_cta', 'Botón Ver Portfolio', 'rect', '#ffffff'),
      transform: animCta(360, 760, 0.65),
      style: defaultStyle('#ffffff'),
      rect: { width: prop(320), height: prop(68), cornerRadius: prop(34) },
    },
  ],
};

// 5.5 DrawSVG Cyber Wireframe & Tech Reveal (1:1 Square 1080x1080)
const drawSvgGlowTechComp: Composition = {
  id: 'ad_draw_svg_glow_tech',
  name: 'DrawSVG Cyber Wireframe & Tech Reveal',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#050814',
  layers: [
    {
      ...baseLayer('ds_kicker', 'Tag GSAP DrawSVG', 'text', '#818cf8'),
      transform: animRise(540, 300, 0.1, 30),
      style: defaultStyle('#818cf8'),
      text: {
        text: 'GSAP MOTION // VECTOR SHAPE DYNAMICS',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    // Title
    {
      ...baseLayer('ds_title', 'Titular CYBER SYSTEM', 'text', '#ffffff'),
      transform: animRise(540, 410, 0.25, 45),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'CYBER VECTOR ENGINE',
        fontSize: prop(64),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ds_frame_txt', 'Texto Wireframe Specs', 'text', '#38bdf8'),
      transform: animCard(540, 620, 0.4, 60, 0.7),
      style: defaultStyle('#38bdf8'),
      text: {
        text: 'DRAWSVG PROTOCOL // REAL-TIME\n60 FPS VECTOR TRACE ACCELERATION',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(2.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ds_cta_txt', 'Texto Botón', 'text', '#000000'),
      transform: animCta(540, 890, 0.62),
      style: defaultStyle('#000000'),
      text: {
        text: 'EXPLORAR ECOSISTEMA ➔',
        fontSize: prop(18),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    // DrawSVG Animated Frame (trimEnd keyframes simulating DrawSVG plugin)
    {
      ...baseLayer('ds_frame', 'Marco DrawSVG Animado', 'rect', 'none'),
      transform: animCard(540, 620, 0.4, 60, 0.7),
      style: {
        ...defaultStyle('none', '#06b6d4', 4),
        trimEnd: prop(100, [
          { id: 'ds_f_t1', time: 0, value: 0, easing: 'easeInOut' },
          { id: 'ds_f_t2', time: 1.4, value: 100, easing: 'easeInOut' },
          { id: 'ds_f_t3', time: 3.5, value: 100, easing: 'linear' },
          { id: 'ds_f_t4', time: 4.0, value: 0, easing: 'power2In' },
        ]),
        shadowBlur: prop(25),
        shadowColor: 'rgba(6, 182, 212, 0.6)',
      },
      rect: { width: prop(580), height: prop(240), cornerRadius: prop(24) },
    },
    // CTA Button
    {
      ...baseLayer('ds_cta', 'Botón Lanzamiento Tech', 'rect', '#06b6d4'),
      transform: animCta(540, 890, 0.62),
      style: {
        ...defaultStyle('#06b6d4', '#22d3ee', 2),
        shadowBlur: prop(30),
        shadowColor: 'rgba(6, 182, 212, 0.45)',
      },
      rect: { width: prop(420), height: prop(76), cornerRadius: prop(38) },
    },
  ],
};

// 6.1 Bistró & Brasa Gourmet - Menú Ejecutivo (16:9 Landscape 1920x1080)
const bistroGourmetComp: Composition = {
  id: 'ad_bistro_gourmet_menu',
  name: 'Bistró & Brasa Gourmet (Menú Ejecutivo)',
  width: 1920,
  height: 1080,
  fps: 60,
  duration: 4.5,
  backgroundColor: '#111317',
  layers: [
    {
      ...baseLayer('bg_ember_glow', 'Resplandor Brasa', 'circle', '#f97316'),
      transform: {
        position: prop({ x: 960, y: 540 }),
        scale: prop({ x: 100, y: 100 }, [
          makeTemplateKf(0, { x: 80, y: 80 }, 'easeInOut'),
          makeTemplateKf(2.2, { x: 110, y: 110 }, 'easeInOut'),
          makeTemplateKf(4.5, { x: 80, y: 80 }, 'easeInOut'),
        ]),
        rotation: prop(0),
        opacity: prop(20, [
          makeTemplateKf(0, 15, 'easeInOut'),
          makeTemplateKf(2.2, 30, 'easeInOut'),
          makeTemplateKf(4.5, 15, 'easeInOut'),
        ]),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#f97316'),
        blur: prop(80),
      },
      circle: { radiusX: prop(380), radiusY: prop(380) },
    },
    {
      ...baseLayer('bg_kicker', 'Kicker Fuego & Brasa', 'text', '#f97316'),
      transform: animRise(960, 220, 0.1, 25),
      style: defaultStyle('#f97316'),
      text: {
        text: '• COCINA DE FUEGO & CORTES SELECTOS •',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bg_title', 'Titular Menú Ejecutivo', 'text', '#ffffff'),
      transform: animRise(960, 320, 0.25, 40),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'MENÚ EJECUTIVO & CORTES A LA LEÑA',
        fontSize: prop(58),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bg_desc', 'Detalles del Menú', 'text', '#e2e8f0'),
      transform: animRise(960, 440, 0.38, 30),
      style: defaultStyle('#e2e8f0'),
      text: {
        text: 'Entrante de Temporada  ·  Corte Prime a la Brasa  ·  Copa de Vino o Postre Artesanal',
        fontSize: prop(26),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bg_schedule_txt', 'Horario de Atención', 'text', '#fbbf24'),
      transform: animRise(960, 530, 0.45, 20),
      style: defaultStyle('#fbbf24'),
      text: {
        text: 'De Lunes a Viernes de 13:00 a 17:00 hrs  ·  Servicio de Valet Parking',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bg_price_txt', 'Texto Precio Fijo', 'text', '#ffffff'),
      transform: animBadge(960, 680, 0.55),
      style: defaultStyle('#ffffff'),
      text: {
        text: '$18.50',
        fontSize: prop(64),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bg_price_sub', 'Subtexto Todo Incluido', 'text', '#fed7aa'),
      transform: animRise(960, 740, 0.62, 15),
      style: defaultStyle('#fed7aa'),
      text: {
        text: 'PRECIO POR PERSONA · TODO INCLUIDO',
        fontSize: prop(15),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bg_cta_txt', 'Texto Botón Reserva', 'text', '#ffffff'),
      transform: animCta(960, 890, 0.7),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'RESERVAR MESA EN LÍNEA →',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('bg_cta_rect', 'Botón Reserva', 'rect', '#ea580c'),
      transform: animCta(960, 890, 0.7),
      style: {
        ...defaultStyle('#ea580c', '#f97316', 2),
        shadowBlur: prop(30),
        shadowColor: 'rgba(234, 88, 12, 0.5)',
      },
      rect: { width: prop(420), height: prop(70), cornerRadius: prop(35) },
    },
  ],
};

// 6.2 Dulce Encanto Pastelería Artesanal (1:1 Cuadrado 1080x1080)
const dulceEncantoPasteleriaComp: Composition = {
  id: 'ad_dulce_encanto_pasteleria',
  name: 'Dulce Encanto Pastelería Artesanal (Pasteles de Autor)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#fffdf5',
  layers: [
    {
      ...baseLayer('dp_border', 'Marco Decorativo Rosa', 'rect', 'none'),
      transform: animCard(540, 540, 0.1, 0, 0.6),
      style: defaultStyle('none', '#f43f5e', 2.5),
      rect: { width: prop(1000), height: prop(1000), cornerRadius: prop(28) },
    },
    {
      ...baseLayer('dp_kicker', 'Tag 100% Artesanal', 'text', '#e11d48'),
      transform: animRise(540, 180, 0.15, 25),
      style: defaultStyle('#e11d48'),
      text: {
        text: '• 100% ARTESANAL & NATURAL •',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('dp_title1', 'Titular Línea 1', 'text', '#3c1822'),
      transform: animRise(540, 280, 0.25, 35),
      style: defaultStyle('#3c1822'),
      text: {
        text: 'PASTELES DE AUTOR',
        fontSize: prop(56),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('dp_title2', 'Titular Línea 2', 'text', '#e11d48'),
      transform: animRise(540, 365, 0.35, 35),
      style: defaultStyle('#e11d48'),
      text: {
        text: '& PEDIDOS ESPECIALES',
        fontSize: prop(52),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('dp_card_txt', 'Texto Tarjeta Pastelería', 'text', '#4c1d2d'),
      transform: animCard(540, 550, 0.45, 60, 0.7),
      style: defaultStyle('#4c1d2d'),
      text: {
        text: 'Elaboramos el pastel de tus sueños para bodas,\ncumpleaños, aniversarios y eventos memorables.',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(0.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('dp_card_bg', 'Fondo Tarjeta Crema', 'rect', '#ffe4e6'),
      transform: animCard(540, 550, 0.45, 60, 0.7),
      style: {
        ...defaultStyle('#ffe4e6', '#fda4af', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(244, 63, 94, 0.2)',
      },
      rect: { width: prop(780), height: prop(160), cornerRadius: prop(22) },
    },
    {
      ...baseLayer('dp_star', 'Insignia Calidad Estrella', 'star', '#f59e0b'),
      transform: animBadge(540, 715, 0.58, 15, true),
      style: defaultStyle('#f59e0b'),
      star: { points: prop(5), outerRadius: prop(28), innerRadius: prop(14) },
    },
    {
      ...baseLayer('dp_notice', 'Aviso Reserva 48 Horas', 'text', '#be123c'),
      transform: animRise(540, 785, 0.65, 20),
      style: defaultStyle('#be123c'),
      text: {
        text: '★ RESERVA CON 48 HORAS DE ANTICIPACIÓN ★',
        fontSize: prop(17),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('dp_cta_txt', 'Texto Botón WhatsApp', 'text', '#ffffff'),
      transform: animCta(540, 895, 0.75),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'COTIZAR PASTEL POR WHATSAPP',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('dp_cta_rect', 'Botón Rosa Fuerte', 'rect', '#e11d48'),
      transform: animCta(540, 895, 0.75),
      style: {
        ...defaultStyle('#e11d48', '#f43f5e', 2),
        shadowBlur: prop(30),
        shadowColor: 'rgba(225, 29, 72, 0.4)',
      },
      rect: { width: prop(520), height: prop(68), cornerRadius: prop(34) },
    },
    {
      ...baseLayer('dp_footer', 'Contacto Redes', 'text', '#881337'),
      transform: animRise(540, 990, 0.82, 15),
      style: defaultStyle('#881337'),
      text: {
        text: '@pasteleria.dulceencanto  ·  Servicio a Domicilio  ·  Catálogo 2026',
        fontSize: prop(16),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
  ],
};

// 6.3 Maison Pâtisserie - Repostería Fina & Macarons (9:16 Vertical 1080x1920)
const maisonPatisserieComp: Composition = {
  id: 'ad_maison_patisserie_reposteria',
  name: 'Maison Pâtisserie (Repostería Fina & Macarons)',
  width: 1080,
  height: 1920,
  fps: 60,
  duration: 4.5,
  backgroundColor: '#181210',
  layers: [
    {
      ...baseLayer('mp_glow', 'Resplandor Crema Dorado', 'circle', '#f59e0b'),
      transform: {
        position: prop({ x: 540, y: 750 }),
        scale: prop({ x: 100, y: 100 }, [
          makeTemplateKf(0, { x: 80, y: 80 }, 'easeInOut'),
          makeTemplateKf(2.2, { x: 115, y: 115 }, 'easeInOut'),
          makeTemplateKf(4.5, { x: 80, y: 80 }, 'easeInOut'),
        ]),
        rotation: prop(0),
        opacity: prop(15, [
          makeTemplateKf(0, 10, 'easeInOut'),
          makeTemplateKf(2.2, 22, 'easeInOut'),
          makeTemplateKf(4.5, 10, 'easeInOut'),
        ]),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#f59e0b'),
        blur: prop(80),
      },
      circle: { radiusX: prop(380), radiusY: prop(380) },
    },
    {
      ...baseLayer('mp_kicker', 'Kicker Pâtisserie', 'text', '#f59e0b'),
      transform: animRise(540, 260, 0.1, 30),
      style: defaultStyle('#f59e0b'),
      text: {
        text: '• ALTA REPOSTERÍA & MACARONS •',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mp_title1', 'Titular Línea 1', 'text', '#ffffff'),
      transform: animRise(540, 390, 0.25, 40),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'COLECCIÓN DE POSTRES',
        fontSize: prop(56),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mp_title2', 'Titular Línea 2', 'text', '#f472b6'),
      transform: animRise(540, 480, 0.35, 40),
      style: defaultStyle('#f472b6'),
      text: {
        text: '& TARTAS DE AUTOR',
        fontSize: prop(54),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mp_card1_txt', 'Texto Macaron Pistacho', 'text', '#fed7aa'),
      transform: animCard(540, 720, 0.45, 90, 0.7),
      style: defaultStyle('#fed7aa'),
      text: {
        text: '01  Macarons de Pistacho de Sicilia & Vainilla Bourbon',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mp_card1_bg', 'Fondo Tarjeta 01', 'rect', '#2a1b16'),
      transform: animCard(540, 720, 0.45, 90, 0.7),
      style: {
        ...defaultStyle('#2a1b16', '#f59e0b', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(245, 158, 11, 0.3)',
      },
      rect: { width: prop(800), height: prop(130), cornerRadius: prop(20) },
    },
    {
      ...baseLayer('mp_card2_txt', 'Texto Tartaletas', 'text', '#fbcfe8'),
      transform: animCard(540, 920, 0.6, 90, 0.7),
      style: defaultStyle('#fbcfe8'),
      text: {
        text: '02  Tartaletas de Frutos Rojos con Crema Diplomática',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mp_card2_bg', 'Fondo Tarjeta 02', 'rect', '#231612'),
      transform: animCard(540, 920, 0.6, 90, 0.7),
      style: defaultStyle('#231612', '#f472b6', 1.8),
      rect: { width: prop(800), height: prop(130), cornerRadius: prop(20) },
    },
    {
      ...baseLayer('mp_card3_txt', 'Texto Mesas de Postres', 'text', '#fef08a'),
      transform: animCard(540, 1120, 0.75, 90, 0.7),
      style: defaultStyle('#fef08a'),
      text: {
        text: '03  Mesas Dulces Exclusivas para Bodas & Eventos VIP',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mp_card3_bg', 'Fondo Tarjeta 03', 'rect', '#231612'),
      transform: animCard(540, 1120, 0.75, 90, 0.7),
      style: defaultStyle('#231612', '#eab308', 1.8),
      rect: { width: prop(800), height: prop(130), cornerRadius: prop(20) },
    },
    {
      ...baseLayer('mp_pill_txt', 'Texto Insignia Dorada', 'text', '#181210'),
      transform: animBadge(540, 1370, 0.85),
      style: defaultStyle('#181210'),
      text: {
        text: '★ EDICIÓN REPOSTERÍA FRANCESA 2026 ★',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mp_pill_bg', 'Fondo Insignia Dorada', 'rect', '#f59e0b'),
      transform: animBadge(540, 1370, 0.85),
      style: {
        ...defaultStyle('#f59e0b'),
        shadowBlur: prop(25),
        shadowColor: 'rgba(245, 158, 11, 0.5)',
      },
      rect: { width: prop(620), height: prop(60), cornerRadius: prop(30) },
    },
    {
      ...baseLayer('mp_cta_txt', 'Texto Botón Catálogo', 'text', '#ffffff'),
      transform: animCta(540, 1620, 0.95),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'VER CATÁLOGO COMPLETO DE POSTRES',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mp_cta_rect', 'Botón Dorado Catálogo', 'rect', '#d97706'),
      transform: animCta(540, 1620, 0.95),
      style: {
        ...defaultStyle('#d97706', '#fbbf24', 2),
        shadowBlur: prop(35),
        shadowColor: 'rgba(217, 119, 6, 0.5)',
      },
      rect: { width: prop(680), height: prop(76), cornerRadius: prop(38) },
    },
  ],
};

// 6.4 Master Auto - Taller Mecánico & Mantenimiento (1:1 Cuadrado 1080x1080)
const masterAutoTallerComp: Composition = {
  id: 'ad_master_auto_taller_mecanico',
  name: 'Master Auto (Taller Mecánico & Mantenimiento)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.2,
  backgroundColor: '#0c0d11',
  layers: [
    {
      ...baseLayer('ma_stripe', 'Franja Precisión Amarilla', 'rect', '#facc15'),
      transform: animCard(540, 30, 0.05, -30, 0.5),
      style: defaultStyle('#facc15'),
      rect: { width: prop(1080), height: prop(16), cornerRadius: prop(0) },
    },
    {
      ...baseLayer('ma_kicker', 'Kicker Servicio Certificado', 'text', '#facc15'),
      transform: animRise(540, 160, 0.12, 25),
      style: defaultStyle('#facc15'),
      text: {
        text: '• SERVICIO AUTOMOTRIZ MULTIMARCA CERTIFICADO •',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ma_title1', 'Titular Afinación Mayor', 'text', '#ffffff'),
      transform: animRise(540, 260, 0.22, 35),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'AFINACIÓN MAYOR',
        fontSize: prop(58),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ma_title2', 'Titular Frenos Seguros', 'text', '#facc15'),
      transform: animRise(540, 345, 0.32, 35),
      style: defaultStyle('#facc15'),
      text: {
        text: '& FRENOS DE PRECISIÓN',
        fontSize: prop(54),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ma_points_txt', 'Puntos de Servicio', 'text', '#f1f5f9'),
      transform: animCard(540, 550, 0.45, 70, 0.7),
      style: defaultStyle('#f1f5f9'),
      text: {
        text: '✔ Escaneo por Computadora OBD-II Sin Costo\n✔ Cambio de Aceite Sintético y Filtros Nuevos\n✔ Inspección de Seguridad de 25 Puntos Críticos',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ma_points_bg', 'Fondo Tarjeta Servicios', 'rect', '#161922'),
      transform: animCard(540, 550, 0.45, 70, 0.7),
      style: {
        ...defaultStyle('#161922', '#facc15', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(250, 204, 21, 0.25)',
      },
      rect: { width: prop(800), height: prop(180), cornerRadius: prop(20) },
    },
    {
      ...baseLayer('ma_promo_txt', 'Texto Promo 20%', 'text', '#ffffff'),
      transform: animBadge(540, 725, 0.58),
      style: defaultStyle('#ffffff'),
      text: {
        text: '¡20% DE DESCUENTO EN TU PRIMERA VISITA!',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ma_promo_bg', 'Fondo Promo Rojo', 'rect', '#ef4444'),
      transform: animBadge(540, 725, 0.58),
      style: {
        ...defaultStyle('#ef4444'),
        shadowBlur: prop(25),
        shadowColor: 'rgba(239, 68, 68, 0.4)',
      },
      rect: { width: prop(640), height: prop(56), cornerRadius: prop(28) },
    },
    {
      ...baseLayer('ma_cta_txt', 'Texto Botón Cita', 'text', '#0c0d11'),
      transform: animCta(540, 875, 0.7),
      style: defaultStyle('#0c0d11'),
      text: {
        text: 'AGENDAR CITA DE TALLER HOY',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('ma_cta_bg', 'Botón Amarillo Cita', 'rect', '#facc15'),
      transform: animCta(540, 875, 0.7),
      style: {
        ...defaultStyle('#facc15', '#fef08a', 2),
        shadowBlur: prop(30),
        shadowColor: 'rgba(250, 204, 21, 0.5)',
      },
      rect: { width: prop(540), height: prop(72), cornerRadius: prop(36) },
    },
    {
      ...baseLayer('ma_footer', 'Texto Garantía', 'text', '#94a3b8'),
      transform: animRise(540, 990, 0.8, 15),
      style: defaultStyle('#94a3b8'),
      text: {
        text: 'Garantía por Escrito en Todas las Reparaciones  ·  Técnicos Certificados',
        fontSize: prop(17),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
  ],
};

// 6.5 Taller Maderas Nobles - Carpintería & Ebanistería (9:16 Vertical 1080x1920)
const maderasNoblesCarpinteriaComp: Composition = {
  id: 'ad_maderas_nobles_carpinteria',
  name: 'Taller Maderas Nobles (Carpintería & Ebanistería)',
  width: 1080,
  height: 1920,
  fps: 60,
  duration: 4.5,
  backgroundColor: '#1b120c',
  layers: [
    {
      ...baseLayer('mn_glow', 'Resplandor Madera Cálida', 'circle', '#d97706'),
      transform: {
        position: prop({ x: 540, y: 780 }),
        scale: prop({ x: 100, y: 100 }, [
          makeTemplateKf(0, { x: 80, y: 80 }, 'easeInOut'),
          makeTemplateKf(2.2, { x: 110, y: 110 }, 'easeInOut'),
          makeTemplateKf(4.5, { x: 80, y: 80 }, 'easeInOut'),
        ]),
        rotation: prop(0),
        opacity: prop(16, [
          makeTemplateKf(0, 12, 'easeInOut'),
          makeTemplateKf(2.2, 22, 'easeInOut'),
          makeTemplateKf(4.5, 12, 'easeInOut'),
        ]),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('#d97706'),
        blur: prop(80),
      },
      circle: { radiusX: prop(380), radiusY: prop(380) },
    },
    {
      ...baseLayer('mn_kicker', 'Kicker Ebanistería', 'text', '#f59e0b'),
      transform: animRise(540, 260, 0.1, 25),
      style: defaultStyle('#f59e0b'),
      text: {
        text: '• EBANISTERÍA & DISEÑO EN MADERA •',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(4),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mn_title1', 'Titular Línea 1', 'text', '#ffffff'),
      transform: animRise(540, 390, 0.22, 40),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'MUEBLES A MEDIDA',
        fontSize: prop(60),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mn_title2', 'Titular Línea 2', 'text', '#f59e0b'),
      transform: animRise(540, 480, 0.32, 40),
      style: defaultStyle('#f59e0b'),
      text: {
        text: 'HECHOS PARA DURAR',
        fontSize: prop(56),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mn_card1_txt', 'Texto Cocinas y Closets', 'text', '#fed7aa'),
      transform: animCard(540, 730, 0.45, 90, 0.7),
      style: defaultStyle('#fed7aa'),
      text: {
        text: '01  Cocinas Integrales & Closets a la Medida',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mn_card1_bg', 'Fondo Tarjeta 01', 'rect', '#2d1b11'),
      transform: animCard(540, 730, 0.45, 90, 0.7),
      style: {
        ...defaultStyle('#2d1b11', '#d97706', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(217, 119, 6, 0.3)',
      },
      rect: { width: prop(800), height: prop(130), cornerRadius: prop(20) },
    },
    {
      ...baseLayer('mn_card2_txt', 'Texto Mesas Parota', 'text', '#fef3c7'),
      transform: animCard(540, 930, 0.6, 90, 0.7),
      style: defaultStyle('#fef3c7'),
      text: {
        text: '02  Mesas de Comedor en Parota & Roble Macizo',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mn_card2_bg', 'Fondo Tarjeta 02', 'rect', '#25160d'),
      transform: animCard(540, 930, 0.6, 90, 0.7),
      style: defaultStyle('#25160d', '#b45309', 1.8),
      rect: { width: prop(800), height: prop(130), cornerRadius: prop(20) },
    },
    {
      ...baseLayer('mn_card3_txt', 'Texto Restauración', 'text', '#fed7aa'),
      transform: animCard(540, 1130, 0.75, 90, 0.7),
      style: defaultStyle('#fed7aa'),
      text: {
        text: '03  Restauración y Acabados Finos al Aceite Natural',
        fontSize: prop(24),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mn_card3_bg', 'Fondo Tarjeta 03', 'rect', '#25160d'),
      transform: animCard(540, 1130, 0.75, 90, 0.7),
      style: defaultStyle('#25160d', '#b45309', 1.8),
      rect: { width: prop(800), height: prop(130), cornerRadius: prop(20) },
    },
    {
      ...baseLayer('mn_pill_txt', 'Texto Garantía Madera', 'text', '#1b120c'),
      transform: animBadge(540, 1370, 0.85),
      style: defaultStyle('#1b120c'),
      text: {
        text: '★ 100% MADERA NATURAL GARANTIZADA ★',
        fontSize: prop(19),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mn_pill_bg', 'Fondo Garantía Madera', 'rect', '#f59e0b'),
      transform: animBadge(540, 1370, 0.85),
      style: {
        ...defaultStyle('#f59e0b'),
        shadowBlur: prop(25),
        shadowColor: 'rgba(245, 158, 11, 0.5)',
      },
      rect: { width: prop(620), height: prop(60), cornerRadius: prop(30) },
    },
    {
      ...baseLayer('mn_cta_txt', 'Texto Cotizar Proyecto', 'text', '#ffffff'),
      transform: animCta(540, 1620, 0.95),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'COTIZAR PROYECTO A MEDIDA',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mn_cta_rect', 'Botón Madera Cotizar', 'rect', '#b45309'),
      transform: animCta(540, 1620, 0.95),
      style: {
        ...defaultStyle('#b45309', '#d97706', 2),
        shadowBlur: prop(35),
        shadowColor: 'rgba(180, 83, 9, 0.5)',
      },
      rect: { width: prop(680), height: prop(76), cornerRadius: prop(38) },
    },
  ],
};

// 6.6 Manos de Barro - Taller de Cerámica & Alfarería (1:1 Cuadrado 1080x1080)
const manosDeBarroCeramicaComp: Composition = {
  id: 'ad_manos_de_barro_ceramica',
  name: 'Manos de Barro (Taller de Cerámica & Alfarería)',
  width: 1080,
  height: 1080,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#faf5ee',
  layers: [
    {
      ...baseLayer('mb_border', 'Marco Terracota', 'rect', 'none'),
      transform: animCard(540, 540, 0.1, 0, 0.6),
      style: defaultStyle('none', '#9a3412', 2),
      rect: { width: prop(1000), height: prop(1000), cornerRadius: prop(28) },
    },
    {
      ...baseLayer('mb_wheel', 'Torno Alfarero Giratorio', 'circle', 'none'),
      transform: {
        position: prop({ x: 540, y: 550 }),
        scale: prop({ x: 100, y: 100 }),
        rotation: prop(0, [
          makeTemplateKf(0, 0, 'linear'),
          makeTemplateKf(4.0, 360, 'linear'),
        ]),
        opacity: prop(40),
        anchorPoint: prop({ x: 0, y: 0 }),
        skew: prop({ x: 0, y: 0 }),
      },
      style: {
        ...defaultStyle('none', '#c2410c', 2),
        strokeDashArray: prop('14 10'),
      },
      circle: { radiusX: prop(170), radiusY: prop(170) },
    },
    {
      ...baseLayer('mb_kicker', 'Kicker Mindfulness', 'text', '#c2410c'),
      transform: animRise(540, 180, 0.15, 25),
      style: defaultStyle('#c2410c'),
      text: {
        text: '• EXPERIENCIA CREATIVA & MINDFULNESS •',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(3),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mb_title1', 'Titular Línea 1', 'text', '#431407'),
      transform: animRise(540, 280, 0.25, 35),
      style: defaultStyle('#431407'),
      text: {
        text: 'WORKSHOP DE CERÁMICA',
        fontSize: prop(56),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mb_title2', 'Titular Línea 2', 'text', '#9a3412'),
      transform: animRise(540, 365, 0.35, 35),
      style: defaultStyle('#9a3412'),
      text: {
        text: '& TORNO ALFARERO',
        fontSize: prop(52),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mb_desc_txt', 'Descripción Taller', 'text', '#431407'),
      transform: animCard(540, 550, 0.45, 60, 0.7),
      style: defaultStyle('#431407'),
      text: {
        text: 'Aprende a modelar tus propias piezas desde cero en arcilla.\nTodos los materiales, herramientas, esmaltado y horneado incluidos.',
        fontSize: prop(22),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        letterSpacing: prop(0.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mb_desc_bg', 'Fondo Tarjeta Arcilla', 'rect', '#ffedd5'),
      transform: animCard(540, 550, 0.45, 60, 0.7),
      style: {
        ...defaultStyle('#ffedd5', '#fed7aa', 2),
        shadowBlur: prop(25),
        shadowColor: 'rgba(154, 52, 18, 0.2)',
      },
      rect: { width: prop(800), height: prop(160), cornerRadius: prop(22) },
    },
    {
      ...baseLayer('mb_badge', 'Aviso Cupos Limitados', 'text', '#9a3412'),
      transform: animRise(540, 750, 0.62, 20),
      style: defaultStyle('#9a3412'),
      text: {
        text: '★ CUPOS LIMITADOS · GRUPOS REDUCIDOS DE FIN DE SEMANA ★',
        fontSize: prop(17),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(2),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mb_cta_txt', 'Texto Botón Inscripción', 'text', '#ffffff'),
      transform: animCta(540, 875, 0.72),
      style: defaultStyle('#ffffff'),
      text: {
        text: 'RESERVAR LUGAR EN EL WORKSHOP',
        fontSize: prop(20),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
    {
      ...baseLayer('mb_cta_rect', 'Botón Terracota', 'rect', '#c2410c'),
      transform: animCta(540, 875, 0.72),
      style: {
        ...defaultStyle('#c2410c', '#ea580c', 2),
        shadowBlur: prop(30),
        shadowColor: 'rgba(194, 65, 12, 0.4)',
      },
      rect: { width: prop(540), height: prop(70), cornerRadius: prop(35) },
    },
    {
      ...baseLayer('mb_footer', 'Ubicación Centro', 'text', '#7c2d12'),
      transform: animRise(540, 990, 0.82, 15),
      style: defaultStyle('#7c2d12'),
      text: {
        text: 'Taller Creativo · Barrio Histórico  ·  No se requiere experiencia previa',
        fontSize: prop(17),
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: prop(1.5),
        textAlign: 'center',
      },
    },
  ],
};

// =============================================================
// CATÁLOGO GENERAL DE PLANTILLAS 2026
// =============================================================

export const TEMPLATE_CATALOG: TemplateDefinition[] = [
  // --- NUEVAS: RESTAURANTES, PASTELERÍAS, REPOSTERÍAS Y TALLERES ---
  {
    id: 'ad_bistro_gourmet_menu',
    name: 'Bistró & Brasa Gourmet (Menú Ejecutivo)',
    category: 'restaurantes',
    categoryLabel: 'Restaurantes & Gastronomía',
    description: 'Estilo culinario de alto nivel en carbón mate y naranja fuego, con resplandor de brasa vivo, badge de precio cerrado y detalles de menú completo.',
    aspectRatio: '16:9',
    recommendedSize: '1920×1080 (Web & Pantallas)',
    tags: ['Restaurante', 'Bistró', 'Menú Ejecutivo', 'Brasa', 'Gourmet', '16:9'],
    composition: bistroGourmetComp,
  },
  {
    id: 'ad_dulce_encanto_pasteleria',
    name: 'Dulce Encanto Pastelería Artesanal',
    category: 'pastelerias',
    categoryLabel: 'Pastelerías & Reposterías',
    description: 'Tonos vainilla y rosa frambuesa con marco decorativo, estrella de calidad y llamada directa para pedidos y cotizaciones por WhatsApp.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080 (Feed / Post)',
    tags: ['Pastelería', 'Pasteles', 'Tortas', 'Bodas', 'Cumpleaños', 'Artesanal', '1:1'],
    composition: dulceEncantoPasteleriaComp,
  },
  {
    id: 'ad_maison_patisserie_reposteria',
    name: 'Maison Pâtisserie (Repostería Fina & Macarons)',
    category: 'pastelerias',
    categoryLabel: 'Pastelerías & Reposterías',
    description: 'Inspiración francesa en cacao oscuro y acentos dorados, tarjetas escalonadas para especialidades de macarons, tartas finas y mesas dulces para eventos.',
    aspectRatio: '9:16',
    recommendedSize: '1080×1920 (Reels / Stories / TikTok)',
    tags: ['Repostería', 'Pâtisserie', 'Macarons', 'Tartas', 'Eventos', '9:16 Vertical'],
    composition: maisonPatisserieComp,
  },
  {
    id: 'ad_master_auto_taller_mecanico',
    name: 'Master Auto (Taller Mecánico & Mantenimiento)',
    category: 'talleres',
    categoryLabel: 'Talleres & Oficios',
    description: 'Impacto industrial de alto contraste en antracita y amarillo automotriz, checklist de diagnóstico computarizado y badge de 20% de descuento.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080 (Feed / Post)',
    tags: ['Taller Mecánico', 'Automotriz', 'Frenos', 'Afinación', 'Mantenimiento', '1:1'],
    composition: masterAutoTallerComp,
  },
  {
    id: 'ad_maderas_nobles_carpinteria',
    name: 'Taller Maderas Nobles (Carpintería & Ebanistería)',
    category: 'talleres',
    categoryLabel: 'Talleres & Oficios',
    description: 'Madera de nogal profunda y bronce dorado, tarjetas de servicios a medida (cocinas, closets, mesas de parota) y badge de garantía en madera sólida.',
    aspectRatio: '9:16',
    recommendedSize: '1080×1920 (Reels / Stories / TikTok)',
    tags: ['Carpintería', 'Ebanistería', 'Muebles a Medida', 'Madera', '9:16 Vertical'],
    composition: maderasNoblesCarpinteriaComp,
  },
  {
    id: 'ad_manos_de_barro_ceramica',
    name: 'Manos de Barro (Taller de Cerámica & Alfarería)',
    category: 'talleres',
    categoryLabel: 'Talleres & Oficios',
    description: 'Colores arena y terracota natural con torno alfarero en rotación suave, invitación a workshops creativos de fin de semana y cupos limitados.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080 (Feed / Post)',
    tags: ['Taller de Arte', 'Cerámica', 'Alfarería', 'Workshop', 'Creativo', '1:1'],
    composition: manosDeBarroCeramicaComp,
  },
  // --- VIRALES & GSAP KINETIC (INSPIRADOS EN EL VIDEO DEL USUARIO Y KHANH NGUYEN) ---
  {
    id: 'ad_ai_creator_showcase',
    name: 'Escaparate Digital Creativo (Estilo Viral)',
    category: 'servicios',
    categoryLabel: 'Servicios & Negocios',
    description: 'Inspirado exactamente en el video: fondo verde esmeralda con cuadrícula tecnológica, ventana de navegador macOS flotante, titular con highlight box verde lima y tracker inferior.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080 (Feed / Post)',
    tags: ['Video Viral', 'AI Creator', 'Highlight Box', 'Browser Mockup', '1:1'],
    composition: aiCreatorShowcaseComp,
  },
  {
    id: 'ad_bento_services_cascade',
    name: 'Bento Grid 4-Pillar Services (Escena 02 Video)',
    category: 'servicios',
    categoryLabel: 'Servicios & Negocios',
    description: 'Inspirado en la escena de 4 servicios del video: 4 tarjetas Bento en verde esmeralda que entran en cascada escalonada con rebote suave y píldora de resumen.',
    aspectRatio: '9:16',
    recommendedSize: '1080×1920 (Reels / Stories / TikTok)',
    tags: ['Bento Grid', 'Cascada', 'Servicios', 'Video Viral', '9:16 Vertical'],
    composition: bentoServicesCascadeComp,
  },
  {
    id: 'ad_metric_impact_counters',
    name: 'Metric Counters 45·24·12 (Escena 03 Video)',
    category: 'servicios',
    categoryLabel: 'Servicios & Negocios',
    description: 'Inspirado en la escena de métricas del video: números de impacto (45, 24, 12) que entran con salto elástico individual y fila de marcas aliadas.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080 (Feed)',
    tags: ['Métricas', 'Contadores', 'Video Viral', 'Impacto', '1:1'],
    composition: metricImpactCountersComp,
  },
  {
    id: 'ad_khanhnguyen_editorial',
    name: 'Khanh Nguyen Kinetic Typo (Split & Stretch)',
    category: 'servicios',
    categoryLabel: 'Servicios & Negocios',
    description: 'Inspirado en khanhnguyen.design: tipografía SplitText de vanguardia con máscara ascendente, stretch de caracteres y tarjeta editorial asimétrica.',
    aspectRatio: '16:9',
    recommendedSize: '1920×1080 (Web & Banner)',
    tags: ['Khanh Nguyen', 'Split Text', 'Editorial', 'Kinetic', '16:9'],
    composition: khanhNguyenEditorialComp,
  },
  {
    id: 'ad_draw_svg_glow_tech',
    name: 'DrawSVG Cyber Wireframe & Tech Reveal',
    category: 'productos',
    categoryLabel: 'Productos & E-Commerce',
    description: 'Emula el plugin DrawSVG de GSAP con trazado vectorial dinámico sobre el contorno del marco en tiempo real y tipografía de precisión.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080',
    tags: ['DrawSVG', 'Cyber', 'Wireframe', 'Trazo Vectorial', '1:1'],
    composition: drawSvgGlowTechComp,
  },
  // 1. EVENTOS Y FECHAS DEL AÑO
  {
    id: 'ad_black_friday',
    name: 'Black Friday Mega Drop (Cyber Neon)',
    category: 'eventos',
    categoryLabel: 'Eventos & Fechas del Año',
    description: 'Estilo cyber neon de alto impacto con acento verde lima, estrella de descuento 70% OFF animada y tipografía de máxima conversión.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080 o 1200×1200',
    tags: ['Black Friday', 'Cyber Monday', 'Flash Sale', 'Neon', '1:1 Feed'],
    composition: blackFridayComp,
  },
  {
    id: 'ad_new_year_gala',
    name: 'Gala de Año Nuevo & Countdown',
    category: 'eventos',
    categoryLabel: 'Eventos & Fechas del Año',
    description: 'Elegancia en azul noche y oro champán, anillo orbital en rotación constante y número 2026 en escala cinética.',
    aspectRatio: '9:16',
    recommendedSize: '1080×1920 (Reels / Stories / TikTok)',
    tags: ['Año Nuevo', 'Gala', 'Cuenta Regresiva', 'Lujo', '9:16 Vertical'],
    composition: newYearGalaComp,
  },
  {
    id: 'ad_summer_festival',
    name: 'Summer Fest Sunset Sessions',
    category: 'eventos',
    categoryLabel: 'Eventos & Fechas del Año',
    description: 'Vibras de festival al atardecer en coral y ámbar, halo solar con respiración armónica y botón para venta de entradas.',
    aspectRatio: '16:9',
    recommendedSize: '1920×1080 o 800×450 (Web Banner)',
    tags: ['Festival', 'Verano', 'Música', 'Tickets', '16:9 Landscape'],
    composition: summerFestivalComp,
  },
  {
    id: 'ad_spooky_halloween',
    name: 'Spooky Flash Sale Halloween',
    category: 'eventos',
    categoryLabel: 'Eventos & Fechas del Año',
    description: 'Púrpura y naranja calabaza de alta vibración, estrella hexagonal giratoria con promo 2x1 y botón con flecha cinética.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080',
    tags: ['Halloween', 'Oferta Relámpago', '2x1', '1:1 Feed'],
    composition: spookySaleComp,
  },
  {
    id: 'ad_valentine_special',
    name: 'San Valentín Love Edition',
    category: 'eventos',
    categoryLabel: 'Eventos & Fechas del Año',
    description: 'Carmesí vino tinto y rosa empolvado, halo de pulsación suave y tipografía para marcas de regalos, joyas y experiencias.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080 o 1080×1350',
    tags: ['San Valentín', 'Amor', 'Joyería', 'Regalos', '1:1'],
    composition: valentineComp,
  },

  // 2. GASTRONOMÍA & RESTAURANTES
  {
    id: 'ad_smash_burger',
    name: 'Gourmet Double Smash Burger',
    category: 'restaurantes',
    categoryLabel: 'Gastronomía & Restaurantes',
    description: 'Estética urbana dark kitchen sobre fondo carbón mate, detalles en queso cheddar y badge circular con precio de combo.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080',
    tags: ['Hamburguesas', 'Dark Kitchen', 'Delivery', 'Combo', '1:1'],
    composition: smashBurgerComp,
  },
  {
    id: 'ad_artisan_coffee',
    name: 'Artisan Specialty Coffee & Brunch',
    category: 'restaurantes',
    categoryLabel: 'Gastronomía & Restaurantes',
    description: 'Colores tostados y crema latte, diseño acogedor y elegante de cafetería moderna con tarjeta de menú animada.',
    aspectRatio: '9:16',
    recommendedSize: '1080×1920 (Reels / Stories)',
    tags: ['Cafetería', 'Brunch', 'Specialty Coffee', '9:16 Vertical'],
    composition: artisanCoffeeComp,
  },
  {
    id: 'ad_sushi_omakase',
    name: 'Sushi Bar & Omakase Experience',
    category: 'restaurantes',
    categoryLabel: 'Gastronomía & Restaurantes',
    description: 'Minimalismo japonés sobre pizarra azul y salmón vivo, círculo ensō ceremonial y llamada a la reserva previa.',
    aspectRatio: '16:9',
    recommendedSize: '1920×1080 (Web & Display)',
    tags: ['Sushi', 'Omakase', 'Gourmet', 'Alta Cocina', '16:9'],
    composition: sushiOmakaseComp,
  },
  {
    id: 'ad_pizza_promo',
    name: 'Pizza Night 2x1 Flash Promo',
    category: 'restaurantes',
    categoryLabel: 'Gastronomía & Restaurantes',
    description: 'Rojo vivo italiano y amarillo dorado, badge con pulsación rítmica destacando la promoción del día para pizzerías.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080',
    tags: ['Pizza', '2x1', 'Delivery', 'Italiano', '1:1'],
    composition: pizzaPromoComp,
  },

  // 3. PRODUCTOS & E-COMMERCE
  {
    id: 'ad_velocity_sneakers',
    name: 'Velocity Sneaker Drop 2026',
    category: 'productos',
    categoryLabel: 'Productos & E-Commerce',
    description: 'Edición urbana streetwear en diagonal dinámica, verde lima neón de alta energía y tarjeta flotante con efecto magnético.',
    aspectRatio: '9:16',
    recommendedSize: '1080×1920 (TikTok / Reels)',
    tags: ['Sneakers', 'Streetwear', 'Drop Limitado', '9:16 Vertical'],
    composition: velocitySneakerComp,
  },
  {
    id: 'ad_smartwatch_titan',
    name: 'Smartwatch Titan Chrono Pro',
    category: 'productos',
    categoryLabel: 'Productos & E-Commerce',
    description: 'Look de tecnología aeroespacial en titanio oscuro y cyan, esferas concéntricas de radar y especificaciones de batería.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080',
    tags: ['Smartwatch', 'Tecnología', 'Hardware', 'Cyan', '1:1'],
    composition: smartwatchTechComp,
  },
  {
    id: 'ad_glow_skincare',
    name: 'Beauty Hydra Glow Serum',
    category: 'productos',
    categoryLabel: 'Productos & E-Commerce',
    description: 'Tonos pastel suaves en rosa pétalo y blanco, gota de hidratación en expansión orgánica para cosmética y skincare.',
    aspectRatio: '9:16',
    recommendedSize: '1080×1920 (Reels / Stories)',
    tags: ['Cosmética', 'Skincare', 'Belleza', 'Vegano', '9:16 Vertical'],
    composition: glowSkincareComp,
  },
  {
    id: 'ad_fashion_lookbook',
    name: 'Minimal Fashion Lookbook',
    category: 'productos',
    categoryLabel: 'Productos & E-Commerce',
    description: 'Composición editorial de revista de alta moda, fondos limpios con tipografía suiza sobria y marco de colección.',
    aspectRatio: '16:9',
    recommendedSize: '1920×1080',
    tags: ['Moda', 'Lookbook', 'Editorial', 'Sostenible', '16:9'],
    composition: fashionLookbookComp,
  },

  // 4. SERVICIOS & NEGOCIOS
  {
    id: 'ad_real_estate_luxury',
    name: 'Real Estate Luxury Villa Tour',
    category: 'servicios',
    categoryLabel: 'Servicios & Negocios',
    description: 'Azul marino de prestigio y dorado arquitectónico, ficha con detalles de habitaciones y fecha de Open House.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080',
    tags: ['Inmobiliaria', 'Real Estate', 'Lujo', 'Open House', '1:1'],
    composition: realEstateComp,
  },
  {
    id: 'ad_fitness_club',
    name: 'High-Performance Gym Club',
    category: 'servicios',
    categoryLabel: 'Servicios & Negocios',
    description: 'Carbón dinámico y verde lima ultra brillante, mensaje de alta energía con promoción de 50% de descuento y matrícula.',
    aspectRatio: '9:16',
    recommendedSize: '1080×1920 (Stories / Reels)',
    tags: ['Gimnasio', 'Fitness', 'Crossfit', 'Entrenamiento', '9:16 Vertical'],
    composition: fitnessClubComp,
  },
  {
    id: 'ad_creative_agency',
    name: 'Creative Agency Showreel',
    category: 'servicios',
    categoryLabel: 'Servicios & Negocios',
    description: 'Fondo negro profundo con acento azul cobalto eléctrico, retícula avant-garde para agencias de diseño y productoras.',
    aspectRatio: '16:9',
    recommendedSize: '1920×1080',
    tags: ['Agencia', 'Showreel', 'Diseño', 'Branding', '16:9'],
    composition: creativeAgencyComp,
  },
  {
    id: 'ad_saas_cloud',
    name: 'SaaS B2B Cloud Platform Launch',
    category: 'servicios',
    categoryLabel: 'Servicios & Negocios',
    description: 'Índigo oscuro moderno con tarjeta de métricas de rendimiento 300% y llamada a la acción para solicitud de demo.',
    aspectRatio: '1:1',
    recommendedSize: '1080×1080',
    tags: ['SaaS', 'B2B', 'Cloud', 'Startup', 'Software', '1:1'],
    composition: saasPlatformComp,
  },
];
