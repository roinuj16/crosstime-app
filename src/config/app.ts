import { Platform } from 'react-native';

/**
 * Endereço do web app publicado (npm run deploy:web). É para onde a TV vai:
 * <endereço>/tv. Na web usamos o próprio endereço da página; no app instalado,
 * este aqui. Se o EAS publicar em outro endereço, troque só esta linha.
 */
export const WEB_URL = 'https://cronobox.expo.app';

/** Endereço base do web app, sem barra no fim. */
export function webBase(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && /^https?:/.test(window.location.origin)) return window.location.origin;
  return WEB_URL;
}

/** Link completo da tela da TV. */
export const tvUrl = () => `${webBase()}/tv`;

/** Como mostrar o endereço da TV para alguém digitar no controle remoto: sem "https://" e sem "www.". */
export const tvAddress = () => tvUrl().replace(/^https?:\/\/(www\.)?/, '');
