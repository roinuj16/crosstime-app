import { StyleSheet, Text, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

export interface ColoredPiece { text: string; color: string }

/** Rótulo pequeno em cima e o valor grande embaixo (ex.: TRABALHO / DESCANSO · 20s / 10s). */
export function TvStat({ label, value, u }: { label: string; value: ColoredPiece[]; u: number }) {
  return (
    <View style={s.stat}>
      <Text style={[s.label, { fontSize: 16 * u, letterSpacing: 1.5 * u }]}>{label.toUpperCase()}</Text>
      <View style={s.value}>
        {value.map((p, i) => <LedText key={i} variant="display" tabular size={64 * u} trim="digits" color={p.color}>{p.text}</LedText>)}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  stat: { flexDirection: 'column' },
  label: { color: UI.muted },
  value: { flexDirection: 'row', alignItems: 'flex-end' },
});
