import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

export interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  /** nome lido pelo leitor de tela */
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  /** largura da área de toque (padrão 44; o hitSlop completa os 44 pt quando for menor) */
  width?: number;
  /** bolinha de status no canto do ícone (ex.: verde = TV conectada) */
  badge?: string;
}

/** Ícone tocável com área de toque de 44 pt (padrão de acessibilidade). */
export function IconButton({ name, color, label, onPress, disabled, size = 24, width = 44, badge }: IconButtonProps) {
  return (
    <Pressable style={[s.hit, { width }]} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      <View>
        <Ionicons name={name} size={size} color={color} />
        {!!badge && <View style={[s.badge, { backgroundColor: badge, shadowColor: badge }]} />}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  hit: { height: 44, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -2, right: -4, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: '#0B0B0B', shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
});
