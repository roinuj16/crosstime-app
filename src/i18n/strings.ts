import type { Mode, Phase } from '@/core/engine';

export type Lang = 'pt' | 'en';

export type FieldKey = 'prepare' | 'work' | 'rest' | 'rounds' | 'cycles' | 'restBC' | 'cooldown' | 'interval' | 'time' | 'cap' | 'lap';

export interface Strings {
  modes: Record<Mode, string>;
  modeHints: Record<Mode, string>;
  phases: Record<Phase | 'lap', string>;
  roundsLeft: string;
  cyclesLeft: string;
  lapsDone: string;
  roundsCounter: string;
  tapToCount: string;
  endOfWorkout: string;
  done: string;
  timeCap: string;
  noCap: string;
  greatJob: string;
  start: string;
  pause: string;
  resume: string;
  repeat: string;
  finish: string;
  skip: string;
  reset: string;
  resetTitle: string;
  resetText: string;
  switchTitle: string;
  cancel: string;
  confirm: string;
  delete: string;
  total: string;
  remaining: string;
  elapsed: string;
  cap: string;
  lapN: (n: number) => string;
  resumed: (time: string) => string;
  finishedWhileClosed: string;

  edit: {
    title: string; total: string; locked: string; savePlaceholder: string; save: string; saved: string; restore: string;
    tapToType: string; ok: string; typeValue: (label: string) => string;
    fields: Record<FieldKey, { label: string; hint: string }>;
  };
  workouts: {
    title: string; mine: string; history: string; use: string; example: string; empty: string; emptyHistory: string;
    clear: string; clearTitle: string; deleteTitle: (name: string) => string; complete: string; partial: string;
    roundsN: (n: number) => string; loaded: (name: string) => string;
  };
  settings: {
    title: string; done: string;
    general: string; language: string; languageAuto: string; timeFormat: string;
    sound: string; soundOn: string; soundOnHint: string; soundStyle: string; volume: string; countdown: string; countdownHint: string; tick: string; tickHint: string;
    styles: Record<'beep' | 'bell' | 'gong' | 'horn' | 'whistle', string>;
    voice: string; voiceOn: string; voiceOnHint: string; voiceLang: string; voiceLangHint: string; sayRound: string; voiceRate: string; slow: string; normal: string; fast: string;
    device: string; vibrate: string; keepAwake: string; keepAwakeHint: string; flash: string; flashHint: string; duck: string; duckHint: string;
    colors: string; colorsHint: string;
    test: string; voicePick: string; voiceAuto: string; flashDenied: string; bgAlerts: string; bgAlertsHint: string;
  };
  voices: { title: string; auto: string; enhanced: string; empty: string; help: string; listen: string };
  colors: {
    title: string; presets: string; perPhase: string; restore: string; preview: string;
    roles: Record<'prepare' | 'work' | 'rest' | 'restBC' | 'cooldown' | 'run' | 'lap' | 'rounds' | 'cycles', string>;
  };
  /** frases da voz guia */
  say: {
    prepare: string; work: string; workRound: (r: number) => string; last: string; cycle: (c: number) => string;
    rest: string; restBC: string; cooldown: string; run: string; lap: (n: number) => string; done: string;
    emom: (r: number) => string; amrap: string; fortime: string; half: string; timeCap: string;
  };
}

const pt: Strings = {
  modes: { tabata: 'Tabata', rounds: 'Rounds', emom: 'EMOM', amrap: 'AMRAP', fortime: 'For Time', stopwatch: 'Cronômetro' },
  modeHints: {
    tabata: 'Trabalho e descanso em rounds e ciclos',
    rounds: 'Rounds de trabalho e descanso',
    emom: 'Um round no início de cada intervalo',
    amrap: 'O máximo de rounds no tempo',
    fortime: 'Contra o relógio, com time cap',
    stopwatch: 'Cronômetro com sinal a cada volta',
  },
  phases: {
    prepare: 'Preparar', work: 'Trabalho', rest: 'Descanso', restBC: 'Descanso entre ciclos', cooldown: 'Desaquecimento',
    emom: 'EMOM', amrap: 'AMRAP', fortime: 'For Time', run: 'Cronômetro', lap: 'Tempo de volta',
  },
  roundsLeft: 'Rounds restantes',
  cyclesLeft: 'Ciclos restantes',
  lapsDone: 'Voltas completas',
  roundsCounter: 'Rounds',
  tapToCount: 'Toque para +1 · segure para −1',
  endOfWorkout: 'Fim do treino',
  done: 'Concluído',
  timeCap: 'Time cap',
  noCap: 'Sem limite',
  greatJob: 'Bom trabalho!',
  start: 'Iniciar',
  pause: 'Pausar',
  resume: 'Continuar',
  repeat: 'Repetir',
  finish: 'Terminei',
  skip: 'Pular',
  reset: 'Zerar',
  resetTitle: 'Zerar o treino?',
  resetText: 'O tempo decorrido fica registrado no histórico como parcial.',
  switchTitle: 'Encerrar o treino atual?',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  delete: 'Apagar',
  total: 'Total',
  remaining: 'Restante',
  elapsed: 'Decorrido',
  cap: 'Cap',
  lapN: (n) => `Volta ${n}`,
  resumed: (time) => `Treino retomado de onde parou (${time} decorridos)`,
  finishedWhileClosed: 'O treino terminou enquanto o app estava fechado. Ficou no histórico.',

  edit: {
    title: 'Intervalos',
    total: 'Total',
    locked: 'Zere o treino em andamento para mudar os intervalos.',
    savePlaceholder: 'Nome do treino (ex.: HIIT de terça)',
    save: 'Salvar em Meus treinos',
    saved: 'Salvo em Meus treinos',
    restore: 'Restaurar padrão',
    tapToType: 'Toque em um valor para digitar. Ex.: 1 3 0 = 01:30.',
    ok: 'OK',
    typeValue: (label) => `Digite: ${label}`,
    fields: {
      prepare: { label: 'Preparar', hint: 'Contagem antes de começar' },
      work: { label: 'Trabalho', hint: 'Tempo de exercício' },
      rest: { label: 'Descanso', hint: 'Pausa entre os rounds' },
      rounds: { label: 'Rounds', hint: 'Um round = trabalho + descanso' },
      cycles: { label: 'Ciclos', hint: 'Um ciclo = todos os rounds' },
      restBC: { label: 'Descanso entre ciclos', hint: 'Recuperação maior' },
      cooldown: { label: 'Desaquecimento', hint: 'Depois do último round' },
      interval: { label: 'A cada', hint: 'Duração de cada intervalo (EMOM = 1 min)' },
      time: { label: 'Duração', hint: 'Tempo total do AMRAP' },
      cap: { label: 'Time cap', hint: 'Tempo limite (00:00 = sem limite)' },
      lap: { label: 'Tempo de volta', hint: 'O relógio toca um sinal a cada volta' },
    },
  },
  workouts: {
    title: 'Treinos',
    mine: 'Meus treinos',
    history: 'Histórico',
    use: 'Usar',
    example: 'Exemplo',
    empty: 'Nenhum treino salvo. Ajuste os intervalos e toque em "Salvar em Meus treinos".',
    emptyHistory: 'Os treinos que você fizer aparecem aqui, com a duração e se foram até o fim.',
    clear: 'Limpar',
    clearTitle: 'Apagar todo o histórico?',
    deleteTitle: (name) => `Apagar "${name}"?`,
    complete: 'Completo',
    partial: 'Parcial',
    roundsN: (n) => `${n} ${n === 1 ? 'round' : 'rounds'}`,
    loaded: (name) => `"${name}" pronto para começar`,
  },
  settings: {
    title: 'Ajustes',
    done: 'Pronto',
    general: 'Geral',
    language: 'Idioma do app',
    languageAuto: 'Do aparelho',
    timeFormat: 'Formato do tempo',
    sound: 'Som',
    soundOn: 'Efeitos sonoros',
    soundOnHint: 'Som a cada troca de fase',
    soundStyle: 'Estilo do som',
    volume: 'Volume',
    countdown: 'Contagem 3, 2, 1',
    countdownHint: 'Bipes nos últimos segundos de cada fase',
    tick: 'Tique-taque',
    tickHint: 'Um clique por segundo',
    styles: { beep: 'Bipe', bell: 'Sino', gong: 'Gongo', horn: 'Buzina', whistle: 'Apito' },
    voice: 'Voz guia',
    voiceOn: 'Voz guia',
    voiceOnHint: 'Fala o nome da fase e o fim do treino',
    voiceLang: 'Idioma da voz',
    voiceLangHint: 'Em inglês as vozes costumam soar melhor',
    sayRound: 'Anunciar o round',
    voiceRate: 'Velocidade da fala',
    slow: 'Devagar',
    normal: 'Normal',
    fast: 'Rápida',
    device: 'Tela e aparelho',
    vibrate: 'Vibração',
    keepAwake: 'Manter tela acesa',
    keepAwakeHint: 'Durante o treino',
    flash: 'Lanterna',
    flashHint: 'Pisca a lanterna ao trocar de fase',
    duck: 'Abaixar música de outros apps',
    duckHint: 'A música baixa só durante os avisos',
    colors: 'Cores',
    colorsHint: 'Cor de cada fase e combinações prontas',
    test: 'Testar som e voz',
    voicePick: 'Voz',
    voiceAuto: 'Automática',
    bgAlerts: 'Avisos com a tela bloqueada',
    bgAlertsHint: 'Notificação a cada troca de fase, mesmo se o sistema pausar o app',
    flashDenied: 'Sem acesso à câmera, a lanterna não pode piscar. Libere em Ajustes do sistema → CrossTimer → Câmera.',
  },
  voices: {
    title: 'Vozes',
    auto: 'Automática (a melhor instalada)',
    enhanced: 'Alta qualidade',
    empty: 'Nenhuma voz nesse idioma foi encontrada no aparelho.',
    help: 'Vozes "Premium" ou "Aprimorada" soam bem mais naturais e são gratuitas. iPhone: Ajustes → Acessibilidade → Conteúdo Falado → Vozes. Android: Configurações → Sistema → Idiomas → Conversão de texto em voz. Depois, volte aqui.',
    listen: 'Toque numa voz para ouvir e escolher.',
  },
  colors: {
    title: 'Cores',
    presets: 'Combinações prontas',
    perPhase: 'Cor de cada elemento',
    restore: 'Voltar ao padrão',
    preview: 'Prévia',
    roles: {
      prepare: 'Preparar', work: 'Trabalho (EMOM, AMRAP)', rest: 'Descanso', restBC: 'Descanso entre ciclos', cooldown: 'Desaquecimento',
      run: 'Cronômetro e For Time', lap: 'Tempo de volta e contador', rounds: 'Rounds restantes', cycles: 'Ciclos restantes',
    },
  },
  say: {
    prepare: 'Prepare-se', work: 'Trabalho', workRound: (r) => `Trabalho, round ${r}`, last: 'Último round', cycle: (c) => `Ciclo ${c}`,
    rest: 'Descanso', restBC: 'Descanso entre ciclos', cooldown: 'Desaquecimento', run: 'Valendo', lap: (n) => `Volta ${n}`, done: 'Treino concluído',
    emom: (r) => `Round ${r}`, amrap: 'AMRAP, valendo', fortime: 'For time, valendo', half: 'Metade', timeCap: 'Time cap',
  },
};

const en: Strings = {
  modes: { tabata: 'Tabata', rounds: 'Rounds', emom: 'EMOM', amrap: 'AMRAP', fortime: 'For Time', stopwatch: 'Stopwatch' },
  modeHints: {
    tabata: 'Work and rest in rounds and cycles',
    rounds: 'Rounds of work and rest',
    emom: 'One round at the start of every interval',
    amrap: 'As many rounds as possible',
    fortime: 'Against the clock, with a time cap',
    stopwatch: 'Stopwatch with a signal every lap',
  },
  phases: {
    prepare: 'Prepare', work: 'Work', rest: 'Rest', restBC: 'Rest between cycles', cooldown: 'Cooldown',
    emom: 'EMOM', amrap: 'AMRAP', fortime: 'For Time', run: 'Stopwatch', lap: 'Time lap',
  },
  roundsLeft: 'Rounds left',
  cyclesLeft: 'Cycles left',
  lapsDone: 'Laps done',
  roundsCounter: 'Rounds',
  tapToCount: 'Tap for +1 · hold for −1',
  endOfWorkout: 'End of workout',
  done: 'Done',
  timeCap: 'Time cap',
  noCap: 'No cap',
  greatJob: 'Great job!',
  start: 'Start',
  pause: 'Pause',
  resume: 'Resume',
  repeat: 'Repeat',
  finish: 'Finish',
  skip: 'Skip',
  reset: 'Reset',
  resetTitle: 'Reset the workout?',
  resetText: 'The elapsed time is saved to your history as partial.',
  switchTitle: 'End the current workout?',
  cancel: 'Cancel',
  confirm: 'Confirm',
  delete: 'Delete',
  total: 'Total',
  remaining: 'Remaining',
  elapsed: 'Elapsed',
  cap: 'Cap',
  lapN: (n) => `Lap ${n}`,
  resumed: (time) => `Workout resumed where you left off (${time} elapsed)`,
  finishedWhileClosed: 'The workout ended while the app was closed. It was saved to your history.',

  edit: {
    title: 'Intervals',
    total: 'Total',
    locked: 'Reset the running workout to change the intervals.',
    savePlaceholder: 'Workout name (e.g. Tuesday HIIT)',
    save: 'Save to My workouts',
    saved: 'Saved to My workouts',
    restore: 'Restore defaults',
    tapToType: 'Tap a value to type it. E.g. 1 3 0 = 01:30.',
    ok: 'OK',
    typeValue: (label) => `Type: ${label}`,
    fields: {
      prepare: { label: 'Prepare', hint: 'Countdown before you start' },
      work: { label: 'Work', hint: 'Exercise time' },
      rest: { label: 'Rest', hint: 'Break between rounds' },
      rounds: { label: 'Rounds', hint: 'One round = work + rest' },
      cycles: { label: 'Cycles', hint: 'One cycle = all the rounds' },
      restBC: { label: 'Rest between cycles', hint: 'Longer recovery' },
      cooldown: { label: 'Cooldown', hint: 'After the last round' },
      interval: { label: 'Every', hint: 'Length of each interval (EMOM = 1 min)' },
      time: { label: 'Duration', hint: 'Total AMRAP time' },
      cap: { label: 'Time cap', hint: 'Time limit (00:00 = no cap)' },
      lap: { label: 'Time lap', hint: 'The clock plays a signal every lap' },
    },
  },
  workouts: {
    title: 'Workouts',
    mine: 'My workouts',
    history: 'History',
    use: 'Use',
    example: 'Example',
    empty: 'No saved workouts yet. Adjust the intervals and tap "Save to My workouts".',
    emptyHistory: 'Workouts you do show up here, with their duration and whether you finished.',
    clear: 'Clear',
    clearTitle: 'Delete all history?',
    deleteTitle: (name) => `Delete "${name}"?`,
    complete: 'Complete',
    partial: 'Partial',
    roundsN: (n) => `${n} ${n === 1 ? 'round' : 'rounds'}`,
    loaded: (name) => `"${name}" is ready to start`,
  },
  settings: {
    title: 'Settings',
    done: 'Done',
    general: 'General',
    language: 'App language',
    languageAuto: 'Device',
    timeFormat: 'Time format',
    sound: 'Sound',
    soundOn: 'Sound effects',
    soundOnHint: 'A sound at every phase change',
    soundStyle: 'Sound style',
    volume: 'Volume',
    countdown: '3, 2, 1 countdown',
    countdownHint: 'Beeps in the last seconds of each phase',
    tick: 'Ticking',
    tickHint: 'One click per second',
    styles: { beep: 'Beep', bell: 'Bell', gong: 'Gong', horn: 'Horn', whistle: 'Whistle' },
    voice: 'Voice guidance',
    voiceOn: 'Voice guidance',
    voiceOnHint: 'Says the phase name and when the workout ends',
    voiceLang: 'Voice language',
    voiceLangHint: 'English voices usually sound better',
    sayRound: 'Announce the round',
    voiceRate: 'Speech rate',
    slow: 'Slow',
    normal: 'Normal',
    fast: 'Fast',
    device: 'Screen and device',
    vibrate: 'Vibration',
    keepAwake: 'Keep screen on',
    keepAwakeHint: 'During the workout',
    flash: 'Flashlight',
    flashHint: 'Blinks the flashlight at every phase change',
    duck: 'Lower other apps’ music',
    duckHint: 'Music gets quieter only during announcements',
    colors: 'Colors',
    colorsHint: 'Color of each phase and ready-made sets',
    test: 'Test sound and voice',
    voicePick: 'Voice',
    voiceAuto: 'Automatic',
    bgAlerts: 'Alerts on the lock screen',
    bgAlertsHint: 'A notification at every phase change, even if the system pauses the app',
    flashDenied: 'Without camera access the flashlight can’t blink. Allow it in system Settings → CrossTimer → Camera.',
  },
  voices: {
    title: 'Voices',
    auto: 'Automatic (best installed)',
    enhanced: 'High quality',
    empty: 'No voices in this language were found on the device.',
    help: '"Premium" or "Enhanced" voices sound much more natural and are free. iPhone: Settings → Accessibility → Spoken Content → Voices. Android: Settings → System → Languages → Text-to-speech output. Then come back here.',
    listen: 'Tap a voice to hear it and choose it.',
  },
  colors: {
    title: 'Colors',
    presets: 'Ready-made sets',
    perPhase: 'Color of each element',
    restore: 'Restore defaults',
    preview: 'Preview',
    roles: {
      prepare: 'Prepare', work: 'Work (EMOM, AMRAP)', rest: 'Rest', restBC: 'Rest between cycles', cooldown: 'Cooldown',
      run: 'Stopwatch and For Time', lap: 'Time lap and counter', rounds: 'Rounds left', cycles: 'Cycles left',
    },
  },
  say: {
    prepare: 'Get ready', work: 'Work', workRound: (r) => `Work, round ${r}`, last: 'Last round', cycle: (c) => `Cycle ${c}`,
    rest: 'Rest', restBC: 'Rest between cycles', cooldown: 'Cool down', run: 'Go', lap: (n) => `Lap ${n}`, done: 'Workout complete',
    emom: (r) => `Round ${r}`, amrap: 'AMRAP, go', fortime: 'For time, go', half: 'Halfway', timeCap: 'Time cap',
  },
};

export const STRINGS: Record<Lang, Strings> = { pt, en };
