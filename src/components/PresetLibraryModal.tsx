import React, { useState, useEffect, useMemo } from 'react';
import { Composition } from '../types';
import { TEMPLATE_CATALOG, TemplateDefinition, TemplateCategory } from '../data/richTemplates';
import {
  STANDARD_DIMENSION_PRESETS,
  adaptCompositionToDimensions,
  findDimensionPreset,
} from '../utils/templateAdapter';
import {
  evaluateLayer,
  generateStarPath,
  generatePolygonPath,
} from '../utils/animEngine';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Check,
  Layers,
  ArrowRight,
  Plus,
  Layout,
  Calendar,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Search,
  Sparkles,
  Cake,
  Wrench,
} from 'lucide-react';

interface PresetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComposition: (comp: Composition) => void;
  onNewBlankComposition: () => void;
}

type CategoryTab = 'todos' | TemplateCategory;
type AspectTab = 'todos' | '1:1' | '9:16' | '16:9';

export const PresetLibraryModal: React.FC<PresetLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectComposition,
  onNewBlankComposition,
}) => {
  // Selected Category Tab
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>('todos');

  // Selected Aspect Ratio Tab
  const [selectedAspect, setSelectedAspect] = useState<AspectTab>('todos');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Template ID
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATE_CATALOG[0].id);

  // Selected Dimension Preset
  const [selectedDimPresetId, setSelectedDimPresetId] = useState<string>('original');
  const [customWidth, setCustomWidth] = useState<number>(1080);
  const [customHeight, setCustomHeight] = useState<number>(1080);

  // Live Preview Playback State
  const [previewTime, setPreviewTime] = useState<number>(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(true);

  // Find active template definition
  const activeTemplate = useMemo(() => {
    return (
      TEMPLATE_CATALOG.find((t) => t.id === selectedTemplateId) ||
      TEMPLATE_CATALOG[0]
    );
  }, [selectedTemplateId]);

  // Target Dimensions based on preset selection
  const targetDimensions = useMemo(() => {
    if (selectedDimPresetId === 'original') {
      return {
        width: activeTemplate.composition.width,
        height: activeTemplate.composition.height,
        isCustom: false,
      };
    }
    if (selectedDimPresetId === 'custom') {
      return {
        width: Math.max(50, Math.min(3840, customWidth || 1080)),
        height: Math.max(50, Math.min(3840, customHeight || 1080)),
        isCustom: true,
      };
    }
    const preset = findDimensionPreset(selectedDimPresetId);
    if (preset && preset.width > 0) {
      return {
        width: preset.width,
        height: preset.height,
        isCustom: false,
      };
    }
    return {
      width: activeTemplate.composition.width,
      height: activeTemplate.composition.height,
      isCustom: false,
    };
  }, [selectedDimPresetId, activeTemplate, customWidth, customHeight]);

  // Adapted Composition in real-time
  const adaptedComposition = useMemo(() => {
    return adaptCompositionToDimensions(
      activeTemplate.composition,
      targetDimensions.width,
      targetDimensions.height
    );
  }, [activeTemplate, targetDimensions]);

  // Animation Loop for the Live Preview (60 FPS)
  useEffect(() => {
    if (!isOpen || !isPreviewPlaying) return;
    let frameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setPreviewTime((prev) => {
        const next = prev + dt;
        if (next >= adaptedComposition.duration) {
          return 0;
        }
        return next;
      });

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, isPreviewPlaying, adaptedComposition.duration]);

  // Filtered Templates list by category, aspect ratio, and search query
  const filteredTemplates = useMemo(() => {
    return TEMPLATE_CATALOG.filter((t) => {
      // Category filter
      if (selectedCategory !== 'todos' && t.category !== selectedCategory) {
        return false;
      }
      // Aspect filter
      if (selectedAspect !== 'todos' && t.aspectRatio !== selectedAspect) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchesCat = t.categoryLabel.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTags && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedAspect, searchQuery]);

  // Keyboard shortcut listener (Escape closes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleApplyTemplate = () => {
    onSelectComposition(adaptedComposition);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-6xl h-[92vh] max-h-[880px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-zinc-100">
                  Biblioteca de Plantillas &amp; Anuncios Animados
                </h2>
                <span className="text-[11px] font-mono text-zinc-400">
                  Colección 2026
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Anuncios modernos de alto impacto listos para personalizar y exportar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewBlankComposition();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Lienzo en Blanco</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs Strip */}
        <div className="px-6 py-2.5 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'todos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Todos ({TEMPLATE_CATALOG.length})</span>
          </button>
          <button
            onClick={() => setSelectedCategory('restaurantes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'restaurantes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Restaurantes</span>
          </button>
          <button
            onClick={() => setSelectedCategory('pastelerias')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'pastelerias'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <Cake className="w-3.5 h-3.5" />
            <span>Pastelerías &amp; Reposterías</span>
          </button>
          <button
            onClick={() => setSelectedCategory('talleres')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'talleres'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Talleres &amp; Oficios</span>
          </button>
          <button
            onClick={() => setSelectedCategory('productos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'productos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Productos</span>
          </button>
          <button
            onClick={() => setSelectedCategory('servicios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'servicios'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Servicios</span>
          </button>
          <button
            onClick={() => setSelectedCategory('eventos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'eventos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Eventos</span>
          </button>
        </div>

        {/* Main 2-Column Studio Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Template Cards Catalog */}
          <div className="w-full md:w-5/12 border-r border-zinc-800 flex flex-col bg-zinc-950 overflow-hidden">
            {/* Search Bar & Aspect Ratio Filter */}
            <div className="p-3 bg-zinc-900/40 border-b border-zinc-800/80 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por temática, palabra clave o formato..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Aspect Ratio Filter Buttons */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-zinc-500 text-[10px] font-mono mr-1">Formato:</span>
                {(['todos', '1:1', '9:16', '16:9'] as const).map((aspect) => (
                  <button
                    key={aspect}
                    onClick={() => setSelectedAspect(aspect)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      selectedAspect === aspect
                        ? 'bg-zinc-800 text-blue-400 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {aspect === 'todos' ? 'Todos' : aspect}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Card List */}
            <div className="flex-1 p-3.5 overflow-y-auto custom-scrollbar space-y-2.5">
              {filteredTemplates.length === 0 ? (
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-2.5 text-base">
                    📁
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-200 mb-1">
                    No hay plantillas que coincidan
                  </h4>
                  <p className="text-[11px] text-zinc-400 max-w-xs mb-3">
                    Prueba cambiando la categoría, relación de aspecto o limpiando la búsqueda.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('todos');
                      setSelectedAspect('todos');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const isSelected = template.id === selectedTemplateId;
                  return (
                    <div
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        setPreviewTime(0);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-950/30 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                          : 'bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-blue-400">
                              {template.aspectRatio}
                            </span>
                            <span className="text-zinc-600 text-[10px]">·</span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {template.categoryLabel}
                            </span>
                          </div>
                          <h3
                            className={`text-xs font-bold transition-colors ${
                              isSelected ? 'text-blue-300' : 'text-zinc-200'
                            }`}
                          >
                            {template.name}
                          </h3>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-850/80">
                        <span>{template.recommendedSize}</span>
                        <span aria-hidden="true">·</span>
                        <span>{template.composition.duration}s</span>
                        <span aria-hidden="true">·</span>
                        <span>{template.composition.layers.length} capas</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Live Interactive Adaptive Studio Preview */}
          <div className="w-full md:w-7/12 flex flex-col bg-zinc-950 overflow-hidden">
            {/* Dimensions Selector Strip */}
            <div className="p-3.5 bg-zinc-900/50 border-b border-zinc-800 flex flex-col gap-2.5 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">Medidas de salida:</span>
                  <select
                    value={selectedDimPresetId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedDimPresetId(val);
                      const p = findDimensionPreset(val);
                      if (p && p.width > 0) {
                        setCustomWidth(p.width);
                        setCustomHeight(p.height);
                      }
                    }}
                    className="bg-zinc-850 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 cursor-pointer font-mono"
                  >
                    <option value="original">
                      Tamaño Original ({activeTemplate.composition.width} × {activeTemplate.composition.height})
                    </option>
                    <optgroup label="Formatos Populares Web & Redes">
                      <option value="social_1080x1080">1080 × 1080 (Feed Instagram / Cuadrado 1:1)</option>
                      <option value="social_1080x1920">1080 × 1920 (Stories / Reels / TikTok 9:16)</option>
                      <option value="video_1920x1080">1920 × 1080 (Full HD Horizontal 16:9)</option>
                      <option value="ad_600x500">600 × 500 (Portada / Gran Rectángulo)</option>
                      <option value="ad_728x90">728 × 90 (Leaderboard Horizontal)</option>
                      <option value="ad_640x200">640 × 200 (Banner Cabecera / Sección)</option>
                      <option value="ad_1100x361">1100 × 361 (Super Billboard Panorámico)</option>
                      <option value="gads_300x250">300 × 250 (Google Ads / Medium Rectangle)</option>
                      <option value="gads_300x600">300 × 600 (Half Page / Skyscraper)</option>
                    </optgroup>
                    <option value="custom">Medida Personalizada...</option>
                  </select>
                </div>

                {/* Quick Presets Pills */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDimPresetId('original')}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      selectedDimPresetId === 'original'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDimPresetId('social_1080x1080');
                      setCustomWidth(1080);
                      setCustomHeight(1080);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      selectedDimPresetId === 'social_1080x1080'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    1:1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDimPresetId('social_1080x1920');
                      setCustomWidth(1080);
                      setCustomHeight(1920);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      selectedDimPresetId === 'social_1080x1920'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    9:16 Story
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDimPresetId('video_1920x1080');
                      setCustomWidth(1920);
                      setCustomHeight(1080);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      selectedDimPresetId === 'video_1920x1080'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    16:9 HD
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDimPresetId('ad_600x500');
                      setCustomWidth(600);
                      setCustomHeight(500);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      selectedDimPresetId === 'ad_600x500'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    600×500
                  </button>
                </div>

                {selectedDimPresetId === 'custom' && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 100;
                        setCustomWidth(val);
                      }}
                      className="w-16 bg-zinc-850 border border-zinc-700 px-2 py-1 rounded text-center"
                      placeholder="Ancho"
                    />
                    <span>×</span>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 100;
                        setCustomHeight(val);
                      }}
                      className="w-16 bg-zinc-850 border border-zinc-700 px-2 py-1 rounded text-center"
                      placeholder="Alto"
                    />
                    <span className="text-zinc-500">px</span>
                  </div>
                )}
              </div>

              {/* Active Reframe Information Pill */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-850">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/50 text-blue-300 font-mono font-semibold">
                    {targetDimensions.width} × {targetDimensions.height} px
                  </span>
                  <span>
                    {targetDimensions.width !== activeTemplate.composition.width ||
                    targetDimensions.height !== activeTemplate.composition.height
                      ? 'Reframe Inteligente activo (capas y tipografía reorganizadas a escala)'
                      : 'Dimensiones originales de la plantilla'}
                  </span>
                </div>
                <span className="text-zinc-500 font-mono">
                  {adaptedComposition.layers.length} capas adaptadas
                </span>
              </div>
            </div>

            {/* Viewport Canvas Stage */}
            <div className="flex-1 bg-zinc-950 p-6 flex items-center justify-center overflow-hidden relative">
              {/* Checkerboard Background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #38bdf8 0.75px, transparent 0.75px)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Scaled Composition Container */}
              <div
                style={{
                  width: `${targetDimensions.width}px`,
                  height: `${targetDimensions.height}px`,
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `scale(${Math.min(
                    480 / Math.max(targetDimensions.width, 1),
                    360 / Math.max(targetDimensions.height, 1),
                    1
                  )})`,
                  transformOrigin: 'center center',
                  backgroundColor: adaptedComposition.backgroundColor,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
                }}
                className="relative rounded-lg overflow-hidden border border-zinc-800 transition-transform shrink-0"
              >
                <svg
                  width={targetDimensions.width}
                  height={targetDimensions.height}
                  viewBox={`0 0 ${targetDimensions.width} ${targetDimensions.height}`}
                  className="w-full h-full overflow-hidden select-none pointer-events-none"
                >
                  {[...adaptedComposition.layers]
                    .reverse()
                    .filter((l) => l.visible)
                    .map((layer) => {
                      const evalProps = evaluateLayer(layer, previewTime);
                      const posX = evalProps.position.x;
                      const posY = evalProps.position.y;
                      const scX = evalProps.scale.x / 100;
                      const scY = evalProps.scale.y / 100;
                      const rot = evalProps.rotation;
                      const op = evalProps.opacity / 100;

                      let shapeElement: React.ReactNode = null;

                      if (layer.type === 'rect' && layer.rect) {
                        const w = evalProps.rect?.width ?? layer.rect.width.value;
                        const h = evalProps.rect?.height ?? layer.rect.height.value;
                        const cr = evalProps.rect?.cornerRadius ?? layer.rect.cornerRadius.value;
                        shapeElement = (
                          <rect
                            x={-w / 2}
                            y={-h / 2}
                            width={w}
                            height={h}
                            rx={cr}
                            ry={cr}
                            fill={evalProps.fill}
                            stroke={evalProps.stroke}
                            strokeWidth={evalProps.strokeWidth}
                            opacity={op}
                          />
                        );
                      } else if (layer.type === 'circle' && layer.circle) {
                        const rx = evalProps.circle?.radiusX ?? layer.circle.radiusX.value;
                        const ry = evalProps.circle?.radiusY ?? layer.circle.radiusY.value;
                        shapeElement = (
                          <ellipse
                            cx={0}
                            cy={0}
                            rx={rx}
                            ry={ry}
                            fill={evalProps.fill}
                            stroke={evalProps.stroke}
                            strokeWidth={evalProps.strokeWidth}
                            opacity={op}
                          />
                        );
                      } else if (layer.type === 'star' && layer.star) {
                        const pts = evalProps.star?.points ?? layer.star.points.value;
                        const rOut = evalProps.star?.outerRadius ?? layer.star.outerRadius.value;
                        const rIn = evalProps.star?.innerRadius ?? layer.star.innerRadius.value;
                        const pathD = generateStarPath(pts, rOut, rIn);
                        shapeElement = (
                          <path
                            d={pathD}
                            fill={evalProps.fill}
                            stroke={evalProps.stroke}
                            strokeWidth={evalProps.strokeWidth}
                            opacity={op}
                          />
                        );
                      } else if (layer.type === 'polygon' && layer.polygon) {
                        const sides = evalProps.polygon?.sides ?? layer.polygon.sides.value;
                        const r = evalProps.polygon?.radius ?? layer.polygon.radius.value;
                        const pathD = generatePolygonPath(sides, r);
                        shapeElement = (
                          <path
                            d={pathD}
                            fill={evalProps.fill}
                            stroke={evalProps.stroke}
                            strokeWidth={evalProps.strokeWidth}
                            opacity={op}
                          />
                        );
                      } else if (layer.type === 'text' && layer.text) {
                        const fs = evalProps.text?.fontSize ?? layer.text.fontSize.value;
                        const lines = (layer.text.text || '').split('\n');
                        shapeElement = (
                          <text
                            x={0}
                            y={0}
                            fill={evalProps.fill}
                            fontSize={fs}
                            fontFamily={layer.text.fontFamily || 'sans-serif'}
                            fontWeight={layer.text.fontWeight || 'bold'}
                            textAnchor="middle"
                            dominantBaseline="central"
                            opacity={op}
                          >
                            {lines.length > 1
                              ? lines.map((line, idx) => (
                                  <tspan
                                    key={idx}
                                    x={0}
                                    dy={idx === 0 ? `-${(lines.length - 1) * 0.55}em` : '1.2em'}
                                  >
                                    {line}
                                  </tspan>
                                ))
                              : layer.text.text}
                          </text>
                        );
                      }

                      return (
                        <g
                          key={layer.id}
                          transform={`translate(${posX}, ${posY}) rotate(${rot}) scale(${scX}, ${scY})`}
                        >
                          {shapeElement}
                        </g>
                      );
                    })}
                </svg>
              </div>

              {/* Floating Size Tag */}
              <div className="absolute top-3 right-3 bg-zinc-950/90 border border-zinc-800 text-[10px] font-mono text-zinc-300 px-2.5 py-1 rounded-md shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Vista Previa en Vivo 60fps</span>
              </div>
            </div>

            {/* Transport Scrubber & Action Controls */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-col gap-3 shrink-0">
              {/* Scrubber Bar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  title={isPreviewPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPreviewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setPreviewTime(0)}
                  className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Reiniciar a 0s"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min={0}
                  max={adaptedComposition.duration}
                  step={0.01}
                  value={previewTime}
                  onChange={(e) => {
                    setPreviewTime(parseFloat(e.target.value));
                    setIsPreviewPlaying(false);
                  }}
                  className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />

                <span className="text-[11px] font-mono text-zinc-400 w-16 text-right shrink-0">
                  {previewTime.toFixed(2)}s / {adaptedComposition.duration.toFixed(1)}s
                </span>
              </div>

              {/* Master Use Template CTA */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>
                    {adaptedComposition.layers.length} Capas Vectoriales animadas
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleApplyTemplate}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <span>Cargar en el Editor ({targetDimensions.width} × {targetDimensions.height})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
