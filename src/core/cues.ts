/**
 * Transforma eventos do timer em "deixas": que som tocar, o que falar, como vibrar.
 * Só decisão, sem tocar nada — o serviço de feedback executa. Assim dá para testar.
 */
import type { Mode, TimerEvent } from './engine';
import type { Strings } from '@/i18n/strings';

export type SoundKey = 'phase-beep' | 'phase-bell' | 'phase-gong' | 'phase-horn' | 'phase-whistle' | 'count' | 'count-last' | 'tick' | 'lap' | 'warn' | 'done';
export type HapticKind = 'phase' | 'count' | 'lap' | 'done';

/**
 * Voz: `text` para a voz do sistema e `clips` para a voz gravada.
 * `clips` é uma lista de alternativas, da melhor para a pior; cada uma é uma
 * sequência de áudios (ex.: ["run", "round_5"] → "Go! Round five.").
 */
export type Cue =
  | { kind: 'sound'; key: SoundKey; volume: number }
  | { kind: 'speak'; text: string; clips: string[][] }
  | { kind: 'haptic'; style: HapticKind }
  | { kind: 'torch' };

export interface CueSettings {
  sound: boolean;
  soundScheme: 'beep' | 'bell' | 'gong' | 'horn' | 'whistle';
  volume: number;
  countdown: boolean;
  tick: boolean;
  voice: boolean;
  /** fala "três, dois, um" no lugar dos bipes da contagem */
  voiceCount: boolean;
  sayRound: boolean;
  vibrate: boolean;
  flash: boolean;
}

type Say = Strings['say'];

/** Frase curta para o início de uma fase. */
export function phrase(ev: Extract<TimerEvent, { type: 'phase' }>, say: Say, sayRound: boolean): string {
  const s = ev.seg;
  switch (s.phase) {
    case 'prepare': return say.prepare;
    case 'work':
      if (ev.isLastWork && (s.rounds ?? 1) > 1) return say.last;
      if ((s.cycles ?? 1) > 1 && s.round === 1 && (s.cycle ?? 1) > 1) return say.cycle(s.cycle ?? 1);
      return sayRound && (s.rounds ?? 1) > 1 ? say.workRound(s.round ?? 1) : say.work;
    case 'emom': return ev.isLastWork && (s.rounds ?? 1) > 1 ? say.last : say.emom(s.round ?? 1);
    case 'amrap': return say.amrap;
    case 'fortime': return say.fortime;
    case 'rest': return say.rest;
    case 'restBC': return say.restBC;
    case 'cooldown': return say.cooldown;
    case 'run': return say.run;
  }
}

/** Mesma decisão de `phrase`, em áudios gravados (chaves de src/voice/lines.json). */
export function phraseClips(ev: Extract<TimerEvent, { type: 'phase' }>, sayRound: boolean): string[][] {
  const s = ev.seg;
  switch (s.phase) {
    case 'prepare': return [['prepare']];
    case 'work':
      if (ev.isLastWork && (s.rounds ?? 1) > 1) return [['run', 'last'], ['last']];
      // início do trabalho: "Go!" (mais curto e com mais energia que "Work!")
      if ((s.cycles ?? 1) > 1 && s.round === 1 && (s.cycle ?? 1) > 1) return [[`cycle_${s.cycle}`], ['run']];
      return sayRound && (s.rounds ?? 1) > 1 ? [['run', `round_${s.round ?? 1}`], ['run']] : [['run']];
    // EMOM: todo round começa com "Go!" (depois do 3, 2, 1)
    case 'emom': return ev.isLastWork && (s.rounds ?? 1) > 1 ? [['run', 'last'], ['last']] : [['run', `round_${s.round ?? 1}`], ['run']];
    case 'amrap': return [['amrap']];
    case 'fortime': return [['fortime']];
    case 'rest': return [['rest']];
    case 'restBC': return [['rest_bc']];
    case 'cooldown': return [['cooldown']];
    case 'run': return [['run']];
  }
}

/** Primeira alternativa cujos áudios existem todos; null = usar a voz do sistema. */
export function chooseClips(alternatives: string[][], has: (id: string) => boolean): string[] | null {
  return alternatives.find((alt) => alt.length > 0 && alt.every(has)) ?? null;
}

export function cuesFor(events: TimerEvent[], st: CueSettings, say: Say, mode: Mode): Cue[] {
  const out: Cue[] = [];
  const snd = (key: SoundKey, gain = 1) => { if (st.sound) out.push({ kind: 'sound', key, volume: Math.min(1, st.volume * gain) }); };
  const hap = (style: HapticKind) => { if (st.vibrate) out.push({ kind: 'haptic', style }); };
  const talk = (text: string, clips: string[][]) => { if (st.voice) out.push({ kind: 'speak', text, clips }); };

  for (const ev of events) {
    switch (ev.type) {
      case 'phase':
        snd(`phase-${st.soundScheme}` as SoundKey);
        hap('phase');
        if (st.flash) out.push({ kind: 'torch' });
        talk(phrase(ev, say, st.sayRound), phraseClips(ev, st.sayRound));
        break;
      case 'count':
        if (!st.countdown) break;
        if (st.voice && st.voiceCount) talk(say.count(ev.n), [[`count_${ev.n}`]]);
        else snd(ev.n === 1 ? 'count-last' : 'count');
        if (ev.n === 1) hap('count');
        break;
      case 'half':
        talk(say.half, [['half']]);
        break;
      case 'warn':
        snd('warn'); hap('lap');
        break;
      case 'lap':
        snd('lap'); hap('lap');
        if (st.flash) out.push({ kind: 'torch' });
        talk(say.lap(ev.n), [[`lap_${ev.n}`], ['lap']]);
        break;
      case 'tick':
        if (st.tick) snd('tick', 0.5);
        break;
      case 'done':
        snd('done'); hap('done');
        talk(mode === 'fortime' ? say.timeCap : say.done, [[mode === 'fortime' ? 'time_cap' : 'done']]);
        break;
    }
  }
  return out;
}
