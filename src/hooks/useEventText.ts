import { formatClock, MURPH_TOTAL, planShort, progress as progressOf, finished, type MurphPlan, type MurphState } from '@/core/murph';
import { useStrings } from './useStrings';

/** Textos do Murph que dependem do idioma: etapa atual, plano e situação no ranking. */
export function useEventText() {
  const { t } = useStrings();
  const E = t.events;
  const moveName = (m: 'pu' | 'ps' | 'sq') => E[m];
  const planText = (plan: MurphPlan) => (plan ? `${E.setOf} ${planShort(plan)}` : E.planNone);
  /** "Pull-ups 67/100", "1 milha", "42:17", "Tempo esgotado · 312 reps" */
  const statusText = (s: MurphState, capMs?: number) => {
    if (finished(s)) return formatClock(s.finishedAt!);
    const reps = s.done.pu + s.done.ps + s.done.sq;
    if (s.phase === 'done') return `${capMs != null && (s.finishedAt ?? 0) >= capMs ? E.timeCap : E.quitTag} · ${reps} ${E.reps}`;
    if (s.phase === 'run1' || s.phase === 'run2') return `${E.run} (${s.phase === 'run1' ? 1 : 2})`;
    return s.cur ? `${moveName(s.cur)} ${s.done[s.cur]}/${MURPH_TOTAL[s.cur]}` : '';
  };
  return { E, moveName, planText, statusText, progressOf };
}
