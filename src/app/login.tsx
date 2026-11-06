import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, LedText, Note } from '@/components/atoms';
import { TextField } from '@/components/molecules';
import { AuthTemplate } from '@/components/templates';
import { isEmail } from '@/core/account';
import { useStrings } from '@/hooks/useStrings';
import {
  authErrorCode, cancelLogin, pendingLogin, requestLogin, waitForLogin, type LoginRequest,
} from '@/services/account';
import { LED, UI } from '@/theme/palette';

const RESEND_S = 30;

/**
 * Entrada: a pessoa digita o e-mail e recebe um link. Tocando no link (aqui ou em outro aparelho),
 * este app entra sozinho. Quem ainda não tem cadastro vai para o cadastro depois (AccountGate).
 */
export default function LoginScreen() {
  const { t } = useStrings();
  const A = t.auth;
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [req, setReq] = useState<LoginRequest | null>(() => pendingLogin());
  const [wait, setWait] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // esperando o link: entra sozinho quando ele for aberto
  useEffect(() => {
    if (!req) return;
    return waitForLogin(req, (e) => { setError(authErrorCode(e).includes('invalid-action-code') || authErrorCode(e).includes('expired') ? A.errLink : A.errSend); });
  }, [req?.rid]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startCooldown = () => {
    setWait(RESEND_S);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setWait((w) => { if (w <= 1 && timer.current) clearInterval(timer.current); return Math.max(0, w - 1); }), 1000);
  };

  const send = async (to: string) => {
    if (!isEmail(to)) { setError(A.invalidEmail); return; }
    setBusy(true); setError('');
    try {
      setReq(await requestLogin(to));
      startCooldown();
    } catch (e) {
      const code = authErrorCode(e);
      setError(code.includes('network') || code === 'unavailable' ? A.errOffline : code.includes('too-many') || code.includes('quota') ? A.errTooMany : A.errSend);
    } finally { setBusy(false); }
  };

  const footer = <Button label={A.privacy} kind="ghost" onPress={() => router.push('/privacy')} />;

  if (req) {
    return (
      <AuthTemplate footer={footer}>
        <LedText size={30} trim="label" color={UI.text} tracking={1} style={{ textAlign: 'center' }}>{A.sentTitle.toUpperCase()}</LedText>
        <Text style={s.body}>{A.sentBody(req.email)}</Text>
        <View style={s.codeBox} accessibilityLabel={`${A.sentCode}: ${req.code}`}>
          <Text style={s.codeLabel}>{A.sentCode}</Text>
          <LedText variant="display" size={64} tabular trim="digits" color={LED.verde}>{req.code}</LedText>
          <Text style={s.codeHint}>{A.sentCodeHint}</Text>
        </View>
        {!!error && <Text style={s.err}>{error}</Text>}
        <Button label={wait ? A.resendIn(wait) : A.resend} onPress={() => send(req.email)} disabled={busy || wait > 0} style={s.wide} />
        <Button label={A.otherEmail} kind="ghost" onPress={() => { cancelLogin(); setEmail(req.email); setReq(null); setError(''); }} style={s.wide} />
        <Note variant="help">{A.spam}</Note>
      </AuthTemplate>
    );
  }

  return (
    <AuthTemplate tagline={A.tagline} footer={footer}>
      <TextField
        label={A.email} value={email} onChange={(v) => { setEmail(v); if (error) setError(''); }} placeholder={A.emailPh} maxLength={254}
        keyboardType="email-address" inputMode="email" autoComplete="email" autoCapitalize="none" error={error} onSubmit={() => send(email)}
      />
      <Button label={A.continue} kind="primary" onPress={() => send(email)} disabled={busy || !email.trim()} style={[s.wide, s.primary]} />
    </AuthTemplate>
  );
}

const s = StyleSheet.create({
  body: { color: UI.text, fontSize: 16, lineHeight: 23, textAlign: 'center', marginVertical: 8 },
  codeBox: { alignItems: 'center', gap: 6, backgroundColor: '#0B0B0B', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A', paddingVertical: 16, marginVertical: 8 },
  codeLabel: { color: UI.muted, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
  codeHint: { color: UI.muted, fontSize: 13, textAlign: 'center', paddingHorizontal: 12 },
  err: { color: LED.vermelho, fontSize: 14, textAlign: 'center' },
  wide: { alignItems: 'center', paddingVertical: 14 },
  primary: { marginTop: 12 },
});
