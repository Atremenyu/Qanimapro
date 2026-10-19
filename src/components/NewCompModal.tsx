import React, { useState } from 'react';
import { Composition } from '../types';
import {
  X,
  Layers,
  Sparkles,
  Check,
  LayoutGrid,
  Monitor,
  Smartphone,
  Megaphone,
} from 'lucide-react';

interface NewCompModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateComposition: (newComp: Composition) => void;
}

interface AdPreset {
  name: string;
  category: 'google_ads' | 'social' | 'web';
  width: number;
  height: number;
  duration: number;
  fps: number;
  description: string;
}

const AD_PRESETS: AdPreset[] = [
  // Google Ads & AdSense standard banners
  {
    name: 'Medium Rectangle (IAB / AdSense)',
    category: 'google_ads',
    width: 300,
    height: 250,
    duration: 5.0,
    fps: 60,
    description: 'Most popular ad size worldwide. Perfect for sidebar & in-content ads.',
  },
  {
    name: 'Leaderboard Banner',
    category: 'google_ads',
    width: 728,
    height: 90,
    duration: 5.0,
    fps: 60,
    description: 'Top-of-page header ad standard for desktop websites.',
  },
  {
    name: 'Half Page / Large Skyscraper',
    category: 'google_ads',
    width: 300,
    height: 600,
    duration: 6.0,
    fps: 60,
    description: 'High-impact rich media ad with high engagement rates.',
  },
  {
    name: 'Large Rectangle',
    category: 'google_ads',
    width: 336,
    height: 280,
    duration: 5.0,
    fps: 60,
    description: 'Great for embedded articles and blog sidebars.',
  },
  {
    name: 'Mobile Leaderboard',
    category: 'google_ads',
    width: 320,
    height: 50,
    duration: 4.0,
    fps: 60,
    description: 'Standard sticky mobile banner ad.',
  },
  {
    name: 'Large Mobile Banner',
    category: 'google_ads',
    width: 320,
    height: 100,
    duration: 4.0,
    fps: 60,
    description: 'Double height mobile banner with more visual room.',
  },
  {
    name: 'Wide Skyscraper',
    category: 'google_ads',
    width: 160,
    height: 600,
    duration: 5.0,
    fps: 60,
    description: 'Vertical tower banner for page sidebars.',
  },
  {
    name: 'Billboard Header',
    category: 'google_ads',
    width: 970,
    height: 250,
    duration: 6.0,
    fps: 60,
    description: 'Expansive premium masthead banner ad.',
  },

  // Social & Display Formats
  {
    name: 'Square Post 1:1',
    category: 'social',
    width: 1080,
    height: 1080,
    duration: 4.0,
    fps: 60,
    description: 'Instagram, Facebook, LinkedIn feed posts.',
  },
  {
    name: 'Vertical Story / Reel 9:16',
    category: 'social',
    width: 1080,
    height: 1920,
    duration: 5.0,
    fps: 60,
    description: 'Full-screen mobile stories, Reels, TikTok & Shorts.',
  },
  {
    name: 'Landscape Video / Presentation 16:9',
    category: 'social',
    width: 1920,
    height: 1080,
    duration: 5.0,
    fps: 60,
    description: 'Full HD widescreen format.',
  },

  // Web & UI graphics
  {
    name: 'Standard Web Graphic',
    category: 'web',
    width: 800,
    height: 600,
    duration: 3.0,
    fps: 60,
    description: 'Clean canvas for UI animations and micro-interactions.',
  },
  {
    name: 'Vector Badge / Icon',
    category: 'web',
    width: 500,
    height: 500,
    duration: 3.0,
    fps: 60,
    description: 'Square animated logo or feature badge.',
  },
  {
    name: 'Micro Loader / Spinner',
    category: 'web',
    width: 300,
    height: 300,
    duration: 2.0,
    fps: 60,
    description: 'Lightweight loop spinner for web apps.',
  },
];

export const NewCompModal: React.FC<NewCompModalProps> = ({
  isOpen,
  onClose,
  onCreateComposition,
}) => {
  const [activeCategory, setActiveCategory] = useState<'google_ads' | 'social' | 'web'>(
    'google_ads'
  );
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  const [name, setName] = useState('New Ad Banner');
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(250);
  const [fps, setFps] = useState(60);
  const [duration, setDuration] = useState(5.0);
  const [backgroundColor, setBackgroundColor] = useState('#090a0f');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: AdPreset, index: number) => {
    setSelectedPresetIndex(index);
    setWidth(preset.width);
    setHeight(preset.height);
    setDuration(preset.duration);
    setFps(preset.fps);
    setName(preset.name);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalComp: Composition = {
      id: 'comp_' + Date.now(),
      name: name.trim() || 'Untitled Banner',
      width: Math.max(80, Math.min(3840, width)),
      height: Math.max(50, Math.min(2160, height)),
      fps,
      duration: Math.max(0.5, Math.min(30, duration)),
      backgroundColor,
      layers: [],
    };
    onCreateComposition(finalComp);
    onClose();
  };

  const filteredPresets = AD_PRESETS.filter((p) => p.category === activeCategory);

  const colorPresets = [
    '#090a0f',
    '#0c0f17',
    '#000000',
    '#18181b',
    '#0f172a',
    '#1e1b4b',
    '#ffffff',
    '#f8fafc',
    '#14532d',
    '#7f1d1d',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 px-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                New Composition / Ad Banner
              </h2>
              <p className="text-[11px] text-zinc-400">
                Select a standard Google AdSense ad format or customize canvas dimensions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleCreate} className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Column: Preset Categories & List */}
          <div className="w-full md:w-1/2 border-r border-zinc-800/80 p-4 overflow-y-auto custom-scrollbar flex flex-col bg-zinc-950/60">
            {/* Category Filter Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveCategory('google_ads')}
                className={`py-1.5 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1.5 ${
                  activeCategory === 'google_ads'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Google Ads</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('social')}
                className={`py-1.5 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1.5 ${
                  activeCategory === 'social'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Social / Video</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('web')}
                className={`py-1.5 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1.5 ${
                  activeCategory === 'web'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Web / UI</span>
              </button>
            </div>

            {/* Presets List */}
            <div className="space-y-2 flex-1">
              {filteredPresets.map((preset, index) => {
                const isSelected = width === preset.width && height === preset.height;
                return (
                  <div
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset, index)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500/80 ring-1 ring-blue-500/50'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">{preset.name}</span>
                        {preset.category === 'google_ads' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            AdSense
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                        {preset.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-mono font-bold text-blue-400 block">
                        {preset.width} × {preset.height}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {preset.duration}s @ {preset.fps}fps
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Custom Settings Form */}
          <div className="w-full md:w-1/2 p-5 flex flex-col justify-between bg-zinc-900/30 text-xs space-y-4">
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 border-b border-zinc-800 pb-2 flex items-center justify-between">
                <span>Composition Parameters</span>
                <span className="text-[11px] font-mono text-blue-400">
                  {width} × {height} px
                </span>
              </h3>

              {/* Comp Name */}
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Banner / Comp Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-medium outline-none focus:border-blue-500"
                />
              </div>

              {/* Dimensions Width & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="3840"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value) || 300)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="2160"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value) || 250)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono"
                  />
                </div>
              </div>

              {/* Duration & FPS */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="30"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value) || 5.0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono"
                  />
                  <span className="text-[9px] text-zinc-500 mt-0.5 block">
                    Google Ads max 30s limit
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Frame Rate (FPS)
                  </label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 outline-none cursor-pointer font-medium"
                  >
                    <option value="60">60 FPS (Ultra Smooth)</option>
                    <option value="30">30 FPS (Standard Ad)</option>
                    <option value="24">24 FPS (Cinematic)</option>
                  </select>
                </div>
              </div>

              {/* Canvas Background Color */}
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Background Color
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBackgroundColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded border ${
                        backgroundColor === c
                          ? 'border-blue-500 ring-2 ring-blue-500/40'
                          : 'border-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Create Composition</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
