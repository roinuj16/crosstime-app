import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheetHeader } from '@/components/molecules';

/**
 * Esqueleto das telas em folha (edição, ajustes, cores, vozes, treinos):
 * cabeçalho com título e ações, e a lista rolável embaixo.
 * `keyboard` sobe o conteúdo quando o teclado abre (telas com campos de texto).
 */
export function SheetTemplate({ title, right, onBack, keyboard, children }: {
  title: string; right?: ReactNode; onBack?: () => void; keyboard?: boolean; children: ReactNode;
}) {
  const list = (
    <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps={keyboard ? 'handled' : undefined}>
      {children}
    </ScrollView>
  );
  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <SheetHeader title={title} right={right} onBack={onBack} />
      {keyboard ? <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>{list}</KeyboardAvoidingView> : list}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#161616' },
  fill: { flex: 1 },
  body: { paddingHorizontal: 16, paddingBottom: 48 },
});
