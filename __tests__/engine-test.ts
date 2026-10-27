/// <reference types="jest" />
import {
  DEFAULTS, back, buildSegments, createSession, elapsedOf, eventsBetween, format, formatUp,
  isLastWork, lapInfo, locate, pause, remaining, seek, skip, start, totalDuration,
} from '../src/core/engine';

const tabata = buildSegments('tabata', DEFAULTS.tabata);
const rounds = buildSegments('rounds', DEFAULTS.rounds);
const sw = buildSegments('stopwatch', DEFAULTS.stopwatch);
const types = (ev: ReturnType<typeof eventsBetween>) => ev.map((e) => e.type + ('n' in e ? e.n : ''));

describe('linha do tempo (conferida contra o app de referência)', () => {
  it('total do Tabata padrão é 09:50', () => expect(format(totalDuration(tabata))).toBe('09:50'));
  it('total do Rounds padrão é 03:20', () => expect(format(totalDuration(rounds))).toBe('03:20'));
  it('pula o último descanso de cada ciclo', () => {
    expect(tabata).toHaveLength(1 + 3 * (4 + 3) + 2 + 1);
    expect(tabata.filter((s) => s.phase === 'rest')).toHaveLength(9);
  });
  it('localiza a fase pelo tempo decorrido', () => {
    expect(locate(tabata, 0).seg?.phase).toBe('prepare');
    expect(locate(tabata, 5).seg?.phase).toBe('work');
    expect(locate(tabata, 35).seg?.phase).toBe('rest');
    expect(locate(tabata, 590).done).toBe(true);
  });
  it('aos 30 s mostra 09:20 no total e 00:05 no trabalho (igual ao app de referência)', () => {
    expect(format(locate(tabata, 30).totalRemaining)).toBe('09:20');
    expect(format(locate(tabata, 30).segRemaining)).toBe('00:05');
  });
});

describe('sessão', () => {
  it('conta, pausa e retoma', () => {
    let s = start(createSession(), 1000);
    expect(elapsedOf(s, 11000)).toBe(10);
    s = pause(s, 11000);
    expect(elapsedOf(s, 99999)).toBe(10);
    s = start(s, 20000);
    expect(elapsedOf(s, 25000)).toBe(15);
  });
  it('continua contando se o app for fechado (estado salvo em JSON)', () => {
    const s = start(createSession(), 0);
    const saved = JSON.parse(JSON.stringify(s));
    expect(elapsedOf(saved, 60000)).toBe(60);
  });
  it('pula e volta fases', () => {
    let s = skip(seek(createSession(), 7, 0), tabata, 0);
    expect(elapsedOf(s, 0)).toBe(35);
    s = back(s, tabata, 0);
    expect(elapsedOf(s, 0)).toBe(5);
    s = back(seek(s, 40, 0), tabata, 0);
    expect(elapsedOf(s, 0)).toBe(35);
  });
});

describe('eventos', () => {
  it('contagem 3-2-1', () => expect(types(eventsBetween(tabata, 31.9, 32.1))).toEqual(['count3', 'tick']));
  it('troca de fase', () => expect(types(eventsBetween(tabata, 34.9, 35.05))).toEqual(['phase', 'tick']));
  it('salto grande só reporta a fase', () => expect(types(eventsBetween(tabata, 10, 200))).toEqual(['phase']));
  it('fim do treino', () => expect(types(eventsBetween(tabata, 589.5, 590.2))).toEqual(['done']));
  it('volta do cronômetro (time lap)', () => expect(types(eventsBetween(sw, 24.9, 25.1))).toEqual(['lap2', 'tick']));
  it('identifica o último trabalho', () => {
    const last = tabata.map((s) => s.phase).lastIndexOf('work');
    expect(isLastWork(tabata, last)).toBe(true);
    expect(isLastWork(tabata, 1)).toBe(false);
  });
});

describe('contadores', () => {
  const r = (el: number) => remaining('tabata', DEFAULTS.tabata, locate(tabata, el));
  it('rounds e ciclos restantes contam o atual', () => {
    expect(r(0)).toEqual({ rounds: 4, cycles: 3 });
    expect(r(10)).toEqual({ rounds: 4, cycles: 3 });
    expect(r(50)).toEqual({ rounds: 3, cycles: 3 });
    expect(r(5 + 165 + 1)).toEqual({ rounds: 4, cycles: 2 });
    expect(r(590)).toEqual({ rounds: 0, cycles: 0 });
  });
  it('time lap do cronômetro', () => {
    expect(lapInfo(sw[1], 27)).toEqual({ n: 3, completed: 2, toNext: 8, progress: 0.2, elapsed: 22 });
  });
});

describe('formatação', () => {
  it('formato curto', () => expect(format(65, '0:00')).toBe('1:05'));
  it('arredonda para cima na contagem regressiva', () => expect(format(4.2)).toBe('00:05'));
  it('cronômetro arredonda para baixo', () => expect(formatUp(4.9)).toBe('00:04'));
  it('horas', () => expect(format(3725)).toBe('1:02:05'));
});
