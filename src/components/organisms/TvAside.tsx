import { StyleSheet, Text, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { WodList, type WodItem } from '@/components/molecules';
import { LED, UI } from '@/theme/palette';
import { TV } from '@/theme/tv';

const Divider = ({ u }: { u: number }) => <View style={{ width: '70%', height: Math.max(1, u), backgroundColor: TV.line }} />;

/** Coluna da direita com o treino valendo: round, próxima fase e quanto falta. */
export function TvRoundsAside({ round, cycle, next, remaining, labels, u }: {
  round: { n: number; of: number } | null; cycle: { n: number; of: number } | null;
  next: { label: string; time: string; color: string } | null; remaining: string | null;
  labels: { round: string; cycle: string; next: string; remaining: string }; u: number;
}) {
  const blocks = [];
  // só o round (EMOM): número maior, sozinho no meio da coluna
  const k = !next && !remaining ? 1.5 : 1;
  if (round) {
    blocks.push(
      <View key="r" style={s.center}>
        <View style={s.fraction}>
          <LedText size={120 * k * u} variant="display" tabular trim="digits" color={LED.ambar}>{String(round.n)}</LedText>
          <LedText size={60 * k * u} variant="display" tabular trim="digits" color={UI.muted}>/{round.of}</LedText>
        </View>
        <LedText size={28 * k * u} tracking={2 * u} color={UI.text}>{labels.round.toUpperCase()}{cycle ? `  ·  ${labels.cycle.toUpperCase()} ${cycle.n}/${cycle.of}` : ''}</LedText>
      </View>,
    );
  }
  if (next) {
    blocks.push(
      <View key="n" style={[s.center, { gap: 2 * u }]}>
        <LedText size={28 * u} tracking={2 * u} color={next.color} numberOfLines={1}>{`${labels.next} · ${next.label}`.toUpperCase()}</LedText>
        {!!next.time && <LedText size={84 * u} variant="display" tabular trim="digits" color={next.color}>{next.time}</LedText>}
      </View>,
    );
  }
  if (remaining) {
    blocks.push(
      <View key="t" style={s.center}>
        <LedText size={56 * u} variant="display" tabular trim="digits" color={UI.muted}>{remaining}</LedText>
        <LedText size={24 * u} tracking={2 * u} color={UI.muted}>{labels.remaining.toUpperCase()}</LedText>
      </View>,
    );
  }
  return (
    <View style={[s.aside, { paddingVertical: 24 * u }]}>
      {blocks.flatMap((b, i) => (i ? [<Divider key={`d${i}`} u={u} />, b] : [b]))}
    </View>
  );
}

/** Coluna do AMRAP / For Time: o WOD do dia e o contador de rounds (ou só o contador). */
export function TvWodAside({ lines, rounds, labels, u }: { lines: WodItem[]; rounds: number; labels: { wod: string; rounds: string; hint: string }; u: number }) {
  const counter = (
    <View style={s.counter}>
      <View>
        <LedText size={28 * u} tracking={2 * u} color={LED.ambar}>{labels.rounds.toUpperCase()}</LedText>
        <Text style={{ fontSize: 15 * u, color: UI.muted }}>{labels.hint}</Text>
      </View>
      <LedText size={130 * u} variant="display" tabular trim="digits" color={LED.ambar}>{String(rounds)}</LedText>
    </View>
  );
  if (!lines.length) return <View style={[s.aside, { paddingHorizontal: 32 * u }]}>{counter}</View>;
  return (
    <View style={[s.wodAside, { padding: 28 * u, paddingHorizontal: 32 * u, gap: 18 * u }]}>
      <LedText size={28 * u} tracking={2 * u} color={UI.muted}>{labels.wod.toUpperCase()}</LedText>
      <WodList lines={lines} max={44 * u} u={u} />
      <View style={{ height: Math.max(1, u), backgroundColor: TV.line }} />
      {counter}
    </View>
  );
}

/**
 * Coluna da direita com o treino valendo e o WOD cadastrado (EMOM, Tabata, Rounds, cronômetro):
 * em cima os números do treino (round, ciclo, quanto falta), no meio os exercícios e embaixo
 * a próxima fase. A letra do WOD diminui sozinha quando a lista é longa.
 */
export function TvComboAside({ stats, lines, next, wodLabel, u }: {
  stats: { value: string; of?: number; label: string; color: string }[];
  lines: WodItem[];
  next: { label: string; time: string; color: string } | null;
  wodLabel: string; u: number;
}) {
  const k = stats.length === 1 ? 1.4 : 1; // um número só (EMOM): maior
  const line = { height: Math.max(1, u), backgroundColor: TV.line, alignSelf: 'stretch' as const };
  return (
    <View style={[s.wodAside, { padding: 24 * u, paddingHorizontal: 28 * u, gap: 16 * u }]}>
      {!!stats.length && (
        <View style={s.stats}>
          {stats.map((st, i) => (
            <View key={i} style={s.center}>
              <View style={s.fraction}>
                <LedText size={(st.value.length > 3 ? 54 : 68) * k * u} variant="display" tabular trim="digits" color={st.color}>{st.value}</LedText>
                {st.of != null && <LedText size={36 * k * u} variant="display" tabular trim="digits" color={UI.muted}>/{st.of}</LedText>}
              </View>
              <LedText size={20 * k * u} tracking={1.5 * u} color={UI.muted} numberOfLines={1}>{st.label.toUpperCase()}</LedText>
            </View>
          ))}
        </View>
      )}
      <View style={line} />
      <LedText size={24 * u} tracking={2 * u} color={UI.muted}>{wodLabel.toUpperCase()}</LedText>
      <WodList lines={lines} max={44 * u} u={u} />
      {next && (
        <>
          <View style={line} />
          <View style={s.nextRow}>
            <LedText size={24 * u} tracking={1.5 * u} color={next.color} numberOfLines={1} style={s.shrink}>{`${next.label}`.toUpperCase()}</LedText>
            {!!next.time && <LedText size={48 * u} variant="display" tabular trim="digits" color={next.color}>{next.time}</LedText>}
          </View>
        </>
      )}
    </View>
  );
}

/** Coluna do cronômetro: volta atual, tempo de volta e voltas completas. */
export function TvLapsAside({ lap, completed, next, labels, u }: { lap: number; completed: number; next: { label: string; time: string; color: string }; labels: { lap: string; laps: string }; u: number }) {
  return (
    <View style={[s.aside, { paddingVertical: 24 * u }]}>
      <View style={s.center}>
        <LedText size={120 * u} variant="display" tabular trim="digits" color={LED.ambar}>{String(lap)}</LedText>
        <LedText size={28 * u} tracking={2 * u} color={UI.text}>{labels.lap.toUpperCase()}</LedText>
      </View>
      <Divider u={u} />
      <View style={s.center}>
        <LedText size={28 * u} tracking={2 * u} color={next.color}>{next.label.toUpperCase()}</LedText>
        <LedText size={84 * u} variant="display" tabular trim="digits" color={next.color}>{next.time}</LedText>
      </View>
      <Divider u={u} />
      <View style={s.center}>
        <LedText size={56 * u} variant="display" tabular trim="digits" color={UI.muted}>{String(completed)}</LedText>
        <LedText size={24 * u} tracking={2 * u} color={UI.muted}>{labels.laps.toUpperCase()}</LedText>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  aside: { flex: 1, backgroundColor: TV.aside, alignItems: 'center', justifyContent: 'space-evenly' },
  wodAside: { flex: 1, backgroundColor: TV.aside },
  center: { alignItems: 'center' },
  fraction: { flexDirection: 'row', alignItems: 'flex-end' },
  counter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch' },
  fill: { flex: 1 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', alignSelf: 'stretch' },
  nextRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, alignSelf: 'stretch' },
  shrink: { flexShrink: 1 },
});
