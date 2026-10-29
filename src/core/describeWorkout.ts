import * as Engine from './engine';
import type { AnyConfig, Mode, TimeFormat } from './engine';
import type { Strings } from '@/i18n/strings';

/** Resumo curto de um treino, ex.: "00:30 / 00:15 × 4 · 3 ciclos". */
export function describeWorkout(mode: Mode, c: AnyConfig, t: Strings, fmt: TimeFormat): string {
  const f = (s: number) => Engine.format(s, fmt);
  const cc = c as unknown as Record<string, number>;
  switch (mode) {
    case 'tabata': return `${f(cc.work)} / ${f(cc.rest)} × ${cc.rounds}${cc.cycles > 1 ? ` · ${cc.cycles} ${t.edit.fields.cycles.label.toLowerCase()}` : ''}`;
    case 'rounds': return `${f(cc.work)} / ${f(cc.rest)} × ${cc.rounds}`;
    case 'emom': return `${t.edit.fields.interval.label} ${f(cc.interval)} × ${cc.rounds}`;
    case 'amrap': return f(cc.time);
    case 'fortime': return cc.cap > 0 ? `${t.cap} ${f(cc.cap)}` : t.noCap;
    case 'stopwatch': return `${t.phases.lap} ${f(cc.lap)}`;
  }
}
