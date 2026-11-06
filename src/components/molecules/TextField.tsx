import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { LedText } from '@/components/atoms';
import { LED, UI } from '@/theme/palette';

/** Campo de texto com rótulo, explicação e erro (uma linha ou várias). */
export function TextField({
  label, hint, value, onChange, placeholder, multiline, maxLength = 60, error, editable = true, onSubmit,
  keyboardType, autoComplete, autoCapitalize, inputMode,
}: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; maxLength?: number;
  /** mensagem em vermelho embaixo do campo */
  error?: string;
  editable?: boolean;
  onSubmit?: () => void;
  keyboardType?: TextInputProps['keyboardType'];
  autoComplete?: TextInputProps['autoComplete'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  inputMode?: TextInputProps['inputMode'];
}) {
  return (
    <View style={s.field}>
      <LedText size={21} trim="label" color={UI.text} tracking={0.5}>{label}</LedText>
      {!!hint && <Text style={s.hint}>{hint}</Text>}
      <TextInput
        value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={UI.muted}
        multiline={multiline} maxLength={maxLength} accessibilityLabel={label} editable={editable}
        keyboardType={keyboardType} autoComplete={autoComplete} autoCapitalize={autoCapitalize} inputMode={inputMode}
        onSubmitEditing={onSubmit} returnKeyType={onSubmit ? 'go' : undefined}
        style={[s.input, multiline && s.multi, !!error && { borderColor: LED.vermelho }, !editable && s.readOnly]} textAlignVertical={multiline ? 'top' : 'center'}
      />
      {!!error && <Text style={s.error} accessibilityLiveRegion="polite">{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  field: { paddingVertical: 13, gap: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  hint: { color: UI.muted, fontSize: 12.5 },
  input: { backgroundColor: UI.bg, borderWidth: 1, borderColor: UI.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: UI.text, fontSize: 16 },
  multi: { minHeight: 120 },
  readOnly: { color: UI.muted },
  error: { color: LED.vermelho, fontSize: 13 },
});
