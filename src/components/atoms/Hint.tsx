import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { UI } from '@/theme/palette';

/** Texto de apoio em cinza (explicações curtas, listas vazias). */
export function Hint({ children, small, style }: { children: React.ReactNode; small?: boolean; style?: StyleProp<TextStyle> }) {
  return <Text style={[small ? s.small : s.text, style]}>{children}</Text>;
}

const s = StyleSheet.create({
  text: { color: UI.muted, fontSize: 14 },
  small: { color: UI.muted, fontSize: 12.5 },
});
