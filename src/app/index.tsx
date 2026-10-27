import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MODES, type Mode } from '@/core/engine';
import { timerView } from '@/core/view';
import { PlayButton } from '@/components/PlayButton';
import { Torch } from '@/components/Torch';
import { useBackground } from '@/hooks/useBackground';
import { useFeedback } from '@/hooks/useFeedback';
import { useStrings } from '@/hooks/useStrings';
import { useTimerLoop } from '@/hooks/useTimerLoop';
import { useApp } from '@/store/useApp';
import { glow, hex, UI, type ColorRole } from '@/theme/palette';
import { FONT } from '@/theme/type';

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

  // rola o seletor até o modo atual
  const scroller = useRef<ScrollViewInstance>(null);
  const tabX = useRef<Partial<Record<Mode, number>>>({});
  useEffect(() => { const x = tabX.current[mode]; if (x != null) scroller.current?.scrollTo({ x: Math.max(0, x - 60), animated: true }); }, [mode]);

  const ask = (title: string, onYes: () => void) =>
    Alert.alert(title, t.resetText, [{ text: t.cancel, style: 'cancel' }, { text: t.reset, style: 'destructive', onPress: onYes }]);
  const confirmReset = () => (status === 'done' ? app.reset() : ask(t.resetTitle, () => app.reset()));
  const switchMode = (m: Mode) => {
    if (m === mode) return;
    if (active) ask(t.switchTitle, () => { app.reset(); app.setMode(m); });
    else app.setMode(m);
  };
  const openEdit = () => router.push('/edit');

  const curSize = Math.min(width * 0.46, height * 0.2);
  const nextSize = Math.min(width * 0.22, height * 0.085);
  const counting = v.nextAction === 'count' || (v.next.label === t.roundsCounter && status === 'done');

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Torch />
      <View style={styles.header}>
        <View style={styles.hside}>
          <IconBtn name="settings-outline" color={accent} label={t.settings.title} onPress={() => router.push('/settings')} />
          <IconBtn name="list" color={accent} label={t.workouts.title} onPress={() => router.push('/workouts')} />
        </View>
        <Pressable style={styles.hcenter} onPress={openEdit} accessibilityRole="button" accessibilityLabel={t.edit.title}>
          <Text style={[styles.hmode, { color: accent }]} numberOfLines={1}>{v.title.toUpperCase()}</Text>
          <Text style={[styles.htime, { color: accent }]}>{v.headerTime}</Text>
        </Pressable>
        <View style={[styles.hside, { justifyContent: 'flex-end' }]}>
          <IconBtn name="refresh" color={status === 'idle' ? UI.line : accent} label={t.reset} onPress={confirmReset} disabled={status === 'idle'} />
          <IconBtn name="timer-outline" color={accent} label={t.edit.title} onPress={openEdit} />
        </View>
      </View>

      <View style={styles.cur} accessibilityLiveRegion="polite">
        <Text style={[styles.curLabel, { color: accent, textShadowColor: glowOf(v.cur.role), fontSize: curSize * 0.3 }]} numberOfLines={1}>{v.cur.label.toUpperCase()}</Text>
        <Text
          style={[styles.curTime, { color: accent, textShadowColor: glowOf(v.cur.role, 0.6), fontSize: curSize, lineHeight: curSize * 0.95 }, status === 'paused' && { opacity: 0.45 }]}
          adjustsFontSizeToFit numberOfLines={1}
        >{v.cur.time}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.next, pressed && v.nextAction && { backgroundColor: '#262626' }]}
        disabled={!v.nextAction}
        onPress={() => (v.nextAction === 'count' ? app.addRound(1) : app.skip())}
        onLongPress={v.nextAction === 'count' ? () => app.addRound(-1) : undefined}
        accessibilityRole={v.nextAction ? 'button' : undefined}
        accessibilityLabel={v.nextAction === 'count' ? `${t.roundsCounter} ${v.next.time}. ${t.tapToCount}` : v.nextAction === 'skip' ? `${t.skip}: ${v.next.label}` : v.next.label}
      >
        <Text style={[styles.nextLabel, { color: color(v.next.role), textShadowColor: glowOf(v.next.role, 0.45), fontSize: nextSize * 0.36 }]} numberOfLines={1}>{v.next.label.toUpperCase()}</Text>
        {!!v.next.time && (
          <Text style={[styles.nextTime, { color: color(v.next.role), textShadowColor: glowOf(v.next.role, 0.5), fontSize: counting ? nextSize * 1.15 : nextSize, lineHeight: (counting ? nextSize * 1.15 : nextSize) * 0.95 }]}>{v.next.time}</Text>
        )}
        {v.nextAction === 'skip' && <Text style={styles.hint}>{t.skip.toUpperCase()} ›</Text>}
        {v.nextAction === 'count' && <Text style={styles.hint}>+1</Text>}
      </Pressable>

      <View style={styles.deck}>
        <Stat stat={v.left} color={v.left ? color(v.left.role) : UI.muted} />
        <PlayButton color={accent} glow={glowOf(v.accent, 0.6)} progress={v.progress} running={status === 'running'} label={v.playLabel} onPress={() => app.toggle()} size={Math.min(124, width * 0.32)} />
        {v.right === 'finish' ? (
          <Pressable style={styles.finish} onPress={() => { app.finish(Date.now(), true); onEvents([{ type: 'done' }]); }} accessibilityRole="button" accessibilityLabel={t.finish}>
            <View style={[styles.finishIcon, { borderColor: color('run') }]}><Ionicons name="flag" size={26} color={color('run')} /></View>
            <Text style={[styles.statLabel, { color: color('run') }]}>{t.finish.toUpperCase()}</Text>
          </Pressable>
        ) : (
          <Stat stat={v.right} color={v.right ? color(v.right.role) : UI.muted} />
        )}
      </View>

      <ScrollView ref={scroller} horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabs} accessibilityRole="tablist">
        {MODES.map((m) => {
          const sel = m === mode;
          return (
            <Pressable
              key={m} onPress={() => switchMode(m)} onLayout={(e) => { tabX.current[m] = e.nativeEvent.layout.x; }}
              accessibilityRole="tab" accessibilityState={{ selected: sel }} accessibilityHint={t.modeHints[m]}
              style={[styles.tab, sel && styles.tabSel]}
            >
              <Text style={[styles.tabText, sel && { color: '#FFFFFF' }]}>{t.modes[m].toUpperCase()}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function IconBtn({ name, color, label, onPress, disabled }: { name: keyof typeof Ionicons.glyphMap; color: string; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable style={styles.hbtn} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      <Ionicons name={name} size={24} color={color} />
    </Pressable>
  );
}

function Stat({ stat, color }: { stat: { value: number; label: string } | null; color: string }) {
  return (
    <View style={[styles.stat, !stat && { opacity: 0 }]} accessible={!!stat} accessibilityLabel={stat ? `${stat.value} ${stat.label}` : undefined}>
      <Text style={[styles.statNum, { color }]}>{stat ? stat.value : 0}</Text>
      <Text style={styles.statLabel}>{stat ? stat.label.toUpperCase() : ' '}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg },
  header: { height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  hside: { flexDirection: 'row', width: 96 },
  hbtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hcenter: { flex: 1, alignItems: 'center' },
  hmode: { fontFamily: FONT.label, fontSize: 18, letterSpacing: 1.5, lineHeight: 20 },
  htime: { fontFamily: FONT.display, fontSize: 26, lineHeight: 26, fontVariant: ['tabular-nums'] },
  cur: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.bg, paddingHorizontal: 12 },
  curLabel: { fontFamily: FONT.label, letterSpacing: 2, textShadowRadius: 18 },
  curTime: { fontFamily: FONT.display, fontVariant: ['tabular-nums'], textShadowRadius: 24, includeFontPadding: false },
  next: { height: '20%', backgroundColor: UI.panel, alignItems: 'center', justifyContent: 'center' },
  nextLabel: { fontFamily: FONT.label, letterSpacing: 1.5, textShadowRadius: 12 },
  nextTime: { fontFamily: FONT.display, fontVariant: ['tabular-nums'], textShadowRadius: 16, includeFontPadding: false },
  hint: { position: 'absolute', right: 16, bottom: 10, fontFamily: FONT.label, fontSize: 18, color: UI.muted, letterSpacing: 1 },
  deck: { height: 190, backgroundColor: UI.deck, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12 },
  stat: { alignItems: 'center', width: 100 },
  statNum: { fontFamily: FONT.display, fontSize: 64, lineHeight: 60, fontVariant: ['tabular-nums'] },
  statLabel: { fontFamily: FONT.label, fontSize: 15, color: UI.text, letterSpacing: 1, textAlign: 'center' },
  finish: { alignItems: 'center', width: 100, gap: 6 },
  finishIcon: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  tabsWrap: { flexGrow: 0, backgroundColor: UI.bg },
  tabs: { gap: 6, paddingVertical: 8, paddingHorizontal: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  tabSel: { backgroundColor: '#2E2E2E' },
  tabText: { fontFamily: FONT.label, fontSize: 18, color: UI.muted, letterSpacing: 1.2 },
});
