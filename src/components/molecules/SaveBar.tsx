import { StyleSheet, TextInput, View } from 'react-native';
import { Button } from '@/components/atoms';
import { UI } from '@/theme/palette';

/** Campo de nome com o botão de salvar ao lado (quebra para baixo em tela estreita). */
export function SaveBar({ value, onChange, placeholder, label, onSave }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; onSave: () => void }) {
  return (
    <View style={s.bar}>
      <TextInput
        value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={UI.muted}
        style={s.input} maxLength={40} returnKeyType="done" onSubmitEditing={onSave} accessibilityLabel={placeholder}
      />
      <Button label={label} onPress={onSave} />
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20, alignItems: 'center' },
  input: { flexGrow: 1, flexBasis: 180, minWidth: 0, backgroundColor: UI.bg, borderWidth: 1, borderColor: UI.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: UI.text, fontSize: 15 },
});
