/**
 * Treinos especiais sem Firebase, só para builds de teste (EXPO_PUBLIC_PREVIEW_HOOKS=1):
 * guarda tudo no localStorage do navegador e avisa as outras abas (celular e TV no mesmo
 * computador). Serve para ver as telas e testar o fluxo inteiro sem internet.
 * window.__cronoboxEvents dá acesso ao "banco" (para simular outros alunos contando).
 */
import type { EventEntry, EventProgress, MurphEvent } from '@/core/event';
import type { MurphPlan, MurphState } from '@/core/murph';
import { useAccount } from './account';

type Db = {
  boxes: Record<string, { id: string; name: string; city: string; coaches: string[] }>;
  events: Record<string, MurphEvent>;
  entries: Record<string, Record<string, EventEntry>>;
  progress: Record<string, Record<string, EventProgress>>;
  my: Record<string, Record<string, { id: string; title: string; date: number; boxName: string }>>;
};
const KEY = 'cronobox.mockEvents';
const empty = (): Db => ({ boxes: {}, events: {}, entries: {}, progress: {}, my: {} });
const load = (): Db => { try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return empty(); } };
const subs = new Set<() => void>();
const save = (db: Db) => { localStorage.setItem(KEY, JSON.stringify(db)); subs.forEach((f) => f()); };
if (typeof window !== 'undefined') window.addEventListener('storage', (e) => { if (e.key === KEY) subs.forEach((f) => f()); });
const watch = <T,>(read: (db: Db) => T, cb: (v: T) => void) => {
  const f = () => cb(read(load()));
  subs.add(f); setTimeout(f, 0);
  return () => { subs.delete(f); };
};
const me = () => { const u = useAccount.getState().uid; if (!u) throw new Error('sem-conta'); return u; };
const rid = () => Math.random().toString(36).slice(2, 12);
const mut = (fn: (db: Db) => void) => { const db = load(); fn(db); save(db); return Promise.resolve(); };

export const mock = {
  watchMyBoxes: (cb: (b: Db['boxes'][string][]) => void) => watch((db) => Object.values(db.boxes).filter((b) => b.coaches.includes(useAccount.getState().uid ?? '')), cb),
  createBox: (name: string, city: string) => { const id = rid(); return mut((db) => { db.boxes[id] = { id, name, city, coaches: [me()] }; }).then(() => id); },
  createEvent: (e: Omit<MurphEvent, 'id' | 'count' | 'status' | 'startAt' | 'createdBy'>) => {
    const id = rid();
    return mut((db) => { db.events[id] = { ...e, id, count: 0, status: 'open', startAt: null, createdBy: me() }; }).then(() => id);
  },
  updateEvent: (id: string, patch: Partial<MurphEvent>) => mut((db) => { Object.assign(db.events[id], patch); }),
  deleteEvent: (id: string) => mut((db) => { delete db.events[id]; }),
  startEvent: (id: string, delayMs = 10_000) => mut((db) => { Object.assign(db.events[id], { status: 'live', startAt: Date.now() + delayMs }); }),
  endEvent: (id: string) => mut((db) => { db.events[id].status = 'done'; }),
  resetEvent: (id: string) => mut((db) => { Object.assign(db.events[id], { status: 'open', startAt: null }); db.progress[id] = {}; }),
  watchBoxEvents: (boxId: string, cb: (e: MurphEvent[]) => void) => watch((db) => Object.values(db.events).filter((e) => e.boxId === boxId).sort((a, b) => b.date - a.date), cb),
  watchEvent: (id: string, cb: (e: MurphEvent | null) => void) => watch((db) => db.events[id] ?? null, cb),
  watchEntries: (id: string, cb: (e: EventEntry[]) => void) => watch((db) => Object.values(db.entries[id] ?? {}), cb),
  watchProgress: (id: string, cb: (p: EventProgress[]) => void) => watch((db) => Object.values(db.progress[id] ?? {}), cb),
  removeEntry: (id: string, who: string) => mut((db) => { if (db.entries[id]?.[who]) { delete db.entries[id][who]; db.events[id].count--; } }),
  watchMyEntry: (id: string, cb: (e: EventEntry | null) => void) => watch((db) => db.entries[id]?.[useAccount.getState().uid ?? ''] ?? null, cb),
  watchMyEvents: (cb: (e: { id: string; title: string; date: number; boxName: string }[]) => void) => watch((db) => Object.values(db.my[useAccount.getState().uid ?? ''] ?? {}), cb),
  register: (id: string, r: { name: string; vest: boolean; plan: MurphPlan }) => {
    const db = load(); const e = db.events[id]; const u = me();
    if (!e) return Promise.reject(new Error('missing'));
    if (e.status !== 'open') return Promise.reject(new Error('closed'));
    const had = !!db.entries[id]?.[u];
    if (!had && e.count >= e.capacity) return Promise.reject(new Error('full'));
    (db.entries[id] ??= {})[u] = { uid: u, name: r.name, vest: e.vest && r.vest, plan: e.partition ? r.plan : null };
    if (!had) e.count++;
    (db.my[u] ??= {})[id] = { id, title: e.title, date: e.date, boxName: e.boxName };
    save(db); return Promise.resolve();
  },
  updateEntry: (id: string, r: { vest: boolean; plan: MurphPlan }) => mut((db) => { Object.assign(db.entries[id][me()], r); }),
  unregister: (id: string) => mut((db) => { const u = me(); if (db.entries[id]?.[u]) { delete db.entries[id][u]; db.events[id].count--; delete db.my[u]?.[id]; } }),
  watchMyProgress: (id: string, cb: (p: EventProgress | null) => void) => watch((db) => db.progress[id]?.[useAccount.getState().uid ?? ''] ?? null, cb),
  saveProgress: (id: string, s: MurphState, who: { name: string; vest: boolean }) => mut((db) => { const u = me(); (db.progress[id] ??= {})[u] = { ...s, uid: u, ...who }; }),
};

if (typeof window !== 'undefined') (window as unknown as Record<string, unknown>).__cronoboxEvents = { load, save, mock };
