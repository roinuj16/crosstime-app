/// <reference types="jest" />
import { sessionEvents } from '../src/core/usage';

const s = (status: 'idle' | 'running' | 'paused' | 'done', el = 0, mode = 'tabata' as const) => ({ mode, state: { status, elapsedBase: el } });
const planned = () => 240;

describe('eventos de uso', () => {
  it('início, conclusão e zerar no meio', () => {
    expect(sessionEvents(null, s('running'), planned)).toEqual([{ name: 'workout_start', params: { mode: 'tabata', planned_s: 240 } }]);
    expect(sessionEvents(s('running', 100), s('done', 240), planned)[0]).toEqual({ name: 'workout_complete', params: { mode: 'tabata', duration_s: 240, early: false } });
    expect(sessionEvents(s('paused', 61.4), null, planned)).toEqual([{ name: 'workout_reset', params: { mode: 'tabata', elapsed_s: 61 } }]);
  });
  it('pausar e continuar não contam como início; "Terminei" antes do fim marca early', () => {
    expect(sessionEvents(s('paused', 30), s('running', 30), planned)).toEqual([]);
    expect(sessionEvents(s('running', 30), s('paused', 30), planned)).toEqual([]);
    expect(sessionEvents(s('running', 100), s('done', 180), planned)[0].params.early).toBe(true);
  });
  it('repetir depois do fim conta como novo início; zerar um treino concluído não conta', () => {
    expect(sessionEvents(s('done', 240), s('running'), planned)[0].name).toBe('workout_start');
    expect(sessionEvents(s('done', 240), null, planned)).toEqual([]);
  });
});
