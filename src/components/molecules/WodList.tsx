import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { LedText } from '@/components/atoms';
import { fitWod } from '@/core/tvBoard';
import { UI } from '@/theme/palette';

export interface WodItem { main: string; note: string }

/**
 * O treino do dia, uma linha por movimento; o peso/distância fica menor e cinza.
 * Ocupa o espaço que tiver (flex 1) e ajusta a letra para caber: lista longa fica com letra
 * menor e, se precisar, em duas colunas. Nunca passa da caixa.
 */
export function WodList({ lines, max, min = 18, u }: { lines: WodItem[]; max: number; min?: number; u: number }) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!box || Math.abs(box.w - width) > 1 || Math.abs(box.h - height) > 1) setBox({ w: width, h: height });
  };
  const fit = box ? fitWod(lines, box, max, min * u) : null;
  // a conta é aproximada: depois de desenhar, mede a lista e encolhe o que passar da caixa
  const [k, setK] = useState(1);
  const sig = `${lines.map((l) => l.main + l.note).join('|')}:${box?.w}x${box?.h}`;
  useEffect(() => { setK(1); }, [sig]);
  const onContent = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (box && h > box.h + 1) setK((x) => x * Math.max(0.5, (box.h / h) * 0.98));
  };
  const size = (fit?.size ?? max) * k;
  const cols = fit?.columns ?? 1;
  const perCol = Math.ceil(lines.length / cols);
  const columns = cols === 2 ? [lines.slice(0, perCol), lines.slice(perCol)] : [lines];
  return (
    <View style={[s.box, { opacity: fit ? 1 : 0 }]} onLayout={onLayout} testID="wod-list">
      <View style={[s.cols, { gap: size * 0.8 }]} onLayout={onContent}>
        {columns.map((col, c) => (
          <View key={c} style={[s.col, { gap: size * 0.3 }]}>
            {col.map((l, i) => (
              <View key={i} style={s.line} testID="wod-line">
                <LedText size={size} trim="label" color={UI.text} numberOfLines={1} style={s.shrink}>{l.main}</LedText>
                {!!l.note && <LedText size={size * 0.68} trim="label" color={UI.muted} numberOfLines={1} style={{ marginLeft: size * 0.25 }}>{l.note}</LedText>}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flex: 1, overflow: 'hidden', minHeight: 0 },
  cols: { flexDirection: 'row' },
  col: { flex: 1, minWidth: 0 },
  line: { flexDirection: 'row', alignItems: 'baseline' },
  shrink: { flexShrink: 1 },
});
