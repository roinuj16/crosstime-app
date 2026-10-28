/**
 * Treino em segundo plano.
 *
 * 1. Manter vivo: um áudio silencioso em loop enquanto o treino roda. Com o modo de
 *    áudio em segundo plano, o iPhone não congela o app, e o timer continua tocando
 *    bipes e voz com a tela bloqueada.
 * 2. Rede de segurança: ao sair da tela, cada troca de fase futura vira uma
 *    notificação agendada. Se o sistema congelar ou fechar o app, o aviso chega mesmo assim.
 */
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Alert } from '@/core/alerts';

const CHANNEL = 'workout';
let silent: AudioPlayer | null = null;
let ready = false;

/** Com o app aberto, o próprio app já bipa e fala: a notificação não aparece. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: false, shouldPlaySound: false, shouldSetBadge: false }),
});

async function setup() {
  if (ready) return;
  ready = true;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Treino',
      description: 'Avisos de troca de fase com o app em segundo plano',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'phase_beep.wav',
      vibrationPattern: [0, 250, 120, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    }).catch(() => {});
  }
}

/** Pede permissão de notificação uma vez (na primeira vez que um treino começa). */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    await setup();
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    const res = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
    return res.granted;
  } catch {
    return false;
  }
}

/**
 * Agenda os avisos. No iPhone, com o app mantido vivo pelo áudio, os bipes e a voz
 * já tocam: a notificação vem sem som para não duplicar. No Android, vem com som.
 */
export async function scheduleAlerts(alerts: Alert[]) {
  try {
    await setup();
    await Notifications.cancelAllScheduledNotificationsAsync();
    const withSound = Platform.OS === 'android';
    for (const a of alerts) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: a.title,
          body: a.body,
          sound: withSound ? (a.kind === 'done' ? 'done.wav' : 'phase_beep.wav') : false,
          data: { crosstimer: true },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: a.at, channelId: CHANNEL },
      });
    }
  } catch { /* sem permissão ou web: segue sem avisos */ }
}

export async function cancelAlerts() {
  try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch { /* nada agendado */ }
  try { await Notifications.dismissAllNotificationsAsync(); } catch { /* nada na central */ }
}

export function startKeepAlive() {
  if (Platform.OS === 'web') return;
  try {
    if (!silent) {
      silent = createAudioPlayer(require('../../assets/sounds/silence.wav'));
      silent.loop = true;
    }
    silent.play();
  } catch { /* áudio indisponível */ }
}

export function stopKeepAlive() {
  try { silent?.pause(); } catch { /* já parado */ }
}
