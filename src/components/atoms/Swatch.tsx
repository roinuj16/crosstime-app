import { Pressable, StyleSheet } from 'react-native';

export interface SwatchProps {
  color: string;
  selected: boolean;
  onPress: () => void;
  /** nome lido pelo leitor de tela, ex.: "Trabalho: Verde" */
  label: string;
}

/** Cor escolhível: um círculo com anel branco quando selecionado. */
export function Swatch({ color, selected, onPress, label }: SwatchProps) {
  return (
    <Pressable
      onPress={onPress} hitSlop={4}
      accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={label}
      style={[s.sw, { backgroundColor: color }, selected && s.sel]}
    />
  );
}

const s = StyleSheet.create({
  sw: { width: 34, height: 34, borderRadius: 17 },
  sel: { borderWidth: 3, borderColor: '#FFFFFF' },
});
