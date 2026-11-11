import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Note } from '@/components/atoms';
import { Row, Stepper, TextField, Toggle } from '@/components/molecules';
import { FormError } from '@/components/organisms';
import { SheetTemplate } from '@/components/templates';
import { EVENT_LIMITS, maskDate, maskTime, parseDateTime, todayText } from '@/core/event';
import { useStrings } from '@/hooks/useStrings';
import { useAccount } from '@/services/account';
import { createEvent, watchMyBoxes, type Box } from '@/services/events';
import { goBack } from '@/services/nav';

/** Coach cria um Murph do box: nome, data e hora, tempo limite, vagas, quebras e colete. */
export default function NewEventScreen() {
  const { t } = useStrings();
  const E = t.events;
  const { box: boxId } = useLocalSearchParams<{ box?: string }>();
  const acc = useAccount();
  const [boxes, setBoxes] = useState<Box[]>([]);
  useEffect(() => watchMyBoxes(setBoxes), [acc.uid]);
  const box = boxes.find((b) => b.id === boxId) ?? boxes[0];

  const [title, setTitle] = useState('Murph');
  const [date, setDate] = useState(todayText());
  const [time, setTime] = useState('07:00');
  const [cap, setCap] = useState(60);
  const [spots, setSpots] = useState(20);
  const [partition, setPartition] = useState(true);
  const [vest, setVest] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    const when = parseDateTime(date, time);
    if (!when) { setError(E.badDate); return; }
    if (!box) return;
    setBusy(true); setError('');
    try {
      const id = await createEvent({
        boxId: box.id, boxName: box.name, title: title.trim() || 'Murph', kind: 'murph', date: when,
        timeCapMin: cap, capacity: spots, partition, vest, coachName: acc.profile?.name ?? '',
      });
      router.replace({ pathname: '/event', params: { id } });
    } catch { setError(E.error); } finally { setBusy(false); }
  };

  return (
    <SheetTemplate title={E.newMurph} keyboard onBack={() => goBack('/events')} right={<Button label={E.create} kind="primary" onPress={create} disabled={busy || !box} />}>
      <Note variant="help">{E.murphDesc}</Note>
      <TextField label={E.name} value={title} onChange={setTitle} maxLength={40} autoCapitalize="words" />
      <View style={s.two}>
        <View style={s.half}><TextField label={E.date} value={date} onChange={(v) => setDate(maskDate(v))} placeholder={E.datePh} maxLength={10} inputMode="numeric" /></View>
        <View style={s.half}><TextField label={E.time} value={time} onChange={(v) => setTime(maskTime(v))} placeholder={E.timePh} maxLength={5} inputMode="numeric" /></View>
      </View>
      <Row label={E.cap} hint={E.capHint} right={<Stepper display={E.min(cap)} label={E.cap} onStep={(d) => setCap((c) => Math.max(EVENT_LIMITS.capMin, Math.min(EVENT_LIMITS.capMax, c + d * 5)))} />} />
      <Row label={E.spots} right={<Stepper display={String(spots)} label={E.spots} onStep={(d) => setSpots((c) => Math.max(1, Math.min(EVENT_LIMITS.capacityMax, c + d)))} />} />
      <Toggle label={E.partition} hint={E.partitionHint} value={partition} onChange={setPartition} />
      <Toggle label={E.vest} hint={E.vestHint} value={vest} onChange={setVest} />
      {!!error && <FormError text={error} />}
      <Button label={E.create} kind="primary" onPress={create} disabled={busy || !box} style={s.wide} />
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  two: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  wide: { alignItems: 'center', paddingVertical: 14, marginTop: 20 },
});
