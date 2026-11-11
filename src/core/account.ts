/**
 * Conta do CronoBox: cadastro (perfil) e os dados guardados na conta.
 * Só cálculo, sem Firebase, para poder testar. Quem fala com o Firebase é services/account.web.ts.
 */
import type { ModeConfigs } from './engine';

export type Role = 'aluno' | 'coach';

/** Cadastro. O e-mail vem do login (já confirmado pelo link). */
export interface Profile {
  name: string;
  email: string;
  /** só números, com DDD ('' = não informou) */
  phone: string;
  /** pode chamar no WhatsApp (só vale com telefone) */
  whatsapp: boolean;
  role: Role;
  /** box onde treina; obrigatório para coach */
  box: string;
  city: string;
  /** quer receber novidades e o aviso de lançamento */
  marketing: boolean;
  lang: 'pt' | 'en';
}

export const LIMITS = { name: 60, box: 60, city: 60, phone: 13, message: 2000 } as const;

export type ProfileField = 'name' | 'phone' | 'box';
export type ProfileErrors = Partial<Record<ProfileField, 'required' | 'invalid'>>;

/** Telefone: só os números. "(85) 99999-1234" → "85999991234". */
export const phoneDigits = (s: string) => s.replace(/\D/g, '').slice(0, LIMITS.phone);

/** Mostra o telefone como a pessoa está acostumada: (85) 99999-1234. */
export function formatPhone(digits: string): string {
  const d = phoneDigits(digits);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return `+${d.slice(0, d.length - 11)} (${d.slice(-11, -9)}) ${d.slice(-9, -4)}-${d.slice(-4)}`; // com código do país
}

/** O que falta ou está errado no cadastro (vazio = pode salvar). */
export function profileErrors(p: Pick<Profile, 'name' | 'phone' | 'role' | 'box'>): ProfileErrors {
  const e: ProfileErrors = {};
  if (p.name.trim().length < 2) e.name = 'required';
  const d = phoneDigits(p.phone);
  if (d && (d.length < 10 || d.length > 13)) e.phone = 'invalid';
  if (p.role === 'coach' && !p.box.trim()) e.box = 'required';
  return e;
}

/** Cadastro pronto para salvar: sem espaços sobrando, telefone só com números. */
export function cleanProfile(p: Profile): Profile {
  const phone = phoneDigits(p.phone);
  return {
    name: p.name.trim().slice(0, LIMITS.name),
    email: p.email.trim().toLowerCase(),
    phone,
    whatsapp: !!phone && p.whatsapp,
    role: p.role,
    box: p.box.trim().slice(0, LIMITS.box),
    city: p.city.trim().slice(0, LIMITS.city),
    marketing: p.marketing,
    lang: p.lang,
  };
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

/** Primeiro nome, para o nome do coach na TV ("Ana Paula Souza" → "Ana"). */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';

// ---------------------------------------------------------------------------------------------
// Dados guardados na conta: treinos salvos, tempos, WOD, dados do coach para a TV e preferências.
// Ficam fora: o que é deste aparelho (código da TV, conexão, consentimento do Analytics…).
// ---------------------------------------------------------------------------------------------

/** Ajustes que são do aparelho, não da pessoa. */
export const DEVICE_ONLY = ['tvRoomCode', 'pairedCode', 'analyticsConsent', 'feedbackPromptAt', 'tvEventId'] as const;

export interface AccountState<S, W extends { id: string }, C> {
  configs: ModeConfigs;
  colors: C;
  settings: S;
  saved: W[];
}

export interface AccountData<S = Record<string, unknown>, W extends { id: string } = { id: string }, C = unknown> {
  v: 1;
  configs: ModeConfigs;
  colors: C;
  settings: Partial<S>;
  saved: W[];
  /** quando mudou (relógio do aparelho que mudou) e qual aparelho mudou */
  updatedAt: number;
  device: string;
}

function personal<S extends object>(settings: S): Partial<S> {
  const out = { ...settings } as Record<string, unknown>;
  for (const k of DEVICE_ONLY) delete out[k];
  return out as Partial<S>;
}

/** O que vai para a conta. */
export function accountData<S extends object, W extends { id: string }, C>(st: AccountState<S, W, C>, updatedAt: number, device: string): AccountData<S, W, C> {
  return { v: 1, configs: st.configs, colors: st.colors, settings: personal(st.settings), saved: st.saved, updatedAt, device };
}

/** Para comparar: o conteúdo, sem a hora e o aparelho. */
export const accountKey = <S extends object, W extends { id: string }, C>(st: AccountState<S, W, C>) =>
  JSON.stringify(sortKeys({ configs: st.configs, colors: st.colors, settings: personal(st.settings), saved: st.saved }));

function sortKeys(x: unknown): unknown {
  if (Array.isArray(x)) return x.map(sortKeys);
  if (x && typeof x === 'object') {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(x).sort()) o[k] = sortKeys((x as Record<string, unknown>)[k]);
    return o;
  }
  return x;
}

/**
 * Primeira vez que este aparelho entra na conta.
 * - Treinos salvos: os dos dois lados (sem repetir).
 * - O resto (tempos, WOD, cores, preferências): vale o que mudou por último —
 *   o da conta, a não ser que este aparelho tenha mudado algo depois.
 * - Ajustes do aparelho ficam como estão.
 */
export function firstMerge<S extends object, W extends { id: string }, C>(
  local: AccountState<S, W, C>, localChangedAt: number, remote: AccountData<S, W, C> | null,
): AccountState<S, W, C> {
  if (!remote) return local;
  const ids = new Set(remote.saved.map((w) => w.id));
  const saved = [...remote.saved, ...local.saved.filter((w) => !ids.has(w.id))];
  if (localChangedAt > remote.updatedAt) return { ...local, saved };
  return {
    configs: { ...local.configs, ...remote.configs },
    colors: remote.colors ?? local.colors,
    settings: { ...local.settings, ...remote.settings, ...pick(local.settings, DEVICE_ONLY) },
    saved,
  };
}

/** Mudança feita em outro aparelho, com este já sincronizado: a conta vale inteira (inclusive treinos apagados). */
export function applyRemote<S extends object, W extends { id: string }, C>(local: AccountState<S, W, C>, remote: AccountData<S, W, C>): AccountState<S, W, C> {
  return {
    configs: { ...local.configs, ...remote.configs },
    colors: remote.colors ?? local.colors,
    settings: { ...local.settings, ...remote.settings, ...pick(local.settings, DEVICE_ONLY) },
    saved: remote.saved ?? [],
  };
}

function pick<S extends object>(s: S, keys: readonly string[]): Partial<S> {
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in s) out[k] = (s as Record<string, unknown>)[k];
  return out as Partial<S>;
}

// ---------------------------------------------------------------------------------------------
// Avaliação e sugestões
// ---------------------------------------------------------------------------------------------

export type FeedbackType = 'suggestion' | 'problem' | 'praise';

/** Pode enviar: tem nota ou texto, e o texto cabe. */
export const feedbackReady = (rating: number | null, message: string) =>
  (rating != null || message.trim().length > 0) && message.length <= LIMITS.message;

/** Convite "Como foi?" depois de terminar um treino: no máximo uma vez por semana. */
export const WEEK = 7 * 24 * 3600 * 1000;
export const shouldPromptFeedback = (lastPromptAt: number, now: number) => now - lastPromptAt >= WEEK;

/** Código de 2 dígitos que aparece no app que espera e na página do link, para conferir que é o mesmo pedido. */
export const matchCode = (rid: string) => String([...rid].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 90, 7) + 10);
