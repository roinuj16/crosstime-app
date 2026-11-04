import { useEffect, useState } from 'react';
import { openRoom, remoteAvailable, type RemoteRole } from '@/services/remote';
import { startSync } from '@/services/syncLoop';
import { useApp } from '@/store/useApp';

const RETRY_MS = 10_000;

/**
 * Liga este aparelho à sala `code` como TV ou como celular do coach (veja services/syncLoop.ts).
 * Sem internet ao abrir, tenta de novo a cada 10 s. `onTaken`: a sala já é de outra TV.
 */
export function useRemoteSync(role: RemoteRole, code: string | null, onTaken?: () => void) {
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!remoteAvailable || !code) return;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const stop = startSync(useApp, openRoom, role, code, (e) => {
      if (String((e as Error)?.message ?? e).includes('PERMISSION_DENIED')) { if (role === 'tv') onTaken?.(); return; }
      retry = setTimeout(() => setAttempt((a) => a + 1), RETRY_MS);
    });
    return () => { clearTimeout(retry); stop(); };
  }, [role, code, attempt]);
}
