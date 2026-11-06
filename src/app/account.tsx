import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Hint } from '@/components/atoms';
import { FormError, ProfileFields } from '@/components/organisms';
import { SheetTemplate } from '@/components/templates';
import { useProfileForm } from '@/hooks/useProfileForm';
import { useStrings } from '@/hooks/useStrings';
import { deleteAccount, signOutAccount } from '@/services/account';
import { confirmAction, notify } from '@/services/dialog';
import { goBack } from '@/services/nav';

/** Minha conta: editar o cadastro, sair deste aparelho e excluir a conta. */
export default function AccountScreen() {
  const { t } = useStrings();
  const P = t.profile;
  const f = useProfileForm();
  const [saved, setSaved] = useState(false);

  const save = async () => { if (await f.save()) { setSaved(true); setTimeout(() => setSaved(false), 2000); } };
  const out = async () => {
    if (await confirmAction(P.signOut, P.signOutAsk, P.signOut, t.cancel)) { await signOutAccount().catch(() => {}); router.replace('/login'); }
  };
  const remove = async () => {
    if (!(await confirmAction(P.delete, P.deleteAsk, P.delete, t.cancel))) return;
    try {
      const r = await deleteAccount();
      notify(r === 'deleted' ? P.deleteDone : P.deleteDataOnly);
      router.replace('/login');
    } catch { notify(P.error); }
  };

  return (
    <SheetTemplate
      title={P.accountTitle} keyboard onBack={() => goBack('/settings')}
      right={<Button label={saved ? P.saved : P.save} kind="primary" onPress={save} disabled={f.busy || (!f.changed && !saved)} />}
    >
      <ProfileFields value={{ ...f.value, email: f.email }} onChange={f.onChange} labels={P} errors={f.errors} />
      {f.failed && <FormError text={P.error} />}

      <Button label={P.signOut} onPress={out} style={[s.wide, { marginTop: 28 }]} />
      <Button label={P.delete} kind="danger" onPress={remove} style={s.wide} />
      <Hint small style={{ marginTop: 8 }}>{P.deleteHint}</Hint>
    </SheetTemplate>
  );
}

const s = StyleSheet.create({ wide: { alignItems: 'center', paddingVertical: 13, marginTop: 12 } });
