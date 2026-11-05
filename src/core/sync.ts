/**
 * Pareamento TV ↔ celular do coach: o que vai e volta pela sala (sem Firebase aqui; testado).
 *
 * A sala tem duas partes, enviadas separadamente para não reenviar o logo a cada play:
 *  - timer: modo, treino escolhido, configurações, treinos salvos e a sessão (play/pausa);
 *  - brand: nome do box, logo, WOD de cada modo, nome do coach, cores e formato do tempo.
 *
 * O motor conta o tempo a partir de horários ("começou às 10:02:15"), então basta mandar a
 * sessão: cada tela calcula o próprio relógio. Os horários viajam no relógio do servidor
 * (horário local + offset) para não importar se o relógio da TV está alguns segundos errado.
 */
import type { AnyConfig, Mode, ModeConfigs, TimeFormat } from './engine';
import type { ColorScheme } from '@/theme/palette';
import { compactWods, WOD_MODES, type Wods } from './wod';

export interface SyncSession {
  mode: Mode; name: string | null; config: AnyConfig; startedAt: number; rounds: number;
  state: { status: 'idle' | 'running' | 'paused' | 'done'; elapsedBase: number; runningSince: number | null };
}
export interface SyncWorkout { id: string; name: string; mode: Mode; config: AnyConfig; example?: boolean; wod?: string }

export interface TimerSnapshot { v: 1; mode: Mode; activeName: string | null; configs: ModeConfigs; saved: SyncWorkout[]; session: SyncSession | null }
export interface BrandSnapshot { v: 1; boxName: string; logo: string; wods: Wods; coach: string; colors: ColorScheme; timeFormat: TimeFormat }

/** O pedaço do estado do app que participa da sincronização. */
export interface SyncSource {
  mode: Mode; activeName: string | null; configs: ModeConfigs; saved: SyncWorkout[]; session: SyncSession | null;
  colors: ColorScheme; settings: { tvBoxName: string; tvLogo: string; tvWods: Wods; tvCoachName: string; timeFormat: TimeFormat };
}

const shift = (t: number | null, d: number) => (t == null ? null : Math.round(t + d));

/** Copia limpa para o Firebase (sem `undefined`, que ele recusa). */
const clean = <T>(x: T): T => JSON.parse(JSON.stringify(x));

export function timerSnapshot(s: SyncSource, offset: number): TimerSnapshot {
  const session = s.session && {
    ...s.session,
    startedAt: shift(s.session.startedAt, offset) as number,
    state: { ...s.session.state, runningSince: shift(s.session.state.runningSince, offset) },
  };
  return clean({ v: 1, mode: s.mode, activeName: s.activeName ?? null, configs: s.configs, saved: s.saved, session: session ?? null });
}

export function brandSnapshot(s: SyncSource): BrandSnapshot {
  return clean({ v: 1, boxName: s.settings.tvBoxName, logo: s.settings.tvLogo, wods: compactWods(s.settings.tvWods), coach: s.settings.tvCoachName ?? '', colors: s.colors, timeFormat: s.settings.timeFormat });
}

/** O que muda no app ao receber a marca da sala (nome do box, logo, WOD, coach, cores). */
export function applyBrand(b: Partial<BrandSnapshot>, s: SyncSource): Pick<SyncSource, 'colors' | 'settings'> {
  return {
    colors: b.colors ?? s.colors,
    settings: {
      ...s.settings, tvBoxName: b.boxName ?? '', tvLogo: b.logo ?? '', tvWods: compactWods(b.wods), tvCoachName: b.coach ?? '',
      timeFormat: b.timeFormat ?? s.settings.timeFormat,
    },
  };
}

/**
 * Quando o coach entra numa sala que já tem marca (ex.: o WOD foi escrito na própria TV):
 * o que o celular tem preenchido vale; o que está vazio no celular fica como estava na TV.
 * Assim conectar não apaga o WOD, o nome do box nem o logo da TV.
 */
export function mergeBrand(mine: BrandSnapshot, room: Partial<BrandSnapshot> | null): BrandSnapshot {
  if (!room) return mine;
  const pick = (a: string, b: string | undefined) => (a.trim() ? a : b ?? '');
  const wods: Wods = {};
  for (const m of WOD_MODES) { const w = pick(mine.wods?.[m] ?? '', room.wods?.[m]); if (w) wods[m] = w; }
  return { ...mine, boxName: pick(mine.boxName, room.boxName), logo: pick(mine.logo, room.logo), wods, coach: pick(mine.coach, room.coach) };
}

/** O coach dá sinal de vida a cada HEARTBEAT_MS; a TV o considera fora depois de COACH_STALE_MS sem sinal. */
export const HEARTBEAT_MS = 20_000;
export const COACH_STALE_MS = 50_000;
/** `at` do coach (relógio do servidor) ainda é recente? */
export const coachAlive = (at: number | null | undefined, serverNow: number) => typeof at === 'number' && serverNow - at < COACH_STALE_MS;

/** O que muda no app ao receber o timer da sala. O Firebase some com nulos e listas vazias: aqui voltam. */
export function applyTimer(snap: TimerSnapshot, offset: number): Pick<SyncSource, 'mode' | 'activeName' | 'configs' | 'saved' | 'session'> {
  const s = snap.session ?? null;
  return {
    mode: snap.mode,
    activeName: snap.activeName ?? null,
    configs: snap.configs,
    saved: Array.isArray(snap.saved) ? snap.saved : Object.values(snap.saved ?? {}),
    session: s && {
      ...s, name: s.name ?? null, rounds: s.rounds ?? 0,
      startedAt: shift(s.startedAt, -offset) as number,
      state: { status: s.state.status, elapsedBase: s.state.elapsedBase ?? 0, runningSince: shift(s.state.runningSince ?? null, -offset) },
    },
  };
}

/**
 * JSON com as chaves em ordem alfabética, sem nulos e sem listas vazias — igual ao que o
 * Firebase devolve. Assim o que saiu daqui e o que voltou da sala dão a mesma chave,
 * mesmo com as chaves em outra ordem (senão as duas telas ficam reenviando uma para a outra).
 */
export function stableKey(x: unknown): string {
  const norm = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.length ? v.map(norm) : undefined;
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(v).sort()) { const n = norm((v as Record<string, unknown>)[k]); if (n != null) out[k] = n; }
      return Object.keys(out).length ? out : undefined;
    }
    return v ?? undefined;
  };
  return JSON.stringify(norm(x) ?? null);
}

/**
 * Chave para comparar dois snapshots do timer ignorando diferenças de poucos ms nos horários
 * (o offset do servidor oscila um pouco). Evita que as duas telas fiquem reenviando a mesma coisa.
 */
export function timerKey(snap: TimerSnapshot): string {
  const r = (t: number | null | undefined) => (t == null ? null : Math.round(t / 250));
  const s = snap.session;
  return stableKey({ ...snap, saved: snap.saved ?? [], session: s ? { ...s, startedAt: r(s.startedAt), state: { ...s.state, runningSince: r(s.state.runningSince) } } : null });
}

export const brandKey = (b: BrandSnapshot) => stableKey(b);

// ---------- código da sala ----------

/** Sem I, O, 0 e 1 (fáceis de confundir na TV). */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newRoomCode(random: () => number = Math.random): string {
  let c = '';
  for (let i = 0; i < 6; i++) c += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return c;
}

/** "k7q 4m2" → "K7Q4M2"; null se não for um código válido. */
export function parseRoomCode(input: string): string | null {
  const c = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return c.length === 6 && [...c].every((ch) => ALPHABET.includes(ch)) ? c : null;
}

/**
 * O que veio do leitor de QR: o link da TV (…/pair?code=K7Q4M2) ou só o código.
 * Qualquer outro QR (cardápio, Wi-Fi…) devolve null.
 */
export function codeFromScan(data: string): string | null {
  const text = data.trim();
  const fromLink = /[?&]code=([^&#\s]+)/i.exec(text);
  if (fromLink) return parseRoomCode(decodeURIComponent(fromLink[1]));
  return /^[A-Za-z0-9 -]{6,9}$/.test(text) ? parseRoomCode(text) : null;
}

/** "K7Q4M2" → "K7Q-4M2" (como aparece na TV). */
export const formatRoomCode = (c: string) => `${c.slice(0, 3)}-${c.slice(3)}`;
