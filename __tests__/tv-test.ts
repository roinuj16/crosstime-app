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

import * as Engine from '../src/core/engine';
import { fitWod, parseWod, tvBoard, type TvInput } from '../src/core/tvBoard';
import { STRINGS } from '../src/i18n/strings';

describe('cenas da TV', () => {
  const t = STRINGS.pt;
  const D = Engine.DEFAULTS;
  const board = (p: Partial<TvInput>) => tvBoard({ mode: 'tabata', config: D.tabata, status: 'idle', elapsed: 0, doneAt: 0, rounds: 0, name: null, wod: '', t, fmt: '00:00', ...p });

  it('parada: próximo treino com duração, rounds e trabalho/descanso coloridos', () => {
    const b = board({ name: 'Tabata 20/10 × 8', config: { prepare: 10, work: 20, rest: 10, rounds: 8, cycles: 1, restBC: 0, cooldown: 0 } });
    expect(b.scene).toBe('idle');
    if (b.scene !== 'idle') return;
    expect(b.title).toBe('Tabata 20/10 × 8');
    expect(b.summary.map((s) => s.label)).toEqual(['Duração', 'Rounds', 'Trabalho / descanso']);
    expect(b.summary[2].value).toEqual([{ text: '20s', role: 'work' }, { text: ' / ', role: null }, { text: '10s', role: 'rest' }]);
  });

  it('valendo: round atual, próxima fase e quanto falta', () => {
    const b = board({ status: 'paused', elapsed: 5 + 30 + 15 + 3 }); // round 2, trabalho
    expect(b.scene).toBe('live');
    if (b.scene !== 'live' || b.aside.kind !== 'rounds') throw new Error('cena errada');
    expect(b.aside.round).toEqual({ n: 2, of: 4 });
    expect(b.aside.cycle).toEqual({ n: 1, of: 3 });
    expect(b.aside.next?.label).toBe('Descanso');
    expect(b.paused).toBe(true);
  });

  it('EMOM valendo com WOD: os exercícios aparecem junto com o round', () => {
    const b = board({ mode: 'emom', config: D.emom, status: 'running', elapsed: D.emom.prepare + 6, wod: '10 Sit-ups\n15 Air squats\n10 Push-ups' });
    if (b.scene !== 'live' || b.aside.kind !== 'rounds') throw new Error('cena errada');
    expect(b.aside.round).toEqual({ n: 1, of: D.emom.rounds });
    expect(b.aside.lines.map((l) => l.main)).toEqual(['10 SIT-UPS', '15 AIR SQUATS', '10 PUSH-UPS']);
    // EMOM: só o round atual (sem próximo round e sem o que falta no treino)
    expect(b.aside.next).toBeNull();
    expect(b.aside.remaining).toBeNull();
    const c = board({ mode: 'emom', config: D.emom, status: 'running', elapsed: D.emom.prepare + 6 });
    expect(c.scene === 'live' && c.aside.kind === 'rounds' && c.aside.lines).toEqual([]);
  });

  it('borda acesa na cor da próxima fase nos 3 segundos finais', () => {
    expect((board({ status: 'running', elapsed: 5 + 28 }) as { frame: unknown }).frame).toBe('rest');
    expect((board({ status: 'running', elapsed: 5 + 20 }) as { frame: unknown }).frame).toBeNull();
  });

  it('AMRAP com WOD: lista do treino e contador de rounds; sem WOD, só o contador', () => {
    const b = board({ mode: 'amrap', config: D.amrap, status: 'running', elapsed: 100, rounds: 4, wod: '10 Thrusters 43/30 kg\n15 Pull-ups' });
    if (b.scene !== 'live') throw new Error('cena errada');
    expect(b.aside).toEqual({ kind: 'wod', rounds: 4, lines: [{ main: '10 THRUSTERS', note: '43/30 kg' }, { main: '15 PULL-UPS', note: '' }] });
    const c = board({ mode: 'amrap', config: D.amrap, status: 'running', elapsed: 100, rounds: 2 });
    expect(c.scene === 'live' && c.aside).toEqual({ kind: 'counter', rounds: 2 });
  });

  it('fim: treino concluído com o tempo total', () => {
    const b = board({ status: 'done', doneAt: 0 });
    expect(b.scene).toBe('done');
  });

  it('WOD: linhas vazias somem e o peso vira detalhe', () => {
    expect(parseWod('  \n21-15-9\nRow 500 m\n')).toEqual([{ main: '21-15-9', note: '' }, { main: 'ROW', note: '500 m' }]);
  });
});

describe('WOD cabe na caixa', () => {
  const wod = (n: number) => Array.from({ length: n }, (_, i) => ({ main: `${i + 1}- DUAL DB SNATCH`, note: '' }));
  it('poucos exercícios: letra no máximo', () => {
    expect(fitWod(wod(3), { w: 380, h: 420 }, 36, 20)).toEqual({ size: 36, columns: 1 });
  });
  it('muitos exercícios: letra menor e a lista inteira cabe na altura', () => {
    const f = fitWod(wod(10), { w: 380, h: 420 }, 36, 20);
    expect(f.columns).toBe(1);
    expect(f.size).toBeLessThan(36);
    expect(f.size * 1.45 * 10).toBeLessThanOrEqual(420);
  });
  it('lista enorme: duas colunas', () => {
    const f = fitWod(wod(20).map((l) => ({ ...l, main: 'SIT UP' })), { w: 600, h: 300 }, 36, 20);
    expect(f.columns).toBe(2);
    expect(f.size * 1.45 * 10).toBeLessThanOrEqual(300);
  });
  it('linha comprida diminui a letra para caber na largura', () => {
    const f = fitWod([{ main: 'X'.repeat(40), note: '' }], { w: 380, h: 420 }, 36, 20);
    expect(f.size * 0.42 * 40).toBeLessThanOrEqual(380);
  });
});
