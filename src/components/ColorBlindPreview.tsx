'use client';

import { simulateColorBlind, COLOR_BLIND_TYPES, textColorForBg } from '@/lib/colors';
import { Eye } from 'lucide-react';

interface ColorBlindPreviewProps {
  colors: string[];
}

export default function ColorBlindPreview({ colors }: ColorBlindPreviewProps) {
  return (
    <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
        <Eye size={16} className="text-teal-500" />
        Color Blindness Simulation
      </h3>

      {/* Original */}
      <div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Normal Vision</div>
        <div className="flex rounded-lg overflow-hidden border border-zinc-800/50">
          {colors.map((c, i) => (
            <div
              key={i}
              className="flex-1 h-12 flex items-center justify-center"
              style={{ backgroundColor: c }}
            >
              <span className="text-[9px] font-mono font-medium" style={{ color: textColorForBg(c) }}>
                {c}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Simulations */}
      {COLOR_BLIND_TYPES.map(({ type, label, prevalence }) => {
        const simulated = colors.map(c => simulateColorBlind(c, type));
        return (
          <div key={type}>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{label}</span>
              <span className="text-[9px] text-zinc-600">{prevalence}</span>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-zinc-800/50">
              {simulated.map((c, i) => (
                <div
                  key={i}
                  className="flex-1 h-12 flex items-center justify-center"
                  style={{ backgroundColor: c }}
                >
                  <span className="text-[9px] font-mono font-medium" style={{ color: textColorForBg(c) }}>
                    {c}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-[10px] text-zinc-600 leading-relaxed">
        ~8% of men and ~0.5% of women have some form of color vision deficiency. 
        Design for accessibility by ensuring your palette works across all vision types.
      </p>
    </div>
  );
}
