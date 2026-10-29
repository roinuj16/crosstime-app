import { StyleSheet, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

/** Número grande com legenda (ex.: "4 ROUNDS RESTANTES"). Sem `stat`, guarda o espaço vazio. */
export function Stat({ stat, color }: { stat: { value: number; label: string } | null; color: string }) {
  return (
    <View style={[s.stat, !stat && { opacity: 0 }]} accessible={!!stat} accessibilityLabel={stat ? `${stat.value} ${stat.label}` : undefined}>
      <LedText variant="display" tabular size={64} trim="digits" color={color} style={s.num}>{stat ? String(stat.value) : '0'}</LedText>
      <LedText size={15} color={UI.text} tracking={1} style={s.label}>{stat ? stat.label.toUpperCase() : ' '}</LedText>
    </View>
  );
}

const s = StyleSheet.create({
  stat: { alignItems: 'center', width: 100 },
  num: { marginBottom: 4 },
  label: { textAlign: 'center' },
});
