/**
 * Treinos especiais (por enquanto só o Murph): evento do box, inscrição e progresso ao vivo.
 * Só tipos e contas, sem Firebase.
 */
import type { MurphPlan, MurphState } from './murph';

export type EventStatus = 'open' | 'live' | 'done';

export interface MurphEvent {
  id: string;
  boxId: string;
  boxName: string;
  title: string;
  kind: 'murph';
  /** data e hora marcadas (ms) */
  date: number;
  timeCapMin: number;
  capacity: number;
  /** inscritos */
  count: number;
  /** o coach permite quebras */
  partition: boolean;
  /** dá para marcar "com colete" */
  vest: boolean;
  status: EventStatus;
  /** quando o relógio começa (ms, relógio do aparelho do coach); null = ainda não começou */
  startAt: number | null;
  createdBy: string;
  coachName: string;
}

export interface EventEntry { uid: string; name: string; vest: boolean; plan: MurphPlan }

export interface EventProgress extends MurphState { uid: string; name: string; vest: boolean }

export const EVENT_LIMITS = { capacityMax: 200, capMin: 10, capMax: 180 } as const;

/** Como o nome aparece na TV e no ranking: "Edson Silva Souza" → "Edson S." */
export function displayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export const spotsLeft = (e: Pick<MurphEvent, 'capacity' | 'count'>) => Math.max(0, e.capacity - e.count);

/** Inscrição aberta e com vaga. */
export const canRegister = (e: Pick<MurphEvent, 'status' | 'capacity' | 'count'>) => e.status === 'open' && spotsLeft(e) > 0;

/** O tempo limite estourou? (o aluno que não terminou fica com o que fez) */
export const capped = (e: Pick<MurphEvent, 'timeCapMin'>, clockMs: number) => clockMs >= e.timeCapMin * 60_000;

/** Contagem regressiva antes do start (segundos), ou 0. */
export const countdown = (clockMs: number | null) => (clockMs != null && clockMs < 0 ? Math.ceil(-clockMs / 1000) : 0);

/** "sáb., 22 de nov. · 07:00" no idioma do app. */
export function formatEventDate(ms: number, lang: 'pt' | 'en'): string {
  const d = new Date(ms);
  const day = d.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
}

/** Data e hora digitadas ("22/11/2026", "07:00") → ms; null se inválida. */
export function parseDateTime(date: string, time: string): number | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date.trim());
  const t = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m || !t) return null;
  const [d, mo, y, h, mi] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(t[1]), Number(t[2])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const dt = new Date(y, mo - 1, d, h, mi);
  return dt.getMonth() === mo - 1 ? dt.getTime() : null;
}

/** Máscara enquanto digita: "22112026" → "22/11/2026". */
export function maskDate(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join('/');
}

/** Máscara enquanto digita: "0700" → "07:00". */
export function maskTime(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
}

/** Data de hoje como "dd/mm/aaaa". */
export function todayText(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(now.getDate())}/${p(now.getMonth() + 1)}/${now.getFullYear()}`;
}
