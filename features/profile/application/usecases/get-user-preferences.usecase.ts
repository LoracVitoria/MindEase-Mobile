import { ProfileRepository } from '@/features/profile/domain/repositories/profile.repository.interface';

export function getUserPreferencesUsecase(repository: ProfileRepository) {
  return {
    execute: async () => repository.getPreferences(),
  };
}
