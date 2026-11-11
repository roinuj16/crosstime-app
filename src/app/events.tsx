import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Hint, Note, SectionTitle } from '@/components/atoms';
import { EventCard, TextField } from '@/components/molecules';
import { FormError } from '@/components/organisms';
import { SheetTemplate } from '@/components/templates';
import { formatEventDate, type MurphEvent } from '@/core/event';
import { useStrings } from '@/hooks/useStrings';
import { useAccount } from '@/services/account';
import { createBox, watchBoxEvents, watchMyBoxes, watchMyEvents, type Box, type MyEvent } from '@/services/events';
import { goBack } from '@/services/nav';
import { statusColor } from '@/theme/event';
import { LED } from '@/theme/palette';

/**
 * Treinos especiais. Aluno: as inscrições dele. Coach: também os treinos do box (e o botão
 * para criar um Murph); na primeira vez, cria o box a partir do cadastro.
 */
export default function EventsScreen() {
  const { t, lang } = useStrings();
  const E = t.events;
  const acc = useAccount();
  const coach = acc.profile?.role === 'coach';
  const [boxes, setBoxes] = useState<Box[] | null>(null);
  const [events, setEvents] = useState<MurphEvent[]>([]);
  const [mine, setMine] = useState<MyEvent[]>([]);
  const [boxName, setBoxName] = useState(acc.profile?.box ?? '');
  const [city, setCity] = useState(acc.profile?.city ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => (coach ? watchMyBoxes(setBoxes) : undefined), [coach, acc.uid]);
  const box = boxes?.[0];
  useEffect(() => (box ? watchBoxEvents(box.id, setEvents) : undefined), [box?.id]);
  useEffect(() => watchMyEvents(setMine), [acc.uid]);

  const makeBox = async () => {
    setBusy(true); setError(false);
    try { await createBox(boxName, city); } catch { setError(true); } finally { setBusy(false); }
  };

  return (
    <SheetTemplate title={E.title} onBack={() => goBack('/settings')} keyboard right={<Button label={t.settings.done} kind="primary" onPress={() => goBack('/settings')} />}>
      {coach && boxes !== null && !box && (
        <>
          <SectionTitle title={E.boxTitle} />
          <Note variant="help">{E.boxIntro}</Note>
          <TextField label={E.boxName} value={boxName} onChange={setBoxName} placeholder={t.profile.boxPh} maxLength={60} autoCapitalize="words" />
          <TextField label={E.boxCity} value={city} onChange={setCity} placeholder={t.profile.cityPh} maxLength={60} autoCapitalize="words" />
          {error && <FormError text={E.error} />}
          <Button label={E.boxCreate} kind="primary" onPress={makeBox} disabled={busy || !boxName.trim()} style={s.wide} />
        </>
      )}

      {coach && box && (
        <>
          <SectionTitle title={`${E.ofBox} · ${box.name}`} />
          <Button label={`+ ${E.newMurph}`} kind="primary" onPress={() => router.push({ pathname: '/event-new', params: { box: box.id } })} style={s.wide} />
          {events.length === 0 && <Hint small style={{ marginTop: 10 }}>{E.noEvents}</Hint>}
          {events.map((e) => (
            <EventCard
              key={e.id} title={e.title} when={formatEventDate(e.date, lang)} status={E.status[e.status]} statusColor={statusColor(e.status)}
              detail={E.registered(e.count, e.capacity)} onPress={() => router.push({ pathname: '/event', params: { id: e.id } })}
            />
          ))}
        </>
      )}

      <SectionTitle title={E.mine} />
      {mine.length === 0 && <Hint small style={{ marginTop: 6 }}>{E.mineEmpty}</Hint>}
      {mine.map((e) => (
        <EventCard
          key={e.id} title={e.title} when={`${formatEventDate(e.date, lang)} · ${e.boxName}`} status={E.youAreIn} statusColor={LED.verde}
          onPress={() => router.push({ pathname: '/murph', params: { id: e.id } })}
        />
      ))}
      <View style={{ height: 24 }} />
    </SheetTemplate>
  );
}

const s = StyleSheet.create({ wide: { alignItems: 'center', paddingVertical: 14, marginTop: 14 } });
