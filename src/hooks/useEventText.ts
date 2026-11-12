import { displayName, type EventEntry, type EventProgress } from '@/core/event';
import {
  currentSet, finished, formatClock, MURPH_TOTAL, planShort, progress as progressOf, ranked, stageCells,
  type MurphPlan, type MurphState,
} from '@/core/murph';
import { useStrings } from './useStrings';

/** Uma etapa no painel: nome curto, "45/100" (ou ✓) e quanto da barra preencher. */
export interface PanelCell { label: string; value: string; frac: number; state: 'done' | 'now' | 'next' }

/** Uma linha do painel (TV e resultado no celular). */
export interface PanelRow {
  key: string; name: string; vest: boolean; status: string; detail: string; progress: number; done: boolean; cells: PanelCell[];
}

/** Textos do Murph que dependem do idioma: etapa atual, plano, situação e o painel. */
export function useEventText() {
  const { t } = useStrings();
  const E = t.events;
  const moveName = (m: 'pu' | 'ps' | 'sq') => E[m];
  const planText = (plan: MurphPlan) => (plan ? `${E.setOf} ${planShort(plan)}` : E.planNone);

  /** "Pull-ups 67/100", "Pull-ups 3/5" (série, com quebra), "1 milha (2)", "42:17", "Tempo esgotado · 312 reps" */
  const statusText = (s: MurphState, capMs?: number, plan?: MurphPlan) => {
    if (finished(s)) return formatClock(s.finishedAt!);
    const reps = s.done.pu + s.done.ps + s.done.sq;
    if (s.phase === 'done') return `${capMs != null && (s.finishedAt ?? 0) >= capMs ? E.timeCap : E.quitTag} · ${reps} ${E.reps}`;
    if (s.phase === 'run1' || s.phase === 'run2') return `${E.run} (${s.phase === 'run1' ? 1 : 2})`;
    const cs = plan ? currentSet(s, plan) : null;
    if (cs) return `${moveName(cs.move)} ${cs.set}/${cs.of}`;
    return s.cur ? `${moveName(s.cur)} ${s.done[s.cur]}/${MURPH_TOTAL[s.cur]}` : '';
  };

  /** Com quebra: "rodada 9/20" do movimento atual. */
  const detailText = (s: MurphState, plan?: MurphPlan) => {
    const cs = plan ? currentSet(s, plan) : null;
    return cs ? E.round(cs.round, cs.rounds) : '';
  };

  const cellsOf = (s: MurphState): PanelCell[] => stageCells(s).map((c) => ({
    label: E.short[c.key],
    value: c.total === 1 ? (c.done ? '✓' : '') : `${c.done}/${c.total}`,
    frac: c.done / c.total,
    state: c.state,
  }));

  /** Linhas do painel, já em ordem de ranking. Inscritos sem contagem vêm no fim, zerados. */
  const panelRows = (progress: EventProgress[], entries: EventEntry[], capMs: number, started: boolean): PanelRow[] => {
    const plans = new Map(entries.map((e) => [e.uid, e.plan]));
    const counted = new Set(progress.map((p) => p.uid));
    const rows = ranked(progress).map((p) => ({
      key: p.uid, name: p.name, vest: p.vest, status: statusText(p, capMs, plans.get(p.uid)), detail: detailText(p, plans.get(p.uid)),
      progress: progressOf(p), done: finished(p), cells: cellsOf(p),
    }));
    const empty = cellsOf({ phase: 'run1', done: { pu: 0, ps: 0, sq: 0 }, cur: null, setDone: 0, setTarget: 0, carry: { pu: 0, ps: 0, sq: 0 }, finishedAt: null, quit: false })
      .map((c) => ({ ...c, state: started && c.label === E.short.run1 ? ('now' as const) : ('next' as const) }));
    const waiting = entries.filter((e) => !counted.has(e.uid)).map((e) => ({
      key: e.uid, name: displayName(e.name),
      vest: e.vest, status: started ? `${E.run} (1)` : '', detail: '', progress: 0, done: false, cells: empty,
    }));
    return [...rows, ...waiting];
  };

  return { E, moveName, planText, statusText, detailText, cellsOf, panelRows, progressOf };
}
