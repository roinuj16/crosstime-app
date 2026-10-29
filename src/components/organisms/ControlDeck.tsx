import { StyleSheet, View } from 'react-native';
import { FinishButton, PlayButton, Stat, type PlayButtonProps } from '@/components/molecules';
import { UI } from '@/theme/palette';

type StatSlot = { stat: { value: number; label: string } | null; color: string };

export interface ControlDeckProps {
  left: StatSlot;
  /** um número (ex.: ciclos restantes) ou o botão "Terminei" do For Time */
  right: StatSlot | { finish: { label: string; color: string; onPress: () => void } };
  play: PlayButtonProps;
  /** deitado: os dois números em cima e o play embaixo, ocupando a coluna da direita */
  vertical?: boolean;
}

/** Painel de controle: um número de cada lado e o botão de play. */
export function ControlDeck({ left, right, play, vertical }: ControlDeckProps) {
  const l = <Stat stat={left.stat} color={left.color} />;
  const r = 'finish' in right ? <FinishButton {...right.finish} /> : <Stat stat={right.stat} color={right.color} />;
  if (vertical) {
    // deitado: números menores, e um lado vazio (ex.: AMRAP, For Time) não ocupa lugar
    const lv = left.stat ? <Stat stat={left.stat} color={left.color} size={48} /> : null;
    const rv = 'finish' in right ? r : right.stat ? <Stat stat={right.stat} color={right.color} size={48} /> : null;
    return (
      <View style={s.column}>
        {(lv || rv) && <View style={s.stats}>{lv}{rv}</View>}
        <PlayButton {...play} />
      </View>
    );
  }
  return (
    <View style={s.deck}>
      {l}
      <PlayButton {...play} />
      {r}
    </View>
  );
}

const s = StyleSheet.create({
  deck: { height: 190, backgroundColor: UI.deck, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12 },
  column: { flex: 1, backgroundColor: UI.deck, alignItems: 'center', justifyContent: 'space-evenly', paddingVertical: 8 },
  stats: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-around' },
});
