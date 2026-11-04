/**
 * Projeto Firebase "Cronobox": pareamento TV ↔ celular (Realtime Database + login anônimo)
 * e Google Analytics na web.
 *
 * Esses valores NÃO são senha: vão dentro do app de qualquer jeito. Quem protege o banco são as
 * regras em database.rules.json. Com `null`, o pareamento e o Analytics ficam desligados.
 */
import type { FirebaseOptions } from 'firebase/app';

export const FIREBASE_CONFIG: FirebaseOptions | null = {
  apiKey: 'AIzaSyBLXYi0sSxMmXldVyPYWD64xg8Pd6ECQdc',
  authDomain: 'cronobox-ba0cc.firebaseapp.com',
  databaseURL: 'https://cronobox-ba0cc-default-rtdb.firebaseio.com',
  projectId: 'cronobox-ba0cc',
  storageBucket: 'cronobox-ba0cc.firebasestorage.app',
  messagingSenderId: '49669565975',
  appId: '1:49669565975:web:f27bf107d7731f19b6f652',
  // Google Analytics (só na web, e só com o consentimento da pessoa: services/analytics.web.ts)
  measurementId: 'G-409WK8253D',
};
