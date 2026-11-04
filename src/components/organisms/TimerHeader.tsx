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
  /** bolinha no ícone da TV: cor do status da conexão (sem bolinha = sem TV) */
  tvBadge?: string;
  labels: { settings: string; workouts: string; tv: string; reset: string; edit: string };
  onSettings: () => void;
  onWorkouts: () => void;
  onTv: () => void;
  onReset: () => void;
  onEdit: () => void;
}

const ICON = 40;

/** Topo da tela do timer: ajustes, treinos e TV à esquerda, modo e total no meio, zerar e editar à direita. */
export function TimerHeader({ color, title, time, canReset, tvBadge, labels, onSettings, onWorkouts, onTv, onReset, onEdit }: TimerHeaderProps) {
  return (
    <View style={s.header}>
      <View style={s.side}>
        <IconButton name="settings-outline" color={color} label={labels.settings} onPress={onSettings} width={ICON} />
        <IconButton name="list" color={color} label={labels.workouts} onPress={onWorkouts} width={ICON} />
        <IconButton name={tvBadge ? 'tv' : 'tv-outline'} color={color} label={labels.tv} onPress={onTv} width={ICON} badge={tvBadge} />
      </View>
      <Pressable style={s.center} onPress={onEdit} accessibilityRole="button" accessibilityLabel={labels.edit}>
        <LedText size={18} trim="label" color={color} tracking={1.5} numberOfLines={1}>{title.toUpperCase()}</LedText>
        <LedText variant="display" tabular size={26} trim="digits" color={color} numberOfLines={1}>{time}</LedText>
      </Pressable>
      <View style={[s.side, { justifyContent: 'flex-end' }]}>
        <IconButton name="refresh" color={canReset ? color : UI.line} label={labels.reset} onPress={onReset} disabled={!canReset} width={ICON} />
        <IconButton name="timer-outline" color={color} label={labels.edit} onPress={onEdit} width={ICON} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 },
  side: { flexDirection: 'row', width: ICON * 3 },
  center: { flex: 1, alignItems: 'center', minWidth: 0 },
});
