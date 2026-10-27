/** Peças de interface compartilhadas pelas telas de edição, ajustes, cores e treinos. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View, type ViewStyle } from 'react-native';
import { FONT } from '@/theme/type';
import { LED, UI } from '@/theme/palette';

const ACCENT = LED.verde;

export function SheetHeader({ title, right, onBack }: { title: string; right?: ReactNode; onBack?: () => void }) {
  return (
    <View style={s.header}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back" style={s.back}>
          <Ionicons name="chevron-back" size={26} color={UI.text} />
        </Pressable>
      )}
      <Text style={s.title} numberOfLines={1}>{title.toUpperCase()}</Text>
      <View style={s.headerRight}>{right}</View>
    </View>
  );
}

export function Button({ label, onPress, kind = 'plain', disabled, style }: {
  label: string; onPress: () => void; kind?: 'plain' | 'primary' | 'danger'; disabled?: boolean; style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={({ pressed }) => [s.btn, kind === 'primary' && s.btnPrimary, kind === 'danger' && s.btnDanger, (pressed || disabled) && { opacity: disabled ? 0.4 : 0.75 }, style]}
    >
      <Text style={[s.btnText, kind === 'primary' && { color: UI.ink }, kind === 'danger' && { color: LED.vermelho }]}>{label}</Text>
    </Pressable>
  );
}

export const Section = ({ title }: { title: string }) => <Text style={s.section}>{title.toUpperCase()}</Text>;

export function Row({ label, hint, right, onPress, disabled, flat }: { label: string; hint?: string; right?: ReactNode; onPress?: () => void; disabled?: boolean; flat?: boolean }) {
  const body = (
    <View style={[s.row, flat && { borderBottomWidth: 0, paddingBottom: 8 }, disabled && { opacity: 0.45 }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.rowLabel}>{label}</Text>
        {!!hint && <Text style={s.rowHint}>{hint}</Text>}
      </View>
      {right}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button">{body}</Pressable> : body;
}

export function Toggle({ value, onChange, label, hint, disabled }: { value: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <Row
      label={label} hint={hint} disabled={disabled}
      right={<Switch value={value} onValueChange={onChange} disabled={disabled} trackColor={{ true: ACCENT, false: '#3A3A3A' }} thumbColor="#F2F2F2" accessibilityLabel={label} />}
    />
  );
}

export function Segmented<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={s.seg} accessibilityRole="radiogroup">
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable key={String(o.value)} onPress={() => onChange(o.value)} accessibilityRole="radio" accessibilityState={{ selected: sel }} style={[s.segItem, sel && s.segSel]}>
            <Text style={[s.segText, sel && { color: UI.ink }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** − valor + com repetição ao segurar. */
export function Stepper({ display, onStep, disabled, label }: { display: string; onStep: (dir: 1 | -1) => void; disabled?: boolean; label: string }) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const latest = useRef(onStep);
  latest.current = onStep; // a repetição sempre usa o valor mais recente
  const stop = () => { if (timer.current) clearInterval(timer.current); timer.current = null; };
  const btn = (dir: 1 | -1) => (
    <Pressable
      disabled={disabled}
      onPress={() => latest.current(dir)}
      onLongPress={() => { stop(); timer.current = setInterval(() => latest.current(dir), 90); }}
      onPressOut={stop}
      delayLongPress={350}
      accessibilityRole="button"
      accessibilityLabel={`${dir > 0 ? '+' : '−'} ${label}`}
      style={({ pressed }) => [s.stepBtn, (pressed || disabled) && { opacity: disabled ? 0.35 : 0.7 }]}
    >
      <Ionicons name={dir > 0 ? 'add' : 'remove'} size={22} color={UI.text} />
    </Pressable>
  );
  return (
    <View style={s.stepper}>
      {btn(-1)}
      <Text style={s.stepVal}>{display}</Text>
      {btn(1)}
    </View>
  );
}

export const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  back: { marginLeft: -6 },
  title: { flex: 1, fontFamily: FONT.display, fontSize: 30, lineHeight: 32, color: UI.text, letterSpacing: 1 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  btn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: '#262626' },
  btnPrimary: { backgroundColor: ACCENT },
  btnDanger: { backgroundColor: 'rgba(255,42,26,0.12)' },
  btnText: { color: UI.text, fontWeight: '600', fontSize: 14 },
  section: { color: UI.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.6, marginTop: 22, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  rowLabel: { fontFamily: FONT.label, fontSize: 21, lineHeight: 23, color: UI.text, letterSpacing: 0.5 },
  rowHint: { color: UI.muted, fontSize: 12.5, marginTop: 1 },
  seg: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  segItem: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#262626' },
  segSel: { backgroundColor: ACCENT },
  segText: { color: UI.text, fontSize: 13.5, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
  stepVal: { minWidth: 70, textAlign: 'center', fontFamily: FONT.display, fontSize: 30, lineHeight: 32, color: UI.text, fontVariant: ['tabular-nums'] },
});
