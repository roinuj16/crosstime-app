/**
 * Voltar com segurança. Na web, quem abre uma página direto pelo endereço (ou recarrega,
 * ou o web app reabre numa página interna) não tem para onde voltar: o router.back()
 * não fazia nada e os botões Pronto e ← pareciam travados. Aí vamos para `fallback`.
 */
import { router, type Href } from 'expo-router';

export function goBack(fallback: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

// ---------- voltar para onde a pessoa queria ir depois de entrar ----------
// Ex.: abriu o link de inscrição do Murph sem conta → entra com o e-mail → volta para o link.
const AFTER = 'cronobox.afterLogin';

/** Guarda o endereço atual (com ?id=…) para depois do login. */
export function rememberAfterLogin() {
  if (typeof window === 'undefined') return;
  const here = window.location.pathname + window.location.search;
  if (here === '/' || /^\/(login|signup|confirm)/.test(here)) return;
  try { localStorage.setItem(AFTER, JSON.stringify({ to: here, at: Date.now() })); } catch { /* sem storage: volta para o início */ }
}

/** Para onde ir depois de entrar (e esquece). Vale por 2 horas. */
export function takeAfterLogin(): string {
  try {
    const raw = localStorage.getItem(AFTER);
    localStorage.removeItem(AFTER);
    if (!raw) return '/';
    const { to, at } = JSON.parse(raw) as { to: string; at: number };
    return Date.now() - at < 2 * 3600_000 && to.startsWith('/') && !to.startsWith('//') ? to : '/';
  } catch { return '/'; }
}
