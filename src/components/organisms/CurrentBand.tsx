import { StyleSheet, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

export interface CurrentBandProps {
  label: string;
  time: string;
  color: string;
  glow: string;
  timeGlow: string;
  /** tamanho do relógio; o nome da fase usa 30% dele */
  size: number;
  /** pausado: o relógio fica apagado */
  dim?: boolean;
}

/** Faixa principal do placar: a fase atual e o relógio grande. */
export function CurrentBand({ label, time, color, glow, timeGlow, size, dim }: CurrentBandProps) {
  return (
    <View style={s.band} accessibilityLiveRegion="polite">
      <LedText size={size * 0.3} color={color} glow={glow} glowRadius={18} tracking={2} numberOfLines={1}>{label.toUpperCase()}</LedText>
      <LedText
        variant="display" tabular size={size} trim="digits" color={color} glow={timeGlow} glowRadius={24}
        style={dim && { opacity: 0.45 }} adjustsFontSizeToFit numberOfLines={1}
      >{time}</LedText>
    </View>
  );
}

const s = StyleSheet.create({
  band: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.bg, paddingHorizontal: 12 },
});
