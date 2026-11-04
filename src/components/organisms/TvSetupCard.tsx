import { StyleSheet, Text, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { WodList, type WodItem } from '@/components/molecules';
import { UI } from '@/theme/palette';
import { TV } from '@/theme/tv';

/** Cartão da direita na tela inicial: o WOD do dia, ou o convite para personalizar a TV. */
export function TvSetupCard({ title, lines, hint, u }: { title: string; lines: WodItem[]; hint?: string; u: number }) {
  return (
    <View style={[s.card, { borderRadius: 20 * u, padding: 28 * u, gap: 18 * u, borderWidth: Math.max(1, u) }]}>
      <LedText size={30 * u} variant="display" trim="label" tracking={1.5 * u} color={UI.text}>{title.toUpperCase()}</LedText>
      {lines.length ? <WodList lines={lines} size={36 * u} u={u} /> : <Text style={{ fontSize: 17 * u, lineHeight: 24 * u, color: TV.soft }}>{hint}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: TV.panel, borderColor: TV.line },
});
