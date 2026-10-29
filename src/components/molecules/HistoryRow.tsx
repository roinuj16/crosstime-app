import { StyleSheet, Text, View } from 'react-native';
import { LedText, Tag } from '@/components/atoms';
import { UI } from '@/theme/palette';

/** Um treino feito: nome, quando, quanto durou e se foi até o fim. */
export function HistoryRow({ title, when, duration, status, statusColor }: { title: string; when: string; duration: string; status: string; statusColor: string }) {
  return (
    <View style={s.row}>
      <View style={s.text}>
        <Text style={s.title} numberOfLines={1}>{title}</Text>
        <Text style={s.when}>{when}</Text>
      </View>
      <View style={s.side}>
        <LedText variant="display" tabular size={22} trim="digits" color={UI.text}>{duration}</LedText>
        <Tag label={status} variant="outline" color={statusColor} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  text: { flex: 1, minWidth: 0 },
  title: { color: UI.text, fontWeight: '700', fontSize: 15 },
  when: { color: UI.muted, fontSize: 12.5, marginTop: 2 },
  side: { alignItems: 'flex-end', gap: 4 },
});
