'use client';

import { useState } from 'react';
import { exportCSS, exportTailwind, exportSCSS, exportJSON } from '@/lib/colors';
import { Copy, Check, Code, Download } from 'lucide-react';

interface ExportPanelProps {
  colors: string[];
}

type ExportFormat = 'css' | 'tailwind' | 'scss' | 'json';

const FORMATS: { value: ExportFormat; label: string; icon: string }[] = [
  { value: 'css', label: 'CSS Variables', icon: '🎨' },
  { value: 'tailwind', label: 'Tailwind Config', icon: '🌊' },
  { value: 'scss', label: 'SCSS Variables', icon: '💎' },
  { value: 'json', label: 'JSON', icon: '📦' },
];

export default function ExportPanel({ colors }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>('css');
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('brand');

  const getOutput = () => {
    switch (format) {
      case 'css': return exportCSS(colors, name);
      case 'tailwind': return exportTailwind(colors, name);
      case 'scss': return exportSCSS(colors, name);
      case 'json': return exportJSON(colors);
    }
  };

  const output = getOutput();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadFile = () => {
    const ext = format === 'tailwind' ? 'js' : format === 'scss' ? 'scss' : format === 'json' ? 'json' : 'css';
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
        <Code size={16} className="text-teal-500" />
        Export
      </h3>

      {/* Format tabs */}
      <div className="flex gap-1 bg-[#0a0a0b] rounded-lg p-1">
        {FORMATS.map(f => (
          <button
            key={f.value}
            onClick={() => setFormat(f.value)}
            className={`flex-1 py-2 px-2 rounded-md text-[11px] font-medium transition-colors ${
              format === f.value ? 'bg-teal-500/20 text-teal-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Variable name */}
      {format !== 'json' && (
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Variable prefix</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
            className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-teal-500/50"
            placeholder="brand"
          />
        </div>
      )}

      {/* Code output */}
      <div className="relative">
        <pre className="bg-[#0a0a0b] border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-48">
          {output}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={copyToClipboard}
          className="flex-1 flex items-center justify-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
        <button
          onClick={downloadFile}
          className="flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Download size={14} />
          Download
        </button>
      </div>
    </div>
  );
}
