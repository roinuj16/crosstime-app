import { StyleSheet, Text } from 'react-native';
import { UI } from '@/theme/palette';

/** Título pequeno em maiúsculas que separa grupos numa lista. */
export function SectionTitle({ title }: { title: string }) {
  return <Text style={s.title}>{title.toUpperCase()}</Text>;
}

const s = StyleSheet.create({
  title: { color: UI.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.6, marginTop: 22, marginBottom: 2 },
});
