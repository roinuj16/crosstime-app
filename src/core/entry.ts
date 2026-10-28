/**
 * Digitação de valores na tela de edição, no estilo micro-ondas:
 * os números entram pela direita. "130" → 01:30, "45" → 00:45, "10000" → 1:00:00.
 * Só cálculo, sem React, para poder testar.
 */
export type EntryKind = 'time' | 'count';

const MAX_DIGITS: Record<EntryKind, number> = { time: 6, count: 2 };

/**
 * Extrai os dígitos do que está na caixa de texto. A caixa mostra o valor já
 * formatado ("01:30"), então tirar os ":" e os zeros da esquerda devolve o que
 * a pessoa digitou ("130"). Apagar um caractere apaga o último dígito.
 */
export function entryDigits(text: string, kind: EntryKind): string {
  return text.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_DIGITS[kind]);
}

/** Como os dígitos aparecem enquanto a pessoa digita. */
export function entryPreview(digits: string, kind: EntryKind): string {
  if (kind === 'count') return digits || '0';
  const d = digits.padStart(digits.length > 4 ? 6 : 4, '0');
  const parts = d.length === 6 ? [d.slice(0, 2), d.slice(2, 4), d.slice(4)] : [d.slice(0, 2), d.slice(2)];
  if (parts.length === 3) parts[0] = String(Number(parts[0]));
  return parts.join(':');
}

/** Valor final: segundos (tempo) ou quantidade. Segundos acima de 59 são aceitos ("90" = 1:30). */
export function entryValue(digits: string, kind: EntryKind): number {
  if (kind === 'count') return Number(digits || 0);
  const d = digits.padStart(6, '0');
  return Number(d.slice(0, 2)) * 3600 + Number(d.slice(2, 4)) * 60 + Number(d.slice(4));
}
