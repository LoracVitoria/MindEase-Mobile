import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useSettingsStore } from '@/shared/stores/settings-store';

export type PomodoroPhase = 'focus' | 'break';

export function usePomodoro() {
  const { hapticsEnabled, focusMode, complexityLevel, transitionCuesEnabled } = useSettingsStore();

  const config = useMemo(() => {
    // Pomodoro adaptado: no modo foco e complexidade simples, sessões menores
    const focusMinutes = focusMode ? (complexityLevel === 'simple' ? 15 : 25) : 25;
    const breakMinutes = focusMode ? 5 : 5;
    return { focusMinutes, breakMinutes };
  }, [complexityLevel, focusMode]);

  const [phase, setPhase] = useState<PomodoroPhase>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(config.focusMinutes * 60);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Mantém o contador coerente ao trocar de fase ou ao alterar a configuração.
    // Não sobrescreve o tempo enquanto estiver rodando.
    if (isRunning) return;
    setRemainingSeconds(phase === 'focus' ? config.focusMinutes * 60 : config.breakMinutes * 60);
  }, [config.breakMinutes, config.focusMinutes, isRunning, phase]);

  useEffect(() => {
    if (!isRunning) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }

    tickRef.current = setInterval(() => {
      setRemainingSeconds((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (remainingSeconds > 0) return;

    setIsRunning(false);

    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    const next: PomodoroPhase = phase === 'focus' ? 'break' : 'focus';
    setPhase(next);

    if (transitionCuesEnabled) {
      Alert.alert(
        next === 'break' ? 'Hora da pausa' : 'Hora de focar',
        next === 'break'
          ? 'Transição suave: respire, alongue e volte no seu ritmo'
          : 'Vamos começar com um passo pequeno e claro'
      );
    }
  }, [hapticsEnabled, isRunning, phase, remainingSeconds, transitionCuesEnabled]);

  return {
    phase,
    isRunning,
    remainingSeconds,
    focusMinutes: config.focusMinutes,
    breakMinutes: config.breakMinutes,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset: () => {
      setIsRunning(false);
      setRemainingSeconds(phase === 'focus' ? config.focusMinutes * 60 : config.breakMinutes * 60);
    },
    switchPhase: () => {
      setIsRunning(false);
      setPhase((p) => (p === 'focus' ? 'break' : 'focus'));
    },
  };
}
