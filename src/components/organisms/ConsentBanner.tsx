import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

/** Aviso de estatísticas de uso (LGPD): aceitar ou recusar, com link para a política. */
export function ConsentBanner({ text, accept, decline, policy, onAccept, onDecline, onPolicy }: {
  text: string; accept: string; decline: string; policy: string; onAccept: () => void; onDecline: () => void; onPolicy: () => void;
}) {
  return (
    <View style={s.card} accessibilityRole="alert">
      <Text style={s.text}>{text}</Text>
      <View style={s.row}>
        <Pressable onPress={onPolicy} accessibilityRole="link" hitSlop={6} style={s.link}><Text style={s.linkText}>{policy}</Text></Pressable>
        <Button label={decline} onPress={onDecline} />
        <Button label={accept} kind="primary" onPress={onAccept} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { position: 'absolute', left: 12, right: 12, bottom: 12, zIndex: 20, backgroundColor: '#1E1E1E', borderRadius: 14, borderWidth: 1, borderColor: UI.line, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 },
  text: { color: UI.text, fontSize: 13.5, lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' },
  link: { marginRight: 'auto' },
  linkText: { color: LED.verde, fontSize: 13, fontWeight: '600' },
});
