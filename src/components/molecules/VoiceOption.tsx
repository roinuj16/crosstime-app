import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LedText, Tag } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

/** Uma voz da lista: nome, idioma, selo de "aprimorada" e o botão de escolha. */
export function VoiceOption({ title, sub, selected, badge, onPress }: { title: string; sub: string; selected: boolean; badge?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} style={s.row}>
      <View style={s.text}>
        <LedText size={21} trim="label" color={UI.text} numberOfLines={1}>{title}</LedText>
        <Text style={s.sub} numberOfLines={1}>{sub}</Text>
      </View>
      {!!badge && <Tag label={badge} variant="badge" color={LED.verde} />}
      <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? LED.verde : UI.muted} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  text: { flex: 1, minWidth: 0 },
  sub: { color: UI.muted, fontSize: 12.5 },
});
