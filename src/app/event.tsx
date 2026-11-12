import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Hint, Note, SectionTitle, Tag } from '@/components/atoms';
import { AddressBox, Row } from '@/components/molecules';
import { EventRanking } from '@/components/organisms';
import { SheetTemplate } from '@/components/templates';
import { webBase } from '@/config/app';
import { displayName, formatEventDate } from '@/core/event';
import { useEventData } from '@/hooks/useEventData';
import { useEventText } from '@/hooks/useEventText';
import { useStrings } from '@/hooks/useStrings';
import { confirmAction, notify } from '@/services/dialog';
import { deleteEvent, endEvent, eventLink, removeEntry, resetEvent, startEvent } from '@/services/events';
import { goBack } from '@/services/nav';
import { shareLink } from '@/services/share';
import { useApp } from '@/store/useApp';
import { statusColor } from '@/theme/event';
import { UI } from '@/theme/palette';

/**
 * Coach: um treino especial do box. Link de inscrição, inscritos, mostrar na TV,
 * iniciar / encerrar / recomeçar e o resultado.
 */
export default function EventAdminScreen() {
  const { t, lang } = useStrings();
  const { E, planText, panelRows } = useEventText();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { event, entries, progress, loading } = useEventData(id, { entries: true, progress: true });
  const paired = useApp((s) => s.settings.pairedCode);
  const onTv = useApp((s) => s.settings.tvEventId) === id;
  const set = useApp((s) => s.setSetting);
  const back = () => goBack('/events');

  if (loading || !event || !id) {
    return <SheetTemplate title={E.title} onBack={back}>{!loading && <Note>{E.notFound}</Note>}</SheetTemplate>;
  }

  const url = webBase() + eventLink(id);
  const share = async () => { if ((await shareLink(E.shareMsg(event.title, url), url)) === 'copied') notify(E.copied, url); };
  const ask = async (title: string, msg: string, fn: () => Promise<unknown>) => {
    if (await confirmAction(title, msg, title, t.cancel)) fn().catch(() => notify(E.error));
  };
  const capMs = event.timeCapMin * 60_000;
  const byUid = new Map(entries.map((e) => [e.uid, e]));
  // painel: cada aluno com a série/rodada atual e quanto já fez em cada etapa
  const rows = panelRows(progress, entries, capMs, true).filter((r) => progress.some((p) => p.uid === r.key));

  return (
    <SheetTemplate title={event.title} onBack={back} right={<Button label={t.settings.done} kind="primary" onPress={back} />}>
      <View style={s.head}>
        <Tag label={E.status[event.status].toUpperCase()} variant="outline" color={statusColor(event.status)} />
        <Text style={s.when}>{formatEventDate(event.date, lang)} · {event.boxName}</Text>
        <Text style={s.meta}>
          {E.cap}: {E.min(event.timeCapMin)} · {event.partition ? E.yesPartition : E.noPartition}{event.vest ? ` · ${E.vest}` : ''}
        </Text>
        <Text style={s.meta}>{E.murphDesc}</Text>
      </View>

      {event.status === 'open' && (
        <>
          <SectionTitle title={E.link} />
          <AddressBox address={url.replace(/^https?:\/\//, '')} action={E.share} onAction={share} />
        </>
      )}

      <SectionTitle title={E.showTv} />
      {paired ? (
        <Row
          label={onTv ? E.onTv : E.showTv}
          right={<Button label={onTv ? E.hideTv : E.showTv} kind={onTv ? 'plain' : 'primary'} onPress={() => set('tvEventId', onTv ? '' : id)} />}
        />
      ) : <Hint small>{E.tvHint}</Hint>}

      {event.status === 'open' && (
        <Button label={E.start} kind="primary" style={s.wide} disabled={event.count === 0}
          onPress={() => ask(E.start, E.startAsk, async () => { if (paired) set('tvEventId', id); await startEvent(id); })} />
      )}
      {event.status === 'live' && <Button label={E.end} kind="danger" style={s.wide} onPress={() => ask(E.end, E.endAsk, () => endEvent(id))} />}
      {event.status !== 'open' && <Button label={E.restart} style={s.wide} onPress={() => ask(E.restart, E.restartAsk, () => resetEvent(id))} />}

      {event.status !== 'open' && rows.length > 0 && (
        <>
          <SectionTitle title={E.ranking} />
          <EventRanking rows={rows} vestLabel={E.withVest} />
        </>
      )}

      <SectionTitle title={`${E.entries} · ${event.count}/${event.capacity}`} />
      {entries.length === 0 && <Hint small>{E.noEntries}</Hint>}
      {entries.map((e) => (
        <Row
          key={e.uid} label={displayName(e.name)}
          hint={[event.partition ? planText(e.plan) : null, e.vest ? E.withVest : null].filter(Boolean).join(' · ') || undefined}
          right={event.status === 'open' ? <Button label={E.remove} kind="danger" onPress={() => ask(E.remove, E.removeAsk(e.name), () => removeEntry(id, e.uid))} /> : null}
        />
      ))}
      {[...byUid.keys()].length === 0 && event.status === 'open' && (
        <Button label={E.delete} kind="ghost" style={s.wide} onPress={() => ask(E.delete, E.deleteAsk, async () => { await deleteEvent(id); router.replace('/events'); })} />
      )}
      <View style={{ height: 24 }} />
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  head: { gap: 6, marginTop: 8, alignItems: 'flex-start' },
  when: { color: UI.text, fontSize: 16, fontWeight: '600' },
  meta: { color: UI.muted, fontSize: 14, lineHeight: 20 },
  wide: { alignItems: 'center', paddingVertical: 14, marginTop: 14 },
});
