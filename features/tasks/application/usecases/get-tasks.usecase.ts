import { TasksRepository } from '@/features/tasks/domain/repositories/tasks.repository.interface';

export function getTasksUsecase(repository: TasksRepository) {
  return {
    execute: async () => repository.getAll(),
  };
}
