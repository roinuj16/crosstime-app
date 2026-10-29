import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, SectionTitle } from '@/components/atoms';
import { ColorRow, PresetCard } from '@/components/molecules';
import { ColorPreview } from '@/components/organisms';
import { SheetTemplate } from '@/components/templates';
import { useStrings } from '@/hooks/useStrings';
import { useApp } from '@/store/useApp';
import { DEFAULT_COLORS, hex, LED_KEYS, LED_NAMES, PRESETS, type ColorRole, type ColorScheme } from '@/theme/palette';

const ROLES: ColorRole[] = ['prepare', 'work', 'rest', 'restBC', 'cooldown', 'run', 'lap', 'rounds', 'cycles'];
const PREVIEW_ROLES: ColorRole[] = ['prepare', 'work', 'rest', 'cooldown'];

/** Página de cores: prévia do placar, combinações prontas e a cor de cada fase. */
export default function ColorsScreen() {
  const { t, lang } = useStrings();
  const colors = useApp((s) => s.colors);
  const setColor = useApp((s) => s.setColor);
  const setColors = useApp((s) => s.setColors);
  const same = (a: ColorScheme, b: ColorScheme) => ROLES.every((r) => a[r] === b[r]);
  const options = LED_KEYS.map((k) => ({ key: k, hex: hex(k), name: LED_NAMES[k][lang] }));

  return (
    <SheetTemplate title={t.colors.title} onBack={() => router.back()} right={<Button label={t.settings.done} kind="primary" onPress={() => router.back()} />}>
      <ColorPreview colors={colors} workLabel={t.phases.work} restLabel={t.phases.rest} accessibilityLabel={t.colors.preview} />

      <SectionTitle title={t.colors.presets} />
      <View style={s.presets}>
        {Object.entries(PRESETS).map(([id, p]) => (
          <PresetCard key={id} name={p.name[lang]} colors={PREVIEW_ROLES.map((r) => hex(p.colors[r]))} selected={same(p.colors, colors)} onPress={() => setColors(p.colors)} />
        ))}
      </View>

      <SectionTitle title={t.colors.perPhase} />
      {ROLES.map((role) => (
        <ColorRow key={role} label={t.colors.roles[role]} color={hex(colors[role])} options={options} value={colors[role]} onChange={(k) => setColor(role, k)} />
      ))}

      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <Button label={t.colors.restore} onPress={() => setColors(DEFAULT_COLORS)} disabled={same(colors, DEFAULT_COLORS)} />
      </View>
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
});
