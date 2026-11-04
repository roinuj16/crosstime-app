import { useEffect, useRef, useState } from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import {
  TvClock, TvDone, TvHeader, TvHelp, TvIdle, TvLapsAside, TvOverlay, TvPhase, TvRoundsAside, TvSetupCard, TvWodAside, type TvHelpItem,
} from '@/components/organisms';
import { TvTemplate } from '@/components/templates';
import * as Engine from '@/core/engine';
import { MODES } from '@/core/engine';
import { tvBoard } from '@/core/tvBoard';
import { cycleMode, tvAction } from '@/core/tvKeys';
import { useFeedback } from '@/hooks/useFeedback';
import { useStrings } from '@/hooks/useStrings';
import { useTimerLoop } from '@/hooks/useTimerLoop';
import { unlockAudio } from '@/services/feedback';
import { autoHideCursor, enterFullscreen, keepScreenOn } from '@/services/webApp';
import { useApp } from '@/store/useApp';
import { glow, hex, UI, type ColorRole } from '@/theme/palette';
import { tvUnit } from '@/theme/tv';

const RESET_WINDOW_MS = 3000;
const BACK_HOME_MS = 2 * 60 * 1000;

/** Troca para o treino salvo seguinte/anterior (os de "Meus treinos"); sem treinos salvos, troca o modo. */
function changeWorkout(dir: 1 | -1) {
  const st = useApp.getState();
  const list = st.saved;
  if (!list.length) { st.setMode(cycleMode(MODES, st.currentMode(), dir)); return; }
  const n = list.length;
  const i = list.findIndex((w) => w.name === st.activeName && w.mode === st.mode);
  st.loadWorkout(list[i < 0 ? (dir > 0 ? 0 : n - 1) : (i + dir + n) % n]);
}

/** Página do modo TV: placar do box em tela cheia, controlado pelo controle remoto ou teclado. */
export default function TvScreen() {
  const { width, height } = useWindowDimensions();
  const u = tvUnit(width, height);
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
  // fim do treino: volta sozinha para a tela inicial depois de 2 minutos
  useEffect(() => {
    if (status !== 'done') return;
    const id = setTimeout(() => useApp.getState().reset(), BACK_HOME_MS);
    return () => clearTimeout(id);
  }, [status]);

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
        case 'modeNext': changeWorkout(1); break;
        case 'modePrev': changeWorkout(-1); break;
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

  const S = app.settings;
  const b = tvBoard({
    mode, config: app.currentConfig(), status, elapsed: el, doneAt: app.session?.state.elapsedBase ?? 0,
    rounds: app.session?.rounds ?? 0, name: app.session?.name ?? app.activeName, wod: S.tvWod, t, fmt: S.timeFormat,
  });
  const color = (role: ColorRole | null) => (role ? hex(app.colors[role]) : UI.muted);
  const glowOf = (role: ColorRole | null, a = 0.45) => (role ? glow(app.colors[role], a) : 'transparent');
  const T = t.tv, K = T.keys;
  const box = S.tvBoxName.trim();
  const hh = String(clock.getHours()).padStart(2, '0'), mm = String(clock.getMinutes()).padStart(2, '0');
  const clockNode = <TvClock time={`${hh}:${mm}`} u={u} />;
  const headerTitle = (workout: string) => (box ? `${box} · ${workout}` : workout);

  let help: TvHelpItem[];
  if (b.scene === 'idle') help = [{ keys: ['OK'], label: K.play }, { keys: ['◀', '▶'], label: K.workout }];
  else if (b.scene === 'done') help = [{ keys: ['OK'], label: K.repeat }, { keys: ['◀', '▶'], label: K.workout }, { keys: [], label: T.backHome }];
  else if (status === 'running') help = [{ keys: ['OK'], label: K.play }];
  else {
    help = [
      { keys: ['OK'], label: K.play },
      { keys: ['◀', '▶'], label: mode === 'fortime' ? `${K.back} / ${K.finish}` : `${K.back} / ${K.skip}` },
      ...(Engine.tapsRounds(mode) ? [{ keys: ['▲', '▼'], label: K.rounds }] : []),
      { keys: ['↩'], label: K.reset },
    ];
  }
  const footer = <TvHelp items={help} warning={armed ? T.pressAgain : null} size={17 * u} />;
  const overlay = ready ? null : <TvOverlay title={T.start} hint={T.startHint} size={30 * u} onStart={start} />;

  if (b.scene === 'idle') {
    return (
      <TvTemplate
        divider
        header={<TvHeader logo={S.tvLogo || undefined} title={box || 'CrossTimer'} strong right={clockNode} u={u} />}
        main={
          <View style={{ flex: 1, paddingVertical: 40 * u, paddingLeft: 48 * u, paddingRight: 40 * u }}>
            <TvIdle
              label={T.nextWorkout} title={b.title} color={color(b.accent)} glow={glowOf(b.accent, 0.35)}
              stats={b.summary.map((it) => ({ label: it.label, value: it.value.map((p) => ({ text: p.text, color: p.role ? color(p.role) : UI.text })) }))}
              okHint={T.okToStart} u={u}
            />
          </View>
        }
        side={
          <View style={{ flex: 1, paddingVertical: 40 * u, paddingRight: 48 * u }}>
            <TvSetupCard title={b.wod.length ? T.wod : T.setupCard} lines={b.wod} hint={T.setupCardHint} u={u} />
          </View>
        }
        sideWidth={408}
        footer={footer}
        overlay={overlay}
      />
    );
  }

  if (b.scene === 'done') {
    return (
      <TvTemplate
        header={<TvHeader logo={S.tvLogo || undefined} title={headerTitle(b.title)} right={clockNode} u={u} />}
        main={<TvDone label={b.label === t.done ? T.doneTitle : b.label} time={b.time} message={T.doneMsg} color={color(b.role)} glow={glowOf(b.role)} u={u} />}
        footer={footer}
        overlay={overlay}
      />
    );
  }

  // ao vivo: o relógio diminui se não couber (ex.: 1:05:00) na coluna grande
  const aside = b.aside;
  const sideWidth = aside.kind === 'wod' ? 380 : 330;
  const mainW = width * 0.96 - sideWidth * u - 64 * u;
  const clockSize = Math.min(360 * u, mainW / (b.time.length * 0.5));
  return (
    <TvTemplate
      frame={b.frame ? color(b.frame) : null}
      header={<TvHeader logo={S.tvLogo || undefined} title={headerTitle(b.title)} right={clockNode} u={u} />}
      main={
        <TvPhase
          label={b.paused ? `${b.label} · ${T.paused}` : b.label} time={b.time} color={color(b.role)}
          glow={glowOf(b.role)} timeGlow={glowOf(b.role, 0.5)} progress={b.progress} size={clockSize} dim={b.paused} u={u}
        />
      }
      side={
        aside.kind === 'rounds' ? (
          <TvRoundsAside
            round={aside.round} cycle={aside.cycle} remaining={aside.remaining}
            next={aside.next ? { ...aside.next, color: color(aside.next.role) } : null}
            labels={{ round: T.round, cycle: T.cycle, next: T.next, remaining: T.remaining }} u={u}
          />
        ) : aside.kind === 'laps' ? (
          <TvLapsAside lap={aside.lap} completed={aside.completed} next={{ ...aside.next, color: color('lap') }} labels={{ lap: T.lap, laps: T.laps }} u={u} />
        ) : (
          <TvWodAside lines={aside.kind === 'wod' ? aside.lines : []} rounds={aside.rounds} labels={{ wod: T.wod, rounds: T.rounds, hint: T.roundsHint }} u={u} />
        )
      }
      sideWidth={sideWidth}
      footer={status === 'running' && !armed ? null : footer}
      overlay={overlay}
    />
  );
}
