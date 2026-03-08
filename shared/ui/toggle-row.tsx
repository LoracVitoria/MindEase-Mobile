import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useCognitiveSpacing, useCognitiveTextStyle } from '@/shared/ui/cognitive-styles';
import React from 'react';
import { Switch, Text, View } from 'react-native';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

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

export function ToggleRow({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  description?: string;
}) {
  const foreground = useThemeColor({}, 'foreground');
  const muted = useThemeColor({}, 'muted');
  const textStyle = useCognitiveTextStyle({ weight: '600' });
  const descStyle = useCognitiveTextStyle();
  const { gap } = useCognitiveSpacing();

  const primary = useThemeColor({}, 'primary');
  const secondary = useThemeColor({}, 'secondary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Estilo inspirado no Switch do shadcn: trilho cinza quando OFF e primário quando ON;
  // thumb sempre bem visível e sem azul padrão do Android
  const trackOff = isDark ? secondary : border;
  const thumb = isDark ? foreground : mixHex(background, border, 0.22);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[textStyle, { color: foreground }]}>{label}</Text>
        {description ? (
          <Text style={[descStyle, { color: muted, marginTop: 4 }]}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: trackOff, true: primary }}
        thumbColor={thumb}
        ios_backgroundColor={trackOff}
        accessibilityLabel={label}
      />
    </View>
  );
}
