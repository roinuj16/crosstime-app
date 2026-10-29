import { Switch } from 'react-native';
import { LED } from '@/theme/palette';
import { Row } from './Row';

/** Linha com chave liga/desliga. */
export function Toggle({ value, onChange, label, hint, disabled }: { value: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <Row
      label={label} hint={hint} disabled={disabled}
      right={<Switch value={value} onValueChange={onChange} disabled={disabled} trackColor={{ true: LED.verde, false: '#3A3A3A' }} thumbColor="#F2F2F2" accessibilityLabel={label} />}
    />
  );
}
