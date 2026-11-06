import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, Hint } from '@/components/atoms';
import { Field, Segmented, Stars, TextField } from '@/components/molecules';
import { FormError } from '@/components/organisms';
import { SheetTemplate } from '@/components/templates';
import { feedbackReady, LIMITS, type FeedbackType } from '@/core/account';
import { useStrings } from '@/hooks/useStrings';
import { sendFeedback } from '@/services/account';
import { goBack } from '@/services/nav';
import { LED, UI } from '@/theme/palette';

/** Avaliar e sugerir: nota (opcional), tipo e texto. A tela de origem, versão e aparelho vão junto. */
export default function FeedbackScreen() {
  const { t } = useStrings();
  const F = t.feedback;
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [rating, setRating] = useState<number | null>(null);
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<'form' | 'sent' | 'error'>('form');
  const ready = feedbackReady(rating, message);

  const send = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      await sendFeedback({ rating, type, message, route: typeof from === 'string' ? from : '' });
      setState('sent');
    } catch { setState('error'); } finally { setBusy(false); }
  };
  const back = () => goBack('/settings');

  if (state === 'sent') {
    return (
      <SheetTemplate title={F.title} onBack={back} right={<Button label={t.settings.done} kind="primary" onPress={back} />}>
        <Text style={s.thanks}>{F.sent}</Text>
        <Text style={s.body}>{F.sentBody}</Text>
      </SheetTemplate>
    );
  }

  return (
    <SheetTemplate title={F.title} keyboard onBack={back} right={<Button label={F.send} kind="primary" onPress={send} disabled={!ready || busy} />}>
      <Field label={F.rating}><Stars value={rating} onChange={setRating} label={(n) => `${n}/5`} /></Field>
      <Field label={F.type}>
        <Segmented value={type} onChange={setType} options={[
          { value: 'suggestion', label: F.suggestion }, { value: 'problem', label: F.problem }, { value: 'praise', label: F.praise },
        ]} />
      </Field>
      <TextField label={F.message} value={message} onChange={setMessage} placeholder={F.messagePh} multiline maxLength={LIMITS.message} />
      {state === 'error' && <FormError text={F.error} />}
      <Button label={F.send} kind="primary" onPress={send} disabled={!ready || busy} style={s.wide} />
      <Hint small style={{ marginTop: 10 }}>{F.context}</Hint>
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  thanks: { color: LED.verde, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 48 },
  body: { color: UI.text, fontSize: 16, textAlign: 'center', marginTop: 8 },
  wide: { alignItems: 'center', paddingVertical: 14, marginTop: 20 },
});
