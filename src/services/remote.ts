/**
 * Pareamento TV ↔ celular do coach pelo Firebase Realtime Database.
 * Este arquivo só conversa com o Firebase; o que vai e volta é decidido em core/sync.ts.
 *
 * Sala: rooms/<código>/
 *   tv        { uid, at }        dona da sala (a TV que mostrou o código)
 *   tvOnline  true               some sozinho quando a TV cai (onDisconnect)
 *   coach     { uid, at }        o celular conectado; some sozinho quando ele cai
 *   timer     TimerSnapshot      modo, treino, configurações, treinos salvos, sessão
 *   brand     BrandSnapshot      nome do box, logo, WOD, cores
 */
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, inMemoryPersistence, initializeAuth, signInAnonymously, type Auth } from 'firebase/auth';
import { getDatabase, onDisconnect, onValue, ref, remove, serverTimestamp, set, type Database } from 'firebase/database';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { FIREBASE_CONFIG } from '@/config/firebase';
import type { BrandSnapshot, TimerSnapshot } from '@/core/sync';

export const remoteAvailable = FIREBASE_CONFIG != null;

export type RemoteRole = 'tv' | 'coach';
export type RemoteStatus = 'off' | 'connecting' | 'online' | 'error';

/** Estado da conexão para as telas (não é salvo). `peer`: o outro lado está conectado. */
export const useRemote = create<{ status: RemoteStatus; peer: boolean; role: RemoteRole | null; code: string | null }>(() => ({
  status: 'off', peer: false, role: null, code: null,
}));

let ready: Promise<{ db: Database; uid: string }> | null = null;

function connect(): Promise<{ db: Database; uid: string }> {
  if (!FIREBASE_CONFIG) return Promise.reject(new Error('Firebase não configurado'));
  if (!ready) {
    ready = (async () => {
      const app: FirebaseApp = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);
      // no celular, sem guardar a sessão: cada abertura entra como um anônimo novo (a sala é pelo código)
      const auth: Auth = Platform.OS === 'web' ? getAuth(app) : initializeAuth(app, { persistence: inMemoryPersistence });
      const cred = await signInAnonymously(auth);
      return { db: getDatabase(app), uid: cred.user.uid };
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

export interface RoomHandlers {
  onTimer: (snap: TimerSnapshot & { by: string }) => void;
  onBrand: (snap: BrandSnapshot & { by: string }) => void;
}

export interface Room {
  uid: string;
  /** diferença entre o relógio do servidor e o deste aparelho (ms) */
  offset: () => number;
  publishTimer: (s: TimerSnapshot) => void;
  publishBrand: (s: BrandSnapshot) => void;
  close: () => void;
}

/** Entra na sala (como TV ou como coach) e começa a ouvir. */
export async function openRoom(code: string, role: RemoteRole, h: RoomHandlers): Promise<Room> {
  useRemote.setState({ status: 'connecting', peer: false, role, code });
  try {
    const { db, uid } = await connect();
    const base = `rooms/${code}`;
    let offset = 0;
    const subs: (() => void)[] = [];
    subs.push(onValue(ref(db, '.info/serverTimeOffset'), (s) => { offset = Number(s.val()) || 0; }));

    if (role === 'tv') {
      await set(ref(db, `${base}/tv`), { uid, at: serverTimestamp() });
      const online = ref(db, `${base}/tvOnline`);
      await onDisconnect(online).remove();
      await set(online, true);
      subs.push(onValue(ref(db, `${base}/coach`), (s) => useRemote.setState({ peer: s.exists() })));
    } else {
      const me = ref(db, `${base}/coach`);
      await onDisconnect(me).remove();
      await set(me, { uid, at: serverTimestamp() });
      subs.push(onValue(ref(db, `${base}/tvOnline`), (s) => useRemote.setState({ peer: s.val() === true })));
    }
    subs.push(onValue(ref(db, `${base}/timer`), (s) => { const v = s.val(); if (v && v.by !== uid) h.onTimer(v); }));
    subs.push(onValue(ref(db, `${base}/brand`), (s) => { const v = s.val(); if (v && v.by !== uid) h.onBrand(v); }));
    useRemote.setState({ status: 'online' });

    const write = (path: string, value: object) =>
      set(ref(db, `${base}/${path}`), { ...value, by: uid, sentAt: serverTimestamp() }).catch(() => useRemote.setState({ status: 'error' }));
    return {
      uid,
      offset: () => offset,
      publishTimer: (s) => { write('timer', s); },
      publishBrand: (s) => { write('brand', s); },
      close: () => {
        subs.forEach((u) => u());
        if (role === 'coach') remove(ref(db, `${base}/coach`)).catch(() => {});
        else remove(ref(db, `${base}/tvOnline`)).catch(() => {});
        useRemote.setState({ status: 'off', peer: false, role: null, code: null });
      },
    };
  } catch (e) {
    useRemote.setState({ status: 'error' });
    throw e;
  }
}
