/**
 * O laço da sincronização, sem React: envia o que muda aqui e aplica o que chega da sala.
 * Separado do hook para poder testar duas "telas" conversando (veja __tests__/sync-loop-test.ts).
 */
import { applyTimer, brandKey, brandSnapshot, timerKey, timerSnapshot, type BrandSnapshot, type SyncSource, type TimerSnapshot } from '@/core/sync';
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

export function startSync(store: SyncStore, open: OpenRoom, role: RemoteRole, code: string, onError?: (e: unknown) => void, debounceMs = 80): () => void {
  let room: Room | null = null;
  let closed = false;
  let lastTimer = '', lastBrand = '';
  let queued: ReturnType<typeof setTimeout> | undefined;
  const source = () => store.getState() as SyncSource;

  const publish = () => {
    if (!room) return;
    const t = timerSnapshot(source(), room.offset());
    const tk = timerKey(t);
    if (tk !== lastTimer) { lastTimer = tk; room.publishTimer(t); }
    const b = brandSnapshot(source());
    const bk = brandKey(b);
    if (bk !== lastBrand) { lastBrand = bk; room.publishBrand(b); }
  };

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
      lastBrand = brandKey(b);
      const st = source();
      store.setState({
        colors: b.colors ?? st.colors,
        settings: { ...st.settings, tvBoxName: b.boxName ?? '', tvLogo: b.logo ?? '', tvWod: b.wod ?? '', timeFormat: b.timeFormat ?? st.settings.timeFormat },
      });
    },
  }).then((r) => {
    if (closed) { r.close(); return; }
    room = r;
    // o coach chega mandando o que tem no celular; a TV só manda o que mudar depois
    if (role === 'coach') publish();
    else { lastTimer = timerKey(timerSnapshot(source(), r.offset())); lastBrand = brandKey(brandSnapshot(source())); }
  }).catch((e) => { if (!closed) onError?.(e); });

  const unsub = store.subscribe(() => {
    clearTimeout(queued);
    queued = setTimeout(publish, debounceMs); // junta mudanças seguidas (ex.: segurar o +)
  });
  return () => { closed = true; unsub(); clearTimeout(queued); room?.close(); };
}
