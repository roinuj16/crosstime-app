import * as KeepAwake from 'expo-keep-awake';
import { useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { cuesFor, type SoundKey } from '@/core/cues';
import type { Mode, TimerEvent } from '@/core/engine';
import { STRINGS } from '@/i18n/strings';
import { configureAudio, perform, preloadSounds } from '@/services/feedback';
import { preloadClips } from '@/services/voiceClips';
import { listVoices } from '@/services/voices';
import { useApp } from '@/store/useApp';

const KEEP_AWAKE_TAG = 'crosstimer-workout';

/**
 * Liga o timer ao aparelho: configura o áudio, mantém a tela acesa durante o treino
 * e devolve a função que toca sons / fala / vibra para cada evento.
 */
export function useFeedback(mode: Mode) {
  const settings = useApp((s) => s.settings);
  const running = useApp((s) => s.session?.state.status === 'running');

  useEffect(() => { configureAudio({ duckOthers: settings.duckOthers }); }, [settings.duckOthers]);

  // carrega a lista de vozes antes do treino, para o primeiro aviso não atrasar
  useEffect(() => { listVoices(settings.voiceLang).catch(() => {}); preloadClips(settings.voiceLang); }, [settings.voiceLang]);

  useEffect(() => {
    preloadSounds([`phase-${settings.soundScheme}` as SoundKey, 'count', 'count-last', 'done', 'lap', 'warn', 'tick']);
  }, [settings.soundScheme]);

  useEffect(() => {
    if (running && settings.keepAwake) KeepAwake.activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    else KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    return () => { KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {}); };
  }, [running, settings.keepAwake]);

  return useCallback((events: TimerEvent[]) => {
    const st = useApp.getState().settings;
    let cues = cuesFor(events, st, STRINGS[st.voiceLang].say, mode);
    // Android em segundo plano: a notificação agendada já toca o bipe; evita som duplicado
    if (Platform.OS === 'android' && st.backgroundAlerts && AppState.currentState !== 'active') {
      cues = cues.filter((c) => c.kind !== 'sound');
    }
    perform(cues, { lang: st.voiceLang, voiceId: st.voiceId, rate: st.voiceRate, volume: st.volume, source: st.voiceSource });
  }, [mode]);
}
