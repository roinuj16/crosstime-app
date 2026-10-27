# Instalar o CrossTimer de verdade no celular

O **Expo Go** serve para testar telas, sons e voz. Mas o **timer com a tela bloqueada**
(fase 4) precisa do app instalado como app próprio: um *build de desenvolvimento*.
Ele funciona como o Expo Go, só que com as configurações do CrossTimer
(áudio em segundo plano, notificações, lanterna).

Você faz isso **uma vez**. Depois, as mudanças de código chegam pelo `npx expo start`,
igual ao Expo Go. Só é preciso gerar outro build quando entrar um módulo nativo novo.

## Antes de tudo (uma vez)

```bash
npx eas-cli@latest login          # crie a conta grátis em expo.dev se ainda não tiver
npx eas-cli@latest init           # liga este projeto à sua conta
```

## Android (grátis)

```bash
npx eas-cli@latest build --profile development --platform android
```

1. O build roda na nuvem da Expo (~10–20 min). No fim aparece um link e um QR code.
2. Abra o link no celular Android e instale o APK. O Android pede para permitir
   "instalar apps desta fonte": permita só para essa instalação.
3. No Mac: `npx expo start --dev-client` e abra o CrossTimer no celular. Ele encontra o servidor
   na mesma rede Wi-Fi.

## iPhone: duas opções

### Opção A — grátis, pelo Mac (validade de 7 dias)

Precisa do **Xcode** instalado (App Store do Mac) e do iPhone ligado no Mac por cabo.

```bash
npx expo run:ios --device
```

O Xcode assina o app com seu Apple ID gratuito. No iPhone, autorize o desenvolvedor em
*Ajustes → Geral → VPN e Gerenciamento de Dispositivo*. Com Apple ID gratuito o app
**expira em 7 dias**: aí é só rodar o comando de novo.

### Opção B — Apple Developer Program (US$ 99/ano), sem cabo

```bash
npx eas-cli@latest device:create                                   # registra o seu iPhone
npx eas-cli@latest build --profile development --platform ios
```

Abra no iPhone o link que aparece no fim do build e instale. Depois,
`npx expo start --dev-client`. Essa conta também é a necessária para o TestFlight e a App Store (fase 5).

## Como testar a fase 4

1. Abra o CrossTimer (build de desenvolvimento), toque em **Iniciar** num Tabata.
   Na primeira vez, o app pede permissão de **notificações**: permita.
2. **Bloqueie a tela.** Deve continuar tocando bipes, 3-2-1 e voz.
   - iPhone: um áudio silencioso mantém o app vivo; as notificações chegam sem som (para não duplicar).
   - Android: as notificações tocam o bipe a cada troca de fase.
3. Com música tocando em outro app (Spotify, YouTube), ela deve continuar normal.
4. Volte para o app: os avisos pendentes somem e o timer está no ponto certo.
5. Teste extremo: feche o app à força no meio do treino. As notificações de troca de fase
   continuam chegando, e ao reabrir o treino continua de onde está.

Se algo não se comportar assim, anote o celular, a versão do sistema e o que aconteceu.

## Limitações conhecidas

- **iPhone:** se outro app tomar o áudio só para ele (uma ligação, por exemplo), o sistema pode
  congelar o CrossTimer. As notificações continuam chegando, mas sem som e sem voz até você voltar ao app.
- **Android:** alguns fabricantes (Xiaomi, Samsung com economia de bateria agressiva) atrasam
  notificações. Se acontecer, tire o CrossTimer da otimização de bateria nas configurações do sistema.
- **Lanterna:** só pisca com o app aberto (o sistema exige a câmera ativa).
