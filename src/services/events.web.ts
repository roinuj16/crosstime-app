/**
 * Treinos especiais no Firestore (web app). Regras: firestore.rules.
 *
 *   boxes/<boxId>                         nome, cidade, coaches (uids), owner
 *   events/<id>                           o Murph do box (core/event.ts → MurphEvent)
 *   events/<id>/entries/<uid>             inscrição (nome na TV, colete, plano de quebras)
 *   events/<id>/progress/<uid>            contagem ao vivo (core/murph.ts → MurphState)
 *   users/<uid>/myEvents/<id>             atalho para "meus treinos especiais"
 *
 * As vagas são garantidas no banco: a inscrição soma 1 em `count` na mesma transação, e a
 * regra só aceita se não passar de `capacity`.
 */
import {
  collection, deleteDoc, doc, getDocs, increment, onSnapshot, query, runTransaction, serverTimestamp, setDoc,
  updateDoc, where, writeBatch, addDoc,
} from 'firebase/firestore';
import { FIREBASE_CONFIG } from '@/config/firebase';
import type { EventEntry, EventProgress, MurphEvent } from '@/core/event';
import type { MurphPlan, MurphState } from '@/core/murph';
import { firebaseAuth } from './firebase';
import { db } from './firestore.web';

export const eventsAvailable = FIREBASE_CONFIG != null;
type Unsub = () => void;
export interface Box { id: string; name: string; city: string; coaches: string[] }
export interface MyEvent { id: string; title: string; date: number; boxName: string }

const uid = () => {
  const u = firebaseAuth().currentUser;
  if (!u || u.isAnonymous) throw new Error('sem-conta');
  return u.uid;
};
const ms = (v: unknown): number | null => {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const t = v as { toMillis?: () => number };
  return typeof t.toMillis === 'function' ? t.toMillis() : null;
};
const toEvent = (id: string, d: Record<string, unknown>): MurphEvent => ({ ...(d as unknown as MurphEvent), id, date: ms(d.date) ?? 0, startAt: ms(d.startAt) });

export const eventLink = (id: string) => `/murph?id=${id}`;
export const eventErrorCode = (e: unknown): string => String((e as { code?: string; message?: string })?.code ?? (e as Error)?.message ?? '');

// ---------- box ----------
function _watchMyBoxes(cb: (b: Box[]) => void): Unsub {
  let me: string;
  try { me = uid(); } catch { cb([]); return () => {}; }
  return onSnapshot(query(collection(db(), 'boxes'), where('coaches', 'array-contains', me)),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Box, 'id'>) }))), () => cb([]));
}

async function _createBox(name: string, city: string): Promise<string> {
  const me = uid();
  const ref = await addDoc(collection(db(), 'boxes'), { name: name.trim().slice(0, 60), city: city.trim().slice(0, 60), coaches: [me], owner: me, createdAt: serverTimestamp() });
  return ref.id;
}

// ---------- evento (coach) ----------
async function _createEvent(e: Omit<MurphEvent, 'id' | 'count' | 'status' | 'startAt' | 'createdBy'>): Promise<string> {
  const ref = await addDoc(collection(db(), 'events'), {
    ...e, count: 0, status: 'open', startAt: null, createdBy: uid(), createdAt: serverTimestamp(),
  });
  return ref.id;
}

const _updateEvent = (id: string, patch: Partial<MurphEvent>) => updateDoc(doc(db(), 'events', id), patch as Record<string, unknown>);
const _deleteEvent = (id: string) => deleteDoc(doc(db(), 'events', id));

/** Start: o relógio começa daqui a `delayMs` (contagem regressiva na TV e nos celulares). */
const _startEvent = (id: string, delayMs = 10_000) => updateDoc(doc(db(), 'events', id), { status: 'live', startAt: Date.now() + delayMs });
const _endEvent = (id: string) => updateDoc(doc(db(), 'events', id), { status: 'done' });

/** Volta para antes do start e apaga a contagem de todos (ex.: start sem querer). */
async function _resetEvent(id: string): Promise<void> {
  const prog = await getDocs(collection(db(), 'events', id, 'progress'));
  const batch = writeBatch(db());
  prog.docs.forEach((d) => batch.delete(d.ref));
  batch.update(doc(db(), 'events', id), { status: 'open', startAt: null });
  await batch.commit();
}

function _watchBoxEvents(boxId: string, cb: (e: MurphEvent[]) => void): Unsub {
  return onSnapshot(query(collection(db(), 'events'), where('boxId', '==', boxId)),
    (s) => cb(s.docs.map((d) => toEvent(d.id, d.data())).sort((a, b) => b.date - a.date)), () => cb([]));
}

function _watchEvent(id: string, cb: (e: MurphEvent | null) => void): Unsub {
  return onSnapshot(doc(db(), 'events', id), (s) => cb(s.exists() ? toEvent(s.id, s.data()) : null), () => cb(null));
}

function _watchEntries(id: string, cb: (e: EventEntry[]) => void): Unsub {
  return onSnapshot(collection(db(), 'events', id, 'entries'), (s) => cb(s.docs.map((d) => d.data() as EventEntry)), () => cb([]));
}

function _watchProgress(id: string, cb: (p: EventProgress[]) => void): Unsub {
  return onSnapshot(collection(db(), 'events', id, 'progress'), (s) => cb(s.docs.map((d) => d.data() as EventProgress)), () => cb([]));
}

/** Coach tira um inscrito (libera a vaga). */
async function _removeEntry(id: string, who: string): Promise<void> {
  await runTransaction(db(), async (tx) => {
    const entry = doc(db(), 'events', id, 'entries', who);
    if (!(await tx.get(entry)).exists()) return;
    tx.delete(entry);
    tx.update(doc(db(), 'events', id), { count: increment(-1) });
  });
}

// ---------- inscrição (aluno) ----------
function _watchMyEntry(id: string, cb: (e: EventEntry | null) => void): Unsub {
  let me: string;
  try { me = uid(); } catch { cb(null); return () => {}; }
  return onSnapshot(doc(db(), 'events', id, 'entries', me), (s) => cb(s.exists() ? (s.data() as EventEntry) : null), () => cb(null));
}

function _watchMyEvents(cb: (e: MyEvent[]) => void): Unsub {
  let me: string;
  try { me = uid(); } catch { cb([]); return () => {}; }
  return onSnapshot(collection(db(), 'users', me, 'myEvents'),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MyEvent, 'id'>), date: ms(d.data().date) ?? 0 })).sort((a, b) => b.date - a.date)), () => cb([]));
}

/** Inscreve garantindo a vaga. Erros: 'full' (esgotado), 'closed' (já começou ou acabou). */
async function _register(id: string, r: { name: string; vest: boolean; plan: MurphPlan }): Promise<void> {
  const me = uid();
  const evRef = doc(db(), 'events', id);
  const entryRef = doc(db(), 'events', id, 'entries', me);
  await runTransaction(db(), async (tx) => {
    const ev = await tx.get(evRef);
    if (!ev.exists()) throw new Error('missing');
    const e = toEvent(ev.id, ev.data());
    if (e.status !== 'open') throw new Error('closed');
    const already = (await tx.get(entryRef)).exists();
    const entry: EventEntry = { uid: me, name: r.name.slice(0, 40), vest: e.vest && r.vest, plan: e.partition ? r.plan : null };
    if (already) { tx.set(entryRef, entry); return; }
    if (e.count >= e.capacity) throw new Error('full');
    tx.set(entryRef, entry);
    tx.update(evRef, { count: e.count + 1 });
    tx.set(doc(db(), 'users', me, 'myEvents', id), { title: e.title, date: e.date, boxName: e.boxName });
  });
}

async function _updateEntry(id: string, r: { vest: boolean; plan: MurphPlan }): Promise<void> {
  await updateDoc(doc(db(), 'events', id, 'entries', uid()), { vest: r.vest, plan: r.plan });
}

async function _unregister(id: string): Promise<void> {
  const me = uid();
  await runTransaction(db(), async (tx) => {
    const entry = doc(db(), 'events', id, 'entries', me);
    if (!(await tx.get(entry)).exists()) return;
    tx.delete(entry);
    tx.update(doc(db(), 'events', id), { count: increment(-1) });
    tx.delete(doc(db(), 'users', me, 'myEvents', id));
  });
}

// ---------- contagem ao vivo ----------
/** A minha contagem salva (para continuar se a página recarregar). */
function _watchMyProgress(id: string, cb: (p: EventProgress | null) => void): Unsub {
  let me: string;
  try { me = uid(); } catch { cb(null); return () => {}; }
  return onSnapshot(doc(db(), 'events', id, 'progress', me), (s) => cb(s.exists() ? (s.data() as EventProgress) : null), () => cb(null));
}

async function _saveProgress(id: string, s: MurphState, who: { name: string; vest: boolean }): Promise<void> {
  const me = uid();
  const p: EventProgress = { ...s, uid: me, name: who.name, vest: who.vest };
  await setDoc(doc(db(), 'events', id, 'progress', me), { ...p, updatedAt: serverTimestamp() });
}

// ---------- o que as telas usam (em builds de teste, sem Firebase: events.mock.ts) ----------
const PREVIEW = process.env.EXPO_PUBLIC_PREVIEW_HOOKS === '1';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mock = PREVIEW ? (require('./events.mock') as typeof import('./events.mock')).mock : null;
export const watchMyBoxes = mock?.watchMyBoxes ?? _watchMyBoxes;
export const createBox = mock?.createBox ?? _createBox;
export const createEvent = mock?.createEvent ?? _createEvent;
export const updateEvent = mock?.updateEvent ?? _updateEvent;
export const deleteEvent = mock?.deleteEvent ?? _deleteEvent;
export const startEvent = mock?.startEvent ?? _startEvent;
export const endEvent = mock?.endEvent ?? _endEvent;
export const resetEvent = mock?.resetEvent ?? _resetEvent;
export const watchBoxEvents = mock?.watchBoxEvents ?? _watchBoxEvents;
export const watchEvent = mock?.watchEvent ?? _watchEvent;
export const watchEntries = mock?.watchEntries ?? _watchEntries;
export const watchProgress = mock?.watchProgress ?? _watchProgress;
export const removeEntry = mock?.removeEntry ?? _removeEntry;
export const watchMyEntry = mock?.watchMyEntry ?? _watchMyEntry;
export const watchMyEvents = mock?.watchMyEvents ?? _watchMyEvents;
export const register = mock?.register ?? _register;
export const updateEntry = mock?.updateEntry ?? _updateEntry;
export const unregister = mock?.unregister ?? _unregister;
export const watchMyProgress = mock?.watchMyProgress ?? _watchMyProgress;
export const saveProgress = mock?.saveProgress ?? _saveProgress;
