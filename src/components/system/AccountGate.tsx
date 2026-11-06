import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { startAccount, useAccount } from '@/services/account';
import { LED, UI } from '@/theme/palette';

/** Telas abertas sem conta: a TV do box (e o que ela usa), a página do link e a privacidade. */
const OPEN = ['/tv', '/tv-setup', '/pair', '/privacy', '/confirm'];
/** Telas do próprio fluxo de entrada. */
const FLOW = ['/login', '/signup'];

/**
 * Componente de sistema: o app só abre para quem entrou e fez o cadastro.
 * Sem conta → /login; sem cadastro → /signup; com tudo → segue. Enquanto confere, cobre a tela.
 * No app instalado (conta desligada) não bloqueia nada.
 */
export function AccountGate() {
  const status = useAccount((s) => s.status);
  const path = usePathname().replace(/\/+$/, '') || '/';
  const open = OPEN.includes(path);
  const flow = FLOW.includes(path);

  useEffect(() => { startAccount(); }, []);

  useEffect(() => {
    if (status === 'off' || status === 'loading' || open) return;
    if (status === 'signedOut' && path !== '/login') router.replace('/login');
    else if (status === 'needsProfile' && path !== '/signup') router.replace('/signup');
    else if (status === 'ready' && flow) router.replace('/');
  }, [status, path, open, flow]);

  const cover = !open && status !== 'off' && (
    status === 'loading' || (status === 'signedOut' && path !== '/login') || (status === 'needsProfile' && path !== '/signup') || (status === 'ready' && flow)
  );
  if (!cover) return null;
  return (
    <View style={[StyleSheet.absoluteFill, s.cover]} pointerEvents="auto">
      <ActivityIndicator color={LED.verde} />
    </View>
  );
}

const s = StyleSheet.create({ cover: { backgroundColor: UI.bg, alignItems: 'center', justifyContent: 'center', zIndex: 100 } });
