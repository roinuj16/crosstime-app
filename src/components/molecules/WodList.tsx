import { StyleSheet, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

export interface WodItem { main: string; note: string }

/** O treino do dia, uma linha por movimento; o peso/distância fica menor e cinza. */
export function WodList({ lines, size, u }: { lines: WodItem[]; size: number; u: number }) {
  return (
    <View style={{ gap: 10 * u }}>
      {lines.map((l, i) => (
        <View key={i} style={s.line}>
          <LedText size={size} trim="label" color={UI.text}>{l.main}</LedText>
          {!!l.note && <LedText size={size * 0.68} trim="label" color={UI.muted} style={{ marginLeft: size * 0.25 }}>{l.note}</LedText>}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
});
