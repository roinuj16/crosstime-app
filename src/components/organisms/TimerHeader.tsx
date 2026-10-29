import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

export interface TimerHeaderProps {
  color: string;
  /** nome do modo ou do treino carregado */
  title: string;
  /** duração total do treino */
  time: string;
  canReset: boolean;
  labels: { settings: string; workouts: string; reset: string; edit: string };
  onSettings: () => void;
  onWorkouts: () => void;
  onReset: () => void;
  onEdit: () => void;
}

/** Topo da tela do timer: ajustes e treinos à esquerda, modo e total no meio, zerar e editar à direita. */
export function TimerHeader({ color, title, time, canReset, labels, onSettings, onWorkouts, onReset, onEdit }: TimerHeaderProps) {
  return (
    <View style={s.header}>
      <View style={s.side}>
        <IconButton name="settings-outline" color={color} label={labels.settings} onPress={onSettings} />
        <IconButton name="list" color={color} label={labels.workouts} onPress={onWorkouts} />
      </View>
      <Pressable style={s.center} onPress={onEdit} accessibilityRole="button" accessibilityLabel={labels.edit}>
        <LedText size={18} trim="label" color={color} tracking={1.5} numberOfLines={1}>{title.toUpperCase()}</LedText>
        <LedText variant="display" tabular size={26} trim="digits" color={color}>{time}</LedText>
      </Pressable>
      <View style={[s.side, { justifyContent: 'flex-end' }]}>
        <IconButton name="refresh" color={canReset ? color : UI.line} label={labels.reset} onPress={onReset} disabled={!canReset} />
        <IconButton name="timer-outline" color={color} label={labels.edit} onPress={onEdit} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  side: { flexDirection: 'row', width: 96 },
  center: { flex: 1, alignItems: 'center' },
});
