import { useMemo } from 'react';
import Svg, { Circle, Path, Text as SvgText, TSpan } from 'react-native-svg';

import { useThemeColor } from '@/shared/hooks/use-theme-color';

export function MindEaseLogo({
  size = 120,
  transparentBackground = false,
}: {
  size?: number;
  transparentBackground?: boolean;
}) {
  const background = useThemeColor({}, 'background');
  const border = useThemeColor({}, 'border');
  const foreground = useThemeColor({}, 'foreground');
  const primary = useThemeColor({}, 'primary');

  const circleFill = transparentBackground ? 'transparent' : background;

  const stroke1 = useMemo(() => ({ color: primary, opacity: 0.25 }), [primary]);
  const stroke2 = useMemo(() => ({ color: primary, opacity: 0.55 }), [primary]);

  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Circle cx={80} cy={80} r={72} fill={circleFill} stroke={border} strokeWidth={2} />

      <Path
        d="M45 55 Q65 48 80 55 T115 55"
        stroke={stroke1.color}
        strokeOpacity={stroke1.opacity}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M45 65 Q65 58 80 65 T115 65"
        stroke={stroke2.color}
        strokeOpacity={stroke2.opacity}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M45 75 Q65 68 80 75 T115 75"
        stroke={primary}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />

      <SvgText
        x={80}
        y={105}
        textAnchor="middle"
        fontSize={20}
        fontWeight={600}
      >
        <TSpan fill={foreground}>Mind</TSpan>
        <TSpan fill={primary}>Ease</TSpan>
      </SvgText>
    </Svg>
  );
}
