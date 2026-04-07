'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Lock, Unlock, RefreshCw, GripVertical } from 'lucide-react';
import { textColorForBg, hexToHsl, hslToHex, nearestColorName } from '@/lib/colors';

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
    setTimeout(() => setCopiedIndex(null), 1500);
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      onReorder(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="grid grid-cols-5 gap-0 rounded-2xl overflow-hidden border border-zinc-800/50 shadow-2xl">
      {colors.map((color, i) => {
        const textColor = textColorForBg(color);
        const hsl = hexToHsl(color);
        const name = nearestColorName(color);
        const isSelected = i === selectedIndex;
        const isDragging = i === dragIndex;
        const isDragOver = i === dragOverIndex && dragIndex !== i;

        return (
          <div
            key={i}
            className={`relative group cursor-pointer transition-all duration-200 ${
              isSelected ? 'ring-2 ring-teal-500 ring-offset-2 ring-offset-[#0a0a0b] z-10' : ''
            } ${isDragging ? 'opacity-40' : ''} ${isDragOver ? 'scale-105' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor(i)}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
          >
            <div className="aspect-[3/4] md:aspect-[2/3] flex flex-col items-center justify-center p-3 md:p-4">
              {/* Drag handle */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing" style={{ color: textColor }}>
                <GripVertical size={16} />
              </div>

              {/* Color info */}
              <div className="flex flex-col items-center gap-1.5 mt-4">
                <span className="text-xs font-mono font-medium tracking-wider uppercase" style={{ color: textColor }}>
                  {color}
                </span>
                <span className="text-[10px] font-medium opacity-70 text-center leading-tight" style={{ color: textColor }}>
                  {name}
                </span>
                <span className="text-[10px] font-mono opacity-50" style={{ color: textColor }}>
                  {hsl.h}° {hsl.s}% {hsl.l}%
                </span>
              </div>

              {/* Actions */}
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); copyColor(color, i); }}
                  className="p-1.5 rounded-lg backdrop-blur-sm transition-colors"
                  style={{ backgroundColor: `${textColor}15`, color: textColor }}
                  title="Copy hex"
                >
                  {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleLock(i); }}
                  className="p-1.5 rounded-lg backdrop-blur-sm transition-colors"
                  style={{ backgroundColor: `${textColor}15`, color: textColor }}
                  title={locked[i] ? 'Unlock' : 'Lock'}
                >
                  {locked[i] ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
              </div>

              {/* Lock indicator */}
              {locked[i] && (
                <div className="absolute top-2 right-2" style={{ color: textColor }}>
                  <Lock size={12} className="opacity-50" />
                </div>
              )}
            </div>

            {/* Hidden color input */}
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(i, e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              style={{ zIndex: -1 }}
            />
          </div>
        );
      })}
    </div>
  );
}
