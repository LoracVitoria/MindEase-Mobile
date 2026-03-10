import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useCognitiveContainerStyle, useCognitiveScreenTitleStyle, useCognitiveSpacing, useCognitiveTextStyle } from '@/shared/ui/cognitive-styles';
import SafeAreaWrapper from '@/shared/ui/safe-area-wrapper';
import { StepperRow } from '@/shared/ui/stepper-row';
import { ToggleRow } from '@/shared/ui/toggle-row';
import { MindEaseLogo } from '@/shared/ui/mindease-logo';

import { getUserProfileUsecase } from '@/features/profile/application/usecases/get-user-profile.usecase';
import { updateUserProfileUsecase } from '@/features/profile/application/usecases/update-user-profile.usecase';
import { defaultUserProfile, type UserProfile } from '@/features/profile/domain/entities/user-profile.entity';
import { AsyncStorageProfileRepository } from '@/features/profile/infrastructure/repositories/async-storage-profile.repository';
import { useSettingsStore } from '@/shared/stores/settings-store';

const repository = new AsyncStorageProfileRepository();
const getProfile = getUserProfileUsecase(repository);
const updateProfile = updateUserProfileUsecase(repository);

export function ProfileScreen() {
  const background = useThemeColor({}, 'background');
  const foreground = useThemeColor({}, 'foreground');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');

  const containerStyle = useCognitiveContainerStyle();
  const titleStyle = useCognitiveScreenTitleStyle();
  const textStyle = useCognitiveTextStyle();
  const sectionTitleStyle = useCognitiveTextStyle({ weight: '600' });
  const { gap } = useCognitiveSpacing();

  const settings = useSettingsStore();

  const tabBarHeight = useBottomTabBarHeight();

  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!settings.hydrated) await settings.hydrate();
        const stored = await getProfile.execute();
        if (mounted) setProfile(stored ?? defaultUserProfile);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [settings]);

  const inputStyle = useMemo(
    () => ({
      borderWidth: settings.contrastIntensity <= 1 ? 1 : Math.min(3, settings.contrastIntensity),
      borderColor: border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: foreground,
    }),

    [settings.contrastIntensity, border, foreground]
  );

  if (loading) {
    return (
      <SafeAreaWrapper backgroundColor={background} style={containerStyle}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <MindEaseLogo size={132} />
          <Text style={[textStyle, { color: muted }]}>Carregando perfil…</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={background} edges={['top', 'left', 'right']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[{ gap, paddingBottom: tabBarHeight + 24 }, containerStyle]}
      >
        <Text style={[titleStyle, { color: foreground }]}>Configurações</Text>

        <Card style={{ gap }}>
        <Text style={[textStyle, { color: muted }]}>Nome de exibição</Text>
        <TextInput
          value={profile.displayName}
          onChangeText={(t) => setProfile((p) => ({ ...p, displayName: t }))}
          style={[inputStyle, textStyle]}
          placeholder="Como você quer ser chamada(o)?"
          placeholderTextColor={muted}
        />

        <Text style={[textStyle, { color: muted }]}>Necessidades específicas</Text>
        <TextInput
          value={profile.needsNotes}
          onChangeText={(t) => setProfile((p) => ({ ...p, needsNotes: t }))}
          style={[inputStyle, textStyle, { minHeight: 80 }]}
          multiline
          placeholder="Ex.: Evitar muitos elementos na tela, lembretes suaves…"
          placeholderTextColor={muted}
        />

        <Text style={[textStyle, { color: muted }]}>Rotinas de estudo/trabalho</Text>
        <TextInput
          value={profile.routinesNotes}
          onChangeText={(t) => setProfile((p) => ({ ...p, routinesNotes: t }))}
          style={[inputStyle, textStyle, { minHeight: 80 }]}
          multiline
          placeholder="Ex.: Manhã: estudo; Tarde: trabalho; Noite: revisão"
          placeholderTextColor={muted}
        />

        <Button
          title="Salvar perfil"
          onPress={async () => {
            await updateProfile.execute(profile);
            Alert.alert('Pronto', 'Perfil salvo!');
          }}
        />
        </Card>

        <Card style={{ gap }}>
        <Text style={[textStyle, { color: muted }]}>Configurações persistentes</Text>

        <View style={{ gap: 10 }}>
          <Text style={[sectionTitleStyle, { color: foreground }]}>Tema</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <Button
              title="Sistema"
              variant={settings.themePreference === 'system' ? 'primary' : 'secondary'}
              onPress={() => void settings.setThemePreference('system')}
              style={{ minWidth: 110 }}
            />
            <Button
              title="Claro"
              variant={settings.themePreference === 'light' ? 'primary' : 'secondary'}
              onPress={() => void settings.setThemePreference('light')}
              style={{ minWidth: 110 }}
            />
            <Button
              title="Escuro"
              variant={settings.themePreference === 'dark' ? 'primary' : 'secondary'}
              onPress={() => void settings.setThemePreference('dark')}
              style={{ minWidth: 110 }}
            />
          </View>
          <Text style={[textStyle, { color: muted }]}>Escolha “Sistema” para seguir o tema do dispositivo</Text>
        </View>

        <ToggleRow
          label="Modo foco"
          value={settings.focusMode}
          onChange={settings.setFocusMode}
          description="Esconde distrações e reduz informações secundárias"
        />

        <StepperRow
          label="Contraste"
          valueLabel={String(settings.contrastIntensity)}
          onDec={() => settings.setContrastIntensity(Math.max(0, settings.contrastIntensity - 1))}
          onInc={() => settings.setContrastIntensity(Math.min(3, settings.contrastIntensity + 1))}
          helper="Aumente para maior definição de bordas e separação de elementos"
        />

        <ToggleRow
          label="Alertas cognitivos"
          value={settings.cognitiveAlertsEnabled}
          onChange={settings.setCognitiveAlerts}
          description="Lembra se você ficou muito tempo na mesma tarefa"
        />

        <ToggleRow
          label="Avisos de transição"
          value={settings.transitionCuesEnabled}
          onChange={settings.setTransitionCues}
          description="Mensagens suaves em mudanças de fase/atividade"
        />

        <ToggleRow
          label="Animações"
          value={settings.animationsEnabled}
          onChange={settings.setAnimationsEnabled}
          description="Desative para reduzir estímulos visuais"
        />

        <ToggleRow
          label="Hápticos (vibração)"
          value={settings.hapticsEnabled}
          onChange={settings.setHapticsEnabled}
          description="Feedback tátil em transições (opcional)"
        />

        <ToggleRow
          label="Navegação guiada"
          value={settings.navigationProfile === 'guided'}
          onChange={(v) => settings.setNavigationProfile(v ? 'guided' : 'standard')}
          description="Sugestões e fluxo passo-a-passo em telas principais"
        />
        </Card>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
