import { useColorScheme as useNativeColorScheme } from 'react-native';

import { useSettingsStore } from '@/shared/stores/settings-store';

export function useColorScheme(): 'light' | 'dark' {
	const preference = useSettingsStore((s) => s.themePreference);
	const systemScheme = useNativeColorScheme();

	if (preference === 'light' || preference === 'dark') return preference;
	return systemScheme === 'dark' ? 'dark' : 'light';
}
