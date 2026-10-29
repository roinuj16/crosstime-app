import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { LED, UI } from '@/theme/palette';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  kind?: 'plain' | 'primary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

/** Botão de texto: comum, principal (verde) ou perigoso (vermelho). */
export function Button({ label, onPress, kind = 'plain', disabled, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={({ pressed }) => [s.btn, kind === 'primary' && s.primary, kind === 'danger' && s.danger, (pressed || disabled) && { opacity: disabled ? 0.4 : 0.75 }, style]}
    >
      <Text style={[s.text, kind === 'primary' && { color: UI.ink }, kind === 'danger' && { color: LED.vermelho }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: '#262626' },
  primary: { backgroundColor: LED.verde },
  danger: { backgroundColor: 'rgba(255,42,26,0.12)' },
  text: { color: UI.text, fontWeight: '600', fontSize: 14 },
});
