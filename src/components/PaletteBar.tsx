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
              isSelected ? 'ring-1.5 ring-teal-500 ring-offset-1 ring-offset-[#0a0a0b] z-10' : ''
            } ${isDragging ? 'opacity-30' : ''} ${isDragOver ? 'brightness-110' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor(i)}
            draggable
            onDragStart={(e) => { setDragIndex(i); e.dataTransfer.effectAllowed = 'move'; }}
            onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i);
              setDragIndex(null); setDragOverIndex(null);
            }}
            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
          >
            {/* Tall swatch — the palette IS the hero */}
            <div className="h-[220px] md:h-[280px] flex flex-col justify-end p-3 md:p-4">
              {/* Lock badge */}
              {locked[i] && (
                <div className="absolute top-3 right-3" style={{ color: textDim }}>
                  <Lock size={11} />
                </div>
              )}

              {/* Drag handle — top center on hover */}
              <div
                className="absolute top-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing"
                style={{ color: textColor }}
              >
                <GripVertical size={14} />
              </div>

              {/* Color data — bottom-aligned, left-aligned */}
              <div className="space-y-1">
                <span className="block text-[13px] font-mono font-medium tracking-wide uppercase" style={{ color: textColor }}>
                  {color}
                </span>
                <span className="block text-[10px] font-medium" style={{ color: textDim }}>
                  {name}
                </span>
                <span className="block text-[9px] font-mono" style={{ color: textDim }}>
                  {hsl.h}° {hsl.s}% {hsl.l}%
                </span>
              </div>

              {/* Actions — bottom right on hover */}
              <div className="absolute bottom-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); copyColor(color, i); }}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ backgroundColor: `${textColor}10`, color: textColor }}
                  title="Copy hex"
                >
                  {copiedIndex === i ? <Check size={12} /> : <Copy size={12} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleLock(i); }}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ backgroundColor: `${textColor}10`, color: textColor }}
                  title={locked[i] ? 'Unlock' : 'Lock'}
                >
                  {locked[i] ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
