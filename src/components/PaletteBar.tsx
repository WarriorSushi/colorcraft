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
      {/* Desktop: 5-column grid, tall swatches */}
      <div className="hidden sm:grid grid-cols-5 gap-0 rounded-lg overflow-hidden border border-[#1e1e21]">
        {colors.map((color, i) => (
          <Swatch
            key={`d-${i}`}
            color={color}
            index={i}
            isSelected={i === selectedIndex}
            isLocked={locked[i]}
            isDragging={i === dragIndex}
            isDragOver={i === dragOverIndex && dragIndex !== i}
            copiedIndex={copiedIndex}
            height="h-[280px]"
            onSelect={() => onSelectColor(i)}
            onCopy={() => copyColor(color, i)}
            onToggleLock={() => onToggleLock(i)}
            onDragStart={() => setDragIndex(i)}
            onDragOver={() => setDragOverIndex(i)}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i);
              setDragIndex(null); setDragOverIndex(null);
            }}
            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
          />
        ))}
      </div>

      {/* Mobile: horizontal scroll strip with tappable swatches */}
      <div className="sm:hidden flex gap-0 rounded-lg overflow-hidden border border-[#1e1e21] overflow-x-auto snap-x snap-mandatory">
        {colors.map((color, i) => (
          <Swatch
            key={`m-${i}`}
            color={color}
            index={i}
            isSelected={i === selectedIndex}
            isLocked={locked[i]}
            isDragging={false}
            isDragOver={false}
            copiedIndex={copiedIndex}
            height="h-[200px]"
            className="min-w-[33.333%] snap-center"
            onSelect={() => onSelectColor(i)}
            onCopy={() => copyColor(color, i)}
            onToggleLock={() => onToggleLock(i)}
          />
        ))}
      </div>

      {/* Mobile: selected color indicator dots */}
      <div className="sm:hidden flex items-center justify-center gap-2 pt-2">
        {colors.map((color, i) => (
          <button
            key={i}
            onClick={() => onSelectColor(i)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              i === selectedIndex ? 'border-white scale-110' : 'border-zinc-700'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}

function Swatch({
  color, index, isSelected, isLocked, isDragging, isDragOver, copiedIndex, height,
  className = '', onSelect, onCopy, onToggleLock, onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  color: string; index: number; isSelected: boolean; isLocked: boolean;
  isDragging: boolean; isDragOver: boolean; copiedIndex: number | null;
  height: string; className?: string;
  onSelect: () => void; onCopy: () => void; onToggleLock: () => void;
  onDragStart?: () => void; onDragOver?: () => void; onDrop?: () => void; onDragEnd?: () => void;
}) {
  const textColor = textColorForBg(color);
  const textDim = textColor === '#ffffff' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
  const hsl = hexToHsl(color);
  const name = nearestColorName(color);

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-150 flex-shrink-0 ${
        isSelected ? 'ring-1 ring-teal-500 ring-inset z-10' : ''
      } ${isDragging ? 'opacity-30' : ''} ${isDragOver ? 'brightness-110' : ''} ${className}`}
      style={{ backgroundColor: color }}
      onClick={onSelect}
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); } : undefined}
      onDragOver={onDragOver ? (e) => { e.preventDefault(); onDragOver(); } : undefined}
      onDrop={onDrop ? (e) => { e.preventDefault(); onDrop(); } : undefined}
      onDragEnd={onDragEnd}
    >
      <div className={`${height} flex flex-col justify-end p-3`}>
        {/* Lock badge */}
        {isLocked && (
          <div className="absolute top-2.5 right-2.5" style={{ color: textDim }}>
            <Lock size={11} />
          </div>
        )}

        {/* Drag handle — desktop only */}
        {onDragStart && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing"
            style={{ color: textColor }}
          >
            <GripVertical size={14} />
          </div>
        )}

        {/* Color data — bottom-aligned, left-aligned */}
        <div className="space-y-0.5">
          <span className="block text-[12px] sm:text-[13px] font-mono font-medium tracking-wide uppercase" style={{ color: textColor }}>
            {color}
          </span>
          <span className="block text-[9px] sm:text-[10px] font-medium" style={{ color: textDim }}>
            {name}
          </span>
          <span className="block text-[8px] sm:text-[9px] font-mono" style={{ color: textDim }}>
            {hsl.h}° {hsl.s}% {hsl.l}%
          </span>
        </div>

        {/* Actions — visible on tap (mobile) or hover (desktop) */}
        <div className={`absolute bottom-2.5 right-2.5 flex flex-col gap-1 ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } transition-opacity`}>
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(); }}
            className="p-1.5 rounded-md transition-colors"
            style={{ backgroundColor: `${textColor}12`, color: textColor }}
            title="Copy hex"
          >
            {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
            className="p-1.5 rounded-md transition-colors"
            style={{ backgroundColor: `${textColor}12`, color: textColor }}
            title={isLocked ? 'Unlock' : 'Lock'}
          >
            {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
