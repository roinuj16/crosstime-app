/**
 * Murph: 1 milha de corrida → 100 pull-ups, 200 push-ups, 300 air squats → 1 milha de corrida.
 * Só cálculo (sem React nem Firebase), para poder testar.
 *
 * Quebras (se o coach permitir): o aluno escolhe o tamanho da série de cada movimento
 * (ex.: 5/10/15 = 20 rodadas de "Cindy"). O app alterna pull-up → push-up → air squat,
 * pulando os que já acabaram. Ao fechar a série, passa sozinho para o próximo.
 * "Pular": vai para o próximo movimento; o que faltou da série volta somado na próxima
 * série daquele movimento. Sem quebra: 100 pull-ups, depois 200 push-ups, depois 300 air squats.
 * O treino termina sozinho quando a última corrida é marcada como feita.
 */

export type Move = 'pu' | 'ps' | 'sq';
export const MOVES: Move[] = ['pu', 'ps', 'sq'];
export const MURPH_TOTAL: Record<Move, number> = { pu: 100, ps: 200, sq: 300 };
export const MURPH_REPS = 600;

/** Tamanho da série de cada movimento; null = sem quebra. */
export type MurphPlan = Record<Move, number> | null;
export type Phase = 'run1' | 'block' | 'run2' | 'done';

export interface MurphState {
  phase: Phase;
  done: Record<Move, number>;
  /** movimento atual (no bloco) */
  cur: Move | null;
  setDone: number;
  setTarget: number;
  /** repetições de séries puladas, que voltam na próxima série do movimento */
  carry: Record<Move, number>;
  /** tempo do relógio (ms desde o start) em que terminou; null = ainda não */
  finishedAt: number | null;
  /** encerrou antes do fim (desistiu, se machucou) */
  quit: boolean;
}

const zero = (): Record<Move, number> => ({ pu: 0, ps: 0, sq: 0 });

export const startState = (): MurphState => ({ phase: 'run1', done: zero(), cur: null, setDone: 0, setTarget: 0, carry: zero(), finishedAt: null, quit: false });

export const remaining = (s: MurphState, m: Move) => MURPH_TOTAL[m] - s.done[m];
const blockLeft = (s: MurphState) => MOVES.some((m) => remaining(s, m) > 0);

/** Próximo movimento com repetições faltando, a partir do atual (em rodízio). */
function nextMove(s: MurphState, from: Move | null, excludeFrom: boolean): Move | null {
  const start = from ? MOVES.indexOf(from) : -1;
  for (let i = 1; i <= MOVES.length; i++) {
    const m = MOVES[(start + i + MOVES.length) % MOVES.length];
    if (excludeFrom && m === from) continue;
    if (remaining(s, m) > 0) return m;
  }
  return null;
}

function enterSet(s: MurphState, plan: MurphPlan, m: Move | null): MurphState {
  if (!m) return { ...s, phase: 'run2', cur: null, setDone: 0, setTarget: 0 };
  const target = plan ? Math.min(plan[m] + s.carry[m], remaining(s, m)) : remaining(s, m);
  return { ...s, phase: 'block', cur: m, setDone: 0, setTarget: target, carry: { ...s.carry, [m]: 0 } };
}

/** Corrida marcada como feita. A segunda corrida encerra o treino (no tempo `t`). */
export function completeRun(s: MurphState, plan: MurphPlan, t: number): MurphState {
  if (s.phase === 'run1') return enterSet(s, plan, nextMove(s, null, false) ?? null);
  if (s.phase === 'run2') return { ...s, phase: 'done', finishedAt: t };
  return s;
}

/** +1, +5, +10. Não passa da série atual; fechou a série, vai para a próxima sozinho. */
export function addReps(s: MurphState, plan: MurphPlan, n: number): MurphState {
  if (s.phase !== 'block' || !s.cur || n <= 0) return s;
  const k = Math.min(n, s.setTarget - s.setDone);
  const next: MurphState = { ...s, done: { ...s.done, [s.cur]: s.done[s.cur] + k }, setDone: s.setDone + k };
  if (next.setDone < next.setTarget) return next;
  return blockLeft(next) ? enterSet(next, plan, nextMove(next, next.cur, false)) : enterSet(next, plan, null);
}

/** Dá para pular? Só com quebra, no bloco, e se houver outro movimento faltando. */
export const canSkip = (s: MurphState, plan: MurphPlan) =>
  !!plan && s.phase === 'block' && !!s.cur && nextMove(s, s.cur, true) !== null;

/** Para onde "Pular" leva (para o texto do botão). */
export const nextMoveAfterSkip = (s: MurphState): Move | null => nextMove(s, s.cur, true);

/** Pula para o próximo movimento; o que faltou da série volta na próxima série deste. */
export function skip(s: MurphState, plan: MurphPlan): MurphState {
  if (!canSkip(s, plan) || !s.cur) return s;
  const left = s.setTarget - s.setDone;
  const withCarry: MurphState = { ...s, carry: { ...s.carry, [s.cur]: s.carry[s.cur] + left } };
  return enterSet(withCarry, plan, nextMove(withCarry, s.cur, true));
}

/** Encerrar antes do fim: o resultado é o que fez até ali. */
export const quit = (s: MurphState, t: number): MurphState => (s.phase === 'done' ? s : { ...s, phase: 'done', quit: true, finishedAt: t });

// ---------------------------------------------------------------------------------------------
// Resumo, barra de progresso e ranking
// ---------------------------------------------------------------------------------------------

export const totalReps = (s: Pick<MurphState, 'done'>) => s.done.pu + s.done.ps + s.done.sq;

/** 0 a 1: cada corrida vale 15%, as 600 repetições valem 70%. */
export function progress(s: MurphState): number {
  const run1 = s.phase === 'run1' ? 0 : 0.15;
  const run2 = s.phase === 'done' && !s.quit ? 0.15 : 0;
  return Math.min(1, run1 + (0.7 * totalReps(s)) / MURPH_REPS + run2);
}

/** Terminou o Murph inteiro (não desistiu, não estourou o tempo). */
export const finished = (s: MurphState) => s.phase === 'done' && !s.quit && s.finishedAt != null;

/**
 * Ordem do ranking: quem terminou (menor tempo primeiro); depois quem está mais adiantado.
 * Devolve número menor = melhor colocado.
 */
export function rankScore(s: MurphState): number {
  if (finished(s)) return s.finishedAt!;
  return 1e12 - progress(s) * 1e9;
}

// ---------------------------------------------------------------------------------------------
// Plano de quebras
// ---------------------------------------------------------------------------------------------

export const PRESETS: { id: string; plan: MurphPlan; rounds?: number }[] = [
  { id: 'none', plan: null },
  { id: 'r20', plan: { pu: 5, ps: 10, sq: 15 }, rounds: 20 },
  { id: 'r10', plan: { pu: 10, ps: 20, sq: 30 }, rounds: 10 },
];

/** Série válida: de 1 até o total do movimento. */
export const clampSet = (m: Move, n: number) => Math.max(1, Math.min(MURPH_TOTAL[m], Math.round(n) || 1));

/** As séries na ordem em que vão acontecer (sem pular nada). */
export function planSets(plan: MurphPlan): { move: Move; reps: number }[] {
  let s = completeRun(startState(), plan, 0);
  const out: { move: Move; reps: number }[] = [];
  while (s.phase === 'block' && s.cur && out.length < 1000) {
    out.push({ move: s.cur, reps: s.setTarget });
    s = addReps(s, plan, s.setTarget);
  }
  return out;
}

/** Quantas séries de cada movimento (para o resumo do plano). */
export function setsPerMove(plan: MurphPlan): Record<Move, { sets: number; size: number; last: number }> {
  const out = {} as Record<Move, { sets: number; size: number; last: number }>;
  for (const m of MOVES) {
    const size = plan ? plan[m] : MURPH_TOTAL[m];
    const sets = Math.ceil(MURPH_TOTAL[m] / size);
    out[m] = { sets, size, last: MURPH_TOTAL[m] - size * (sets - 1) };
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Relógio do evento
// ---------------------------------------------------------------------------------------------

/** Tempo do relógio (ms) — negativo antes do start (contagem regressiva). */
export const eventClock = (startAt: number | null, now: number) => (startAt == null ? null : now - startAt);

/** "42:17" ou "1:02:05". */
export function formatClock(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

/** "5-10-15" (tamanho das séries) ou null sem quebra. */
export const planShort = (plan: MurphPlan) => (plan ? `${plan.pu}-${plan.ps}-${plan.sq}` : null);

/** Ordena para o ranking (melhor primeiro). */
export const ranked = <T extends MurphState>(list: T[]) => [...list].sort((a, b) => rankScore(a) - rankScore(b));

// ---------------------------------------------------------------------------------------------
// Painel (TV e resultado): quanto já foi feito em cada etapa e a série atual
// ---------------------------------------------------------------------------------------------

export type StageKey = 'run1' | Move | 'run2';
export const STAGES: StageKey[] = ['run1', 'pu', 'ps', 'sq', 'run2'];
export interface StageCell { key: StageKey; done: number; total: number; state: 'done' | 'now' | 'next' }

/** As 5 etapas com o que já foi feito em cada uma (corrida: 0 ou 1). */
export function stageCells(s: MurphState): StageCell[] {
  const ended = s.phase === 'done' && !s.quit;
  return STAGES.map((key) => {
    if (key === 'run1') return { key, done: s.phase === 'run1' ? 0 : 1, total: 1, state: s.phase === 'run1' ? 'now' : 'done' };
    if (key === 'run2') return { key, done: ended ? 1 : 0, total: 1, state: ended ? 'done' : s.phase === 'run2' ? 'now' : 'next' };
    const total = MURPH_TOTAL[key];
    const done = Math.max(0, Math.min(total, s.done[key]));
    return { key, done, total, state: done >= total ? 'done' : s.phase === 'block' && s.cur === key ? 'now' : 'next' };
  });
}

/**
 * Com quebra, a série atual e a rodada daquele movimento. Ex.: 5 pull-ups por série,
 * 42 feitos e 2 na série atual → série 2/5, rodada 9/20.
 */
export function currentSet(s: MurphState, plan: MurphPlan): { move: Move; set: number; of: number; round: number; rounds: number } | null {
  if (!plan || s.phase !== 'block' || !s.cur) return null;
  const size = plan[s.cur];
  const rounds = Math.ceil(MURPH_TOTAL[s.cur] / size);
  const round = Math.max(1, Math.min(rounds, Math.floor((s.done[s.cur] - s.setDone) / size) + 1));
  return { move: s.cur, set: s.setDone, of: s.setTarget, round, rounds };
}
