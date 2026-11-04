# Pareamento TV ↔ celular do coach (Firebase)

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
