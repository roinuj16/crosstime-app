/**
 * Texto da política de privacidade (página /privacy). Linguagem simples.
 * Revisar com quem cuida do jurídico antes de abrir para muitos boxes.
 */
export interface PolicySection { title: string; body: string }

export const POLICY: Record<'pt' | 'en', { updated: string; sections: PolicySection[] }> = {
  pt: {
    updated: 'Atualizada em 6 de novembro de 2026',
    sections: [
      { title: 'Cadastro', body: 'Para usar o CronoBox você entra com o seu e-mail (confirmado por um link) e faz um cadastro: nome, se é aluno ou coach, o box onde treina (obrigatório para coach) e, se quiser, telefone e cidade. Usamos esses dados para saber quem usa o app e, só se você marcar a opção, para mandar novidades e o aviso de lançamento por e-mail (e WhatsApp, se você liberar). Não vendemos nem passamos seus dados para outras empresas.' },
      { title: 'Seus dados na conta', body: 'Treinos salvos, tempos, WOD de cada modo, nome do box, logo, nome do coach e preferências ficam no seu aparelho e também na sua conta, para aparecerem quando você entrar em outro aparelho. O histórico de treinos fica só no aparelho. Cadastro e dados na conta ficam no Firebase (Google), protegidos para que só você acesse.' },
      { title: 'Avaliações e sugestões', body: 'Quando você manda uma avaliação ou sugestão, guardamos a nota, o texto e, para entender o contexto, a tela de onde veio, a versão do app, o tipo de aparelho e navegador e o modo do timer.' },
      { title: 'Pareamento com a TV', body: 'Quando você conecta o celular à TV do box, o estado do timer (modo, tempos, play e pausa), os treinos salvos e a marca do box (nome, logo e WOD) passam por uma sala no Firebase Realtime Database, do Google, identificada só pelo código da TV. A sala não guarda seus dados de cadastro.' },
      { title: 'Estatísticas de uso (opcional)', body: 'Se você aceitar, usamos o Google Analytics para contar o uso: telas abertas, treinos iniciados e concluídos (modo e duração), uso do modo TV e do pareamento, e erros do app. O Google recebe também dados técnicos, como tipo de aparelho, navegador e região aproximada. Não enviamos nome, e-mail, nome do box, WOD nem nada do que você digita.' },
      { title: 'Como recusar ou mudar de ideia', body: 'Você pode recusar no aviso ou desligar a qualquer momento em Ajustes → Estatísticas de uso. Recusando, nenhum script do Google Analytics é carregado.' },
      { title: 'Por quanto tempo', body: 'Os dados das estatísticas ficam no Google Analytics pelo prazo de retenção configurado no projeto (padrão de 2 meses). As salas de pareamento guardam só o último estado do timer de cada TV. Cadastro e dados na conta ficam até você excluir a conta.' },
      { title: 'Seus direitos (LGPD)', body: 'Você pode ver e corrigir seu cadastro em Ajustes → Minha conta, desligar as novidades quando quiser e excluir a conta (o cadastro e os dados guardados nela são apagados). Para outros pedidos, fale com a gente em Ajustes → Avaliar e sugerir.' },
    ],
  },
  en: {
    updated: 'Updated November 6, 2026',
    sections: [
      { title: 'Sign-up', body: 'To use CronoBox you sign in with your email (confirmed by a link) and fill in a short profile: name, whether you are an athlete or a coach, the box where you train (required for coaches) and, if you want, phone and city. We use this to know who uses the app and, only if you tick the option, to send news and the launch announcement by email (and WhatsApp, if you allow it). We do not sell or share your data with other companies.' },
      { title: 'Your data in the account', body: 'Saved workouts, times, the WOD of each mode, box name, logo, coach name and preferences stay on your device and also in your account, so they show up when you sign in on another device. Workout history stays on the device only. Profile and account data are stored in Firebase (Google), protected so that only you can access them.' },
      { title: 'Ratings and suggestions', body: 'When you send a rating or suggestion we store the rating, the text and, to understand the context, the screen it came from, the app version, the device and browser type and the timer mode.' },
      { title: 'Pairing with the TV', body: 'When you connect your phone to the box TV, the timer state (mode, times, play and pause), saved workouts and the box branding (name, logo and WOD) go through a room in Google\'s Firebase Realtime Database, identified only by the TV code. The room does not keep your profile data.' },
      { title: 'Usage statistics (optional)', body: 'If you accept, we use Google Analytics to count usage: screens opened, workouts started and completed (mode and duration), TV mode and pairing use, and app errors. Google also receives technical data such as device type, browser and approximate region. We never send your name, email, box name, WOD or anything you type.' },
      { title: 'How to decline or change your mind', body: 'Decline in the notice or turn it off anytime in Settings → Usage statistics. If you decline, no Google Analytics script is loaded.' },
      { title: 'How long', body: 'Statistics stay in Google Analytics for the retention period set in the project (2 months by default). Pairing rooms keep only the latest timer state of each TV. Profile and account data stay until you delete the account.' },
      { title: 'Your rights', body: 'You can see and fix your profile in Settings → My account, turn news off anytime and delete the account (profile and account data are erased). For anything else, reach us in Settings → Rate and suggest.' },
    ],
  },
};
