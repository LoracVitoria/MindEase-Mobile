export type ComplexityLevel = 'simple' | 'standard' | 'advanced';
export type ViewMode = 'summary' | 'detailed';
export type NavigationProfile = 'guided' | 'standard';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface UserPreferences {
  themePreference: ThemePreference;

  complexityLevel: ComplexityLevel;
  focusMode: boolean;
  viewMode: ViewMode;

  // 0..3 (quanto maior, mais separação visual)
  contrastIntensity: number;
  spacingIntensity: number; // 0..3
  fontScale: number; // 0.9..1.4

  cognitiveAlertsEnabled: boolean;
  cognitiveAlertMinutes: number;

  // Avisos suaves em transições (ex.: iniciar/encerrar uma tarefa; troca de fase do Pomodoro)
  transitionCuesEnabled: boolean;

  animationsEnabled: boolean;
  hapticsEnabled: boolean;

  navigationProfile: NavigationProfile;
}

export const defaultUserPreferences: UserPreferences = {
  themePreference: 'system',

  complexityLevel: 'standard',
  focusMode: false,
  viewMode: 'summary',

  contrastIntensity: 1,
  spacingIntensity: 1,
  fontScale: 1,

  cognitiveAlertsEnabled: true,
  cognitiveAlertMinutes: 25,

  transitionCuesEnabled: true,

  animationsEnabled: true,
  hapticsEnabled: true,

  navigationProfile: 'guided',
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const n = clampNumber(value, min, max, fallback);
  return Math.round(n);
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function asComplexityLevel(value: unknown, fallback: ComplexityLevel): ComplexityLevel {
  return value === 'simple' || value === 'standard' || value === 'advanced' ? value : fallback;
}

function asViewMode(value: unknown, fallback: ViewMode): ViewMode {
  return value === 'summary' || value === 'detailed' ? value : fallback;
}

function asNavigationProfile(value: unknown, fallback: NavigationProfile): NavigationProfile {
  return value === 'guided' || value === 'standard' ? value : fallback;
}

function asThemePreference(value: unknown, fallback: ThemePreference): ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark' ? value : fallback;
}

/**
 * Normaliza preferências vindas do storage, aplicando defaults, clamping e migração
 * Também faz migração do antigo `highContrast: boolean` para `contrastIntensity`
 */
export function normalizeUserPreferences(input: unknown): UserPreferences {
  const raw = isObject(input) ? input : {};

  // migração v1 -> v2
  const legacyHighContrast = (raw as any).highContrast;
  const contrastFromLegacy = legacyHighContrast === true ? 2 : 0;

  return {
    ...defaultUserPreferences,
    themePreference: asThemePreference(
      (raw as any).themePreference,
      defaultUserPreferences.themePreference
    ),

    complexityLevel: asComplexityLevel(raw.complexityLevel, defaultUserPreferences.complexityLevel),
    focusMode: asBoolean(raw.focusMode, defaultUserPreferences.focusMode),
    viewMode: asViewMode(raw.viewMode, defaultUserPreferences.viewMode),

    contrastIntensity: clampInt(
      (raw as any).contrastIntensity ?? contrastFromLegacy,
      0,
      3,
      defaultUserPreferences.contrastIntensity
    ),
    spacingIntensity: clampInt(raw.spacingIntensity, 0, 3, defaultUserPreferences.spacingIntensity),
    fontScale: clampNumber(raw.fontScale, 0.9, 1.4, defaultUserPreferences.fontScale),

    cognitiveAlertsEnabled: asBoolean(raw.cognitiveAlertsEnabled, defaultUserPreferences.cognitiveAlertsEnabled),
    cognitiveAlertMinutes: clampInt(
      raw.cognitiveAlertMinutes,
      5,
      120,
      defaultUserPreferences.cognitiveAlertMinutes
    ),

    transitionCuesEnabled: asBoolean(
      (raw as any).transitionCuesEnabled,
      defaultUserPreferences.transitionCuesEnabled
    ),

    animationsEnabled: asBoolean(raw.animationsEnabled, defaultUserPreferences.animationsEnabled),
    hapticsEnabled: asBoolean(raw.hapticsEnabled, defaultUserPreferences.hapticsEnabled),
    navigationProfile: asNavigationProfile(raw.navigationProfile, defaultUserPreferences.navigationProfile),
  };
}
