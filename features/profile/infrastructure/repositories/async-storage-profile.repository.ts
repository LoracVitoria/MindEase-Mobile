import { UserPreferences } from '@/features/profile/domain/entities/user-preferences.entity';
import { UserProfile } from '@/features/profile/domain/entities/user-profile.entity';
import { ProfileRepository } from '@/features/profile/domain/repositories/profile.repository.interface';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  preferences: 'mindease:preferences:v1',
  profile: 'mindease:profile:v1',
} as const;

export class AsyncStorageProfileRepository implements ProfileRepository {
  async getPreferences(): Promise<UserPreferences | null> {
    const raw = await AsyncStorage.getItem(KEYS.preferences);
    if (!raw) return null;
    return JSON.parse(raw) as UserPreferences;
  }

  async setPreferences(preferences: UserPreferences): Promise<void> {
    await AsyncStorage.setItem(KEYS.preferences, JSON.stringify(preferences));
  }

  async getProfile(): Promise<UserProfile | null> {
    const raw = await AsyncStorage.getItem(KEYS.profile);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  }

  async setProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
  }
}
