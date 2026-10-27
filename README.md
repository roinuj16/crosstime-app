# CrossTimer

Timer de intervalos para cross training — **Tabata, Rounds, EMOM, AMRAP, For Time e Cronômetro**
(com *time lap*) — no visual de placar de LED do box. React Native + Expo (SDK 58) + TypeScript.

## Rodar no celular (Expo Go)

1. Instale o app **Expo Go** no celular (App Store / Play Store).
2. No Mac:
   ```bash
   git clone https://github.com/roinuj16/crosstime-app.git
   cd crosstime-app
   npm install
   npx expo start
   ```
3. Aponte a câmera do iPhone (ou o Expo Go no Android) para o QR code que aparece no terminal.
   O celular e o Mac precisam estar na mesma rede Wi-Fi.

## Modos

| Modo | Como funciona |
|---|---|
| Tabata | Trabalho e descanso em rounds e ciclos, com descanso entre ciclos e desaquecimento |
| Rounds | Rounds de trabalho e descanso |
| EMOM | Um round no início de cada intervalo (padrão: a cada 1 min, 10 rounds) |
| AMRAP | Contagem regressiva única; a faixa do meio é um contador de rounds (toque +1, segure −1) |
| For Time | Conta para cima até tocar em **Terminei** ou bater o time cap (00:00 = sem limite) |
| Cronômetro | Conta para cima e toca um sinal a cada *time lap* |

## Comandos

| Comando | O que faz |
|---|---|
| `npm test` | Roda os testes (motor do timer e estado do app) |
| `npm run typecheck` | Checa os tipos do TypeScript |
| `npx expo start` | Abre o servidor de desenvolvimento |

## Estrutura

```
src/
  app/            telas (Expo Router): timer, edição, ajustes, cores, treinos
  components/     componentes visuais (botão play com anel de progresso…)
  core/engine.ts  motor do timer: só cálculo, sem React — coração do app
  core/view.ts    o que a tela mostra em cada estado (testável, sem React)
  hooks/          laço do relógio (eventos de fase, 3-2-1, volta, fim)
  i18n/           textos em português e inglês (idioma do aparelho por padrão)
  store/          estado do app (Zustand) salvo no aparelho (SQLite chave-valor)
  theme/          cores de LED, combinações prontas e fontes
__tests__/        testes Jest
```

### Como o motor funciona

O timer **não conta tiques**: guarda quando começou a correr e quanto tempo já tinha
acumulado, e deduz a fase atual desse tempo. Por isso não acumula atraso, continua de onde
parou se o app for fechado e permite pular/voltar fases só mudando o tempo decorrido.

Regra herdada do app de referência: o último descanso de cada ciclo é pulado; entre ciclos
entra o "descanso entre ciclos" e, no fim, o desaquecimento (Tabata padrão = 09:50).

## Cores

Cada fase tem uma cor de LED configurável em **Ajustes → Cores** (10 cores, prévia ao vivo e
combinações prontas). Padrão "Placar do box": trabalho verde, descanso vermelho, preparar âmbar,
desaquecimento ciano.

## Sons e voz

- Os sons ficam em `assets/sounds/` e são **gerados por código** (`python3 scripts/make-sounds.py`), sem arquivos de terceiros.
- `src/core/cues.ts` decide o que tocar/falar/vibrar em cada evento (testado); `src/services/feedback.ts` executa no aparelho.
- O áudio toca mesmo com o iPhone no modo silencioso. "Abaixar música de outros apps" liga o *ducking* só durante os avisos.
- A voz usa as vozes do sistema; em **Ajustes → Voz** dá para ouvir e escolher. Vozes "Premium/Aprimoradas" soam bem melhor.
- A lanterna precisa da câmera ativa, então só pisca com o app aberto (limitação do sistema).

### O que conferir no celular
1. **Ajustes → Testar som e voz** (com e sem o modo silencioso).
2. Um Tabata curto: bipe e voz na troca de fase, 3-2-1 no fim de cada fase, vibração.
3. Com música tocando em outro app: com "Abaixar música" desligado ela deve continuar no mesmo volume; ligado, baixar só nos avisos.
4. Lanterna: ligar em Ajustes (pede permissão da câmera) e iniciar um treino.

## Pré-visualizar no navegador

`npx expo start --web` abre o app no navegador (o armazenamento usa o `localStorage`).
No web, as caixas de confirmação nativas (zerar treino, trocar de modo) não aparecem; no celular, sim.

## Roteiro

- [x] **Fase 1 — Fundação:** projeto, motor + testes, estado salvo, idiomas, cores, tela do timer
- [x] **Fase 2 — Telas e modos de box:** EMOM, AMRAP (contador de rounds), For Time (time cap e Terminei); edição, ajustes, página de cores, treinos salvos e histórico
- [x] **Fase 3 — Recursos do celular:** sons próprios (5 estilos + 3-2-1, tique-taque, volta, fim), voz guia em inglês ou português com escolha de voz, vibração, tela acesa, lanterna e ducking opcional
- [ ] **Fase 4 — Segundo plano:** timer com a tela bloqueada + notificação da fase atual (build de desenvolvimento)
- [ ] **Fase 5 — Publicação:** ícone final, capturas, política de privacidade, TestFlight / teste interno
