import { Text, View } from 'react-native';

import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Button } from '@/shared/ui/button';
import { useCognitiveSpacing, useCognitiveTextStyle } from '@/shared/ui/cognitive-styles';

export function StepperRow({
  label,
  valueLabel,
  onDec,
  onInc,
  helper,
}: {
  label: string;
  valueLabel: string;
  onDec: () => void;
  onInc: () => void;
  helper?: string;
}) {
  const foreground = useThemeColor({}, 'foreground');
  const muted = useThemeColor({}, 'muted');
  const { gap, compactGap } = useCognitiveSpacing();
  const labelStyle = useCognitiveTextStyle({ weight: '600' });
  const valueStyle = useCognitiveTextStyle({ weight: '700' });
  const helperStyle = useCognitiveTextStyle();

  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={[labelStyle, { color: foreground }]}>{label}</Text>
          {helper ? (
            <Text style={[helperStyle, { color: muted, marginTop: 4 }]}>{helper}</Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: compactGap }}>
          <Button
            title="-"
            variant="secondary"
            onPress={onDec}
            style={{ width: 44, height: 44, paddingVertical: 0, paddingHorizontal: 0, borderRadius: 10 }}
          />
          <Text
            style={[
              valueStyle,
              { color: foreground, minWidth: 64, textAlign: 'center' },
            ]}
          >
            {valueLabel}
          </Text>
          <Button
            title="+"
            variant="secondary"
            onPress={onInc}
            style={{ width: 44, height: 44, paddingVertical: 0, paddingHorizontal: 0, borderRadius: 10 }}
          />
        </View>
      </View>
    </View>
  );
}
