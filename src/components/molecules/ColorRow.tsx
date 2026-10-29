import { ScrollView, StyleSheet, View } from 'react-native';
import { LedText, Swatch } from '@/components/atoms';
import { UI } from '@/theme/palette';

export interface ColorOption<K extends string> { key: K; hex: string; name: string }

/** Uma fase (no nome, na cor atual) e a fileira de cores para escolher. */
export function ColorRow<K extends string>({ label, color, options, value, onChange }: {
  label: string; color: string; options: ColorOption<K>[]; value: K; onChange: (k: K) => void;
}) {
  return (
    <View style={s.row}>
      <LedText size={20} trim="label" color={color} tracking={0.5}>{label}</LedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.swatches}>
        {options.map((o) => (
          <Swatch key={o.key} color={o.hex} selected={value === o.key} onPress={() => onChange(o.key)} label={`${label}: ${o.name}`} />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line, gap: 10 },
  swatches: { gap: 10, paddingRight: 8 },
});
