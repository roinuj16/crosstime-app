import { StyleSheet, Text, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { TvStat, type ColoredPiece } from '@/components/molecules';
import { LED, UI } from '@/theme/palette';

/** Tela inicial da TV: o próximo treino, o resumo e "OK para começar". */
export function TvIdle({ label, title, color, glow, stats, okHint, u }: {
  label: string; title: string; color: string; glow: string; stats: { label: string; value: ColoredPiece[] }[]; okHint: string; u: number;
}) {
  return (
    <View style={[s.wrap, { gap: 8 * u }]}>
      <LedText size={34 * u} tracking={3 * u} color={UI.muted}>{label.toUpperCase()}</LedText>
      <LedText size={96 * u} variant="display" trim="label" color={color} glow={glow} glowRadius={28 * u} numberOfLines={2}>{title.toUpperCase()}</LedText>
      <View style={[s.stats, { gap: 36 * u, marginTop: 18 * u }]}>
        {stats.map((st) => <TvStat key={st.label} label={st.label} value={st.value} u={u} />)}
      </View>
      <View style={[s.ok, { gap: 14 * u, marginTop: 34 * u }]}>
        <Text style={[s.chip, { fontSize: 30 * u, borderRadius: 10 * u, paddingHorizontal: 16 * u, paddingVertical: 4 * u }]}>OK</Text>
        <Text style={{ color: UI.text, fontSize: 22 * u }}>{okHint}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  stats: { flexDirection: 'row', flexWrap: 'wrap' },
  ok: { flexDirection: 'row', alignItems: 'center' },
  chip: { color: UI.ink, backgroundColor: LED.verde, fontWeight: '800', overflow: 'hidden' },
});

