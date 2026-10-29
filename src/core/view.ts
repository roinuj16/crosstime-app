/**
 * O que a tela do timer mostra, calculado a partir do estado — sem React.
 * Separado da interface para poder ser testado.
 */
import * as Engine from './engine';
import type { AnyConfig, ForTimeConfig, Mode, Phase, SessionStatus, TimeFormat } from './engine';
import type { Strings } from '@/i18n/strings';
import type { ColorRole } from '@/theme/palette';

export const phaseRole = (p: Phase): ColorRole =>
  p === 'emom' || p === 'amrap' ? 'work' : p === 'fortime' ? 'run' : (p as ColorRole);

export interface Band { role: ColorRole | null; label: string; time: string }
export type NextAction = 'skip' | 'count' | null;
export interface Stat { value: number; label: string; role: ColorRole }

export interface TimerView {
  status: SessionStatus;
  accent: ColorRole;
  title: string;
  headerTime: string;
  cur: Band;
  next: Band;
  nextAction: NextAction;
  left: Stat | null;
  right: Stat | 'finish' | null;
  progress: number;
  playLabel: string;
}

interface Input {
  mode: Mode;
  config: AnyConfig;
  status: SessionStatus;
  elapsed: number;
  /** tempo salvo quando o treino terminou (For Time: tempo de chegada) */
  doneAt: number;
  rounds: number;
  name: string | null;
  t: Strings;
  fmt: TimeFormat;
}

export function timerView({ mode, config, status, elapsed, doneAt, rounds, name, t, fmt: tf }: Input): TimerView {
  const fmt = (s: number) => Engine.format(s, tf);
  const segs = Engine.buildSegments(mode, config);
  const total = Engine.totalDuration(segs);
  const title = name ?? t.modes[mode];
  const playLabel = () => ({ idle: t.start, running: t.pause, paused: t.resume, done: t.repeat }[status]);
  const counter = (role: ColorRole = 'lap'): Band => ({ role, label: t.roundsCounter, time: String(rounds) });

  // Treino que passou do fim sem ser fechado (ex.: o app ficou fechado com o timer rodando
  // e foi reaberto depois): mostra como terminado em vez de procurar uma fase que não existe.
  const overrun = status !== 'idle' && status !== 'done' && Engine.locate(segs, elapsed).done;
  if (status === 'done' || overrun) {
    if (overrun) { status = 'done'; doneAt = total; }
    const fortime = mode === 'fortime';
    const cap = (config as ForTimeConfig).cap;
    const hitCap = fortime && cap > 0 && doneAt >= cap;
    const role: ColorRole = fortime || mode === 'stopwatch' ? 'run' : 'work';
    return {
      status, accent: role, title, playLabel: playLabel(),
      headerTime: fortime ? Engine.formatUp(doneAt) : fmt(total),
      cur: { role, label: hitCap ? t.timeCap : t.done, time: fortime ? Engine.formatUp(doneAt) : fmt(total) },
      next: Engine.tapsRounds(mode) ? counter() : { role: null, label: t.greatJob, time: '' },
      nextAction: null,
      left: mode === 'tabata' || mode === 'rounds' || mode === 'emom' ? { value: 0, label: t.roundsLeft, role: 'rounds' } : null,
      right: mode === 'tabata' ? { value: 0, label: t.cyclesLeft, role: 'cycles' } : null,
      progress: 1,
    };
  }

  const el = status === 'idle' ? 0 : elapsed;
  const loc = Engine.locate(segs, el);
  const seg = loc.seg!;
  const active = status === 'running' || status === 'paused';

  // Cronômetro livre: conta para cima; a faixa do meio é o TIME LAP
  if (seg.phase === 'run') {
    const L = Engine.lapInfo(seg, status === 'idle' ? seg.start : el);
    return {
      status, accent: 'run', title, playLabel: playLabel(),
      headerTime: Engine.formatUp(el),
      cur: { role: 'run', label: t.phases.run, time: Engine.formatUp(L.elapsed) },
      next: { role: 'lap', label: status === 'idle' ? t.phases.lap : `${t.phases.lap} · ${t.lapN(L.n)}`, time: fmt(status === 'idle' ? seg.lap ?? 0 : L.toNext) },
      nextAction: null,
      left: { value: L.completed, label: t.lapsDone, role: 'lap' },
      right: null,
      progress: status === 'idle' ? 0 : L.progress,
    };
  }

  // AMRAP e For Time: a faixa do meio vira o contador de rounds (toque +1)
  if (seg.phase === 'amrap' || seg.phase === 'fortime') {
    const up = seg.phase === 'fortime';
    const t0 = el - seg.start;
    const capped = Number.isFinite(seg.duration);
    return {
      status, accent: phaseRole(seg.phase), title, playLabel: playLabel(),
      headerTime: up ? (capped ? `${t.cap} ${fmt(seg.duration - t0)}` : Engine.formatUp(el)) : fmt(loc.totalRemaining),
      cur: { role: phaseRole(seg.phase), label: t.phases[seg.phase], time: up ? Engine.formatUp(t0) : fmt(loc.segRemaining) },
      next: counter(),
      nextAction: active ? 'count' : null,
      left: null,
      right: up && active ? 'finish' : null,
      progress: capped ? t0 / seg.duration : 0,
    };
  }

  // Fases com contagem regressiva (preparar, trabalho, descanso, EMOM...)
  const label = seg.phase === 'emom' ? `${t.phases.emom} ${seg.round}/${seg.rounds}` : t.phases[seg.phase];
  const n = loc.next;
  let next: Band;
  if (!n) next = { role: null, label: t.endOfWorkout, time: '' };
  else if (n.phase === 'run') next = { role: 'lap', label: t.phases.lap, time: fmt(n.lap ?? 0) };
  else if (n.phase === 'fortime') next = { role: 'run', label: t.phases.fortime, time: Number.isFinite(n.duration) ? `${t.cap} ${fmt(n.duration)}` : t.noCap };
  else if (n.phase === 'emom') next = { role: 'work', label: `${t.phases.emom} ${n.round}/${n.rounds}`, time: fmt(n.duration) };
  else next = { role: phaseRole(n.phase), label: t.phases[n.phase], time: fmt(n.duration) };

  const rem = Engine.remaining(mode, config, loc);
  let left: Stat | null = null;
  let right: Stat | null = null;
  if (mode === 'tabata') { left = { value: rem.rounds, label: t.roundsLeft, role: 'rounds' }; right = { value: rem.cycles, label: t.cyclesLeft, role: 'cycles' }; }
  else if (mode === 'rounds' || mode === 'emom') left = { value: rem.rounds, label: t.roundsLeft, role: 'rounds' };
  else if (mode === 'stopwatch') left = { value: 0, label: t.lapsDone, role: 'lap' };

  const headerTime = mode === 'stopwatch' ? Engine.formatUp(el)
    : mode === 'fortime' ? ((config as ForTimeConfig).cap > 0 ? `${t.cap} ${fmt((config as ForTimeConfig).cap)}` : t.noCap)
    : fmt(status === 'idle' ? total : loc.totalRemaining);

  return {
    status, accent: phaseRole(seg.phase), title, playLabel: playLabel(), headerTime,
    cur: { role: phaseRole(seg.phase), label, time: fmt(status === 'idle' ? seg.duration : loc.segRemaining) },
    next,
    nextAction: active && !!n ? 'skip' : null,
    left, right,
    progress: status === 'idle' ? 0 : loc.segElapsed / seg.duration,
  };
}
