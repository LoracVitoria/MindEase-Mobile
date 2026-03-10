import { useSettingsStore } from '@/shared/stores/settings-store';
import { clamp } from '@/shared/utils/clamp';
import { useMemo } from 'react';
import { TextStyle, ViewStyle } from 'react-native';

export function useCognitiveSpacing() {
  const { spacingIntensity } = useSettingsStore();
  return useMemo(() => {
    const scale = clamp(spacingIntensity, 0, 3);
    const gap = 8 + scale * 4;
    const pad = 12 + scale * 4;
    // Botões tendem a ficar melhores com um gap mais compacto
    const buttonGap = Math.max(6, gap - 4);
    // Uso interno (ex.: stepper) ainda mais compacto
    const compactGap = Math.max(4, gap - 6);
    return { gap, pad, buttonGap, compactGap };
  }, [spacingIntensity]);
}

export function useCognitiveTextStyle({ weight }: { weight?: TextStyle['fontWeight'] } = {}) {
  const { fontScale } = useSettingsStore();
  return useMemo<TextStyle>(() => {
    const scale = clamp(fontScale, 0.9, 1.4);
    return {
      fontSize: 16 * scale,
      lineHeight: 22 * scale,
      fontWeight: weight,
    };
  }, [fontScale, weight]);
}

export function useCognitiveScreenTitleStyle() {
  const { fontScale } = useSettingsStore();
  return useMemo<TextStyle>(() => {
    const scale = clamp(fontScale, 0.9, 1.4);
    return {
      fontSize: 28 * scale,
      lineHeight: 34 * scale,
      fontWeight: '800',
    };
  }, [fontScale]);
}

export function useCognitiveBorders() {
  type SettingsStoreState = ReturnType<typeof useSettingsStore.getState>;
  const contrastIntensity = useSettingsStore((s: SettingsStoreState) => s.contrastIntensity);

  return useMemo(() => {
    const intensity = clamp(contrastIntensity, 0, 3);

    // Base de componentes (cards, inputs): 1..3
    const borderWidth = intensity <= 1 ? 1 : intensity;
    return { intensity, borderWidth };
  }, [contrastIntensity]);
}

export function useCognitiveContainerStyle(): ViewStyle {
  const { pad } = useCognitiveSpacing();

  return useMemo(() => {
    return {
      paddingVertical: pad,
      // Um pouco menos de borda lateral para caber melhor em telas menores
      paddingHorizontal: Math.max(10, pad - 2),
    };
  }, [pad]);
}
