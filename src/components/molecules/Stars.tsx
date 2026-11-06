import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { LED, UI } from '@/theme/palette';

/** Nota de 1 a 5. Tocar na estrela marcada de novo tira a nota. */
export function Stars({ value, onChange, label }: { value: number | null; onChange: (v: number | null) => void; label: (n: number) => string }) {
  return (
    <View style={s.row} accessibilityRole="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = value != null && n <= value;
        return (
          <Pressable key={n} onPress={() => onChange(value === n ? null : n)} hitSlop={4} style={s.star}
            accessibilityRole="radio" accessibilityState={{ selected: value === n }} accessibilityLabel={label(n)}>
            <Ionicons name={on ? 'star' : 'star-outline'} size={34} color={on ? LED.ambar : UI.muted} />
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginTop: 6 },
  star: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
