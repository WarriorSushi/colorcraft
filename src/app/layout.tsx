import type { Metadata } from 'next';
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['400', '500', '600', '700'] });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'ColorCraft — Palette Generator & WCAG Contrast Checker',
  description: 'Generate beautiful color palettes with harmony rules, check WCAG contrast ratios, simulate color blindness, and export as CSS/Tailwind/SCSS. 100% client-side.',
  keywords: 'color palette generator, WCAG contrast checker, color blindness simulator, CSS colors, tailwind colors',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${space.variable} ${dmSans.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
