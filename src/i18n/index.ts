import { getLocales } from 'expo-localization';
import { STRINGS, type Lang, type Strings } from './strings';

export type LangSetting = 'auto' | Lang;

/** Idioma do aparelho: português se começar com "pt", senão inglês. */
export function deviceLang(): Lang {
  try {
    const [locale] = getLocales();
    return locale?.languageCode === 'pt' ? 'pt' : 'en';
  } catch {
    return 'en';
  }
}

export const resolveLang = (setting: LangSetting): Lang => (setting === 'auto' ? deviceLang() : setting);

export const strings = (lang: Lang): Strings => STRINGS[lang];

export type { Lang, Strings };
