import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useSettingsStore } from '@/shared/stores/settings-store';

export default function TabsLayout() {
  const focusMode = useSettingsStore((s) => s.focusMode);
  const contrastIntensity = useSettingsStore((s) => s.contrastIntensity);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const hydrate = useSettingsStore((s) => s.hydrate);

  const router = useRouter();
  const segments = useSegments();

  const background = useThemeColor({}, 'background');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const muted = useThemeColor({}, 'muted');

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    // Em modo foco, o app deve ficar somente na tela de tarefas.
    // Segments típicos: ['(tabs)', 'tasks'] | ['(tabs)', 'index'] | ['(tabs)', 'profile']
    if (!focusMode) return;
    // Às vezes o path sem grupo ('/tasks') pode não resolver como esperado.
    // Usamos a rota explícita do grupo para garantir o redirecionamento.
    if (segments?.[0] === '(tabs)' && segments?.[1] === 'tasks') return;
    router.replace('/(tabs)/tasks');
  }, [focusMode, router, segments]);

  const iconSize = 24 + Math.min(4, Math.max(0, contrastIntensity));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: muted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: focusMode
          ? { display: 'none' }
          : {
              backgroundColor: background,
              borderTopColor: border,
              borderTopWidth: 1,
              paddingTop: 6,
              paddingBottom: 6,
              minHeight: 64,
            },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Painel',
          tabBarAccessibilityLabel: 'Painel cognitivo',
          href: focusMode ? null : undefined,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'apps' : 'apps-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tarefas',
          tabBarAccessibilityLabel: 'Organizador de tarefas',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'checkbox' : 'checkbox-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Configurações',
          tabBarAccessibilityLabel: 'Configurações e preferências',
          href: focusMode ? null : undefined,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
