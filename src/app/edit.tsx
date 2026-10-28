import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Engine from '@/core/engine';
import type { Mode } from '@/core/engine';
import { Button, Row, SheetHeader, Stepper, s as ui } from '@/components/ui';
import { useStrings } from '@/hooks/useStrings';
import type { FieldKey } from '@/i18n/strings';
import { useApp } from '@/store/useApp';
import { UI } from '@/theme/palette';

type Kind = 'time' | 'count';
const FIELDS: Record<Mode, [FieldKey, Kind][]> = {
  tabata: [['prepare', 'time'], ['work', 'time'], ['rest', 'time'], ['rounds', 'count'], ['cycles', 'count'], ['restBC', 'time'], ['cooldown', 'time']],
  rounds: [['prepare', 'time'], ['work', 'time'], ['rest', 'time'], ['rounds', 'count'], ['cooldown', 'time']],
  emom: [['prepare', 'time'], ['interval', 'time'], ['rounds', 'count']],
  amrap: [['prepare', 'time'], ['time', 'time']],
  fortime: [['prepare', 'time'], ['cap', 'time']],
  stopwatch: [['prepare', 'time'], ['lap', 'time']],
};
const MIN: Partial<Record<FieldKey, number>> = { work: 5, lap: 5, interval: 10, time: 60, rounds: 1, cycles: 1 };
const MAX_TIME = 2 * 60 * 60;
const MAX_COUNT = 99;

/** Passo do +/−: 1 s até 10 s, 5 s até 2 min, 15 s até 10 min, depois 1 min. */
function nextValue(v: number, dir: 1 | -1, kind: Kind, key: FieldKey): number {
  const ref = dir > 0 ? v : v - 1;
  const inc = kind === 'count' ? 1 : ref < 10 ? 1 : ref < 120 ? 5 : ref < 600 ? 15 : 60;
  const nv = dir > 0 ? Math.floor((v + inc) / inc) * inc : Math.ceil((v - inc) / inc) * inc;
  return clamp(nv, kind, key);
}

/** Mantém o valor entre o mínimo do campo e o máximo (2 h ou 99). */
function clamp(v: number, kind: Kind, key: FieldKey): number {
  return Math.min(kind === 'count' ? MAX_COUNT : MAX_TIME, Math.max(MIN[key] ?? 0, Math.round(v)));
}

export default function EditScreen() {
  const { t } = useStrings();
  const mode = useApp((s) => s.mode);
  const config = useApp((s) => s.configs[s.mode]) as unknown as Record<string, number>;
  const status = useApp((s) => s.session?.state.status ?? 'idle');
  const fmt = useApp((s) => s.settings.timeFormat);
  const locked = status === 'running' || status === 'paused';
  const [name, setName] = useState('');

  const total = Engine.totalDuration(Engine.buildSegments(mode, config as never));
  const show = (key: FieldKey, kind: Kind, v: number) =>
    kind === 'count' ? String(v) : key === 'cap' && v === 0 ? '∞' : Engine.format(v, fmt);

  const step = (key: FieldKey, kind: Kind) => (dir: 1 | -1) => {
    const st = useApp.getState();
    if (st.session?.state.status === 'done') st.reset();
    const cur = (st.configs[st.mode] as unknown as Record<string, number>)[key];
    st.setConfig(st.mode, { [key]: nextValue(cur, dir, kind, key) } as never);
  };

  /** Valor digitado no teclado numérico. */
  const enter = (key: FieldKey, kind: Kind) => (value: number) => {
    const st = useApp.getState();
    if (st.session?.state.status === 'done') st.reset();
    st.setConfig(st.mode, { [key]: clamp(value, kind, key) } as never);
  };

  const save = () => {
    const n = name.trim() || `${t.modes[mode]} ${Engine.format(total || 0, fmt)}`;
    useApp.getState().saveWorkout(n);
    setName('');
    Alert.alert(t.edit.saved, n);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <SheetHeader
        title={`${t.modes[mode]}`}
        right={
          <>
            {mode !== 'stopwatch' && total > 0 && <Text style={styles.total}>{Engine.format(total, fmt)}</Text>}
            <Button label={t.settings.done} kind="primary" onPress={() => router.back()} />
          </>
        }
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.modeHint}>{t.modeHints[mode]}</Text>
          {!locked && <Text style={styles.typeHint}>{t.edit.tapToType}</Text>}
          {locked && <Text style={styles.note}>{t.edit.locked}</Text>}
          {FIELDS[mode].map(([key, kind]) => (
            <Row
              key={key}
              label={t.edit.fields[key].label}
              hint={t.edit.fields[key].hint}
              disabled={locked}
              right={<Stepper label={t.edit.fields[key].label} display={show(key, kind, config[key] ?? 0)} onStep={step(key, kind)} disabled={locked}
                  entry={{ kind, onEnter: enter(key, kind), okLabel: t.edit.ok, typeLabel: t.edit.typeValue(t.edit.fields[key].label) }}
                />
              }
            />
          ))}
          <View style={styles.saveRow}>
            <TextInput
              value={name} onChangeText={setName} placeholder={t.edit.savePlaceholder} placeholderTextColor={UI.muted}
              style={styles.input} maxLength={40} returnKeyType="done" onSubmitEditing={save} accessibilityLabel={t.edit.savePlaceholder}
            />
            <Button label={t.edit.save} onPress={save} />
          </View>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <Button label={t.edit.restore} onPress={() => useApp.getState().resetConfig(mode)} disabled={locked} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#161616' },
  body: { paddingHorizontal: 16, paddingBottom: 40 },
  total: { ...ui.stepVal, minWidth: 0, color: UI.muted, fontSize: 26 },
  modeHint: { color: UI.muted, fontSize: 14, marginBottom: 4 },
  typeHint: { color: UI.muted, fontSize: 12.5, marginBottom: 4, opacity: 0.8 },
  note: { color: UI.text, backgroundColor: '#262626', borderRadius: 10, padding: 10, marginVertical: 8, fontSize: 13.5 },
  saveRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20, alignItems: 'center' },
  input: { flexGrow: 1, flexBasis: 180, minWidth: 0, backgroundColor: UI.bg, borderWidth: 1, borderColor: UI.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: UI.text, fontSize: 15 },
});
