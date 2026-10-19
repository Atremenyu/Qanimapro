// Google Fonts Catalog and Dynamic Loader for Real-Time Canvas & Export

export interface GoogleFontDefinition {
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace';
  label: string;
  weights: number[];
  popular?: boolean;
}

export const GOOGLE_FONTS_CATALOG: GoogleFontDefinition[] = [
  // --- Modern Sans-Serif ---
  {
    family: 'Inter',
    label: 'Inter',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800, 900],
    popular: true,
  },
  {
    family: 'Plus Jakarta Sans',
    label: 'Plus Jakarta Sans',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    popular: true,
  },
  {
    family: 'Montserrat',
    label: 'Montserrat',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800, 900],
    popular: true,
  },
  {
    family: 'Poppins',
    label: 'Poppins',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800, 900],
    popular: true,
  },
  {
    family: 'Roboto',
    label: 'Roboto',
    category: 'sans-serif',
    weights: [300, 400, 500, 700, 900],
    popular: true,
  },
  {
    family: 'Open Sans',
    label: 'Open Sans',
    category: 'sans-serif',
    weights: [300, 400, 600, 700, 800],
    popular: true,
  },
  {
    family: 'Outfit',
    label: 'Outfit',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800, 900],
    popular: true,
  },
  {
    family: 'DM Sans',
    label: 'DM Sans',
    category: 'sans-serif',
    weights: [400, 500, 700, 900],
    popular: true,
  },
  {
    family: 'Space Grotesk',
    label: 'Space Grotesk',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700],
    popular: true,
  },
  {
    family: 'Raleway',
    label: 'Raleway',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    family: 'Manrope',
    label: 'Manrope',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
  },

  // --- Display & Kinetic Ads ---
  {
    family: 'Bebas Neue',
    label: 'Bebas Neue (Titulares Impacto)',
    category: 'display',
    weights: [400],
    popular: true,
  },
  {
    family: 'Syne',
    label: 'Syne (Avant-Garde & Brutalist)',
    category: 'display',
    weights: [500, 700, 800],
    popular: true,
  },
  {
    family: 'Oswald',
    label: 'Oswald (Condensada Publicitaria)',
    category: 'display',
    weights: [400, 600, 700],
    popular: true,
  },
  {
    family: 'Anton',
    label: 'Anton (Cartel Publicitario)',
    category: 'display',
    weights: [400],
    popular: true,
  },
  {
    family: 'Righteous',
    label: 'Righteous (Retro Cyber)',
    category: 'display',
    weights: [400],
  },
  {
    family: 'Bungee',
    label: 'Bungee (Urbana)',
    category: 'display',
    weights: [400],
  },

  // --- Editorial & Luxury Serif ---
  {
    family: 'Playfair Display',
    label: 'Playfair Display (Editorial Lujo)',
    category: 'serif',
    weights: [400, 600, 700, 900],
    popular: true,
  },
  {
    family: 'Cinzel',
    label: 'Cinzel (Cinemática Elegante)',
    category: 'serif',
    weights: [400, 600, 700, 900],
    popular: true,
  },
  {
    family: 'Merriweather',
    label: 'Merriweather (Periódico Clásico)',
    category: 'serif',
    weights: [300, 400, 700, 900],
    popular: true,
  },
  {
    family: 'Lora',
    label: 'Lora (Editorial Contemporánea)',
    category: 'serif',
    weights: [400, 500, 600, 700],
  },
  {
    family: 'Bodoni Moda',
    label: 'Bodoni Moda (Alta Costura)',
    category: 'serif',
    weights: [400, 600, 700, 900],
  },

  // --- Tech & Monospace ---
  {
    family: 'JetBrains Mono',
    label: 'JetBrains Mono (Código & Cyber)',
    category: 'monospace',
    weights: [400, 500, 700, 800],
    popular: true,
  },
  {
    family: 'Space Mono',
    label: 'Space Mono (Futurista)',
    category: 'monospace',
    weights: [400, 700],
  },
  {
    family: 'Fira Code',
    label: 'Fira Code',
    category: 'monospace',
    weights: [400, 600, 700],
  },
];

const loadedFonts = new Set<string>();

/**
 * Dynamically injects a Google Font into the DOM <head> if not already loaded
 */
export function loadGoogleFont(fontFamily: string): void {
  if (!fontFamily || typeof document === 'undefined') return;

  // Normalize family name
  const cleanFamily = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  if (!cleanFamily || cleanFamily === 'system-ui' || cleanFamily === 'sans-serif' || cleanFamily === 'serif' || cleanFamily === 'monospace') {
    return;
  }

  if (loadedFonts.has(cleanFamily)) return;

  const fontDef = GOOGLE_FONTS_CATALOG.find(
    (f) => f.family.toLowerCase() === cleanFamily.toLowerCase()
  );

  const familyParam = (fontDef ? fontDef.family : cleanFamily).replace(/ /g, '+');
  const weightsParam = fontDef ? `:wght@${fontDef.weights.join(';')}` : ':wght@400;600;700;800;900';
  const url = `https://fonts.googleapis.com/css2?family=${familyParam}${weightsParam}&display=swap`;

  const linkId = `gfont_${cleanFamily.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  loadedFonts.add(cleanFamily);
}

/**
 * Preload all fonts used across layers of a composition
 */
export function preloadCompositionFonts(layers: Array<{ type: string; text?: { fontFamily?: string } }>): void {
  layers.forEach((l) => {
    if (l.type === 'text' && l.text?.fontFamily) {
      loadGoogleFont(l.text.fontFamily);
    }
  });
}

/**
 * Preloads the most popular Google Fonts on app startup for zero-latency font switching
 */
export function preloadPopularFonts(): void {
  GOOGLE_FONTS_CATALOG.filter((f) => f.popular).forEach((f) => {
    loadGoogleFont(f.family);
  });
}

/**
 * Generates Google Fonts @import url for SVG and HTML5 export
 */
export function getGoogleFontsExportUrls(fontFamilies: string[]): string[] {
  const unique = Array.from(new Set(fontFamilies.map((f) => f.split(',')[0].replace(/['"]/g, '').trim()))).filter(
    (f) => f && f !== 'system-ui' && f !== 'sans-serif' && f !== 'serif' && f !== 'monospace'
  );

  return unique.map((family) => {
    const fontDef = GOOGLE_FONTS_CATALOG.find((f) => f.family.toLowerCase() === family.toLowerCase());
    const familyParam = (fontDef ? fontDef.family : family).replace(/ /g, '+');
    const weightsParam = fontDef ? `:wght@${fontDef.weights.join(';')}` : ':wght@400;700;900';
    return `https://fonts.googleapis.com/css2?family=${familyParam}${weightsParam}&display=swap`;
  });
}
