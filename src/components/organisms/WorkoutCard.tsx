import { StyleSheet, Text, View } from 'react-native';
import { Button, LedText, Tag } from '@/components/atoms';
import { UI } from '@/theme/palette';

export interface WorkoutCardProps {
  name: string;
  mode: string;
  /** etiqueta "Exemplo" nos treinos que vêm com o app */
  example?: string;
  description: string;
  /** duração total (vazio quando não se aplica) */
  total?: string;
  totalColor: string;
  labels: { use: string; delete: string };
  onUse: () => void;
  onDelete: () => void;
}

/** Cartão de um treino salvo: nome, modo, resumo, duração e as ações Usar/Apagar. */
export function WorkoutCard({ name, mode, example, description, total, totalColor, labels, onUse, onDelete }: WorkoutCardProps) {
  return (
    <View style={s.card}>
      <View style={s.top}>
        <View style={s.text}>
          <Text style={s.name} numberOfLines={2}>{name}</Text>
          <View style={s.tags}>
            <Tag label={mode.toUpperCase()} />
            {!!example && <Tag label={example.toUpperCase()} variant="dashed" />}
          </View>
          <Text style={s.desc}>{description}</Text>
        </View>
        {!!total && <LedText variant="display" tabular size={30} trim="digits" color={totalColor}>{total}</LedText>}
      </View>
      <View style={s.actions}>
        <Button label={labels.use} kind="primary" onPress={onUse} />
        <Button label={labels.delete} kind="danger" onPress={onDelete} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#202020', borderRadius: 14, padding: 14, marginTop: 10, gap: 12 },
  top: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  text: { flex: 1, minWidth: 0 },
  name: { color: UI.text, fontSize: 16, fontWeight: '700' },
  tags: { flexDirection: 'row', gap: 6, marginTop: 6 },
  desc: { color: UI.muted, fontSize: 13, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8 },
});
