import { useEffect } from 'react';
import { AppState } from 'react-native';
import { upcomingAlerts } from '@/core/alerts';
import { resolveLang, strings } from '@/i18n';
import { cancelAlerts, ensureNotificationPermission, scheduleAlerts, startKeepAlive, stopKeepAlive } from '@/services/background';
import { useApp } from '@/store/useApp';

/**
 * Cuida do treino com o app fora da tela:
 * - enquanto o treino roda, mantém o app vivo (áudio silencioso em loop);
 * - ao sair da tela, agenda um aviso para cada troca de fase futura;
 * - ao voltar, cancela os avisos (o próprio app volta a bipar e falar).
 */
export function useBackground() {
  const running = useApp((s) => s.session?.state.status === 'running');
  const enabled = useApp((s) => s.settings.backgroundAlerts);

  useEffect(() => {
    if (running) startKeepAlive(); else stopKeepAlive();
  }, [running]);

  // pede a permissão de notificação na primeira vez que um treino começa
  useEffect(() => { if (running && enabled) ensureNotificationPermission(); }, [running, enabled]);

  // pausou, zerou ou terminou: nada de aviso pendente
  useEffect(() => { if (!running) cancelAlerts(); }, [running]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      const st = useApp.getState();
      if (state === 'active') { cancelAlerts(); return; }
      if (state !== 'background' || !st.settings.backgroundAlerts || st.session?.state.status !== 'running') return;
      const t = strings(resolveLang(st.settings.language));
      scheduleAlerts(upcomingAlerts(st.session.mode, st.session.config, st.elapsed(), Date.now(), t, st.settings.timeFormat));
    });
    return () => sub.remove();
  }, []);
}
