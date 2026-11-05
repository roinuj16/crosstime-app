/**
 * O laço da sincronização, sem React: envia o que muda aqui e aplica o que chega da sala.
 * Separado do hook para poder testar duas "telas" conversando (veja __tests__/sync-loop-test.ts).
 */
import { applyBrand, applyTimer, brandKey, brandSnapshot, mergeBrand, timerKey, timerSnapshot, type BrandSnapshot, type SyncSource, type TimerSnapshot } from '@/core/sync';
import type { RemoteRole, Room, RoomHandlers } from './remote';

export interface SyncStore {
  getState: () => unknown;
  setState: (patch: object) => void;
  subscribe: (fn: () => void) => () => void;
}
export type OpenRoom = (code: string, role: RemoteRole, h: RoomHandlers) => Promise<Room>;

const strip = <T extends object>(snap: T): T => {
  const { by: _b, sentAt: _s, ...rest } = snap as T & { by?: string; sentAt?: number };
  return rest as T;
};

/**
 * `langOf`: resolve o idioma escolhido ('auto' → idioma do aparelho). O celular manda o idioma
 * dele e a TV passa a mostrar os textos no mesmo idioma.
 */
export function startSync(
  store: SyncStore, open: OpenRoom, role: RemoteRole, code: string, onError?: (e: unknown) => void, debounceMs = 80,
  langOf: (setting: 'auto' | 'pt' | 'en' | undefined) => 'pt' | 'en' | undefined = (x) => (x === 'pt' || x === 'en' ? x : undefined),
): () => void {
  const brandOf = (st: SyncSource) => brandSnapshot(st, langOf(st.settings.language));
  let room: Room | null = null;
  let closed = false;
  let lastTimer = '', lastBrand = '';
  let queued: ReturnType<typeof setTimeout> | undefined;
  let queuedBrand: ReturnType<typeof setTimeout> | undefined;
  const source = () => store.getState() as SyncSource;

  const publishTimer = () => {
    if (!room) return;
    const t = timerSnapshot(source(), room.offset());
    const tk = timerKey(t);
    if (tk !== lastTimer) { lastTimer = tk; room.publishTimer(t); }
  };
  const publishBrand = () => {
    if (!room) return;
    const b = brandOf(source());
    const bk = brandKey(b);
    if (bk !== lastBrand) { lastBrand = bk; room.publishBrand(b); }
  };
  const publish = () => { publishTimer(); publishBrand(); };

  open(code, role, {
    onTimer: (snap) => {
      if (!room) return;
      const t = strip(snap) as TimerSnapshot;
      const patch = applyTimer(t, room.offset());
      lastTimer = timerKey(timerSnapshot({ ...source(), ...patch } as SyncSource, room.offset()));
      store.setState(patch);
    },
    onBrand: (snap) => {
      const b = strip(snap) as BrandSnapshot;
      const st = source();
      const next = applyBrand(b, st, role === 'tv');
      // a chave sai do estado que vai ficar aqui (não do que veio), para não devolver o mesmo para a sala
      lastBrand = brandKey(brandOf({ ...st, ...next } as SyncSource));
      store.setState(next);
    },
  }).then((r) => {
    if (closed) { r.close(); return; }
    room = r;
    // o coach chega mandando o que tem no celular (a marca junta com a que a TV já tem);
    // a TV só manda o que mudar depois
    if (role === 'coach') {
      const st = source();
      const merged = mergeBrand(brandOf(st), r.initialBrand ? strip(r.initialBrand) as BrandSnapshot : null);
      if (brandKey(merged) !== brandKey(brandOf(st))) store.setState(applyBrand(merged, st));
      publish();
    }
    else { lastTimer = timerKey(timerSnapshot(source(), r.offset())); lastBrand = brandKey(brandOf(source())); }
  }).catch((e) => { if (!closed) onError?.(e); });

  // junta mudanças seguidas (ex.: segurar o +). A marca leva o logo, então espera a pessoa
  // parar de digitar o nome ou o WOD antes de enviar, em vez de mandar o logo a cada letra.
  const unsub = store.subscribe(() => {
    clearTimeout(queued);
    queued = setTimeout(publishTimer, debounceMs);
    clearTimeout(queuedBrand);
    queuedBrand = setTimeout(publishBrand, debounceMs * 5);
  });
  return () => { closed = true; unsub(); clearTimeout(queued); clearTimeout(queuedBrand); room?.close(); };
}
