import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { BoxLogo, LedText } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

/** Topo da TV: logo e nome do box (ou "box · treino") à esquerda; à direita, a hora ou um aviso. */
export function TvHeader({ logo, title, right, u, strong }: { logo?: string; title: string; right?: ReactNode; u: number; strong?: boolean }) {
  return (
    <View style={[s.bar, { paddingHorizontal: 48 * u, gap: 14 * u }]}>
      <View style={[s.left, { gap: 14 * u }]}>
        {!!logo && <BoxLogo uri={logo} size={44 * u} />}
        <LedText size={30 * u} variant="display" trim="label" tracking={u} color={strong ? UI.text : UI.muted} numberOfLines={1} style={s.title}>{title.toUpperCase()}</LedText>
      </View>
      {right}
    </View>
  );
}

/** Relógio do dia para o canto do topo. */
export function TvClock({ time, u }: { time: string; u: number }) {
  return <LedText size={34 * u} variant="display" tabular trim="digits" color={UI.muted}>{time}</LedText>;
}

/** Nome do coach no topo, à esquerda da hora. A bolinha verde aparece com o celular dele conectado. */
export function TvCoach({ name, online, u }: { name: string; online: boolean; u: number }) {
  return (
    <View style={[s.coach, { gap: 10 * u }]}>
      {online && <View style={{ width: 10 * u, height: 10 * u, borderRadius: 5 * u, backgroundColor: LED.verde }} />}
      <LedText size={28 * u} variant="label" trim="label" tracking={u} color={UI.text} numberOfLines={1}>{name.toUpperCase()}</LedText>
    </View>
  );
}

const s = StyleSheet.create({
  coach: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  title: { flexShrink: 1 },
});
