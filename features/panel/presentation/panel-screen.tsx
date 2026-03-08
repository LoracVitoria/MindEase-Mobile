import { useEffect } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useSettingsStore } from '@/shared/stores/settings-store';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import {
    useCognitiveContainerStyle,
    useCognitiveSpacing,
  useCognitiveScreenTitleStyle,
    useCognitiveTextStyle,
} from '@/shared/ui/cognitive-styles';
import SafeAreaWrapper from '@/shared/ui/safe-area-wrapper';
import { StepperRow } from '@/shared/ui/stepper-row';
import { ToggleRow } from '@/shared/ui/toggle-row';

function ChoiceRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { key: string; title: string }[];
  onChange: (key: string) => void;
}) {
  const foreground = useThemeColor({}, 'foreground');
  const muted = useThemeColor({}, 'muted');
  const { buttonGap } = useCognitiveSpacing();
  const labelStyle = useCognitiveTextStyle({ weight: '600' });
  const helperStyle = useCognitiveTextStyle();

  return (
    <View style={{ gap: 10 }}>
      <Text style={[labelStyle, { color: foreground }]}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: buttonGap }}>
        {options.map((opt) => (
          <Button
            key={opt.key}
            title={opt.title}
            variant={opt.key === value ? 'primary' : 'secondary'}
            onPress={() => onChange(opt.key)}
            style={{ minWidth: 110 }}
          />
        ))}
      </View>
      <Text style={[helperStyle, { color: muted }]}>
        {value === 'simple'
          ? 'Menos opções na tela'
          : value === 'advanced'
            ? 'Mais opções e controle fino'
            : 'Equilíbrio entre simplicidade e detalhes'}
      </Text>
    </View>
  );
}

export function PanelScreen() {
  const background = useThemeColor({}, 'background');
  const foreground = useThemeColor({}, 'foreground');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');

  const tabBarHeight = useBottomTabBarHeight();

  const containerStyle = useCognitiveContainerStyle();
  const titleStyle = useCognitiveScreenTitleStyle();
  const textStyle = useCognitiveTextStyle();
  const { gap } = useCognitiveSpacing();

  const settings = useSettingsStore();

  useEffect(() => {
    if (!settings.hydrated) {
      settings.hydrate();
    }
  }, [settings]);

  const isSimple = settings.complexityLevel === 'simple';
  const isAdvanced = settings.complexityLevel === 'advanced';

  return (
    <SafeAreaWrapper backgroundColor={background} edges={['top', 'left', 'right']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          { gap, paddingBottom: tabBarHeight + 24 },
          containerStyle,
        ]}
      >
        <Text style={[titleStyle, { color: foreground }]}>Painel Cognitivo</Text>
        <Text style={[textStyle, { color: muted }]}>
          Ajuste a interface para reduzir sobrecarga e manter o foco
        </Text>

      <Card style={{ gap }}>
        <ChoiceRow
          label="Nível de complexidade"
          value={settings.complexityLevel}
          options={[
            { key: 'simple', title: 'Simples' },
            { key: 'standard', title: 'Padrão' },
            { key: 'advanced', title: 'Avançado' },
          ]}
          onChange={(k) => settings.setComplexity(k as any)}
        />

        <ToggleRow
          label="Modo foco"
          value={settings.focusMode}
          onChange={settings.setFocusMode}
          description="Oculta elementos secundários e ajuda na concentração"
        />

        <ChoiceRow
          label="Modo de visualização"
          value={settings.viewMode}
          options={[
            { key: 'summary', title: 'Resumo' },
            { key: 'detailed', title: 'Detalhado' },
          ]}
          onChange={(k) => settings.setViewMode(k as any)}
        />

        {!isSimple ? (
          <ChoiceRow
            label="Perfil de navegação"
            value={settings.navigationProfile}
            options={[
              { key: 'guided', title: 'Guiado' },
              { key: 'standard', title: 'Padrão' },
            ]}
            onChange={(k) => settings.setNavigationProfile(k as any)}
          />
        ) : null}
      </Card>

      <Card style={{ gap }}>
        <Text style={[useCognitiveTextStyle({ weight: '700' }), { color: foreground }]}>Leitura e espaçamento</Text>

        <StepperRow
          label="Contraste"
          valueLabel={String(settings.contrastIntensity)}
          onDec={() => settings.setContrastIntensity(Math.max(0, settings.contrastIntensity - 1))}
          onInc={() => settings.setContrastIntensity(Math.min(3, settings.contrastIntensity + 1))}
          helper="Aumente para maior definição de bordas"
        />

        <StepperRow
          label="Espaçamento"
          valueLabel={String(settings.spacingIntensity)}
          onDec={() => settings.setSpacingIntensity(Math.max(0, settings.spacingIntensity - 1))}
          onInc={() => settings.setSpacingIntensity(Math.min(3, settings.spacingIntensity + 1))}
          helper="Mais espaço reduz estímulos e melhora escaneabilidade"
        />

        <StepperRow
          label="Tamanho de fonte"
          valueLabel={`${Math.round(settings.fontScale * 100)}%`}
          onDec={() => settings.setFontScale(Math.max(0.9, Number((settings.fontScale - 0.05).toFixed(2))))}
          onInc={() => settings.setFontScale(Math.min(1.4, Number((settings.fontScale + 0.05).toFixed(2))))}
          helper="Aumente para leitura mais confortável"
        />

        {isAdvanced ? (
          <ToggleRow
            label="Animações"
            value={settings.animationsEnabled}
            onChange={settings.setAnimationsEnabled}
            description="Desative para reduzir estímulos visuais"
          />
        ) : null}
      </Card>

      <Card style={{ gap }}>
        <Text style={[useCognitiveTextStyle({ weight: '700' }), { color: foreground }]}>Alertas Cognitivos</Text>
        <ToggleRow
          label="Ativar alertas"
          value={settings.cognitiveAlertsEnabled}
          onChange={settings.setCognitiveAlerts}
          description="Ex.: “Você está muito tempo nesta tarefa”"
        />

        <ToggleRow
          label="Avisos de transição"
          value={settings.transitionCuesEnabled}
          onChange={settings.setTransitionCues}
          description="Mensagens suaves ao trocar fases, iniciar e encerrar tarefas"
        />

        {!isSimple ? (
          <StepperRow
            label="Tempo para alerta"
            valueLabel={`${settings.cognitiveAlertMinutes} min`}
            onDec={() => settings.setCognitiveAlertMinutes(Math.max(5, settings.cognitiveAlertMinutes - 5))}
            onInc={() => settings.setCognitiveAlertMinutes(Math.min(120, settings.cognitiveAlertMinutes + 5))}
            helper="Recomendação de 20 a 30 minutos"
          />
        ) : null}

        <Button
          title="Testar alerta"
          variant="secondary"
          onPress={() => Alert.alert('Alerta cognitivo', 'Você está muito tempo nesta tarefa. Quer pausar ou ajustar?')}
        />
      </Card>

      <Card style={{ gap }}>
        <Text style={[useCognitiveTextStyle({ weight: '700' }), { color: foreground }]}>Pré-visualização</Text>
        <Text style={[textStyle, { color: muted }]}>
          O texto e espaçamento aqui refletem suas preferências
        </Text>
        <View
          style={{
            borderWidth: settings.contrastIntensity >= 2 ? 2 : 1,
            borderRadius: 14,
            padding: 12,
            borderColor: border,
          }}
        >
          <Text style={[useCognitiveTextStyle({ weight: '700' }), { color: foreground }]}>Tarefa atual</Text>
          <Text style={[textStyle, { color: muted, marginTop: 6 }]}>
            {settings.viewMode === 'summary'
              ? 'Resumo: 1 etapa pendente'
              : 'Detalhado: revisar tópicos, fazer exercícios, marcar checklist e encerrar'}
          </Text>
        </View>
      </Card>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
