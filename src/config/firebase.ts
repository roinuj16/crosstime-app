/**
 * Projeto Firebase do pareamento TV ↔ celular (Realtime Database + login anônimo).
 *
 * Cole aqui o bloco `firebaseConfig` do console (Configurações do projeto → Seus apps → Web).
 * Esses valores NÃO são senha: vão dentro do app de qualquer jeito. Quem protege o banco são as
 * regras em database.rules.json. Enquanto estiver `null`, o pareamento fica escondido.
 */
import type { FirebaseOptions } from 'firebase/app';

export const FIREBASE_CONFIG: FirebaseOptions | null = null;
