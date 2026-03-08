import { UserProfile } from '@/features/profile/domain/entities/user-profile.entity';
import { ProfileRepository } from '@/features/profile/domain/repositories/profile.repository.interface';

export function updateUserProfileUsecase(repository: ProfileRepository) {
  return {
    execute: async (profile: UserProfile) => repository.setProfile(profile),
  };
}
