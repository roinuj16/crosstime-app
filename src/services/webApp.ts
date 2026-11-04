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

/** Tamanho máximo do logo em texto (data URL). A sala do Firebase aceita até 200 mil; sobra folga. */
export const LOGO_MAX_CHARS = 120_000;

/**
 * Escolhe uma imagem do computador/celular e devolve em data URL, já reduzida para caber
 * na sala da TV (LOGO_MAX_CHARS). Tenta PNG (mantém o fundo transparente) em tamanhos
 * cada vez menores; se ainda ficar grande (foto), usa WebP e por fim JPEG sobre fundo escuro.
 * Só na web.
 */
export function pickImage(max = 256): Promise<string | null> {
  if (!isWeb || typeof document === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/svg+xml';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(shrinkImage(img, max));
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    };
    input.click();
  });
}

/** Reduz um logo já salvo que passou do limite (logos escolhidos antes desta versão). */
export function shrinkDataUrl(url: string, max = 256): Promise<string | null> {
  if (!isWeb || typeof Image === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(shrinkImage(img, max));
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function shrinkImage(img: HTMLImageElement, max: number): string | null {
  const w0 = img.naturalWidth || img.width || max, h0 = img.naturalHeight || img.height || max;
  const draw = (side: number, bg?: string) => {
    const k = Math.min(1, side / Math.max(w0, h0));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
    const g = c.getContext('2d');
    if (!g) return null;
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); }
    g.drawImage(img, 0, 0, c.width, c.height);
    return c;
  };
  const fits = (url: string | undefined) => !!url && url.length <= LOGO_MAX_CHARS;
  for (const side of [max, 200, 160, 128]) {
    const png = draw(side)?.toDataURL('image/png');
    if (fits(png)) return png!;
  }
  for (const side of [max, 160]) {
    const webp = draw(side)?.toDataURL('image/webp', 0.85);
    if (webp?.startsWith('data:image/webp') && fits(webp)) return webp;
  }
  for (const [side, q] of [[max, 0.85], [160, 0.8], [128, 0.7]] as const) {
    const jpg = draw(side, '#0B0B0B')?.toDataURL('image/jpeg', q);
    if (fits(jpg)) return jpg!;
  }
  return null;
}
