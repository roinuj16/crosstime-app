/**
 * Câmera lendo QR code na web (veja qrCamera.web.ts). No app instalado o leitor é o
 * CameraView do expo-camera, então aqui não há nada.
 */
export type QrCameraError = 'denied' | 'nocamera' | 'failed';

export function startQrCamera(_host: unknown, _onCode: (text: string) => boolean, _onError: (e: QrCameraError) => void): () => void {
  return () => {};
}
