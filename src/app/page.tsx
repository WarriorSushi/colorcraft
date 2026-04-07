'use client';

import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Palette, Sparkles, ExternalLink, Keyboard } from 'lucide-react';
import { generatePalette, randomHex, type HarmonyType } from '@/lib/colors';
import PaletteBar from '@/components/PaletteBar';
import ColorEditor from '@/components/ColorEditor';
import HarmonySelector from '@/components/HarmonySelector';
import ContrastChecker from '@/components/ContrastChecker';
import ColorBlindPreview from '@/components/ColorBlindPreview';
import ExportPanel from '@/components/ExportPanel';
import SavedPalettes from '@/components/SavedPalettes';

const INITIAL_BASE = '#14b8a6';
const INITIAL_HARMONY: HarmonyType = 'analogous';

export default function HomePage() {
  const [colors, setColors] = useState<string[]>(() => generatePalette(INITIAL_BASE, INITIAL_HARMONY, 5));
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [harmony, setHarmony] = useState<HarmonyType>(INITIAL_HARMONY);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'editor' | 'contrast' | 'blindness' | 'export'>('editor');

  const regenerate = useCallback(() => {
    const base = locked.some(l => l) 
      ? colors[locked.findIndex(l => l)] || randomHex()
      : randomHex();
    const newColors = generatePalette(base, harmony, 5);
    setColors(prev => prev.map((c, i) => locked[i] ? c : newColors[i]));
  }, [harmony, locked, colors]);

  const handleColorChange = useCallback((index: number, color: string) => {
    setColors(prev => {
      const next = [...prev];
      next[index] = color;
      return next;
    });
  }, []);

  const handleToggleLock = useCallback((index: number) => {
    setLocked(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const handleReorder = useCallback((from: number, to: number) => {
    setColors(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setLocked(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const handleHarmonyChange = useCallback((newHarmony: HarmonyType) => {
    setHarmony(newHarmony);
    const base = colors[0] || randomHex();
    const newColors = generatePalette(base, newHarmony, 5);
    setColors(prev => prev.map((c, i) => locked[i] ? c : newColors[i]));
  }, [colors, locked]);

  const handleLoadPalette = useCallback((loadedColors: string[]) => {
    setColors(loadedColors);
    setLocked(loadedColors.map(() => false));
  }, []);

  // Keyboard shortcut: Space to regenerate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        regenerate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [regenerate]);

  const TABS = [
    { id: 'editor' as const, label: 'Editor' },
    { id: 'contrast' as const, label: 'Contrast' },
    { id: 'blindness' as const, label: 'Vision' },
    { id: 'export' as const, label: 'Export' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-sky-500 flex items-center justify-center">
              <Palette size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-100 font-[var(--font-space)]">ColorCraft</h1>
              <p className="text-[10px] text-zinc-500 hidden sm:block">Palette Generator & Contrast Checker</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-zinc-600 bg-zinc-800/30 px-2.5 py-1.5 rounded-lg border border-zinc-800/50">
              <Keyboard size={12} />
              Press <kbd className="bg-zinc-700/50 px-1 py-0.5 rounded text-zinc-400 font-mono">Space</kbd> to regenerate
            </div>
            <a
              href="https://github.com/WarriorSushi/colorcraft"
              target="_blank"
              rel="noopener"
              className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Controls row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <HarmonySelector value={harmony} onChange={handleHarmonyChange} />
          </div>
          <button
            onClick={regenerate}
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-medium rounded-xl px-6 py-2.5 text-sm transition-colors shadow-lg shadow-teal-500/20"
          >
            <RefreshCw size={16} />
            Generate
          </button>
        </div>

        {/* Palette bar */}
        <PaletteBar
          colors={colors}
          locked={locked}
          onColorChange={handleColorChange}
          onToggleLock={handleToggleLock}
          onReorder={handleReorder}
          onSelectColor={setSelectedIndex}
          selectedIndex={selectedIndex}
        />

        {/* Tool tabs */}
        <div className="flex gap-1 bg-[#111113] rounded-xl p-1 border border-zinc-800/50">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal-500/15 text-teal-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content + saved palettes */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'editor' && (
              <ColorEditor
                color={colors[selectedIndex]}
                onChange={(hex) => handleColorChange(selectedIndex, hex)}
                index={selectedIndex}
              />
            )}
            {activeTab === 'contrast' && <ContrastChecker colors={colors} />}
            {activeTab === 'blindness' && <ColorBlindPreview colors={colors} />}
            {activeTab === 'export' && <ExportPanel colors={colors} />}
          </div>
          <div>
            <SavedPalettes
              currentColors={colors}
              currentHarmony={harmony}
              onLoad={handleLoadPalette}
            />
          </div>
        </div>

        {/* Feature highlights */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-zinc-800/50">
          {[
            { icon: '🎨', title: '7 Harmony Rules', desc: 'Complementary, analogous, triadic, split-complementary, tetradic, monochromatic, random' },
            { icon: '♿', title: 'WCAG Contrast', desc: 'Check AA/AAA compliance for any color pair. Know your accessibility scores.' },
            { icon: '👁', title: 'Color Blind Sim', desc: 'Preview palettes through 4 types of color vision deficiency.' },
            { icon: '📦', title: 'Export Anywhere', desc: 'CSS variables, Tailwind config, SCSS, or JSON. One click.' },
          ].map((f, i) => (
            <div key={i} className="bg-[#111113] border border-zinc-800/50 rounded-xl p-4">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-zinc-600">
          <span>© 2026 ColorCraft — Built by AltCorp</span>
          <span>Press <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-zinc-400">Space</kbd> to regenerate</span>
        </div>
      </footer>
    </div>
  );
}
