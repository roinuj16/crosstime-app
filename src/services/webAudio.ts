/**
 * Áudio na versão web (navegador e web app instalado).
 *
 * O navegador só deixa tocar som depois de um toque da pessoa, e no iPhone cada
 * elemento <audio> precisaria do seu próprio toque. Por isso a web usa um único
 * AudioContext: liberado uma vez no primeiro toque (unlockWebAudio), ele toca
 * qualquer som ou frase depois, inclusive os que o timer dispara sozinho.
 * No celular (iOS/Android) este arquivo não é usado: lá quem toca é o expo-audio.
 */
import { Asset } from 'expo-asset';

type Source = number;

let ctx: AudioContext | null = null;
const buffers = new Map<Source, Promise<AudioBuffer | null>>();
let voiceNode: AudioBufferSourceNode | null = null;

function context(): AudioContext | null {
  if (ctx) return ctx;
  const AC = typeof window !== 'undefined' ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) : undefined;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

/** Libera o som. Precisa ser chamado dentro de um toque (ex.: o botão Iniciar). */
export function unlockWebAudio() {
  const c = context();
  if (!c) return;
  // iPhone: toca mesmo com a chave de silencioso (Safari 16.4+), como o app instalado
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';
  } catch { /* navegador sem Audio Session API */ }
  c.resume().catch(() => {});
  const silent = c.createBufferSource();
  silent.buffer = c.createBuffer(1, 1, 22050);
  silent.connect(c.destination);
  silent.start(0);
  // a voz do sistema (speechSynthesis) também precisa de um primeiro uso num toque
  try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.speak(new SpeechSynthesisUtterance('')); } catch { /* sem voz */ }
}

function load(src: Source): Promise<AudioBuffer | null> {
  let p = buffers.get(src);
  if (!p) {
    const c = context();
    p = c
      ? fetch(Asset.fromModule(src).uri).then((r) => r.arrayBuffer()).then((data) => c.decodeAudioData(data)).catch(() => null)
      : Promise.resolve(null);
    buffers.set(src, p);
  }
  return p;
}

/** Baixa e decodifica antes de precisar, para o primeiro bipe não atrasar. */
export function preloadWebAudio(srcs: Source[]) { srcs.forEach((s) => { load(s); }); }

/**
 * Toca um som. `voice`: é uma frase da voz gravada — uma frase nova corta a anterior.
 * A promessa termina quando o som acaba (para encadear "Go!" + "Round five.").
 */
export async function playWebAudio(src: Source, volume: number, voice = false): Promise<void> {
  const c = context();
  const buf = await load(src);
  if (!c || !buf) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  const gain = c.createGain();
  gain.gain.value = Math.max(0, Math.min(1, volume));
  const node = c.createBufferSource();
  node.buffer = buf;
  node.connect(gain).connect(c.destination);
  if (voice) { stopWebVoice(); voiceNode = node; }
  return new Promise((resolve) => {
    node.onended = () => { if (voiceNode === node) voiceNode = null; resolve(); };
    node.start();
  });
}

export function stopWebVoice() {
  try { voiceNode?.stop(); } catch { /* já parou */ }
  voiceNode = null;
}
