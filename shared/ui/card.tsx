import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useCognitiveBorders } from '@/shared/ui/cognitive-styles';
import React from 'react';
import { View, type ViewStyle } from 'react-native';

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const { borderWidth } = useCognitiveBorders();

  return (
    <View
      style={[
        {
          backgroundColor: card,
          borderColor: border,
          borderWidth,
          borderRadius: 14,
          padding: 14,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
