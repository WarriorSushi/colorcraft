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
        className="flex items-center gap-2 bg-transparent border border-[#27272a] rounded-lg px-3.5 py-2 text-[13px] text-zinc-100 hover:border-zinc-600 transition-colors w-full"
      >
        <span className="flex-1 text-left">
          <span className="font-display font-medium">{current.label}</span>
          <span className="text-zinc-600 ml-2 text-[11px] hidden sm:inline">— {current.description}</span>
        </span>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-[#111113] border border-[#27272a] rounded-lg overflow-hidden shadow-2xl shadow-black/40">
          {HARMONY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 text-[12px] hover:bg-zinc-800/40 transition-colors ${
                opt.value === value ? 'text-teal-400 bg-teal-500/5' : 'text-zinc-300'
              }`}
            >
              <span className="font-display font-medium">{opt.label}</span>
              <span className="text-zinc-600 ml-2 text-[10px]">{opt.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
