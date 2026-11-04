import { View } from 'react-native';
import { TV } from '@/theme/tv';

/** Barra de progresso da fase (0 a 1). */
export function ProgressBar({ progress, color, height, width = '86%' }: { progress: number; color: string; height: number; width?: `${number}%` | number }) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width, height, borderRadius: height / 2, backgroundColor: TV.track, overflow: 'hidden' }}
      accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}>
      <View style={{ width: `${p * 100}%`, height: '100%', backgroundColor: color }} />
    </View>
  );
}
