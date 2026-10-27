import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Section, SheetHeader } from '@/components/ui';
import { useStrings } from '@/hooks/useStrings';
import { useApp } from '@/store/useApp';
import { DEFAULT_COLORS, glow, hex, LED_KEYS, LED_NAMES, PRESETS, UI, type ColorRole, type ColorScheme } from '@/theme/palette';
import { FONT } from '@/theme/type';

const ROLES: ColorRole[] = ['prepare', 'work', 'rest', 'restBC', 'cooldown', 'run', 'lap', 'rounds', 'cycles'];

/** Mini placar: mostra como as cores ficam na tela do timer. */
function Preview({ c, t }: { c: ColorScheme; t: ReturnType<typeof useStrings>['t'] }) {
  const led = (role: ColorRole, size: number) => ({ color: hex(c[role]), textShadowColor: glow(c[role], 0.55), textShadowRadius: 10, fontSize: size, lineHeight: size * 0.95 });
  return (
    <View style={styles.preview} accessible accessibilityLabel={t.colors.preview}>
      <View style={styles.pvCur}>
        <Text style={[styles.pvText, led('work', 18)]}>{t.phases.work.toUpperCase()}</Text>
        <Text style={[styles.pvText, led('work', 56)]}>00:24</Text>
      </View>
      <View style={styles.pvNext}>
        <Text style={[styles.pvText, led('rest', 13)]}>{t.phases.rest.toUpperCase()}</Text>
        <Text style={[styles.pvText, led('rest', 30)]}>00:15</Text>
      </View>
      <View style={styles.pvDeck}>
        <Text style={[styles.pvText, led('rounds', 30)]}>3</Text>
        <View style={[styles.pvPlay, { backgroundColor: hex(c.work) }]} />
        <Text style={[styles.pvText, led('cycles', 30)]}>2</Text>
      </View>
    </View>
  );
}

export default function ColorsScreen() {
  const { t, lang } = useStrings();
  const colors = useApp((s) => s.colors);
  const setColor = useApp((s) => s.setColor);
  const setColors = useApp((s) => s.setColors);
  const same = (a: ColorScheme, b: ColorScheme) => ROLES.every((r) => a[r] === b[r]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <SheetHeader title={t.colors.title} onBack={() => router.back()} right={<Button label={t.settings.done} kind="primary" onPress={() => router.back()} />} />
      <ScrollView contentContainerStyle={styles.body}>
        <Preview c={colors} t={t} />

        <Section title={t.colors.presets} />
        <View style={styles.presets}>
          {Object.entries(PRESETS).map(([id, p]) => {
            const sel = same(p.colors, colors);
            return (
              <Pressable key={id} onPress={() => setColors(p.colors)} accessibilityRole="radio" accessibilityState={{ selected: sel }} style={[styles.preset, sel && styles.presetSel]}>
                <View style={styles.presetDots}>
                  {(['prepare', 'work', 'rest', 'cooldown'] as ColorRole[]).map((r) => <View key={r} style={[styles.dot, { backgroundColor: hex(p.colors[r]) }]} />)}
                </View>
                <Text style={styles.presetName}>{p.name[lang]}</Text>
              </Pressable>
            );
          })}
        </View>

        <Section title={t.colors.perPhase} />
        {ROLES.map((role) => (
          <View key={role} style={styles.role}>
            <Text style={[styles.roleName, { color: hex(colors[role]) }]}>{t.colors.roles[role]}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swRow}>
              {LED_KEYS.map((k) => {
                const sel = colors[role] === k;
                return (
                  <Pressable
                    key={k} onPress={() => setColor(role, k)} hitSlop={4}
                    accessibilityRole="radio" accessibilityState={{ selected: sel }} accessibilityLabel={`${t.colors.roles[role]}: ${LED_NAMES[k][lang]}`}
                    style={[styles.sw, { backgroundColor: hex(k) }, sel && styles.swSel]}
                  />
                );
              })}
            </ScrollView>
          </View>
        ))}

        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <Button label={t.colors.restore} onPress={() => setColors(DEFAULT_COLORS)} disabled={same(colors, DEFAULT_COLORS)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#161616' },
  body: { paddingHorizontal: 16, paddingBottom: 48 },
  preview: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: UI.line, marginTop: 4 },
  pvCur: { backgroundColor: UI.bg, alignItems: 'center', paddingVertical: 14 },
  pvNext: { backgroundColor: UI.panel, alignItems: 'center', paddingVertical: 8 },
  pvDeck: { backgroundColor: UI.deck, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 },
  pvText: { fontFamily: FONT.display, fontVariant: ['tabular-nums'], includeFontPadding: false },
  pvPlay: { width: 40, height: 40, borderRadius: 20 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  preset: { flexGrow: 1, flexBasis: 100, padding: 12, borderRadius: 14, backgroundColor: '#202020', borderWidth: 2, borderColor: 'transparent', gap: 8 },
  presetSel: { borderColor: '#F2F2F2' },
  presetDots: { flexDirection: 'row', gap: 5 },
  presetName: { color: UI.text, fontFamily: FONT.label, fontSize: 18, lineHeight: 20 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  role: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line, gap: 10 },
  roleName: { fontFamily: FONT.label, fontSize: 20, lineHeight: 22, letterSpacing: 0.5 },
  swRow: { gap: 10, paddingRight: 8 },
  sw: { width: 34, height: 34, borderRadius: 17 },
  swSel: { borderWidth: 3, borderColor: '#FFFFFF' },
});
