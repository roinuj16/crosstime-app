import { useState } from 'react';
import { cleanProfile, firstName, formatPhone, profileErrors, type Profile } from '@/core/account';
import { saveProfile, useAccount } from '@/services/account';
import { useApp } from '@/store/useApp';
import { useStrings } from './useStrings';

/** Estado do formulário de cadastro (usado no cadastro e em Minha conta). */
export function useProfileForm() {
  const { t, lang } = useStrings();
  const P = t.profile;
  const acc = useAccount();
  const start: Profile = acc.profile
    ? { ...acc.profile, phone: formatPhone(acc.profile.phone) }
    : { name: '', email: acc.email ?? '', phone: '', whatsapp: false, role: 'aluno', box: '', city: '', marketing: false, lang };
  const [value, setValue] = useState<Profile>(start);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const raw = profileErrors(value);
  const errors = tried ? {
    name: raw.name ? P.required : undefined,
    phone: raw.phone ? P.phoneInvalid : undefined,
    box: raw.box ? P.boxRequired : undefined,
  } : {};
  const changed = JSON.stringify(cleanProfile({ ...value, email: acc.email ?? value.email })) !== JSON.stringify(acc.profile ? cleanProfile(acc.profile) : null);

  const onChange = (patch: Partial<Profile>) => {
    setFailed(false);
    setValue((v) => ({ ...v, ...patch, ...(patch.phone != null ? { phone: formatPhone(patch.phone) } : {}) }));
  };

  /** Salva; devolve true se deu certo. */
  const save = async (): Promise<boolean> => {
    setTried(true);
    if (Object.keys(raw).length) return false;
    setBusy(true); setFailed(false);
    try {
      await saveProfile({ ...value, email: acc.email ?? value.email, lang });
      // coach: o nome já vai para o topo da TV (se ainda não tinha um)
      const st = useApp.getState();
      if (value.role === 'coach' && !st.settings.tvCoachName.trim()) st.setSetting('tvCoachName', firstName(value.name));
      if (value.role === 'coach' && !st.settings.tvBoxName.trim() && value.box.trim()) st.setSetting('tvBoxName', value.box.trim());
      return true;
    } catch {
      setFailed(true);
      return false;
    } finally { setBusy(false); }
  };

  return { value, onChange, errors, save, busy, failed, changed, email: acc.email ?? '' };
}
