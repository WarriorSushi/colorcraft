// Color conversion, harmony generation, contrast checking, and color blindness simulation

export interface HSL { h: number; s: number; l: number; }
export interface RGB { r: number; g: number; b: number; }
export type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'tetradic' | 'monochromatic' | 'random';

// ─── Conversion ────────────────────────────────────────────

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
    .join('');
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

// ─── Luminance & Contrast (WCAG 2.0) ──────────────────────

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function wcagGrade(ratio: number): { level: string; pass: boolean; color: string } {
  if (ratio >= 7) return { level: 'AAA', pass: true, color: '#22c55e' };
  if (ratio >= 4.5) return { level: 'AA', pass: true, color: '#14b8a6' };
  if (ratio >= 3) return { level: 'AA Large', pass: true, color: '#eab308' };
  return { level: 'Fail', pass: false, color: '#ef4444' };
}

export function textColorForBg(bgHex: string): string {
  return relativeLuminance(bgHex) > 0.179 ? '#000000' : '#ffffff';
}

// ─── Color Harmony ─────────────────────────────────────────

export function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function varyLightness(hsl: HSL, amount: number): HSL {
  return { h: hsl.h, s: hsl.s, l: Math.max(5, Math.min(95, hsl.l + amount)) };
}

function varySaturation(hsl: HSL, amount: number): HSL {
  return { h: hsl.h, s: Math.max(5, Math.min(100, hsl.s + amount)), l: hsl.l };
}

export function generatePalette(baseHex: string, harmony: HarmonyType, count: number = 5): string[] {
  const base = hexToHsl(baseHex);
  const hues: number[] = [base.h];

  switch (harmony) {
    case 'complementary':
      hues.push((base.h + 180) % 360);
      break;
    case 'analogous':
      hues.push((base.h + 30) % 360, (base.h + 60) % 360, (base.h + 330) % 360, (base.h + 300) % 360);
      break;
    case 'triadic':
      hues.push((base.h + 120) % 360, (base.h + 240) % 360);
      break;
    case 'split-complementary':
      hues.push((base.h + 150) % 360, (base.h + 210) % 360);
      break;
    case 'tetradic':
      hues.push((base.h + 90) % 360, (base.h + 180) % 360, (base.h + 270) % 360);
      break;
    case 'monochromatic':
      // All same hue, vary lightness
      return Array.from({ length: count }, (_, i) => {
        const step = 70 / (count - 1);
        return hslToHex(base.h, base.s, Math.round(15 + step * i));
      });
    case 'random':
    default:
      return Array.from({ length: count }, () => randomHex());
  }

  // Build palette from hues with slight variations for interest
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = hues[i % hues.length];
    const sat = Math.max(20, Math.min(95, base.s + (i % 2 === 0 ? 0 : -15)));
    const light = Math.max(20, Math.min(80, base.l + (i * 8 - count * 4)));
    colors.push(hslToHex(hue, sat, light));
  }
  return colors;
}

// ─── Color Blindness Simulation ────────────────────────────
// Simplified Brettel / Viénot simulation matrices

export type ColorBlindType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export function simulateColorBlind(hex: string, type: ColorBlindType): string {
  const { r, g, b } = hexToRgb(hex);
  let nr: number, ng: number, nb: number;

  switch (type) {
    case 'protanopia':
      nr = 0.567 * r + 0.433 * g + 0.0 * b;
      ng = 0.558 * r + 0.442 * g + 0.0 * b;
      nb = 0.0 * r + 0.242 * g + 0.758 * b;
      break;
    case 'deuteranopia':
      nr = 0.625 * r + 0.375 * g + 0.0 * b;
      ng = 0.7 * r + 0.3 * g + 0.0 * b;
      nb = 0.0 * r + 0.3 * g + 0.7 * b;
      break;
    case 'tritanopia':
      nr = 0.95 * r + 0.05 * g + 0.0 * b;
      ng = 0.0 * r + 0.433 * g + 0.567 * b;
      nb = 0.0 * r + 0.475 * g + 0.525 * b;
      break;
    case 'achromatopsia': {
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      nr = ng = nb = gray;
      break;
    }
  }

  return rgbToHex(nr!, ng!, nb!);
}

export const COLOR_BLIND_TYPES: { type: ColorBlindType; label: string; prevalence: string }[] = [
  { type: 'protanopia', label: 'Protanopia', prevalence: '~1.3% of males' },
  { type: 'deuteranopia', label: 'Deuteranopia', prevalence: '~1.2% of males' },
  { type: 'tritanopia', label: 'Tritanopia', prevalence: '~0.01%' },
  { type: 'achromatopsia', label: 'Achromatopsia', prevalence: '~0.003%' },
];

// ─── Export Formats ────────────────────────────────────────

export function exportCSS(colors: string[], name: string = 'palette'): string {
  return `:root {\n${colors.map((c, i) => `  --${name}-${(i + 1) * 100}: ${c};`).join('\n')}\n}`;
}

export function exportTailwind(colors: string[], name: string = 'brand'): string {
  const entries = colors.map((c, i) => `        ${(i + 1) * 100}: '${c}',`).join('\n');
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${name}': {\n${entries}\n        },\n      },\n    },\n  },\n};`;
}

export function exportSCSS(colors: string[], name: string = 'palette'): string {
  return colors.map((c, i) => `$${name}-${(i + 1) * 100}: ${c};`).join('\n');
}

export function exportJSON(colors: string[]): string {
  return JSON.stringify({ palette: colors, generated: new Date().toISOString() }, null, 2);
}

// ─── Color Names ───────────────────────────────────────────

const NAMED_COLORS: [string, string][] = [
  ['#FF0000', 'Red'], ['#FF4500', 'Orange Red'], ['#FF6347', 'Tomato'],
  ['#FF8C00', 'Dark Orange'], ['#FFA500', 'Orange'], ['#FFD700', 'Gold'],
  ['#FFFF00', 'Yellow'], ['#ADFF2F', 'Green Yellow'], ['#00FF00', 'Lime'],
  ['#32CD32', 'Lime Green'], ['#008000', 'Green'], ['#006400', 'Dark Green'],
  ['#00CED1', 'Turquoise'], ['#14B8A6', 'Teal'], ['#008B8B', 'Dark Cyan'],
  ['#0000FF', 'Blue'], ['#0000CD', 'Medium Blue'], ['#00008B', 'Dark Blue'],
  ['#4B0082', 'Indigo'], ['#800080', 'Purple'], ['#FF00FF', 'Magenta'],
  ['#FF1493', 'Deep Pink'], ['#FF69B4', 'Hot Pink'], ['#FFC0CB', 'Pink'],
  ['#A52A2A', 'Brown'], ['#8B4513', 'Saddle Brown'], ['#D2691E', 'Chocolate'],
  ['#FFFFFF', 'White'], ['#C0C0C0', 'Silver'], ['#808080', 'Gray'],
  ['#404040', 'Charcoal'], ['#000000', 'Black'], ['#F0F8FF', 'Alice Blue'],
  ['#87CEEB', 'Sky Blue'], ['#4169E1', 'Royal Blue'], ['#6495ED', 'Cornflower'],
  ['#B0C4DE', 'Steel Blue'], ['#2E8B57', 'Sea Green'], ['#90EE90', 'Light Green'],
  ['#DC143C', 'Crimson'], ['#B22222', 'Firebrick'], ['#CD5C5C', 'Indian Red'],
  ['#E6E6FA', 'Lavender'], ['#DDA0DD', 'Plum'], ['#DA70D6', 'Orchid'],
  ['#F5DEB3', 'Wheat'], ['#FAF0E6', 'Linen'], ['#FFFFF0', 'Ivory'],
];

function colorDistance(hex1: string, hex2: string): number {
  const a = hexToRgb(hex1), b = hexToRgb(hex2);
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export function nearestColorName(hex: string): string {
  let closest = 'Unknown';
  let minDist = Infinity;
  for (const [ref, name] of NAMED_COLORS) {
    const d = colorDistance(hex, ref);
    if (d < minDist) { minDist = d; closest = name; }
  }
  return closest;
}

// ─── Harmony Labels ────────────────────────────────────────

export const HARMONY_OPTIONS: { value: HarmonyType; label: string; description: string }[] = [
  { value: 'complementary', label: 'Complementary', description: 'Opposite colors on the wheel' },
  { value: 'analogous', label: 'Analogous', description: 'Adjacent colors for smooth transitions' },
  { value: 'triadic', label: 'Triadic', description: 'Three evenly spaced colors' },
  { value: 'split-complementary', label: 'Split Complementary', description: 'A color and two neighbors of its complement' },
  { value: 'tetradic', label: 'Tetradic', description: 'Two complementary pairs' },
  { value: 'monochromatic', label: 'Monochromatic', description: 'One hue, varying lightness' },
  { value: 'random', label: 'Random', description: 'Completely random colors' },
];
