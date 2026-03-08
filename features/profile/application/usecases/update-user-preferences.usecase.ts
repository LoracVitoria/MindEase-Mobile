import { UserPreferences } from '@/features/profile/domain/entities/user-preferences.entity';
import { ProfileRepository } from '@/features/profile/domain/repositories/profile.repository.interface';

export function updateUserPreferencesUsecase(repository: ProfileRepository) {
  return {
    execute: async (preferences: UserPreferences) => repository.setPreferences(preferences),
  };
}
