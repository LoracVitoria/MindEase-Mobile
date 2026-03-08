import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { useSettingsStore } from '@/shared/stores/settings-store';

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function hexToRgb(hex: string) {
  const cleaned = hex.replace('#', '').trim();
  const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return { r, g, b };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const to = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function mixHex(a: string, b: string, t: number) {
  const tt = clamp01(t);
  const A = hexToRgb(a);
  const B = hexToRgb(b);
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

  const base = colorFromProps ?? Colors[theme][colorName];

  // Contraste por intensidade: aumenta separação de bordas (principal fonte de "escaneabilidade")
  if (colorName === 'border') {
    const intensity = Math.min(3, Math.max(0, contrastIntensity ?? 0));
    if (intensity <= 0) return base;
    const t = intensity / 3;
    const fg = Colors[theme].foreground;
    return mixHex(base, fg, 0.35 + 0.55 * t);
  }

  return base;
}
