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
