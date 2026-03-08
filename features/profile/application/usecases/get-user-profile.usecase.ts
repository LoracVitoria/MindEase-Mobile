import { ProfileRepository } from '@/features/profile/domain/repositories/profile.repository.interface';

export function getUserProfileUsecase(repository: ProfileRepository) {
  return {
    execute: async () => repository.getProfile(),
  };
}
