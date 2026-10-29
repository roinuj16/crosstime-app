import { StyleSheet, Text } from 'react-native';
import { UI } from '@/theme/palette';

export interface TagProps {
  label: string;
  /**
   * solid = etiqueta cinza (modo do treino); dashed = contorno tracejado (exemplo);
   * outline = pílula colorida (Completo/Parcial); badge = selo colorido pequeno (voz aprimorada)
   */
  variant?: 'solid' | 'dashed' | 'outline' | 'badge';
  color?: string;
}

/** Etiqueta curta. */
export function Tag({ label, variant = 'solid', color }: TagProps) {
  const tint = color ? { color, borderColor: color } : null;
  return <Text style={[s[variant], tint]}>{label}</Text>;
}

const chip = { color: UI.muted, fontSize: 10.5, fontWeight: '700', letterSpacing: 1, backgroundColor: '#2C2C2C', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' } as const;
const s = StyleSheet.create({
  solid: chip,
  dashed: { ...chip, backgroundColor: 'transparent', borderWidth: 1, borderColor: UI.line, borderStyle: 'dashed' },
  outline: { fontSize: 11, fontWeight: '700', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, overflow: 'hidden' },
  badge: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 },
});
