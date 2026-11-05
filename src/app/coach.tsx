import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BoxLogo, Button, SectionTitle } from '@/components/atoms';
import { LinkRow, Row, TextField } from '@/components/molecules';
import { SheetTemplate } from '@/components/templates';
import { formatRoomCode } from '@/core/sync';
import { useStrings } from '@/hooks/useStrings';
import { useRemote } from '@/services/remote';
import { isWeb, pickImage } from '@/services/webApp';
import { useApp } from '@/store/useApp';
import { goBack } from '@/services/nav';

/**
 * Tela do coach: o nome dele (opcional, vai para o topo da TV ao lado da hora), a conexão
 * com a TV e o que aparece nela (nome do box e logo). O WOD fica na tela de cada modo (edit.tsx).
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
  const choose = async () => { const uri = await pickImage(); if (uri) set('tvLogo', uri); };

  const tvHint = !st.pairedCode ? t.tv.connect.step2
    : remote.status === 'error' ? P.error
    : remote.peer ? t.tv.connect.statusOn(formatRoomCode(st.pairedCode))
    : `${P.tvOf(formatRoomCode(st.pairedCode))} · ${P.waiting}`;

  return (
    <SheetTemplate title={C.title} onBack={() => goBack('/settings')} right={<Button label={t.settings.done} kind="primary" onPress={() => goBack('/settings')} />} keyboard>
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
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 1 },
});
