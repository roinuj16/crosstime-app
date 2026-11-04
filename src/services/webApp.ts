/** Informações da versão web: se está instalada na tela de início e em qual sistema. */
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

/** Aberto pela tela de início (web app instalado), em tela cheia. */
export function isInstalled(): boolean {
  if (!isWeb || typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function isIOSBrowser(): boolean {
  if (!isWeb || typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Tela cheia (precisa vir de um toque ou tecla). Em TVs e celulares sem suporte, ignora. */
export function enterFullscreen() {
  if (!isWeb || typeof document === 'undefined') return;
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  try {
    if (!document.fullscreenElement) (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch?.(() => {});
  } catch { /* navegador sem tela cheia */ }
}

/**
 * Mantém a tela acesa enquanto a página estiver aberta (Wake Lock do navegador).
 * O navegador solta a trava quando a página some (outra aba, TV em espera), então
 * pedimos de novo ao voltar. Devolve a função que solta a trava.
 */
export function keepScreenOn(): () => void {
  if (!isWeb || typeof navigator === 'undefined') return () => {};
  type Sentinel = { release: () => Promise<void> };
  const api = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<Sentinel> } }).wakeLock;
  if (!api) return () => {};
  let lock: Sentinel | null = null;
  let stopped = false;
  const request = () => { if (!stopped && document.visibilityState === 'visible') api.request('screen').then((l) => { lock = l; }).catch(() => {}); };
  request();
  document.addEventListener('visibilitychange', request);
  return () => { stopped = true; document.removeEventListener('visibilitychange', request); lock?.release().catch(() => {}); };
}

/** Esconde a setinha do mouse depois de alguns segundos parada (TV com notebook no HDMI). */
export function autoHideCursor(ms = 2500): () => void {
  if (!isWeb || typeof document === 'undefined') return () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  const show = () => {
    document.body.style.cursor = '';
    clearTimeout(timer);
    timer = setTimeout(() => { document.body.style.cursor = 'none'; }, ms);
  };
  show();
  window.addEventListener('mousemove', show);
  return () => { clearTimeout(timer); window.removeEventListener('mousemove', show); document.body.style.cursor = ''; };
}
