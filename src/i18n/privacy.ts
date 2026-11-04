/**
 * Texto da política de privacidade (página /privacy). Linguagem simples.
 * Revisar com quem cuida do jurídico antes de abrir para muitos boxes.
 */
export interface PolicySection { title: string; body: string }

export const POLICY: Record<'pt' | 'en', { updated: string; sections: PolicySection[] }> = {
  pt: {
    updated: 'Atualizada em 4 de novembro de 2026',
    sections: [
      { title: 'O que fica só no seu aparelho', body: 'Treinos salvos, histórico, cores, ajustes, nome do box, logo e o WOD ficam guardados no seu celular, no navegador ou na TV. Não temos acesso a eles.' },
      { title: 'Pareamento com a TV', body: 'Quando você conecta o celular à TV do box, o estado do timer (modo, tempos, play e pausa), os treinos salvos e a marca do box (nome, logo e WOD) passam por uma sala no Firebase Realtime Database, do Google, identificada só pelo código da TV. Não há cadastro: o acesso é anônimo.' },
      { title: 'Estatísticas de uso (opcional)', body: 'Se você aceitar, usamos o Google Analytics para contar o uso: telas abertas, treinos iniciados e concluídos (modo e duração), uso do modo TV e do pareamento, e erros do app. O Google recebe também dados técnicos, como tipo de aparelho, navegador e região aproximada. Não enviamos nome, e-mail, nome do box, WOD nem nada do que você digita.' },
      { title: 'Como recusar ou mudar de ideia', body: 'Você pode recusar no aviso ou desligar a qualquer momento em Ajustes → Estatísticas de uso. Recusando, nenhum script do Google Analytics é carregado.' },
      { title: 'Por quanto tempo', body: 'Os dados das estatísticas ficam no Google Analytics pelo prazo de retenção configurado no projeto (padrão de 2 meses). As salas de pareamento guardam só o último estado do timer de cada TV.' },
      { title: 'Seus direitos (LGPD)', body: 'Você pode pedir informações, correção ou exclusão de dados ligados ao seu uso pelos canais de contato do CrossTimer.' },
    ],
  },
  en: {
    updated: 'Updated November 4, 2026',
    sections: [
      { title: 'What stays on your device', body: 'Saved workouts, history, colors, settings, box name, logo and the WOD are stored on your phone, browser or TV. We have no access to them.' },
      { title: 'Pairing with the TV', body: 'When you connect your phone to the box TV, the timer state (mode, times, play and pause), saved workouts and the box branding (name, logo and WOD) go through a room in Google\'s Firebase Realtime Database, identified only by the TV code. There is no sign-up: access is anonymous.' },
      { title: 'Usage statistics (optional)', body: 'If you accept, we use Google Analytics to count usage: screens opened, workouts started and completed (mode and duration), TV mode and pairing use, and app errors. Google also receives technical data such as device type, browser and approximate region. We never send your name, email, box name, WOD or anything you type.' },
      { title: 'How to decline or change your mind', body: 'Decline in the notice or turn it off anytime in Settings → Usage statistics. If you decline, no Google Analytics script is loaded.' },
      { title: 'How long', body: 'Statistics stay in Google Analytics for the retention period set in the project (2 months by default). Pairing rooms keep only the latest timer state of each TV.' },
      { title: 'Your rights', body: 'You can ask for information, correction or deletion of data related to your use through CrossTimer\'s contact channels.' },
    ],
  },
};
