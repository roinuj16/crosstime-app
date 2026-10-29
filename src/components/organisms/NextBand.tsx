import { Pressable, StyleSheet } from 'react-native';
import { LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

export interface NextBandProps {
  label: string;
  time?: string;
  color: string;
  glow: string;
  timeGlow: string;
  size: number;
  /** contador de rounds (número um pouco maior) */
  counting?: boolean;
  /** dica no canto: "PULAR ›" ou "+1" */
  hint?: string | null;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
  /** altura da faixa (padrão: 20% da tela) */
  height?: `${number}%` | number;
}

/** Faixa do meio: a próxima fase (toque para pular) ou o contador de rounds (toque +1, segure −1). */
export function NextBand({ label, time, color, glow, timeGlow, size, counting, hint, onPress, onLongPress, accessibilityLabel, height }: NextBandProps) {
  const active = !!onPress;
  const timeSize = counting ? size * 1.15 : size;
  return (
    <Pressable
      style={({ pressed }) => [s.band, height != null && { height }, pressed && active && { backgroundColor: '#262626' }]}
      disabled={!active}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={active ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <LedText size={size * 0.36} color={color} glow={glow} glowRadius={12} tracking={1.5} numberOfLines={1}>{label.toUpperCase()}</LedText>
      {!!time && <LedText variant="display" tabular size={timeSize} trim="digits" color={color} glow={timeGlow} glowRadius={16}>{time}</LedText>}
      {!!hint && <LedText size={18} color={UI.muted} tracking={1} style={s.hint}>{hint}</LedText>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  band: { height: '20%', backgroundColor: UI.panel, alignItems: 'center', justifyContent: 'center' },
  hint: { position: 'absolute', right: 16, bottom: 10 },
});
