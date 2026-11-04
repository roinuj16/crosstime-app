import { StyleSheet, Text } from 'react-native';
import { UI } from '@/theme/palette';

/** Tecla desenhada (ex.: "OK", "←"), para as dicas de controle remoto. */
export function KeyCap({ label, size = 18 }: { label: string; size?: number }) {
  return <Text style={[s.key, { fontSize: size, minWidth: size * 2, borderRadius: size * 0.4, paddingHorizontal: size * 0.4 }]}>{label}</Text>;
}

const s = StyleSheet.create({
  key: { color: UI.text, fontWeight: '700', textAlign: 'center', borderWidth: 1.5, borderColor: '#4A4A4A', backgroundColor: '#1C1C1C', overflow: 'hidden' },
});
