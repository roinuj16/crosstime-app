/**
 * Controle remoto do modo TV: transforma uma tecla em uma ação do timer.
 * Os controles de smart TV, Fire TV e Google TV mandam as setas, o OK (Enter)
 * e o voltar (Escape/Backspace) como teclas de teclado; um teclado comum também serve.
 * Só decisão, sem React, para poder testar.
 */
import type { SessionStatus } from './engine';

export type TvAction =
  | 'toggle' | 'skip' | 'back' | 'finish'
  | 'roundUp' | 'roundDown'
  | 'modePrev' | 'modeNext'
  | 'armReset' | 'reset';

export interface TvContext {
  status: SessionStatus;
  /** o modo tem contador de rounds manual (AMRAP, For Time) */
  tapsRounds: boolean;
  /** For Time valendo: pular = "Terminei" */
  fortimeRunning: boolean;
  /** já apertou voltar uma vez (zerar pede confirmação) */
  resetArmed: boolean;
}

const PLAY = new Set(['Enter', ' ', 'Spacebar', 'MediaPlayPause', 'MediaPlay', 'MediaPause', 'Select']);
const NEXT = new Set(['ArrowRight', 'MediaTrackNext', 'MediaFastForward']);
const PREV = new Set(['ArrowLeft', 'MediaTrackPrevious', 'MediaRewind']);
const RESET = new Set(['Escape', 'Backspace', 'GoBack', 'BrowserBack', 'r', 'R', 'MediaStop']);

export function tvAction(key: string, c: TvContext): TvAction | null {
  const active = c.status === 'running' || c.status === 'paused';
  if (PLAY.has(key)) return 'toggle';
  if (NEXT.has(key)) return active ? (c.fortimeRunning ? 'finish' : 'skip') : 'modeNext';
  if (PREV.has(key)) return active ? 'back' : 'modePrev';
  if (key === 'ArrowUp') return active && c.tapsRounds ? 'roundUp' : null;
  if (key === 'ArrowDown') return active && c.tapsRounds ? 'roundDown' : null;
  if (RESET.has(key)) {
    if (c.status === 'idle') return null;
    if (c.status === 'done') return 'reset';
    return c.resetArmed ? 'reset' : 'armReset';
  }
  return null;
}

/** Modo seguinte ou anterior na lista, dando a volta. */
export function cycleMode<T>(list: readonly T[], current: T, dir: 1 | -1): T {
  const i = list.indexOf(current);
  return list[(i + dir + list.length) % list.length];
}
