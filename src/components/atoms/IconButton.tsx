import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

export interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  /** nome lido pelo leitor de tela */
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
}

/** Ícone tocável com área de toque de 44 pt (padrão de acessibilidade). */
export function IconButton({ name, color, label, onPress, disabled, size = 24 }: IconButtonProps) {
  return (
    <Pressable style={s.hit} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  hit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
