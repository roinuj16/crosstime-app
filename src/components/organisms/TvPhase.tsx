import { StyleSheet, View } from 'react-native';
import { LedText, ProgressBar } from '@/components/atoms';

/** O relógio gigante da TV: nome da fase, tempo e a barra de progresso da fase. */
export function TvPhase({ label, time, color, glow, timeGlow, progress, size, dim, u }: {
  label: string; time: string; color: string; glow: string; timeGlow: string; progress: number; size: number; dim?: boolean; u: number;
}) {
  return (
    <View style={[s.wrap, { paddingHorizontal: 32 * u }]} accessibilityLiveRegion="polite">
      <LedText size={size * 0.27} variant="display" trim="label" tracking={4 * u} color={color} glow={glow} glowRadius={30 * u} numberOfLines={1}>{label.toUpperCase()}</LedText>
      <LedText size={size} variant="display" tabular trim="digits" color={color} glow={timeGlow} glowRadius={60 * u}
        style={[{ marginTop: 18 * u }, dim && { opacity: 0.45 }]} numberOfLines={1}>{time}</LedText>
      <View style={[s.bar, { marginTop: 34 * u }]}>
        <ProgressBar progress={progress} color={color} height={14 * u} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bar: { width: '100%', alignItems: 'center' },
});
