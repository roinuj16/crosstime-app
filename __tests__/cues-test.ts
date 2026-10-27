/// <reference types="jest" />
import { cuesFor, phrase, type CueSettings } from '../src/core/cues';
import * as Engine from '../src/core/engine';
import { STRINGS } from '../src/i18n/strings';

const ON: CueSettings = { sound: true, soundScheme: 'beep', volume: 0.8, countdown: true, tick: false, voice: true, sayRound: true, vibrate: true, flash: false };
const tabata = Engine.buildSegments('tabata', Engine.DEFAULTS.tabata);
const emom = Engine.buildSegments('emom', Engine.DEFAULTS.emom);
const phaseEv = (segs: Engine.Segment[], i: number) => ({ type: 'phase' as const, seg: segs[i], next: segs[i + 1] ?? null, isLastWork: Engine.isLastWork(segs, i) });
const en = STRINGS.en.say, pt = STRINGS.pt.say;

describe('frases da voz', () => {
  it('trabalho com número do round', () => expect(phrase(phaseEv(tabata, 1), en, true)).toBe('Work, round 1'));
  it('sem número quando desligado', () => expect(phrase(phaseEv(tabata, 1), en, false)).toBe('Work'));
  it('início de um novo ciclo', () => {
    const i = tabata.findIndex((s) => s.phase === 'work' && s.cycle === 2 && s.round === 1);
    expect(phrase(phaseEv(tabata, i), pt, true)).toBe('Ciclo 2');
  });
  it('último round', () => expect(phrase(phaseEv(tabata, tabata.map((s) => s.phase).lastIndexOf('work')), pt, true)).toBe('Último round'));
  it('EMOM anuncia o round e o último', () => {
    expect(phrase(phaseEv(emom, 3), en, true)).toBe('Round 3');
    expect(phrase(phaseEv(emom, emom.length - 1), en, true)).toBe('Last round');
  });
  it('descanso e preparar', () => {
    expect(phrase(phaseEv(tabata, 2), pt, true)).toBe('Descanso');
    expect(phrase(phaseEv(tabata, 0), en, true)).toBe('Get ready');
  });
});

describe('deixas por evento', () => {
  it('troca de fase: som do estilo, vibração e voz', () => {
    const c = cuesFor([phaseEv(tabata, 1)], ON, en, 'tabata');
    expect(c).toEqual([
      { kind: 'sound', key: 'phase-beep', volume: 0.8 },
      { kind: 'haptic', style: 'phase' },
      { kind: 'speak', text: 'Work, round 1' },
    ]);
  });
  it('lanterna só quando ligada', () => {
    expect(cuesFor([phaseEv(tabata, 1)], { ...ON, flash: true }, en, 'tabata').some((c) => c.kind === 'torch')).toBe(true);
  });
  it('3-2-1: bipe normal e o "1" agudo com vibração', () => {
    expect(cuesFor([{ type: 'count', n: 2 }], ON, en, 'tabata')).toEqual([{ kind: 'sound', key: 'count', volume: 0.8 }]);
    expect(cuesFor([{ type: 'count', n: 1 }], ON, en, 'tabata')).toEqual([{ kind: 'sound', key: 'count-last', volume: 0.8 }, { kind: 'haptic', style: 'count' }]);
  });
  it('desligar som, voz e vibração silencia tudo', () => {
    const off = { ...ON, sound: false, voice: false, vibrate: false };
    expect(cuesFor([phaseEv(tabata, 1), { type: 'count', n: 1 }, { type: 'done' }], off, en, 'tabata')).toEqual([]);
  });
  it('tique-taque só quando ligado e mais baixo', () => {
    expect(cuesFor([{ type: 'tick' }], ON, en, 'tabata')).toEqual([]);
    expect(cuesFor([{ type: 'tick' }], { ...ON, tick: true }, en, 'tabata')).toEqual([{ kind: 'sound', key: 'tick', volume: 0.4 }]);
  });
  it('fim do treino; no For Time é o time cap', () => {
    expect(cuesFor([{ type: 'done' }], ON, pt, 'tabata').find((c) => c.kind === 'speak')).toEqual({ kind: 'speak', text: 'Treino concluído' });
    expect(cuesFor([{ type: 'done' }], ON, en, 'fortime').find((c) => c.kind === 'speak')).toEqual({ kind: 'speak', text: 'Time cap' });
  });
  it('volta do cronômetro', () => {
    expect(cuesFor([{ type: 'lap', n: 3 }], ON, pt, 'stopwatch')).toEqual([
      { kind: 'sound', key: 'lap', volume: 0.8 }, { kind: 'haptic', style: 'lap' }, { kind: 'speak', text: 'Volta 3' },
    ]);
  });
  it('estilo de som escolhido', () => {
    expect(cuesFor([phaseEv(tabata, 1)], { ...ON, soundScheme: 'gong' }, en, 'tabata')[0]).toMatchObject({ key: 'phase-gong' });
  });
});
