import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Button, SectionTitle } from '@/components/atoms';
import { Field, LinkRow, Segmented, Toggle } from '@/components/molecules';
import { SheetTemplate } from '@/components/templates';
import { cuesFor } from '@/core/cues';
import { buildSegments, DEFAULTS } from '@/core/engine';
import { useStrings } from '@/hooks/useStrings';
import { STRINGS } from '@/i18n/strings';
import { configureAudio, perform } from '@/services/feedback';
import { hasRecordedVoice } from '@/services/voiceClips';
import { pickVoice } from '@/services/voices';
import { useApp, type Settings } from '@/store/useApp';
import { hex, type ColorRole } from '@/theme/palette';

const VOLUMES = [0.25, 0.5, 0.75, 1];

/** Página de ajustes: som, voz, aparelho e o link para as cores. */
export default function SettingsScreen() {
  const { t } = useStrings();
  const st = useApp((s) => s.settings);
  const colors = useApp((s) => s.colors);
  const set = useApp((s) => s.setSetting);
  const S = t.settings;
  const [, requestCamera] = useCameraPermissions();
  const [voiceName, setVoiceName] = useState('');
  useEffect(() => { pickVoice(st.voiceLang, st.voiceId).then((v) => setVoiceName(v?.name ?? '')); }, [st.voiceLang, st.voiceId]);

  const recorded = hasRecordedVoice(st.voiceLang);
  const systemVoice = !recorded || st.voiceSource === 'system';

  const tog = (key: keyof Settings, label: string, hint?: string, disabled?: boolean) => (
    <Toggle label={label} hint={hint} value={st[key] as boolean} onChange={(v) => set(key, v as never)} disabled={disabled} />
  );

  /** Liga a lanterna só depois de o sistema liberar a câmera. */
  const toggleFlash = async (on: boolean) => {
    if (!on) { set('flash', false); return; }
    const res = await requestCamera();
    if (res.granted) set('flash', true);
    else Alert.alert(S.flash, S.flashDenied);
  };

  /** Toca uma troca de fase de exemplo com as configurações atuais. */
  const test = async () => {
    await configureAudio({ duckOthers: st.duckOthers });
    const seg = buildSegments('tabata', DEFAULTS.tabata)[1];
    const cues = cuesFor([{ type: 'phase', seg, next: null, isLastWork: false }], { ...st, flash: false }, STRINGS[st.voiceLang].say, 'tabata');
    perform(cues, { lang: st.voiceLang, voiceId: st.voiceId, rate: st.voiceRate, volume: st.volume, source: st.voiceSource });
  };
  return (
    <SheetTemplate title={S.title} right={<Button label={S.done} kind="primary" onPress={() => router.back()} />}>
      <LinkRow
        label={S.colors} hint={S.colorsHint} onPress={() => router.push('/colors')}
        dots={(['prepare', 'work', 'rest', 'cooldown'] as ColorRole[]).map((r) => hex(colors[r]))}
      />

      <SectionTitle title={S.general} />
      <Field label={S.language}>
        <Segmented value={st.language} onChange={(v) => set('language', v)} options={[{ value: 'auto', label: S.languageAuto }, { value: 'pt', label: 'Português' }, { value: 'en', label: 'English' }]} />
      </Field>
      <Field label={S.timeFormat}>
        <Segmented value={st.timeFormat} onChange={(v) => set('timeFormat', v)} options={[{ value: '00:00', label: '00:00' }, { value: '0:00', label: '0:00' }]} />
      </Field>

      <View style={{ flexDirection: 'row', marginTop: 18 }}>
        <Button label={S.test} kind="primary" onPress={test} />
      </View>

      <SectionTitle title={S.sound} />
      {tog('sound', S.soundOn, S.soundOnHint)}
      <Field label={S.soundStyle}>
        <Segmented value={st.soundScheme} onChange={(v) => set('soundScheme', v)} options={(Object.keys(S.styles) as Settings['soundScheme'][]).map((k) => ({ value: k, label: S.styles[k] }))} />
      </Field>
      <Field label={S.volume}>
        <Segmented value={VOLUMES.reduce((a, b) => (Math.abs(b - st.volume) < Math.abs(a - st.volume) ? b : a))} onChange={(v) => set('volume', v)} options={VOLUMES.map((v) => ({ value: v, label: `${v * 100}%` }))} />
      </Field>
      {tog('countdown', S.countdown, S.countdownHint)}
      {tog('tick', S.tick, S.tickHint)}

      <SectionTitle title={S.voice} />
      {tog('voice', S.voiceOn, S.voiceOnHint)}
      {recorded && (
        <Field label={S.voiceSource} hint={S.voiceSourceHint}>
          <Segmented value={st.voiceSource} onChange={(v) => set('voiceSource', v)} options={[{ value: 'recorded', label: S.voiceRecorded }, { value: 'system', label: S.voiceSystem }]} />
        </Field>
      )}
      {systemVoice && (
        <LinkRow label={S.voicePick} hint={st.voiceId ? voiceName : `${S.voiceAuto}${voiceName ? ` · ${voiceName}` : ''}`} onPress={() => router.push('/voices')} />
      )}
      {tog('sayRound', S.sayRound, '"Go! Round 2"')}
      {tog('voiceCount', S.voiceCount, S.voiceCountHint)}
      {systemVoice && (
        <Field label={S.voiceRate}>
          <Segmented value={st.voiceRate} onChange={(v) => set('voiceRate', v)} options={[{ value: 0.85, label: S.slow }, { value: 1, label: S.normal }, { value: 1.15, label: S.fast }]} />
        </Field>
      )}

      <SectionTitle title={S.device} />
      {tog('vibrate', S.vibrate)}
      {tog('keepAwake', S.keepAwake, S.keepAwakeHint)}
      {Platform.OS !== 'web' && tog('backgroundAlerts', S.bgAlerts, S.bgAlertsHint)}
      {Platform.OS !== 'web' && <Toggle label={S.flash} hint={S.flashHint} value={st.flash} onChange={toggleFlash} />}
      {tog('duckOthers', S.duck, S.duckHint)}
    </SheetTemplate>
  );
}
