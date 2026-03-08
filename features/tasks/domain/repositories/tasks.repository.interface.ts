import { Task } from '@/features/tasks/domain/entities/task.entity';

export interface TasksRepository {
  getAll(): Promise<Task[]>;
  setAll(tasks: Task[]): Promise<void>;
}
