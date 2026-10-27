import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Row, Section, Segmented, SheetHeader, Toggle } from '@/components/ui';
import { useStrings } from '@/hooks/useStrings';
import { useApp, type Settings } from '@/store/useApp';
import { hex, UI, type ColorRole } from '@/theme/palette';

export default function SettingsScreen() {
  const { t } = useStrings();
  const st = useApp((s) => s.settings);
  const colors = useApp((s) => s.colors);
  const set = useApp((s) => s.setSetting);
  const S = t.settings;
  const tog = (key: keyof Settings, label: string, hint?: string, disabled?: boolean) => (
    <Toggle label={label} hint={hint} value={st[key] as boolean} onChange={(v) => set(key, v as never)} disabled={disabled} />
  );
  const stack = (label: string, control: React.ReactNode, hint?: string) => (
    <View style={styles.stacked}>
      <Row label={label} hint={hint} />
      <View style={styles.control}>{control}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <SheetHeader title={S.title} right={<Button label={S.done} kind="primary" onPress={() => router.back()} />} />
      <ScrollView contentContainerStyle={styles.body}>
        <Row
          label={S.colors} hint={S.colorsHint} onPress={() => router.push('/colors')}
          right={
            <View style={styles.swatches}>
              {(['prepare', 'work', 'rest', 'cooldown'] as ColorRole[]).map((r) => <View key={r} style={[styles.dot, { backgroundColor: hex(colors[r]) }]} />)}
              <Ionicons name="chevron-forward" size={20} color={UI.muted} />
            </View>
          }
        />

        <Section title={S.general} />
        {stack(S.language, <Segmented value={st.language} onChange={(v) => set('language', v)} options={[{ value: 'auto', label: S.languageAuto }, { value: 'pt', label: 'Português' }, { value: 'en', label: 'English' }]} />)}
        {stack(S.timeFormat, <Segmented value={st.timeFormat} onChange={(v) => set('timeFormat', v)} options={[{ value: '00:00', label: '00:00' }, { value: '0:00', label: '0:00' }]} />)}

        <Text style={styles.note}>{S.phase3}</Text>

        <Section title={S.sound} />
        {tog('sound', S.soundOn, S.soundOnHint)}
        {stack(S.soundStyle, <Segmented value={st.soundScheme} onChange={(v) => set('soundScheme', v)} options={(Object.keys(S.styles) as Settings['soundScheme'][]).map((k) => ({ value: k, label: S.styles[k] }))} />)}
        {stack(S.volume, <Segmented value={st.volume} onChange={(v) => set('volume', v)} options={[0.25, 0.5, 0.75, 1].map((v) => ({ value: v, label: `${v * 100}%` }))} />)}
        {tog('countdown', S.countdown, S.countdownHint)}
        {tog('tick', S.tick, S.tickHint)}

        <Section title={S.voice} />
        {tog('voice', S.voiceOn, S.voiceOnHint)}
        {stack(S.voiceLang, <Segmented value={st.voiceLang} onChange={(v) => set('voiceLang', v)} options={[{ value: 'en', label: 'English' }, { value: 'pt', label: 'Português' }]} />, S.voiceLangHint)}
        {tog('sayRound', S.sayRound, `"${(st.voiceLang === 'pt' ? 'Trabalho, round 2' : 'Work, round 2')}"`)}
        {stack(S.voiceRate, <Segmented value={st.voiceRate} onChange={(v) => set('voiceRate', v)} options={[{ value: 0.85, label: S.slow }, { value: 1, label: S.normal }, { value: 1.15, label: S.fast }]} />)}

        <Section title={S.device} />
        {tog('vibrate', S.vibrate)}
        {tog('keepAwake', S.keepAwake, S.keepAwakeHint)}
        {tog('flash', S.flash, S.flashHint)}
        {tog('duckOthers', S.duck, S.duckHint)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#161616' },
  body: { paddingHorizontal: 16, paddingBottom: 48 },
  stacked: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line, paddingBottom: 12 },
  control: { marginTop: -4 },
  swatches: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  note: { color: UI.muted, fontSize: 13, backgroundColor: '#202020', borderRadius: 10, padding: 10, marginTop: 18 },
});
