import { StyleSheet, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { glow, hex, UI, type ColorRole, type ColorScheme } from '@/theme/palette';

/** Mini placar: mostra como as cores escolhidas ficam na tela do timer. */
export function ColorPreview({ colors, workLabel, restLabel, accessibilityLabel }: { colors: ColorScheme; workLabel: string; restLabel: string; accessibilityLabel: string }) {
  const led = (role: ColorRole) => ({ color: hex(colors[role]), glow: glow(colors[role], 0.55), glowRadius: 10 });
  return (
    <View style={s.preview} accessible accessibilityLabel={accessibilityLabel}>
      <View style={s.cur}>
        <LedText variant="display" tabular size={18} trim="label" {...led('work')}>{workLabel.toUpperCase()}</LedText>
        <LedText variant="display" tabular size={56} trim="digits" {...led('work')}>00:24</LedText>
      </View>
      <View style={s.next}>
        <LedText variant="display" tabular size={13} trim="label" {...led('rest')}>{restLabel.toUpperCase()}</LedText>
        <LedText variant="display" tabular size={30} trim="digits" {...led('rest')}>00:15</LedText>
      </View>
      <View style={s.deck}>
        <LedText variant="display" tabular size={30} trim="digits" {...led('rounds')}>3</LedText>
        <View style={[s.play, { backgroundColor: hex(colors.work) }]} />
        <LedText variant="display" tabular size={30} trim="digits" {...led('cycles')}>2</LedText>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  preview: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: UI.line, marginTop: 4 },
  cur: { backgroundColor: UI.bg, alignItems: 'center', paddingVertical: 14 },
  next: { backgroundColor: UI.panel, alignItems: 'center', paddingVertical: 8 },
  deck: { backgroundColor: UI.deck, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 },
  play: { width: 40, height: 40, borderRadius: 20 },
});
