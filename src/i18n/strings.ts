import type { Mode, Phase } from '@/core/engine';

export type Lang = 'pt' | 'en';

export interface Strings {
  modes: Record<Mode, string>;
  phases: Record<Phase | 'lap', string>;
  roundsLeft: string;
  cyclesLeft: string;
  lapsDone: string;
  next: string;
  endOfWorkout: string;
  done: string;
  greatJob: string;
  start: string;
  pause: string;
  resume: string;
  repeat: string;
  skip: string;
  reset: string;
  resetTitle: string;
  resetText: string;
  cancel: string;
  total: string;
  remaining: string;
  elapsed: string;
  lapN: (n: number) => string;
  resumed: (time: string) => string;
  finishedWhileClosed: string;
  /** frases da voz guia */
  say: {
    prepare: string; work: string; workRound: (r: number) => string; last: string; cycle: (c: number) => string;
    rest: string; restBC: string; cooldown: string; run: string; lap: (n: number) => string; done: string;
  };
}

const pt: Strings = {
  modes: { tabata: 'Tabata', rounds: 'Rounds', stopwatch: 'Cronômetro' },
  phases: { prepare: 'Preparar', work: 'Trabalho', rest: 'Descanso', restBC: 'Descanso entre ciclos', cooldown: 'Desaquecimento', run: 'Cronômetro', lap: 'Tempo de volta' },
  roundsLeft: 'Rounds restantes',
  cyclesLeft: 'Ciclos restantes',
  lapsDone: 'Voltas completas',
  next: 'A seguir',
  endOfWorkout: 'Fim do treino',
  done: 'Concluído',
  greatJob: 'Bom trabalho!',
  start: 'Iniciar',
  pause: 'Pausar',
  resume: 'Continuar',
  repeat: 'Repetir',
  skip: 'Pular',
  reset: 'Zerar',
  resetTitle: 'Zerar o treino?',
  resetText: 'O tempo decorrido fica registrado no histórico como parcial.',
  cancel: 'Cancelar',
  total: 'Total',
  remaining: 'Restante',
  elapsed: 'Decorrido',
  lapN: (n) => `Volta ${n}`,
  resumed: (time) => `Treino retomado de onde parou (${time} decorridos)`,
  finishedWhileClosed: 'O treino terminou enquanto o app estava fechado. Ficou no histórico.',
  say: {
    prepare: 'Prepare-se', work: 'Trabalho', workRound: (r) => `Trabalho, round ${r}`, last: 'Último round', cycle: (c) => `Ciclo ${c}`,
    rest: 'Descanso', restBC: 'Descanso entre ciclos', cooldown: 'Desaquecimento', run: 'Valendo', lap: (n) => `Volta ${n}`, done: 'Treino concluído',
  },
};

const en: Strings = {
  modes: { tabata: 'Tabata', rounds: 'Rounds', stopwatch: 'Stopwatch' },
  phases: { prepare: 'Prepare', work: 'Work', rest: 'Rest', restBC: 'Rest between cycles', cooldown: 'Cooldown', run: 'Stopwatch', lap: 'Time lap' },
  roundsLeft: 'Rounds left',
  cyclesLeft: 'Cycles left',
  lapsDone: 'Laps done',
  next: 'Up next',
  endOfWorkout: 'End of workout',
  done: 'Done',
  greatJob: 'Great job!',
  start: 'Start',
  pause: 'Pause',
  resume: 'Resume',
  repeat: 'Repeat',
  skip: 'Skip',
  reset: 'Reset',
  resetTitle: 'Reset the workout?',
  resetText: 'The elapsed time is saved to your history as partial.',
  cancel: 'Cancel',
  total: 'Total',
  remaining: 'Remaining',
  elapsed: 'Elapsed',
  lapN: (n) => `Lap ${n}`,
  resumed: (time) => `Workout resumed where you left off (${time} elapsed)`,
  finishedWhileClosed: 'The workout ended while the app was closed. It was saved to your history.',
  say: {
    prepare: 'Get ready', work: 'Work', workRound: (r) => `Work, round ${r}`, last: 'Last round', cycle: (c) => `Cycle ${c}`,
    rest: 'Rest', restBC: 'Rest between cycles', cooldown: 'Cool down', run: 'Go', lap: (n) => `Lap ${n}`, done: 'Workout complete',
  },
};

export const STRINGS: Record<Lang, Strings> = { pt, en };
