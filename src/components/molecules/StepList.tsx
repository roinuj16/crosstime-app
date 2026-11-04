import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

/** Passo a passo numerado. Cada passo tem um texto e, se precisar, algo embaixo (endereço, botões). */
export function StepList({ steps }: { steps: { text: string; extra?: ReactNode }[] }) {
  return (
    <View style={s.list}>
      {steps.map((st, i) => (
        <View key={i} style={s.step}>
          <View style={s.num}><LedText size={20} trim="digits" color={UI.ink}>{String(i + 1)}</LedText></View>
          <View style={s.body}>
            <Text style={s.text}>{st.text}</Text>
            {st.extra}
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  list: { gap: 16, marginTop: 12 },
  step: { flexDirection: 'row', gap: 12 },
  num: { width: 28, height: 28, borderRadius: 14, backgroundColor: LED.verde, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0, gap: 10 },
  text: { color: UI.text, fontSize: 15, lineHeight: 21 },
});
