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
    wod: string; wodHint: string;
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
    install: string; installIos: string; installAndroid: string; webNote: string;
    voiceSource: string; voiceRecorded: string; voiceSystem: string; voiceSourceHint: string; voiceCount: string; voiceCountHint: string;
  };
  voices: { title: string; auto: string; enhanced: string; empty: string; help: string; listen: string };
  /** estatísticas de uso (Google Analytics) e privacidade */
  /** tela Coach (nome do coach e o que aparece na TV) */
  coach: { title: string; hint: string; name: string; nameHint: string; namePh: string; tv: string; onTv: (name: string) => string };
  privacy: { banner: string; accept: string; decline: string; policy: string; toggle: string; toggleHint: string; title: string };
  /** modo TV (placar em tela cheia para a TV do box) */
  tv: {
    open: string; openHint: string; start: string; startHint: string; exit: string;
    keys: { play: string; skip: string; back: string; mode: string; rounds: string; finish: string; reset: string; workout: string; repeat: string };
    pressAgain: string; paused: string;
    nextWorkout: string; duration: string; rounds: string; workRest: string; every: string; cap: string; lap: string; okToStart: string;
    round: string; cycle: string; next: string; remaining: string; wod: string; roundsHint: string; laps: string;
    doneTitle: string; doneMsg: string; backHome: string;
    customize: string; customizeHint: string; setupCard: string; setupCardHint: string;
    pair: { title: string; hint: string; connected: string; linked: string; section: string; waiting: string; offline: string; tvOf: (code: string) => string; connect: string; connectHint: string; codeLabel: string; disconnect: string; invalid: string; error: string };
    setup: { title: string; boxName: string; boxNamePh: string; logo: string; logoPick: string; logoRemove: string; logoHint: string; wod: string; wodHint: string; wodPh: string; open: string };
    /** tela "Conectar à TV" e leitor de QR */
    connect: {
      button: string; title: string; statusOn: (code: string) => string; how: string;
      step1: string; step2: string; step3: string; share: string; shareMsg: (url: string) => string; copied: string;
      scan: string; typeCode: string; connectShort: string; thisDevice: string; thisDeviceHint: string; hardware: string; iosTip: string;
      unavailable: string; scanTitle: string; scanAim: string; scanAllow: string; scanDenied: string; scanWrong: string; scanNoCamera: string;
    };
  };
  colors: {
    title: string; presets: string; perPhase: string; restore: string; preview: string;
    roles: Record<'prepare' | 'work' | 'rest' | 'restBC' | 'cooldown' | 'run' | 'lap' | 'rounds' | 'cycles', string>;
  };
  /** frases da voz guia */
  say: {
    prepare: string; work: string; workRound: (r: number) => string; last: string; cycle: (c: number) => string;
    rest: string; restBC: string; cooldown: string; run: string; lap: (n: number) => string; done: string;
    emom: (r: number) => string; amrap: string; fortime: string; half: string; timeCap: string;
    count: (n: number) => string;
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
    wod: 'Treino do dia (WOD)', wodHint: 'Os exercícios deste modo, um por linha. Aparecem na TV antes e durante o treino. Ao salvar o treino, o WOD vai junto.',
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
    duck: 'Baixar a música nos avisos',
    duckHint: 'Se você ouve música no celular (Spotify, fone), ela abaixa por 2 segundos a cada bipe e voz',
    colors: 'Cores',
    colorsHint: 'Cor de cada fase e combinações prontas',
    test: 'Testar som e voz',
    voicePick: 'Voz',
    voiceAuto: 'Automática',
    bgAlerts: 'Avisos com a tela bloqueada',
    bgAlertsHint: 'Notificação a cada troca de fase, mesmo se o sistema pausar o app',
    install: 'Instalar na tela de início',
    installIos: 'No Safari: toque em Compartilhar e depois em "Adicionar à Tela de Início". Abre em tela cheia e funciona sem internet.',
    installAndroid: 'No Chrome: toque no menu ⋮ e depois em "Instalar app". Abre em tela cheia e funciona sem internet.',
    webNote: 'No navegador, deixe o CronoBox aberto e a tela acesa durante o treino: com a tela bloqueada, o navegador pausa o timer.',
    voiceSource: 'Tipo de voz',
    voiceRecorded: 'Coach (gravada)',
    voiceSystem: 'Do sistema',
    voiceSourceHint: 'A gravada soa igual em qualquer celular',
    voiceCount: 'Falar a contagem 3-2-1',
    voiceCountHint: 'No lugar dos bipes do fim de cada fase',
    flashDenied: 'Sem acesso à câmera, a lanterna não pode piscar. Libere em Ajustes do sistema → CronoBox → Câmera.',
  },
  voices: {
    title: 'Vozes',
    auto: 'Automática (a melhor instalada)',
    enhanced: 'Alta qualidade',
    empty: 'Nenhuma voz nesse idioma foi encontrada no aparelho.',
    help: 'Vozes "Premium" ou "Aprimorada" soam bem mais naturais e são gratuitas. iPhone: Ajustes → Acessibilidade → Conteúdo Falado → Vozes. Android: Configurações → Sistema → Idiomas → Conversão de texto em voz. Depois, volte aqui.',
    listen: 'Toque numa voz para ouvir e escolher.',
  },
  coach: {
    title: 'Coach', hint: 'Seu nome, a conexão com a TV e o que aparece nela (box, logo e WOD)',
    name: 'Seu nome', nameHint: 'Opcional. Aparece no topo da TV, ao lado da hora.', namePh: 'Ex.: Ana',
    tv: 'Modo TV', onTv: (name) => `Coach ${name}`,
  },
  privacy: {
    banner: 'Usamos o Google Analytics para saber quais recursos são usados e corrigir erros. Sem nome, sem e-mail e sem o que você digita.',
    accept: 'Aceitar', decline: 'Recusar', policy: 'Política de privacidade',
    toggle: 'Estatísticas de uso', toggleHint: 'Google Analytics, sem dados pessoais. Ajuda a melhorar o CronoBox.',
    title: 'Privacidade',
  },
  tv: {
    open: 'Modo TV',
    openHint: 'Placar em tela cheia para a TV do box, com controle remoto ou teclado',
    start: 'Aperte OK para começar',
    startHint: 'Ativa o som e a tela cheia. Use o controle remoto da TV ou um teclado.',
    exit: 'Sair do modo TV',
    keys: { play: 'iniciar / pausar', skip: 'pular fase', back: 'voltar fase', mode: 'trocar modo', rounds: '+1 / −1 round', finish: 'terminei', reset: 'zerar', workout: 'trocar treino', repeat: 'repetir' },
    pressAgain: 'Aperte voltar de novo para zerar',
    paused: 'Pausado',
    nextWorkout: 'Próximo treino', duration: 'Duração', rounds: 'Rounds', workRest: 'Trabalho / descanso', every: 'A cada', cap: 'Time cap', lap: 'Volta',
    okToStart: 'no controle da TV para começar',
    round: 'Round', cycle: 'Ciclo', next: 'Próximo', remaining: 'Faltam no treino', wod: 'O treino', roundsHint: 'marque com ↑ ↓ no controle', laps: 'voltas completas',
    doneTitle: 'Treino concluído', doneMsg: 'Mandou bem!', backHome: 'Volta para a tela inicial em 2 minutos',
    customize: 'Personalizar modo TV', customizeHint: 'Nome do box, logo e o treino do dia (WOD) na TV',
    setupCard: 'Deixe a TV com a cara do box', setupCardHint: 'Coloque o nome, o logo e o WOD do dia em Ajustes → Personalizar modo TV.',
    pair: {
      title: 'Controle pelo celular', hint: 'No celular: CronoBox → ícone da TV → Escanear, ou digite o código',
      connected: 'Celular do coach conectado', linked: 'conectada', section: 'TV do box', waiting: 'Aguardando a TV', offline: 'Sem conexão com a TV',
      tvOf: (code) => `TV ${code}`, connect: 'Conectar à TV', connectHint: 'Digite o código que aparece na TV do box',
      codeLabel: 'Código da TV', disconnect: 'Desconectar', invalid: 'Código inválido: são 6 letras e números, como K7Q-4M2',
      error: 'Não deu para conectar. Confira a internet e o código.',
    },
    setup: {
      title: 'Modo TV', boxName: 'Nome do box', boxNamePh: 'Ex.: Box Fortaleza', logo: 'Logo', logoPick: 'Escolher imagem', logoRemove: 'Remover',
      logoHint: 'PNG ou JPG; aparece no canto da TV', wod: 'Treino do dia (WOD)',
      wodHint: 'Uma linha por movimento. Aparece na tela inicial da TV e ao lado do relógio no AMRAP e no For Time.',
      wodPh: '10 Thrusters 43/30 kg\n15 Pull-ups\n20 Double unders', open: 'Abrir o modo TV',
    },
    connect: {
      button: 'TV do box', title: 'Conectar à TV', statusOn: (code) => `Conectado à TV ${code}`, how: 'Como conectar',
      step1: 'Na TV do box, abra o navegador e entre neste endereço:',
      step2: 'A TV mostra um QR code e um código de 6 letras e números, como K7Q-4M2.',
      step3: 'Escaneie o QR code da TV aqui no app, ou digite o código. Pronto: este celular vira o controle e a TV toca os sons.',
      share: 'Enviar o link', shareMsg: (url) => `Abra este endereço no navegador da TV do box: ${url}`, copied: 'Link copiado',
      scan: 'Escanear QR da TV', typeCode: 'Digitar o código', connectShort: 'Conectar',
      thisDevice: 'Usar este aparelho como TV', thisDeviceHint: 'Para um notebook, tablet ou TV box ligado na TV',
      hardware: 'Serve qualquer TV com navegador (Samsung, LG, Android TV, Fire TV) ou um notebook ligado na TV pelo HDMI. A TV e o celular precisam de internet, mas não precisam estar no mesmo Wi-Fi.',
      iosTip: 'No iPhone com o CronoBox na tela de início, use o botão Escanear daqui ou digite o código: a câmera do iPhone abre o link no Safari, que é separado do app.',
      unavailable: 'A conexão com a TV não está ativa nesta versão.',
      scanTitle: 'Escanear QR da TV', scanAim: 'Aponte para o QR code que aparece na TV',
      scanAllow: 'Permitir câmera', scanDenied: 'Sem acesso à câmera. Libere nos ajustes do aparelho ou digite o código da TV.',
      scanWrong: 'Esse QR code não é de uma TV do CronoBox', scanNoCamera: 'Este aparelho não tem câmera disponível. Digite o código da TV.',
    },
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
    count: (n) => ['', 'Um', 'Dois', 'Três'][n] ?? String(n),
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
    wod: 'Workout of the day (WOD)', wodHint: 'This mode\'s movements, one per line. They show on the TV before and during the workout. Saving the workout keeps the WOD with it.',
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
    duck: 'Lower music during cues',
    duckHint: 'If you play music on the phone (Spotify, earbuds), it dips for 2 seconds at every beep and voice cue',
    colors: 'Colors',
    colorsHint: 'Color of each phase and ready-made sets',
    test: 'Test sound and voice',
    voicePick: 'Voice',
    voiceAuto: 'Automatic',
    bgAlerts: 'Alerts on the lock screen',
    bgAlertsHint: 'A notification at every phase change, even if the system pauses the app',
    install: 'Add to Home Screen',
    installIos: 'In Safari: tap Share, then "Add to Home Screen". It opens full screen and works offline.',
    installAndroid: 'In Chrome: tap the ⋮ menu, then "Install app". It opens full screen and works offline.',
    webNote: 'In the browser, keep CronoBox open and the screen on while you train: with the screen locked, the browser pauses the timer.',
    voiceSource: 'Voice type',
    voiceRecorded: 'Coach (recorded)',
    voiceSystem: 'System',
    voiceSourceHint: 'The recorded voice sounds the same on every phone',
    voiceCount: 'Say the 3-2-1 countdown',
    voiceCountHint: 'Instead of the beeps at the end of each phase',
    flashDenied: 'Without camera access the flashlight can’t blink. Allow it in system Settings → CronoBox → Camera.',
  },
  voices: {
    title: 'Voices',
    auto: 'Automatic (best installed)',
    enhanced: 'High quality',
    empty: 'No voices in this language were found on the device.',
    help: '"Premium" or "Enhanced" voices sound much more natural and are free. iPhone: Settings → Accessibility → Spoken Content → Voices. Android: Settings → System → Languages → Text-to-speech output. Then come back here.',
    listen: 'Tap a voice to hear it and choose it.',
  },
  coach: {
    title: 'Coach', hint: 'Your name, the TV connection and what shows on it (box, logo and WOD)',
    name: 'Your name', nameHint: 'Optional. Shows at the top of the TV, next to the time.', namePh: 'e.g. Ana',
    tv: 'TV mode', onTv: (name) => `Coach ${name}`,
  },
  privacy: {
    banner: 'We use Google Analytics to learn which features are used and to fix errors. No name, no email and nothing you type.',
    accept: 'Accept', decline: 'Decline', policy: 'Privacy policy',
    toggle: 'Usage statistics', toggleHint: 'Google Analytics, no personal data. Helps improve CronoBox.',
    title: 'Privacy',
  },
  tv: {
    open: 'TV mode',
    openHint: 'Full-screen scoreboard for the box TV, with a remote or keyboard',
    start: 'Press OK to start',
    startHint: 'Turns on sound and full screen. Use the TV remote or a keyboard.',
    exit: 'Leave TV mode',
    keys: { play: 'start / pause', skip: 'skip phase', back: 'previous phase', mode: 'change mode', rounds: '+1 / −1 round', finish: 'finish', reset: 'reset', workout: 'change workout', repeat: 'repeat' },
    pressAgain: 'Press back again to reset',
    paused: 'Paused',
    nextWorkout: 'Next workout', duration: 'Duration', rounds: 'Rounds', workRest: 'Work / rest', every: 'Every', cap: 'Time cap', lap: 'Lap',
    okToStart: 'on the TV remote to start',
    round: 'Round', cycle: 'Cycle', next: 'Next', remaining: 'Left in workout', wod: 'The workout', roundsHint: 'count with ↑ ↓ on the remote', laps: 'laps done',
    doneTitle: 'Workout complete', doneMsg: 'Great job!', backHome: 'Back to the start screen in 2 minutes',
    customize: 'Customize TV mode', customizeHint: 'Box name, logo and the workout of the day (WOD) on the TV',
    setupCard: 'Make the TV look like your box', setupCardHint: 'Add the name, logo and today\'s WOD in Settings → Customize TV mode.',
    pair: {
      title: 'Control from your phone', hint: 'On your phone: CronoBox → TV icon → Scan, or type the code',
      connected: 'Coach phone connected', linked: 'connected', section: 'Box TV', waiting: 'Waiting for the TV', offline: 'No connection to the TV',
      tvOf: (code) => `TV ${code}`, connect: 'Connect to a TV', connectHint: 'Type the code shown on the box TV',
      codeLabel: 'TV code', disconnect: 'Disconnect', invalid: 'Invalid code: 6 letters and numbers, like K7Q-4M2',
      error: 'Could not connect. Check the internet and the code.',
    },
    setup: {
      title: 'TV mode', boxName: 'Box name', boxNamePh: 'e.g. Downtown CrossBox', logo: 'Logo', logoPick: 'Choose image', logoRemove: 'Remove',
      logoHint: 'PNG or JPG; shows in the TV corner', wod: 'Workout of the day (WOD)',
      wodHint: 'One line per movement. Shows on the TV start screen and next to the clock in AMRAP and For Time.',
      wodPh: '10 Thrusters 43/30 kg\n15 Pull-ups\n20 Double unders', open: 'Open TV mode',
    },
    connect: {
      button: 'Box TV', title: 'Connect to a TV', statusOn: (code) => `Connected to TV ${code}`, how: 'How to connect',
      step1: 'On the box TV, open the web browser and go to this address:',
      step2: 'The TV shows a QR code and a 6-character code, like K7Q-4M2.',
      step3: 'Scan the TV QR code here in the app, or type the code. Done: this phone becomes the remote and the TV plays the sounds.',
      share: 'Send the link', shareMsg: (url) => `Open this address in the box TV browser: ${url}`, copied: 'Link copied',
      scan: 'Scan TV QR code', typeCode: 'Type the code', connectShort: 'Connect',
      thisDevice: 'Use this device as the TV', thisDeviceHint: 'For a laptop, tablet or TV box plugged into the TV',
      hardware: 'Any TV with a web browser works (Samsung, LG, Android TV, Fire TV), or a laptop plugged into the TV over HDMI. The TV and the phone need internet, but not the same Wi-Fi.',
      iosTip: 'On iPhone with CronoBox on the home screen, use the Scan button here or type the code: the iPhone camera opens the link in Safari, which is separate from the app.',
      unavailable: 'TV connection is not active in this version.',
      scanTitle: 'Scan TV QR code', scanAim: 'Point at the QR code on the TV',
      scanAllow: 'Allow camera', scanDenied: 'No camera access. Allow it in the device settings or type the TV code.',
      scanWrong: 'That QR code is not from a CronoBox TV', scanNoCamera: 'No camera available on this device. Type the TV code.',
    },
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
    prepare: 'Get ready', work: 'Go', workRound: (r) => `Go, round ${r}`, last: 'Go, last round', cycle: (c) => `Cycle ${c}`,
    rest: 'Rest', restBC: 'Rest between cycles', cooldown: 'Cool down', run: 'Go', lap: (n) => `Lap ${n}`, done: 'Workout complete',
    emom: (r) => `Go, round ${r}`, amrap: 'AMRAP, go', fortime: 'For time, go', half: 'Halfway', timeCap: 'Time cap',
    count: (n) => ['', 'One', 'Two', 'Three'][n] ?? String(n),
  },
};

export const STRINGS: Record<Lang, Strings> = { pt, en };
