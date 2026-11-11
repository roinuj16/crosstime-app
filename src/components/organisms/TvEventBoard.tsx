import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { LedText } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';
import { TV } from '@/theme/tv';

export interface TvEventRow { key: string; name: string; vest: boolean; status: string; progress: number; done: boolean; pos: number | null }

/**
 * TV do treino especial: todos os alunos com a etapa atual e a barra de progresso, ao vivo.
 * Até 8 alunos numa coluna, até 20 em duas, depois em três; a letra se ajusta à altura.
 * `big`: número grande no meio (contagem regressiva); `banner`: aviso no topo da lista.
 */
export function TvEventBoard({ rows, u, big, banner, vestLabel }: { rows: TvEventRow[]; u: number; big?: string | null; banner?: string | null; vestLabel: string }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const n = Math.max(1, rows.length);
  const cols = n <= 8 ? 1 : n <= 20 ? 2 : 3;
  const perCol = Math.ceil(n / cols);
  const rowH = box.h ? Math.min(92 * u, box.h / perCol) : 60 * u;
  const font = Math.max(14 * u, Math.min(38 * u, rowH * 0.42));
  const columns = Array.from({ length: cols }, (_, c) => rows.slice(c * perCol, (c + 1) * perCol));

  if (big) {
    return (
      <View style={s.center}>
        <LedText variant="display" size={360 * u} tabular trim="digits" color={LED.verde} glow={LED.verde}>{big}</LedText>
      </View>
    );
  }
  return (
    <View style={[s.root, { paddingHorizontal: 32 * u, paddingVertical: 14 * u, gap: 10 * u }]}>
      {!!banner && <LedText size={30 * u} trim="label" tracking={2 * u} color={LED.ambar}>{banner.toUpperCase()}</LedText>}
      <View style={[s.grid, { gap: 28 * u }]} onLayout={onLayout}>
        {columns.map((col, c) => (
          <View key={c} style={s.col}>
            {col.map((r) => (
              <View key={r.key} style={[s.row, { height: rowH, gap: 4 * u, borderBottomWidth: Math.max(1, u) }]}>
                <View style={[s.line, { gap: 12 * u }]}>
                  <LedText size={font * 0.9} tabular trim="digits" color={r.done && r.pos != null && r.pos <= 3 ? LED.ambar : UI.muted} style={{ width: font * 1.3 }}>
                    {r.pos != null ? String(r.pos) : ''}
                  </LedText>
                  <LedText size={font} trim="label" color={UI.text} numberOfLines={1} style={s.name}>{r.name.toUpperCase()}</LedText>
                  {r.vest && <LedText size={font * 0.55} trim="label" tracking={u} color={LED.ambar}>{vestLabel.toUpperCase()}</LedText>}
                  <LedText size={font * 0.85} tabular trim="label" color={r.done ? LED.verde : UI.text} numberOfLines={1} style={s.status}>{r.status.toUpperCase()}</LedText>
                </View>
                <View style={[s.track, { height: Math.max(4, 8 * u), borderRadius: 4 * u, marginLeft: font * 1.3 + 12 * u }]}>
                  <View style={{ width: `${Math.round(r.progress * 100)}%`, height: '100%', backgroundColor: r.done ? LED.verde : LED.ambar }} />
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: { flex: 1, flexDirection: 'row', minHeight: 0 },
  col: { flex: 1, minWidth: 0 },
  row: { justifyContent: 'center', borderBottomColor: TV.line },
  line: { flexDirection: 'row', alignItems: 'baseline' },
  name: { flexShrink: 1 },
  status: { marginLeft: 'auto' },
  track: { backgroundColor: TV.track, overflow: 'hidden' },
});
