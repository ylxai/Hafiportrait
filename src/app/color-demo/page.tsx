/**
 * Color Palette Demo Page
 * Showcases the dynamic color palette system
 */

import { ColorPaletteProvider } from '@/components/ui/color-palette-provider';
import { ColorPaletteDemo } from '@/components/demo/color-palette-demo';
import '@/styles/color-palette.css';

export default function ColorDemoPage() {
  return (
    <ColorPaletteProvider>
      <ColorPaletteDemo />
    </ColorPaletteProvider>
  );
}

export const metadata = {
  title: 'Color Palette Demo - HafiPortrait',
  description: 'Experience dynamic color themes for HafiPortrait website',
};