/**
 * Executa as deixas (sons, voz, vibração, lanterna) no aparelho.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import type { Cue, HapticKind, SoundKey } from '@/core/cues';
import { pickVoice } from './voices';

const SOURCES: Record<SoundKey, number> = {
  'phase-beep': require('../../assets/sounds/phase-beep.wav'),
  'phase-bell': require('../../assets/sounds/phase-bell.wav'),
  'phase-gong': require('../../assets/sounds/phase-gong.wav'),
  'phase-horn': require('../../assets/sounds/phase-horn.wav'),
  'phase-whistle': require('../../assets/sounds/phase-whistle.wav'),
  count: require('../../assets/sounds/count.wav'),
  'count-last': require('../../assets/sounds/count-last.wav'),
  tick: require('../../assets/sounds/tick.wav'),
  lap: require('../../assets/sounds/lap.wav'),
  done: require('../../assets/sounds/done.wav'),
};

export interface VoiceOptions { lang: 'en' | 'pt'; voiceId: string; rate: number; volume: number }

const players = new Map<SoundKey, AudioPlayer>();
const torchListeners = new Set<() => void>();
let duckOthers = false;
let ducked = false;
let unduckTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Modo de áudio: toca mesmo com o iPhone no silencioso e continua em segundo plano.
 * "Abaixar música de outros apps" liga o ducking só durante os avisos.
 */
export async function configureAudio(opts: { duckOthers: boolean }) {
  duckOthers = opts.duckOthers;
  ducked = false;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'mixWithOthers' });
  } catch { /* web ou aparelho sem suporte */ }
}

function duck() {
  if (!duckOthers) return;
  if (unduckTimer) clearTimeout(unduckTimer);
  if (!ducked) {
    ducked = true;
    setAudioModeAsync({ interruptionMode: 'duckOthers' }).catch(() => {});
  }
  unduckTimer = setTimeout(unduck, 2500);
}
function unduck() {
  unduckTimer = null;
  if (!ducked) return;
  ducked = false;
  setAudioModeAsync({ interruptionMode: 'mixWithOthers' }).catch(() => {});
}

function player(key: SoundKey): AudioPlayer {
  let p = players.get(key);
  if (!p) { p = createAudioPlayer(SOURCES[key]); players.set(key, p); }
  return p;
}

/** Carrega os sons antes do treino, para o primeiro bipe não atrasar. */
export function preloadSounds(keys: SoundKey[]) { for (const k of keys) player(k); }

export function playSound(key: SoundKey, volume: number) {
  try {
    const p = player(key);
    p.volume = volume;
    p.seekTo(0);
    p.play();
  } catch { /* som é opcional */ }
}

export async function speak(text: string, v: VoiceOptions) {
  try {
    const voice = await pickVoice(v.lang, v.voiceId);
    Speech.stop();
    Speech.speak(text, {
      language: voice?.language ?? (v.lang === 'pt' ? 'pt-BR' : 'en-US'),
      voice: voice?.identifier,
      rate: v.rate,
      volume: Math.min(1, v.volume + 0.1),
      // usa a mesma sessão de áudio do app: fala mesmo no modo silencioso e respeita o ducking
      useApplicationAudioSession: true,
      onDone: () => { if (ducked) duck(); },
    });
  } catch { /* voz é opcional */ }
}

export function haptic(kind: HapticKind) {
  const H = Haptics;
  const run = {
    phase: () => H.impactAsync(H.ImpactFeedbackStyle.Heavy),
    count: () => H.impactAsync(H.ImpactFeedbackStyle.Light),
    lap: () => H.impactAsync(H.ImpactFeedbackStyle.Medium),
    done: () => H.notificationAsync(H.NotificationFeedbackType.Success),
  }[kind];
  run().catch(() => {});
}

/** A lanterna é um componente (precisa da câmera montada); ele assina este aviso. */
export function onTorchPulse(fn: () => void) { torchListeners.add(fn); return () => { torchListeners.delete(fn); }; }

export function perform(cues: Cue[], voice: VoiceOptions) {
  if (cues.some((c) => c.kind === 'sound' || c.kind === 'speak')) duck();
  let spoke = false;
  for (const c of cues) {
    if (c.kind === 'sound') playSound(c.key, c.volume);
    else if (c.kind === 'haptic') haptic(c.style);
    else if (c.kind === 'torch') torchListeners.forEach((fn) => fn());
    else if (c.kind === 'speak' && !spoke) {
      spoke = true;
      // deixa o bipe da troca de fase soar antes da voz
      const hasPhaseSound = cues.some((x) => x.kind === 'sound' && x.key.startsWith('phase-'));
      setTimeout(() => speak(c.text, voice), hasPhaseSound ? 450 : 0);
    }
  }
}
