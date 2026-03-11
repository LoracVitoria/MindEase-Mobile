import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useSettingsStore } from '@/shared/stores/settings-store';
import { useCognitiveTextStyle } from '@/shared/ui/cognitive-styles';
import React from 'react';
import { Pressable, Text, type TextStyle, ViewStyle } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
  textStyle,
  textNumberOfLines,
  textEllipsizeMode,
  textAdjustsFontSizeToFit,
  textMinimumFontScale,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  textNumberOfLines?: number;
  textEllipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  textAdjustsFontSizeToFit?: boolean;
  textMinimumFontScale?: number;
}) {
  const primary = useThemeColor({}, 'primary');
  const primaryFg = useThemeColor({}, 'primaryForeground');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');
  const foreground = useThemeColor({}, 'foreground');
  const baseTextStyle = useCognitiveTextStyle({ weight: '600' });
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);
  const contrastIntensity = useSettingsStore((s) => s.contrastIntensity);

  const base: ViewStyle = {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: contrastIntensity <= 1 ? 1 : Math.min(3, contrastIntensity),
    borderColor: border,
  };

  const backgroundColor =
    variant === 'primary' ? primary : variant === 'secondary' ? card : 'transparent';

  const color = variant === 'primary' ? primaryFg : foreground;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        base,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : !animationsEnabled ? 1 : pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <Text
        numberOfLines={textNumberOfLines}
        ellipsizeMode={textEllipsizeMode}
        adjustsFontSizeToFit={textAdjustsFontSizeToFit}
        minimumFontScale={textMinimumFontScale}
        style={[baseTextStyle, { color }, textStyle]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
