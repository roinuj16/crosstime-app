import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LedText, Tag } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

/** Cartão de treino especial na lista: nome, data, situação e vagas. */
export function EventCard({ title, when, status, statusColor, detail, onPress }: {
  title: string; when: string; status: string; statusColor: string; detail?: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.card, pressed && { opacity: 0.8 }]}>
      <View style={s.body}>
        <LedText size={26} trim="label" color={UI.text} tracking={1}>{title.toUpperCase()}</LedText>
        <Text style={s.when}>{when}</Text>
        <View style={s.tags}>
          <Tag label={status.toUpperCase()} variant="outline" color={statusColor} />
          {!!detail && <Text style={s.detail}>{detail}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={UI.muted} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#161616', borderRadius: 14, borderWidth: 1, borderColor: UI.line, padding: 14, marginTop: 10 },
  body: { flex: 1, gap: 6 },
  when: { color: UI.muted, fontSize: 14 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  detail: { color: LED.ambar, fontSize: 13, fontWeight: '600' },
});
