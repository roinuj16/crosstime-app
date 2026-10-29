/**
 * Voz gravada: toca os áudios de assets/voice/<idioma>/ em sequência
 * (ex.: "Go!" + "Round five."). A lista vem de src/voice/clips.ts, gerada
 * pelo `npm run voices`; sem áudios, o app usa a voz do sistema.
 */
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { VOICE_CLIPS } from '@/voice/clips';

type Lang = 'en' | 'pt';

const GAP_MS = 60; // respiro entre dois áudios da mesma frase
const players = new Map<string, AudioPlayer>();
let token = 0; // cada frase nova cancela a anterior
let current: AudioPlayer | null = null;

export function hasClip(lang: Lang, id: string): boolean {
  return !!VOICE_CLIPS[lang]?.[id];
}

/** Há voz gravada para este idioma? */
export function hasRecordedVoice(lang: Lang): boolean {
  return Object.keys(VOICE_CLIPS[lang] ?? {}).length > 0;
}

function player(lang: Lang, id: string): AudioPlayer | null {
  const src = VOICE_CLIPS[lang]?.[id];
  if (!src) return null;
  const key = `${lang}/${id}`;
  let p = players.get(key);
  if (!p) { p = createAudioPlayer(src); players.set(key, p); }
  return p;
}

/** Carrega antes do treino as frases que tocam em quase todo treino. */
export function preloadClips(lang: Lang) {
  for (const id of ['prepare', 'run', 'rest', 'last', 'done', 'half', 'count_3', 'count_2', 'count_1']) player(lang, id);
}

export function stopClips() {
  token++;
  try { if (current?.playing) current.pause(); } catch { /* já parou */ }
  current = null;
}

/** Toca os áudios um depois do outro. `onStart` é chamado a cada áudio (para o ducking). */
export function playClips(lang: Lang, ids: string[], volume: number, onStart?: () => void) {
  stopClips();
  const mine = token;
  const next = (i: number) => {
    if (mine !== token || i >= ids.length) return;
    const p = player(lang, ids[i]);
    if (!p) return next(i + 1);
    let advanced = false;
    const go = () => {
      if (advanced) return;
      advanced = true;
      sub.remove();
      clearTimeout(safety);
      setTimeout(() => next(i + 1), GAP_MS);
    };
    const sub = p.addListener('playbackStatusUpdate', (st) => { if (st.didJustFinish) go(); });
    // se o aviso de "terminou" não vier, segue mesmo assim
    const safety = setTimeout(go, Math.max(400, ((p.duration || 3) + 0.4) * 1000));
    current = p;
    p.volume = volume;
    // espera o seek terminar antes do play: tocar a mesma frase de novo (o "Three!" de
    // cada round) falhava uma vez sim, outra não quando o play chegava antes do seek
    p.seekTo(0)
      .then(() => { if (mine !== token) return; p.play(); onStart?.(); })
      .catch(go);
  };
  next(0);
}
