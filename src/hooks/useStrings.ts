import { resolveLang, strings, type Lang, type Strings } from '@/i18n';
import { useApp } from '@/store/useApp';

/** Textos no idioma escolhido nos ajustes (ou o do aparelho). */
export function useStrings(): { t: Strings; lang: Lang } {
  const setting = useApp((s) => s.settings.language);
  const lang = resolveLang(setting);
  return { t: strings(lang), lang };
}
