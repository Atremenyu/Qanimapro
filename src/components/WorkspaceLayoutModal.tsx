import React, { useState, useRef } from 'react';
import {
  X,
  Layout,
  Activity,
  PenTool,
  Eye,
  Type,
  Sparkles,
  Sliders,
  Palette,
  Layers,
  Monitor,
  Zap,
  Check,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Edit2,
  Save,
  Grid,
  Columns,
  Rows,
} from 'lucide-react';
import { WorkspaceLayout } from '../types';
import {
  getAllWorkspaceLayouts,
  saveCustomLayout,
  deleteCustomLayout,
  exportLayoutsAsJson,
  importLayoutsFromJson,
} from '../data/workspaceLayouts';

interface WorkspaceLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLayoutId: string;
  onApplyLayout: (layout: WorkspaceLayout) => void;
  currentConfig: {
    toolbar: WorkspaceLayout['toolbar'];
    inspector: WorkspaceLayout['inspector'];
    timeline: WorkspaceLayout['timeline'];
    viewport: WorkspaceLayout['viewport'];
  };
}

const ICON_MAP: Record<string, React.ElementType> = {
  layout: Layout,
  activity: Activity,
  'pen-tool': PenTool,
  eye: Eye,
  type: Type,
  sparkles: Sparkles,
  sliders: Sliders,
  palette: Palette,
  layers: Layers,
  monitor: Monitor,
  zap: Zap,
};

export const WorkspaceLayoutModal: React.FC<WorkspaceLayoutModalProps> = ({
  isOpen,
  onClose,
  activeLayoutId,
  onApplyLayout,
  currentConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'saveCurrent' | 'io'>('presets');
  const [allLayouts, setAllLayouts] = useState<WorkspaceLayout[]>(() => getAllWorkspaceLayouts());
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>(activeLayoutId);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saveIcon, setSaveIcon] = useState('layout');
  const [saveShortcut, setSaveShortcut] = useState('');
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const refreshList = () => {
    setAllLayouts(getAllWorkspaceLayouts());
  };

  const selectedLayout = allLayouts.find((l) => l.id === selectedLayoutId) || allLayouts[0];

  const handleApply = (layout: WorkspaceLayout) => {
    onApplyLayout(layout);
    setSelectedLayoutId(layout.id);
    onClose();
  };

  const handleSaveCurrentAsNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;

    const saved = saveCustomLayout({
      name: saveName.trim(),
      description: saveDesc.trim() || 'Espacio personalizado guardado por el usuario.',
      icon: saveIcon,
      shortcut: saveShortcut.trim() || undefined,
      toolbar: { ...currentConfig.toolbar },
      inspector: { ...currentConfig.inspector },
      timeline: { ...currentConfig.timeline },
      viewport: { ...currentConfig.viewport },
    });

    refreshList();
    setSaveName('');
    setSaveDesc('');
    onApplyLayout(saved);
    setSelectedLayoutId(saved.id);
    setActiveTab('custom');
  };

  const handleDuplicate = (layout: WorkspaceLayout) => {
    const copy = saveCustomLayout({
      name: `${layout.name} (Copia)`,
      description: layout.description,
      icon: layout.icon,
      toolbar: { ...layout.toolbar },
      inspector: { ...layout.inspector },
      timeline: { ...layout.timeline },
      viewport: { ...layout.viewport },
    });
    refreshList();
    setSelectedLayoutId(copy.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este espacio de trabajo personalizado?')) {
      deleteCustomLayout(id);
      refreshList();
      if (selectedLayoutId === id) {
        setSelectedLayoutId('layout_default');
      }
    }
  };

  const handleStartEdit = (layout: WorkspaceLayout) => {
    setEditingLayoutId(layout.id);
    setEditName(layout.name);
    setEditDesc(layout.description);
  };

  const handleSaveEdit = (layout: WorkspaceLayout) => {
    if (!editName.trim()) return;
    saveCustomLayout({
      id: layout.id,
      name: editName.trim(),
      description: editDesc.trim(),
      icon: layout.icon,
      shortcut: layout.shortcut,
      toolbar: layout.toolbar,
      inspector: layout.inspector,
      timeline: layout.timeline,
      viewport: layout.viewport,
    });
    setEditingLayoutId(null);
    refreshList();
  };

  const handleExportJson = () => {
    const jsonStr = exportLayoutsAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vectormotion-workspaces-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const res = importLayoutsFromJson(content);
      if (res.success) {
        setImportStatus(`¡Se importaron ${res.count} espacio(s) con éxito!`);
        refreshList();
      } else {
        setImportStatus(`Error al importar: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const builtInLayouts = allLayouts.filter((l) => l.isBuiltIn);
  const customLayouts = allLayouts.filter((l) => !l.isBuiltIn);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Espacios de Trabajo y Modos de Enfoque
              </h2>
              <p className="text-xs text-zinc-400">
                Personaliza la visibilidad, posición y tamaño de los paneles para cada etapa creativa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center gap-2 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'border-blue-500 text-blue-400 bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modos de Enfoque ({builtInLayouts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'border-blue-500 text-blue-400 bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Mis Diseños Personalizados ({customLayouts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saveCurrent')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'saveCurrent'
                ? 'border-blue-500 text-blue-400 bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>+ Guardar Configuración Actual</span>
          </button>

          <button
            onClick={() => setActiveTab('io')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ml-auto cursor-pointer ${
              activeTab === 'io'
                ? 'border-blue-500 text-blue-400 bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Respaldar / Exportar</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: PRESETS / MODOS DE ENFOQUE */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {builtInLayouts.map((layout) => {
                const IconComponent = ICON_MAP[layout.icon] || Layout;
                const isActive = activeLayoutId === layout.id;
                return (
                  <div
                    key={layout.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-blue-950/25 border-blue-500/80 shadow-md shadow-blue-500/10'
                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                              {layout.name}
                              {isActive && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                                  Activo
                                </span>
                              )}
                            </h3>
                            {layout.shortcut && (
                              <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                                Acceso rápido: {layout.shortcut}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDuplicate(layout)}
                          title="Duplicar como personalizado"
                          className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        {layout.description}
                      </p>

                      {/* Visual Specs Badges */}
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-zinc-400 mb-3 bg-zinc-900/90 p-2 rounded-lg border border-zinc-800/80">
                        <div className="truncate">
                          <span className="text-zinc-500">Herram:</span>{' '}
                          <span className={layout.toolbar.visible ? 'text-zinc-200' : 'text-zinc-500'}>
                            {layout.toolbar.visible ? 'Visible' : 'Oculto'}
                          </span>
                        </div>
                        <div className="truncate">
                          <span className="text-zinc-500">Inspector:</span>{' '}
                          <span className={layout.inspector.visible ? 'text-zinc-200' : 'text-zinc-500'}>
                            {layout.inspector.visible ? `${layout.inspector.width}px` : 'Oculto'}
                          </span>
                        </div>
                        <div className="truncate">
                          <span className="text-zinc-500">Timeline:</span>{' '}
                          <span className={layout.timeline.visible ? 'text-zinc-200' : 'text-zinc-500'}>
                            {layout.timeline.visible ? `${layout.timeline.height}px` : 'Minimizado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                      <div className="text-[10px] text-zinc-500 font-mono">Modo de Fábrica</div>
                      <button
                        onClick={() => handleApply(layout)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                        }`}
                      >
                        {isActive ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{isActive ? 'Aplicado' : 'Activar Modo'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CUSTOM USER LAYOUTS */}
          {activeTab === 'custom' && (
            <div className="space-y-3">
              {customLayouts.length === 0 ? (
                <div className="text-center py-12 bg-zinc-950/60 rounded-xl border border-zinc-800/80 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                    <Layout className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-200">Aún no tienes espacios personalizados</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Ajusta los paneles arrastrando sus bordes, activa o desactiva herramientas en el lienzo y guarda tu configuración única.
                  </p>
                  <button
                    onClick={() => setActiveTab('saveCurrent')}
                    className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Espacio Actual</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {customLayouts.map((layout) => {
                    const IconComponent = ICON_MAP[layout.icon] || Layout;
                    const isActive = activeLayoutId === layout.id;
                    const isEditing = editingLayoutId === layout.id;

                    return (
                      <div
                        key={layout.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          isActive
                            ? 'bg-blue-950/25 border-blue-500/80 shadow-md shadow-blue-500/10'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isActive ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'
                              }`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="bg-zinc-900 border border-blue-500 text-xs px-1.5 py-0.5 rounded text-zinc-100 font-bold outline-none"
                                  />
                                ) : (
                                  <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                                    {layout.name}
                                    {isActive && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                                        Activo
                                      </span>
                                    )}
                                  </h3>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <button
                                  onClick={() => handleSaveEdit(layout)}
                                  className="p-1 text-emerald-400 hover:bg-zinc-800 rounded cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStartEdit(layout)}
                                  title="Renombrar diseño"
                                  className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDuplicate(layout)}
                                title="Duplicar diseño"
                                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(layout.id)}
                                title="Eliminar diseño"
                                className="p-1 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {isEditing ? (
                            <input
                              type="text"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-zinc-300 outline-none mb-2"
                              placeholder="Descripción del diseño..."
                            />
                          ) : (
                            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                              {layout.description}
                            </p>
                          )}

                          {/* Visual Specs */}
                          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-zinc-400 mb-3 bg-zinc-900/90 p-2 rounded-lg border border-zinc-800/80">
                            <div className="truncate">
                              <span className="text-zinc-500">Herram:</span>{' '}
                              <span className={layout.toolbar.visible ? 'text-zinc-200' : 'text-zinc-500'}>
                                {layout.toolbar.visible ? `Vis (${layout.toolbar.position})` : 'Oculto'}
                              </span>
                            </div>
                            <div className="truncate">
                              <span className="text-zinc-500">Inspector:</span>{' '}
                              <span className={layout.inspector.visible ? 'text-zinc-200' : 'text-zinc-500'}>
                                {layout.inspector.visible ? `${layout.inspector.width}px` : 'Oculto'}
                              </span>
                            </div>
                            <div className="truncate">
                              <span className="text-zinc-500">Timeline:</span>{' '}
                              <span className={layout.timeline.visible ? 'text-zinc-200' : 'text-zinc-500'}>
                                {layout.timeline.visible ? `${layout.timeline.height}px` : 'Minimizado'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                          <button
                            onClick={() => {
                              saveCustomLayout({
                                ...layout,
                                toolbar: { ...currentConfig.toolbar },
                                inspector: { ...currentConfig.inspector },
                                timeline: { ...currentConfig.timeline },
                                viewport: { ...currentConfig.viewport },
                              });
                              refreshList();
                            }}
                            title="Actualizar este diseño con las dimensiones actuales de la pantalla"
                            className="text-[11px] text-zinc-400 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Sobrescribir con actual</span>
                          </button>

                          <button
                            onClick={() => handleApply(layout)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                            }`}
                          >
                            {isActive ? <Check className="w-3.5 h-3.5" /> : null}
                            <span>{isActive ? 'Aplicado' : 'Activar'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVE CURRENT FORM */}
          {activeTab === 'saveCurrent' && (
            <form onSubmit={handleSaveCurrentAsNew} className="max-w-xl mx-auto space-y-4 text-xs">
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Save className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-100">Guardar Disposición Actual de la Pantalla</h3>
                    <p className="text-[11px] text-zinc-400">Captura la visibilidad, anchos y herramientas del lienzo activo</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-zinc-300">
                    Nombre del Espacio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="p. ej., Mi Setup 4K, Modo Animación Rápida..."
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 outline-none text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-zinc-300">
                    Descripción
                  </label>
                  <input
                    type="text"
                    placeholder="Finalidad del espacio de trabajo..."
                    value={saveDesc}
                    onChange={(e) => setSaveDesc(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 outline-none text-xs"
                  />
                </div>

                {/* Icon Grid */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-zinc-300">
                    Icono
                  </label>
                  <div className="grid grid-cols-6 gap-2 p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                    {Object.entries(ICON_MAP).map(([id, IconComp]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSaveIcon(id)}
                        className={`p-2 rounded flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          saveIcon === id ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[9px] capitalize">{id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Specs Snapshot */}
                <div className="p-3 bg-zinc-900/90 rounded-lg border border-zinc-800 space-y-1 font-mono text-[11px] text-zinc-400">
                  <div className="text-zinc-300 font-bold mb-1">Resumen del Estado Actual:</div>
                  <div>• Barra Herramientas: {currentConfig.toolbar.visible ? `Visible (${currentConfig.toolbar.position})` : 'Oculto'}</div>
                  <div>• Inspector de Propiedades: {currentConfig.inspector.visible ? `${currentConfig.inspector.width}px (${currentConfig.inspector.position})` : 'Oculto'}</div>
                  <div>• Línea de Tiempo: {currentConfig.timeline.visible ? `${currentConfig.timeline.height}px` : 'Oculto / Minimizado'}</div>
                  <div>• Rejilla: {currentConfig.viewport.showGrid ? 'Activa' : 'Inactiva'} | Safe Areas: {currentConfig.viewport.showSafeAreas ? 'Activa' : 'Inactiva'}</div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="submit"
                    disabled={!saveName.trim()}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20 text-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar y Aplicar</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: IMPORT / EXPORT */}
          {activeTab === 'io' && (
            <div className="max-w-xl mx-auto space-y-4 text-xs">
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-400" />
                  Exportar Diseños Personalizados
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Descarga un archivo JSON con todos tus espacios de trabajo personalizados para respaldarlos o compartirlos en otro dispositivo.
                </p>
                <button
                  onClick={handleExportJson}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo JSON de Diseños</span>
                </button>
              </div>

              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Importar Diseños desde Archivo JSON
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Carga un archivo de respaldo previo para restaurar tus espacios de trabajo guardados.
                </p>
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Seleccionar Archivo JSON</span>
                </button>
                {importStatus && (
                  <p className="text-xs font-mono text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-800/50">
                    {importStatus}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <div className="text-zinc-500 text-[11px] font-mono">
            Usa <span className="text-zinc-300 font-bold">Alt+1</span> a <span className="text-zinc-300 font-bold">Alt+5</span> para alternar modos rápidamente.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
