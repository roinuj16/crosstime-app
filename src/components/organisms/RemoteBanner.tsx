import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LED, UI } from '@/theme/palette';

/** Faixa no topo do celular do coach: a qual TV ele está ligado e o botão de desconectar. */
export function RemoteBanner({ title, status, online, disconnect, onDisconnect }: { title: string; status: string; online: boolean; disconnect: string; onDisconnect: () => void }) {
  return (
    <View style={s.bar}>
      <Ionicons name="tv-outline" size={18} color={online ? LED.verde : UI.muted} />
      <Text style={s.text} numberOfLines={1}><Text style={s.title}>{title}</Text>  ·  {status}</Text>
      <Pressable onPress={onDisconnect} accessibilityRole="button" hitSlop={8}><Text style={s.action}>{disconnect}</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#14201A', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  text: { flex: 1, color: UI.muted, fontSize: 13 },
  title: { color: UI.text, fontWeight: '700' },
  action: { color: LED.verde, fontWeight: '700', fontSize: 13 },
});
