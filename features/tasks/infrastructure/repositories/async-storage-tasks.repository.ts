import { Task } from '@/features/tasks/domain/entities/task.entity';
import { TasksRepository } from '@/features/tasks/domain/repositories/tasks.repository.interface';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'mindease:tasks:v1';

export class AsyncStorageTasksRepository implements TasksRepository {
  async getAll(): Promise<Task[]> {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  }

  async setAll(tasks: Task[]): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(tasks));
  }
}
