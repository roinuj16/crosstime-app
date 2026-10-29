import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Button, Hint, Note } from '@/components/atoms';
import { VoiceOption } from '@/components/molecules';
import { SheetTemplate } from '@/components/templates';
import { useStrings } from '@/hooks/useStrings';
import { STRINGS } from '@/i18n/strings';
import { speak } from '@/services/feedback';
import { forgetVoices, listVoices, voiceScore, type VoiceInfo } from '@/services/voices';
import { useApp } from '@/store/useApp';

/** Página de vozes do sistema: lista as vozes instaladas e toca uma amostra ao escolher. */
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
    speak(`${sample.prepare}. ${sample.workRound(1)}. ${sample.rest}`, { lang: st.voiceLang, voiceId: id, rate: st.voiceRate, volume: st.volume, source: 'system' });
  };
  const badge = t.voices.enhanced.toUpperCase();

  return (
    <SheetTemplate title={t.voices.title} onBack={() => router.back()} right={<Button label={t.settings.done} kind="primary" onPress={() => router.back()} />}>
      <Hint style={{ marginBottom: 6 }}>{t.voices.listen}</Hint>
      <VoiceOption title={t.voices.auto} sub={voices?.[0]?.name ?? '—'} selected={st.voiceId === ''} onPress={() => choose('')} />
      {voices?.length === 0 && <Hint style={{ paddingVertical: 12 }}>{t.voices.empty}</Hint>}
      {voices?.map((v) => (
        <VoiceOption
          key={v.identifier} title={v.name} sub={v.language} selected={st.voiceId === v.identifier}
          badge={voiceScore(v, st.voiceLang) >= 10 ? badge : undefined} onPress={() => choose(v.identifier)}
        />
      ))}
      <Note variant="help">{t.voices.help}</Note>
    </SheetTemplate>
  );
}
