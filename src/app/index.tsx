import { router } from 'expo-router';
import { Alert, useWindowDimensions } from 'react-native';
import { ControlDeck, CurrentBand, ModeTabs, NextBand, TimerHeader } from '@/components/organisms';
import { Torch } from '@/components/system/Torch';
import { TimerTemplate } from '@/components/templates';
import { MODES, type Mode } from '@/core/engine';
import { timerView } from '@/core/view';
import { useBackground } from '@/hooks/useBackground';
import { useFeedback } from '@/hooks/useFeedback';
import { useStrings } from '@/hooks/useStrings';
import { useTimerLoop } from '@/hooks/useTimerLoop';
import { useApp } from '@/store/useApp';
import { glow, hex, UI, type ColorRole } from '@/theme/palette';

/** Página do timer: liga o estado do app aos blocos do placar. */
export default function TimerScreen() {
  const { width, height } = useWindowDimensions();
  const app = useApp();
  const { t } = useStrings();
  const mode = app.currentMode();
  const onEvents = useFeedback(mode); // sons, voz, vibração, lanterna e tela acesa
  const el = useTimerLoop(onEvents);
  useBackground(); // tela bloqueada: mantém vivo e agenda avisos

  const status = app.session?.state.status ?? 'idle';
  const v = timerView({
    mode, config: app.currentConfig(), status, elapsed: el,
    doneAt: app.session?.state.elapsedBase ?? 0, rounds: app.session?.rounds ?? 0,
    name: app.session?.name ?? app.activeName, t, fmt: app.settings.timeFormat,
  });

  const color = (role: ColorRole | null) => (role ? hex(app.colors[role]) : UI.muted);
  const glowOf = (role: ColorRole | null, a = 0.5) => (role ? glow(app.colors[role], a) : 'transparent');
  const accent = color(v.accent);
  const active = status === 'running' || status === 'paused';

  const ask = (title: string, onYes: () => void) =>
    Alert.alert(title, t.resetText, [{ text: t.cancel, style: 'cancel' }, { text: t.reset, style: 'destructive', onPress: onYes }]);
  const confirmReset = () => (status === 'done' ? app.reset() : ask(t.resetTitle, () => app.reset()));
  const switchMode = (m: Mode) => {
    if (m === mode) return;
    if (active) ask(t.switchTitle, () => { app.reset(); app.setMode(m); });
    else app.setMode(m);
  };
  const openEdit = () => router.push('/edit');

  // Deitado: o relógio fica na coluna da esquerda (66% da largura) e divide a altura com a próxima fase.
  const landscape = width > height;
  const curSize = landscape ? Math.min(width * 0.66 * 0.3, height * 0.36) : Math.min(width * 0.46, height * 0.2);
  const nextSize = landscape ? Math.min(width * 0.66 * 0.15, height * 0.13) : Math.min(width * 0.22, height * 0.085);
  const playSize = landscape ? Math.min(124, height * 0.22) : Math.min(124, width * 0.32);
  const counting = v.nextAction === 'count' || (v.next.label === t.roundsCounter && status === 'done');
  const stat = (s: typeof v.left) => ({ stat: s, color: s ? color(s.role) : UI.muted });

  return (
    <TimerTemplate
      landscape={landscape}
      header={
        <TimerHeader
          color={accent} title={v.title} time={v.headerTime} canReset={status !== 'idle'}
          labels={{ settings: t.settings.title, workouts: t.workouts.title, reset: t.reset, edit: t.edit.title }}
          onSettings={() => router.push('/settings')} onWorkouts={() => router.push('/workouts')} onReset={confirmReset} onEdit={openEdit}
        />
      }
      current={
        <CurrentBand
          label={v.cur.label} time={v.cur.time} color={accent} glow={glowOf(v.cur.role)} timeGlow={glowOf(v.cur.role, 0.6)}
          size={curSize} dim={status === 'paused'}
        />
      }
      next={
        <NextBand
          label={v.next.label} time={v.next.time} color={color(v.next.role)} glow={glowOf(v.next.role, 0.45)} timeGlow={glowOf(v.next.role, 0.5)}
          size={nextSize} counting={counting} height={landscape ? '36%' : undefined}
          hint={v.nextAction === 'skip' ? `${t.skip.toUpperCase()} ›` : v.nextAction === 'count' ? '+1' : null}
          onPress={v.nextAction ? () => (v.nextAction === 'count' ? app.addRound(1) : app.skip()) : undefined}
          onLongPress={v.nextAction === 'count' ? () => app.addRound(-1) : undefined}
          accessibilityLabel={v.nextAction === 'count' ? `${t.roundsCounter} ${v.next.time}. ${t.tapToCount}` : v.nextAction === 'skip' ? `${t.skip}: ${v.next.label}` : v.next.label}
        />
      }
      deck={
        <ControlDeck
          left={stat(v.left)}
          right={v.right === 'finish'
            ? { finish: { label: t.finish, color: color('run'), onPress: () => { app.finish(Date.now(), true); onEvents([{ type: 'done' }]); } } }
            : stat(v.right)}
          play={{ color: accent, glow: glowOf(v.accent, 0.6), progress: v.progress, running: status === 'running', label: v.playLabel, onPress: () => app.toggle(), size: playSize }}
          vertical={landscape}
        />
      }
      tabs={<ModeTabs tabs={MODES.map((m) => ({ key: m, label: t.modes[m], hint: t.modeHints[m] }))} value={mode} onChange={switchMode} />}
    >
      <Torch />
    </TimerTemplate>
  );
}
