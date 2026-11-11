import { StyleSheet, Text, View } from 'react-native';
import { LedText, ProgressBar, Tag } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

export interface RankRow { key: string; name: string; vest: boolean; status: string; progress: number; done: boolean; dim?: boolean }

/** Resultado / acompanhamento no celular: posição, nome, situação e barra de progresso. */
export function EventRanking({ rows, vestLabel }: { rows: RankRow[]; vestLabel: string }) {
  return (
    <View style={s.list}>
      {rows.map((r, i) => (
        <View key={r.key} style={[s.row, r.dim && { opacity: 0.55 }]}>
          <LedText size={24} trim="digits" tabular color={i < 3 && r.done ? LED.ambar : UI.muted} style={s.pos}>{String(i + 1)}</LedText>
          <View style={s.body}>
            <View style={s.top}>
              <Text style={s.name} numberOfLines={1}>{r.name}</Text>
              {r.vest && <Tag label={vestLabel.toUpperCase()} variant="badge" color={LED.ambar} />}
              <Text style={[s.status, r.done && { color: LED.verde }]} numberOfLines={1}>{r.status}</Text>
            </View>
            <ProgressBar progress={r.progress} color={r.done ? LED.verde : LED.ambar} height={6} width="100%" />
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  list: { marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  pos: { width: 30, textAlign: 'center' },
  body: { flex: 1, gap: 6 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: UI.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  status: { color: UI.muted, fontSize: 14, marginLeft: 'auto', fontVariant: ['tabular-nums'] },
});
