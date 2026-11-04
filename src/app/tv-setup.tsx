import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BoxLogo, Button, Hint } from '@/components/atoms';
import { Row, TextField } from '@/components/molecules';
import { SheetTemplate } from '@/components/templates';
import { useStrings } from '@/hooks/useStrings';
import { isWeb, pickImage } from '@/services/webApp';
import { useApp } from '@/store/useApp';

/** Página de personalização do modo TV: nome do box, logo e o WOD do dia. */
export default function TvSetupScreen() {
  const { t } = useStrings();
  const S = t.tv.setup;
  const st = useApp((s) => s.settings);
  const set = useApp((s) => s.setSetting);
  const choose = async () => { const uri = await pickImage(); if (uri) set('tvLogo', uri); };

  return (
    <SheetTemplate title={S.title} onBack={() => router.back()} right={<Button label={t.settings.done} kind="primary" onPress={() => router.back()} />} keyboard>
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
      <TextField label={S.wod} hint={S.wodHint} value={st.tvWod} onChange={(v) => set('tvWod', v)} placeholder={S.wodPh} multiline maxLength={400} />
      <View style={s.open}>
        <Button label={S.open} kind="primary" onPress={() => router.push('/tv')} />
      </View>
      <Hint small style={{ marginTop: 10 }}>{t.tv.openHint}</Hint>
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  open: { flexDirection: 'row', marginTop: 20 },
});
