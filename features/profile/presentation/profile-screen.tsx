import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useCognitiveContainerStyle, useCognitiveScreenTitleStyle, useCognitiveSpacing, useCognitiveTextStyle } from '@/shared/ui/cognitive-styles';
import { SafeTextInput } from '@/shared/ui/safe-text-input';
import SafeAreaWrapper from '@/shared/ui/safe-area-wrapper';
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
  const fieldLabelStyle = useCognitiveTextStyle({ weight: '700' });
  const cardHeaderBaseStyle = useCognitiveTextStyle({ weight: '800' });
  const { gap } = useCognitiveSpacing();

  const settings = useSettingsStore();

  const cardHeaderStyle = useMemo(
    () => ({
      ...cardHeaderBaseStyle,
      fontSize: (cardHeaderBaseStyle.fontSize ?? 16) + 2,
      lineHeight: (cardHeaderBaseStyle.lineHeight ?? 22) + 2,
    }),
    [cardHeaderBaseStyle]
  );

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
        <Text style={[cardHeaderStyle, { color: foreground }]}>Perfil</Text>
        <Text style={[fieldLabelStyle, { color: foreground }]}>Nome de exibição</Text>
        <SafeTextInput
          value={profile.displayName}
          onChangeText={(t) => setProfile((p) => ({ ...p, displayName: t }))}
          style={[inputStyle, textStyle]}
          placeholder="Como você quer ser chamada(o)?"
          placeholderTextColor={muted}
        />

        <Text style={[fieldLabelStyle, { color: foreground }]}>Necessidades específicas</Text>
        <SafeTextInput
          value={profile.needsNotes}
          onChangeText={(t) => setProfile((p) => ({ ...p, needsNotes: t }))}
          style={[inputStyle, textStyle, { minHeight: 80 }]}
          multiline
          placeholder="Ex.: Evitar muitos elementos na tela, lembretes suaves, etc"
          placeholderTextColor={muted}
        />

        <Text style={[fieldLabelStyle, { color: foreground }]}>Rotinas de estudo, trabalho ou lazer</Text>
        <SafeTextInput
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
        <Text style={[cardHeaderStyle, { color: foreground }]}>Configurações persistentes</Text>

        <View style={{ gap: 10 }}>
          <Text style={[sectionTitleStyle, { color: foreground }]}>Tema</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'nowrap', gap: 10, width: '100%' }}>
            <Button
              title="Sistema"
              variant={settings.themePreference === 'system' ? 'primary' : 'secondary'}
              onPress={() => void settings.setThemePreference('system')}
              style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
              textNumberOfLines={1}
              textEllipsizeMode="tail"
            />
            <Button
              title="Claro"
              variant={settings.themePreference === 'light' ? 'primary' : 'secondary'}
              onPress={() => void settings.setThemePreference('light')}
              style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
              textNumberOfLines={1}
              textEllipsizeMode="tail"
            />
            <Button
              title="Escuro"
              variant={settings.themePreference === 'dark' ? 'primary' : 'secondary'}
              onPress={() => void settings.setThemePreference('dark')}
              style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
              textNumberOfLines={1}
              textEllipsizeMode="tail"
            />
          </View>
          <Text style={[textStyle, { color: muted }]}>Escolha “Sistema” para seguir o tema do dispositivo</Text>
        </View>

        <ToggleRow
          label="Animações"
          value={settings.animationsEnabled}
          onChange={settings.setAnimationsEnabled}
          description="Desative para reduzir estímulos visuais"
        />

        <ToggleRow
          label="Vibração"
          value={settings.hapticsEnabled}
          onChange={settings.setHapticsEnabled}
          description="Feedback tátil em transições"
        />

        </Card>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
