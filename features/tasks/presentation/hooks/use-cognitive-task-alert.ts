import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { useSettingsStore } from '@/shared/stores/settings-store';
import { useTasksStore } from '@/shared/stores/tasks-store';

export function useCognitiveTaskAlert() {
  const { cognitiveAlertsEnabled, cognitiveAlertMinutes } = useSettingsStore();
  const { tasks } = useTasksStore();
  const lastAlertAtRef = useRef<number>(0);

  useEffect(() => {
    if (!cognitiveAlertsEnabled) return;

    const interval = setInterval(() => {
      const doing = tasks.find((t) => t.stage === 'doing' && t.startedAt);
      if (!doing?.startedAt) return;

      const elapsedMs = Date.now() - doing.startedAt;
      const limitMs = cognitiveAlertMinutes * 60 * 1000;

      if (elapsedMs < limitMs) return;

      // evita spam: no máximo 1 alerta a cada 10 min
      if (Date.now() - lastAlertAtRef.current < 10 * 60 * 1000) return;
      lastAlertAtRef.current = Date.now();

      Alert.alert(
        'Alerta cognitivo',
        'Você está muito tempo nesta tarefa. Quer pausar, dividir em etapas menores ou mudar o modo de foco?'
      );
    }, 30_000);

    return () => clearInterval(interval);
  }, [cognitiveAlertsEnabled, cognitiveAlertMinutes, tasks]);
}
