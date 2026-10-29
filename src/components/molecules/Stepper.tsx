import Ionicons from '@expo/vector-icons/Ionicons';
import { useId, useRef, useState } from 'react';
import { InputAccessoryView, Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputInstance } from 'react-native';
import { Button, LedText } from '@/components/atoms';
import { entryDigits, entryPreview, entryValue, type EntryKind } from '@/core/entry';
import { FONT } from '@/theme/type';
import { LED, UI } from '@/theme/palette';

/** O que o Stepper precisa para deixar a pessoa digitar o valor. */
export type StepperEntry = { kind: EntryKind; onEnter: (value: number) => void; okLabel: string; typeLabel: string };

export interface StepperProps {
  display: string;
  onStep: (dir: 1 | -1) => void;
  disabled?: boolean;
  /** nome do campo, para o leitor de tela */
  label: string;
  entry?: StepperEntry;
}

/** − valor + com repetição ao segurar. Com `entry`, tocar no valor abre o teclado numérico. */
export function Stepper({ display, onStep, disabled, label, entry }: StepperProps) {
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
      style={({ pressed }) => [s.btn, (pressed || disabled) && { opacity: disabled ? 0.35 : 0.7 }]}
    >
      <Ionicons name={dir > 0 ? 'add' : 'remove'} size={22} color={UI.text} />
    </Pressable>
  );
  return (
    <View style={s.stepper}>
      {btn(-1)}
      {entry && !disabled ? <ValueEntry display={display} entry={entry} /> : <StepValue>{display}</StepValue>}
      {btn(1)}
    </View>
  );
}

/** O número do Stepper, no estilo de placar. */
export function StepValue({ children, color = UI.text, size = 30 }: { children: string; color?: string; size?: number }) {
  return <LedText variant="display" tabular size={30} trim="digits" color={color} style={[s.value, size !== 30 && { fontSize: size, minWidth: 0 }]}>{children}</LedText>;
}

/**
 * O valor do Stepper, que vira uma caixa de digitação ao ser tocado.
 * A caixa sempre mostra o valor formatado ("01:30") e os dígitos entram pela
 * direita (veja core/entry.ts). Confirma ao tocar em OK, no Enter ou fora da caixa.
 */
function ValueEntry({ display, entry }: { display: string; entry: StepperEntry }) {
  const [editing, setEditing] = useState(false);
  const [digits, setDigits] = useState('');
  const typed = useRef(false);
  const input = useRef<TextInputInstance>(null);
  const accessoryId = `entry-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  if (!editing) {
    return (
      <Pressable
        onPress={() => { typed.current = false; setDigits(''); setEditing(true); }}
        accessibilityRole="button" accessibilityLabel={`${entry.typeLabel}: ${display}`}
        style={({ pressed }) => [s.tap, pressed && { backgroundColor: '#262626' }]}
        hitSlop={4}
      >
        <StepValue>{display}</StepValue>
      </Pressable>
    );
  }

  const shown = entryPreview(digits, entry.kind);
  const finish = () => {
    if (typed.current) entry.onEnter(entryValue(digits, entry.kind));
    setEditing(false);
  };
  return (
    <>
      <TextInput
        ref={input}
        autoFocus
        value={shown}
        onChangeText={(text) => { typed.current = true; setDigits(entryDigits(text, entry.kind)); }}
        selection={{ start: shown.length, end: shown.length }}
        keyboardType="number-pad"
        returnKeyType="done"
        onSubmitEditing={() => input.current?.blur()}
        onBlur={finish}
        caretHidden={false}
        contextMenuHidden
        maxLength={10}
        inputAccessoryViewID={Platform.OS === 'ios' ? accessoryId : undefined}
        accessibilityLabel={entry.typeLabel}
        selectionColor={LED.verde}
        style={[s.input, !typed.current && { color: UI.muted }]}
      />
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={accessoryId}>
          <View style={s.accessory}>
            <Text style={s.accessoryLabel} numberOfLines={1}>{entry.typeLabel}</Text>
            <Button label={entry.okLabel} kind="primary" onPress={() => input.current?.blur()} />
          </View>
        </InputAccessoryView>
      )}
    </>
  );
}

const s = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 70, textAlign: 'center' },
  /** valor tocável: um sublinhado discreto mostra que dá para digitar */
  tap: { width: 96, alignItems: 'center', borderRadius: 8, borderBottomWidth: 2, borderBottomColor: '#3A3A3A' },
  /** caixa de digitação: sem lineHeight (no iOS ele cortaria a Teko), altura cobre a linha inteira */
  input: {
    width: 96, flexGrow: 0, flexShrink: 0, height: 46, paddingVertical: 0, paddingHorizontal: 6, textAlign: 'center',
    fontFamily: FONT.display, fontSize: 30, color: UI.text, fontVariant: ['tabular-nums'],
    backgroundColor: '#0E0E0E', borderRadius: 8, borderWidth: 2, borderColor: LED.verde,
  },
  accessory: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#1E1E1E', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: UI.line },
  accessoryLabel: { flex: 1, color: UI.muted, fontSize: 14 },
});
