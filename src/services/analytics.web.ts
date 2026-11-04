/**
 * Google Analytics na web (Firebase). Só liga depois que a pessoa aceita no aviso
 * (LGPD): antes disso nenhum script do Google é carregado e nada é enviado.
 * Nunca mandamos o que a pessoa digita (nome do box, WOD, nome de treino).
 */
import { getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent, setAnalyticsCollectionEnabled, type Analytics } from 'firebase/analytics';
import { FIREBASE_CONFIG } from '@/config/firebase';

export type EventParams = Record<string, string | number | boolean>;

export const analyticsAvailable = !!FIREBASE_CONFIG?.measurementId;

let analytics: Analytics | null = null;
let enabled = false;
let starting: Promise<void> | null = null;
const queue: [string, EventParams | undefined][] = [];

export async function setAnalyticsEnabled(on: boolean): Promise<void> {
  enabled = on;
  if (!analyticsAvailable || !FIREBASE_CONFIG) return;
  if (on && !analytics) {
    starting ??= (async () => {
      if (!(await isSupported())) return;
      analytics = getAnalytics(getApps()[0] ?? initializeApp(FIREBASE_CONFIG!));
      while (queue.length) { const [n, p] = queue.shift()!; logEvent(analytics, n, p); }
    })().catch(() => { starting = null; });
    await starting;
  }
  if (analytics) setAnalyticsCollectionEnabled(analytics, on);
}

/** Registra um evento (no máximo 40 caracteres no nome; textos cortados em 100). */
export function track(name: string, params?: EventParams): void {
  if (!enabled) return;
  const p = params && Object.fromEntries(Object.entries(params).map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 100) : v]));
  if (!analytics) { if (queue.length < 50) queue.push([name, p]); return; }
  logEvent(analytics, name, p);
}
