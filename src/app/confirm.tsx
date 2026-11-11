import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, LedText } from '@/components/atoms';
import { TextField } from '@/components/molecules';
import { AuthTemplate } from '@/components/templates';
import { isEmail } from '@/core/account';
import { useStrings } from '@/hooks/useStrings';
import { approveRemote, readConfirm, signInHere, type ConfirmInfo } from '@/services/account';
import { landingLink } from '@/services/landing';
import { takeAfterLogin } from '@/services/nav';
import { LED, UI } from '@/theme/palette';

type View_ = ConfirmInfo | { kind: 'checking' } | { kind: 'approved' } | { kind: 'denied' } | { kind: 'error' };

/**
 * Página aberta pelo link do e-mail. No mesmo navegador que pediu, entra direto.
 * Em outro (Safari × ícone da tela de início, app do Gmail, computador), pergunta se foi a
 * pessoa e libera a entrada no aparelho que está esperando, conferindo o código de 2 dígitos.
 */
export default function ConfirmScreen() {
  const { t } = useStrings();
  const C = t.linkPage;
  const [href] = useState(() => landingLink() ?? (typeof window !== 'undefined' ? window.location.href : ''));
  const [view, setView] = useState<View_>({ kind: 'checking' });
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  // tira a chave de login da barra de endereço (histórico, prints, Analytics)
  useEffect(() => { if (/[?&]oobCode=/.test(typeof window !== 'undefined' ? window.location.search : '')) router.replace('/confirm'); }, []);

  useEffect(() => {
    readConfirm(href)
      .then((info) => { setView(info); if (info.kind === 'signedInHere') router.replace(takeAfterLogin() as never); })
      .catch(() => setView({ kind: 'noRequest' }));
  }, [href]);

  const run = (fn: () => Promise<unknown>, after: () => void) => {
    setBusy(true);
    fn().then(after).catch(() => setView({ kind: 'error' })).finally(() => setBusy(false));
  };
  const here = (to: string) => run(() => signInHere(to, href), () => router.replace(takeAfterLogin() as never));

  const title = (text: string) => <LedText size={30} trim="label" color={UI.text} tracking={1} style={{ textAlign: 'center' }}>{text.toUpperCase()}</LedText>;
  const body = (text: string) => <Text style={s.body}>{text}</Text>;

  return (
    <AuthTemplate>
      {view.kind === 'checking' && body(C.checking)}
      {view.kind === 'signedInHere' && body(C.signedIn)}
      {view.kind === 'invalid' && <>{title(C.invalid)}{body(C.invalidBody)}</>}
      {view.kind === 'used' && <>{title(C.used)}{body(C.usedBody)}</>}
      {view.kind === 'error' && <>{title(C.invalid)}{body(C.error)}</>}
      {view.kind === 'approved' && <>{title(C.approved)}{body(C.approvedBody)}</>}
      {view.kind === 'denied' && <>{title(C.denied)}{body(C.deniedBody)}</>}

      {view.kind === 'remote' && (
        <>
          {title(C.askTitle)}
          {body(C.askBody(view.device))}
          <Text style={s.email}>{view.email}</Text>
          <View style={s.codeBox}>
            <Text style={s.hint}>{C.askCode}</Text>
            <LedText variant="display" size={64} tabular trim="digits" color={LED.verde}>{view.code}</LedText>
          </View>
          <Button label={C.yes} kind="primary" disabled={busy} style={s.wide} onPress={() => run(() => approveRemote(view.rid, href), () => setView({ kind: 'approved' }))} />
          <Button label={C.no} kind="danger" disabled={busy} style={s.wide} onPress={() => setView({ kind: 'denied' })} />
          <Button label={C.here} kind="ghost" disabled={busy} style={s.wide} onPress={() => here(view.email)} />
        </>
      )}

      {view.kind === 'noRequest' && (
        <>
          {title(C.noRequest)}
          {body(C.noRequestBody)}
          <TextField
            label={C.emailAgain} value={email} onChange={setEmail} placeholder={t.auth.emailPh} maxLength={254}
            keyboardType="email-address" inputMode="email" autoComplete="email" autoCapitalize="none" onSubmit={() => isEmail(email) && here(email)}
          />
          <Button label={C.go} kind="primary" disabled={busy || !isEmail(email)} style={s.wide} onPress={() => here(email)} />
        </>
      )}
    </AuthTemplate>
  );
}

const s = StyleSheet.create({
  body: { color: UI.text, fontSize: 16, lineHeight: 23, textAlign: 'center', marginVertical: 8 },
  email: { color: UI.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  hint: { color: UI.muted, fontSize: 14, textAlign: 'center', paddingHorizontal: 12 },
  codeBox: { alignItems: 'center', gap: 6, backgroundColor: '#0B0B0B', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A', paddingVertical: 16, marginVertical: 8 },
  wide: { alignItems: 'center', paddingVertical: 14 },
});
