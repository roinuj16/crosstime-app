/**
 * CrossTimer — motor do timer.
 *
 * Só cálculo: sem React, sem áudio, sem armazenamento. Portado do protótipo web.
 *
 * Ideia central: o timer NÃO conta "tiques". Ele guarda quando começou a correr
 * (relógio de parede) e quanto tempo já tinha acumulado. A fase atual é sempre
 * deduzida desse tempo decorrido. Por isso ele:
 *   - não acumula atraso;
 *   - sobrevive ao app ser fechado e reaberto (basta salvar a sessão);
 *   - permite pular/voltar fases mudando apenas o tempo decorrido.
 */

export type Mode = 'tabata' | 'rounds' | 'emom' | 'amrap' | 'fortime' | 'stopwatch';
export const MODES: Mode[] = ['tabata', 'rounds', 'emom', 'amrap', 'fortime', 'stopwatch'];
/**
 * Fases da linha do tempo.
 * - amrap: contagem regressiva única ("o máximo de rounds em X minutos")
 * - emom: um intervalo por minuto (ou a cada N s); o descanso é o que sobra do intervalo
 * - fortime: conta para cima até o atleta terminar ou bater o time cap
 * - run: cronômetro livre, com sinal a cada volta
 */
export type Phase = 'prepare' | 'work' | 'rest' | 'restBC' | 'cooldown' | 'emom' | 'amrap' | 'fortime' | 'run';

export interface TabataConfig { prepare: number; work: number; rest: number; rounds: number; cycles: number; restBC: number; cooldown: number }
export interface RoundsConfig { prepare: number; work: number; rest: number; rounds: number; cooldown: number }
export interface EmomConfig { prepare: number; interval: number; rounds: number }
export interface AmrapConfig { prepare: number; time: number }
/** cap = 0 significa sem limite de tempo */
export interface ForTimeConfig { prepare: number; cap: number }
export interface StopwatchConfig { prepare: number; lap: number }
export interface ModeConfigs {
  tabata: TabataConfig; rounds: RoundsConfig; emom: EmomConfig; amrap: AmrapConfig; fortime: ForTimeConfig; stopwatch: StopwatchConfig;
}
export type AnyConfig = ModeConfigs[Mode];

/** Fases que contam para cima na tela (cronômetro e For Time). */
export const countsUp = (phase: Phase): boolean => phase === 'run' || phase === 'fortime';
/** Modos em que o atleta conta os rounds tocando na tela. */
export const tapsRounds = (mode: Mode): boolean => mode === 'amrap' || mode === 'fortime';

export interface Segment {
  phase: Phase;
  /** segundos; Infinity no cronômetro */
  duration: number;
  /** início do segmento na linha do tempo, em segundos */
  start: number;
  round?: number;
  rounds?: number;
  cycle?: number;
  cycles?: number;
  /** cronômetro: intervalo entre sinais de volta */
  lap?: number;
}

export type SessionStatus = 'idle' | 'running' | 'paused' | 'done';
/** Estado serializável: pode ser salvo em disco e restaurado. */
export interface SessionState { status: SessionStatus; elapsedBase: number; runningSince: number | null }

export interface Location {
  index: number;
  seg: Segment | null;
  next: Segment | null;
  done: boolean;
  segElapsed: number;
  segRemaining: number;
  totalRemaining: number;
}

export type TimerEvent =
  | { type: 'phase'; seg: Segment; next: Segment | null; isLastWork: boolean }
  | { type: 'count'; n: number }
  | { type: 'half' }
  | { type: 'lap'; n: number }
  | { type: 'tick' }
  | { type: 'done' };

export const DEFAULTS: ModeConfigs = {
  tabata: { prepare: 5, work: 30, rest: 15, rounds: 4, cycles: 3, restBC: 30, cooldown: 30 },
  rounds: { prepare: 5, work: 30, rest: 15, rounds: 4, cooldown: 30 },
  emom: { prepare: 10, interval: 60, rounds: 10 },
  amrap: { prepare: 10, time: 12 * 60 },
  fortime: { prepare: 10, cap: 20 * 60 },
  stopwatch: { prepare: 5, lap: 10 },
};

const withStarts = (segs: Omit<Segment, 'start'>[]): Segment[] => {
  let t = 0;
  return segs.map((s) => { const out = { ...s, start: t } as Segment; t += s.duration; return out; });
};

/**
 * Transforma a configuração na linha do tempo.
 * Regra observada no app de referência: o último descanso de cada ciclo é pulado;
 * entre ciclos entra o "descanso entre ciclos" e, no fim, o desaquecimento.
 */
export function buildSegments(mode: Mode, c: AnyConfig): Segment[] {
  const segs: Omit<Segment, 'start'>[] = [];
  const add = (phase: Phase, duration: number, extra: Partial<Segment> = {}) => {
    if (duration > 0) segs.push({ phase, duration, ...extra });
  };
  if (mode === 'stopwatch') {
    const s = c as StopwatchConfig;
    add('prepare', s.prepare);
    segs.push({ phase: 'run', duration: Infinity, lap: Math.max(1, s.lap) });
    return withStarts(segs);
  }
  if (mode === 'amrap') {
    const a = c as AmrapConfig;
    add('prepare', a.prepare);
    segs.push({ phase: 'amrap', duration: Math.max(1, a.time) });
    return withStarts(segs);
  }
  if (mode === 'fortime') {
    const f = c as ForTimeConfig;
    add('prepare', f.prepare);
    segs.push({ phase: 'fortime', duration: f.cap > 0 ? f.cap : Infinity });
    return withStarts(segs);
  }
  if (mode === 'emom') {
    const e = c as EmomConfig;
    const R = Math.max(1, e.rounds | 0);
    add('prepare', e.prepare);
    for (let rd = 1; rd <= R; rd++) segs.push({ phase: 'emom', duration: Math.max(1, e.interval), round: rd, rounds: R });
    return withStarts(segs);
  }
  const r = c as TabataConfig;
  const R = Math.max(1, r.rounds | 0);
  const C = mode === 'tabata' ? Math.max(1, r.cycles | 0) : 1;
  add('prepare', r.prepare);
  for (let cy = 1; cy <= C; cy++) {
    for (let rd = 1; rd <= R; rd++) {
      const pos = { round: rd, rounds: R, cycle: cy, cycles: C };
      add('work', r.work, pos);
      if (rd < R) add('rest', r.rest, pos);
    }
    if (mode === 'tabata' && cy < C) add('restBC', r.restBC, { round: R, rounds: R, cycle: cy, cycles: C });
  }
  add('cooldown', r.cooldown);
  return withStarts(segs);
}

export const totalDuration = (segs: Segment[]): number =>
  segs.reduce((a, s) => a + (Number.isFinite(s.duration) ? s.duration : 0), 0);

/** Onde estamos na linha do tempo depois de `elapsed` segundos. */
export function locate(segs: Segment[], elapsed: number): Location {
  let t = 0;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (elapsed < t + s.duration) {
      const segElapsed = elapsed - t;
      return {
        index: i, seg: s, next: segs[i + 1] ?? null, done: false,
        segElapsed, segRemaining: s.duration - segElapsed,
        totalRemaining: Number.isFinite(s.duration) ? totalDuration(segs) - elapsed : Infinity,
      };
    }
    t += s.duration;
  }
  return { index: segs.length, seg: null, next: null, done: true, segElapsed: 0, segRemaining: 0, totalRemaining: 0 };
}

// ---------- sessão ----------

export const createSession = (): SessionState => ({ status: 'idle', elapsedBase: 0, runningSince: null });

export const elapsedOf = (s: SessionState, now: number): number =>
  s.elapsedBase + (s.runningSince != null ? (now - s.runningSince) / 1000 : 0);

export function start(s: SessionState, now: number): SessionState {
  if (s.status === 'running') return s;
  return { status: 'running', elapsedBase: s.status === 'done' ? 0 : s.elapsedBase, runningSince: now };
}

export function pause(s: SessionState, now: number): SessionState {
  if (s.status !== 'running') return s;
  return { status: 'paused', elapsedBase: elapsedOf(s, now), runningSince: null };
}

export function seek(s: SessionState, t: number, now: number): SessionState {
  return { ...s, elapsedBase: Math.max(0, t), runningSince: s.status === 'running' ? now : null };
}

/** Pula para o início da próxima fase. */
export function skip(s: SessionState, segs: Segment[], now: number): SessionState {
  const loc = locate(segs, elapsedOf(s, now));
  if (loc.done || !loc.seg || !Number.isFinite(loc.seg.duration)) return s;
  return seek(s, loc.seg.start + loc.seg.duration, now);
}

/** Volta ao início da fase; se já está no início (<2 s), volta à fase anterior. */
export function back(s: SessionState, segs: Segment[], now: number): SessionState {
  const el = elapsedOf(s, now);
  const loc = locate(segs, el);
  const i = loc.done ? segs.length - 1 : loc.index;
  const cur = segs[i];
  const target = el - cur.start > 2 || i === 0 ? cur.start : segs[i - 1].start;
  return seek({ ...s, status: s.status === 'done' ? 'paused' : s.status }, target, now);
}

const isWorkLike = (p?: Phase) => p === 'work' || p === 'emom';

export function isLastWork(segs: Segment[], i: number): boolean {
  if (!isWorkLike(segs[i]?.phase)) return false;
  for (let j = i + 1; j < segs.length; j++) if (isWorkLike(segs[j].phase)) return false;
  return true;
}

/**
 * Eventos entre dois instantes (para sons, voz e vibração).
 * Se o salto for grande (app voltou do segundo plano), só reporta a fase atual,
 * para não disparar uma rajada de sons.
 */
export function eventsBetween(segs: Segment[], prevEl: number, el: number): TimerEvent[] {
  const ev: TimerEvent[] = [];
  if (el <= prevEl) return ev;
  const big = el - prevEl > 2.5;
  const a = locate(segs, prevEl), b = locate(segs, el);
  if (b.done || !b.seg) { if (!a.done) ev.push({ type: 'done' }); return ev; }
  const seg = b.seg;
  if (a.index !== b.index || prevEl === 0) {
    ev.push({ type: 'phase', seg, next: b.next, isLastWork: isLastWork(segs, b.index) });
  }
  if (big) return ev;
  if (Number.isFinite(seg.duration)) {
    for (const n of [3, 2, 1]) {
      const at = seg.start + seg.duration - n;
      if (prevEl < at && el >= at && seg.duration > n) ev.push({ type: 'count', n });
    }
    const half = seg.start + seg.duration / 2;
    const halfable = seg.phase === 'work' || seg.phase === 'amrap' || seg.phase === 'fortime';
    if (halfable && seg.duration >= 20 && prevEl < half && el >= half) ev.push({ type: 'half' });
  } else if (seg.phase === 'run' && seg.lap) {
    const lapsA = Math.floor(Math.max(0, prevEl - seg.start) / seg.lap);
    const lapsB = Math.floor((el - seg.start) / seg.lap);
    if (lapsB > lapsA) ev.push({ type: 'lap', n: lapsB });
  }
  if (Math.floor(el) > Math.floor(prevEl)) ev.push({ type: 'tick' });
  return ev;
}

/** "Rounds restantes" e "ciclos restantes": contam o round/ciclo atual. */
export function remaining(mode: Mode, c: AnyConfig, loc: Location): { rounds: number; cycles: number } {
  if (loc.done || !loc.seg) return { rounds: 0, cycles: 0 };
  if (mode === 'emom') {
    const R = Math.max(1, (c as EmomConfig).rounds | 0);
    return { rounds: loc.seg.phase === 'prepare' ? R : R - (loc.seg.round ?? 1) + 1, cycles: 0 };
  }
  if (mode !== 'tabata' && mode !== 'rounds') return { rounds: 0, cycles: 0 };
  const r = c as TabataConfig;
  const R = Math.max(1, r.rounds | 0), C = mode === 'tabata' ? Math.max(1, r.cycles | 0) : 1;
  const s = loc.seg;
  if (s.phase === 'prepare') return { rounds: R, cycles: C };
  if (s.phase === 'work' || s.phase === 'rest') return { rounds: R - (s.round ?? 1) + 1, cycles: C - (s.cycle ?? 1) + 1 };
  if (s.phase === 'restBC') return { rounds: R, cycles: C - (s.cycle ?? 1) };
  return { rounds: 0, cycles: 0 };
}

/** Cronômetro: volta atual, voltas completas, tempo até o próximo sinal e progresso. */
export function lapInfo(seg: Segment, el: number) {
  const t = Math.max(0, el - seg.start), lap = seg.lap ?? 1;
  return { n: Math.floor(t / lap) + 1, completed: Math.floor(t / lap), toNext: lap - (t % lap), progress: (t % lap) / lap, elapsed: t };
}

export type TimeFormat = '00:00' | '0:00';

/** 125 -> "02:05" (fmt "00:00") ou "2:05" (fmt "0:00"). Arredonda para cima (contagem regressiva). */
export function format(sec: number, fmt: TimeFormat = '00:00'): string {
  if (!Number.isFinite(sec)) return '--:--';
  sec = Math.max(0, Math.ceil(sec - 1e-6));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const mm = fmt === '0:00' && !h ? String(m) : pad(m);
  return (h ? h + ':' : '') + mm + ':' + pad(s);
}

/** Tempo que conta para cima (cronômetro): arredonda para baixo. */
export function formatUp(sec: number): string {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (h ? h + ':' : '') + pad(m) + ':' + pad(s);
}
