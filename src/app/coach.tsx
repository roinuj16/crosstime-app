import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BoxLogo, Button, Hint, SectionTitle } from '@/components/atoms';
import { Field, LinkRow, Row, Segmented, TextField } from '@/components/molecules';
import { SheetTemplate } from '@/components/templates';
import { formatRoomCode } from '@/core/sync';
import { compactWods, isWodMode, WOD_MODES, type WodMode } from '@/core/wod';
import { useStrings } from '@/hooks/useStrings';
import { useRemote } from '@/services/remote';
import { isWeb, pickImage } from '@/services/webApp';
import { useApp } from '@/store/useApp';

/**
 * Tela do coach: o nome dele (opcional, vai para o topo da TV ao lado da hora), a conexão
 * com a TV e o que aparece nela (nome do box, logo e o WOD do dia).
 * Com o celular conectado, tudo o que muda aqui aparece na TV em menos de um segundo.
 */
export default function CoachScreen() {
  const { t } = useStrings();
  const C = t.coach;
  const S = t.tv.setup;
  const P = t.tv.pair;
  const st = useApp((s) => s.settings);
  const set = useApp((s) => s.setSetting);
  const remote = useRemote();
  // modo do WOD em edição: começa no modo que está no timer
  const [wodMode, setWodMode] = useState<WodMode>(() => { const m = useApp.getState().mode; return isWodMode(m) ? m : 'tabata'; });
  const wods = st.tvWods ?? {};
  const setWod = (text: string) => set('tvWods', { ...wods, [wodMode]: text });
  const filled = Object.keys(compactWods(wods)) as WodMode[];
  const choose = async () => { const uri = await pickImage(); if (uri) set('tvLogo', uri); };

  const tvHint = !st.pairedCode ? t.tv.connect.step2
    : remote.status === 'error' ? P.error
    : remote.peer ? t.tv.connect.statusOn(formatRoomCode(st.pairedCode))
    : `${P.tvOf(formatRoomCode(st.pairedCode))} · ${P.waiting}`;

  return (
    <SheetTemplate title={C.title} onBack={() => router.back()} right={<Button label={t.settings.done} kind="primary" onPress={() => router.back()} />} keyboard>
      <TextField label={C.name} hint={C.nameHint} value={st.tvCoachName} onChange={(v) => set('tvCoachName', v)} placeholder={C.namePh} maxLength={30} />

      <SectionTitle title={C.tv} />
      <LinkRow label={t.tv.connect.title} hint={tvHint} onPress={() => router.push('/connect')} />
      <TextField label={S.boxName} value={st.tvBoxName} onChange={(v) => set('tvBoxName', v)} placeholder={S.boxNamePh} maxLength={40} />
      {isWeb && (
        <Row
          label={S.logo} hint={S.logoHint}
          right={
            <View style={s.logo}>
              {!!st.tvLogo && <BoxLogo uri={st.tvLogo} size={44} />}
              <Button label={S.logoPick} onPress={choose} />
              {!!st.tvLogo && <Button label={S.logoRemove} kind="danger" onPress={() => set('tvLogo', '')} />}
            </View>
          }
        />
      )}
      <Field label={S.wod} hint={filled.length ? `${C.wodHint}\n${C.wodSaved(filled.map((m) => t.modes[m]).join(', '))}` : C.wodHint}>
        <Segmented
          value={wodMode} onChange={setWodMode}
          options={WOD_MODES.map((m) => ({ value: m, label: filled.includes(m) ? `${t.modes[m]} •` : t.modes[m] }))}
        />
      </Field>
      <TextField label={C.wodFor(t.modes[wodMode])} value={wods[wodMode] ?? ''} onChange={setWod} placeholder={S.wodPh} multiline maxLength={400} />

      <View style={s.open}>
        <Button label={S.open} onPress={() => router.push('/tv')} />
      </View>
      <Hint small style={{ marginTop: 10 }}>{t.tv.connect.thisDeviceHint}</Hint>
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 1 },
  open: { flexDirection: 'row', marginTop: 20 },
});
