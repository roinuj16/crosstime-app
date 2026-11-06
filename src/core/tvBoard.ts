/**
 * O que a TV do box mostra em cada momento (sem React, testado).
 * Três cenas, como no design aprovado:
 *  - idle: "Próximo treino" com o resumo (duração, rounds, trabalho/descanso) e o WOD;
 *  - live: fase e relógio gigantes, barra de progresso e a coluna da direita
 *          (round, próxima fase e quanto falta, com os exercícios do WOD quando houver;
 *          no AMRAP/For Time, o WOD com o contador de rounds);
 *  - done: "Treino concluído", o tempo e "Mandou bem!".
 */
import * as Engine from './engine';
import type { AnyConfig, Mode, SessionStatus, TimeFormat } from './engine';
import { phaseRole, timerView } from './view';
import type { Strings } from '@/i18n/strings';
import type { ColorRole } from '@/theme/palette';

/** Um pedaço de texto com a cor de uma fase (ex.: "20s" verde / "10s" vermelho). */
export interface Piece { text: string; role: ColorRole | null }
export interface SummaryItem { label: string; value: Piece[] }
export interface WodLine { main: string; note: string }

export type TvAside =
  | { kind: 'rounds'; round: { n: number; of: number } | null; cycle: { n: number; of: number } | null; next: { label: string; time: string; role: ColorRole | null } | null; remaining: string | null; lines: WodLine[] }
  | { kind: 'wod'; lines: WodLine[]; rounds: number }
  | { kind: 'counter'; rounds: number }
  | { kind: 'laps'; lap: number; completed: number; next: { label: string; time: string }; lines: WodLine[] };

export type TvBoard =
  | { scene: 'idle'; title: string; accent: ColorRole; summary: SummaryItem[]; wod: WodLine[] }
  | { scene: 'live'; title: string; label: string; time: string; role: ColorRole; progress: number; paused: boolean; frame: ColorRole | null; aside: TvAside }
  | { scene: 'done'; title: string; label: string; time: string; role: ColorRole };

export interface TvInput {
  mode: Mode; config: AnyConfig; status: SessionStatus; elapsed: number; doneAt: number; rounds: number;
  name: string | null; wod: string; t: Strings; fmt: TimeFormat;
}

/** "10 Thrusters 43/30 kg" → principal "10 THRUSTERS" + detalhe "43/30 kg" (fica menor na TV). */
export function parseWod(text: string): WodLine[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = l.match(/^(.*?)\s+(\(?[\d.,/]+\s?(?:kg|lb|lbs|cal|m|km|"|”)\)?)$/i);
    return m ? { main: m[1].toUpperCase(), note: m[2] } : { main: l.toUpperCase(), note: '' };
  });
}

/**
 * Tamanho da letra do WOD para caber na caixa (altura × largura), com limite máximo e mínimo.
 * Lista longa: diminui a letra; se ainda não couber no mínimo, divide em duas colunas.
 * Conta aproximada da fonte da TV (Teko): cada linha ocupa ~1,45 × o tamanho (com o espaço
 * entre linhas) e cada letra maiúscula ~0,42 × o tamanho de largura. A lista ainda mede o
 * resultado e encolhe se passar (WodList).
 */
export function fitWod(lines: WodLine[], box: { w: number; h: number }, max: number, min: number): { size: number; columns: 1 | 2 } {
  const n = Math.max(1, lines.length);
  const chars = Math.max(1, ...lines.map((l) => l.main.length + (l.note ? l.note.length * 0.68 + 1 : 0)));
  const fit = (cols: number) => {
    const rows = Math.ceil(n / cols);
    const colW = (box.w - (cols - 1) * box.w * 0.06) / cols;
    return Math.min(max, box.h / (rows * LINE), colW / (chars * CHAR));
  };
  const one = fit(1);
  if (one >= min || n < 6) return { size: one, columns: 1 };
  const two = fit(2);
  return two > one ? { size: two, columns: 2 } : { size: one, columns: 1 };
}
const LINE = 1.45;
const CHAR = 0.42;

/** Segundos curtos como "20s"; acima de 1 minuto, "1:30". */
const short = (s: number, fmt: TimeFormat) => (s < 60 ? `${s}s` : Engine.format(s, fmt));

export function summary(mode: Mode, c: AnyConfig, t: Strings, fmt: TimeFormat): SummaryItem[] {
  const T = t.tv;
  const cc = c as unknown as Record<string, number>;
  const total = Engine.totalDuration(Engine.buildSegments(mode, c));
  const dur: SummaryItem = { label: T.duration, value: [{ text: Engine.format(total, fmt), role: null }] };
  switch (mode) {
    case 'tabata':
    case 'rounds': {
      const cycles = mode === 'tabata' ? Math.max(1, cc.cycles | 0) : 1;
      return [
        dur,
        { label: T.rounds, value: [{ text: cycles > 1 ? `${cc.rounds} × ${cycles}` : String(cc.rounds), role: 'rounds' }] },
        { label: T.workRest, value: [{ text: short(cc.work, fmt), role: 'work' }, { text: ' / ', role: null }, { text: short(cc.rest, fmt), role: 'rest' }] },
      ];
    }
    case 'emom':
      return [dur, { label: T.rounds, value: [{ text: String(cc.rounds), role: 'rounds' }] }, { label: T.every, value: [{ text: Engine.format(cc.interval, fmt), role: 'work' }] }];
    case 'amrap':
      return [dur];
    case 'fortime':
      return [{ label: T.cap, value: [{ text: cc.cap > 0 ? Engine.format(cc.cap, fmt) : t.noCap, role: 'run' }] }];
    case 'stopwatch':
      return [{ label: T.lap, value: [{ text: Engine.format(cc.lap, fmt), role: 'lap' }] }];
  }
}

export function tvBoard(i: TvInput): TvBoard {
  const { mode, config, status, t } = i;
  const v = timerView({ mode, config, status, elapsed: i.elapsed, doneAt: i.doneAt, rounds: i.rounds, name: i.name, t, fmt: i.fmt });
  const title = i.name ?? t.modes[mode];
  const wod = parseWod(i.wod);

  if (v.status === 'idle') {
    return { scene: 'idle', title, accent: v.accent, summary: summary(mode, config, t, i.fmt), wod };
  }
  if (v.status === 'done') {
    return { scene: 'done', title, label: v.cur.label, time: v.cur.time, role: v.cur.role ?? 'work' };
  }

  const segs = Engine.buildSegments(mode, config);
  const loc = Engine.locate(segs, i.elapsed);
  const seg = loc.seg!;
  // 3 segundos finais: a borda da TV acende na cor da próxima fase ("o trabalho vem aí")
  const frame = status === 'running' && loc.next && Number.isFinite(seg.duration) && loc.segRemaining <= 3 ? phaseRole(loc.next.phase) : null;

  let aside: TvAside;
  if (mode === 'stopwatch' && seg.phase === 'run') {
    const L = Engine.lapInfo(seg, i.elapsed);
    aside = { kind: 'laps', lap: L.n, completed: L.completed, next: { label: v.next.label, time: v.next.time }, lines: wod };
  } else if (Engine.tapsRounds(mode)) {
    aside = wod.length ? { kind: 'wod', lines: wod, rounds: i.rounds } : { kind: 'counter', rounds: i.rounds };
  } else {
    // EMOM: todo round é igual, então "próximo round" e "falta no treino" só confundiam;
    // a coluna mostra só o round atual (ex.: 1/10), centralizado
    const emom = mode === 'emom';
    const remaining = !emom && Number.isFinite(loc.totalRemaining) ? Engine.format(loc.totalRemaining, i.fmt) : null;
    aside = {
      kind: 'rounds',
      round: seg.round && seg.rounds ? { n: seg.round, of: seg.rounds } : null,
      cycle: seg.cycles && seg.cycles > 1 && seg.cycle ? { n: seg.cycle, of: seg.cycles } : null,
      next: loc.next && !emom ? { label: v.next.label, time: v.next.time, role: v.next.role } : null,
      remaining,
      lines: wod, // os exercícios do WOD também aparecem com o treino valendo (EMOM, Tabata, Rounds)
    };
  }
  return {
    scene: 'live', title, label: v.cur.label, time: v.cur.time, role: v.cur.role ?? v.accent,
    progress: v.progress, paused: status === 'paused', frame, aside,
  };
}
