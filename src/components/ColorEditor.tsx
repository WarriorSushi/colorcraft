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
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      onChange(val.toLowerCase());
    }
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
    <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 space-y-5">
      {/* Color preview + name */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-xl border border-zinc-700 shadow-inner flex items-center justify-center text-xs font-mono font-bold shrink-0"
          style={{ backgroundColor: color, color: textColorForBg(color) }}
        >
          {index + 1}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">{name}</h3>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{color.toUpperCase()}</p>
          <p className="text-xs text-zinc-600 mt-0.5">HSL({hsl.h}°, {hsl.s}%, {hsl.l}%)</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-[#0a0a0b] rounded-lg p-1">
        {(['hsl', 'rgb', 'hex'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); if (m === 'hex') setHexInput(color); }}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium uppercase tracking-wider transition-colors ${
              mode === m ? 'bg-teal-500/20 text-teal-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Sliders */}
      {mode === 'hsl' && (
        <div className="space-y-4">
          <SliderRow label="Hue" value={hsl.h} max={360} unit="°"
            gradient={`linear-gradient(to right, hsl(0,${hsl.s}%,${hsl.l}%), hsl(60,${hsl.s}%,${hsl.l}%), hsl(120,${hsl.s}%,${hsl.l}%), hsl(180,${hsl.s}%,${hsl.l}%), hsl(240,${hsl.s}%,${hsl.l}%), hsl(300,${hsl.s}%,${hsl.l}%), hsl(360,${hsl.s}%,${hsl.l}%))`}
            onChange={(v) => handleHslChange('h', v)}
          />
          <SliderRow label="Saturation" value={hsl.s} max={100} unit="%"
            gradient={`linear-gradient(to right, hsl(${hsl.h},0%,${hsl.l}%), hsl(${hsl.h},100%,${hsl.l}%))`}
            onChange={(v) => handleHslChange('s', v)}
          />
          <SliderRow label="Lightness" value={hsl.l} max={100} unit="%"
            gradient={`linear-gradient(to right, hsl(${hsl.h},${hsl.s}%,0%), hsl(${hsl.h},${hsl.s}%,50%), hsl(${hsl.h},${hsl.s}%,100%))`}
            onChange={(v) => handleHslChange('l', v)}
          />
        </div>
      )}

      {mode === 'rgb' && (
        <div className="space-y-4">
          <SliderRow label="Red" value={rgb.r} max={255} unit=""
            gradient={`linear-gradient(to right, rgb(0,${rgb.g},${rgb.b}), rgb(255,${rgb.g},${rgb.b}))`}
            onChange={(v) => handleRgbChange('r', v)}
          />
          <SliderRow label="Green" value={rgb.g} max={255} unit=""
            gradient={`linear-gradient(to right, rgb(${rgb.r},0,${rgb.b}), rgb(${rgb.r},255,${rgb.b}))`}
            onChange={(v) => handleRgbChange('g', v)}
          />
          <SliderRow label="Blue" value={rgb.b} max={255} unit=""
            gradient={`linear-gradient(to right, rgb(${rgb.r},${rgb.g},0), rgb(${rgb.r},${rgb.g},255))`}
            onChange={(v) => handleRgbChange('b', v)}
          />
        </div>
      )}

      {mode === 'hex' && (
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">Hex Value</label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value)}
            className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
            placeholder="#14b8a6"
            maxLength={7}
          />
        </div>
      )}

      {/* Native color picker */}
      <div>
        <label className="text-xs text-zinc-500 mb-1.5 block">Color Picker</label>
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer border border-zinc-800"
        />
      </div>
    </div>
  );
}

function SliderRow({ label, value, max, unit, gradient, onChange }: {
  label: string; value: number; max: number; unit: string; gradient: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="text-xs font-mono text-zinc-400">{value}{unit}</span>
      </div>
      <div className="relative">
        <div className="h-2 rounded-full" style={{ background: gradient }} />
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-zinc-900 shadow-md pointer-events-none"
          style={{ left: `calc(${(value / max) * 100}% - 8px)` }}
        />
      </div>
    </div>
  );
}
