import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LED, UI } from '@/theme/palette';

/** Escolha única entre poucas opções, em pílulas. */
export function Segmented<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={s.seg} accessibilityRole="radiogroup">
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable key={String(o.value)} onPress={() => onChange(o.value)} accessibilityRole="radio" accessibilityState={{ selected: sel }} style={[s.item, sel && s.sel]}>
            <Text style={[s.text, sel && { color: UI.ink }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  seg: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  item: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#262626' },
  sel: { backgroundColor: LED.verde },
  text: { color: UI.text, fontSize: 13.5, fontWeight: '600' },
});
