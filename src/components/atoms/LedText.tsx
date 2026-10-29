import { StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { FONT, teko } from '@/theme/type';

export interface LedTextProps extends Omit<TextProps, 'style'> {
  /** tamanho da fonte */
  size: number;
  /** display = Teko SemiBold (números, títulos); label = Teko Medium (rótulos) */
  variant?: 'display' | 'label';
  /**
   * Corta o espaço vazio da Teko sem cortar as letras no iPhone (veja theme/type.ts):
   * 'digits' só números; 'label' texto com acento; false = linha natural da fonte.
   */
  trim?: 'digits' | 'label' | false;
  /** números de largura fixa (o relógio não "dança") */
  tabular?: boolean;
  color?: string;
  /** brilho de LED em volta do texto */
  glow?: string;
  glowRadius?: number;
  tracking?: number;
  style?: StyleProp<TextStyle>;
}

/** Átomo base do placar: texto na fonte Teko, com o brilho de LED opcional. */
export function LedText({ size, variant = 'label', trim = false, tabular, color, glow, glowRadius = 12, tracking, style, ...rest }: LedTextProps) {
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: variant === 'display' ? FONT.display : FONT.label },
        tabular && s.tabular,
        trim ? [teko(size, trim), s.noPad] : { fontSize: size },
        color != null && { color },
        glow != null && { textShadowColor: glow, textShadowRadius: glowRadius },
        tracking != null && { letterSpacing: tracking },
        style,
      ]}
    />
  );
}

const s = StyleSheet.create({
  tabular: { fontVariant: ['tabular-nums'] },
  noPad: { includeFontPadding: false },
});
