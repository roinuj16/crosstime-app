import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { UI } from '@/theme/palette';

/**
 * Esqueleto do modo TV (16:9). Muitas TVs cortam as bordas da imagem (overscan),
 * então tudo fica dentro de uma margem de ~4%.
 * topo → [relógio grande | coluna da direita] → rodapé com as teclas; `overlay` por cima.
 */
export function TvTemplate({ top, main, side, footer, overlay }: { top: ReactNode; main: ReactNode; side: ReactNode; footer: ReactNode; overlay?: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const padX = Math.round(width * 0.035), padY = Math.round(height * 0.04);
  return (
    <View style={[s.root, { paddingHorizontal: padX, paddingVertical: padY, gap: height * 0.02 }]}>
      {top}
      <View style={[s.body, { gap: width * 0.015 }]}>
        <View style={s.main}>{main}</View>
        <View style={s.side}>{side}</View>
      </View>
      {footer}
      {overlay}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, borderRadius: 18, overflow: 'hidden' },
  side: { width: '30%', borderRadius: 18, overflow: 'hidden', backgroundColor: UI.deck },
});
