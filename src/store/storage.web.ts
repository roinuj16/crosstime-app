/**
 * Versão web do armazenamento: usa o localStorage do navegador.
 * (No celular vale storage.ts, com SQLite.) Útil para pré-visualizar o app no navegador.
 */
const KEY = 'crosstimer.state.v1';

export function loadJSON<T>(): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;

export function saveJSON(value: unknown, delayMs = 250): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    try { globalThis.localStorage?.setItem(KEY, JSON.stringify(value)); } catch { /* sem armazenamento */ }
  }, delayMs);
}
