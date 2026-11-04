import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Engine from '@/core/engine';
import { sessionEvents } from '@/core/usage';
import { setAnalyticsEnabled, track } from '@/services/analytics';
import { useRemote } from '@/services/remote';
import { useApp } from '@/store/useApp';

const surface = (path: string) => (path === '/tv' ? 'tv' : 'phone');

/**
 * Componente de sistema (não desenha nada): liga o Analytics conforme o consentimento
 * e registra telas, treinos, pareamento e erros. Sem consentimento, `track` não faz nada.
 */
export function AnalyticsObserver() {
  const consent = useApp((s) => s.settings.analyticsConsent);
  const path = usePathname();

  useEffect(() => { setAnalyticsEnabled(consent === 'granted'); }, [consent]);

  useEffect(() => {
    if (consent !== 'granted') return;
    const installed = Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches;
    track('page_view', { page_path: path, page_location: typeof location !== 'undefined' ? location.origin + path : path, installed: !!installed });
  }, [path, consent]);

  // treinos: início, conclusão, zerar
  useEffect(() => useApp.subscribe((st, prev) => {
    if (st.session === prev.session) return;
    const paired = !!st.settings.pairedCode || useRemote.getState().role === 'tv' && useRemote.getState().peer;
    const planned = (s: { mode: Engine.Mode; state: unknown }) => Engine.totalDuration(Engine.buildSegments(s.mode, (st.session ?? prev.session)!.config));
    for (const e of sessionEvents(prev.session, st.session, planned)) {
      track(e.name, { ...e.params, surface: surface(path), paired, saved_workout: !!st.activeName });
    }
  }), [path]);

  // pareamento: quando o outro lado aparece
  useEffect(() => useRemote.subscribe((r, prev) => {
    if (r.peer && !prev.peer && r.role) track('pairing_connected', { role: r.role });
  }), []);

  // erros da página (na web não existe Crashlytics) e instalação na tela de início
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onError = (e: ErrorEvent) => track('app_error', { message: String(e.message), source: 'error' });
    const onRejection = (e: PromiseRejectionEvent) => track('app_error', { message: String((e.reason as Error)?.message ?? e.reason), source: 'promise' });
    const onInstalled = () => track('pwa_installed');
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  return null;
}
