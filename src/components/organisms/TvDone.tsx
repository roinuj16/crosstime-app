import { StyleSheet, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

/** Fim do treino na TV: "Treino concluído", o tempo e "Mandou bem!". */
export function TvDone({ label, time, message, color, glow, u }: { label: string; time: string; message: string; color: string; glow: string; u: number }) {
  return (
    <View style={[s.wrap, { gap: 10 * u }]}>
      <LedText size={72 * u} variant="display" trim="label" tracking={4 * u} color={color} glow={glow} glowRadius={30 * u}>{label.toUpperCase()}</LedText>
      <LedText size={300 * u} variant="display" tabular trim="digits" color={color} glow={glow} glowRadius={60 * u}>{time}</LedText>
      <LedText size={44 * u} tracking={3 * u} color={UI.text} style={{ marginTop: 10 * u }}>{message.toUpperCase()}</LedText>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
