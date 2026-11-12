/// <reference types="jest" />
import {
  addReps, canSkip, completeRun, finished, formatClock, planSets, progress, quit, rankScore, setsPerMove, skip, startState,
  totalReps, type MurphPlan, type MurphState,
} from '@/core/murph';

const cindy: MurphPlan = { pu: 5, ps: 10, sq: 15 };
const twenty: MurphPlan = { pu: 20, ps: 20, sq: 20 };

/** Faz o treino todo seguindo o plano, série a série. */
function runAll(plan: MurphPlan): MurphState {
  let s = completeRun(startState(), plan, 0);
  let guard = 0;
  while (s.phase === 'block' && guard++ < 1000) s = addReps(s, plan, s.setTarget - s.setDone);
  return completeRun(s, plan, 2_537_000);
}

describe('Murph sem quebra', () => {
  it('100 pull-ups, depois 200 push-ups, depois 300 air squats', () => {
    expect(planSets(null)).toEqual([{ move: 'pu', reps: 100 }, { move: 'ps', reps: 200 }, { move: 'sq', reps: 300 }]);
  });
  it('não deixa pular', () => {
    const s = completeRun(startState(), null, 0);
    expect(canSkip(s, null)).toBe(false);
    expect(skip(s, null)).toBe(s);
  });
  it('termina sozinho ao marcar a última corrida, com o tempo daquele momento', () => {
    const s = runAll(null);
    expect(s.phase).toBe('done');
    expect(finished(s)).toBe(true);
    expect(s.finishedAt).toBe(2_537_000);
    expect(totalReps(s)).toBe(600);
    expect(progress(s)).toBeCloseTo(1);
  });
});

describe('Murph com quebras', () => {
  it('5/10/15: 20 rodadas alternando pull-up, push-up e air squat', () => {
    const sets = planSets(cindy);
    expect(sets).toHaveLength(60);
    expect(sets.slice(0, 4)).toEqual([{ move: 'pu', reps: 5 }, { move: 'ps', reps: 10 }, { move: 'sq', reps: 15 }, { move: 'pu', reps: 5 }]);
    expect(setsPerMove(cindy)).toEqual({ pu: { sets: 20, size: 5, last: 5 }, ps: { sets: 20, size: 10, last: 10 }, sq: { sets: 20, size: 15, last: 15 } });
  });
  it('de 20 em 20: pull-ups acabam primeiro e o rodízio segue com o que falta', () => {
    const sets = planSets(twenty);
    expect(sets.filter((x) => x.move === 'pu')).toHaveLength(5);
    expect(sets.filter((x) => x.move === 'ps')).toHaveLength(10);
    expect(sets.filter((x) => x.move === 'sq')).toHaveLength(15);
    // rodadas 1–5 com os três; depois só push-up e air squat; no fim só air squat
    expect(sets.slice(15, 17).map((x) => x.move)).toEqual(['ps', 'sq']);
    expect(sets.slice(-5).every((x) => x.move === 'sq')).toBe(true);
  });
  it('fechou a série: passa sozinho para o próximo movimento', () => {
    let s = completeRun(startState(), twenty, 0);
    expect(s).toMatchObject({ phase: 'block', cur: 'pu', setTarget: 20 });
    s = addReps(s, twenty, 10);
    s = addReps(s, twenty, 10);
    expect(s).toMatchObject({ cur: 'ps', setDone: 0, setTarget: 20 });
    expect(s.done.pu).toBe(20);
  });
  it('+10 não passa da série', () => {
    let s = completeRun(startState(), cindy, 0); // 5 pull-ups
    s = addReps(s, cindy, 10);
    expect(s.done.pu).toBe(5);
    expect(s.cur).toBe('ps');
  });
  it('pular: o que faltou volta somado na próxima série do movimento', () => {
    let s = completeRun(startState(), twenty, 0);
    s = addReps(s, twenty, 15); // 15 de 20 pull-ups
    expect(canSkip(s, twenty)).toBe(true);
    s = skip(s, twenty);
    expect(s).toMatchObject({ cur: 'ps', setTarget: 20 });
    s = addReps(s, twenty, 20); // push-ups
    s = addReps(s, twenty, 20); // air squats
    expect(s).toMatchObject({ cur: 'pu', setTarget: 25 }); // 20 + 5 que faltaram
  });
  it('não pula quando só falta o movimento atual', () => {
    let s: MurphState = { ...completeRun(startState(), twenty, 0), done: { pu: 100, ps: 200, sq: 280 } };
    s = { ...s, cur: 'sq', setDone: 0, setTarget: 20 };
    expect(canSkip(s, twenty)).toBe(false);
  });
  it('termina com 600 repetições qualquer que seja o plano', () => {
    for (const plan of [cindy, twenty, { pu: 7, ps: 13, sq: 50 }, { pu: 100, ps: 1, sq: 300 }]) {
      const s = runAll(plan);
      expect(totalReps(s)).toBe(600);
      expect(finished(s)).toBe(true);
    }
  });
});

describe('resultado e ranking', () => {
  it('desistir: resultado é o que fez, sem contar como terminado', () => {
    let s = completeRun(startState(), cindy, 0);
    s = addReps(s, cindy, 5);
    s = quit(s, 1_000_000);
    expect(s.phase).toBe('done');
    expect(finished(s)).toBe(false);
  });
  it('quem terminou fica na frente; entre eles, o menor tempo', () => {
    const a = runAll(null);
    const b = { ...a, finishedAt: 2_000_000 };
    const c = addReps(completeRun(startState(), null, 0), null, 50);
    const ranked = [a, c, b].sort((x, y) => rankScore(x) - rankScore(y));
    expect(ranked).toEqual([b, a, c]);
  });
  it('mais adiantado fica na frente de quem está atrás', () => {
    const run = completeRun(startState(), null, 0);
    expect(rankScore(addReps(run, null, 60))).toBeLessThan(rankScore(addReps(run, null, 10)));
    expect(rankScore(run)).toBeLessThan(rankScore(startState()));
  });
  it('relógio', () => {
    expect(formatClock(2_537_000)).toBe('42:17');
    expect(formatClock(3_725_000)).toBe('1:02:05');
    expect(formatClock(-3000)).toBe('00:00');
  });
});

describe('painel: etapas e série atual', () => {
  const { stageCells, currentSet } = require('@/core/murph') as typeof import('@/core/murph');
  it('mostra quanto já fez em cada etapa', () => {
    let s = completeRun(startState(), cindy, 0);
    for (let i = 0; i < 8; i++) s = addReps(s, cindy, s.setTarget - s.setDone); // 8 séries: 2 rodadas + pull-up e push-up
    s = addReps(s, cindy, 3); // 3 air squats da série atual
    const cells = stageCells(s);
    expect(cells.map((c) => c.state)).toEqual(['done', 'next', 'next', 'now', 'next']);
    expect(cells.map((c) => c.done)).toEqual([1, 15, 30, 33, 0]);
  });
  it('com quebra: série 3/5 da rodada 9/20', () => {
    let s = completeRun(startState(), cindy, 0);
    for (let i = 0; i < 24; i++) s = addReps(s, cindy, s.setTarget - s.setDone); // 8 rodadas completas
    s = addReps(s, cindy, 3);
    expect(currentSet(s, cindy)).toEqual({ move: 'pu', set: 3, of: 5, round: 9, rounds: 20 });
    expect(currentSet(s, null)).toBeNull();
  });
});
