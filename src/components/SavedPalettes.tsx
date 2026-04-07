'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { type SavedPalette, getSaved, savePalette, removePalette } from '@/lib/storage';
import { textColorForBg, nearestColorName } from '@/lib/colors';

interface SavedPalettesProps {
  currentColors: string[];
  currentHarmony: string;
  onLoad: (colors: string[]) => void;
}

export default function SavedPalettes({ currentColors, currentHarmony, onLoad }: SavedPalettesProps) {
  const [palettes, setPalettes] = useState<SavedPalette[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [saveName, setSaveName] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setPalettes(getSaved());
  }, []);

  const handleSave = () => {
    const name = saveName.trim() || `Palette ${palettes.length + 1}`;
    const palette: SavedPalette = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      colors: [...currentColors],
      harmony: currentHarmony,
      createdAt: Date.now(),
    };
    savePalette(palette);
    setPalettes(getSaved());
    setSaveName('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const handleRemove = (id: string) => {
    removePalette(id);
    setPalettes(getSaved());
  };

  return (
    <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 space-y-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Bookmark size={16} className="text-teal-500" />
          Saved Palettes
          {palettes.length > 0 && (
            <span className="text-[10px] text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full">
              {palettes.length}
            </span>
          )}
        </h3>
        {expanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
      </button>

      {expanded && (
        <>
          {/* Save current */}
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Palette name (optional)"
              className="flex-1 bg-[#0a0a0b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                justSaved
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20'
              }`}
            >
              {justSaved ? 'Saved!' : 'Save'}
            </button>
          </div>

          {/* Saved list */}
          {palettes.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">No saved palettes yet. Save one above.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {palettes.map(p => (
                <div
                  key={p.id}
                  className="group flex items-center gap-3 p-2.5 rounded-lg bg-[#0a0a0b] border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-pointer"
                  onClick={() => onLoad(p.colors)}
                >
                  {/* Color preview */}
                  <div className="flex rounded-md overflow-hidden shrink-0">
                    {p.colors.map((c, i) => (
                      <div key={i} className="w-5 h-8" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-200 truncate">{p.name}</div>
                    <div className="text-[10px] text-zinc-600 capitalize">{p.harmony}</div>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(p.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
