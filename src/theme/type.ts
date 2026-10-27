/** Fontes do app: Teko para números e rótulos (estilo placar), sistema para o resto. */
export const FONT = {
  display: 'Teko_600SemiBold',
  label: 'Teko_500Medium',
} as const;

/**
 * Métricas verticais da Teko (por em): ascendente 0,958 e descendente 0,475,
 * ou seja, a linha natural tem 1,433 em, mas os números só ocupam de 0 a 0,636.
 *
 * No iOS, um `lineHeight` menor que a linha natural CORTA o topo das letras
 * (o "0" vira "U"). Por isso nunca encolhemos o `lineHeight`: usamos a linha
 * inteira e tiramos o espaço vazio com margens negativas, que não cortam nada.
 */
const ASCENT = 0.958;
const DESCENT = 0.475;
const LINE = ASCENT + DESCENT;
const TRIM = {
  /** só números e ":" (topo 0,636, nada abaixo da linha de base) */
  digits: { top: ASCENT - 0.636 - 0.02, bottom: DESCENT - 0.05 },
  /** texto com acentos (Ô, É) e cedilha (Ç): topo 0,811, fundo −0,232 */
  label: { top: ASCENT - 0.811 - 0.02, bottom: DESCENT - 0.232 - 0.02 },
} as const;

/** Tamanho + altura de linha seguros para a Teko, sem cortar no iOS. */
export function teko(size: number, kind: keyof typeof TRIM = 'label') {
  const t = TRIM[kind];
  return {
    fontSize: size,
    lineHeight: Math.ceil(size * LINE),
    marginTop: -Math.floor(size * t.top),
    marginBottom: -Math.floor(size * t.bottom),
  };
}
