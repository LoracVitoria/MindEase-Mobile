import { Task } from '@/features/tasks/domain/entities/task.entity';
import { TasksRepository } from '@/features/tasks/domain/repositories/tasks.repository.interface';

export function saveTasksUsecase(repository: TasksRepository) {
  return {
    execute: async (tasks: Task[]) => repository.setAll(tasks),
  };
}
