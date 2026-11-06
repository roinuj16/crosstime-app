import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LedText } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

/**
 * Esqueleto das telas de entrada (e-mail, página do link): marca do CronoBox em cima,
 * o conteúdo numa coluna estreita no meio e um rodapé (link da privacidade).
 */
export function AuthTemplate({ tagline, children, footer }: { tagline?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.col}>
            <View style={s.brand}>
              <LedText variant="display" size={64} trim="digits" color={LED.verde} tracking={2} glow={LED.verde}>CRONOBOX</LedText>
              {!!tagline && <Text style={s.tagline}>{tagline}</Text>}
            </View>
            {children}
          </View>
          {footer && <View style={s.footer}>{footer}</View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg },
  fill: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 32 },
  col: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: 8 },
  brand: { alignItems: 'center', gap: 10, marginBottom: 24 },
  tagline: { color: UI.muted, fontSize: 15, textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: 28 },
});
