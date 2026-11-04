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

/**
 * Entra na sala (como TV ou como coach) e começa a ouvir.
 *
 * Presença: "coach" e "tvOnline" somem sozinhos quando a conexão cai (onDisconnect). O Firebase
 * reconecta sozinho, mas não recoloca esses nós — então, a cada reconexão (.info/connected),
 * marcamos presença de novo. Sem isso, depois de o celular ficar parado (tela apagada, Wi-Fi
 * trocando), as escritas do coach eram recusadas e a sincronização "caía".
 */
export async function openRoom(code: string, role: RemoteRole, h: RoomHandlers): Promise<Room> {
  useRemote.setState({ status: 'connecting', peer: false, role, code });
  try {
    const { db, uid } = await connect();
    const base = `rooms/${code}`;
    let offset = 0;
    let closed = false;
    const subs: (() => void)[] = [];
    subs.push(onValue(ref(db, '.info/serverTimeOffset'), (s) => { offset = Number(s.val()) || 0; }));

    const presence = ref(db, role === 'tv' ? `${base}/tvOnline` : `${base}/coach`);
    /** marca "estou aqui" e deixa combinado com o servidor apagar isso se a conexão cair */
    const claim = async () => {
      await onDisconnect(presence).remove();
      await set(presence, role === 'tv' ? true : { uid, at: serverTimestamp() });
    };
    if (role === 'tv') await set(ref(db, `${base}/tv`), { uid, at: serverTimestamp() }); // recusa se a sala for de outra TV
    await claim();

    // o que foi enviado por último e o que o servidor recusou (para mandar de novo ao reconectar)
    const latest: Partial<Record<'timer' | 'brand', object>> = {};
    const failed = new Set<'timer' | 'brand'>();
    const write = (path: 'timer' | 'brand', value: object) => {
      latest[path] = value;
      set(ref(db, `${base}/${path}`), { ...value, by: uid, sentAt: serverTimestamp() })
        .then(() => { failed.delete(path); if (!closed && useRemote.getState().status === 'error') useRemote.setState({ status: 'online' }); })
        .catch(() => { failed.add(path); if (!closed) useRemote.setState({ status: 'error' }); });
    };

    subs.push(onValue(ref(db, '.info/connected'), (s) => {
      if (closed) return;
      if (s.val() !== true) { useRemote.setState({ status: 'connecting' }); return; }
      claim()
        .then(() => {
          if (closed) return;
          useRemote.setState({ status: 'online' });
          for (const path of [...failed]) write(path, latest[path]!);
        })
        .catch(() => { if (!closed) useRemote.setState({ status: 'error' }); });
    }));

    if (role === 'tv') subs.push(onValue(ref(db, `${base}/coach`), (s) => useRemote.setState({ peer: s.exists() })));
    else subs.push(onValue(ref(db, `${base}/tvOnline`), (s) => useRemote.setState({ peer: s.val() === true })));
    subs.push(onValue(ref(db, `${base}/timer`), (s) => { const v = s.val(); if (v && v.by !== uid) h.onTimer(v); }));
    subs.push(onValue(ref(db, `${base}/brand`), (s) => { const v = s.val(); if (v && v.by !== uid) h.onBrand(v); }));
    useRemote.setState({ status: 'online' });

    return {
      uid,
      offset: () => offset,
      publishTimer: (s) => write('timer', s),
      publishBrand: (s) => write('brand', s),
      close: () => {
        closed = true;
        subs.forEach((u) => u());
        onDisconnect(presence).cancel().catch(() => {});
        remove(presence).catch(() => {});
        useRemote.setState({ status: 'off', peer: false, role: null, code: null });
      },
    };
  } catch (e) {
    useRemote.setState({ status: 'error' });
    throw e;
  }
}
