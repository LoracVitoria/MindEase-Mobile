export const Colors = {
  light: {
    background: '#FFFFFF',
    foreground: '#09090B',
    card: '#FFFFFF',
    secondary: '#F4F4F5',
    secondaryForeground: '#18181B',
    accent: '#F4F4F5',
    accentForeground: '#18181B',
    border: '#E4E4E7',
    primary: '#EC003F',
    primaryForeground: '#FFF1F2',
    muted: '#71717B',
    danger: '#E7000B',
    success: '#16A34A',
  },
  dark: {
    background: '#09090B',
    foreground: '#FAFAFA',
    card: '#18181B',
    secondary: '#27272A',
    secondaryForeground: '#FAFAFA',
    accent: '#27272A',
    accentForeground: '#FAFAFA',
    // 10% branco (equivalente ao `oklch(1 0 0 / 10%)`)
    border: '#FFFFFF1A',
    primary: '#FF2056',
    primaryForeground: '#FFF1F2',
    muted: '#9F9FA9',
    danger: '#FF6467',
    success: '#4ADE80',
  },
} as const;

export type ThemeName = keyof typeof Colors;
