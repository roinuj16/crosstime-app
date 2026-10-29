import { StyleSheet, Text } from 'react-native';
import { UI } from '@/theme/palette';

/** Caixa de aviso: `info` chama atenção (ex.: edição travada); `help` explica algo em cinza. */
export function Note({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'help' }) {
  return <Text style={s[variant]}>{children}</Text>;
}

const s = StyleSheet.create({
  info: { color: UI.text, backgroundColor: '#262626', borderRadius: 10, padding: 10, marginVertical: 8, fontSize: 13.5 },
  help: { color: UI.muted, fontSize: 13, lineHeight: 19, backgroundColor: '#202020', borderRadius: 10, padding: 12, marginTop: 20 },
});
