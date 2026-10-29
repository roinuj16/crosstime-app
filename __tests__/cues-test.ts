/// <reference types="jest" />
import { chooseClips, cuesFor, phrase, phraseClips, type CueSettings } from '../src/core/cues';
import LINES from '../src/voice/lines.json';
import * as Engine from '../src/core/engine';
import { STRINGS } from '../src/i18n/strings';

const ON: CueSettings = { sound: true, soundScheme: 'beep', volume: 0.8, countdown: true, tick: false, voice: true, voiceCount: false, sayRound: true, vibrate: true, flash: false };
const tabata = Engine.buildSegments('tabata', Engine.DEFAULTS.tabata);
const emom = Engine.buildSegments('emom', Engine.DEFAULTS.emom);
const phaseEv = (segs: Engine.Segment[], i: number) => ({ type: 'phase' as const, seg: segs[i], next: segs[i + 1] ?? null, isLastWork: Engine.isLastWork(segs, i) });
const en = STRINGS.en.say, pt = STRINGS.pt.say;

describe('frases da voz', () => {
  it('trabalho começa com "Go" e o número do round', () => expect(phrase(phaseEv(tabata, 1), en, true)).toBe('Go, round 1'));
  it('sem número quando desligado', () => expect(phrase(phaseEv(tabata, 1), en, false)).toBe('Go'));
  it('início de um novo ciclo', () => {
    const i = tabata.findIndex((s) => s.phase === 'work' && s.cycle === 2 && s.round === 1);
    expect(phrase(phaseEv(tabata, i), pt, true)).toBe('Ciclo 2');
  });
  it('último round', () => expect(phrase(phaseEv(tabata, tabata.map((s) => s.phase).lastIndexOf('work')), pt, true)).toBe('Último round'));
  it('EMOM anuncia o round e o último', () => {
    expect(phrase(phaseEv(emom, 3), en, true)).toBe('Go, round 3');
    expect(phrase(phaseEv(emom, emom.length - 1), en, true)).toBe('Go, last round');
  });
  it('descanso e preparar', () => {
    expect(phrase(phaseEv(tabata, 2), pt, true)).toBe('Descanso');
    expect(phrase(phaseEv(tabata, 0), en, true)).toBe('Get ready');
  });
});

describe('deixas por evento', () => {
  it('troca de fase com a voz ligada: só a voz e a vibração, sem som da fase por baixo', () => {
    const c = cuesFor([phaseEv(tabata, 1)], ON, en, 'tabata');
    expect(c).toEqual([
      { kind: 'haptic', style: 'phase' },
      { kind: 'speak', text: 'Go, round 1', clips: [['run', 'round_1'], ['run']] },
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
    expect(cuesFor([{ type: 'done' }], ON, pt, 'tabata').find((c) => c.kind === 'speak')).toEqual({ kind: 'speak', text: 'Treino concluído', clips: [['done']] });
    expect(cuesFor([{ type: 'done' }], ON, en, 'fortime').find((c) => c.kind === 'speak')).toEqual({ kind: 'speak', text: 'Time cap', clips: [['time_cap']] });
  });
  it('volta do cronômetro', () => {
    expect(cuesFor([{ type: 'lap', n: 3 }], ON, pt, 'stopwatch')).toEqual([
      { kind: 'sound', key: 'lap', volume: 0.8 }, { kind: 'haptic', style: 'lap' }, { kind: 'speak', text: 'Volta 3', clips: [['lap_3'], ['lap']] },
    ]);
  });
  it('com a voz desligada, a troca de fase toca o som do estilo escolhido', () => {
    expect(cuesFor([phaseEv(tabata, 1)], { ...ON, voice: false }, en, 'tabata')[0]).toEqual({ kind: 'sound', key: 'phase-beep', volume: 0.8 });
    expect(cuesFor([phaseEv(tabata, 1)], { ...ON, voice: false, soundScheme: 'gong' }, en, 'tabata')[0]).toMatchObject({ key: 'phase-gong' });
  });
});

describe('voz gravada', () => {
  const lines = LINES as unknown as Record<'en' | 'pt', Record<string, string>> & { limits: Record<string, number> };
  const has = (lang: 'en' | 'pt') => (id: string) => id in lines[lang];

  it('cada frase do treino tem um áudio na lista (pt e en)', () => {
    const modes = ['tabata', 'rounds', 'emom', 'amrap', 'fortime', 'stopwatch'] as const;
    const ids = new Set<string>();
    for (const m of modes) {
      const segs = Engine.buildSegments(m, Engine.DEFAULTS[m] as never);
      segs.forEach((_, i) => phraseClips(phaseEv(segs, i), true)[0].forEach((id) => ids.add(id)));
    }
    for (const ev of [{ type: 'done' as const }, { type: 'half' as const }, { type: 'count' as const, n: 3 }, { type: 'lap' as const, n: 2 }]) {
      for (const m of ['tabata', 'fortime'] as const) {
        for (const c of cuesFor([ev], { ...ON, voiceCount: true }, en, m)) if (c.kind === 'speak') c.clips[0].forEach((id) => ids.add(id));
      }
    }
    for (const lang of ['en', 'pt'] as const) for (const id of ids) expect([lang, id, has(lang)(id)]).toEqual([lang, id, true]);
  });

  it('chaves só com a-z, 0-9 e _ (exigência do Android) e iguais nos dois idiomas', () => {
    expect(Object.keys(lines.en)).toEqual(Object.keys(lines.pt));
    for (const id of Object.keys(lines.en)) expect(id).toMatch(/^[a-z][a-z0-9_]*$/);
  });

  it('round além da lista cai para "Go"; volta além da lista cai para "Lap"', () => {
    const r = lines.limits.round + 1;
    expect(chooseClips([['run', `round_${r}`], ['run']], has('en'))).toEqual(['run']);
    expect(chooseClips([[`lap_${lines.limits.lap + 1}`], ['lap']], has('pt'))).toEqual(['lap']);
  });

  it('sem áudio nenhum, usa a voz do sistema', () => {
    expect(chooseClips([['work', 'round_1'], ['work']], () => false)).toBeNull();
  });

  it('contagem falada substitui os bipes, mantendo a vibração no 1', () => {
    const st = { ...ON, voiceCount: true };
    expect(cuesFor([{ type: 'count', n: 2 }], st, pt, 'tabata')).toEqual([{ kind: 'speak', text: 'Dois', clips: [['count_2']] }]);
    expect(cuesFor([{ type: 'count', n: 1 }], st, en, 'tabata')).toEqual([{ kind: 'speak', text: 'One', clips: [['count_1']] }, { kind: 'haptic', style: 'count' }]);
    expect(cuesFor([{ type: 'count', n: 1 }], { ...st, voice: false }, en, 'tabata')[0]).toMatchObject({ kind: 'sound', key: 'count-last' });
  });
});

describe('EMOM: atenção e "3, 2, 1, Go!" em todo round', () => {
  // EMOM de 1 min, 10 rounds, sem preparação para simplificar a conta
  const segs = Engine.buildSegments('emom', { prepare: 0, interval: 60, rounds: 10 });
  const all = (from: number, to: number) => {
    const out: Engine.TimerEvent[] = [];
    for (let t = from; t < to; t = Math.round((t + 0.1) * 10) / 10) out.push(...Engine.eventsBetween(segs, t, Math.round((t + 0.1) * 10) / 10));
    return out;
  };
  const evs = all(0, 600);

  it('bipe de atenção 10 s antes de cada round, nos 10 rounds', () => {
    expect(evs.filter((e) => e.type === 'warn')).toHaveLength(10);
    expect(cuesFor([{ type: 'warn' }], ON, en, 'emom')).toEqual([{ kind: 'sound', key: 'warn', volume: 0.8 }, { kind: 'haptic', style: 'lap' }]);
  });

  it('contagem 3, 2, 1 em todos os rounds', () => {
    expect(evs.filter((e) => e.type === 'count' && e.n === 3)).toHaveLength(10);
  });

  it('cada round começa com "Go!" e o número; o último com "Go! Last round!"', () => {
    expect(phraseClips(phaseEv(segs, 4), true)).toEqual([['run', 'round_5'], ['run']]);
    expect(phraseClips(phaseEv(segs, segs.length - 1), true)).toEqual([['run', 'last'], ['last']]);
  });

  it('sem bipe de atenção em intervalos curtos (menos de 20 s) e fora do EMOM', () => {
    const short = Engine.buildSegments('emom', { prepare: 0, interval: 15, rounds: 4 });
    let n = 0;
    for (let t = 0; t < 60; t++) n += Engine.eventsBetween(short, t, t + 1).filter((e) => e.type === 'warn').length;
    expect(n).toBe(0);
    let m = 0;
    for (let t = 0; t < 600; t++) m += Engine.eventsBetween(tabata, t, t + 1).filter((e) => e.type === 'warn').length;
    expect(m).toBe(0);
  });
});
