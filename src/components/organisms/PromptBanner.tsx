import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/atoms';
import { UI } from '@/theme/palette';

/** Convite discreto no rodapé (ex.: "Como foi o treino?"), com uma ação e um X para fechar. */
export function PromptBanner({ text, action, close, onAction, onClose }: { text: string; action: string; close: string; onAction: () => void; onClose: () => void }) {
  return (
    <View style={s.card}>
      <Text style={s.text}>{text}</Text>
      <Button label={action} kind="primary" onPress={onAction} />
      <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={close} style={s.x}>
        <Ionicons name="close" size={20} color={UI.muted} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: { position: 'absolute', left: 12, right: 12, bottom: 12, zIndex: 20, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1E1E1E', borderRadius: 14, borderWidth: 1, borderColor: UI.line, paddingVertical: 10, paddingLeft: 14, paddingRight: 6, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 },
  text: { flex: 1, color: UI.text, fontSize: 13.5, lineHeight: 19 },
  x: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
