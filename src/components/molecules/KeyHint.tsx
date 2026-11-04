import { StyleSheet, Text, View } from 'react-native';
import { KeyCap } from '@/components/atoms';
import { UI } from '@/theme/palette';

/** Uma dica de controle: as teclas e o que elas fazem (ex.: [←][→] pular fase). */
export function KeyHint({ keys, label, size = 18 }: { keys: string[]; label: string; size?: number }) {
  return (
    <View style={[s.row, { gap: size * 0.35 }]}>
      {keys.map((k) => <KeyCap key={k} label={k} size={size} />)}
      <Text style={[s.label, { fontSize: size }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { color: UI.muted, marginLeft: 4 },
});
