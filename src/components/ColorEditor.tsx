'use client';

import { useState, useCallback } from 'react';
import { hexToHsl, hexToRgb, hslToHex, rgbToHex, nearestColorName, textColorForBg } from '@/lib/colors';

interface ColorEditorProps {
  color: string;
  onChange: (hex: string) => void;
  index: number;
}

export default function ColorEditor({ color, onChange, index }: ColorEditorProps) {
  const [mode, setMode] = useState<'hsl' | 'rgb' | 'hex'>('hsl');
  const [hexInput, setHexInput] = useState(color);
  const hsl = hexToHsl(color);
  const rgb = hexToRgb(color);
  const name = nearestColorName(color);

  const handleHexInput = useCallback((val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) onChange(val.toLowerCase());
  }, [onChange]);

  const handleHslChange = useCallback((key: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...hsl, [key]: value };
    onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l));
  }, [hsl, onChange]);

  const handleRgbChange = useCallback((key: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [key]: value };
    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }, [rgb, onChange]);

  return (
    <div className="space-y-4">
      {/* Color preview — inline, not a card */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold shrink-0 border border-[#1e1e21]"
          style={{ backgroundColor: color, color: textColorForBg(color) }}
        >
          {index + 1}
        </div>
        <div>
          <div className="text-[13px] font-display font-semibold text-zinc-100">{name}</div>
          <div className="text-[11px] font-mono text-zinc-500">{color.toUpperCase()} · HSL({hsl.h}, {hsl.s}%, {hsl.l}%) · RGB({rgb.r}, {rgb.g}, {rgb.b})</div>
        </div>
      </div>

      {/* Mode switcher — underline tabs, not pill tabs */}
      <div className="flex gap-0 border-b border-[#1e1e21]">
        {(['hsl', 'rgb', 'hex'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); if (m === 'hex') setHexInput(color); }}
            className={`px-3 py-2 text-[11px] font-mono uppercase tracking-wider border-b-[1.5px] -mb-px transition-colors ${
              mode === m ? 'border-teal-500 text-zinc-100' : 'border-transparent text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Sliders — clean, tight */}
      <div className="space-y-3.5">
        {mode === 'hsl' && (
          <>
            <SliderRow label="H" value={hsl.h} max={360} suffix="°"
              track={`linear-gradient(to right, hsl(0,${hsl.s}%,${hsl.l}%), hsl(60,${hsl.s}%,${hsl.l}%), hsl(120,${hsl.s}%,${hsl.l}%), hsl(180,${hsl.s}%,${hsl.l}%), hsl(240,${hsl.s}%,${hsl.l}%), hsl(300,${hsl.s}%,${hsl.l}%), hsl(360,${hsl.s}%,${hsl.l}%))`}
              onChange={(v) => handleHslChange('h', v)} />
            <SliderRow label="S" value={hsl.s} max={100} suffix="%"
              track={`linear-gradient(to right, hsl(${hsl.h},0%,${hsl.l}%), hsl(${hsl.h},100%,${hsl.l}%))`}
              onChange={(v) => handleHslChange('s', v)} />
            <SliderRow label="L" value={hsl.l} max={100} suffix="%"
              track={`linear-gradient(to right, hsl(${hsl.h},${hsl.s}%,0%), hsl(${hsl.h},${hsl.s}%,50%), hsl(${hsl.h},${hsl.s}%,100%))`}
              onChange={(v) => handleHslChange('l', v)} />
          </>
        )}

        {mode === 'rgb' && (
          <>
            <SliderRow label="R" value={rgb.r} max={255} suffix=""
              track={`linear-gradient(to right, rgb(0,${rgb.g},${rgb.b}), rgb(255,${rgb.g},${rgb.b}))`}
              onChange={(v) => handleRgbChange('r', v)} />
            <SliderRow label="G" value={rgb.g} max={255} suffix=""
              track={`linear-gradient(to right, rgb(${rgb.r},0,${rgb.b}), rgb(${rgb.r},255,${rgb.b}))`}
              onChange={(v) => handleRgbChange('g', v)} />
            <SliderRow label="B" value={rgb.b} max={255} suffix=""
              track={`linear-gradient(to right, rgb(${rgb.r},${rgb.g},0), rgb(${rgb.r},${rgb.g},255))`}
              onChange={(v) => handleRgbChange('b', v)} />
          </>
        )}

        {mode === 'hex' && (
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value)}
            className="w-full bg-transparent border border-[#27272a] rounded-lg px-3 py-2 text-[13px] font-mono text-zinc-100 focus:outline-none focus:border-teal-500/40"
            placeholder="#14b8a6"
            maxLength={7}
          />
        )}
      </div>

      {/* Native picker — small, secondary */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">Picker</span>
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md cursor-pointer border border-[#27272a]"
        />
      </div>
    </div>
  );
}

function SliderRow({ label, value, max, suffix, track, onChange }: {
  label: string; value: number; max: number; suffix: string; track: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono text-zinc-600 w-3 shrink-0">{label}</span>
      <div className="flex-1 relative h-3 flex items-center">
        <div className="absolute inset-0 h-[3px] top-1/2 -translate-y-1/2 rounded-full" style={{ background: track }} />
        <input
          type="range" min={0} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0a0a0b] shadow-sm pointer-events-none"
          style={{ left: `calc(${(value / max) * 100}% - 7px)` }}
        />
      </div>
      <span className="text-[10px] font-mono text-zinc-400 w-10 text-right tabular-nums">{value}{suffix}</span>
    </div>
  );
}
