# Firebase: pareamento TV ↔ celular e Google Analytics

O pareamento usa o **Firebase Realtime Database** (plano grátis Spark) com **login anônimo**.
Nenhum dado pessoal é guardado: só o estado do timer, o treino escolhido e a marca do box
(nome, logo, WOD), dentro de uma "sala" identificada pelo código que aparece na TV.

## Configurar (uma vez)

1. Em [console.firebase.google.com](https://console.firebase.google.com), crie um projeto
   (pode recusar o Google Analytics).
2. **Build → Realtime Database → Criar banco**: região `us-central1`, começar em **modo bloqueado**.
3. Na aba **Regras** do Realtime Database, cole o conteúdo de [`database.rules.json`](../database.rules.json) e publique.
4. **Build → Authentication → Começar → Método de login → Anônimo → Ativar**.
5. **Configurações do projeto → Seus apps → Web (`</>`)**: registre o app (sem Hosting) e copie
   o objeto `firebaseConfig`.
6. Cole esse objeto em [`src/config/firebase.ts`](../src/config/firebase.ts) no lugar do `null`.
   Esses valores não são segredo; quem protege o banco são as regras.

Sem esse passo, o app funciona normalmente e só o pareamento fica escondido.

7. **Authentication → Configurações → Domínios autorizados → Adicionar domínio**: o endereço do
   web app (ex.: `cronobox.expo.app`). Sem isso, o login anônimo é recusado no site publicado
   e o pareamento não conecta (no `localhost` já funciona).

Projeto atual: **Cronobox** (`cronobox-ba0cc`), configurado em `src/config/firebase.ts`.

## Como funciona

- A TV (`/tv`) cria a sala `rooms/<código>` e mostra o QR code (`…/pair?code=<código>`) e o código.
- O celular lê o QR (abre o web app) ou digita o código em **Ajustes → TV do box**.
- O celular manda tudo o que tem ao entrar (treino, treinos salvos, nome do box, logo, WOD);
  depois, quem mexer por último — no celular ou no controle da TV — vale para os dois.
- Os horários viajam no relógio do servidor, então os dois relógios ficam iguais mesmo se o
  relógio da TV estiver alguns segundos errado.
- Pareado, o celular só vibra: o som e a voz saem na TV.

Código: `src/core/sync.ts` (o que vai e volta, testado), `src/services/syncLoop.ts` (envia e
aplica, testado com duas telas falsas), `src/services/remote.ts` (Firebase).

## Google Analytics (web)

- Só liga depois que a pessoa toca em **Aceitar** no aviso (ou liga em Ajustes → Estatísticas de uso).
  Antes disso nenhum script do Google é carregado (conferido: zero requisições ao Google antes do aceite).
- Eventos: `page_view` por tela, `workout_start`, `workout_complete`, `workout_reset` (modo e tempos),
  `tv_start`, `tv_remote` (ação do controle), `pairing_connected`, `pwa_installed` e `app_error`
  (na web não existe Crashlytics). Nunca vão nome do box, WOD, nomes de treino ou texto digitado.
- Política de privacidade em `/privacy` (texto em `src/i18n/privacy.ts`).
- No app instalado (iPhone/Android), Analytics e **Crashlytics** entram com o `@react-native-firebase`
  num build novo (precisa dos arquivos `google-services.json` e `GoogleService-Info.plist`).

## Conta: entrada com link no e-mail, cadastro e sugestões

O web app só abre para quem entrou com o e-mail (link) e fez o cadastro. O modo TV (`/tv`),
a conexão pelo QR (`/pair`), a página do link (`/confirm`) e a privacidade continuam abertos.

### 1. Ativar a entrada por link no e-mail
1. Firebase → **Authentication** → **Método de login** → **Adicionar novo provedor** → **E-mail/senha**.
2. Ative **E-mail/senha** e, logo abaixo, **Link do e-mail (login sem senha)** → **Salvar**.
3. Deixe o **Anônimo** ligado (a TV e o pedido de entrada usam).
4. Em **Authentication** → **Configurações** → **Domínios autorizados**, confira que estão
   `cronobox.expo.app` e `localhost`.

### 2. Criar o Firestore
1. Firebase → **Firestore Database** → **Criar banco de dados**.
2. Edição **Standard**, local **southamerica-east1 (São Paulo)**, **modo de produção**.
3. Aba **Regras**: apague tudo, cole o conteúdo de `firestore.rules` → **Publicar**.

Fica no plano grátis (Spark). Não precisa de cartão.

### Onde ver os dados
- **Cadastros**: Firestore → coleção `users` (um documento por pessoa).
- **Sugestões**: Firestore → coleção `feedback` (nota, tipo, texto, tela, versão, aparelho).
- **Dados na conta** (treinos, WOD, preferências): coleção `userData`.
- `loginRequests` são pedidos de entrada; somem depois de usados. Os que ninguém usou podem
  ser apagados à vontade (opcional: política de TTL no campo `createdAt`).

### Como a entrada funciona (para quem for mexer no código)
`src/services/account.web.ts`: o app cria `loginRequests/<id>` e o Firebase manda o link
`/confirm?rid=<id>&oobCode=…`. Aberto no mesmo navegador, entra ali. Aberto em outro (Safari ×
ícone da tela de início, app do Gmail, computador), a página pergunta "foi você?", mostra o
código de 2 dígitos que também aparece no app que espera, e grava o link no pedido; o app que
espera lê e entra com ele. O link só pode ser gravado uma vez e o id só vai no e-mail.
