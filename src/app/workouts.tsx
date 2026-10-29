import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Hint, SectionTitle } from '@/components/atoms';
import { HistoryRow } from '@/components/molecules';
import { WorkoutCard } from '@/components/organisms';
import { SheetTemplate } from '@/components/templates';
import { describeWorkout } from '@/core/describeWorkout';
import * as Engine from '@/core/engine';
import { useStrings } from '@/hooks/useStrings';
import { useApp, type SavedWorkout } from '@/store/useApp';
import { hex } from '@/theme/palette';

/** Página de treinos: os salvos (com os exemplos) e o histórico do que foi feito. */
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
    <SheetTemplate title={W.title} right={<Button label={t.settings.done} kind="primary" onPress={() => router.back()} />}>
      <SectionTitle title={W.mine} />
      {saved.length === 0 && <Hint style={s.empty}>{W.empty}</Hint>}
      {saved.map((w) => {
        const total = Engine.totalDuration(Engine.buildSegments(w.mode, w.config));
        return (
          <WorkoutCard
            key={w.id} name={w.name} mode={t.modes[w.mode]} example={w.example ? W.example : undefined}
            description={describeWorkout(w.mode, w.config, t, fmt)}
            total={total > 0 && w.mode !== 'fortime' ? Engine.format(total, fmt) : undefined} totalColor={work}
            labels={{ use: W.use, delete: t.delete }} onUse={() => use(w)} onDelete={() => del(w)}
          />
        );
      })}

      <View style={s.historyHead}>
        <SectionTitle title={W.history} />
        {history.length > 0 && <Button label={W.clear} onPress={clear} style={{ marginTop: 14 }} />}
      </View>
      {history.length === 0 && <Hint style={s.empty}>{W.emptyHistory}</Hint>}
      {history.map((h, i) => (
        <HistoryRow
          key={`${h.at}-${i}`}
          title={h.name ?? t.modes[h.mode]}
          when={`${when(h.at)} · ${t.modes[h.mode]}${h.rounds != null ? ` · ${W.roundsN(h.rounds)}` : ''}`}
          duration={`${Engine.formatUp(h.done)}${h.planned ? ` / ${Engine.format(h.planned, fmt)}` : ''}`}
          status={h.completed ? W.complete : W.partial} statusColor={h.completed ? work : rest}
        />
      ))}
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  empty: { paddingVertical: 12 },
  historyHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
