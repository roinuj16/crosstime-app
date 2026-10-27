import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Engine from '@/core/engine';
import type { Mode } from '@/core/engine';
import { PlayButton } from '@/components/PlayButton';
import { useTimerLoop } from '@/hooks/useTimerLoop';
import { resolveLang, strings } from '@/i18n';
import { useApp } from '@/store/useApp';
import { glow, hex, UI, type ColorRole } from '@/theme/palette';
import { FONT } from '@/theme/type';

const MODES: Mode[] = ['tabata', 'rounds', 'stopwatch'];

export default function TimerScreen() {
  const { width, height } = useWindowDimensions();
  const app = useApp();
  const el = useTimerLoop(); // sons/voz/vibração entram na fase 3
  const t = strings(resolveLang(app.settings.language));
  const fmt = (s: number) => Engine.format(s, app.settings.timeFormat);

  const mode = app.currentMode();
  const cfg = app.currentConfig();
  const segs = useMemo(() => Engine.buildSegments(mode, cfg), [mode, cfg]);
  const status = app.session?.state.status ?? 'idle';
  const total = Engine.totalDuration(segs);
  const color = (role: ColorRole) => hex(app.colors[role]);
  const glowOf = (role: ColorRole, a = 0.5) => glow(app.colors[role], a);

  // ----- o que mostrar -----
  let cur = { role: 'prepare' as ColorRole, label: '', time: '' };
  let nxt: { role: ColorRole | null; label: string; time: string } = { role: null, label: '', time: '' };
  let headerTime = fmt(total);
  let left: [number, string] | null = null;
  let right: [number, string] | null = null;
  let progress = 0;
  let canSkip = false;

  if (status === 'done') {
    const role: ColorRole = mode === 'stopwatch' ? 'run' : 'work';
    cur = { role, label: t.done, time: fmt(total) };
    nxt = { role: null, label: t.greatJob, time: '' };
    progress = 1;
    if (mode !== 'stopwatch') left = [0, t.roundsLeft];
    if (mode === 'tabata') right = [0, t.cyclesLeft];
  } else {
    const loc = Engine.locate(segs, status === 'idle' ? 0 : el);
    const seg = loc.seg!;
    if (seg.phase === 'run') {
      const L = Engine.lapInfo(seg, status === 'idle' ? seg.start : el);
      cur = { role: 'run', label: t.phases.run, time: Engine.formatUp(L.elapsed) };
      nxt = { role: 'lap', label: status === 'idle' ? t.phases.lap : `${t.phases.lap} · ${t.lapN(L.n)}`, time: fmt(status === 'idle' ? seg.lap ?? 0 : L.toNext) };
      headerTime = Engine.formatUp(el);
      left = [L.completed, t.lapsDone];
      progress = status === 'idle' ? 0 : L.progress;
    } else {
      cur = { role: seg.phase as ColorRole, label: t.phases[seg.phase], time: fmt(status === 'idle' ? seg.duration : loc.segRemaining) };
      const n = loc.next;
      if (n?.phase === 'run') nxt = { role: 'lap', label: t.phases.lap, time: fmt(n.lap ?? 0) };
      else if (n) nxt = { role: n.phase as ColorRole, label: t.phases[n.phase], time: fmt(n.duration) };
      else nxt = { role: null, label: t.endOfWorkout, time: '' };
      headerTime = mode === 'stopwatch' ? Engine.formatUp(el) : fmt(status === 'idle' ? total : loc.totalRemaining);
      const rem = Engine.remaining(mode, cfg, loc);
      if (mode === 'tabata') { left = [rem.rounds, t.roundsLeft]; right = [rem.cycles, t.cyclesLeft]; }
      else if (mode === 'rounds') left = [rem.rounds, t.roundsLeft];
      else left = [0, t.lapsDone];
      progress = status === 'idle' ? 0 : loc.segElapsed / seg.duration;
      canSkip = (status === 'running' || status === 'paused') && !!n;
    }
  }

  const accent = color(cur.role);
  const playLabel = { idle: t.start, running: t.pause, paused: t.resume, done: t.repeat }[status];
  const confirmReset = () => {
    if (status === 'done') { app.reset(); return; }
    Alert.alert(t.resetTitle, t.resetText, [
      { text: t.cancel, style: 'cancel' },
      { text: t.reset, style: 'destructive', onPress: () => app.reset() },
    ]);
  };
  const switchMode = (m: Mode) => {
    if (m === mode) return;
    if (status === 'running' || status === 'paused') {
      Alert.alert(t.resetTitle, t.resetText, [
        { text: t.cancel, style: 'cancel' },
        { text: t.reset, style: 'destructive', onPress: () => { app.reset(); app.setMode(m); } },
      ]);
    } else app.setMode(m);
  };

  const curSize = Math.min(width * 0.46, height * 0.2);
  const nextSize = Math.min(width * 0.22, height * 0.085);
  const nextColor = nxt.role ? color(nxt.role) : UI.muted;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.hbtn} accessibilityLabel="Settings" hitSlop={8}>
          <Ionicons name="settings-outline" size={24} color={accent} />
        </Pressable>
        <View style={styles.hcenter}>
          <Text style={[styles.hmode, { color: accent }]}>{(app.session?.name ?? app.activeName ?? t.modes[mode]).toUpperCase()}</Text>
          <Text style={[styles.htime, { color: accent }]}>{headerTime}</Text>
        </View>
        <Pressable style={styles.hbtn} onPress={confirmReset} disabled={status === 'idle'} accessibilityLabel={t.reset} hitSlop={8}>
          <Ionicons name="refresh" size={24} color={status === 'idle' ? UI.line : accent} />
        </Pressable>
      </View>

      <View style={styles.cur} accessibilityLiveRegion="polite">
        <Text style={[styles.curLabel, { color: accent, textShadowColor: glowOf(cur.role), fontSize: curSize * 0.3 }]}>{cur.label.toUpperCase()}</Text>
        <Text style={[styles.curTime, { color: accent, textShadowColor: glowOf(cur.role, 0.6), fontSize: curSize, lineHeight: curSize * 0.95 }, status === 'paused' && { opacity: 0.45 }]}>{cur.time}</Text>
      </View>

      <Pressable style={styles.next} disabled={!canSkip} onPress={() => app.skip()} accessibilityLabel={canSkip ? `${t.skip}: ${nxt.label}` : nxt.label}>
        <Text style={[styles.nextLabel, { color: nextColor, textShadowColor: nxt.role ? glowOf(nxt.role, 0.45) : 'transparent', fontSize: nextSize * 0.36 }]}>{nxt.label.toUpperCase()}</Text>
        {!!nxt.time && <Text style={[styles.nextTime, { color: nextColor, textShadowColor: nxt.role ? glowOf(nxt.role, 0.5) : 'transparent', fontSize: nextSize, lineHeight: nextSize * 0.95 }]}>{nxt.time}</Text>}
        {canSkip && <Text style={styles.skip}>{t.skip.toUpperCase()} ›</Text>}
      </Pressable>

      <View style={styles.deck}>
        <Stat value={left} color={color(mode === 'stopwatch' ? 'lap' : 'rounds')} />
        <PlayButton color={accent} glow={glowOf(cur.role, 0.6)} progress={progress} running={status === 'running'} label={playLabel} onPress={() => app.toggle()} size={Math.min(124, width * 0.32)} />
        <Stat value={right} color={color('cycles')} />
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {MODES.map((m) => {
          const sel = m === mode;
          return (
            <Pressable key={m} onPress={() => switchMode(m)} accessibilityRole="tab" accessibilityState={{ selected: sel }} style={[styles.tab, sel && styles.tabSel]}>
              <Text style={[styles.tabText, sel && { color: '#FFFFFF' }]}>{t.modes[m].toUpperCase()}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function Stat({ value, color }: { value: [number, string] | null; color: string }) {
  return (
    <View style={[styles.stat, !value && { opacity: 0 }]}>
      <Text style={[styles.statNum, { color }]}>{value ? value[0] : 0}</Text>
      <Text style={styles.statLabel}>{value ? value[1].toUpperCase() : ' '}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg },
  header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  hbtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hcenter: { alignItems: 'center' },
  hmode: { fontFamily: FONT.label, fontSize: 18, letterSpacing: 1.5, lineHeight: 20 },
  htime: { fontFamily: FONT.display, fontSize: 26, lineHeight: 26, fontVariant: ['tabular-nums'] },
  cur: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.bg },
  curLabel: { fontFamily: FONT.label, letterSpacing: 2, textShadowRadius: 18 },
  curTime: { fontFamily: FONT.display, fontVariant: ['tabular-nums'], textShadowRadius: 24, includeFontPadding: false },
  next: { height: '20%', backgroundColor: UI.panel, alignItems: 'center', justifyContent: 'center' },
  nextLabel: { fontFamily: FONT.label, letterSpacing: 1.5, textShadowRadius: 12 },
  nextTime: { fontFamily: FONT.display, fontVariant: ['tabular-nums'], textShadowRadius: 16, includeFontPadding: false },
  skip: { position: 'absolute', right: 16, bottom: 10, fontFamily: FONT.label, fontSize: 16, color: UI.muted, letterSpacing: 1 },
  deck: { height: 190, backgroundColor: UI.deck, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12 },
  stat: { alignItems: 'center', width: 96 },
  statNum: { fontFamily: FONT.display, fontSize: 64, lineHeight: 60, fontVariant: ['tabular-nums'] },
  statLabel: { fontFamily: FONT.label, fontSize: 15, color: UI.text, letterSpacing: 1, textAlign: 'center' },
  tabs: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8, backgroundColor: UI.bg },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  tabSel: { backgroundColor: '#2E2E2E' },
  tabText: { fontFamily: FONT.label, fontSize: 17, color: UI.muted, letterSpacing: 1.2 },
});
