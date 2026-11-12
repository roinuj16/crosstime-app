import { StyleSheet, Text, View } from 'react-native';
import { LedText, Tag } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

export interface RankCell { label: string; value: string; frac: number; state: 'done' | 'now' | 'next' }
export interface RankRow { key: string; name: string; vest: boolean; status: string; detail?: string; progress: number; done: boolean; dim?: boolean; cells?: RankCell[] }

/**
 * Resultado / acompanhamento no celular: posição, nome, situação (com série e rodada, se
 * quebrou) e quanto já fez em cada etapa.
 */
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
              <View style={s.right}>
                {!!r.detail && <Text style={s.detail}>{r.detail}</Text>}
                <Text style={[s.status, r.done && { color: LED.verde }]} numberOfLines={1}>{r.status}</Text>
              </View>
            </View>
            <View style={s.cells}>
              {(r.cells ?? [{ label: '', value: '', frac: r.progress, state: r.done ? 'done' : 'now' } as RankCell]).map((c, j) => (
                <View key={j} style={s.cell}>
                  {!!c.label && <Text style={[s.cellText, c.state === 'done' && { color: LED.verde }, c.state === 'now' && { color: UI.text }]} numberOfLines={1}>{c.value || c.label}</Text>}
                  <View style={s.track}><View style={[s.fill, { width: `${Math.round(c.frac * 100)}%`, backgroundColor: c.state === 'done' ? LED.verde : LED.ambar }]} /></View>
                </View>
              ))}
            </View>
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
  right: { marginLeft: 'auto', alignItems: 'flex-end' },
  detail: { color: LED.ambar, fontSize: 11, fontWeight: '700' },
  status: { color: UI.muted, fontSize: 14, fontVariant: ['tabular-nums'] },
  cells: { flexDirection: 'row', gap: 4 },
  cell: { flex: 1, gap: 2 },
  cellText: { color: UI.muted, fontSize: 10.5, fontWeight: '700', fontVariant: ['tabular-nums'], textAlign: 'center' },
  track: { height: 5, borderRadius: 3, backgroundColor: '#2A2A2A', overflow: 'hidden' },
  fill: { height: '100%' },
});
