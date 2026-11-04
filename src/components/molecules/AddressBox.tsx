import { StyleSheet, View } from 'react-native';
import { Button, LedText } from '@/components/atoms';
import { LED } from '@/theme/palette';

/** Endereço em letras grandes, fácil de ler e digitar no controle da TV, com um botão de enviar. */
export function AddressBox({ address, action, onAction }: { address: string; action: string; onAction: () => void }) {
  return (
    <View style={s.box}>
      <LedText size={26} trim="label" color={LED.verde} tracking={0.5} selectable>{address}</LedText>
      <Button label={action} onPress={onAction} style={s.btn} />
    </View>
  );
}

const s = StyleSheet.create({
  box: { backgroundColor: '#0B0B0B', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', padding: 12, gap: 10, alignItems: 'flex-start' },
  btn: { alignSelf: 'flex-start' },
});
