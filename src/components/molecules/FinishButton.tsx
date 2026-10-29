import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { LedText } from '@/components/atoms';

/** Bandeira de "Terminei" do For Time: fecha o treino na hora. */
export function FinishButton({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable style={s.wrap} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={[s.icon, { borderColor: color }]}><Ionicons name="flag" size={26} color={color} /></View>
      <LedText size={15} color={color} tracking={1} style={s.label}>{label.toUpperCase()}</LedText>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', width: 100, gap: 6 },
  icon: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  label: { textAlign: 'center' },
});
