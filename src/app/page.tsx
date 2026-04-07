'use client';

import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Palette, ExternalLink, Keyboard, Zap, Eye, Accessibility, Code2, Shuffle } from 'lucide-react';
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
    setColors(prev => { const next = [...prev]; next[index] = color; return next; });
  }, []);

  const handleToggleLock = useCallback((index: number) => {
    setLocked(prev => { const next = [...prev]; next[index] = !next[index]; return next; });
  }, []);

  const handleReorder = useCallback((from: number, to: number) => {
    setColors(prev => { const n = [...prev]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; });
    setLocked(prev => { const n = [...prev]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; });
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

  // Spacebar = regenerate (Coolors-style)
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
    { id: 'editor' as const, label: 'Edit', icon: Palette },
    { id: 'contrast' as const, label: 'Contrast', icon: Accessibility },
    { id: 'blindness' as const, label: 'Vision', icon: Eye },
    { id: 'export' as const, label: 'Export', icon: Code2 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Compact header — tool-like, not website-like */}
      <header className="border-b border-[#1e1e21] sticky top-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-5 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Palette size={17} className="text-teal-500" />
            <span className="text-[13px] font-display font-semibold text-zinc-100 tracking-tight">ColorCraft</span>
            <span className="text-[10px] text-zinc-600 font-mono ml-1 hidden sm:inline">v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
              <kbd className="bg-zinc-800/60 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-800">Space</kbd>
              regenerate
            </span>
            <a
              href="https://github.com/WarriorSushi/colorcraft"
              target="_blank" rel="noopener"
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-5 py-5 space-y-5">
        {/* Controls — tight, tool-bar feel */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <HarmonySelector value={harmony} onChange={handleHarmonyChange} />
          </div>
          <button
            onClick={regenerate}
            className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 font-medium font-display rounded-lg px-5 py-2 text-[13px] transition-all active:scale-[0.98]"
          >
            <Shuffle size={14} />
            Generate
          </button>
        </div>

        {/* THE PALETTE — this is the hero, tall and dominant */}
        <PaletteBar
          colors={colors}
          locked={locked}
          onColorChange={handleColorChange}
          onToggleLock={handleToggleLock}
          onReorder={handleReorder}
          onSelectColor={setSelectedIndex}
          selectedIndex={selectedIndex}
        />

        {/* Tab bar — compact, left-aligned */}
        <div className="flex items-center gap-0.5 border-b border-[#1e1e21]">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium transition-colors border-b-[1.5px] -mb-px ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-zinc-100'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content — asymmetric 2/3 + 1/3 layout */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-5">
          <div>
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

        {/* Feature strip — horizontal, dense, not a card grid */}
        <div className="flex items-stretch gap-px mt-6 rounded-lg overflow-hidden border border-[#1e1e21]">
          {[
            { icon: Zap, title: '7 Harmony Rules', desc: 'Complementary, analogous, triadic, and more' },
            { icon: Accessibility, title: 'WCAG Contrast', desc: 'AA/AAA compliance for every pair' },
            { icon: Eye, title: 'Color Blind Sim', desc: '4 types of vision deficiency preview' },
            { icon: Code2, title: 'Export Anywhere', desc: 'CSS, Tailwind, SCSS, or JSON' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex-1 bg-[#111113] px-4 py-3.5 border-r border-[#1e1e21] last:border-r-0">
                <Icon size={14} className="text-zinc-500 mb-2" />
                <h3 className="text-[11px] font-display font-semibold text-zinc-200 mb-0.5">{f.title}</h3>
                <p className="text-[10px] text-zinc-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-[#1e1e21] mt-8">
        <div className="max-w-[1400px] mx-auto px-5 py-4 flex items-center justify-between text-[10px] text-zinc-600 font-mono">
          <span>colorcraft — altcorp 2026</span>
          <span>100% client-side · no data leaves your browser</span>
        </div>
      </footer>
    </div>
  );
}
