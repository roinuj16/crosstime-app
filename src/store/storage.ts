import Storage from 'expo-sqlite/kv-store';

/**
 * Persistência local simples (chave-valor sobre SQLite).
 * Leitura síncrona na inicialização, para a tela já abrir com os dados do usuário;
 * escrita adiada (debounce) para não gravar a cada décimo de segundo.
 */
const KEY = 'crosstimer.state.v1';

export function loadJSON<T>(): T | null {
  try {
    const raw = Storage.getItemSync(KEY);
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
    Storage.setItem(KEY, JSON.stringify(value)).catch(() => {
      /* falha de gravação não deve derrubar o timer */
    });
  }, delayMs);
}
