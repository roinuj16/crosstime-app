import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

/** Cabeçalho das telas em folha: voltar (opcional), título e ações à direita. */
export function SheetHeader({ title, right, onBack }: { title: string; right?: ReactNode; onBack?: () => void }) {
  return (
    <View style={s.header}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back" style={s.back}>
          <Ionicons name="chevron-back" size={26} color={UI.text} />
        </Pressable>
      )}
      <LedText variant="display" size={30} trim="label" color={UI.text} tracking={1} style={s.title} numberOfLines={1}>{title.toUpperCase()}</LedText>
      <View style={s.right}>{right}</View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  back: { marginLeft: -6 },
  title: { flex: 1 },
  right: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
