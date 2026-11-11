/**
 * Treinos especiais: só no web app (versão de verdade em events.web.ts).
 * No app instalado (pausado) tudo fica desligado.
 */
import type { EventEntry, EventProgress, MurphEvent } from '@/core/event';
import type { MurphPlan, MurphState } from '@/core/murph';

export const eventsAvailable = false;
const off = () => Promise.reject(new Error('Treinos especiais só no web app'));
type Unsub = () => void;
export interface Box { id: string; name: string; city: string; coaches: string[] }
export interface MyEvent { id: string; title: string; date: number; boxName: string }

export const watchMyBoxes = (_cb: (b: Box[]) => void): Unsub => () => {};
export const createBox = (_name: string, _city: string): Promise<string> => off();
export const createEvent = (_e: Omit<MurphEvent, 'id' | 'count' | 'status' | 'startAt' | 'createdBy'>): Promise<string> => off();
export const updateEvent = (_id: string, _patch: Partial<MurphEvent>): Promise<void> => off();
export const deleteEvent = (_id: string): Promise<void> => off();
export const watchBoxEvents = (_boxId: string, _cb: (e: MurphEvent[]) => void): Unsub => () => {};
export const watchEvent = (_id: string, _cb: (e: MurphEvent | null) => void): Unsub => () => {};
export const watchEntries = (_id: string, _cb: (e: EventEntry[]) => void): Unsub => () => {};
export const watchProgress = (_id: string, _cb: (p: EventProgress[]) => void): Unsub => () => {};
export const watchMyProgress = (_id: string, _cb: (p: EventProgress | null) => void): Unsub => () => {};
export const watchMyEntry = (_id: string, _cb: (e: EventEntry | null) => void): Unsub => () => {};
export const watchMyEvents = (_cb: (e: MyEvent[]) => void): Unsub => () => {};
export const register = (_id: string, _r: { name: string; vest: boolean; plan: MurphPlan }): Promise<void> => off();
export const updateEntry = (_id: string, _r: { vest: boolean; plan: MurphPlan }): Promise<void> => off();
export const unregister = (_id: string): Promise<void> => off();
export const removeEntry = (_id: string, _uid: string): Promise<void> => off();
export const startEvent = (_id: string, _delayMs?: number): Promise<void> => off();
export const resetEvent = (_id: string): Promise<void> => off();
export const endEvent = (_id: string): Promise<void> => off();
export const saveProgress = (_id: string, _s: MurphState, _who: { name: string; vest: boolean }): Promise<void> => off();
export const eventLink = (id: string) => `/murph?id=${id}`;
export const eventErrorCode = (e: unknown): string => String((e as { code?: string; message?: string })?.code ?? (e as Error)?.message ?? '');
