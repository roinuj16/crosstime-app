import { useEffect, useState } from 'react';
import { openRoom, remoteAvailable, type RemoteRole } from '@/services/remote';
import { startSync } from '@/services/syncLoop';
import { useApp } from '@/store/useApp';
import { resolveLang } from '@/i18n';
import { LOGO_MAX_CHARS, shrinkDataUrl } from '@/services/webApp';

const RETRY_MS = 10_000;

/**
 * Liga este aparelho à sala `code` como TV ou como celular do coach (veja services/syncLoop.ts).
 * Sem internet ao abrir, tenta de novo a cada 10 s. `onTaken`: a sala já é de outra TV.
 */
export function useRemoteSync(role: RemoteRole, code: string | null, onTaken?: () => void) {
  const [attempt, setAttempt] = useState(0);
  // logo salvo antes do limite: grande demais para a sala (o Firebase recusava a marca inteira)
  const logo = useApp((s) => s.settings.tvLogo);
  useEffect(() => {
    if (!logo || logo.length <= LOGO_MAX_CHARS) return;
    shrinkDataUrl(logo).then((small) => { if (small && useApp.getState().settings.tvLogo === logo) useApp.getState().setSetting('tvLogo', small); });
  }, [logo]);
  useEffect(() => {
    if (!remoteAvailable || !code) return;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const stop = startSync(useApp, openRoom, role, code, (e) => {
      if (String((e as Error)?.message ?? e).includes('PERMISSION_DENIED')) { if (role === 'tv') onTaken?.(); return; }
      retry = setTimeout(() => setAttempt((a) => a + 1), RETRY_MS);
    }, 80, (x) => resolveLang(x ?? 'auto')); // a TV fala o idioma do celular do coach
    return () => { clearTimeout(retry); stop(); };
  }, [role, code, attempt]);
}
