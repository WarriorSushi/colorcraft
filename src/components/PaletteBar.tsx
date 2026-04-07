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
    <div className="grid grid-cols-5 gap-0 rounded-lg overflow-hidden border border-[#1e1e21]">
      {colors.map((color, i) => {
        const textColor = textColorForBg(color);
        const textDim = textColor === '#ffffff' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
        const hsl = hexToHsl(color);
        const name = nearestColorName(color);
        const isSelected = i === selectedIndex;
        const isDragging = i === dragIndex;
        const isDragOver = i === dragOverIndex && dragIndex !== i;

        return (
          <div
            key={i}
            className={`relative group cursor-pointer transition-all duration-150 ${
              isSelected ? 'ring-1 ring-teal-500 ring-inset z-10' : ''
            } ${isDragging ? 'opacity-30' : ''} ${isDragOver ? 'brightness-110' : ''}`}
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
            {/* Short on mobile, tall on desktop — ALL 5 always visible */}
            <div className="h-[140px] sm:h-[200px] md:h-[280px] flex flex-col justify-end p-2 sm:p-3">
              {/* Lock badge */}
              {locked[i] && (
                <div className="absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5" style={{ color: textDim }}>
                  <Lock size={10} className="sm:w-[11px] sm:h-[11px]" />
                </div>
              )}

              {/* Drag handle — desktop only */}
              <div
                className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing"
                style={{ color: textColor }}
              >
                <GripVertical size={14} />
              </div>

              {/* Color data — bottom-aligned */}
              <div className="space-y-0.5">
                <span
                  className="block text-[10px] sm:text-[12px] md:text-[13px] font-mono font-medium tracking-wide uppercase leading-tight"
                  style={{ color: textColor }}
                >
                  {color}
                </span>
                <span
                  className="block text-[8px] sm:text-[9px] md:text-[10px] font-medium leading-tight"
                  style={{ color: textDim }}
                >
                  {name}
                </span>
                <span
                  className="hidden sm:block text-[8px] md:text-[9px] font-mono"
                  style={{ color: textDim }}
                >
                  {hsl.h}° {hsl.s}% {hsl.l}%
                </span>
              </div>

              {/* Actions — always visible when selected, hover on desktop */}
              <div className={`absolute bottom-1.5 sm:bottom-2.5 right-1.5 sm:right-2.5 flex flex-col gap-0.5 sm:gap-1 ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } transition-opacity`}>
                <button
                  onClick={(e) => { e.stopPropagation(); copyColor(color, i); }}
                  className="p-1 sm:p-1.5 rounded-md transition-colors"
                  style={{ backgroundColor: `${textColor}12`, color: textColor }}
                  title="Copy hex"
                >
                  {copiedIndex === i ? <Check size={10} className="sm:w-3 sm:h-3" /> : <Copy size={10} className="sm:w-3 sm:h-3" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleLock(i); }}
                  className="p-1 sm:p-1.5 rounded-md transition-colors"
                  style={{ backgroundColor: `${textColor}12`, color: textColor }}
                  title={locked[i] ? 'Unlock' : 'Lock'}
                >
                  {locked[i] ? <Lock size={10} className="sm:w-3 sm:h-3" /> : <Unlock size={10} className="sm:w-3 sm:h-3" />}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
