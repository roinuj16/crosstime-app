/**
 * Enviar um link pela folha de compartilhar do aparelho (WhatsApp, e-mail, AirDrop…).
 * No navegador sem essa folha (computador), copia o link.
 */
import { Platform, Share } from 'react-native';

/** 'shared' quando abriu a folha de compartilhar, 'copied' quando copiou, 'failed' se nenhum deu certo. */
export async function shareLink(message: string, url: string): Promise<'shared' | 'copied' | 'failed'> {
  if (Platform.OS !== 'web') {
    try {
      // no iPhone o link vai em `url` (vira prévia); no Android só a mensagem é usada
      await Share.share(Platform.OS === 'ios' ? { message: message.replace(url, '').trim(), url } : { message });
      return 'shared';
    } catch { return 'failed'; }
  }
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav?.share) {
    try { await nav.share({ text: message, url }); return 'shared'; } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'shared'; // a pessoa fechou a folha
    }
  }
  try { await nav?.clipboard?.writeText(url); return 'copied'; } catch { return 'failed'; }
}

/** Se dá para abrir a câmera aqui (no navegador precisa de HTTPS e de getUserMedia). */
export function cameraAvailable(): boolean {
  if (Platform.OS !== 'web') return true;
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}
