import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, SheetHeader } from '@/components/ui';
import { useStrings } from '@/hooks/useStrings';
import { STRINGS } from '@/i18n/strings';
import { speak } from '@/services/feedback';
import { forgetVoices, listVoices, voiceScore, type VoiceInfo } from '@/services/voices';
import { useApp } from '@/store/useApp';
import { LED, UI } from '@/theme/palette';
import { FONT, teko } from '@/theme/type';

export default function VoicesScreen() {
  const { t } = useStrings();
  const st = useApp((s) => s.settings);
  const set = useApp((s) => s.setSetting);
  const [voices, setVoices] = useState<VoiceInfo[] | null>(null);

  // recarrega ao voltar para a tela (a pessoa pode ter baixado uma voz nova)
  useFocusEffect(useCallback(() => {
    forgetVoices();
    listVoices(st.voiceLang).then(setVoices);
  }, [st.voiceLang]));

  const sample = STRINGS[st.voiceLang].say;
  const choose = (id: string) => {
    set('voiceId', id);
    speak(`${sample.prepare}. ${sample.workRound(1)}. ${sample.rest}`, { lang: st.voiceLang, voiceId: id, rate: st.voiceRate, volume: st.volume });
  };

  const row = (id: string, title: string, sub: string, good: boolean) => {
    const sel = st.voiceId === id;
    return (
      <Pressable key={id || 'auto'} onPress={() => choose(id)} accessibilityRole="radio" accessibilityState={{ selected: sel }} style={styles.row}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={1}>{title}</Text>
          <Text style={styles.sub} numberOfLines={1}>{sub}</Text>
        </View>
        {good && <Text style={styles.badge}>{t.voices.enhanced.toUpperCase()}</Text>}
        <Ionicons name={sel ? 'radio-button-on' : 'radio-button-off'} size={22} color={sel ? LED.verde : UI.muted} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <SheetHeader title={t.voices.title} onBack={() => router.back()} right={<Button label={t.settings.done} kind="primary" onPress={() => router.back()} />} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.hint}>{t.voices.listen}</Text>
        {row('', t.voices.auto, voices?.[0]?.name ?? '—', false)}
        {voices?.length === 0 && <Text style={styles.empty}>{t.voices.empty}</Text>}
        {voices?.map((v) => row(v.identifier, v.name, v.language, voiceScore(v, st.voiceLang) >= 10))}
        <Text style={styles.help}>{t.voices.help}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#161616' },
  body: { paddingHorizontal: 16, paddingBottom: 48 },
  hint: { color: UI.muted, fontSize: 14, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  name: { color: UI.text, fontFamily: FONT.label, ...teko(21) },
  sub: { color: UI.muted, fontSize: 12.5 },
  badge: { color: LED.verde, fontSize: 10.5, fontWeight: '700', letterSpacing: 1, borderWidth: 1, borderColor: LED.verde, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 },
  empty: { color: UI.muted, paddingVertical: 12 },
  help: { color: UI.muted, fontSize: 13, lineHeight: 19, backgroundColor: '#202020', borderRadius: 10, padding: 12, marginTop: 20 },
});
