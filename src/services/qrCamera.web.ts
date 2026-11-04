/**
 * Leitor de QR code no navegador, sem nada baixado de fora:
 * - abre a câmera de trás (getUserMedia) num <video> dentro de `host`;
 * - a cada 200 ms procura um QR: com o BarcodeDetector do navegador quando existe
 *   (Chrome no Android) ou com o jsQR (Safari no iPhone e o resto).
 * `onCode` devolve true quando o código serve; aí a câmera desliga.
 */
import jsQR from 'jsqr';

export type QrCameraError = 'denied' | 'nocamera' | 'failed';

type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type DetectorClass = { new (o: { formats: string[] }): Detector; getSupportedFormats?: () => Promise<string[]> };

async function nativeDetector(): Promise<Detector | null> {
  const D = (globalThis as unknown as { BarcodeDetector?: DetectorClass }).BarcodeDetector;
  if (!D) return null;
  try {
    const formats = (await D.getSupportedFormats?.()) ?? ['qr_code'];
    return formats.includes('qr_code') ? new D({ formats: ['qr_code'] }) : null;
  } catch { return null; }
}

const MAX_SIDE = 720; // imagem analisada (px): QR da TV a 1–3 m cabe bem e o celular não esquenta

export function startQrCamera(host: HTMLElement, onCode: (text: string) => boolean, onError: (e: QrCameraError) => void): () => void {
  let stopped = false;
  let stream: MediaStream | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const video = document.createElement('video');
  video.setAttribute('playsinline', ''); // iPhone: sem isso o vídeo abre em tela cheia do sistema
  video.setAttribute('muted', '');
  video.muted = true;
  video.autoplay = true;
  Object.assign(video.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', background: '#000' });
  host.appendChild(video);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const stop = () => {
    stopped = true;
    clearTimeout(timer);
    stream?.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
    video.remove();
  };

  const scanWithJsQr = (): string | null => {
    const w = video.videoWidth, h = video.videoHeight;
    if (!ctx || !w || !h) return null;
    const k = Math.min(1, MAX_SIDE / Math.max(w, h));
    canvas.width = Math.round(w * k); canvas.height = Math.round(h * k);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' })?.data ?? null;
  };

  (async () => {
    if (!navigator.mediaDevices?.getUserMedia) { onError('nocamera'); return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
    } catch (e) {
      const name = (e as Error)?.name;
      onError(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : name === 'NotFoundError' || name === 'OverconstrainedError' ? 'nocamera' : 'failed');
      return;
    }
    if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
    video.srcObject = stream;
    try { await video.play(); } catch { /* autoplay mudo costuma passar; se não, o próximo frame tenta */ }

    const detector = await nativeDetector();
    const tick = async () => {
      if (stopped) return;
      let text: string | null = null;
      if (video.readyState >= 2) {
        try {
          text = detector ? (await detector.detect(video))[0]?.rawValue ?? null : scanWithJsQr();
        } catch { text = scanWithJsQr(); }
      }
      if (stopped) return;
      if (text && onCode(text)) { stop(); return; }
      timer = setTimeout(tick, 200);
    };
    tick();
  })();

  return stop;
}
