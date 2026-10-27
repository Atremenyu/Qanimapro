import React, { useState } from 'react';
import { Composition } from '../types';
import {
  generateStandaloneHTML5,
  generateReactComponent,
  generateCSSKeyframes,
  generateLottieJSON,
  generateIFrameSnippet,
  generateHTML5ZipBundle,
  extractCompositionImages,
  ExportOptions,
} from '../utils/exportEngine';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  FileCode,
  Sparkles,
  Zap,
  Repeat,
  RotateCw,
  Play,
  Megaphone,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  Smartphone,
  Maximize2,
  Archive,
  Image as ImageIcon,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  composition: Composition;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  composition,
}) => {
  const [activeTab, setActiveTab] = useState<
    'google_ads' | 'iframe' | 'css' | 'react' | 'lottie'
  >('google_ads');
  const [copied, setCopied] = useState(false);
  const [clickTagUrl, setClickTagUrl] = useState('https://www.google.com');

  // Loop & Repetition configuration
  const [loopMode, setLoopMode] = useState<'infinite' | 'repeat' | 'once'>('infinite');
  const [loopCount, setLoopCount] = useState<number>(3);
  const [loopDelay, setLoopDelay] = useState<number>(0);
  const [restartOnHover, setRestartOnHover] = useState<boolean>(true);

  // Responsiveness configuration (default to exact fixed dimension for web ads / Google Ads)
  const [isResponsive, setIsResponsive] = useState<boolean>(false);
  const [previewScale, setPreviewScale] = useState<'100%' | '75%' | '50%' | 'mobile'>('100%');

  // Image Export Mode: 'files' exports relative paths & images folder in zip; 'base64' embeds data URLs
  const [imageExportMode, setImageExportMode] = useState<'files' | 'base64'>('files');
  const [isZipping, setIsZipping] = useState(false);

  // Extract all images in current composition
  const imageAssets = extractCompositionImages(composition, 'images/');
  const hasImages = imageAssets.length > 0;

  if (!isOpen) return null;

  const exportOptions: ExportOptions = {
    clickTagUrl,
    loopMode,
    loopCount,
    loopDelay,
    restartOnHover,
    isResponsive,
    imageMode: imageExportMode,
    imageFolder: 'images/',
  };

  const htmlCode = generateStandaloneHTML5(composition, exportOptions);
  // Live preview inside iframe uses base64 data URLs for immediate inline rendering
  const previewHtmlCode = generateStandaloneHTML5(composition, {
    ...exportOptions,
    imageMode: 'base64',
  });
  const iframeCode = generateIFrameSnippet(composition, { isResponsive });
  const cssCode = generateCSSKeyframes(composition, exportOptions);
  const reactCode = generateReactComponent(composition, exportOptions);
  const lottieCode = generateLottieJSON(composition);

  const getActiveCode = () => {
    switch (activeTab) {
      case 'google_ads':
        return htmlCode;
      case 'iframe':
        return iframeCode;
      case 'css':
        return cssCode;
      case 'react':
        return reactCode;
      case 'lottie':
        return lottieCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = getActiveCode();
    let ext = 'html';
    let mime = 'text/html';

    if (activeTab === 'css') {
      ext = 'css';
      mime = 'text/css';
    } else if (activeTab === 'react') {
      ext = 'tsx';
      mime = 'text/typescript';
    } else if (activeTab === 'lottie') {
      ext = 'json';
      mime = 'application/json';
    }

    const blob = new Blob([code], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = composition.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-') || 'banner';
    a.download = activeTab === 'iframe' ? `${baseName}-embed.html` : `${baseName}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zipBlob = await generateHTML5ZipBundle(composition, exportOptions);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = composition.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-') || 'banner';
      a.download = `${baseName}-bundle.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating ZIP package:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Approximate file sizes
  const vectorHtmlBytes = new Blob([htmlCode]).size;
  const vectorKb = (vectorHtmlBytes / 1024).toFixed(1);

  // Total animation runtime calculation
  const totalAnimSecs =
    loopMode === 'infinite'
      ? '∞ (Infinito)'
      : loopMode === 'once'
      ? `${composition.duration}s`
      : `${((composition.duration + loopDelay) * loopCount - loopDelay).toFixed(1)}s`;

  const totalSecsNum =
    loopMode === 'once'
      ? composition.duration
      : loopMode === 'repeat'
      ? (composition.duration + loopDelay) * loopCount - loopDelay
      : 0;

  const isExceedingGoogleAdsLimit = loopMode === 'repeat' && totalSecsNum > 30;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                Export Google Ads / AdSense HTML5 Banner
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
                  {vectorKb} KB (IAB &amp; AdSense Compliant)
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benchmarks & Ad Policy Strip */}
        <div className="bg-zinc-900/40 border-b border-zinc-800/80 px-5 py-2 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-4 text-zinc-400">
            <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ad Size: {composition.width} × {composition.height} px</span>
            </div>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400 font-mono">
              Weight: <strong className="text-zinc-200">~{vectorKb} KB</strong> (150KB limit)
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400 font-mono">
              Base Duration: <strong className="text-zinc-200">{composition.duration}s</strong>
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" />
              Total Playtime: <strong className="text-blue-300">{totalAnimSecs}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Sin controles visibles • Autoplay 60FPS • ClickTag listo
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex border-b border-zinc-800 px-5 bg-zinc-950 text-xs font-medium text-zinc-400 overflow-x-auto">
          <button
            onClick={() => setActiveTab('google_ads')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'google_ads'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'border-transparent hover:text-zinc-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Google Ads / AdSense HTML5 (.html)</span>
          </button>

          <button
            onClick={() => setActiveTab('iframe')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'iframe'
                ? 'text-blue-400 border-blue-500 font-semibold'
                : 'border-transparent hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>iframe Embed Code (.html)</span>
          </button>

          <button
            onClick={() => setActiveTab('css')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'css'
                ? 'text-blue-400 border-blue-500 font-semibold'
                : 'border-transparent hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Pure CSS Banner (.css)</span>
          </button>

          <button
            onClick={() => setActiveTab('react')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'react'
                ? 'text-blue-400 border-blue-500 font-semibold'
                : 'border-transparent hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>React Component (.tsx)</span>
          </button>

          <button
            onClick={() => setActiveTab('lottie')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'lottie'
                ? 'text-blue-400 border-blue-500 font-semibold'
                : 'border-transparent hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Lottie Vector JSON (.json)</span>
          </button>
        </div>

        {/* Code View & Live Preview Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4">
          {/* Left: Code Viewer */}
          <div className="flex-1 bg-zinc-900 rounded-lg border border-zinc-800 flex flex-col overflow-hidden">
            <div className="h-9 px-3 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                {activeTab === 'google_ads'
                  ? 'index.html (Google Ads HTML5 Package)'
                  : activeTab === 'iframe'
                  ? 'embed-snippet.html (Standard <iframe> Embed)'
                  : activeTab === 'css'
                  ? 'banner.css'
                  : activeTab === 'react'
                  ? 'VectorBanner.tsx'
                  : 'banner.json'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-zinc-300 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-750 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado' : 'Copiar Código'}</span>
                </button>
              </div>
            </div>

            <pre className="flex-1 p-3 text-[11px] font-mono text-zinc-300 overflow-auto custom-scrollbar select-text leading-relaxed">
              <code>{getActiveCode()}</code>
            </pre>
          </div>

          {/* Right: Export Options & Live Ad Preview Box */}
          <div className="w-full md:w-96 bg-zinc-900/70 rounded-lg border border-zinc-800 p-4 flex flex-col justify-between shrink-0 space-y-3 overflow-y-auto custom-scrollbar max-h-[70vh]">
            <div className="space-y-3.5">
              {/* Preview Header with Screen Simulators */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Vista Previa en Vivo
                </h3>
                <div className="flex items-center gap-1">
                  {(['100%', '75%', '50%', 'mobile'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setPreviewScale(s)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all ${
                        previewScale === s
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {s === 'mobile' ? '📱 320px' : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mini Ad Banner Stage Preview Box */}
              {(() => {
                const maxBoxW = 300;
                const maxBoxH = 190;
                const aspect = (composition.width || 300) / (composition.height || 250);
                let stageW = maxBoxW;
                let stageH = Math.round(maxBoxW / aspect);
                if (stageH > maxBoxH) {
                  stageH = maxBoxH;
                  stageW = Math.round(maxBoxH * aspect);
                }
                const previewScaleFactor = stageW / (composition.width || 300);

                return (
                  <div className="w-full flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-800 bg-zinc-950/90 space-y-2">
                    <div className="flex items-center justify-between w-full text-[10px] text-zinc-400 font-mono">
                      <span>Medida: <strong className="text-emerald-400">{composition.width} × {composition.height} px</strong></span>
                      <span>Escala vista: <strong className="text-zinc-300">{(previewScaleFactor * 100).toFixed(0)}%</strong></span>
                    </div>
                    <div
                      style={{
                        width: `${stageW}px`,
                        height: `${stageH}px`,
                        backgroundColor: composition.backgroundColor,
                      }}
                      className="rounded border border-zinc-700/60 overflow-hidden relative shadow-lg shrink-0 flex items-center justify-center"
                    >
                      <iframe
                        key={`${loopMode}_${loopCount}_${loopDelay}_${isResponsive}_${previewScale}_${composition.layers.length}_${composition.duration}`}
                        srcDoc={previewHtmlCode}
                        title="Google Ads Live Banner Preview"
                        style={{
                          width: `${composition.width}px`,
                          height: `${composition.height}px`,
                          transform: `scale(${previewScaleFactor})`,
                          transformOrigin: '0 0',
                        }}
                        className="border-0 pointer-events-auto block absolute top-0 left-0"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* --- MODO DE RESPONSIVIDAD Y MEDIDAS PARA IFRAMES --- */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5 font-mono">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    Medidas y Comportamiento del Lienzo
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    {!isResponsive ? `Fijo (${composition.width}×${composition.height}px)` : 'Auto-escala Fluida'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setIsResponsive(false)}
                    className={`py-1.5 px-2 rounded text-[10px] font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      !isResponsive
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>📐 Medida Exacta ({composition.width}×{composition.height}px)</span>
                  </button>

                  <button
                    onClick={() => setIsResponsive(true)}
                    className={`py-1.5 px-2 rounded text-[10px] font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      isResponsive
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>📱 Adaptable al Iframe</span>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  {!isResponsive
                    ? `✓ Medida estricta de ${composition.width}×${composition.height}px en body y contenedor. Diseñado especialmente para iframes fijos, Google Ads y banners web IAB.`
                    : `✓ Medida base ${composition.width}×${composition.height}px con escalado vectorial proporcional automático para iframes fluidos o móviles.`}
                </p>
              </div>

              {/* --- BUCLE Y REPETICIONES DE ANIMACIÓN --- */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5 font-mono">
                    <Repeat className="w-3.5 h-3.5 text-blue-400" />
                    Bucle y Repetición
                  </span>
                  <span className="text-[10px] font-mono text-blue-400 font-semibold">
                    {loopMode === 'infinite' ? 'Infinito' : loopMode === 'repeat' ? `${loopCount} repeticiones` : '1 vez'}
                  </span>
                </div>

                {/* Mode Selector Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setLoopMode('infinite')}
                    className={`py-1.5 px-2 rounded text-[10px] font-semibold border flex flex-col items-center gap-1 transition-all ${
                      loopMode === 'infinite'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Bucle Infinito</span>
                  </button>

                  <button
                    onClick={() => setLoopMode('repeat')}
                    className={`py-1.5 px-2 rounded text-[10px] font-semibold border flex flex-col items-center gap-1 transition-all ${
                      loopMode === 'repeat'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Repeat className="w-3 h-3" />
                    <span>Repetir N veces</span>
                  </button>

                  <button
                    onClick={() => setLoopMode('once')}
                    className={`py-1.5 px-2 rounded text-[10px] font-semibold border flex flex-col items-center gap-1 transition-all ${
                      loopMode === 'once'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Play className="w-3 h-3" />
                    <span>1 sola vez</span>
                  </button>
                </div>

                {/* Sub-options when Repeat N times is active */}
                {loopMode === 'repeat' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-850">
                    <div className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
                      <span className="text-[10px] font-mono text-zinc-400 block">Número de bucles</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setLoopCount(n)}
                            className={`flex-1 py-0.5 rounded text-[10px] font-bold ${
                              loopCount === n
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-750'
                            }`}
                          >
                            {n}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
                      <span className="text-[10px] font-mono text-zinc-400 block">Pausa entre bucles</span>
                      <select
                        value={loopDelay}
                        onChange={(e) => setLoopDelay(parseFloat(e.target.value))}
                        className="w-full bg-transparent text-zinc-200 text-xs font-mono font-semibold outline-none mt-1 cursor-pointer"
                      >
                        <option value="0" className="bg-zinc-900">0s (Sin pausa)</option>
                        <option value="0.5" className="bg-zinc-900">0.5 segundos</option>
                        <option value="1" className="bg-zinc-900">1.0 segundo</option>
                        <option value="2" className="bg-zinc-900">2.0 segundos</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Checkbox: Restart on hover */}
                {loopMode !== 'infinite' && (
                  <label className="flex items-center gap-2 cursor-pointer pt-1 text-[11px] text-zinc-300">
                    <input
                      type="checkbox"
                      checked={restartOnHover}
                      onChange={(e) => setRestartOnHover(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer"
                    />
                    <span>Reiniciar animación al pasar el cursor (*Hover*)</span>
                  </label>
                )}

                {/* Google Ads Policy Compliance Warning / Badge */}
                {isExceedingGoogleAdsLimit ? (
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-800/80 text-[10px] text-amber-300 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Atención Google Ads:</strong> La animación total dura {totalAnimSecs}, superando los 30s máximos recomendados para banners publicitarios.
                    </span>
                  </div>
                ) : (
                  <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>Tiempo total de animación:</span>
                    <strong className="text-emerald-400">{totalAnimSecs}</strong>
                  </div>
                )}
              </div>

              {/* --- GESTIÓN DE IMÁGENES Y ETIQUETA <img> --- */}
              {hasImages && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5 font-mono">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      Imágenes del Banner ({imageAssets.length})
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      Etiqueta &lt;img&gt;
                    </span>
                  </div>

                  {/* Toggle: Separate Files (ZIP) vs Base64 embedded */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setImageExportMode('files')}
                      className={`py-1.5 px-2 rounded text-[10px] font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        imageExportMode === 'files'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <Archive className="w-3 h-3 text-emerald-400" />
                      <span>Archivos + ZIP</span>
                    </button>

                    <button
                      onClick={() => setImageExportMode('base64')}
                      className={`py-1.5 px-2 rounded text-[10px] font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        imageExportMode === 'base64'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>Base64 Embebido</span>
                    </button>
                  </div>

                  {/* Asset list */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-0.5">
                    {imageAssets.map((img) => (
                      <div
                        key={img.id}
                        className="p-1.5 bg-zinc-900/90 rounded border border-zinc-800/80 flex items-center justify-between text-[11px] font-mono"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase font-bold shrink-0">
                            {img.format}
                          </span>
                          <span className="text-zinc-300 truncate" title={img.fileName}>
                            {img.fileName}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 shrink-0 ml-2">
                          {img.width}×{img.height}px
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-tight">
                    {imageExportMode === 'files'
                      ? '✓ Las imágenes se empaquetan en la carpeta images/ en su formato original (.jpg, .png, .gif) y el HTML las carga con etiquetas <img> estándar.'
                      : '✓ Las imágenes se incrustan como datos Base64 directamente dentro del HTML.'}
                  </p>
                </div>
              )}

              {/* ClickTag URL Configuration for Google Ads */}
              <div className="space-y-1 bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
                <label className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                  <span>Google Ads ClickTag URL:</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </label>
                <input
                  type="text"
                  value={clickTagUrl}
                  onChange={(e) => setClickTagUrl(e.target.value)}
                  placeholder="https://yourwebsite.com/promo"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 font-mono outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Download Buttons */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              {hasImages && imageExportMode === 'files' && activeTab === 'google_ads' ? (
                <>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Archive className="w-4 h-4" />
                    <span>
                      {isZipping ? 'Generando ZIP...' : 'Descargar Paquete ZIP (HTML + Imágenes)'}
                    </span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="w-full py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-800"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descargar solo archivo .HTML</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDownload}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {activeTab === 'google_ads'
                        ? 'Descargar Archivo HTML5 (.html)'
                        : activeTab === 'iframe'
                        ? 'Descargar Snippet iframe (.html)'
                        : activeTab === 'css'
                        ? 'Descargar Hoja de Estilo (.css)'
                        : activeTab === 'react'
                        ? 'Descargar Componente (.tsx)'
                        : 'Descargar Vector Lottie (.json)'}
                    </span>
                  </button>

                  {hasImages && activeTab === 'google_ads' && (
                    <button
                      onClick={handleDownloadZip}
                      disabled={isZipping}
                      className="w-full py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-800 disabled:opacity-50"
                    >
                      <Archive className="w-3 h-3 text-emerald-400" />
                      <span>{isZipping ? 'Comprimiendo...' : 'Descargar como Paquete ZIP'}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

