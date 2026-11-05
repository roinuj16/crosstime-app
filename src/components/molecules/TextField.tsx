import { StyleSheet, Text, TextInput, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

/** Campo de texto com rótulo e explicação (uma linha ou várias). */
export function TextField({ label, hint, value, onChange, placeholder, multiline, maxLength = 60 }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; maxLength?: number;
}) {
  return (
    <View style={s.field}>
      <LedText size={21} trim="label" color={UI.text} tracking={0.5}>{label}</LedText>
      {!!hint && <Text style={s.hint}>{hint}</Text>}
      <TextInput
        value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={UI.muted}
        multiline={multiline} maxLength={maxLength} accessibilityLabel={label}
        style={[s.input, multiline && s.multi]} textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const s = StyleSheet.create({
  field: { paddingVertical: 13, gap: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  hint: { color: UI.muted, fontSize: 12.5 },
  input: { backgroundColor: UI.bg, borderWidth: 1, borderColor: UI.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: UI.text, fontSize: 16 },
  multi: { minHeight: 120 },
});
