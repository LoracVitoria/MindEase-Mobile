import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useSettingsStore } from '@/shared/stores/settings-store';
import { useTasksStore } from '@/shared/stores/tasks-store';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useCognitiveScreenTitleStyle, useCognitiveSpacing, useCognitiveTextStyle } from '@/shared/ui/cognitive-styles';
import { SafeTextInput } from '@/shared/ui/safe-text-input';
import SafeAreaWrapper from '@/shared/ui/safe-area-wrapper';
import { ToggleRow } from '@/shared/ui/toggle-row';
import { formatMinutesSeconds } from '@/shared/utils/time';

import { type ChecklistTemplate, type Task, type TaskKind, type TaskStage } from '@/features/tasks/domain/entities/task.entity';
import { useCognitiveTaskAlert } from '@/features/tasks/presentation/hooks/use-cognitive-task-alert';
import { usePomodoro } from '@/features/tasks/presentation/hooks/use-pomodoro';

const KIND_LABEL: Record<TaskKind, string> = {
  study: 'Estudo',
  work: 'Trabalho',
  leisure: 'Lazer',
};

function StagePill({
  title,
  active,
  onPress,
  minWidth = 112,
  style,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
  minWidth?: number;
  style?: ViewStyle;
}) {
  return (
    <Button
      title={title}
      variant={active ? 'primary' : 'secondary'}
      onPress={onPress}
      style={{ minWidth, ...(style ?? {}) }}
    />
  );
}

function TaskRow({
  task,
  viewMode,
  selected,
  onSelect,
  onMove,
  onDelete,
  onToggleChecklist,
}: {
  task: Task;
  viewMode: 'summary' | 'detailed';
  selected: boolean;
  onSelect: () => void;
  onMove: (stage: TaskStage) => void;
  onDelete: () => void;
  onToggleChecklist: (itemId: string) => void;
}) {
  const foreground = useThemeColor({}, 'foreground');
  const muted = useThemeColor({}, 'muted');
  const primary = useThemeColor({}, 'primary');
  const dangerBorder = useThemeColor({ dark: '#FF2D2D' }, 'danger');
  const border = useThemeColor({}, 'border');
  const successBorder = useThemeColor({ dark: '#22C55E' }, 'success');
  const { gap, buttonGap } = useCognitiveSpacing();
  const titleStyle = useCognitiveTextStyle({ weight: '700' });
  const textStyle = useCognitiveTextStyle();

  const tagTextStyle = useMemo(
    () => ({
      ...textStyle,
      fontSize: Math.max(12, (textStyle.fontSize ?? 16) - 3),
      lineHeight: Math.max(14, (textStyle.lineHeight ?? 22) - 6),
      fontWeight: '700' as const,
    }),
    [textStyle]
  );

  const checklistDone = task.checklist.filter((i) => i.done).length;

  return (
    <Card style={{ gap }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, width: '100%' }}>
        <Text style={[titleStyle, { color: foreground, flex: 1 }]}>{task.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: border,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 2,
              }}
            >
              <Text style={[tagTextStyle, { color: muted }]}>{KIND_LABEL[task.kind]}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={selected ? 'Desmarcar tarefa' : 'Selecionar tarefa'}
              accessibilityState={{ selected }}
              onPress={onSelect}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: selected ? primary : muted,
                  backgroundColor: selected ? primary : 'transparent',
                }}
              />
            </Pressable>
          </View>
      </View>

      {viewMode === 'detailed' && task.checklist.length > 0 ? (
        <View style={{ gap: 8 }}>
          <Text style={[textStyle, { color: muted }]}>
            Checklist ({checklistDone}/{task.checklist.length})
          </Text>
          {task.checklist.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => onToggleChecklist(item.id)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <Text style={[textStyle, { color: foreground }]}>
                {item.done ? '✓ ' : '○ '} {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'nowrap',
              gap: Math.min(buttonGap, 8),
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
            }}
          >
          {task.stage === 'todo' ? (
              <>
                <Button
                  title="Excluir"
                  variant="ghost"
                  onPress={onDelete}
                  style={{ borderWidth: 2, borderColor: dangerBorder, flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
                  textNumberOfLines={1}
                  textEllipsizeMode="tail"
                />
                <Button
                  title="Começar"
                  variant="secondary"
                  onPress={() => onMove('doing')}
                  style={{ borderColor: successBorder, flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
                  textNumberOfLines={1}
                  textEllipsizeMode="tail"
                />
              </>
          ) : null}

          {task.stage === 'doing' ? (
            <>
              <Button
                  title="Excluir"
                  variant="ghost"
                  onPress={onDelete}
                  style={{ borderWidth: 2, borderColor: dangerBorder, flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
                  textNumberOfLines={1}
                  textEllipsizeMode="tail"
                />
                <Button
                title="Concluir"
                variant="secondary"
                onPress={() => onMove('done')}
                  style={{ borderColor: successBorder, flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
                  textNumberOfLines={1}
                  textEllipsizeMode="tail"
              />
                <Button
                  title="Retornar"
                  variant="secondary"
                  onPress={() => onMove('todo')}
                  style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
                  textNumberOfLines={1}
                  textEllipsizeMode="tail"
                />
            </>
          ) : null}

          {task.stage === 'done' ? (
              <>
                <Button
                  title="Excluir"
                  variant="ghost"
                  onPress={onDelete}
                  style={{ borderWidth: 2, borderColor: dangerBorder, flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
                  textNumberOfLines={1}
                  textEllipsizeMode="tail"
                />
                <Button
                  title="Retornar"
                  variant="secondary"
                  onPress={() => onMove('doing')}
                  style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
                  textNumberOfLines={1}
                  textEllipsizeMode="tail"
                />
              </>
          ) : null}
          </View>
      </View>
    </Card>
  );
}

export function TasksScreen() {
  const background = useThemeColor({}, 'background');
  const foreground = useThemeColor({}, 'foreground');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');

  const titleStyle = useCognitiveScreenTitleStyle();
  const textStyle = useCognitiveTextStyle();
  const sectionTitleStyle = useCognitiveTextStyle({ weight: '700' });
  const { gap, buttonGap, pad } = useCognitiveSpacing();

  const settings = useSettingsStore();
  const tasksStore = useTasksStore();

  const tabBarHeight = useBottomTabBarHeight();

  const pomodoro = usePomodoro();
  useCognitiveTaskAlert();

  const [stage, setStage] = useState<TaskStage>('todo');
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<ChecklistTemplate>('study');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!settings.hydrated) settings.hydrate();
    if (!tasksStore.hydrated) tasksStore.hydrate();
  }, [settings, tasksStore]);

  const tasks = useMemo(() => {
    const list = tasksStore.tasks.filter((t: Task) => t.stage === stage);
    return list;
  }, [stage, tasksStore.tasks]);

  const doneCount = useMemo(
    () => tasksStore.tasks.filter((t: Task) => t.stage === 'done').length,
    [tasksStore.tasks]
  );

  const inputStyle = useMemo(
    () => ({
      borderWidth: settings.contrastIntensity <= 1 ? 1 : Math.min(3, settings.contrastIntensity),
      borderColor: border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: foreground,
    }),
    [border, foreground, settings.contrastIntensity]
  );

  const doingTask = useMemo(
    () => tasksStore.tasks.find((t: Task) => t.stage === 'doing'),
    [tasksStore.tasks]
  );
  const focusSuggestions = useMemo(() => {
    if (!settings.focusMode) return [];
    if (doingTask) return [];
    return tasksStore.tasks.filter((t: Task) => t.stage === 'todo').slice(0, 3);
  }, [doingTask, settings.focusMode, tasksStore.tasks]);

  async function hapticTick() {
    if (!settings.hapticsEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // noop
    }
  }

  function maybeConfirmTransition(task: Task, nextStage: TaskStage, doMove: () => void) {
    if (!settings.transitionCuesEnabled) {
      doMove();
      return;
    }

    const guided = settings.navigationProfile === 'guided';
    const shouldPrompt = guided || settings.complexityLevel !== 'advanced';
    if (!shouldPrompt) {
      doMove();
      return;
    }

    const from = task.stage;
    if (from === 'todo' && nextStage === 'doing') {
      Alert.alert(
        'Transição suave',
        'Escolha um passo pequeno. Se precisar, ative o Pomodoro e marque o checklist aos poucos',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Começar',
            onPress: () => {
              hapticTick();
              doMove();
            },
          },
        ]
      );
      return;
    }

    if (from === 'doing' && nextStage === 'done') {
      Alert.alert(
        'Encerrar com calma',
        'Antes de concluir: respire, revise o que ficou pendente e anote o próximo passo',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Concluir',
            onPress: () => {
              hapticTick();
              doMove();
            },
          },
        ]
      );
      return;
    }

    doMove();
  }

  return (
    <SafeAreaWrapper
      backgroundColor={background}
      edges={settings.focusMode ? ['top', 'bottom', 'left', 'right'] : ['top', 'left', 'right']}
    >
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: pad,
          paddingHorizontal: Math.max(10, pad - 2),
          paddingBottom: tabBarHeight + 24 + pad,
        }}
        ItemSeparatorComponent={() => <View style={{ height: gap }} />}
        ListHeaderComponent={
          <View style={{ gap, marginBottom: gap }}>
            <Text style={[titleStyle, { color: foreground }]}>Tarefas</Text>
            <Text style={[textStyle, { color: muted }]}>
              Kanban simplificado com Pomodoro adaptado para foco
            </Text>

            {settings.focusMode ? (
              <Card style={{ gap }}>
                <ToggleRow
                  label="Modo foco"
                  value={settings.focusMode}
                  onChange={settings.setFocusMode}
                  description="Layout mais simples e menos distrações"
                />

                <Text style={[textStyle, { color: muted }]}>
                  Dica: mantenha uma tarefa em &quot;Fazendo&quot; e use o Pomodoro para dar pequenos passos
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: buttonGap }}>
                  <Button title="Ir para Fazendo" variant="secondary" onPress={() => setStage('doing')} />
                </View>

                {focusSuggestions.length > 0 ? (
                  <View style={{ gap: 10 }}>
                    <Text style={[textStyle, { color: muted }]}>Sugestões para começar:</Text>
                    {focusSuggestions.map((t: Task) => (
                      <Button
                        key={t.id}
                        title={`Começar: ${t.title}`}
                        variant="secondary"
                        onPress={() =>
                          maybeConfirmTransition(t, 'doing', () => {
                            setStage('doing');
                            void tasksStore.moveTask(t.id, 'doing');
                          })
                        }
                      />
                    ))}
                  </View>
                ) : null}
              </Card>
            ) : null}

            {settings.complexityLevel !== 'simple' ? (
              <Card style={{ gap }}>
                <Text style={[sectionTitleStyle, { color: foreground }]}>Nova tarefa</Text>
                <SafeTextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ex.: Estudar matemática"
                  placeholderTextColor={muted}
                  style={[inputStyle, textStyle]}
                />

                <View style={{ flexDirection: 'row', flexWrap: 'nowrap', gap: Math.min(buttonGap, 8), width: '100%' }}>
                  <Button
                    title="Estudo"
                    variant={template === 'study' ? 'primary' : 'secondary'}
                    onPress={() => setTemplate('study')}
                    style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
                    textNumberOfLines={1}
                    textEllipsizeMode="tail"
                  />
                  <Button
                    title="Trabalho"
                    variant={template === 'work' ? 'primary' : 'secondary'}
                    onPress={() => setTemplate('work')}
                    style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
                    textNumberOfLines={1}
                    textEllipsizeMode="tail"
                  />
                  <Button
                    title="Lazer"
                    variant={template === 'none' ? 'primary' : 'secondary'}
                    onPress={() => setTemplate('none')}
                    style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, paddingHorizontal: 10 }}
                    textNumberOfLines={1}
                    textEllipsizeMode="tail"
                  />
                </View>

                <Button
                  title="Adicionar"
                  variant="secondary"
                  onPress={async () => {
                    const trimmed = title.trim();
                    if (!trimmed) return;
                    await tasksStore.createTask(trimmed, template);
                    setTitle('');
                  }}
                />
              </Card>
            ) : (
              <Card style={{ gap }}>
                <Text style={[sectionTitleStyle, { color: foreground }]}>Adicionar tarefa</Text>
                <Text style={[textStyle, { color: muted }]}>Aumente a complexidade para criar tarefas por aqui</Text>
                <Button
                  title="Mudar para Padrão"
                  variant="secondary"
                  onPress={() => settings.setComplexity('standard')}
                />
              </Card>
            )}

            <View style={{ flexDirection: 'row', flexWrap: 'nowrap', gap, alignItems: 'stretch' }}>
              <Card style={{ gap, flex: 1, minWidth: 0 }}>
                <Text style={[sectionTitleStyle, { color: foreground }]}>Pomodoro</Text>
                <Text style={[textStyle, { color: muted }]}>
                  Fase:{'\n'}
                  {pomodoro.phase === 'focus' ? 'Foco' : 'Pausa'} • {formatMinutesSeconds(pomodoro.remainingSeconds)}
                </Text>
                <View style={{ flex: 1 }} />

                <View style={{ flexDirection: 'column', gap: buttonGap }}>
                  {!pomodoro.isRunning ? (
                    <Button title="Iniciar" onPress={pomodoro.start} style={{ alignSelf: 'stretch' }} />
                  ) : (
                    <Button title="Pausar" variant="secondary" onPress={pomodoro.pause} style={{ alignSelf: 'stretch' }} />
                  )}
                  <Button title="Resetar" variant="secondary" onPress={pomodoro.reset} style={{ alignSelf: 'stretch' }} />
                  {settings.complexityLevel === 'advanced' ? (
                    <Button title="Trocar fase" variant="ghost" onPress={pomodoro.switchPhase} style={{ alignSelf: 'stretch' }} />
                  ) : null}
                </View>
              </Card>

              <Card style={{ gap, flex: 1, minWidth: 0 }}>
                <Text style={[sectionTitleStyle, { color: foreground }]}>Etapas</Text>
                <Text style={[textStyle, { color: muted }]}>Selecione para filtrar as tarefas</Text>


                <View style={{ flex: 1 }} />

                <View style={{ flexDirection: 'column', gap: buttonGap }}>
                  <StagePill
                    title={'A\u00A0fazer'}
                    active={stage === 'todo'}
                    onPress={() => setStage('todo')}
                    minWidth={0}
                    style={{ alignSelf: 'stretch' }}
                  />
                  <StagePill
                    title="Fazendo"
                    active={stage === 'doing'}
                    onPress={() => setStage('doing')}
                    minWidth={0}
                    style={{ alignSelf: 'stretch' }}
                  />
                  <StagePill
                    title="Feito"
                    active={stage === 'done'}
                    onPress={() => setStage('done')}
                    minWidth={0}
                    style={{ alignSelf: 'stretch' }}
                  />
                </View>
              </Card>
            </View>

          </View>
        }
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            viewMode={settings.viewMode}
            selected={selectedTaskId === item.id}
            onSelect={() =>
              setSelectedTaskId((current) => (current === item.id ? null : item.id))
            }
            onMove={(nextStage) =>
              maybeConfirmTransition(item, nextStage, () => {
                setStage(nextStage);
                void tasksStore.moveTask(item.id, nextStage);
              })
            }
            onDelete={() => tasksStore.deleteTask(item.id)}
            onToggleChecklist={(itemId) => tasksStore.toggleChecklistItem(item.id, itemId)}
          />
        )}
        ListEmptyComponent={
          <Text style={[textStyle, { color: muted, marginTop: gap }]}>
            {settings.focusMode && stage === 'doing' && !doingTask
              ? 'Escolha uma tarefa para "Fazendo"'
              : 'Nenhuma tarefa nesta etapa'}
          </Text>
        }
        ListFooterComponent={
          settings.complexityLevel === 'advanced' && stage === 'done' && doneCount > 0 ? (
            <View style={{ marginTop: gap }}>
              <Card style={{ gap }}>
                <Button title="Limpar concluídas" variant="secondary" onPress={() => tasksStore.clearDone()} />
              </Card>
            </View>
          ) : (
            <View />
          )
        }
      />
    </SafeAreaWrapper>
  );
}
