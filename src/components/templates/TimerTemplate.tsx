import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UI } from '@/theme/palette';

/**
 * Esqueleto da tela do timer, de cima para baixo:
 * cabeçalho → faixa atual (ocupa o resto) → próxima fase (20%) → painel → abas de modo.
 * `children` fica por cima de tudo (ex.: a lanterna invisível).
 */
export function TimerTemplate({ header, current, next, deck, tabs, children }: {
  header: ReactNode; current: ReactNode; next: ReactNode; deck: ReactNode; tabs: ReactNode; children?: ReactNode;
}) {
  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      {children}
      {header}
      {current}
      {next}
      {deck}
      {tabs}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg },
});
