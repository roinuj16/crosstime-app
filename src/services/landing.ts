/**
 * Link de entrada do e-mail (…/confirm?rid=…&oobCode=…). O endereço tem a "chave" de login,
 * então guardamos em memória logo ao abrir; a página /confirm tira da barra de endereço
 * (e o Analytics só liga depois disso: services/analytics.web.ts).
 */
const initial = typeof window !== 'undefined' && window.location && /[?&]oobCode=/.test(window.location.search) ? window.location.href : null;

/** O link completo que abriu esta página (ou null se não veio de um link de entrada). */
export const landingLink = (): string | null => initial;

/** A barra de endereço ainda mostra a chave de login? */
export const urlHasLoginKey = () => typeof window !== 'undefined' && /[?&]oobCode=/.test(window.location?.search ?? '');
