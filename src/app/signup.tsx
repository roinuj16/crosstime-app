import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Button, Note } from '@/components/atoms';
import { FormError, ProfileFields } from '@/components/organisms';
import { SheetTemplate } from '@/components/templates';
import { useProfileForm } from '@/hooks/useProfileForm';
import { useStrings } from '@/hooks/useStrings';

/** Cadastro, depois de confirmar o e-mail pela primeira vez. Sem ele o app não abre. */
export default function SignupScreen() {
  const { t } = useStrings();
  const P = t.profile;
  const f = useProfileForm();
  // salvou: o AccountGate leva para o timer (ou para o link que a pessoa abriu antes de entrar)
  const submit = async () => { await f.save(); };
  return (
    <SheetTemplate title={P.signupTitle} keyboard right={<Button label={P.save} kind="primary" onPress={submit} disabled={f.busy} />}>
      <Note variant="help">{P.signupIntro}</Note>
      <ProfileFields value={{ ...f.value, email: f.email }} onChange={f.onChange} labels={P} errors={f.errors} />
      {f.failed && <FormError text={P.error} />}
      <Button label={P.save} kind="primary" onPress={submit} disabled={f.busy} style={s.wide} />
      <Button label={P.privacy} kind="ghost" onPress={() => router.push('/privacy')} style={s.center} />
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  wide: { alignItems: 'center', paddingVertical: 14, marginTop: 20 },
  center: { alignItems: 'center', marginTop: 8 },
});
