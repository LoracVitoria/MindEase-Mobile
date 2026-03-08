export type TaskStage = 'todo' | 'doing' | 'done';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  stage: TaskStage;
  checklist: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
  startedAt?: number; // quando entrou em "doing" (para alertas cognitivos)
}

export type ChecklistTemplate = 'none' | 'study' | 'work' | 'custom';

export function buildChecklistTemplate(template: ChecklistTemplate): ChecklistItem[] {
  const now = Date.now();
  const mk = (label: string, index: number): ChecklistItem => ({
    id: `${now}-${index}-${Math.random().toString(16).slice(2)}`,
    label,
    done: false,
  });

  if (template === 'study') {
    return [mk('Separar material', 1), mk('Estudar 25 minutos', 2), mk('Revisar e resumir', 3)];
  }
  if (template === 'work') {
    return [mk('Definir próximo passo', 1), mk('Executar', 2), mk('Revisar e encerrar', 3)];
  }
  return [];
}
