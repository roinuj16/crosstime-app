import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { FONT } from '@/theme/type';
import { UI } from '@/theme/palette';

interface Props {
  color: string;
  glow: string;
  progress: number;
  running: boolean;
  label: string;
  onPress: () => void;
  size?: number;
}

/** Botão redondo com anel de progresso da fase, no estilo do relógio do box. */
export function PlayButton({ color, glow, progress, running, label, onPress, size = 120 }: Props) {
  const r = 47;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [{ width: size, height: size, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
      >
        <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
          <Circle cx={50} cy={50} r={r} stroke="#2E2E2E" strokeWidth={4} fill="none" />
          {p > 0.005 && (
            <Circle
              cx={50} cy={50} r={r} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round"
              strokeDasharray={`${c * p} ${c}`} transform="rotate(-90 50 50)"
            />
          )}
        </Svg>
        <View style={[styles.core, { backgroundColor: color, shadowColor: color }]}>
          <Ionicons name={running ? 'pause' : 'play'} size={size * 0.34} color={UI.ink} style={running ? undefined : { marginLeft: size * 0.04 }} />
        </View>
      </Pressable>
      <Text style={[styles.label, { color, textShadowColor: glow }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  core: {
    position: 'absolute', top: '12%', left: '12%', right: '12%', bottom: '12%', borderRadius: 999,
    alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 6,
  },
  label: { fontFamily: FONT.label, fontSize: 24, letterSpacing: 1.5, textShadowRadius: 10 },
});
