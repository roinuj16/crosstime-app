import { StyleSheet, View } from 'react-native';
import { IconButton, LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

/** Topo do modo TV: o treino à esquerda; o total, a hora e o botão de sair à direita. */
export function TvTopBar({ title, time, clock, color, size, exitLabel, onExit }: {
  title: string; time: string; clock: string; color: string; size: number; exitLabel: string; onExit: () => void;
}) {
  return (
    <View style={s.bar}>
      <LedText size={size} trim="label" color={color} tracking={2} numberOfLines={1} style={s.title}>{title.toUpperCase()}</LedText>
      <View style={[s.right, { gap: size * 0.8 }]}>
        <LedText variant="display" tabular size={size} trim="digits" color={color}>{time}</LedText>
        <LedText variant="display" tabular size={size} trim="digits" color={UI.muted}>{clock}</LedText>
        <IconButton name="close" color={UI.muted} label={exitLabel} onPress={onExit} size={size * 0.6} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center' },
});
