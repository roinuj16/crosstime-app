import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { UI } from '@/theme/palette';
import { TV, tvUnit } from '@/theme/tv';

/**
 * Esqueleto do modo TV (16:9, desenhado em 1280×720):
 * topo (logo, box, treino, hora) → corpo (relógio | coluna da direita) → rodapé com as teclas.
 * Margem de 2% em volta porque muitas TVs cortam a borda da imagem (overscan).
 * `frame`: borda acesa na cor da próxima fase (3 segundos finais).
 */
export function TvTemplate({ header, main, side, footer, overlay, frame, divider, sideWidth }: {
  header: ReactNode; main: ReactNode; side?: ReactNode; footer?: ReactNode; overlay?: ReactNode;
  frame?: string | null; divider?: boolean; sideWidth?: number;
}) {
  const { width, height } = useWindowDimensions();
  const u = tvUnit(width, height);
  const line = Math.max(1, u);
  return (
    <View style={[s.root, { padding: Math.round(Math.min(width, height) * 0.02) }]}>
      <View style={[s.frame, frame ? { borderWidth: 10 * u, borderColor: frame, boxShadow: `inset 0 0 ${80 * u}px ${frame}59` } : { borderWidth: 10 * u, borderColor: 'transparent' }]}>
        <View style={[s.header, { height: 68 * u }, divider && { borderBottomWidth: line, borderBottomColor: TV.line }]}>{header}</View>
        <View style={s.body}>
          <View style={s.main}>{main}</View>
          {side ? <View style={{ width: (sideWidth ?? 330) * u }}>{side}</View> : null}
        </View>
        {footer ? <View style={[s.footer, { minHeight: 56 * u, borderTopWidth: line, borderTopColor: TV.line }]}>{footer}</View> : null}
      </View>
      {overlay}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg },
  frame: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1 },
  footer: { alignItems: 'center', justifyContent: 'center' },
});
