/** Um Firestore só para o web app (conta, dados na conta, treinos especiais). */
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';
import { firebaseApp } from './firebase';

let fs: Firestore | null = null;

export function db(): Firestore {
  if (!fs) {
    try {
      // cache no aparelho: abre sem internet (box com Wi-Fi ruim) e guarda a contagem até a conexão voltar
      fs = initializeFirestore(firebaseApp(), { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
    } catch {
      fs = initializeFirestore(firebaseApp(), {});
    }
  }
  return fs;
}
