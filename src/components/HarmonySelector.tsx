'use client';

import { HARMONY_OPTIONS, type HarmonyType } from '@/lib/colors';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HarmonySelectorProps {
  value: HarmonyType;
  onChange: (harmony: HarmonyType) => void;
}

export default function HarmonySelector({ value, onChange }: HarmonySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = HARMONY_OPTIONS.find(o => o.value === value)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#111113] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 hover:border-zinc-700 transition-colors w-full"
      >
        <span className="flex-1 text-left">
          <span className="font-medium">{current.label}</span>
          <span className="text-zinc-500 ml-2 text-xs hidden sm:inline">{current.description}</span>
        </span>
        <ChevronDown size={16} className={`text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          {HARMONY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-0 ${
                opt.value === value ? 'bg-teal-500/10 text-teal-400' : 'text-zinc-300'
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
