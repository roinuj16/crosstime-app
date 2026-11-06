import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { LED, UI } from '@/theme/palette';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  /** ghost: só o texto, sem fundo (ações secundárias, links) */
  kind?: 'plain' | 'primary' | 'danger' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Botão de texto: comum, principal (verde), perigoso (vermelho) ou só texto (ghost). */
export function Button({ label, onPress, kind = 'plain', disabled, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={({ pressed }) => [s.btn, kind === 'primary' && s.primary, kind === 'danger' && s.danger, kind === 'ghost' && s.ghost, (pressed || disabled) && { opacity: disabled ? 0.4 : 0.75 }, style]}
    >
      <Text style={[s.text, kind === 'primary' && { color: UI.ink }, kind === 'danger' && { color: LED.vermelho }, kind === 'ghost' && { color: UI.muted, fontWeight: '500' }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: '#262626' },
  primary: { backgroundColor: LED.verde },
  danger: { backgroundColor: 'rgba(255,42,26,0.12)' },
  ghost: { backgroundColor: 'transparent' },
  text: { color: UI.text, fontWeight: '600', fontSize: 14 },
});
