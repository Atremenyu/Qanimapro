import React, { useState, useRef } from 'react';
import {
  X,
  FileImage,
  UploadCloud,
  CheckCircle2,
  Layers,
  Sparkles,
  Type,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sliders,
  FolderOpen
} from 'lucide-react';
import { Composition, VectorLayer } from '../types';
import { parsePsdFile, PsdImportResult, PsdParsedLayerInfo } from '../utils/psdImporter';

interface PsdImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentComposition: Composition;
  onImportAsNewComposition: (newComp: Composition) => void;
  onInsertLayersIntoCurrent: (layers: VectorLayer[]) => void;
}

export const PsdImportModal: React.FC<PsdImportModalProps> = ({
  isOpen,
  onClose,
  currentComposition,
  onImportAsNewComposition,
  onInsertLayersIntoCurrent,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [psdResult, setPsdResult] = useState<PsdImportResult | null>(null);
  const [selectedLayerIds, setSelectedLayerIds] = useState<Set<string>>(new Set());
  const [importMode, setImportMode] = useState<'new_comp' | 'insert'>('new_comp');
  const [compDuration, setCompDuration] = useState<number>(4.0);
  const [compFps, setCompFps] = useState<number>(30);
  const [compBgColor, setCompBgColor] = useState<string>('#090a0f');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.psd') && !file.name.toLowerCase().endsWith('.psb')) {
      setError('Por favor selecciona un archivo válido de Photoshop (.psd o .psb)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await parsePsdFile(file);
      setPsdResult(result);
      // Select all layers by default
      setSelectedLayerIds(new Set(result.layers.map((l) => l.id)));
    } catch (err: any) {
      console.error('Error al procesar el archivo PSD:', err);
      setError(err?.message || 'Error al procesar el archivo PSD. Asegúrate de que no esté dañado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSelectAll = () => {
    if (!psdResult) return;
    if (selectedLayerIds.size === psdResult.layers.length) {
      setSelectedLayerIds(new Set());
    } else {
      setSelectedLayerIds(new Set(psdResult.layers.map((l) => l.id)));
    }
  };

  const toggleLayerSelection = (id: string) => {
    setSelectedLayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirmImport = () => {
    if (!psdResult) return;

    // Filter only selected layers and ensure they start unexpanded (expandedInTimeline = false)
    const finalLayers = psdResult.layers
      .filter((l) => selectedLayerIds.has(l.id))
      .map((l) => ({
        ...l,
        expandedInTimeline: false,
      }));

    if (finalLayers.length === 0) {
      setError('Debes seleccionar al menos una capa para importar.');
      return;
    }

    if (importMode === 'new_comp') {
      const newComp: Composition = {
        id: 'comp_psd_' + Date.now(),
        name: psdResult.fileName.replace(/\.(psd|psb)$/i, ''),
        width: psdResult.width,
        height: psdResult.height,
        duration: compDuration,
        fps: compFps,
        backgroundColor: compBgColor,
        layers: finalLayers,
      };
      onImportAsNewComposition(newComp);
    } else {
      onInsertLayersIntoCurrent(finalLayers);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Importar Archivo Photoshop PSD
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono uppercase">
                  PSD / PSB
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Extrae automáticamente todas las capas, textos, imágenes, opacidades y posiciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Upload Dropzone (if no PSD loaded yet) */}
          {!psdResult && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                  : 'border-zinc-700/80 bg-zinc-950/40 hover:border-zinc-500 hover:bg-zinc-950/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".psd,.psb"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {isLoading ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                  <p className="text-sm font-semibold text-white">Extrayendo capas del archivo PSD...</p>
                  <p className="text-xs text-zinc-400">Decodificando imágenes bitmap, estilos y textos</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-850 border border-zinc-700 flex items-center justify-center text-blue-400 shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Arrastra y suelta tu archivo <span className="text-blue-400 font-semibold">.PSD</span> o haz clic para examinar
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Compatible con archivos Adobe Photoshop (.psd, .psb) de cualquier resolución
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" /> Seleccionar archivo PSD
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* PSD Loaded Review & Options */}
          {psdResult && (
            <div className="space-y-6">
              {/* Summary Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Archivo</span>
                    <span className="text-xs font-semibold text-zinc-200 truncate block" title={psdResult.fileName}>
                      {psdResult.fileName}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Dimensiones</span>
                    <span className="text-xs font-bold font-mono text-zinc-200">
                      {psdResult.width} × {psdResult.height} px
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Capas Detectadas</span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      {psdResult.layers.length} capas ({selectedLayerIds.size} seleccionadas)
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Cambiar Archivo</span>
                    <button
                      onClick={() => {
                        setPsdResult(null);
                        setError(null);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline"
                    >
                      Cargar otro PSD
                    </button>
                  </div>
                </div>
              </div>

              {/* Import Mode Settings */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Modo de Importación
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    onClick={() => setImportMode('new_comp')}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      importMode === 'new_comp'
                        ? 'border-blue-500 bg-blue-950/20 text-white'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'new_comp'}
                      onChange={() => setImportMode('new_comp')}
                      className="mt-1 accent-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold block text-zinc-200">
                        Crear Nueva Composición ({psdResult.width}×{psdResult.height})
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Ajusta el lienzo exactamente al tamaño del diseño de Photoshop y organiza las capas.
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setImportMode('insert')}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      importMode === 'insert'
                        ? 'border-blue-500 bg-blue-950/20 text-white'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'insert'}
                      onChange={() => setImportMode('insert')}
                      className="mt-1 accent-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold block text-zinc-200">
                        Insertar en Composición Actual ({currentComposition.width}×{currentComposition.height})
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Añade las capas seleccionadas a tu proyecto actual sin cambiar la resolución.
                      </span>
                    </div>
                  </label>
                </div>

                {importMode === 'new_comp' && (
                  <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Duración (segundos)</span>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        step="0.5"
                        value={compDuration}
                        onChange={(e) => setCompDuration(parseFloat(e.target.value) || 4)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Velocidad (FPS)</span>
                      <select
                        value={compFps}
                        onChange={(e) => setCompFps(parseInt(e.target.value) || 30)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
                      >
                        <option value="30">30 FPS (Estándar Web)</option>
                        <option value="60">60 FPS (Ultra Fluido)</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Color de Fondo</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={compBgColor}
                          onChange={(e) => setCompBgColor(e.target.value)}
                          className="w-7 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={compBgColor}
                          onChange={(e) => setCompBgColor(e.target.value)}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Layers List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200">Capas del Documento</span>
                    <span className="text-[11px] text-zinc-500">
                      (Orden exacto de Photoshop: de capa superior a fondo)
                    </span>
                  </div>
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    {selectedLayerIds.size === psdResult.layers.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 divide-y divide-zinc-900 custom-scrollbar">
                  {psdResult.layerInfos.map((info, idx) => {
                    const isSelected = selectedLayerIds.has(info.id);
                    return (
                      <div
                        key={info.id}
                        onClick={() => toggleLayerSelection(info.id)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-950/20 hover:bg-blue-950/30' : 'hover:bg-zinc-900/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="accent-blue-500 rounded"
                          />

                          {/* Thumbnail / Type Icon */}
                          <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                            {info.thumbnailUrl ? (
                              <img
                                src={info.thumbnailUrl}
                                alt={info.name}
                                className="w-full h-full object-contain"
                              />
                            ) : info.type === 'text' ? (
                              <Type className="w-4 h-4 text-purple-400" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-blue-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-zinc-200 truncate">
                                {info.name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                                #{idx + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                              <span>
                                {Math.round(info.width)}×{Math.round(info.height)} px
                              </span>
                              <span>•</span>
                              <span>Opacidad: {info.opacity}%</span>
                              {info.textContent && (
                                <>
                                  <span>•</span>
                                  <span className="text-zinc-400 truncate max-w-[150px]">
                                    "{info.textContent}"
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {info.visible ? (
                            <Eye className="w-3.5 h-3.5 text-zinc-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            Cancelar
          </button>

          {psdResult && (
            <button
              onClick={handleConfirmImport}
              disabled={selectedLayerIds.size === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {importMode === 'new_comp'
                  ? `Crear Composición con ${selectedLayerIds.size} Capas`
                  : `Insertar ${selectedLayerIds.size} Capas`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
