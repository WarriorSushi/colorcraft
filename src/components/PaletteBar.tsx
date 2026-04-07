'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Lock, Unlock, GripVertical } from 'lucide-react';
import { textColorForBg, hexToHsl, nearestColorName } from '@/lib/colors';

interface PaletteBarProps {
  colors: string[];
  locked: boolean[];
  onColorChange: (index: number, color: string) => void;
  onToggleLock: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onSelectColor: (index: number) => void;
  selectedIndex: number;
}

export default function PaletteBar({
  colors, locked, onColorChange, onToggleLock, onReorder, onSelectColor, selectedIndex
}: PaletteBarProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const copyColor = useCallback((hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  }, []);

  return (
    <>
      {/* Desktop: 5-column grid */}
      <div className="hidden sm:grid grid-cols-5 gap-0 rounded-lg overflow-hidden border border-[#1e1e21]">
        {colors.map((color, i) => {
          const textColor = textColorForBg(color);
          const textDim = textColor === '#ffffff' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
          const hsl = hexToHsl(color);
          const name = nearestColorName(color);
          const isSelected = i === selectedIndex;

          return (
            <div
              key={i}
              className={`relative group cursor-pointer transition-all duration-150 ${
                isSelected ? 'ring-1 ring-teal-500 ring-inset z-10' : ''
              } ${i === dragIndex ? 'opacity-30' : ''} ${dragOverIndex === i && dragIndex !== i ? 'brightness-110' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onSelectColor(i)}
              draggable
              onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragIndex(i); }}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i);
                setDragIndex(null); setDragOverIndex(null);
              }}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
            >
              <div className="h-[200px] md:h-[280px] flex flex-col justify-end p-3">
                {locked[i] && (
                  <div className="absolute top-2.5 right-2.5" style={{ color: textDim }}>
                    <Lock size={11} />
                  </div>
                )}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing" style={{ color: textColor }}>
                  <GripVertical size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[12px] md:text-[13px] font-mono font-medium tracking-wide uppercase" style={{ color: textColor }}>{color}</span>
                  <span className="block text-[9px] md:text-[10px] font-medium" style={{ color: textDim }}>{name}</span>
                  <span className="block text-[8px] md:text-[9px] font-mono" style={{ color: textDim }}>{hsl.h}° {hsl.s}% {hsl.l}%</span>
                </div>
                <div className={`absolute bottom-2.5 right-2.5 flex flex-col gap-1 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                  <button onClick={(e) => { e.stopPropagation(); copyColor(color, i); }} className="p-1.5 rounded-md transition-colors" style={{ backgroundColor: `${textColor}12`, color: textColor }}>
                    {copiedIndex === i ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onToggleLock(i); }} className="p-1.5 rounded-md transition-colors" style={{ backgroundColor: `${textColor}12`, color: textColor }}>
                    {locked[i] ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: horizontal scrollable strip with WIDE swatches */}
      <div className="sm:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 scrollbar-hide">
          {colors.map((color, i) => {
            const textColor = textColorForBg(color);
            const textDim = textColor === '#ffffff' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
            const name = nearestColorName(color);
            const isSelected = i === selectedIndex;

            return (
              <div
                key={i}
                className={`relative shrink-0 w-[72vw] snap-center rounded-xl cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-teal-500 scale-[1.01]' : 'ring-1 ring-white/10'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onSelectColor(i)}
              >
                <div className="h-[160px] flex flex-col justify-between p-3">
                  {/* Top: lock + index */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold opacity-40" style={{ color: textColor }}>
                      {i + 1}/5
                    </span>
                    {locked[i] && <Lock size={12} style={{ color: textDim }} />}
                  </div>

                  {/* Bottom: color info + actions */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="block text-[15px] font-mono font-medium tracking-wide uppercase" style={{ color: textColor }}>{color}</span>
                      <span className="block text-[11px] font-medium mt-0.5" style={{ color: textDim }}>{name}</span>
                    </div>
                    {/* Actions ALWAYS visible on mobile */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyColor(color, i); }}
                        className="p-2 rounded-lg active:scale-90 transition-transform"
                        style={{ backgroundColor: `${textColor}15`, color: textColor }}
                      >
                        {copiedIndex === i ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleLock(i); }}
                        className="p-2 rounded-lg active:scale-90 transition-transform"
                        style={{ backgroundColor: `${textColor}15`, color: textColor }}
                      >
                        {locked[i] ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-2">
          {colors.map((color, i) => (
            <button
              key={i}
              onClick={() => onSelectColor(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === selectedIndex ? 'w-5 bg-teal-500' : 'bg-zinc-600'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
