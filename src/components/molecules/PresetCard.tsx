import { Pressable, StyleSheet, View } from 'react-native';
import { Dot, LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

/** Combinação pronta de cores: as bolinhas das fases e o nome. */
export function PresetCard({ name, colors, selected, onPress }: { name: string; colors: string[]; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} style={[s.card, selected && s.sel]}>
      <View style={s.dots}>{colors.map((c, i) => <Dot key={i} color={c} />)}</View>
      <LedText size={18} trim="label" color={UI.text}>{name}</LedText>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { flexGrow: 1, flexBasis: 100, padding: 12, borderRadius: 14, backgroundColor: '#202020', borderWidth: 2, borderColor: 'transparent', gap: 8 },
  sel: { borderColor: '#F2F2F2' },
  dots: { flexDirection: 'row', gap: 5 },
});
