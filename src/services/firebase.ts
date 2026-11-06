/**
 * Um Firebase só para o app todo (TV, conta, sugestões).
 *
 * Na web a sessão fica salva no aparelho: quem entrou com o link do e-mail continua entrando.
 * No app instalado (pausado por enquanto) a sessão não é salva: só serve para conectar à TV.
 */
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, inMemoryPersistence, initializeAuth, signInAnonymously, type Auth, type User } from 'firebase/auth';
import { Platform } from 'react-native';
import { FIREBASE_CONFIG } from '@/config/firebase';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function firebaseApp(): FirebaseApp {
  if (!FIREBASE_CONFIG) throw new Error('Firebase não configurado');
  if (!app) app = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);
  return app;
}

export function firebaseAuth(): Auth {
  if (!auth) auth = Platform.OS === 'web' ? getAuth(firebaseApp()) : initializeAuth(firebaseApp(), { persistence: inMemoryPersistence });
  return auth;
}

/**
 * Quem está usando: a conta (se entrou com o e-mail) ou um anônimo (TV, ou antes de entrar).
 * Nunca troca uma conta por um anônimo.
 */
export async function currentUser(): Promise<User> {
  const a = firebaseAuth();
  await a.authStateReady();
  return a.currentUser ?? (await signInAnonymously(a)).user;
}
