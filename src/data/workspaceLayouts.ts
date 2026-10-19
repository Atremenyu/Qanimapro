import { WorkspaceLayout } from '../types';

export const BUILT_IN_FOCUS_MODES: WorkspaceLayout[] = [
  {
    id: 'layout_default',
    name: 'Estudio Completo',
    description: 'Configuración estándar balanceada para diseño vectorial, animación simultánea y ajuste de propiedades.',
    icon: 'layout',
    isBuiltIn: true,
    shortcut: 'Alt+1',
    toolbar: {
      visible: true,
      position: 'left',
      compact: false,
    },
    inspector: {
      visible: true,
      position: 'right',
      width: 288,
      activeTab: 'transform',
    },
    timeline: {
      visible: true,
      height: 288,
      collapsed: false,
    },
    viewport: {
      showGrid: true,
      showRulers: true,
      showSafeAreas: false,
      snapToGrid: false,
      onionSkin: false,
    },
  },
  {
    id: 'layout_animation',
    name: 'Animación & Keyframes Master',
    description: 'Línea de tiempo expandida para pulir curvas de velocidad, keyframing intensivo, easing y onion skinning.',
    icon: 'activity',
    isBuiltIn: true,
    shortcut: 'Alt+2',
    toolbar: {
      visible: true,
      position: 'left',
      compact: true,
    },
    inspector: {
      visible: true,
      position: 'right',
      width: 260,
      activeTab: 'motion',
    },
    timeline: {
      visible: true,
      height: 400,
      collapsed: false,
    },
    viewport: {
      showGrid: true,
      showRulers: true,
      showSafeAreas: false,
      snapToGrid: false,
      onionSkin: true,
    },
  },
  {
    id: 'layout_illustration',
    name: 'Ilustración & Formas Vectoriales',
    description: 'Lienzo vertical al 100% con timeline minimizado, inspector amplio para estilos/degradados y rejilla magnética.',
    icon: 'pen-tool',
    isBuiltIn: true,
    shortcut: 'Alt+3',
    toolbar: {
      visible: true,
      position: 'left',
      compact: false,
    },
    inspector: {
      visible: true,
      position: 'right',
      width: 350,
      activeTab: 'style',
    },
    timeline: {
      visible: false,
      height: 200,
      collapsed: true,
    },
    viewport: {
      showGrid: true,
      showRulers: true,
      showSafeAreas: false,
      snapToGrid: true,
      onionSkin: false,
    },
  },
  {
    id: 'layout_cinema',
    name: 'Zen Cinema / Preview Limpio',
    description: 'Lienzo libre de paneles y barras laterales para revisión de anuncios publicitarios y previsualización cinemática.',
    icon: 'eye',
    isBuiltIn: true,
    shortcut: 'Alt+4',
    toolbar: {
      visible: false,
      position: 'left',
      compact: true,
    },
    inspector: {
      visible: false,
      position: 'right',
      width: 288,
      activeTab: 'transform',
    },
    timeline: {
      visible: false,
      height: 288,
      collapsed: true,
    },
    viewport: {
      showGrid: false,
      showRulers: false,
      showSafeAreas: true,
      snapToGrid: false,
      onionSkin: false,
    },
  },
  {
    id: 'layout_typography',
    name: 'Tipografía & Layout Inspector',
    description: 'Inspector ancho dedicado a ajustes milimétricos de fuentes, interletreado, alineaciones y safe areas de Google Ads.',
    icon: 'type',
    isBuiltIn: true,
    shortcut: 'Alt+5',
    toolbar: {
      visible: true,
      position: 'left',
      compact: false,
    },
    inspector: {
      visible: true,
      position: 'right',
      width: 360,
      activeTab: 'transform',
    },
    timeline: {
      visible: true,
      height: 220,
      collapsed: false,
    },
    viewport: {
      showGrid: true,
      showRulers: true,
      showSafeAreas: true,
      snapToGrid: true,
      onionSkin: false,
    },
  },
];

const STORAGE_KEY_CUSTOM_LAYOUTS = 'vectormotion_custom_workspace_layouts_v1';
const STORAGE_KEY_ACTIVE_LAYOUT = 'vectormotion_active_workspace_layout_id_v1';

export function getStoredCustomLayouts(): WorkspaceLayout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_LAYOUTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading custom workspace layouts from localStorage:', err);
    return [];
  }
}

export function getAllWorkspaceLayouts(): WorkspaceLayout[] {
  const custom = getStoredCustomLayouts();
  return [...BUILT_IN_FOCUS_MODES, ...custom];
}

export function saveCustomLayout(layout: Omit<WorkspaceLayout, 'id' | 'isBuiltIn' | 'updatedAt'> & { id?: string }): WorkspaceLayout {
  const customLayouts = getStoredCustomLayouts();
  const id = layout.id || 'custom_layout_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  
  const newLayout: WorkspaceLayout = {
    ...layout,
    id,
    isBuiltIn: false,
    updatedAt: Date.now(),
  };

  const existingIdx = customLayouts.findIndex((l) => l.id === id);
  let updatedList: WorkspaceLayout[];

  if (existingIdx >= 0) {
    updatedList = customLayouts.map((l) => (l.id === id ? newLayout : l));
  } else {
    updatedList = [...customLayouts, newLayout];
  }

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_LAYOUTS, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Error saving custom layout to localStorage:', err);
  }

  return newLayout;
}

export function deleteCustomLayout(id: string): boolean {
  const customLayouts = getStoredCustomLayouts();
  const filtered = customLayouts.filter((l) => l.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_LAYOUTS, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Error deleting custom layout from localStorage:', err);
    return false;
  }
}

export function getActiveLayoutId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_LAYOUT) || 'layout_default';
  } catch {
    return 'layout_default';
  }
}

export function setActiveLayoutId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_LAYOUT, id);
  } catch (err) {
    console.error('Error saving active layout ID to localStorage:', err);
  }
}

export function exportLayoutsAsJson(): string {
  const custom = getStoredCustomLayouts();
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    layouts: custom,
  }, null, 2);
}

export function importLayoutsFromJson(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    const layoutsToImport = Array.isArray(data) ? data : data.layouts;
    if (!Array.isArray(layoutsToImport)) {
      return { success: false, count: 0, error: 'Formato JSON inválido. Debe contener una lista de diseños.' };
    }

    const currentCustom = getStoredCustomLayouts();
    const map = new Map<string, WorkspaceLayout>();
    currentCustom.forEach((l) => map.set(l.id, l));

    let importedCount = 0;
    layoutsToImport.forEach((l) => {
      if (l && l.name && l.toolbar && l.inspector && l.timeline) {
        const id = l.id && !l.id.startsWith('layout_') ? l.id : 'imported_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const validatedLayout: WorkspaceLayout = {
          ...l,
          id,
          isBuiltIn: false,
          updatedAt: Date.now(),
        };
        map.set(id, validatedLayout);
        importedCount++;
      }
    });

    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEY_CUSTOM_LAYOUTS, JSON.stringify(merged));
    return { success: true, count: importedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Error al procesar el archivo JSON' };
  }
}
