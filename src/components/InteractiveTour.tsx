import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Compass,
  PenTool,
  Layers,
  Diamond,
  Sliders,
  FileCode2,
  Check,
} from 'lucide-react';

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuidesModal?: () => void;
}

interface TourStep {
  title: string;
  badge: string;
  desc: string;
  tip: string;
  icon: React.ReactNode;
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-center' | 'center';
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isOpen,
  onClose,
  onOpenGuidesModal,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      title: '1. Barra de Herramientas y Formas Vectoriales',
      badge: 'Herramientas (Izquierda)',
      desc: 'Encuentra las herramientas de Selección, Pluma Bézier, Rectángulos, Círculos, Estrellas, Polígonos y Texto para dibujar en el lienzo.',
      tip: 'Atajo: Haz clic en cualquier forma y luego arrastra en el lienzo para crear objetos con dimensiones personalizadas.',
      icon: <PenTool className="w-5 h-5 text-indigo-400" />,
      position: 'top-left',
    },
    {
      title: '2. Lienzo Central y Manipulación en Vivo',
      badge: 'Lienzo (Centro)',
      desc: 'El área de trabajo principal donde puedes mover, rotar, escalar y transformar tus capas vectoriales con tiradores visuales precisos.',
      tip: 'Puedes cambiar el zoom con Ctrl+Rueda o Shift+0 para ajustar la vista al 100%.',
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      position: 'center',
    },
    {
      title: '3. Inspector de Propiedades y Estilos',
      badge: 'Inspector (Derecha)',
      desc: 'Edita Transformación (Posición, Rotación, Opacidad), Estilos (Color de Relleno, Trazo, Trim Paths, Glow), Geometría y Modificadores (Repeater, Wiggle).',
      tip: 'Los valores de opacidad y transformación se actualizan en tiempo real mientras mueves la línea de tiempo.',
      icon: <Sliders className="w-5 h-5 text-pink-400" />,
      position: 'top-right',
    },
    {
      title: '4. Línea de Tiempo y Keyframes (Estilo Google Web Designer)',
      badge: 'Línea de Tiempo (Abajo)',
      desc: 'Controla el flujo temporal de tu animación. Haz Doble Clic en cualquier segundo de la pista para insertar un fotograma clave (◆) o pulsa F6.',
      tip: 'Arrastra el cabezal rojo para previsualizar la interpolación de movimiento continua.',
      icon: <Diamond className="w-5 h-5 text-amber-400" />,
      position: 'bottom-center',
    },
    {
      title: '5. Menú Superior y Exportación HTML5',
      badge: 'Barra Superior (Arriba)',
      desc: 'Accede a las opciones de Proyecto, Menú de Guías, Plantillas prediseñadas y al exportador HTML5 independiente (<4KB).',
      tip: 'Las animaciones exportadas son compatibles con Google Ads, banners web y aplicaciones modernas.',
      icon: <FileCode2 className="w-5 h-5 text-emerald-400" />,
      position: 'top-center',
    },
  ];

  const currentStep = tourSteps[currentStepIndex];
  const isLast = currentStepIndex === tourSteps.length - 1;

  const positionClasses: Record<string, string> = {
    'top-left': 'top-20 left-16',
    'top-center': 'top-16 left-1/2 -translate-x-1/2',
    'top-right': 'top-20 right-16',
    'bottom-center': 'bottom-60 left-1/2 -translate-x-1/2',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      id="interactive_tour_overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="interactive_tour_card"
        className={`absolute bg-zinc-950/95 border border-zinc-700 shadow-2xl rounded-2xl p-5 w-full max-w-md text-zinc-100 backdrop-blur-md ${
          positionClasses[currentStep.position] || positionClasses['center']
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              {currentStep.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider block">
                {currentStep.badge}
              </span>
              <h3 className="text-xs font-bold text-white">{currentStep.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-3.5 space-y-3">
          <p className="text-xs text-zinc-300 leading-relaxed">{currentStep.desc}</p>
          <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-200 leading-relaxed">
            💡 <strong>Consejo Pro:</strong> {currentStep.tip}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIndex ? 'w-4 bg-blue-500' : 'w-1.5 bg-zinc-700'
                }`}
              />
            ))}
            <span className="text-[10px] text-zinc-500 font-mono ml-2">
              {currentStepIndex + 1}/{tourSteps.length}
            </span>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={() => setCurrentStepIndex((p) => p - 1)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Anterior</span>
              </button>
            )}

            {!isLast ? (
              <button
                onClick={() => setCurrentStepIndex((p) => p + 1)}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1 transition-all"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenGuidesModal) onOpenGuidesModal();
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Finalizar Tour</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
