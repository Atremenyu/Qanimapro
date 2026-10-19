import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Diamond,
  MousePointer,
  Move,
  Layers,
  Zap,
  Sliders,
  Scissors,
  Flame,
  Activity,
  Repeat,
  FileCode2,
  Keyboard,
  Play,
  RotateCw,
  Compass,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Eye,
  PenTool,
  Square,
  Circle,
  Star,
  Type,
  Maximize2,
  RefreshCw,
  Info,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { EasingType } from '../types';

export type GuideSectionId =
  | 'overview'
  | 'keyframes'
  | 'shapes_vector'
  | 'styles_trim'
  | 'modifiers_fx'
  | 'curves_easing'
  | 'presets_motion'
  | 'export_html5'
  | 'shortcuts_pro';

interface LearningGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: GuideSectionId;
  onStartInteractiveTour?: () => void;
  onOpenPresets?: () => void;
  onOpenExport?: () => void;
}

export const LearningGuideModal: React.FC<LearningGuideModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'overview',
  onStartInteractiveTour,
  onOpenPresets,
  onOpenExport,
}) => {
  const [activeSection, setActiveSection] = useState<GuideSectionId>(initialSection);

  // Sync initialSection whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  // Mini Interactive Simulator State for Keyframes
  const [simTime, setSimTime] = useState<number>(0);
  const [simIsPlaying, setSimIsPlaying] = useState<boolean>(false);
  const [simKeyframes, setSimKeyframes] = useState<{ id: string; time: number; x: number; rot: number; scale: number; opacity: number }[]>([
    { id: 'k1', time: 0, x: 50, rot: 0, scale: 1, opacity: 100 },
    { id: 'k2', time: 2, x: 260, rot: 180, scale: 1.3, opacity: 80 },
    { id: 'k3', time: 4, x: 120, rot: 360, scale: 1, opacity: 100 },
  ]);
  const [simEasing, setSimEasing] = useState<EasingType>('easeInOut');

  // Mini Interactive Trim Simulator State
  const [trimStartSim, setTrimStartSim] = useState<number>(0);
  const [trimEndSim, setTrimEndSim] = useState<number>(85);

  // Mini Interactive Repeater Simulator
  const [repeaterCopies, setRepeaterCopies] = useState<number>(6);
  const [repeaterAngle, setRepeaterAngle] = useState<number>(60);

  // Mini Interactive Star Simulator
  const [starPoints, setStarPoints] = useState<number>(5);
  const [starInnerR, setStarInnerR] = useState<number>(25);
  const [starOuterR, setStarOuterR] = useState<number>(55);

  // Sim animation loop
  useEffect(() => {
    let animId: number;
    if (simIsPlaying) {
      const startTime = performance.now() - simTime * 1000;
      const loop = () => {
        const now = performance.now();
        let nextTime = ((now - startTime) / 1000) % 4.0;
        setSimTime(nextTime);
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [simIsPlaying]);

  if (!isOpen) return null;

  // Calculate animated position for keyframe simulator
  const sortedSimKfs = [...simKeyframes].sort((a, b) => a.time - b.time);
  let currentSimX = sortedSimKfs[0]?.x || 50;
  let currentSimRot = sortedSimKfs[0]?.rot || 0;
  let currentSimScale = sortedSimKfs[0]?.scale || 1;
  let currentSimOpacity = sortedSimKfs[0]?.opacity || 100;

  for (let i = 0; i < sortedSimKfs.length - 1; i++) {
    const kA = sortedSimKfs[i];
    const kB = sortedSimKfs[i + 1];
    if (simTime >= kA.time && simTime <= kB.time) {
      const progress = (simTime - kA.time) / (kB.time - kA.time);
      // Simple easing math for sim
      let factor = progress;
      if (simEasing === 'easeInOut') factor = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      else if (simEasing === 'easeIn') factor = progress * progress;
      else if (simEasing === 'easeOut') factor = 1 - Math.pow(1 - progress, 2);
      else if (simEasing === 'bounce') factor = 1 - Math.abs(Math.cos(progress * Math.PI * 3)) * (1 - progress);

      currentSimX = kA.x + (kB.x - kA.x) * factor;
      currentSimRot = kA.rot + (kB.rot - kA.rot) * factor;
      currentSimScale = kA.scale + (kB.scale - kA.scale) * factor;
      currentSimOpacity = kA.opacity + (kB.opacity - kA.opacity) * factor;
      break;
    }
  }

  const sectionsList: { id: GuideSectionId; label: string; icon: React.ReactNode; category: string }[] = [
    { id: 'overview', label: 'Bienvenido y Flujo de Trabajo', icon: <Sparkles className="w-4 h-4 text-blue-400" />, category: 'Inicio' },
    { id: 'keyframes', label: 'Keyframes y Línea de Tiempo', icon: <Diamond className="w-4 h-4 text-amber-400" />, category: 'Animación' },
    { id: 'curves_easing', label: 'Editor de Curvas y Aceleración', icon: <TrendingUp className="w-4 h-4 text-purple-400" />, category: 'Animación' },
    { id: 'presets_motion', label: 'Presets de Movimiento GSAP', icon: <Zap className="w-4 h-4 text-emerald-400" />, category: 'Animación' },
    { id: 'shapes_vector', label: 'Formas y Pluma Bézier', icon: <PenTool className="w-4 h-4 text-indigo-400" />, category: 'Diseño' },
    { id: 'styles_trim', label: 'Estilos y Trim Paths (Trazos)', icon: <Scissors className="w-4 h-4 text-pink-400" />, category: 'Diseño' },
    { id: 'modifiers_fx', label: 'Modificadores: Repeater & Wiggle', icon: <Repeat className="w-4 h-4 text-cyan-400" />, category: 'Efectos' },
    { id: 'export_html5', label: 'Exportación HTML5 Micro-Package', icon: <FileCode2 className="w-4 h-4 text-orange-400" />, category: 'Producción' },
    { id: 'shortcuts_pro', label: 'Atajos y Técnicas Profesionales', icon: <Keyboard className="w-4 h-4 text-emerald-400" />, category: 'Pro' },
  ];

  return (
    <div
      id="learning_guide_modal_backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="learning_guide_modal_container"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl h-[88vh] max-h-[820px] shadow-2xl flex flex-col overflow-hidden text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="h-14 px-6 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Centro de Aprendizaje y Guías Interactivas
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-medium border border-blue-500/30">
                  VectorMotion Academy
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Domina todos los aspectos de animación HTML5, vectores, keyframes y curvas como un profesional.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onStartInteractiveTour && (
              <button
                onClick={() => {
                  onClose();
                  onStartInteractiveTour();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Iniciar Tour Guiado en Vivo</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY: SIDEBAR + CONTENT AREA */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* LEFT SIDEBAR: TOPICS */}
          <div className="w-64 border-r border-zinc-850 bg-zinc-950/80 p-3 overflow-y-auto shrink-0 space-y-1">
            <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              Módulos de Aprendizaje
            </div>

            {sectionsList.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 border border-blue-500/40 text-blue-200 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1 rounded-md ${isActive ? 'bg-blue-500/20' : 'bg-zinc-900'}`}>
                      {sec.icon}
                    </div>
                    <span className="truncate">{sec.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                </button>
              );
            })}

            <div className="pt-4 px-2">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
                <FileCode2 className="w-5 h-5 text-blue-400 mx-auto" />
                <div className="text-[11px] font-bold text-zinc-200">¿Listo para exportar?</div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Exporta micro-paquetes HTML5 standalone menores a 4KB compatibles con Google Ads.
                </p>
                {onOpenExport && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenExport();
                    }}
                    className="w-full py-1 text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
                  >
                    Abrir Exportador
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT & SIMULATORS */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Bienvenido a VectorMotion Studio
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    VectorMotion es una suite profesional de diseño y animación vectorial basada en la web. Está inspirada en los estándares de la industria como <strong>Google Web Designer</strong>, <strong>After Effects</strong> y <strong>Figma</strong>.
                  </p>
                </div>

                {/* 4 Core pillars */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Diamond className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-100">1. Animación por Keyframes</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Flujo idéntico a Google Web Designer: doble clic en la pista para insertar un fotograma clave, arrastra para reubicar y presiona F6 para marcar el segundo actual.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-100">2. Motor Vectorial y Pluma Bézier</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Crea rectángulos redondeados, polígonos regulares, estrellas multicapa y trazados libres Bézier con puntos tangenciales de control continuo.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-100">3. Trim Paths y Modificadores</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Efectos tipo After Effects: anima el dibujo de contornos (Trim Path), genera mandalas radiales procedurales con el <strong>Repeater</strong> y vibraciones orgánicas con <strong>Wiggle</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <FileCode2 className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-100">4. Micro-Paquete HTML5 Standalone</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Genera código HTML5/CSS/SVG ultra-optimizado de menos de 4KB con 60FPS constantes, sin dependencias externas, listo para Google Ads, web banners y UI interactiva.
                    </p>
                  </div>
                </div>

                {/* Quick Interactive Tour Banner */}
                {onStartInteractiveTour && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-purple-950/40 border border-blue-800/40 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-blue-400" />
                        ¿Prefieres un recorrido interactivo paso a paso por la interfaz?
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        Te guiaremos por las 5 zonas principales de la aplicación para que aprendas en menos de 2 minutos.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onStartInteractiveTour();
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 shrink-0 transition-all cursor-pointer"
                    >
                      Empezar Tour
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. KEYFRAMES & TIMELINE (GWD STYLE) */}
            {activeSection === 'keyframes' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Diamond className="w-5 h-5 text-amber-400" />
                      Guía Completa: Keyframes y Línea de Tiempo
                    </h3>
                    <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                      Google Web Designer Standard
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Aprende los métodos exactos para crear, editar, mover y eliminar fotogramas clave en segundos.
                  </p>
                </div>

                {/* Interactive Simulator */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Simulador Interactivo de Keyframes en Vivo
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSimIsPlaying(!simIsPlaying)}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold transition-all ${
                          simIsPlaying ? 'bg-amber-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{simIsPlaying ? 'Pausar' : 'Reproducir'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setSimIsPlaying(false);
                          setSimTime(0);
                        }}
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                        title="Reiniciar"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Stage */}
                  <div className="h-28 bg-zinc-950 border border-zinc-850 rounded-lg relative overflow-hidden flex items-center px-4">
                    {/* Visual object moving */}
                    <div
                      className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 border border-blue-400 shadow-lg flex items-center justify-center absolute transition-none"
                      style={{
                        transform: `translateX(${currentSimX}px) rotate(${currentSimRot}deg) scale(${currentSimScale})`,
                        opacity: currentSimOpacity / 100,
                      }}
                    >
                      <Diamond className="w-5 h-5 text-white" />
                    </div>

                    <div className="absolute bottom-2 right-3 font-mono text-[10px] text-zinc-500">
                      Posición: {Math.round(currentSimX)}px | Rot: {Math.round(currentSimRot)}° | Escala: {currentSimScale.toFixed(2)}x
                    </div>
                  </div>

                  {/* Interactive timeline scrubber for sim */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>Tiempo del Cabezal: {simTime.toFixed(2)}s</span>
                      <div className="flex items-center gap-1">
                        <span>Curva:</span>
                        <select
                          value={simEasing}
                          onChange={(e) => setSimEasing(e.target.value as EasingType)}
                          className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-[10px] rounded px-1 py-0.5"
                        >
                          <option value="easeInOut">easeInOut</option>
                          <option value="easeOut">easeOut</option>
                          <option value="easeIn">easeIn</option>
                          <option value="bounce">bounce</option>
                          <option value="linear">linear</option>
                        </select>
                      </div>
                    </div>

                    {/* Timeline bar with keyframes */}
                    <div
                      className="h-8 bg-zinc-950 border border-zinc-800 rounded relative cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const newT = Math.max(0, Math.min(4.0, (clickX / rect.width) * 4.0));
                        setSimTime(newT);
                      }}
                      onDoubleClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const newT = Math.max(0, Math.min(4.0, (clickX / rect.width) * 4.0));
                        // Insert new simulated keyframe
                        setSimKeyframes((prev) => [
                          ...prev,
                          { id: 'k_' + Date.now(), time: newT, x: Math.random() * 260 + 40, rot: Math.random() * 360, scale: 1.1, opacity: 90 },
                        ]);
                      }}
                    >
                      {/* Playhead */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none"
                        style={{ left: `${(simTime / 4.0) * 100}%` }}
                      >
                        <div className="w-2.5 h-2.5 bg-rose-500 rotate-45 -translate-x-[4px] -translate-y-1" />
                      </div>

                      {/* Diamonds */}
                      {simKeyframes.map((kf) => (
                        <div
                          key={kf.id}
                          className="absolute top-2 w-3.5 h-3.5 bg-amber-400 border border-amber-200 rotate-45 -translate-x-1.5 shadow-sm hover:scale-125 transition-transform"
                          style={{ left: `${(kf.time / 4.0) * 100}%` }}
                          title={`Keyframe en ${kf.time.toFixed(1)}s (Haz doble clic en cualquier punto para crear otro)`}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-zinc-500 flex justify-between font-mono">
                      <span>0.0s (Haz clic o doble clic para añadir keyframes)</span>
                      <span>2.0s</span>
                      <span>4.0s</span>
                    </div>
                  </div>
                </div>

                {/* 3 Steps Guide */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-200">Doble Clic en la Pista (Google Web Designer)</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Coloca el puntero del ratón en cualquier segundo de la pista de la capa en la línea de tiempo y haz <strong>Doble Clic</strong>. Se insertará inmediatamente un keyframe (<strong>◆</strong>) con el valor actual.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-200">Auto-Keyframe Inteligente</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Mueve el cabezal rojo a otro segundo (por ejemplo <strong>2.0s</strong>) y luego rota, agranda o cambia la opacidad del objeto desde el lienzo o inspector. ¡El keyframe se creará automáticamente en ese segundo exacto!
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-200">Atajo de Teclado F6 / K</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Pulsa la tecla <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-amber-300">F6</kbd> o <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-amber-300">K</kbd> con una capa seleccionada para fijar un keyframe instantáneamente en la posición actual de la aguja de reproducción.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SHAPES & PEN TOOL */}
            {activeSection === 'shapes_vector' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-indigo-400" />
                    Guía: Formas Vectoriales y Pluma Bézier
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Crea gráficos vectoriales nítidos con escalado infinito y control total de nodos y vértices.
                  </p>
                </div>

                {/* Interactive Star & Geometry Playground */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Laboratorio Interactivo de Geometría Vectorial
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">SVG Paramétrico en tiempo real</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    {/* SVG Preview */}
                    <div className="h-40 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-center">
                      <svg width="150" height="150" viewBox="-75 -75 150 150">
                        {/* Render dynamic star path */}
                        {(() => {
                          const points: string[] = [];
                          const step = Math.PI / starPoints;
                          for (let i = 0; i < 2 * starPoints; i++) {
                            const r = i % 2 === 0 ? starOuterR : starInnerR;
                            const angle = i * step - Math.PI / 2;
                            points.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`);
                          }
                          return (
                            <polygon
                              points={points.join(' ')}
                              fill="url(#starGrad)"
                              stroke="#818cf8"
                              strokeWidth="3"
                              strokeLinejoin="round"
                            />
                          );
                        })()}
                        <defs>
                          <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Interactive controls */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Número de Puntas / Lados:</span>
                          <span className="font-mono text-indigo-300 font-bold">{starPoints}</span>
                        </div>
                        <input
                          type="range"
                          min="3"
                          max="16"
                          value={starPoints}
                          onChange={(e) => setStarPoints(parseInt(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Radio Exterior:</span>
                          <span className="font-mono text-indigo-300 font-bold">{starOuterR}px</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="70"
                          value={starOuterR}
                          onChange={(e) => setStarOuterR(parseInt(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Radio Interior:</span>
                          <span className="font-mono text-indigo-300 font-bold">{starInnerR}px</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={starInnerR}
                          onChange={(e) => setStarInnerR(parseInt(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vector tools catalog */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                    <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <Square className="w-3.5 h-3.5 text-blue-400" /> Rectángulos & Corner Radius
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Permite ajustar radio de esquinas individuales para crear tarjetas modernas, píldoras y botones de llamada a la acción.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                    <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-indigo-400" /> Herramienta Pluma (Pen Tool)
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Haz clic para colocar vértices rectos; mantén presionado y arrastra para crear curvas suaves con tiradores tangenciales.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                    <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <Circle className="w-3.5 h-3.5 text-pink-400" /> Círculos & Elipses
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Soporta radio X e Y independientes para crear anillos, orbes orbitales y máscaras circulares perfectas.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                    <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-emerald-400" /> Texto Vectorial
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Totalmente editable con espaciado de letras (letter-spacing), tamaños y transformación por keyframes de opacidad y escala.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. STYLES & TRIM PATHS */}
            {activeSection === 'styles_trim' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-pink-400" />
                    Guía: Estilos y Animación de Trazo (Trim Paths)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Crea el icónico efecto de dibujo de líneas (Outline Draw) igual que en After Effects y Adobe Animate.
                  </p>
                </div>

                {/* Interactive Trim Path Playground */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-pink-400" />
                      Simulador Interactivo de Trim Paths (Stroke Trim)
                    </span>
                    <span className="text-[10px] font-mono text-pink-400">Start: {trimStartSim}% | End: {trimEndSim}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    {/* SVG Render with stroke-dasharray and stroke-dashoffset */}
                    <div className="h-40 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-center">
                      <svg width="140" height="140" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="6" />
                        {/* Trimmed animated stroke */}
                        {(() => {
                          const circumference = 2 * Math.PI * 40; // ~251.3
                          const visibleLength = Math.max(0, (trimEndSim - trimStartSim) / 100) * circumference;
                          const offset = -(trimStartSim / 100) * circumference;
                          return (
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#ec4899"
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={`${visibleLength} ${circumference}`}
                              strokeDashoffset={offset}
                              style={{ filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.5))' }}
                            />
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Trim Start (Inicio %):</span>
                          <span className="font-mono text-pink-300 font-bold">{trimStartSim}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={trimStartSim}
                          onChange={(e) => setTrimStartSim(parseInt(e.target.value))}
                          className="w-full accent-pink-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Trim End (Final %):</span>
                          <span className="font-mono text-pink-300 font-bold">{trimEndSim}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={trimEndSim}
                          onChange={(e) => setTrimEndSim(parseInt(e.target.value))}
                          className="w-full accent-pink-500 cursor-pointer"
                        />
                      </div>

                      <div className="p-2 rounded bg-pink-950/30 border border-pink-900/40 text-[11px] text-pink-200">
                        💡 <strong>Cómo animarlo:</strong> En 0.0s coloca Start=0, End=0. En 2.0s coloca End=100. ¡El trazo se dibujará solo!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Styling Features */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                    <div className="font-bold text-zinc-200">Degradados Lineales y Radiales</div>
                    <p className="text-[11px] text-zinc-400">
                      Crea paletas con paradas cromáticas y ángulos de iluminación personalizados.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                    <div className="font-bold text-zinc-200">Neon Glow & Ambient Shadows</div>
                    <p className="text-[11px] text-zinc-400">
                      Añade resplandores cyberpunk y sombras suaves difusas con control de radio en píxeles.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. MODIFIERS & EFFECTS */}
            {activeSection === 'modifiers_fx' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-cyan-400" />
                    Guía: Modificadores Procedurales (Repeater & Wiggle)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Añade complejidad procedural a tus gráficos sin duplicar capas manualmente.
                  </p>
                </div>

                {/* Interactive Repeater Simulator */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-cyan-400" />
                      Simulador Interactivo de Repeater Radial (Mandala Effect)
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300">Copias: {repeaterCopies}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    {/* SVG with repeated rotation */}
                    <div className="h-44 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-center overflow-hidden">
                      <svg width="160" height="160" viewBox="-80 -80 160 160">
                        {Array.from({ length: repeaterCopies }).map((_, idx) => (
                          <g key={idx} transform={`rotate(${idx * repeaterAngle})`}>
                            <rect
                              x="15"
                              y="-8"
                              width="30"
                              height="16"
                              rx="4"
                              fill="#06b6d4"
                              fillOpacity={0.7}
                              stroke="#67e8f9"
                              strokeWidth="1.5"
                            />
                          </g>
                        ))}
                      </svg>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Número de Copias:</span>
                          <span className="font-mono text-cyan-300 font-bold">{repeaterCopies}</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="16"
                          value={repeaterCopies}
                          onChange={(e) => {
                            const c = parseInt(e.target.value);
                            setRepeaterCopies(c);
                            setRepeaterAngle(360 / c);
                          }}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Ángulo de Rotación por Copia:</span>
                          <span className="font-mono text-cyan-300 font-bold">{Math.round(repeaterAngle)}°</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="180"
                          value={repeaterAngle}
                          onChange={(e) => setRepeaterAngle(parseInt(e.target.value))}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      <p className="text-[10px] text-zinc-400">
                        El <strong>Repeater</strong> se encuentra disponible en la pestaña <em>Modifiers</em> del Inspector o en el menú superior <em>Filter &gt; Add Radial Repeater</em>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Wiggle explanation */}
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                  <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-zinc-200">Wiggle Expressions (Vibración Orgánica)</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Genera ruido Perlin continuo para simular movimiento natural de cámara flotante, llamas de fuego, temblores o elementos vivos sin necesidad de crear cientos de keyframes manuales.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. CURVES & EASING */}
            {activeSection === 'curves_easing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Guía: Curvas Bézier y Editor de Gráficos (Graph Editor)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    La clave de una animación profesional radica en el ritmo y la aceleración (Easing).
                  </p>
                </div>

                {/* Easing Comparison Grid */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { name: 'easeInOut', desc: 'Comienza lento, acelera en el centro y frena suavemente.', icon: '〰️' },
                    { name: 'easeOut', desc: 'Entrada rápida con frenado elástico natural.', icon: '📉' },
                    { name: 'bounce', desc: 'Efecto de rebote físico como una pelota cayendo.', icon: '🏀' },
                    { name: 'elastic', desc: 'Efecto de resorte elástico con oscilación inercial.', icon: '🎯' },
                    { name: 'back', desc: 'Anticipación y sobreimpulso más allá del destino.', icon: '🏹' },
                    { name: 'linear', desc: 'Velocidad constante mecánica sin aceleración.', icon: '📏' },
                  ].map((ease) => (
                    <div key={ease.name} className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-1">
                      <div className="font-bold text-purple-300 font-mono text-[11px]">
                        {ease.icon} {ease.name}
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">{ease.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Graph Editor instruction */}
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Cómo abrir y usar el Graph Editor
                  </div>
                  <ol className="list-decimal pl-4 text-xs text-zinc-300 space-y-1.5">
                    <li>Selecciona cualquier keyframe en la línea de tiempo.</li>
                    <li>Haz clic en el botón con ícono de curva <strong>Graph Editor</strong> en la esquina derecha de la línea de tiempo.</li>
                    <li>Arrastra los tiradores Bézier azules para personalizar la aceleración y velocidad exacta.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 7. MOTION PRESETS */}
            {activeSection === 'presets_motion' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    Guía: Biblioteca de Presets de Movimiento GSAP
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Aplica animaciones prediseñadas en un clic y modifícalas posteriormente en la línea de tiempo.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">Entradas (In)</span>
                    <div className="font-bold text-zinc-200">Fade In, Zoom Pop, Slide Up, Rotate In</div>
                    <p className="text-[11px] text-zinc-400">Ideales para títulos y banners que aparecen en pantalla.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="font-mono text-[10px] text-blue-400 font-bold uppercase">Loops (Continuos)</span>
                    <div className="font-bold text-zinc-200">Pulse Heartbeat, Floating Hover, Spin 360</div>
                    <p className="text-[11px] text-zinc-400">Para insignias, botones y llamadas a la acción que atraen la atención.</p>
                  </div>
                </div>

                {onOpenPresets && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPresets();
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    Explorar Biblioteca de Plantillas y Presets
                  </button>
                )}
              </div>
            )}

            {/* 8. EXPORT HTML5 */}
            {activeSection === 'export_html5' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileCode2 className="w-5 h-5 text-orange-400" />
                    Guía: Exportación HTML5 Micro-Package
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Publica animaciones listas para producción sin código pesado ni configuraciones complejas.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
                  <div className="font-bold text-zinc-200">Formatos Soportados:</div>
                  <ul className="list-disc pl-4 space-y-1.5 text-zinc-400">
                    <li><strong className="text-zinc-200">HTML5 Standalone:</strong> Archivo `.html` único con JavaScript nativo ligero (&lt;4KB), sin bibliotecas pesadas.</li>
                    <li><strong className="text-zinc-200">Google Ads Bundle:</strong> Empaquetado comprimido listo para subir a Google Ads / DV360 con etiqueta clickTag.</li>
                    <li><strong className="text-zinc-200">SVG Nativo Animado:</strong> Vector con animación SMIL y CSS pura.</li>
                    <li><strong className="text-zinc-200">Lottie JSON:</strong> Estructura compatible con aplicaciones móviles iOS/Android y web.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 9. SHORTCUTS & PRO WORKFLOW */}
            {activeSection === 'shortcuts_pro' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-emerald-400" />
                    Atajos de Teclado y Flujos Profesionales
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Acelera tu velocidad de trabajo con los atajos estándar del editor.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { key: 'Doble Clic en Pista', action: 'Inserta Keyframe (Google Web Designer)' },
                    { key: 'F6 / K', action: 'Inserta Keyframe en tiempo actual' },
                    { key: 'Espacio', action: 'Reproducir / Pausar animación' },
                    { key: 'Home / End', action: 'Ir al inicio / final de la línea de tiempo' },
                    { key: 'Ctrl + D', action: 'Duplicar capa seleccionada' },
                    { key: 'Del / Backspace', action: 'Eliminar capa o keyframe seleccionado' },
                    { key: 'Ctrl + Z / Ctrl + Y', action: 'Deshacer / Rehacer' },
                    { key: 'Shift + 0', action: 'Ajustar lienzo a la pantalla (100%)' },
                  ].map((s) => (
                    <div key={s.key} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400 text-[11px]">{s.action}</span>
                      <kbd className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 font-mono text-[10px] text-amber-300 font-bold">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="h-12 px-6 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-between shrink-0 text-xs">
          <div className="text-zinc-500 text-[11px] flex items-center gap-2">
            <span>Puedes reabrir esta guía en cualquier momento desde el menú superior <strong>Guías</strong>.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Entendido, volver al Lienzo
          </button>
        </div>
      </div>
    </div>
  );
};
