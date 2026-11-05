/**
 * WOD por modo: o coach escreve um treino para cada modo (ex.: Tabata de aquecimento,
 * EMOM e AMRAP) e a TV mostra só o do modo que está na tela. O cronômetro não tem WOD.
 */
import type { Mode } from './engine';

export type WodMode = Exclude<Mode, 'stopwatch'>;
export const WOD_MODES: WodMode[] = ['tabata', 'rounds', 'emom', 'amrap', 'fortime'];
export type Wods = Partial<Record<WodMode, string>>;

export const isWodMode = (m: Mode): m is WodMode => (WOD_MODES as Mode[]).includes(m);

/** O WOD do modo (vazio se não tiver, ou no cronômetro). */
export const wodFor = (wods: Wods | undefined, mode: Mode): string => (isWodMode(mode) ? wods?.[mode] ?? '' : '');

/** Só os modos com texto (para guardar e enviar sem campos vazios). */
export function compactWods(wods: Wods | undefined): Wods {
  const out: Wods = {};
  for (const m of WOD_MODES) { const v = wods?.[m]; if (v && v.trim()) out[m] = v; }
  return out;
}
