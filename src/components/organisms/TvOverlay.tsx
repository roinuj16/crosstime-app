import { Pressable, StyleSheet, View } from 'react-native';
import { Hint, KeyCap, LedText } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

/** Tela de entrada do modo TV: o navegador só libera o som depois de um toque ou tecla. */
export function TvOverlay({ title, hint, size, onStart }: { title: string; hint: string; size: number; onStart: () => void }) {
  return (
    <Pressable style={s.back} onPress={onStart} accessibilityRole="button" accessibilityLabel={title}>
      <View style={[s.box, { padding: size, gap: size * 0.5, borderRadius: size * 0.5 }]}>
        <KeyCap label="OK" size={size * 0.9} />
        <LedText size={size * 1.4} trim="label" color={LED.verde} tracking={2} style={s.center}>{title.toUpperCase()}</LedText>
        <Hint style={[s.center, { fontSize: size * 0.55, maxWidth: size * 22 }]}>{hint}</Hint>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  back: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.82)', alignItems: 'center', justifyContent: 'center' },
  box: { backgroundColor: UI.panel, alignItems: 'center', borderWidth: 1, borderColor: UI.line },
  center: { textAlign: 'center' },
});
