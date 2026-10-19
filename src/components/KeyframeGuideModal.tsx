import React, { useState } from 'react';
import {
  X,
  Diamond,
  MousePointer,
  RotateCw,
  Scaling,
  SunMedium,
  Move,
  Play,
  Zap,
  CheckCircle2,
  Sparkles,
  Keyboard,
  Clock,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface KeyframeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPresets?: () => void;
}

export const KeyframeGuideModal: React.FC<KeyframeGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenPresets,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Doble Clic en la Pista (Google Web Designer)',
      desc: 'Coloca el cursor en cualquier segundo de la pista de la capa y haz doble clic para insertar un Keyframe al instante.',
      badge: 'El más rápido',
      icon: <MousePointer className="w-5 h-5 text-blue-400" />,
      detail: (
        <div className="space-y-2 text-xs text-zinc-300">
          <p>
            Al igual que en <strong>Google Web Designer</strong> y <strong>Adobe Animate</strong>:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-zinc-400">
            <li>
              <strong className="text-zinc-200">1 Clic:</strong> Mueve el cabezal rojo de tiempo al segundo exacto donde hiciste clic.
            </li>
            <li>
              <strong className="text-zinc-200">Doble Clic:</strong> Coloca un fotograma clave (<strong>◆</strong>) en ese segundo y activa la animación para la capa.
            </li>
            <li>
              <strong className="text-zinc-200">Clic Derecho:</strong> Abre el menú contextual con opciones para insertar keyframes específicos de <em>Rotación, Escala, Opacidad o Posición</em>.
            </li>
          </ul>
        </div>
      ),
    },
    {
      step: 2,
      title: 'Auto-Keyframe al Mover o Transformar',
      desc: 'Mueve el cabezal rojo a un segundo posterior (ej. 2.0s) y transforma el objeto.',
      badge: 'Automático',
      icon: <Move className="w-5 h-5 text-emerald-400" />,
      detail: (
        <div className="space-y-2 text-xs text-zinc-300">
          <p>
            Si la capa ya tiene habilitada la animación:
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-zinc-400">
            <li>Mueve el cabezal rojo en la regla superior (ej. a <strong>1.5s</strong>).</li>
            <li>
              Arrastra el objeto en el lienzo o cambia un valor en el Inspector de propiedades (Rotación, Escala, Opacidad, Posición).
            </li>
            <li>
              ¡El sistema insertará automáticamente el keyframe con el nuevo valor en ese segundo!
            </li>
          </ol>
        </div>
      ),
    },
    {
      step: 3,
      title: 'Botón de Diamante [+ ◆] y Tecla F6',
      desc: 'Inserta un keyframe en el segundo exacto donde se encuentra el cabezal.',
      badge: 'Teclado y Barra',
      icon: <Diamond className="w-5 h-5 text-amber-400 fill-current" />,
      detail: (
        <div className="space-y-2 text-xs text-zinc-300">
          <p>
            Puedes usar atajos rápidos en cualquier momento con la capa seleccionada:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
              <span className="font-mono text-amber-400 font-bold block">F6 / K</span>
              <span className="text-zinc-400">Inserta Keyframe en la posición actual</span>
            </div>
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
              <span className="font-mono text-blue-400 font-bold block">Barra Lateral [◆]</span>
              <span className="text-zinc-400">Menú desplegable de Rotar, Estirar, Opacidad</span>
            </div>
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
              <span className="font-mono text-indigo-400 font-bold block">F9 (Easy Ease)</span>
              <span className="text-zinc-400">Suavizado profesional de entrada y salida</span>
            </div>
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
              <span className="font-mono text-emerald-400 font-bold block">Barra Espaciadora</span>
              <span className="text-zinc-400">Reproducir / Pausar vista previa</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      step: 4,
      title: 'Biblioteca de Animaciones Preestablecidas (GSAP)',
      desc: 'Aplica animaciones profesionales de la industria en 1 clic.',
      badge: '1 Clic',
      icon: <Zap className="w-5 h-5 text-amber-400 fill-current" />,
      detail: (
        <div className="space-y-2 text-xs text-zinc-300">
          <p>
            Si prefieres animaciones listas para usar:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-zinc-400">
            <li>
              Haz clic en el botón <strong>⚡ Presets</strong> en la barra de herramientas lateral o en el panel de propiedades.
            </li>
            <li>
              Selecciona entre más de 25 efectos: <em>Fade In, Pop Bounce, 360 Spin, Rubber Band (Estirar y encoger), Elastic Drop, Latido</em>, etc.
            </li>
            <li>
              Se generan automáticamente los keyframes con curvas de interpolación GSAP óptimas.
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>Guía: Cómo Colocar y Usar Keyframes</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded-full border border-blue-500/30">
                  Estilo Google Web Designer
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Aprende las 4 formas más rápidas y cómodas de animar cualquier objeto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Selector Pills */}
        <div className="grid grid-cols-4 p-2 bg-zinc-900/30 border-b border-zinc-800/80 gap-1.5 text-[11px] font-semibold">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`py-2 px-2.5 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                activeStep === s.step
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>Paso {s.step}</span>
              </div>
              <span className="text-[9px] opacity-80 truncate max-w-[120px]">{s.badge}</span>
            </button>
          ))}
        </div>

        {/* Active Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {steps
            .filter((s) => s.step === activeStep)
            .map((s) => (
              <div key={s.step} className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="p-2 rounded-xl bg-zinc-850 border border-zinc-750 shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-zinc-100">{s.title}</h3>
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded">
                        {s.badge}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
                    Instrucciones Detalladas
                  </h4>
                  {s.detail}
                </div>
              </div>
            ))}

          {/* Interactive Quick Try Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs text-zinc-200">
                <strong className="text-white">Consejo Pro:</strong> Haz doble clic en la pista de cualquier capa o presiona <code className="bg-zinc-900 px-1 py-0.5 rounded text-amber-300 font-mono font-bold">F6</code> para probarlo ahora mismo.
              </div>
            </div>
            {onOpenPresets && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPresets();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Ver Presets</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between">
          <div className="text-[11px] font-mono text-zinc-500">
            Atajo rápido: Presiona <strong>F6</strong> para insertar Keyframe
          </div>
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep((prev) => prev - 1)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
              >
                Anterior
              </button>
            )}
            {activeStep < 4 ? (
              <button
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-md shadow-blue-600/30"
              >
                Siguiente Paso ({activeStep + 1}/4)
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-600/30"
              >
                ¡Entendido, Empezar a Animar!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
