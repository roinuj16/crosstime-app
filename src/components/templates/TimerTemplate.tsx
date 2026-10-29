import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UI } from '@/theme/palette';

/**
 * Esqueleto da tela do timer.
 *
 * Em pé, de cima para baixo: cabeçalho → faixa atual (ocupa o resto) → próxima fase → painel → abas.
 * Deitado: cabeçalho em cima e abas embaixo; no meio, à esquerda a faixa atual sobre a
 * próxima fase, e à direita o painel (números e play).
 * `children` fica por cima de tudo (ex.: a lanterna invisível).
 */
export function TimerTemplate({ header, current, next, deck, tabs, landscape, children }: {
  header: ReactNode; current: ReactNode; next: ReactNode; deck: ReactNode; tabs: ReactNode; landscape?: boolean; children?: ReactNode;
}) {
  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom', 'left', 'right']}>
      {children}
      {header}
      {landscape ? (
        <View style={s.body}>
          <View style={s.main}>
            {current}
            {next}
          </View>
          <View style={s.side}>{deck}</View>
        </View>
      ) : (
        <>
          {current}
          {next}
          {deck}
        </>
      )}
      {tabs}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1 },
  side: { width: '34%' },
});
