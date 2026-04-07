'use client';

import { contrastRatio, wcagGrade, textColorForBg } from '@/lib/colors';

interface ContrastCheckerProps {
  colors: string[];
}

export default function ContrastChecker({ colors }: ContrastCheckerProps) {
  // Build a matrix of all color pairs
  const pairs: { c1: string; c2: string; ratio: number; grade: ReturnType<typeof wcagGrade> }[] = [];

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const ratio = contrastRatio(colors[i], colors[j]);
      pairs.push({ c1: colors[i], c2: colors[j], ratio, grade: wcagGrade(ratio) });
    }
  }

  // Also check each color against pure white and black
  const vsWhite = colors.map(c => {
    const ratio = contrastRatio(c, '#ffffff');
    return { color: c, ratio, grade: wcagGrade(ratio), bg: '#ffffff' };
  });
  const vsBlack = colors.map(c => {
    const ratio = contrastRatio(c, '#000000');
    return { color: c, ratio, grade: wcagGrade(ratio), bg: '#000000' };
  });

  return (
    <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 space-y-5">
      <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
        <span>WCAG Contrast Checker</span>
        <span className="text-[10px] font-normal text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full">
          {pairs.length} pairs
        </span>
      </h3>

      {/* Color pairs grid */}
      <div className="grid gap-2">
        {pairs.map(({ c1, c2, ratio, grade }, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0a0a0b] border border-zinc-800/50">
            <div className="flex gap-1 shrink-0">
              <div className="w-6 h-6 rounded-md border border-zinc-700" style={{ backgroundColor: c1 }} />
              <div className="w-6 h-6 rounded-md border border-zinc-700" style={{ backgroundColor: c2 }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-zinc-400 truncate">{c1}</span>
                <span className="text-[10px] text-zinc-600">×</span>
                <span className="text-[11px] font-mono text-zinc-400 truncate">{c2}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-zinc-300">{ratio.toFixed(2)}:1</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: grade.color + '20', color: grade.color }}
              >
                {grade.level}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* vs White/Black */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs text-zinc-500 mb-2">vs White (#fff)</h4>
          <div className="space-y-1.5">
            {vsWhite.map(({ color, ratio, grade }, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <div className="w-4 h-4 rounded border border-zinc-700" style={{ backgroundColor: color }} />
                <span className="font-mono text-zinc-400">{ratio.toFixed(1)}</span>
                <span style={{ color: grade.color }}>{grade.level}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs text-zinc-500 mb-2">vs Black (#000)</h4>
          <div className="space-y-1.5">
            {vsBlack.map(({ color, ratio, grade }, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <div className="w-4 h-4 rounded border border-zinc-700" style={{ backgroundColor: color }} />
                <span className="font-mono text-zinc-400">{ratio.toFixed(1)}</span>
                <span style={{ color: grade.color }}>{grade.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2 border-t border-zinc-800/50 text-[10px]">
        <span className="text-zinc-600">WCAG Levels:</span>
        <span style={{ color: '#22c55e' }}>AAA ≥ 7:1</span>
        <span style={{ color: '#14b8a6' }}>AA ≥ 4.5:1</span>
        <span style={{ color: '#eab308' }}>AA Large ≥ 3:1</span>
        <span style={{ color: '#ef4444' }}>Fail &lt; 3:1</span>
      </div>
    </div>
  );
}
