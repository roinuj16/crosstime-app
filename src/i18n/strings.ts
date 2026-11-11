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
  /** conta: entrada com link no e-mail, cadastro, minha conta */
  auth: {
    tagline: string; email: string; emailPh: string; continue: string; invalidEmail: string; privacy: string;
    sentTitle: string; sentBody: (email: string) => string; sentCode: string; sentCodeHint: string; resend: string; resendIn: (s: number) => string;
    otherEmail: string; spam: string; errSend: string; errOffline: string; errTooMany: string; errLink: string;
  };
  linkPage: {
    checking: string; invalid: string; invalidBody: string; used: string; usedBody: string; noRequest: string; noRequestBody: string;
    askTitle: string; askBody: (device: string) => string; askCode: string; yes: string; no: string; here: string;
    approved: string; approvedBody: string; denied: string; deniedBody: string; signedIn: string; emailAgain: string; go: string; error: string;
  };
  profile: {
    signupTitle: string; signupIntro: string; accountTitle: string; name: string; namePh: string; email: string;
    phone: string; phoneHint: string; whatsapp: string; role: string; aluno: string; coach: string;
    box: string; boxHint: string; boxPh: string; city: string; cityPh: string; marketing: string; marketingHint: string;
    save: string; saved: string; required: string; phoneInvalid: string; boxRequired: string; privacy: string; error: string;
    signOut: string; signOutAsk: string; delete: string; deleteHint: string; deleteAsk: string; deleteDone: string; deleteDataOnly: string; optional: string;
  };
  feedback: {
    title: string; settingsRow: string; settingsHint: string; rating: string; type: string; suggestion: string; problem: string; praise: string;
    message: string; messagePh: string; context: string; send: string; sent: string; sentBody: string; error: string;
    prompt: string; promptButton: string;
  };
  /** treinos especiais (Murph): coach cria, aluno se inscreve, conta e a TV mostra todos */
  events: {
    title: string; settingsRow: string; settingsHint: string; mine: string; mineEmpty: string; ofBox: string;
    boxTitle: string; boxIntro: string; boxName: string; boxCity: string; boxCreate: string;
    newMurph: string; noEvents: string; murphDesc: string; name: string; date: string; datePh: string; time: string; timePh: string;
    cap: string; capHint: string; spots: string; partition: string; partitionHint: string; vest: string; vestHint: string;
    create: string; badDate: string; error: string; min: (n: number) => string;
    status: { open: string; live: string; done: string };
    registered: (n: number, cap: number) => string; spotsLeft: (n: number) => string; full: string;
    link: string; share: string; shareMsg: (title: string, url: string) => string; copied: string;
    entries: string; noEntries: string; remove: string; removeAsk: (name: string) => string;
    showTv: string; hideTv: string; onTv: string; tvHint: string;
    start: string; startAsk: string; restart: string; restartAsk: string; end: string; endAsk: string; delete: string; deleteAsk: string;
    ranking: string; withVest: string; noPartition: string; yesPartition: string;
    join: string; joinTitle: string; nameOnTv: string; nameOnTvHint: string; vestAsk: string; vestAskHint: string;
    plan: string; planHint: string; planNone: string; planR20: string; planR10: string; planCustom: string; setOf: string;
    planSummary: (sets: number, size: number, last: number) => string; planOrder: string; planNoBreak: string;
    confirm: string; youAreIn: string; youAreInHint: string; editPlan: string; savePlan: string; cancel: string; cancelAsk: string;
    started: string; notFound: string; closed: string; signupNote: string;
    my: string; stage: (n: number, of: number) => string; now: string; doneTag: string; run: string; runDone: string;
    pu: string; ps: string; sq: string; set: string; total: (done: number, of: number) => string; left: (n: number) => string;
    undo: string; skipTo: (move: string) => string; quit: string; quitAsk: string; finished: string; timeCap: string; quitTag: string;
    waiting: string; waitingHint: string; tvWaitingHint: string; startsIn: string; limit: (t: string) => string; reps: string; result: string; yourTime: string; yourReps: string;
  };
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
  auth: {
    tagline: 'O timer do seu box, no celular e na TV.', email: 'Seu e-mail', emailPh: 'voce@email.com', continue: 'Continuar',
    invalidEmail: 'Confira o e-mail: parece que falta alguma coisa.', privacy: 'Como usamos seus dados',
    sentTitle: 'Confira seu e-mail', sentBody: (email) => `Enviamos um link para ${email}. Toque nele, neste ou em outro aparelho, e volte aqui: você entra sozinho.`,
    sentCode: 'Código deste pedido', sentCodeHint: 'A página do link vai mostrar o mesmo número.',
    resend: 'Reenviar o link', resendIn: (s) => `Reenviar em ${s}s`, otherEmail: 'Usar outro e-mail',
    spam: 'Não chegou? Veja no spam ou em Promoções. O remetente é noreply@cronobox-ba0cc.firebaseapp.com.',
    errSend: 'Não deu para enviar o link. Tente de novo em instantes.', errOffline: 'Sem internet. Conecte e tente de novo.',
    errTooMany: 'Muitos pedidos seguidos. Espere alguns minutos e tente de novo.', errLink: 'Esse link não vale mais. Peça um novo.',
  },
  linkPage: {
    checking: 'Conferindo o link…', invalid: 'Link inválido', invalidBody: 'Esse endereço não é um link de entrada do CronoBox. Abra o link do e-mail de novo ou peça um novo no app.',
    used: 'Link já usado', usedBody: 'Esse link já liberou a entrada. Se precisar, peça um novo no app.',
    noRequest: 'Entrar neste navegador', noRequestBody: 'Não achamos o pedido que gerou este link (ele vale por cerca de 1 hora). Digite o e-mail para entrar aqui mesmo.',
    askTitle: 'Entrar no CronoBox?', askBody: (device) => `Alguém pediu para entrar com este e-mail em: ${device || 'outro aparelho'}.`,
    askCode: 'Confira se é o mesmo número que aparece na tela que está esperando:',
    yes: 'Sim, sou eu: entrar lá', no: 'Não fui eu', here: 'Prefiro entrar aqui neste navegador',
    approved: 'E-mail confirmado!', approvedBody: 'Pode voltar para o CronoBox: em alguns segundos você entra sozinho. Esta página já pode ser fechada.',
    denied: 'Tudo certo', deniedBody: 'Ninguém entrou com o seu e-mail. Pode fechar esta página.',
    signedIn: 'Entrando…', emailAgain: 'Confirme o e-mail', go: 'Entrar', error: 'Não deu para confirmar. Peça um novo link no app.',
  },
  profile: {
    signupTitle: 'Cadastro', signupIntro: 'Falta pouco. Conte quem você é: assim avisamos das novidades e do lançamento.',
    accountTitle: 'Minha conta', name: 'Nome', namePh: 'Como quer ser chamado', email: 'E-mail',
    phone: 'Telefone', phoneHint: 'Com DDD. Opcional.', whatsapp: 'Pode me chamar no WhatsApp', role: 'Você é',
    aluno: 'Aluno', coach: 'Coach', box: 'Box onde treina', boxHint: 'Obrigatório para coach.', boxPh: 'Ex.: Box Fortaleza',
    city: 'Cidade', cityPh: 'Ex.: Fortaleza', marketing: 'Quero receber novidades e o aviso de lançamento',
    marketingHint: 'Por e-mail (e WhatsApp, se você liberou acima). Dá para desligar quando quiser.',
    save: 'Salvar', saved: 'Salvo', required: 'Preencha este campo', phoneInvalid: 'Telefone com DDD, só números', boxRequired: 'Coach precisa informar o box',
    privacy: 'Ao continuar, você concorda com a política de privacidade.', error: 'Não deu para salvar. Confira a internet e tente de novo.',
    signOut: 'Sair', signOutAsk: 'Sair da conta neste aparelho? Seus treinos continuam guardados na conta.',
    delete: 'Excluir minha conta', deleteHint: 'Apaga o cadastro e os dados guardados na conta. Não dá para desfazer.',
    deleteAsk: 'Excluir a conta e apagar o cadastro e os dados guardados nela? Não dá para desfazer.',
    deleteDone: 'Conta excluída.', deleteDataOnly: 'Cadastro e dados apagados. Para remover também o e-mail do login, entre de novo e toque em Excluir logo em seguida.',
    optional: 'opcional',
  },
  feedback: {
    title: 'Avaliar e sugerir', settingsRow: 'Avaliar e sugerir', settingsHint: 'Nota, ideias, problemas: tudo ajuda a melhorar o CronoBox',
    rating: 'Sua nota (opcional)', type: 'Sobre o quê?', suggestion: 'Sugestão', problem: 'Problema', praise: 'Elogio',
    message: 'Conte pra gente', messagePh: 'O que podemos melhorar, o que deu errado ou o que você gostou…',
    context: 'Vai junto, para ajudar a entender: a tela, a versão do app, o aparelho e o modo do timer. Nada do que você não escreveu aqui.',
    send: 'Enviar', sent: 'Valeu!', sentBody: 'Recebemos sua mensagem.', error: 'Não deu para enviar. Confira a internet e tente de novo.',
    prompt: 'Como foi o treino? Conte o que achou do CronoBox.', promptButton: 'Avaliar',
  },
  events: {
    title: 'Treinos especiais', settingsRow: 'Treinos especiais', settingsHint: 'Murph do box: inscrição, contagem e TV ao vivo',
    mine: 'Minhas inscrições', mineEmpty: 'Quando o coach mandar o link de um treino especial, ele aparece aqui.', ofBox: 'Do seu box',
    boxTitle: 'Seu box', boxIntro: 'Os treinos especiais ficam no box. Confira o nome e crie o box para começar.',
    boxName: 'Nome do box', boxCity: 'Cidade', boxCreate: 'Criar o box',
    newMurph: 'Novo Murph', noEvents: 'Nenhum treino especial ainda.',
    murphDesc: '1 milha de corrida · 100 pull-ups · 200 push-ups · 300 air squats · 1 milha de corrida.',
    name: 'Nome do treino', date: 'Data', datePh: 'dd/mm/aaaa', time: 'Hora', timePh: 'hh:mm',
    cap: 'Tempo limite', capHint: 'Quem não terminar fica com o que fez até aqui.', spots: 'Vagas',
    partition: 'Permitir quebras', partitionHint: 'O aluno pode dividir pull-ups, push-ups e air squats em séries (ex.: 20 rodadas de 5-10-15).',
    vest: 'Opção de colete', vestHint: 'O aluno marca na inscrição se vai fazer com colete (20 lb / 9 kg).',
    create: 'Criar', badDate: 'Confira a data (dd/mm/aaaa) e a hora (hh:mm).', error: 'Não deu certo. Confira a internet e tente de novo.',
    min: (n) => `${n} min`,
    status: { open: 'Inscrições abertas', live: 'Valendo', done: 'Encerrado' },
    registered: (n, cap) => `${n}/${cap} inscritos`, spotsLeft: (n) => (n === 1 ? '1 vaga' : `${n} vagas`), full: 'Esgotado',
    link: 'Link de inscrição', share: 'Enviar o link', shareMsg: (title, url) => `Inscrição para o ${title}: ${url}`, copied: 'Link copiado',
    entries: 'Inscritos', noEntries: 'Ninguém inscrito ainda. Envie o link.', remove: 'Tirar', removeAsk: (name) => `Tirar ${name} e liberar a vaga?`,
    showTv: 'Mostrar na TV', hideTv: 'Voltar a TV para o timer', onTv: 'Na TV agora', tvHint: 'Conecte este celular à TV (ícone de TV no topo do timer) para mostrar o treino lá.',
    start: 'Iniciar o Murph', startAsk: 'Começar agora? A TV e os celulares dos alunos fazem a contagem de 10 segundos.',
    restart: 'Recomeçar', restartAsk: 'Voltar para antes do start e apagar a contagem de todos?',
    end: 'Encerrar o evento', endAsk: 'Encerrar? Quem ainda não terminou fica com o que fez.',
    delete: 'Excluir o treino', deleteAsk: 'Excluir este treino especial?',
    ranking: 'Resultado', withVest: 'colete', noPartition: 'Sem quebras', yesPartition: 'Com quebras',
    join: 'Quero participar', joinTitle: 'Inscrição', nameOnTv: 'Nome na TV', nameOnTvHint: 'Vem do seu cadastro. Aparece para todos na TV e no resultado.',
    vestAsk: 'Vou fazer com colete', vestAskHint: '20 lb (9 kg), como o Murph oficial.',
    plan: 'Como você vai fazer', planHint: 'Escolha como dividir pull-ups, push-ups e air squats. Dá para mudar até o start.',
    planNone: 'Sem quebra', planR20: '20 × 5-10-15', planR10: '10 × 10-20-30', planCustom: 'Personalizado', setOf: 'Série de',
    planSummary: (sets, size, last) => (sets === 1 ? `de uma vez (${size})` : last === size ? `${sets} séries de ${size}` : `${sets - 1} séries de ${size} e 1 de ${last}`),
    planOrder: 'O app alterna pull-up → push-up → air squat e passa sozinho para o próximo quando você fecha a série.',
    planNoBreak: 'Na ordem: 100 pull-ups, depois 200 push-ups, depois 300 air squats.',
    confirm: 'Confirmar inscrição', youAreIn: 'Você está inscrito!',
    youAreInHint: 'No dia, abra este link e deixe a tela aberta: quando o coach der o start, a contagem começa aqui.',
    editPlan: 'Mudar como vou fazer', savePlan: 'Salvar', cancel: 'Cancelar inscrição', cancelAsk: 'Cancelar a inscrição e liberar a vaga?',
    started: 'O treino já começou. Inscrições encerradas.', notFound: 'Treino não encontrado. Confira o link.', closed: 'Inscrições encerradas.',
    signupNote: 'Para se inscrever, entre com seu e-mail.',
    my: 'Meu Murph', stage: (n, of) => `Etapa ${n} de ${of}`, now: 'Agora', doneTag: 'Feito', run: '1 milha', runDone: 'Terminei a corrida',
    pu: 'Pull-ups', ps: 'Push-ups', sq: 'Air squats', set: 'série', total: (done, of) => `${done}/${of} no total`, left: (n) => `faltam ${n}`,
    undo: 'Desfazer', skipTo: (move) => `Pular para ${move}`, quit: 'Encerrar meu treino', quitAsk: 'Encerrar agora? Fica registrado o que você fez até aqui.',
    finished: 'Treino concluído!', timeCap: 'Tempo esgotado', quitTag: 'Encerrou',
    waiting: 'Aguardando o start', waitingHint: 'O coach dá o start. Deixe esta tela aberta.', tvWaitingHint: 'O coach dá o start pelo celular (Treinos especiais → Iniciar o Murph).', startsIn: 'Começa em',
    limit: (t) => `limite ${t}`, reps: 'reps', result: 'Seu resultado', yourTime: 'Seu tempo', yourReps: 'Repetições',
  },
  coach: {
    title: 'Coach', hint: 'Seu nome na TV, a conexão com a TV, o nome do box e o logo',
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
  auth: {
    tagline: 'Your box timer, on the phone and on the TV.', email: 'Your email', emailPh: 'you@email.com', continue: 'Continue',
    invalidEmail: 'Check the email: something seems to be missing.', privacy: 'How we use your data',
    sentTitle: 'Check your email', sentBody: (email) => `We sent a link to ${email}. Tap it, on this or another device, and come back here: you will be signed in automatically.`,
    sentCode: 'Request code', sentCodeHint: 'The link page will show the same number.',
    resend: 'Resend link', resendIn: (s) => `Resend in ${s}s`, otherEmail: 'Use another email',
    spam: 'Nothing yet? Check spam or Promotions. The sender is noreply@cronobox-ba0cc.firebaseapp.com.',
    errSend: 'Could not send the link. Try again in a moment.', errOffline: 'No internet. Connect and try again.',
    errTooMany: 'Too many requests. Wait a few minutes and try again.', errLink: 'This link is no longer valid. Request a new one.',
  },
  linkPage: {
    checking: 'Checking the link…', invalid: 'Invalid link', invalidBody: 'This is not a CronoBox sign-in link. Open the email link again or request a new one in the app.',
    used: 'Link already used', usedBody: 'This link already signed someone in. Request a new one in the app if needed.',
    noRequest: 'Sign in on this browser', noRequestBody: 'We could not find the request for this link (it lasts about 1 hour). Type the email to sign in right here.',
    askTitle: 'Sign in to CronoBox?', askBody: (device) => `Someone asked to sign in with this email on: ${device || 'another device'}.`,
    askCode: 'Check it is the same number shown on the waiting screen:',
    yes: 'Yes, it is me: sign in there', no: 'It was not me', here: 'Sign in on this browser instead',
    approved: 'Email confirmed!', approvedBody: 'Go back to CronoBox: you will be signed in within seconds. You can close this page.',
    denied: 'All good', deniedBody: 'Nobody signed in with your email. You can close this page.',
    signedIn: 'Signing in…', emailAgain: 'Confirm your email', go: 'Sign in', error: 'Could not confirm. Request a new link in the app.',
  },
  profile: {
    signupTitle: 'Sign up', signupIntro: 'Almost there. Tell us who you are so we can let you know about news and the launch.',
    accountTitle: 'My account', name: 'Name', namePh: 'What should we call you', email: 'Email',
    phone: 'Phone', phoneHint: 'With area code. Optional.', whatsapp: 'You can reach me on WhatsApp', role: 'You are',
    aluno: 'Athlete', coach: 'Coach', box: 'Box where you train', boxHint: 'Required for coaches.', boxPh: 'e.g. Box Fortaleza',
    city: 'City', cityPh: 'e.g. Fortaleza', marketing: 'Send me news and the launch announcement',
    marketingHint: 'By email (and WhatsApp, if allowed above). You can turn it off anytime.',
    save: 'Save', saved: 'Saved', required: 'Fill in this field', phoneInvalid: 'Phone with area code, numbers only', boxRequired: 'Coaches need to tell the box',
    privacy: 'By continuing you agree with the privacy policy.', error: 'Could not save. Check the internet and try again.',
    signOut: 'Sign out', signOutAsk: 'Sign out on this device? Your workouts stay saved in the account.',
    delete: 'Delete my account', deleteHint: 'Deletes your profile and the data saved in the account. This cannot be undone.',
    deleteAsk: 'Delete the account and erase the profile and data saved in it? This cannot be undone.',
    deleteDone: 'Account deleted.', deleteDataOnly: 'Profile and data deleted. To also remove the sign-in email, sign in again and tap Delete right away.',
    optional: 'optional',
  },
  feedback: {
    title: 'Rate and suggest', settingsRow: 'Rate and suggest', settingsHint: 'Ratings, ideas, problems: it all helps improve CronoBox',
    rating: 'Your rating (optional)', type: 'About what?', suggestion: 'Suggestion', problem: 'Problem', praise: 'Praise',
    message: 'Tell us', messagePh: 'What we can improve, what went wrong or what you liked…',
    context: 'Sent along to help us understand: the screen, app version, device and timer mode. Nothing you did not write here.',
    send: 'Send', sent: 'Thanks!', sentBody: 'We got your message.', error: 'Could not send. Check the internet and try again.',
    prompt: 'How was the workout? Tell us what you think of CronoBox.', promptButton: 'Rate',
  },
  events: {
    title: 'Special workouts', settingsRow: 'Special workouts', settingsHint: 'Box Murph: sign-up, rep counter and live TV',
    mine: 'My sign-ups', mineEmpty: 'When your coach sends a special workout link, it shows up here.', ofBox: 'Your box',
    boxTitle: 'Your box', boxIntro: 'Special workouts belong to the box. Check the name and create the box to start.',
    boxName: 'Box name', boxCity: 'City', boxCreate: 'Create the box',
    newMurph: 'New Murph', noEvents: 'No special workouts yet.',
    murphDesc: '1 mile run · 100 pull-ups · 200 push-ups · 300 air squats · 1 mile run.',
    name: 'Workout name', date: 'Date', datePh: 'dd/mm/yyyy', time: 'Time', timePh: 'hh:mm',
    cap: 'Time cap', capHint: 'Whoever does not finish keeps what they did.', spots: 'Spots',
    partition: 'Allow partitioning', partitionHint: 'Athletes may split pull-ups, push-ups and air squats into sets (e.g. 20 rounds of 5-10-15).',
    vest: 'Vest option', vestHint: 'Athletes tell at sign-up if they will wear a vest (20 lb / 9 kg).',
    create: 'Create', badDate: 'Check the date (dd/mm/yyyy) and time (hh:mm).', error: 'Something went wrong. Check the internet and try again.',
    min: (n) => `${n} min`,
    status: { open: 'Sign-ups open', live: 'Live', done: 'Finished' },
    registered: (n, cap) => `${n}/${cap} signed up`, spotsLeft: (n) => (n === 1 ? '1 spot' : `${n} spots`), full: 'Sold out',
    link: 'Sign-up link', share: 'Send the link', shareMsg: (title, url) => `Sign up for ${title}: ${url}`, copied: 'Link copied',
    entries: 'Athletes', noEntries: 'Nobody signed up yet. Send the link.', remove: 'Remove', removeAsk: (name) => `Remove ${name} and free the spot?`,
    showTv: 'Show on TV', hideTv: 'Back to the timer on TV', onTv: 'On TV now', tvHint: 'Connect this phone to the TV (TV icon at the top of the timer) to show the workout there.',
    start: 'Start the Murph', startAsk: 'Start now? The TV and the athletes\' phones count down 10 seconds.',
    restart: 'Restart', restartAsk: 'Go back to before the start and erase everyone\'s count?',
    end: 'End the event', endAsk: 'End it? Whoever has not finished keeps what they did.',
    delete: 'Delete workout', deleteAsk: 'Delete this special workout?',
    ranking: 'Results', withVest: 'vest', noPartition: 'No partitioning', yesPartition: 'Partitioning allowed',
    join: 'I want in', joinTitle: 'Sign-up', nameOnTv: 'Name on the TV', nameOnTvHint: 'From your profile. Everyone sees it on the TV and in the results.',
    vestAsk: 'I will wear a vest', vestAskHint: '20 lb (9 kg), like the official Murph.',
    plan: 'How you will do it', planHint: 'Choose how to split pull-ups, push-ups and air squats. You can change it until the start.',
    planNone: 'No partition', planR20: '20 × 5-10-15', planR10: '10 × 10-20-30', planCustom: 'Custom', setOf: 'Set of',
    planSummary: (sets, size, last) => (sets === 1 ? `all at once (${size})` : last === size ? `${sets} sets of ${size}` : `${sets - 1} sets of ${size} and 1 of ${last}`),
    planOrder: 'The app rotates pull-up → push-up → air squat and moves on by itself when you finish a set.',
    planNoBreak: 'In order: 100 pull-ups, then 200 push-ups, then 300 air squats.',
    confirm: 'Confirm sign-up', youAreIn: 'You are in!',
    youAreInHint: 'On the day, open this link and keep the screen on: when the coach starts, counting begins here.',
    editPlan: 'Change how I will do it', savePlan: 'Save', cancel: 'Cancel sign-up', cancelAsk: 'Cancel the sign-up and free your spot?',
    started: 'The workout has started. Sign-ups closed.', notFound: 'Workout not found. Check the link.', closed: 'Sign-ups closed.',
    signupNote: 'Sign in with your email to sign up.',
    my: 'My Murph', stage: (n, of) => `Stage ${n} of ${of}`, now: 'Now', doneTag: 'Done', run: '1 mile', runDone: 'I finished the run',
    pu: 'Pull-ups', ps: 'Push-ups', sq: 'Air squats', set: 'set', total: (done, of) => `${done}/${of} total`, left: (n) => `${n} left`,
    undo: 'Undo', skipTo: (move) => `Skip to ${move}`, quit: 'End my workout', quitAsk: 'End now? What you did so far is recorded.',
    finished: 'Workout complete!', timeCap: 'Time cap', quitTag: 'Ended',
    waiting: 'Waiting for the start', waitingHint: 'The coach starts it. Keep this screen on.', tvWaitingHint: 'The coach starts it from the phone (Special workouts → Start the Murph).', startsIn: 'Starts in',
    limit: (t) => `cap ${t}`, reps: 'reps', result: 'Your result', yourTime: 'Your time', yourReps: 'Reps',
  },
  coach: {
    title: 'Coach', hint: 'Your name on the TV, the TV connection, box name and logo',
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
