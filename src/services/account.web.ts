/**
 * Conta do CronoBox no web app (Firebase Auth + Firestore).
 *
 * Entrada com link no e-mail, "confirmando em qualquer aparelho":
 *  1. o app que pede (anônimo) cria loginRequests/<rid> e o Firebase manda o link
 *     <site>/confirm?rid=<rid>&oobCode=… para o e-mail;
 *  2. se o link abrir no mesmo navegador, entra ali mesmo;
 *  3. se abrir em outro (Safari × ícone da tela de início, app do Gmail, computador), a página
 *     só grava o link no pedido; o app que está esperando lê e entra com ele.
 * O pedido é secreto (o rid só vai no e-mail) e o link só pode ser gravado uma vez.
 *
 * Firestore:
 *   users/<uid>          cadastro (Profile)
 *   userData/<uid>       treinos, tempos, WOD, dados do coach e preferências (core/account.ts)
 *   loginRequests/<rid>  pedido de entrada (some depois de usado)
 *   feedback/<id>        avaliações e sugestões (só criar; ninguém lê pelo app)
 * Regras: firestore.rules.
 */
import Constants from 'expo-constants';
import {
  deleteUser, isSignInWithEmailLink, onAuthStateChanged, sendSignInLinkToEmail, signInWithEmailLink, signOut,
} from 'firebase/auth';
import {
  addDoc, collection, deleteDoc, doc, getDoc, initializeFirestore, onSnapshot, persistentLocalCache,
  persistentMultipleTabManager, serverTimestamp, setDoc, updateDoc, type Firestore,
} from 'firebase/firestore';
import { create } from 'zustand';
import { FIREBASE_CONFIG } from '@/config/firebase';
import {
  accountData, accountKey, applyRemote, cleanProfile, firstMerge, matchCode,
  type AccountData, type FeedbackType, type Profile,
} from '@/core/account';
import { useApp } from '@/store/useApp';
import { currentUser, firebaseApp, firebaseAuth } from './firebase';

export type AccountStatus = 'off' | 'loading' | 'signedOut' | 'needsProfile' | 'ready';
export interface AccountInfo { status: AccountStatus; uid: string | null; email: string | null; profile: Profile | null }

export const accountAvailable = FIREBASE_CONFIG != null;
export const useAccount = create<AccountInfo>(() => ({ status: accountAvailable ? 'loading' : 'off', uid: null, email: null, profile: null }));

// ---------- armazenamento local (sobrevive a recarregar a página) ----------
const K = {
  pending: 'cronobox.login.pending',
  profile: (uid: string) => `cronobox.profile.${uid}`,
  synced: (uid: string) => `cronobox.synced.${uid}`,
  device: 'cronobox.device',
  changedAt: 'cronobox.changedAt',
};
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* aba anônima cheia: segue */ } },
  del: (k: string) => { try { localStorage.removeItem(k); } catch { /* idem */ } },
};
const randomId = (n: number) => {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
};
const deviceId = () => ls.get(K.device) ?? (() => { const id = randomId(12); ls.set(K.device, id); return id; })();

/** "iPhone · Safari", "Android · Chrome", "Mac · Chrome" — para a página do link mostrar de onde veio o pedido. */
function deviceLabel(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Navegador';
  const br = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
  const app = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches ? 'app na tela de início' : br;
  return [os, app].filter(Boolean).join(' · ');
}

let fs: Firestore | null = null;
function db(): Firestore {
  if (!fs) {
    try {
      // cache no aparelho: abre o app sem internet (box com Wi-Fi ruim) com o cadastro e os dados
      fs = initializeFirestore(firebaseApp(), { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
    } catch {
      fs = initializeFirestore(firebaseApp(), {});
    }
  }
  return fs;
}

// ---------- estado da conta ----------
let started = false;
let stopProfile: (() => void) | null = null;
let stopData: (() => void) | null = null;
let deleting = false;

/** Começa a acompanhar a conta (uma vez, ao abrir o app). */
export function startAccount(): void {
  if (started || !accountAvailable) return;
  started = true;
  trackLocalChanges();
  onAuthStateChanged(firebaseAuth(), (user) => {
    stopProfile?.(); stopProfile = null;
    stopData?.(); stopData = null;
    if (!user || user.isAnonymous || !user.email) {
      useAccount.setState({ status: 'signedOut', uid: null, email: null, profile: null });
      return;
    }
    const uid = user.uid;
    const email = user.email;
    // cadastro guardado no aparelho: entra na hora, mesmo sem internet
    const cached = ls.get(K.profile(uid));
    const cachedProfile = cached ? (JSON.parse(cached) as Profile) : null;
    useAccount.setState({ status: cachedProfile ? 'ready' : 'loading', uid, email, profile: cachedProfile });
    if (cachedProfile) stopData ??= startCloudData(uid);
    stopProfile = onSnapshot(doc(db(), 'users', uid), (snap) => {
      if (deleting) return;
      if (snap.metadata.fromCache && !snap.exists() && cachedProfile) return; // sem internet: fica com o guardado
      const p = snap.exists() ? (snap.data() as Profile) : null;
      if (p) ls.set(K.profile(uid), JSON.stringify(cleanProfile(p))); else ls.del(K.profile(uid));
      useAccount.setState({ status: p ? 'ready' : 'needsProfile', profile: p });
      if (p) stopData ??= startCloudData(uid);
    }, () => {
      // sem permissão / sem internet: com cadastro guardado, segue; sem, pede o cadastro
      if (!cachedProfile) useAccount.setState({ status: 'needsProfile' });
    });
  });
}

// ---------- entrada com link ----------
export type LoginRequest = { rid: string; email: string; code: string };

/** Pedido de entrada esperando o link (sobrevive a recarregar a página). */
export function pendingLogin(): LoginRequest | null {
  const raw = ls.get(K.pending);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as { rid: string; email: string; at: number };
    if (Date.now() - p.at > 60 * 60 * 1000) { ls.del(K.pending); return null; } // o link do Firebase vale ~1 h
    return { rid: p.rid, email: p.email, code: matchCode(p.rid) };
  } catch { return null; }
}

/** Manda o link para o e-mail e devolve o pedido (com o código de 2 dígitos para conferir). */
export async function requestLogin(rawEmail: string): Promise<LoginRequest> {
  const email = rawEmail.trim().toLowerCase();
  const user = await currentUser();
  const rid = randomId(24);
  await setDoc(doc(db(), 'loginRequests', rid), { uid: user.uid, email, device: deviceLabel(), link: null, createdAt: serverTimestamp() });
  const lang = useApp.getState().settings.language;
  firebaseAuth().languageCode = lang === 'en' ? 'en' : 'pt-BR'; // idioma do e-mail
  await sendSignInLinkToEmail(firebaseAuth(), email, { url: `${window.location.origin}/confirm?rid=${rid}`, handleCodeInApp: true });
  ls.set(K.pending, JSON.stringify({ rid, email, at: Date.now() }));
  return { rid, email, code: matchCode(rid) };
}

/** Espera o link ser aberto em outro lugar e entra com ele. Devolve a função para parar de esperar. */
export function waitForLogin(req: LoginRequest, onError: (e: unknown) => void): () => void {
  let done = false;
  const ref = doc(db(), 'loginRequests', req.rid);
  const unsub = onSnapshot(ref, (snap) => {
    const link = snap.data()?.link as string | null | undefined;
    if (!link || done) return;
    done = true;
    unsub();
    signInWithEmailLink(firebaseAuth(), req.email, link)
      .then(() => { ls.del(K.pending); deleteDoc(ref).catch(() => {}); })
      .catch(onError);
  }, () => { /* sem permissão depois de entrar: normal */ });
  return () => { done = true; unsub(); };
}

export function cancelLogin(): void { ls.del(K.pending); }

export type ConfirmInfo =
  | { kind: 'invalid' } | { kind: 'signedInHere' } | { kind: 'used' } | { kind: 'noRequest' }
  | { kind: 'remote'; rid: string; email: string; device: string; code: string };

/** O que fazer com o link que abriu a página /confirm. */
export async function readConfirm(href: string): Promise<ConfirmInfo> {
  const auth = firebaseAuth();
  if (!isSignInWithEmailLink(auth, href)) return { kind: 'invalid' };
  const rid = new URL(href).searchParams.get('rid') ?? '';
  const pending = pendingLogin();
  const hereWith = async (email: string) => {
    // mesmo navegador que pediu (ou e-mail de um pedido anterior daqui): entra aqui mesmo
    await signInWithEmailLink(auth, email, href);
    ls.del(K.pending);
    if (rid) deleteDoc(doc(db(), 'loginRequests', rid)).catch(() => {});
    return { kind: 'signedInHere' } as const;
  };
  if (pending && (!rid || pending.rid === rid)) return hereWith(pending.email);
  if (!rid) return { kind: 'noRequest' };
  await currentUser();
  const snap = await getDoc(doc(db(), 'loginRequests', rid)).catch(() => null);
  if (!snap?.exists()) return pending ? hereWith(pending.email) : { kind: 'noRequest' };
  const d = snap.data();
  if (d.link) return { kind: 'used' };
  if (pending && pending.email === d.email) return hereWith(pending.email);
  return { kind: 'remote', rid, email: String(d.email ?? ''), device: String(d.device ?? ''), code: matchCode(rid) };
}

/** "Sim, sou eu": libera a entrada no aparelho que está esperando. */
export async function approveRemote(rid: string, href: string): Promise<void> {
  await currentUser();
  await updateDoc(doc(db(), 'loginRequests', rid), { link: href });
}

/** Entrar neste navegador em vez do aparelho que pediu. */
export async function signInHere(email: string, href: string): Promise<void> {
  await signInWithEmailLink(firebaseAuth(), email.trim().toLowerCase(), href);
  ls.del(K.pending);
}

export const authErrorCode = (e: unknown): string => String((e as { code?: string })?.code ?? '');

// ---------- cadastro e conta ----------
export async function saveProfile(p: Profile): Promise<void> {
  const user = firebaseAuth().currentUser;
  if (!user?.email) throw new Error('Sem conta');
  const clean = { ...cleanProfile(p), email: user.email.toLowerCase() };
  const ref = doc(db(), 'users', user.uid);
  const isNew = useAccount.getState().status === 'needsProfile';
  await setDoc(ref, { ...clean, updatedAt: serverTimestamp(), ...(isNew ? { createdAt: serverTimestamp() } : {}) }, { merge: true });
  ls.set(K.profile(user.uid), JSON.stringify(clean));
  useAccount.setState({ status: 'ready', profile: clean });
  stopData ??= startCloudData(user.uid);
}

export async function signOutAccount(): Promise<void> {
  stopData?.(); stopData = null;
  await signOut(firebaseAuth());
}

/**
 * Exclui o cadastro e os dados guardados na conta. O login (e-mail) também sai, a não ser que
 * o Firebase peça uma entrada recente: aí devolve 'dataOnly' (cadastro e dados já apagados).
 */
export async function deleteAccount(): Promise<'deleted' | 'dataOnly'> {
  const user = firebaseAuth().currentUser;
  if (!user) throw new Error('Sem conta');
  deleting = true;
  try {
    stopData?.(); stopData = null;
    stopProfile?.(); stopProfile = null;
    await deleteDoc(doc(db(), 'userData', user.uid));
    await deleteDoc(doc(db(), 'users', user.uid));
    ls.del(K.profile(user.uid)); ls.del(K.synced(user.uid));
    try {
      await deleteUser(user);
      return 'deleted';
    } catch {
      await signOut(firebaseAuth());
      return 'dataOnly';
    }
  } finally {
    deleting = false;
  }
}

// ---------- avaliação e sugestões ----------
export async function sendFeedback(f: { rating: number | null; type: FeedbackType; message: string; route: string }): Promise<void> {
  const user = firebaseAuth().currentUser;
  if (!user?.email) throw new Error('Sem conta');
  const st = useApp.getState();
  await addDoc(collection(db(), 'feedback'), {
    uid: user.uid,
    rating: f.rating,
    type: f.type,
    message: f.message.trim().slice(0, 2000),
    route: f.route.slice(0, 60),
    appVersion: String(Constants.expoConfig?.version ?? ''),
    platform: 'web',
    device: deviceLabel().slice(0, 60),
    mode: st.mode,
    lang: st.settings.language,
    createdAt: serverTimestamp(),
  });
}

// ---------- dados na conta ----------
type AppState = ReturnType<typeof useApp.getState>;
const pickState = (s: AppState) => ({ configs: s.configs, colors: s.colors, settings: s.settings, saved: s.saved });

/** Hora da última mudança feita neste aparelho (para a primeira junção com a conta). */
function trackLocalChanges() {
  let last = accountKey(pickState(useApp.getState()));
  let t: ReturnType<typeof setTimeout> | undefined;
  useApp.subscribe(() => {
    clearTimeout(t);
    t = setTimeout(() => {
      const k = accountKey(pickState(useApp.getState()));
      if (k !== last) { last = k; ls.set(K.changedAt, String(Date.now())); }
    }, 800);
  });
}

/** Junta este aparelho com a conta e mantém os dois iguais. Devolve a função para parar. */
function startCloudData(uid: string): () => void {
  const ref = doc(db(), 'userData', uid);
  const device = deviceId();
  let stopped = false;
  let lastKey = '';
  let unsubStore: (() => void) | null = null;
  let unsubRemote: (() => void) | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const push = () => {
    const st = pickState(useApp.getState());
    const key = accountKey(st);
    if (key === lastKey) return;
    lastKey = key;
    setDoc(ref, accountData(st, Date.now(), device)).catch(() => { lastKey = ''; });
  };
  const apply = (next: ReturnType<typeof pickState>) => {
    lastKey = accountKey(next);
    useApp.setState(next as Partial<AppState>);
  };

  (async () => {
    const snap = await getDoc(ref).catch(() => null);
    if (stopped) return;
    if (snap === null) { setTimeout(() => { if (!stopped) { stopped = true; stopData = startCloudData(uid); } }, 15_000); return; } // sem internet: tenta de novo
    const remote = snap.exists() ? (snap.data() as AccountData) : null;
    const local = pickState(useApp.getState());
    const synced = ls.get(K.synced(uid)) === '1';
    const merged = (remote && synced
      ? applyRemote(local as never, remote as never)
      : firstMerge(local as never, Number(ls.get(K.changedAt) ?? 0), remote as never)) as ReturnType<typeof pickState>;
    if (accountKey(merged) !== accountKey(local)) apply(merged); else lastKey = accountKey(local);
    if (!remote || accountKey(remote as never) !== accountKey(merged)) { lastKey = ''; push(); }
    ls.set(K.synced(uid), '1');

    // mudanças daqui → conta (junta as seguidas, ex.: digitando o WOD)
    unsubStore = useApp.subscribe(() => { clearTimeout(timer); timer = setTimeout(push, 1500); });
    // mudanças de outro aparelho → aqui
    unsubRemote = onSnapshot(ref, (s) => {
      if (!s.exists() || s.metadata.hasPendingWrites) return;
      const data = s.data() as AccountData;
      if (data.device === device) return;
      const next = applyRemote(pickState(useApp.getState()) as never, data as never) as ReturnType<typeof pickState>;
      if (accountKey(next) !== lastKey) apply(next);
    }, () => {});
  })();

  return () => { stopped = true; clearTimeout(timer); unsubStore?.(); unsubRemote?.(); };
}

// só em builds de teste (EXPO_PUBLIC_PREVIEW_HOOKS=1): deixa ver as telas da conta sem internet
if (__DEV__ || process.env.EXPO_PUBLIC_PREVIEW_HOOKS === '1') (globalThis as Record<string, unknown>).__cronoboxAccount = useAccount;
