import * as Speech from 'expo-speech';

export type VoiceInfo = Speech.Voice;

/** Vozes "de brincadeira" do iOS/macOS que não servem para guiar treino. */
const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|kathy|fred|grandma|grandpa|reed|rocko|sandy|shelley|flo|eddy/i;

/** Nota de qualidade: Premium/Enhanced/Neural soam muito melhor que as compactas. */
export function voiceScore(v: VoiceInfo, lang: 'en' | 'pt'): number {
  const n = `${v.name} ${v.identifier}`;
  let s = lang === 'en'
    ? (/^en[-_]US/i.test(v.language) ? 4 : /^en[-_](GB|AU|CA|IE)/i.test(v.language) ? 3 : 1)
    : (/^pt[-_]BR/i.test(v.language) ? 4 : 2);
  if (v.quality === Speech.VoiceQuality.Enhanced) s += 6;
  if (/premium/i.test(n)) s += 8;
  if (/enhanced|neural|natural|network/i.test(n)) s += 4;
  if (/samantha|ava|zoe|allison|evan|nathan|joelle|luciana|felipe|fernanda/i.test(n)) s += 2;
  if (/compact|espeak/i.test(n) || NOVELTY.test(n)) s -= 6;
  return s;
}

let cache: VoiceInfo[] | null = null;

export async function listVoices(lang: 'en' | 'pt'): Promise<VoiceInfo[]> {
  if (!cache) {
    // Alguns sistemas demoram (ou nunca respondem) a lista de vozes: não deixa a fala esperando.
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), 800));
    try {
      const got = await Promise.race([Speech.getAvailableVoicesAsync(), timeout]);
      if (!got) return []; // sem cache: tenta de novo na próxima fala
      cache = got;
    } catch { cache = []; }
  }
  const prefix = lang === 'pt' ? /^pt/i : /^en/i;
  return cache
    .filter((v) => prefix.test(v.language) && !NOVELTY.test(v.name))
    .sort((a, b) => voiceScore(b, lang) - voiceScore(a, lang));
}

/** Voz escolhida nos ajustes; vazio = a melhor disponível. */
export async function pickVoice(lang: 'en' | 'pt', id: string): Promise<VoiceInfo | null> {
  const list = await listVoices(lang);
  return list.find((v) => v.identifier === id) ?? list[0] ?? null;
}

export function forgetVoices() { cache = null; }
