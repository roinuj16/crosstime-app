import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

export interface CounterStage { label: string; value: string; state: 'done' | 'now' | 'next' }

export type CounterCurrent =
  | { kind: 'reps'; name: string; setDone: number; setTarget: number; total: string; left: string }
  | { kind: 'run'; name: string; button: string };

/**
 * Tela de contagem do aluno durante o Murph: etapas, relógio, a etapa atual em destaque
 * e os botões +1 / +5 / +10, desfazer e pular (quando há quebra).
 */
export function MurphCounter({
  title, stageText, segments, clock, limit, stages, current, labels, canUndo, skipLabel, onAdd, onUndo, onSkip, onRun,
}: {
  title: string; stageText: string; segments: number[]; clock: string; limit: string; stages: CounterStage[];
  current: CounterCurrent; labels: { now: string; done: string; set: string; undo: string };
  canUndo: boolean; skipLabel: string | null;
  onAdd: (n: number) => void; onUndo: () => void; onSkip: () => void; onRun: () => void;
}) {
  return (
    <View style={s.root}>
      <View style={s.top}>
        <LedText size={30} trim="label" color={UI.text} tracking={1}>{title.toUpperCase()}</LedText>
        <Text style={s.stage}>{stageText.toUpperCase()}</Text>
      </View>
      <View style={s.segs}>
        {segments.map((f, i) => (
          <View key={i} style={s.seg}><View style={[s.segFill, { width: `${Math.round(f * 100)}%` }]} /></View>
        ))}
      </View>
      <View style={s.clockRow}>
        <LedText variant="display" size={44} tabular trim="digits" color={UI.text}>{clock}</LedText>
        <Text style={s.limit}>{limit}</Text>
      </View>

      <View style={s.list}>
        {stages.map((st, i) => (
          <View key={i} style={[s.stageRow, st.state === 'now' && s.nowRow]}>
            <Ionicons name={st.state === 'done' ? 'checkbox' : 'square-outline'} size={20} color={st.state === 'done' ? LED.verde : UI.muted} />
            <Text style={[s.stageLabel, st.state === 'done' && { color: UI.muted }]}>{st.label.toUpperCase()}</Text>
            {st.state === 'now' ? <Text style={s.nowTag}>{labels.now.toUpperCase()}</Text> : null}
            <Text style={[s.stageValue, st.state === 'done' && { color: LED.verde }]}>{st.state === 'done' ? labels.done.toUpperCase() : st.value}</Text>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <View style={s.cardHead}>
          <LedText size={26} trim="label" color={UI.text} tracking={1}>{current.name.toUpperCase()}</LedText>
          <Text style={s.nowTag}>{labels.now.toUpperCase()}</Text>
        </View>
        {current.kind === 'reps' ? (
          <>
            <View style={s.bigRow}>
              <LedText variant="display" size={96} tabular trim="digits" color={LED.verde}>{String(current.setDone)}</LedText>
              <LedText variant="display" size={44} tabular trim="digits" color={UI.muted}>/{current.setTarget}</LedText>
              <Text style={s.setLbl}>{labels.set.toUpperCase()}</Text>
            </View>
            <View style={s.bar}><View style={[s.barFill, { width: `${(current.setDone / Math.max(1, current.setTarget)) * 100}%` }]} /></View>
            <Text style={s.total}>{current.total} · {current.left}</Text>
            <View style={s.btns}>
              {[1, 5, 10].map((n) => (
                <Pressable key={n} onPress={() => onAdd(n)} accessibilityRole="button" accessibilityLabel={`+${n}`}
                  style={({ pressed }) => [s.btn, n === 5 && s.btnMain, pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}>
                  <LedText variant="display" size={40} trim="digits" color={n === 5 ? '#0B0B0B' : UI.text}>{`+${n}`}</LedText>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <Pressable onPress={onRun} accessibilityRole="button" style={({ pressed }) => [s.runBtn, pressed && { opacity: 0.8 }]}>
            <LedText size={32} trim="label" color="#0B0B0B" tracking={1}>{current.button.toUpperCase()}</LedText>
          </Pressable>
        )}
        <View style={s.actions}>
          <Pressable onPress={onUndo} disabled={!canUndo} accessibilityRole="button" style={[s.action, !canUndo && { opacity: 0.35 }]}>
            <Ionicons name="arrow-undo" size={18} color={UI.text} />
            <Text style={s.actionText}>{labels.undo.toUpperCase()}</Text>
          </Pressable>
          {skipLabel && (
            <Pressable onPress={onSkip} accessibilityRole="button" style={s.action}>
              <Text style={s.actionText}>{skipLabel.toUpperCase()}</Text>
              <Ionicons name="play-forward" size={16} color={UI.text} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { gap: 12, paddingTop: 8 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stage: { color: LED.verde, fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  segs: { flexDirection: 'row', gap: 6 },
  seg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#2A2A2A', overflow: 'hidden' },
  segFill: { height: '100%', backgroundColor: LED.verde },
  clockRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  limit: { color: UI.muted, fontSize: 14 },
  list: { gap: 2 },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 8 },
  nowRow: { backgroundColor: '#1C1C1C' },
  stageLabel: { color: UI.text, fontSize: 14, fontWeight: '700', letterSpacing: 0.5, flex: 1 },
  stageValue: { color: UI.muted, fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  nowTag: { color: '#0B0B0B', backgroundColor: LED.verde, fontSize: 11, fontWeight: '800', letterSpacing: 1, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  card: { backgroundColor: '#141414', borderRadius: 16, borderWidth: 1.5, borderColor: '#3A3A3A', padding: 16, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bigRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  setLbl: { color: UI.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginLeft: 'auto', marginBottom: 10 },
  bar: { height: 8, borderRadius: 4, backgroundColor: '#2A2A2A', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: LED.verde },
  total: { color: UI.muted, fontSize: 14 },
  btns: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, height: 76, borderRadius: 12, borderWidth: 1.5, borderColor: '#4A4A4A', alignItems: 'center', justifyContent: 'center' },
  btnMain: { backgroundColor: LED.verde, borderColor: LED.verde },
  runBtn: { height: 96, borderRadius: 14, backgroundColor: LED.verde, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: 10, borderWidth: 1, borderColor: '#3A3A3A' },
  actionText: { color: UI.text, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
});
