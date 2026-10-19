import React, { useState } from 'react';
import { Composition } from '../types';
import { X, Settings, Check, Palette, Sparkles } from 'lucide-react';
import { adaptCompositionToDimensions } from '../utils/templateAdapter';

interface CompSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  composition: Composition;
  onSave: (updated: Partial<Composition>) => void;
}

export const CompSettingsModal: React.FC<CompSettingsModalProps> = ({
  isOpen,
  onClose,
  composition,
  onSave,
}) => {
  const [name, setName] = useState(composition.name);
  const [width, setWidth] = useState(composition.width);
  const [height, setHeight] = useState(composition.height);
  const [fps, setFps] = useState(composition.fps);
  const [duration, setDuration] = useState(composition.duration);
  const [backgroundColor, setBackgroundColor] = useState(composition.backgroundColor);
  const [reframeElements, setReframeElements] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const targetW = Math.max(100, Math.min(3840, width));
    const targetH = Math.max(100, Math.min(2160, height));
    const sizeChanged = targetW !== composition.width || targetH !== composition.height;

    if (sizeChanged && reframeElements) {
      const reframed = adaptCompositionToDimensions(composition, targetW, targetH);
      onSave({
        ...reframed,
        name: name.trim() || composition.name,
        fps,
        duration: Math.max(0.5, Math.min(30, duration)),
        backgroundColor,
      });
    } else {
      onSave({
        name: name.trim() || composition.name,
        width: targetW,
        height: targetH,
        fps,
        duration: Math.max(0.5, Math.min(30, duration)),
        backgroundColor,
      });
    }
    onClose();
  };

  const presetSizes = [
    { label: '1080 × 1080 (Square 1:1 Feed)', w: 1080, h: 1080 },
    { label: '1080 × 1920 (Vertical 9:16 Reels / Stories)', w: 1080, h: 1920 },
    { label: '1920 × 1080 (Full HD 16:9 Panorámico)', w: 1920, h: 1080 },
    { label: '600 × 500 (Portada Estándar)', w: 600, h: 500 },
    { label: '728 × 90 (Leaderboard)', w: 728, h: 90 },
    { label: '640 × 200 (Banner Horizontal)', w: 640, h: 200 },
    { label: '420 × 200 (Banner Compacto)', w: 420, h: 200 },
    { label: '1100 × 361 (Billboard / Header)', w: 1100, h: 361 },
    { label: '630 × 250 (Banner Rectangular)', w: 630, h: 250 },
    { label: '800 × 600 (Standard Web)', w: 800, h: 600 },
  ];

  const colorPresets = [
    '#090a0f',
    '#0c0f17',
    '#000000',
    '#18181b',
    '#0f172a',
    '#1e1b4b',
    '#ffffff',
    '#f8fafc',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 px-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Composition Settings (Ctrl+K)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleApply} className="p-4 space-y-4 text-xs">
          {/* Comp Name */}
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">
              Composition Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-medium outline-none focus:border-blue-500"
            />
          </div>

          {/* Quick Preset Dimensions */}
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">
              Dimension Presets
            </label>
            <select
              onChange={(e) => {
                const [pw, ph] = e.target.value.split('x').map(Number);
                if (pw && ph) {
                  setWidth(pw);
                  setHeight(ph);
                }
              }}
              value={`${width}x${height}`}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 outline-none cursor-pointer"
            >
              {presetSizes.map((p) => (
                <option key={p.label} value={`${p.w}x${p.h}`}>
                  {p.label}
                </option>
              ))}
              <option value="custom">Custom Size</option>
            </select>
          </div>

          {/* Width & Height inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Width (px)</label>
              <input
                type="number"
                min="100"
                max="3840"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 800)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Height (px)</label>
              <input
                type="number"
                min="100"
                max="2160"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 600)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono"
              />
            </div>
          </div>

          {/* Smart Reframe Checkbox Toggle */}
          <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Reframe Inteligente de Capas
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  Reorganiza y escala posiciones y fuentes para ajustarse al nuevo lienzo
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reframeElements}
                onChange={(e) => setReframeElements(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Frame Rate & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Frame Rate (FPS)</label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 outline-none"
              >
                <option value="60">60 FPS (Ultra Smooth)</option>
                <option value="30">30 FPS (Standard Web)</option>
                <option value="24">24 FPS (Cinematic)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Duration (Seconds)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 3.0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono"
              />
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">
              Canvas Background Color
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={backgroundColor.startsWith('#') ? backgroundColor.slice(0, 7) : '#090a0f'}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-8 h-8 rounded border border-zinc-700 bg-zinc-900 cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 font-mono text-zinc-100 uppercase"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBackgroundColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded border ${
                    backgroundColor === c ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
