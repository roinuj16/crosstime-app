import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { UI } from '@/theme/palette';
import { Row } from './Row';

/** Ajuste com o rótulo em cima e o controle (ex.: Segmented) na linha de baixo. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View style={s.field}>
      <Row label={label} hint={hint} flat />
      <View>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  field: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line, paddingBottom: 12 },
});
