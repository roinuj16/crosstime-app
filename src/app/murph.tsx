import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, LedText, Note, SectionTitle, Tag } from '@/components/atoms';
import { Row, Toggle } from '@/components/molecules';
import { EventRanking, FormError, MurphCounter, PlanPicker, type CounterStage } from '@/components/organisms';
import { SheetTemplate } from '@/components/templates';
import { canRegister, countdown, displayName, formatEventDate, spotsLeft } from '@/core/event';
import { canSkip, eventClock, finished, formatClock, MOVES, MURPH_TOTAL, nextMoveAfterSkip, setsPerMove, totalReps, type MurphPlan } from '@/core/murph';
import { useEventData, useNow } from '@/hooks/useEventData';
import { useEventText } from '@/hooks/useEventText';
import { useMurphRun } from '@/hooks/useMurphRun';
import { useStrings } from '@/hooks/useStrings';
import { useAccount } from '@/services/account';
import { confirmAction } from '@/services/dialog';
import { eventErrorCode, register, unregister, updateEntry } from '@/services/events';
import { goBack } from '@/services/nav';
import { statusColor } from '@/theme/event';
import { LED, UI } from '@/theme/palette';

/**
 * Aluno: link do treino especial (/murph?id=…). Antes: inscrição (colete, quebras).
 * No dia: contagem regressiva e a tela de contagem. Depois: o resultado e o ranking.
 */
export default function MurphScreen() {
  const { t, lang } = useStrings();
  const { E, moveName, panelRows } = useEventText();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const acc = useAccount();
  const { event, mine, progress, entries, loading } = useEventData(id, { mine: true, progress: true, entries: true });
  const now = useNow(250);
  const clock = event ? eventClock(event.startAt, now) : null;
  const run = useMurphRun(event, mine, clock);
  const back = () => goBack('/events');

  // formulário de inscrição / mudar plano
  const [plan, setPlan] = useState<MurphPlan>({ pu: 5, ps: 10, sq: 15 });
  const [vest, setVest] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (mine) { setPlan(mine.plan); setVest(mine.vest); } }, [mine?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || mine === undefined) return <SheetTemplate title={E.title} onBack={back}>{null}</SheetTemplate>;
  if (!event || !id) return <SheetTemplate title={E.title} onBack={back}><Note>{E.notFound}</Note></SheetTemplate>;

  const name = displayName(acc.profile?.name ?? '');
  const summary = (p: MurphPlan) => {
    if (!event.partition || !p) return [E.planNoBreak];
    const sp = setsPerMove(p);
    return [...MOVES.map((m) => `${moveName(m)}: ${E.planSummary(sp[m].sets, sp[m].size, sp[m].last)}`), E.planOrder];
  };
  const act = (fn: () => Promise<unknown>, after?: () => void) => {
    setBusy(true); setError('');
    fn().then(after).catch((e) => {
      const c = eventErrorCode(e);
      setError(c === 'full' ? E.full : c === 'closed' ? E.closed : E.error);
    }).finally(() => setBusy(false));
  };
  const planBlock = event.partition ? (
    <PlanPicker value={plan} onChange={setPlan} labels={E} summary={summary(plan)} />
  ) : <Note variant="help">{E.planNoBreak}</Note>;
  const vestBlock = event.vest ? <Toggle label={E.vestAsk} hint={E.vestAskHint} value={vest} onChange={setVest} /> : null;

  const header = (
    <View style={s.head}>
      <Tag label={E.status[event.status].toUpperCase()} variant="outline" color={statusColor(event.status)} />
      <LedText size={40} trim="label" color={UI.text} tracking={1}>{event.title.toUpperCase()}</LedText>
      <Text style={s.when}>{formatEventDate(event.date, lang)} · {event.boxName}</Text>
      <Text style={s.meta}>{E.murphDesc}</Text>
      <Text style={s.meta}>{E.cap}: {E.min(event.timeCapMin)} · {event.partition ? E.yesPartition : E.noPartition}</Text>
    </View>
  );

  const rankRows = panelRows(progress, entries, event.timeCapMin * 60_000, true).filter((r) => progress.some((p) => p.uid === r.key));

  // ---------- ainda não inscrito ----------
  if (!mine) {
    return (
      <SheetTemplate title={E.joinTitle} keyboard onBack={back}>
        {header}
        {event.status !== 'open' ? <Note>{E.started}</Note> : !canRegister(event) ? <Note>{E.full}</Note> : (
          <>
            <Text style={[s.spots, { color: LED.verde }]}>{E.spotsLeft(spotsLeft(event))}</Text>
            <Row label={E.nameOnTv} hint={E.nameOnTvHint} right={<Text style={s.name}>{name}</Text>} />
            {vestBlock}
            {planBlock}
            {!!error && <FormError text={error} />}
            <Button label={E.confirm} kind="primary" style={s.wide} disabled={busy}
              onPress={() => act(() => register(id, { name, vest, plan: event.partition ? plan : null }))} />
          </>
        )}
        {event.status === 'done' && rankRows.length > 0 && (<><SectionTitle title={E.ranking} /><EventRanking rows={rankRows} vestLabel={E.withVest} /></>)}
      </SheetTemplate>
    );
  }

  // ---------- inscrito, antes do start ----------
  if (event.status === 'open') {
    return (
      <SheetTemplate title={E.title} keyboard onBack={back}>
        {header}
        <View style={s.inBox}>
          <LedText size={30} trim="label" color={LED.verde} tracking={1}>{E.youAreIn.toUpperCase()}</LedText>
          <Text style={s.meta}>{E.youAreInHint}</Text>
        </View>
        {editing ? (
          <>
            {vestBlock}
            {planBlock}
            {!!error && <FormError text={error} />}
            <Button label={E.savePlan} kind="primary" style={s.wide} disabled={busy}
              onPress={() => act(() => updateEntry(id, { vest, plan: event.partition ? plan : null }), () => setEditing(false))} />
          </>
        ) : (
          <>
            <View style={s.summary}>{summary(mine.plan).map((l, i) => <Text key={i} style={s.sumLine}>{l}</Text>)}</View>
            {mine.vest && <Text style={[s.meta, { color: LED.ambar }]}>{E.vestAsk}</Text>}
            {(event.partition || event.vest) && <Button label={E.editPlan} style={s.wide} onPress={() => setEditing(true)} />}
            <Button label={E.cancel} kind="ghost" style={s.wide}
              onPress={async () => { if (await confirmAction(E.cancel, E.cancelAsk, E.cancel, t.cancel)) act(() => unregister(id)); }} />
          </>
        )}
      </SheetTemplate>
    );
  }

  // ---------- valendo: contagem regressiva / contagem / resultado ----------
  const st = run.state;
  const wait = countdown(clock);
  if (event.status === 'live' && st.phase !== 'done' && clock != null && clock < 0) {
    return (
      <SheetTemplate title={event.title} onBack={back}>
        <View style={s.center}>
          <Text style={s.meta}>{E.startsIn.toUpperCase()}</Text>
          <LedText variant="display" size={160} tabular trim="digits" color={LED.verde}>{String(wait)}</LedText>
        </View>
      </SheetTemplate>
    );
  }

  if (st.phase === 'done' || event.status === 'done') {
    const ok = finished(st);
    return (
      <SheetTemplate title={event.title} onBack={back}>
        <View style={s.center}>
          <Text style={[s.meta, { color: ok ? LED.verde : UI.muted }]}>{(ok ? E.finished : st.quit && (st.finishedAt ?? 0) >= event.timeCapMin * 60_000 ? E.timeCap : E.result).toUpperCase()}</Text>
          {ok ? (
            <LedText variant="display" size={96} tabular trim="digits" color={LED.verde}>{formatClock(st.finishedAt!)}</LedText>
          ) : (
            <LedText variant="display" size={96} tabular trim="digits" color={UI.text}>{`${totalReps(st)}`}</LedText>
          )}
          {!ok && <Text style={s.meta}>{E.yourReps}</Text>}
        </View>
        {/* tocou sem querer no fim: dá para desfazer por 15 segundos */}
        {run.canUndo && event.status === 'live' && ok && clock != null && clock - (st.finishedAt ?? 0) < 15_000 && <Button label={E.undo} style={s.wide} onPress={run.undo} />}
        {rankRows.length > 0 && (<><SectionTitle title={E.ranking} /><EventRanking rows={rankRows} vestLabel={E.withVest} /></>)}
      </SheetTemplate>
    );
  }

  const order: ('run1' | 'pu' | 'ps' | 'sq' | 'run2')[] = ['run1', 'pu', 'ps', 'sq', 'run2'];
  const curKey = st.phase === 'block' ? st.cur! : st.phase;
  const stageIdx = order.indexOf(curKey as never) + 1;
  const stateOf = (k: (typeof order)[number]): CounterStage['state'] => {
    if (k === 'run1') return st.phase === 'run1' ? 'now' : 'done';
    if (k === 'run2') return st.phase === 'run2' ? 'now' : 'next';
    if (st.done[k] >= MURPH_TOTAL[k]) return 'done';
    return st.phase === 'block' && st.cur === k ? 'now' : 'next';
  };
  const stages: CounterStage[] = order.map((k) => ({
    label: k === 'run1' || k === 'run2' ? E.run : moveName(k),
    value: k === 'run1' || k === 'run2' ? '' : `${st.done[k]}/${MURPH_TOTAL[k]}`,
    state: stateOf(k),
  }));
  const segments = order.map((k) => (k === 'run1' ? (st.phase === 'run1' ? 0 : 1) : k === 'run2' ? 0 : st.done[k] / MURPH_TOTAL[k]));
  const nextSkip = canSkip(st, run.plan) ? nextMoveAfterSkip(st) : null;

  return (
    <SheetTemplate title={event.title} onBack={back}>
      <MurphCounter
        title={E.my} stageText={E.stage(stageIdx, 5)} segments={segments}
        clock={formatClock(clock ?? 0)} limit={E.limit(formatClock(event.timeCapMin * 60_000))}
        stages={stages} labels={{ now: E.now, done: E.doneTag, set: E.set, undo: E.undo }}
        current={st.phase === 'block' && st.cur ? {
          kind: 'reps', name: moveName(st.cur), setDone: st.setDone, setTarget: st.setTarget,
          total: E.total(st.done[st.cur], MURPH_TOTAL[st.cur]), left: E.left(MURPH_TOTAL[st.cur] - st.done[st.cur]),
        } : { kind: 'run', name: E.run, button: E.runDone }}
        canUndo={run.canUndo} skipLabel={nextSkip ? E.skipTo(moveName(nextSkip)) : null}
        onAdd={run.add} onUndo={run.undo} onSkip={run.skip} onRun={run.run}
      />
      <Button label={E.quit} kind="ghost" style={s.wide}
        onPress={async () => { if (await confirmAction(E.quit, E.quitAsk, E.quit, t.cancel)) run.quit(); }} />
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  head: { gap: 6, marginTop: 8, alignItems: 'flex-start' },
  when: { color: UI.text, fontSize: 16, fontWeight: '600' },
  meta: { color: UI.muted, fontSize: 14, lineHeight: 20 },
  spots: { fontSize: 15, fontWeight: '800', marginTop: 14 },
  name: { color: UI.text, fontSize: 16, fontWeight: '700' },
  wide: { alignItems: 'center', paddingVertical: 14, marginTop: 14 },
  inBox: { backgroundColor: '#13200F', borderColor: LED.verde, borderWidth: 1, borderRadius: 14, padding: 14, gap: 6, marginTop: 16 },
  summary: { backgroundColor: '#161616', borderRadius: 12, padding: 12, gap: 4, marginTop: 14 },
  sumLine: { color: UI.text, fontSize: 15 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 48 },
});
