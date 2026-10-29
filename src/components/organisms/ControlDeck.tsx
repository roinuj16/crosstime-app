import { StyleSheet, View } from 'react-native';
import { FinishButton, PlayButton, Stat, type PlayButtonProps } from '@/components/molecules';
import { UI } from '@/theme/palette';

type StatSlot = { stat: { value: number; label: string } | null; color: string };

export interface ControlDeckProps {
  left: StatSlot;
  /** um número (ex.: ciclos restantes) ou o botão "Terminei" do For Time */
  right: StatSlot | { finish: { label: string; color: string; onPress: () => void } };
  play: PlayButtonProps;
}

/** Painel de baixo: um número de cada lado e o botão de play no meio. */
export function ControlDeck({ left, right, play }: ControlDeckProps) {
  return (
    <View style={s.deck}>
      <Stat stat={left.stat} color={left.color} />
      <PlayButton {...play} />
      {'finish' in right ? <FinishButton {...right.finish} /> : <Stat stat={right.stat} color={right.color} />}
    </View>
  );
}

const s = StyleSheet.create({
  deck: { height: 190, backgroundColor: UI.deck, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12 },
});
