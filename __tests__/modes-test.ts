/// <reference types="jest" />
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'pt', languageTag: 'pt-BR' }] }));

import * as Engine from '../src/core/engine';
import { timerView } from '../src/core/view';
import { STRINGS } from '../src/i18n/strings';

const t = STRINGS.pt;
const D = Engine.DEFAULTS;
const types = (ev: Engine.TimerEvent[]) => ev.map((e) => e.type + ('n' in e ? e.n : ''));
const view = (mode: Engine.Mode, status: Engine.SessionStatus, elapsed: number, extra: Partial<Parameters<typeof timerView>[0]> = {}) =>
  timerView({ mode, config: D[mode], status, elapsed, doneAt: 0, rounds: 0, name: null, t, fmt: '00:00', ...extra });

describe('EMOM', () => {
  const segs = Engine.buildSegments('emom', D.emom);
  it('10 intervalos de 1 min depois do preparar (total 10:10)', () => {
    expect(segs.filter((s) => s.phase === 'emom')).toHaveLength(10);
    expect(Engine.format(Engine.totalDuration(segs))).toBe('10:10');
  });
  it('toca a cada novo minuto e faz contagem 3-2-1', () => {
    expect(types(Engine.eventsBetween(segs, 69.9, 70.05))).toEqual(['phase', 'tick']);
    expect(types(Engine.eventsBetween(segs, 66.9, 67.1))).toEqual(['count3', 'tick']);
  });
  it('mostra o minuto atual e os rounds restantes', () => {
    const v = view('emom', 'running', 75);
    expect(v.cur.label).toBe('EMOM 2/10');
    expect(v.cur.time).toBe('00:55');
    expect(v.next.label).toBe('EMOM 3/10');
    expect(v.left).toMatchObject({ value: 9 });
  });
  it('o último intervalo é o "último round"', () => expect(Engine.isLastWork(segs, segs.length - 1)).toBe(true));
});

describe('AMRAP', () => {
  const segs = Engine.buildSegments('amrap', D.amrap);
  it('uma contagem regressiva de 12 min', () => {
    expect(segs.map((s) => s.phase)).toEqual(['prepare', 'amrap']);
    expect(Engine.format(Engine.totalDuration(segs))).toBe('12:10');
  });
  it('avisa na metade', () => expect(types(Engine.eventsBetween(segs, 369.9, 370.1))).toEqual(['half', 'tick']));
  it('a faixa do meio vira o contador de rounds tocável', () => {
    const v = view('amrap', 'running', 70, { rounds: 4 });
    expect(v.cur).toMatchObject({ label: 'AMRAP', time: '11:00' });
    expect(v.next).toMatchObject({ label: 'Rounds', time: '4' });
    expect(v.nextAction).toBe('count');
    expect(v.right).toBeNull();
  });
});

describe('For Time', () => {
  const segs = Engine.buildSegments('fortime', D.fortime);
  it('conta para cima com time cap de 20 min', () => {
    const v = view('fortime', 'running', 75);
    expect(v.cur).toMatchObject({ label: 'For Time', time: '01:05' });
    expect(v.headerTime).toBe('Cap 18:55');
    expect(v.right).toBe('finish');
  });
  it('sem time cap não termina sozinho', () => {
    const free = Engine.buildSegments('fortime', { prepare: 10, cap: 0 });
    expect(Engine.locate(free, 99999).done).toBe(false);
    expect(view('fortime', 'idle', 0, { config: { prepare: 10, cap: 0 } }).headerTime).toBe('Sem limite');
  });
  it('3-2-1 antes do time cap', () => expect(types(Engine.eventsBetween(segs, 1206.9, 1207.1))).toEqual(['count3', 'tick']));
  it('tela final mostra "Time cap" quando o tempo acaba', () => {
    expect(view('fortime', 'done', 0, { doneAt: 1200 }).cur.label).toBe('Time cap');
    expect(view('fortime', 'done', 0, { doneAt: 754 }).cur).toMatchObject({ label: 'Concluído', time: '12:34' });
  });
});

describe('modos antigos continuam iguais na tela', () => {
  it('Tabata parado', () => {
    const v = view('tabata', 'idle', 0);
    expect(v.cur).toMatchObject({ role: 'prepare', label: 'Preparar', time: '00:05' });
    expect(v.next).toMatchObject({ role: 'work', label: 'Trabalho', time: '00:30' });
    expect(v.headerTime).toBe('09:50');
    expect(v.left).toMatchObject({ value: 4 });
    expect(v.right).toMatchObject({ value: 3 });
  });
  it('cronômetro mostra o time lap', () => {
    const v = view('stopwatch', 'running', 27);
    expect(v.cur.time).toBe('00:22');
    expect(v.next).toMatchObject({ label: 'Tempo de volta · Volta 3', time: '00:08' });
  });
});

describe('treino que passou do fim sem ser fechado', () => {
  // ex.: o app ficou fechado com o timer rodando e foi reaberto horas depois
  it('a tela mostra o treino como terminado, sem quebrar', () => {
    for (const mode of ['tabata', 'rounds', 'emom', 'amrap'] as const) {
      const total = Engine.totalDuration(Engine.buildSegments(mode, D[mode]));
      const v = view(mode, 'running', total + 3 * 3600);
      expect([mode, v.status, v.cur.label, v.progress]).toEqual([mode, 'done', t.done, 1]);
      expect(v.playLabel).toBe(t.repeat);
    }
  });
});
