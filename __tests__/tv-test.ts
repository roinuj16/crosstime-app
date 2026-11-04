/// <reference types="jest" />
import { cycleMode, tvAction, type TvContext } from '../src/core/tvKeys';

const base: TvContext = { status: 'idle', tapsRounds: false, fortimeRunning: false, resetArmed: false };
const at = (patch: Partial<TvContext>) => ({ ...base, ...patch });

describe('controle remoto do modo TV', () => {
  it('OK, espaço e play/pause do controle iniciam e pausam', () => {
    for (const k of ['Enter', ' ', 'MediaPlayPause']) expect(tvAction(k, base)).toBe('toggle');
    expect(tvAction('Enter', at({ status: 'running' }))).toBe('toggle');
  });

  it('parado: as setas trocam de modo; valendo: pulam e voltam fase', () => {
    expect(tvAction('ArrowRight', base)).toBe('modeNext');
    expect(tvAction('ArrowLeft', at({ status: 'done' }))).toBe('modePrev');
    expect(tvAction('ArrowRight', at({ status: 'running' }))).toBe('skip');
    expect(tvAction('ArrowLeft', at({ status: 'paused' }))).toBe('back');
  });

  it('For Time valendo: a seta para a direita é "Terminei"', () => {
    expect(tvAction('ArrowRight', at({ status: 'running', fortimeRunning: true }))).toBe('finish');
  });

  it('AMRAP e For Time: cima e baixo contam rounds só com o treino valendo', () => {
    expect(tvAction('ArrowUp', at({ status: 'running', tapsRounds: true }))).toBe('roundUp');
    expect(tvAction('ArrowDown', at({ status: 'paused', tapsRounds: true }))).toBe('roundDown');
    expect(tvAction('ArrowUp', at({ tapsRounds: true }))).toBeNull();
    expect(tvAction('ArrowUp', at({ status: 'running' }))).toBeNull();
  });

  it('voltar zera só com confirmação; no fim zera direto; parado não faz nada', () => {
    expect(tvAction('Escape', at({ status: 'running' }))).toBe('armReset');
    expect(tvAction('Backspace', at({ status: 'paused', resetArmed: true }))).toBe('reset');
    expect(tvAction('Escape', at({ status: 'done' }))).toBe('reset');
    expect(tvAction('Escape', base)).toBeNull();
  });

  it('teclas desconhecidas são ignoradas', () => {
    expect(tvAction('a', at({ status: 'running' }))).toBeNull();
  });

  it('a troca de modo dá a volta na lista', () => {
    const modes = ['tabata', 'rounds', 'emom'] as const;
    expect(cycleMode(modes, 'emom', 1)).toBe('tabata');
    expect(cycleMode(modes, 'tabata', -1)).toBe('emom');
  });
});
