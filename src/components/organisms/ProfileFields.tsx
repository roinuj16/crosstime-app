import { StyleSheet, Text, View } from 'react-native';
import { Field, Segmented, TextField, Toggle } from '@/components/molecules';
import { LED } from '@/theme/palette';

export interface ProfileValues {
  name: string; email: string; phone: string; whatsapp: boolean; role: 'aluno' | 'coach'; box: string; city: string; marketing: boolean;
}

export interface ProfileLabels {
  name: string; namePh: string; email: string; phone: string; phoneHint: string; whatsapp: string; role: string; aluno: string; coach: string;
  box: string; boxHint: string; boxPh: string; city: string; cityPh: string; marketing: string; marketingHint: string;
}

/** Campos do cadastro (usados no cadastro e em Minha conta). Os erros vêm prontos de quem usa. */
export function ProfileFields({ value, onChange, labels, errors }: {
  value: ProfileValues;
  onChange: (patch: Partial<ProfileValues>) => void;
  labels: ProfileLabels;
  errors: Partial<Record<'name' | 'phone' | 'box', string>>;
}) {
  const L = labels;
  return (
    <View>
      <TextField label={L.name} value={value.name} onChange={(name) => onChange({ name })} placeholder={L.namePh} maxLength={60} error={errors.name} autoComplete="name" autoCapitalize="words" />
      <TextField label={L.email} value={value.email} onChange={() => {}} editable={false} />
      <Field label={L.role}>
        <Segmented value={value.role} onChange={(role) => onChange({ role })} options={[{ value: 'aluno', label: L.aluno }, { value: 'coach', label: L.coach }]} />
      </Field>
      <TextField
        label={L.box} hint={L.boxHint} value={value.box} onChange={(box) => onChange({ box })}
        placeholder={L.boxPh} maxLength={60} error={errors.box} autoCapitalize="words"
      />
      <TextField label={L.city} value={value.city} onChange={(city) => onChange({ city })} placeholder={L.cityPh} maxLength={60} autoCapitalize="words" />
      <TextField
        label={L.phone} hint={L.phoneHint} value={value.phone} onChange={(phone) => onChange({ phone })} placeholder="(85) 99999-1234"
        maxLength={20} error={errors.phone} keyboardType="phone-pad" inputMode="tel" autoComplete="tel"
      />
      <Toggle label={L.whatsapp} value={value.whatsapp && !!value.phone.trim()} onChange={(whatsapp) => onChange({ whatsapp })} disabled={!value.phone.trim()} />
      <Toggle label={L.marketing} hint={L.marketingHint} value={value.marketing} onChange={(marketing) => onChange({ marketing })} />
    </View>
  );
}

/** Aviso de erro geral do formulário. */
export function FormError({ text }: { text: string }) {
  return <Text style={s.err}>{text}</Text>;
}

const s = StyleSheet.create({ err: { color: LED.vermelho, fontSize: 14, marginTop: 12, textAlign: 'center' } });
