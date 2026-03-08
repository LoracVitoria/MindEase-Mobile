import { UserPreferences } from '@/features/profile/domain/entities/user-preferences.entity';
import { UserProfile } from '@/features/profile/domain/entities/user-profile.entity';

export interface ProfileRepository {
  getPreferences(): Promise<UserPreferences | null>;
  setPreferences(preferences: UserPreferences): Promise<void>;
  getProfile(): Promise<UserProfile | null>;
  setProfile(profile: UserProfile): Promise<void>;
}
