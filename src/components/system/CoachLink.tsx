import { usePathname } from 'expo-router';
import { useRemoteSync } from '@/hooks/useRemoteSync';
import { useApp } from '@/store/useApp';

/**
 * Componente de sistema (não desenha nada): mantém este celular ligado à TV pareada,
 * em qualquer tela do app. Na própria tela do modo TV, quem liga é ela.
 */
export function CoachLink() {
  const code = useApp((s) => s.settings.pairedCode);
  const path = usePathname();
  useRemoteSync('coach', path === '/tv' ? null : code || null);
  return null;
}
