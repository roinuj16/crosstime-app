import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Engine from '@/core/engine';
import type { AnyConfig, Mode } from '@/core/engine';
import { Button, Section, SheetHeader } from '@/components/ui';
import { useStrings } from '@/hooks/useStrings';
import type { Strings } from '@/i18n/strings';
import { useApp, type SavedWorkout } from '@/store/useApp';
import { hex, UI } from '@/theme/palette';
import { FONT } from '@/theme/type';

/** Resumo curto de um treino, ex.: "00:30 / 00:15 × 4 · 3 ciclos". */
export function describe(mode: Mode, c: AnyConfig, t: Strings, fmt: Engine.TimeFormat): string {
  const f = (s: number) => Engine.format(s, fmt);
  const cc = c as unknown as Record<string, number>;
  switch (mode) {
    case 'tabata': return `${f(cc.work)} / ${f(cc.rest)} × ${cc.rounds}${cc.cycles > 1 ? ` · ${cc.cycles} ${t.edit.fields.cycles.label.toLowerCase()}` : ''}`;
    case 'rounds': return `${f(cc.work)} / ${f(cc.rest)} × ${cc.rounds}`;
    case 'emom': return `${t.edit.fields.interval.label} ${f(cc.interval)} × ${cc.rounds}`;
    case 'amrap': return f(cc.time);
    case 'fortime': return cc.cap > 0 ? `${t.cap} ${f(cc.cap)}` : t.noCap;
    case 'stopwatch': return `${t.phases.lap} ${f(cc.lap)}`;
  }
}

export default function WorkoutsScreen() {
  const { t, lang } = useStrings();
  const saved = useApp((s) => s.saved);
  const history = useApp((s) => s.history);
  const fmt = useApp((s) => s.settings.timeFormat);
  const work = useApp((s) => hex(s.colors.work));
  const rest = useApp((s) => hex(s.colors.rest));
  const W = t.workouts;

  const use = (w: SavedWorkout) => {
    const st = useApp.getState();
    const go = () => { useApp.getState().loadWorkout(w); router.back(); };
    const status = st.session?.state.status;
    if (status === 'running' || status === 'paused') {
      Alert.alert(t.switchTitle, t.resetText, [{ text: t.cancel, style: 'cancel' }, { text: t.reset, style: 'destructive', onPress: () => { useApp.getState().reset(); go(); } }]);
    } else go();
  };
  const del = (w: SavedWorkout) =>
    Alert.alert(W.deleteTitle(w.name), undefined, [{ text: t.cancel, style: 'cancel' }, { text: t.delete, style: 'destructive', onPress: () => useApp.getState().deleteWorkout(w.id) }]);
  const clear = () =>
    Alert.alert(W.clearTitle, undefined, [{ text: t.cancel, style: 'cancel' }, { text: W.clear, style: 'destructive', onPress: () => useApp.getState().clearHistory() }]);

  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  const when = (ms: number) => {
    const d = new Date(ms);
    return `${d.toLocaleDateString(locale, { day: '2-digit', month: 'short' })}, ${d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <SheetHeader title={W.title} right={<Button label={t.settings.done} kind="primary" onPress={() => router.back()} />} />
      <ScrollView contentContainerStyle={styles.body}>
        <Section title={W.mine} />
        {saved.length === 0 && <Text style={styles.empty}>{W.empty}</Text>}
        {saved.map((w) => {
          const total = Engine.totalDuration(Engine.buildSegments(w.mode, w.config));
          return (
            <View key={w.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.name} numberOfLines={2}>{w.name}</Text>
                  <View style={styles.chips}>
                    <Text style={styles.chip}>{t.modes[w.mode].toUpperCase()}</Text>
                    {w.example && <Text style={[styles.chip, styles.chipEx]}>{W.example.toUpperCase()}</Text>}
                  </View>
                  <Text style={styles.desc}>{describe(w.mode, w.config, t, fmt)}</Text>
                </View>
                {total > 0 && w.mode !== 'fortime' && <Text style={[styles.tot, { color: work }]}>{Engine.format(total, fmt)}</Text>}
              </View>
              <View style={styles.acts}>
                <Button label={W.use} kind="primary" onPress={() => use(w)} />
                <Button label={t.delete} kind="danger" onPress={() => del(w)} />
              </View>
            </View>
          );
        })}

        <View style={styles.histHead}>
          <Section title={W.history} />
          {history.length > 0 && <Button label={W.clear} onPress={clear} style={{ marginTop: 14 }} />}
        </View>
        {history.length === 0 && <Text style={styles.empty}>{W.emptyHistory}</Text>}
        {history.map((h, i) => (
          <View key={`${h.at}-${i}`} style={styles.hrow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.hname} numberOfLines={1}>{h.name ?? t.modes[h.mode]}</Text>
              <Text style={styles.hwhen}>{when(h.at)} · {t.modes[h.mode]}{h.rounds != null ? ` · ${W.roundsN(h.rounds)}` : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={styles.hdur}>{Engine.formatUp(h.done)}{h.planned ? ` / ${Engine.format(h.planned, fmt)}` : ''}</Text>
              <Text style={[styles.pill, { color: h.completed ? work : rest, borderColor: h.completed ? work : rest }]}>{h.completed ? W.complete : W.partial}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#161616' },
  body: { paddingHorizontal: 16, paddingBottom: 48 },
  empty: { color: UI.muted, fontSize: 14, paddingVertical: 12 },
  card: { backgroundColor: '#202020', borderRadius: 14, padding: 14, marginTop: 10, gap: 12 },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  name: { color: UI.text, fontSize: 16, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 6, marginTop: 6 },
  chip: { color: UI.muted, fontSize: 10.5, fontWeight: '700', letterSpacing: 1, backgroundColor: '#2C2C2C', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  chipEx: { backgroundColor: 'transparent', borderWidth: 1, borderColor: UI.line, borderStyle: 'dashed' },
  desc: { color: UI.muted, fontSize: 13, marginTop: 6 },
  tot: { fontFamily: FONT.display, fontSize: 30, lineHeight: 32, fontVariant: ['tabular-nums'] },
  acts: { flexDirection: 'row', gap: 8 },
  histHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hrow: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  hname: { color: UI.text, fontWeight: '700', fontSize: 15 },
  hwhen: { color: UI.muted, fontSize: 12.5, marginTop: 2 },
  hdur: { color: UI.text, fontFamily: FONT.display, fontSize: 22, lineHeight: 24, fontVariant: ['tabular-nums'] },
  pill: { fontSize: 11, fontWeight: '700', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, overflow: 'hidden' },
});
