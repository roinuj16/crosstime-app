/**
 * Avisos de segundo plano: quando o app sai da tela no meio do treino, cada troca de
 * fase futura vira uma notificação agendada. Assim o aviso chega mesmo que o sistema
 * congele ou feche o app. Aqui só se calcula a lista (testável).
 */
import * as Engine from './engine';
import type { AnyConfig, Mode, Segment, StopwatchConfig, TimeFormat } from './engine';
import type { Strings } from '@/i18n/strings';

export interface Alert { at: number; title: string; body: string; kind: 'phase' | 'lap' | 'done' }

/** O sistema iOS guarda no máximo 64 notificações pendentes; deixamos folga. */
export const MAX_ALERTS = 60;

function title(seg: Segment, t: Strings): string {
  const p = t.phases[seg.phase].toUpperCase();
  if (seg.phase === 'work' && (seg.rounds ?? 1) > 1) return `${p} · ROUND ${seg.round}/${seg.rounds}`;
  if (seg.phase === 'emom') return `${p} ${seg.round}/${seg.rounds}`;
  return p;
}

function body(seg: Segment, t: Strings, fmt: TimeFormat): string {
  if (seg.phase === 'run') return `${t.phases.lap} ${Engine.format(seg.lap ?? 0, fmt)}`;
  if (seg.phase === 'fortime') return Number.isFinite(seg.duration) ? `${t.cap} ${Engine.format(seg.duration, fmt)}` : t.noCap;
  return Engine.format(seg.duration, fmt);
}

/**
 * Lista os próximos avisos a partir de agora.
 * @param elapsed tempo decorrido do treino (s)
 * @param now relógio de parede (ms)
 */
export function upcomingAlerts(mode: Mode, config: AnyConfig, elapsed: number, now: number, t: Strings, fmt: TimeFormat, limit = MAX_ALERTS): Alert[] {
  const segs = Engine.buildSegments(mode, config);
  const at = (sec: number) => now + Math.round((sec - elapsed) * 1000);
  const out: Alert[] = [];

  for (const seg of segs) {
    if (seg.start > elapsed + 0.5) out.push({ at: at(seg.start), title: title(seg, t), body: body(seg, t, fmt), kind: 'phase' });
  }

  const total = Engine.totalDuration(segs);
  const last = segs[segs.length - 1];
  if (last && Number.isFinite(last.duration) && total > elapsed + 0.5) {
    const capHit = mode === 'fortime';
    out.push({ at: at(total), title: (capHit ? t.timeCap : t.done).toUpperCase(), body: t.greatJob, kind: 'done' });
  }

  // cronômetro: um aviso a cada volta, até completar o limite
  const run = segs.find((s) => s.phase === 'run');
  if (mode === 'stopwatch' && run) {
    const lap = Math.max(1, (config as StopwatchConfig).lap);
    let n = Math.max(1, Math.floor((elapsed - run.start) / lap) + 1);
    while (out.length < limit) {
      const sec = run.start + n * lap;
      if (sec > elapsed + 0.5) out.push({ at: at(sec), title: t.lapN(n).toUpperCase(), body: `${t.phases.run} ${Engine.formatUp(sec - run.start)}`, kind: 'lap' });
      n++;
    }
  }

  return out.sort((a, b) => a.at - b.at).slice(0, limit);
}
