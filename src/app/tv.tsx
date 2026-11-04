import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { CurrentBand, NextBand, TvHelp, TvOverlay, TvTopBar, type TvHelpItem } from '@/components/organisms';
import { PlayButton, Stat } from '@/components/molecules';
import { TvTemplate } from '@/components/templates';
import * as Engine from '@/core/engine';
import { MODES } from '@/core/engine';
import { cycleMode, tvAction } from '@/core/tvKeys';
import { timerView } from '@/core/view';
import { useFeedback } from '@/hooks/useFeedback';
import { useStrings } from '@/hooks/useStrings';
import { useTimerLoop } from '@/hooks/useTimerLoop';
import { unlockAudio } from '@/services/feedback';
import { autoHideCursor, enterFullscreen, keepScreenOn } from '@/services/webApp';
import { useApp } from '@/store/useApp';
import { glow, hex, UI, type ColorRole } from '@/theme/palette';

const RESET_WINDOW_MS = 3000;

/** Página do modo TV: placar em tela cheia para a TV do box, controlado pelo controle remoto ou teclado. */
export default function TvScreen() {
  const { width, height } = useWindowDimensions();
  const app = useApp();
  const { t } = useStrings();
  const mode = app.currentMode();
  const onEvents = useFeedback(mode);
  const el = useTimerLoop(onEvents);
  const [ready, setReady] = useState(Platform.OS !== 'web'); // web: som só depois de um toque/tecla
  const [armed, setArmed] = useState(false);
  const armTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => keepScreenOn(), []);
  useEffect(() => autoHideCursor(), []);
  useEffect(() => { const id = setInterval(() => setClock(new Date()), 15_000); return () => clearInterval(id); }, []);

  const status = app.session?.state.status ?? 'idle';
  const v = timerView({
    mode, config: app.currentConfig(), status, elapsed: el,
    doneAt: app.session?.state.elapsedBase ?? 0, rounds: app.session?.rounds ?? 0,
    name: app.session?.name ?? app.activeName, t, fmt: app.settings.timeFormat,
  });
  const color = (role: ColorRole | null) => (role ? hex(app.colors[role]) : UI.muted);
  const glowOf = (role: ColorRole | null, a = 0.5) => (role ? glow(app.colors[role], a) : 'transparent');
  const accent = color(v.accent);

  const start = () => { unlockAudio(); enterFullscreen(); setReady(true); };

  // Controle remoto / teclado. Lê o estado na hora da tecla (não o da última renderização).
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      if (!ready) { e.preventDefault(); start(); return; }
      const st = useApp.getState();
      const s = st.session?.state.status ?? 'idle';
      const m = st.currentMode();
      const loc = Engine.locate(st.segments(), st.elapsed());
      const action = tvAction(e.key, {
        status: s, tapsRounds: Engine.tapsRounds(m),
        fortimeRunning: m === 'fortime' && loc.seg?.phase === 'fortime', resetArmed: armed,
      });
      if (!action) return;
      e.preventDefault();
      unlockAudio();
      if (action !== 'armReset') { setArmed(false); clearTimeout(armTimer.current); }
      switch (action) {
        case 'toggle': st.toggle(); break;
        case 'skip': st.skip(); break;
        case 'back': st.back(); break;
        case 'finish': st.finish(Date.now(), true); onEvents([{ type: 'done' }]); break;
        case 'roundUp': st.addRound(1); break;
        case 'roundDown': st.addRound(-1); break;
        case 'modeNext': st.setMode(cycleMode(MODES, m, 1)); break;
        case 'modePrev': st.setMode(cycleMode(MODES, m, -1)); break;
        case 'reset': st.reset(); break;
        case 'armReset':
          setArmed(true);
          clearTimeout(armTimer.current);
          armTimer.current = setTimeout(() => setArmed(false), RESET_WINDOW_MS);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ready, armed, onEvents]);

  // Tamanhos a partir da tela: o relógio ocupa a coluna grande (70% da largura útil).
  const innerW = width * 0.93, bodyH = height * 0.92 * 0.78;
  const curSize = Math.min(innerW * 0.7 * 0.34, bodyH * 0.62);
  const sideW = innerW * 0.3;
  const nextSize = Math.min(sideW * 0.3, bodyH * 0.16);
  const ui = Math.max(14, height * 0.024); // texto pequeno (dicas, rótulos)
  const active = status === 'running' || status === 'paused';
  const counting = v.nextAction === 'count' || (v.next.label === t.roundsCounter && status === 'done');

  const K = t.tv.keys;
  const help: TvHelpItem[] = status === 'running'
    ? [{ keys: ['OK'], label: K.play }]
    : active
      ? [
        { keys: ['OK'], label: K.play },
        { keys: ['←', '→'], label: mode === 'fortime' ? `${K.back} / ${K.finish}` : `${K.back} / ${K.skip}` },
        ...(Engine.tapsRounds(mode) ? [{ keys: ['↑', '↓'], label: K.rounds }] : []),
        { keys: ['↩'], label: K.reset },
      ]
      : [{ keys: ['OK'], label: K.play }, { keys: ['←', '→'], label: K.mode }];

  const stat = (s: typeof v.left) => (s ? <Stat stat={s} color={color(s.role)} size={height * 0.075} /> : null);
  const hh = String(clock.getHours()).padStart(2, '0'), mm = String(clock.getMinutes()).padStart(2, '0');

  return (
    <TvTemplate
      top={
        <TvTopBar
          title={v.title} time={v.headerTime} clock={`${hh}:${mm}`} color={accent} size={height * 0.045}
          exitLabel={t.tv.exit} onExit={() => router.replace('/')}
        />
      }
      main={
        <CurrentBand
          label={status === 'paused' ? `${v.cur.label} · ${t.tv.paused}` : v.cur.label}
          time={v.cur.time} color={accent} glow={glowOf(v.cur.role)} timeGlow={glowOf(v.cur.role, 0.6)}
          size={curSize} dim={status === 'paused'}
        />
      }
      side={
        <View style={s.side}>
          <NextBand
            label={v.next.label} time={v.next.time} color={color(v.next.role)} glow={glowOf(v.next.role, 0.45)} timeGlow={glowOf(v.next.role, 0.5)}
            size={nextSize} counting={counting} height="42%" accessibilityLabel={v.next.label}
          />
          {(v.left || (v.right && v.right !== 'finish')) && (
            <View style={s.stats}>{stat(v.left)}{v.right && v.right !== 'finish' ? stat(v.right) : null}</View>
          )}
          <View style={s.play}>
            <PlayButton
              color={accent} glow={glowOf(v.accent, 0.6)} progress={v.progress} running={status === 'running'}
              label={v.playLabel} onPress={() => { unlockAudio(); app.toggle(); }} size={Math.min(sideW * 0.42, bodyH * 0.26)}
            />
          </View>
        </View>
      }
      footer={<TvHelp items={help} warning={armed ? t.tv.pressAgain : null} size={ui} />}
      overlay={ready ? null : <TvOverlay title={t.tv.start} hint={t.tv.startHint} size={height * 0.035} onStart={start} />}
    />
  );
}

const s = StyleSheet.create({
  side: { flex: 1 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12 },
  play: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
