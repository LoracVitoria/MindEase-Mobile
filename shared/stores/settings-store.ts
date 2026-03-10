import { create } from 'zustand';

import { getUserPreferencesUsecase } from '@/features/profile/application/usecases/get-user-preferences.usecase';
import { updateUserPreferencesUsecase } from '@/features/profile/application/usecases/update-user-preferences.usecase';
import {
    defaultUserPreferences,
    type ComplexityLevel,
    type NavigationProfile,
  normalizeUserPreferences,
    type ThemePreference,
    type UserPreferences,
    type ViewMode,
} from '@/features/profile/domain/entities/user-preferences.entity';
import { AsyncStorageProfileRepository } from '@/features/profile/infrastructure/repositories/async-storage-profile.repository';

const repository = new AsyncStorageProfileRepository();
const getPreferences = getUserPreferencesUsecase(repository);
const updatePreferences = updateUserPreferencesUsecase(repository);

interface SettingsState extends UserPreferences {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  patch: (partial: Partial<UserPreferences>) => Promise<void>;

  setThemePreference: (preference: ThemePreference) => Promise<void>;
  setComplexity: (level: ComplexityLevel) => Promise<void>;
  setFocusMode: (enabled: boolean) => Promise<void>;
  setViewMode: (mode: ViewMode) => Promise<void>;
  setContrastIntensity: (value: number) => Promise<void>;
  // compat: atalho para liga/desliga (mapeia para intensidade 0/2)
  setHighContrast: (enabled: boolean) => Promise<void>;
  setSpacingIntensity: (value: number) => Promise<void>;
  setFontScale: (value: number) => Promise<void>;
  setCognitiveAlerts: (enabled: boolean) => Promise<void>;
  setCognitiveAlertMinutes: (minutes: number) => Promise<void>;
  setTransitionCues: (enabled: boolean) => Promise<void>;
  setAnimationsEnabled: (enabled: boolean) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  setNavigationProfile: (profile: NavigationProfile) => Promise<void>;
}

function pickPreferences(state: SettingsState): UserPreferences {
  return {
    themePreference: state.themePreference,

    complexityLevel: state.complexityLevel,
    focusMode: state.focusMode,
    viewMode: state.viewMode,

    contrastIntensity: state.contrastIntensity,
    spacingIntensity: state.spacingIntensity,
    fontScale: state.fontScale,

    cognitiveAlertsEnabled: state.cognitiveAlertsEnabled,
    cognitiveAlertMinutes: state.cognitiveAlertMinutes,

    transitionCuesEnabled: state.transitionCuesEnabled,

    animationsEnabled: state.animationsEnabled,
    hapticsEnabled: state.hapticsEnabled,

    navigationProfile: state.navigationProfile,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultUserPreferences,
  hydrated: false,

  hydrate: async () => {
    try {
      const stored = await getPreferences.execute();
      set({ ...normalizeUserPreferences(stored), hydrated: true });
    } catch {
      set({ ...defaultUserPreferences, hydrated: true });
    }
  },

  patch: async (partial) => {
    const current = pickPreferences(get());
    const merged = normalizeUserPreferences({ ...current, ...partial });
    set(merged);
    try {
      await updatePreferences.execute(merged);
    } catch {
      // mantém no estado mesmo se persistência falhar
    }
  },

  setThemePreference: async (themePreference) => get().patch({ themePreference }),
  setComplexity: async (complexityLevel) => get().patch({ complexityLevel }),
  setFocusMode: async (focusMode) => get().patch({ focusMode }),
  setViewMode: async (viewMode) => get().patch({ viewMode }),
  setContrastIntensity: async (contrastIntensity) => get().patch({ contrastIntensity }),
  setHighContrast: async (enabled) => get().patch({ contrastIntensity: enabled ? 2 : 0 }),
  setSpacingIntensity: async (spacingIntensity) => get().patch({ spacingIntensity }),
  setFontScale: async (fontScale) => get().patch({ fontScale }),
  setCognitiveAlerts: async (cognitiveAlertsEnabled) => get().patch({ cognitiveAlertsEnabled }),
  setCognitiveAlertMinutes: async (cognitiveAlertMinutes) =>
    get().patch({ cognitiveAlertMinutes }),
  setTransitionCues: async (transitionCuesEnabled) => get().patch({ transitionCuesEnabled }),
  setAnimationsEnabled: async (animationsEnabled) => get().patch({ animationsEnabled }),
  setHapticsEnabled: async (hapticsEnabled) => get().patch({ hapticsEnabled }),
  setNavigationProfile: async (navigationProfile) => get().patch({ navigationProfile }),
}));
