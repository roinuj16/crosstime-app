import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { Dot } from '@/components/atoms';
import { UI } from '@/theme/palette';
import { Row } from './Row';

/** Linha que abre outra tela (seta à direita), com bolinhas de cor opcionais como prévia. */
export function LinkRow({ label, hint, onPress, dots }: { label: string; hint?: string; onPress: () => void; dots?: string[] }) {
  return (
    <Row
      label={label} hint={hint} onPress={onPress}
      right={
        <View style={s.right}>
          {dots?.map((c, i) => <Dot key={i} color={c} />)}
          <Ionicons name="chevron-forward" size={20} color={UI.muted} />
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
