import * as KeepAwake from 'expo-keep-awake';
import { useEffect, useRef, useState } from 'react';
import { capped, displayName, type EventEntry, type MurphEvent } from '@/core/event';
import { addReps, completeRun, quit, skip, startState, type MurphState } from '@/core/murph';
import { saveProgress, watchMyProgress } from '@/services/events';

const UNDO_MAX = 60;
const SAVE_MS = 800;

/**
 * A contagem do aluno durante o Murph: estado, desfazer, salvar (junta toques seguidos e
 * funciona sem internet: o Firestore guarda e envia depois), tempo limite e tela acesa.
 */
export function useMurphRun(event: MurphEvent | null | undefined, entry: EventEntry | null | undefined, clockMs: number | null) {
  const [state, setState] = useState<MurphState>(startState);
  const [history, setHistory] = useState<MurphState[]>([]);
  const restored = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = event?.id;
  const plan = entry?.plan ?? null;
  const live = event?.status === 'live';

  // continua de onde parou (página recarregada, outro aparelho)
  useEffect(() => {
    if (!id || !entry) return;
    restored.current = false;
    return watchMyProgress(id, (p) => {
      if (restored.current) return;
      restored.current = true;
      if (p) setState({ phase: p.phase, done: p.done, cur: p.cur, setDone: p.setDone, setTarget: p.setTarget, carry: p.carry, finishedAt: p.finishedAt, quit: p.quit });
    });
  }, [id, entry?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // coach recomeçou o evento: zera
  useEffect(() => { if (event?.status === 'open') { setState(startState()); setHistory([]); } }, [event?.status]);

  const persist = (next: MurphState, now: boolean) => {
    if (!id || !entry) return;
    clearTimeout(timer.current);
    const go = () => saveProgress(id, next, { name: displayName(entry.name), vest: entry.vest }).catch(() => {});
    if (now) go(); else timer.current = setTimeout(go, SAVE_MS);
  };

  const apply = (fn: (s: MurphState) => MurphState) => {
    setState((prev) => {
      const next = fn(prev);
      if (next === prev) return prev;
      setHistory((h) => [...h.slice(-UNDO_MAX + 1), prev]);
      persist(next, next.phase !== prev.phase);
      return next;
    });
  };

  const t = Math.max(0, clockMs ?? 0);
  const canCount = live && clockMs != null && clockMs >= 0 && state.phase !== 'done';

  // tempo limite ou coach encerrou: fica com o que fez
  useEffect(() => {
    if (!event || !entry || state.phase === 'done' || clockMs == null) return;
    const cap = event.timeCapMin * 60_000;
    if ((event.status === 'live' && capped(event, clockMs)) || event.status === 'done') {
      const at = Math.min(clockMs, cap);
      setState((prev) => { const next = quit(prev, at); persist(next, true); return next; });
    }
  }, [clockMs != null && clockMs >= (event?.timeCapMin ?? 0) * 60_000, event?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // tela acesa enquanto o treino está valendo
  useEffect(() => {
    if (!live || !entry) return;
    KeepAwake.activateKeepAwakeAsync('murph').catch(() => {});
    return () => { KeepAwake.deactivateKeepAwake('murph').catch(() => {}); };
  }, [live, entry?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state, plan, canCount,
    canUndo: history.length > 0 && live,
    add: (n: number) => canCount && apply((s) => addReps(s, plan, n)),
    run: () => canCount && apply((s) => completeRun(s, plan, t)),
    skip: () => canCount && apply((s) => skip(s, plan)),
    quit: () => apply((s) => quit(s, t)),
    undo: () => {
      if (!history.length) return;
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setState(prev);
      persist(prev, true);
    },
  };
}
