import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { useSettingsStore } from '@/shared/stores/settings-store';

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

type RGB = { r: number; g: number; b: number };
type RGBA = RGB & { a: number };

function hexToRgba(hex: string): RGBA {
  const cleaned = hex.replace('#', '').trim();

  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return { r, g, b, a: 1 };
  }

  if (cleaned.length === 4) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    const a = parseInt(cleaned[3] + cleaned[3], 16) / 255;
    return { r, g, b, a };
  }

  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return { r, g, b, a: 1 };
  }

  if (cleaned.length === 8) {
    // #RRGGBBAA
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    const a = parseInt(cleaned.slice(6, 8), 16) / 255;
    return { r, g, b, a };
  }

  // fallback defensivo
  return { r: 0, g: 0, b: 0, a: 1 };
}

function compositeOver(background: RGB, foreground: RGBA): RGB {
  const a = clamp01(foreground.a);
  return {
    r: background.r + (foreground.r - background.r) * a,
    g: background.g + (foreground.g - background.g) * a,
    b: background.b + (foreground.b - background.b) * a,
  };
}

function toVisibleRgb(hex: string, backgroundHex: string): RGB {
  const rgba = hexToRgba(hex);
  if (rgba.a >= 1) return { r: rgba.r, g: rgba.g, b: rgba.b };
  const bg = hexToRgba(backgroundHex);
  return compositeOver({ r: bg.r, g: bg.g, b: bg.b }, rgba);
}

function rgbToHex({ r, g, b }: RGB) {
  const to = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function mixHex(a: string, b: string, t: number, backgroundHex: string) {
  const tt = clamp01(t);
  const A = toVisibleRgb(a, backgroundHex);
  const B = toVisibleRgb(b, backgroundHex);
  return rgbToHex({
    r: A.r + (B.r - A.r) * tt,
    g: A.g + (B.g - A.g) * tt,
    b: A.b + (B.b - A.b) * tt,
  });
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const contrastIntensity = useSettingsStore((s) => s.contrastIntensity);

  const colorFromProps = props[theme];

  const background = Colors[theme].background;
  const baseRaw = colorFromProps ?? Colors[theme][colorName];
  // Normaliza (especialmente útil para hex com alpha tipo #RRGGBBAA)
  const base = rgbToHex(toVisibleRgb(baseRaw, background));

  // Contraste por intensidade: aumenta separação de bordas (principal fonte de "escaneabilidade")
  if (colorName === 'border') {
    const intensity = Math.min(3, Math.max(0, contrastIntensity ?? 0));
    if (intensity <= 0) return base;
    const t = intensity / 3;
    const fg = Colors[theme].foreground;
    return mixHex(base, fg, 0.35 + 0.55 * t, background);
  }

  return base;
}
