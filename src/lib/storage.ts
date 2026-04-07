export interface SavedPalette {
  id: string;
  name: string;
  colors: string[];
  harmony: string;
  createdAt: number;
}

const KEY = 'colorcraft_palettes';

export function getSaved(): SavedPalette[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function savePalette(p: SavedPalette): void {
  const all = getSaved();
  all.unshift(p);
  if (all.length > 50) all.pop();
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function removePalette(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getSaved().filter(p => p.id !== id)));
}
