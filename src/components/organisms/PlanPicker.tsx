import { StyleSheet, Text, View } from 'react-native';
import { Field, Row, Segmented, Stepper } from '@/components/molecules';
import { clampSet, MOVES, PRESETS, type Move, type MurphPlan } from '@/core/murph';
import { UI } from '@/theme/palette';

export interface PlanLabels { plan: string; planHint: string; planNone: string; planR20: string; planR10: string; planCustom: string; setOf: string; pu: string; ps: string; sq: string }

const presetOf = (p: MurphPlan) => PRESETS.find((x) => JSON.stringify(x.plan) === JSON.stringify(p))?.id ?? 'custom';

/**
 * Como o aluno vai dividir o bloco do Murph: sem quebra, 20 × 5-10-15, 10 × 10-20-30
 * ou personalizado (tamanho da série de cada movimento). `summary` vem pronto de quem usa.
 */
export function PlanPicker({ value, onChange, labels, summary }: { value: MurphPlan; onChange: (p: MurphPlan) => void; labels: PlanLabels; summary: string[] }) {
  const L = labels;
  const preset = presetOf(value);
  const pick = (id: string) => {
    if (id === 'custom') onChange(value ?? { pu: 20, ps: 20, sq: 20 });
    else onChange(PRESETS.find((p) => p.id === id)!.plan);
  };
  const step = (m: Move, d: number) => {
    const cur = value ?? { pu: 20, ps: 20, sq: 20 };
    const by = cur[m] >= 20 ? 5 : 1;
    onChange({ ...cur, [m]: clampSet(m, cur[m] + d * by) });
  };
  return (
    <View>
      <Field label={L.plan} hint={L.planHint}>
        <Segmented value={preset} onChange={pick} options={[
          { value: 'none', label: L.planNone }, { value: 'r20', label: L.planR20 }, { value: 'r10', label: L.planR10 }, { value: 'custom', label: L.planCustom },
        ]} />
      </Field>
      {preset === 'custom' && value && MOVES.map((m) => (
        <Row key={m} label={L[m]} hint={L.setOf} right={<Stepper display={String(value[m])} label={`${L.setOf} ${L[m]}`} onStep={(d) => step(m, d)} />} />
      ))}
      <View style={s.summary}>
        {summary.map((line, i) => <Text key={i} style={i === summary.length - 1 ? s.note : s.line}>{line}</Text>)}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  summary: { backgroundColor: '#161616', borderRadius: 12, padding: 12, gap: 4, marginTop: 10 },
  line: { color: UI.text, fontSize: 15, fontWeight: '600' },
  note: { color: UI.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
});
