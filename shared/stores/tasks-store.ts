import { create } from 'zustand';

import { getTasksUsecase } from '@/features/tasks/application/usecases/get-tasks.usecase';
import { saveTasksUsecase } from '@/features/tasks/application/usecases/save-tasks.usecase';
import {
    buildChecklistTemplate,
    type ChecklistTemplate,
    type Task,
    type TaskStage,
} from '@/features/tasks/domain/entities/task.entity';
import { AsyncStorageTasksRepository } from '@/features/tasks/infrastructure/repositories/async-storage-tasks.repository';

const repository = new AsyncStorageTasksRepository();
const getTasks = getTasksUsecase(repository);
const saveTasks = saveTasksUsecase(repository);

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface TasksState {
  hydrated: boolean;
  tasks: Task[];

  hydrate: () => Promise<void>;
  createTask: (title: string, template: ChecklistTemplate) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, stage: TaskStage) => Promise<void>;
  toggleChecklistItem: (taskId: string, itemId: string) => Promise<void>;
  clearDone: () => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  hydrated: false,
  tasks: [],

  hydrate: async () => {
    const tasks = await getTasks.execute();
    set({ tasks, hydrated: true });
  },

  createTask: async (title, template) => {
    const now = Date.now();
    const task: Task = {
      id: uid(),
      title: title.trim(),
      stage: 'todo',
      checklist: buildChecklistTemplate(template),
      createdAt: now,
      updatedAt: now,
    };
    const tasks = [task, ...get().tasks];
    set({ tasks });
    await saveTasks.execute(tasks);
  },

  deleteTask: async (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    await saveTasks.execute(tasks);
  },

  moveTask: async (id, stage) => {
    const now = Date.now();
    const tasks: Task[] = get().tasks.map((t): Task => {
      // se o usuário escolher outra tarefa para "Fazendo", movemos a anterior para "A fazer"
      if (stage === 'doing' && t.stage === 'doing' && t.id !== id) {
        return { ...t, stage: 'todo', updatedAt: now, startedAt: undefined };
      }

      if (t.id !== id) return t;

      const startedAt = stage === 'doing' ? t.startedAt ?? now : undefined;
      return { ...t, stage, updatedAt: now, startedAt };
    });
    set({ tasks });
    await saveTasks.execute(tasks);
  },

  toggleChecklistItem: async (taskId, itemId) => {
    const now = Date.now();
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        updatedAt: now,
        checklist: t.checklist.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
      };
    });
    set({ tasks });
    await saveTasks.execute(tasks);
  },

  clearDone: async () => {
    const tasks = get().tasks.filter((t) => t.stage !== 'done');
    set({ tasks });
    await saveTasks.execute(tasks);
  },
}));
