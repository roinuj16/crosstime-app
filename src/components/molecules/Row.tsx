import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

export interface RowProps {
  label: string;
  hint?: string;
  /** controle à direita (chave, stepper, seta…) */
  right?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** sem linha embaixo (quando o controle fica na linha de baixo) */
  flat?: boolean;
}

/** Linha de lista: rótulo, explicação curta e um controle à direita. */
export function Row({ label, hint, right, onPress, disabled, flat }: RowProps) {
  const body = (
    <View style={[s.row, flat && s.flat, disabled && { opacity: 0.45 }]}>
      <View style={s.text}>
        <LedText size={21} trim="label" color={UI.text} tracking={0.5}>{label}</LedText>
        {!!hint && <Text style={s.hint}>{hint}</Text>}
      </View>
      {right}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button">{body}</Pressable> : body;
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  flat: { borderBottomWidth: 0, paddingBottom: 8 },
  text: { flex: 1, minWidth: 0 },
  hint: { color: UI.muted, fontSize: 12.5, marginTop: 1 },
});
