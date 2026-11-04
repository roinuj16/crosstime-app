import { StyleSheet, Text, View } from 'react-native';
import { KeyHint } from '@/components/molecules';
import { LED } from '@/theme/palette';

export interface TvHelpItem { keys: string[]; label: string }

/** Rodapé do modo TV: as teclas que valem agora, ou um aviso (ex.: "aperte de novo para zerar"). */
export function TvHelp({ items, warning, size }: { items: TvHelpItem[]; warning?: string | null; size: number }) {
  return (
    <View style={[s.row, { gap: size * 1.6, minHeight: size * 1.8 }]}>
      {warning
        ? <Text style={[s.warning, { fontSize: size * 1.1 }]}>{warning}</Text>
        : items.map((it) => <KeyHint key={it.label} keys={it.keys} label={it.label} size={size} />)}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' },
  warning: { color: LED.vermelho, fontWeight: '700' },
});
