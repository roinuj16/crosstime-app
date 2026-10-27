/**
 * Identidade visual "Placar do box": dígitos de LED coloridos sobre fundo escuro.
 * As cores de cada fase são configuração do usuário (veja ColorRole); aqui ficam
 * as opções disponíveis e os padrões.
 */

/** Cores de LED disponíveis para as fases. */
export const LED = {
  verde: '#31F26B',
  vermelho: '#FF2A1A',
  ambar: '#FFB000',
  ciano: '#22D3EE',
  azul: '#3D8BFF',
  laranja: '#FF7A1A',
  amarelo: '#F7F24A',
  magenta: '#FF3DCB',
  roxo: '#A66BFF',
  branco: '#F2F2F2',
} as const;

export type LedColor = keyof typeof LED;
export const LED_KEYS = Object.keys(LED) as LedColor[];

export const LED_NAMES: Record<LedColor, { pt: string; en: string }> = {
  verde: { pt: 'Verde', en: 'Green' },
  vermelho: { pt: 'Vermelho', en: 'Red' },
  ambar: { pt: 'Âmbar', en: 'Amber' },
  ciano: { pt: 'Ciano', en: 'Cyan' },
  azul: { pt: 'Azul', en: 'Blue' },
  laranja: { pt: 'Laranja', en: 'Orange' },
  amarelo: { pt: 'Amarelo', en: 'Yellow' },
  magenta: { pt: 'Magenta', en: 'Magenta' },
  roxo: { pt: 'Roxo', en: 'Purple' },
  branco: { pt: 'Branco', en: 'White' },
};

/** Cada elemento que tem cor própria na tela do timer. */
export type ColorRole = 'prepare' | 'work' | 'rest' | 'restBC' | 'cooldown' | 'run' | 'lap' | 'rounds' | 'cycles';
export type ColorScheme = Record<ColorRole, LedColor>;

/** Padrão escolhido: Placar do box, com Trabalho em verde e Descanso em vermelho. */
export const DEFAULT_COLORS: ColorScheme = {
  prepare: 'ambar',
  work: 'verde',
  rest: 'vermelho',
  restBC: 'ambar',
  cooldown: 'ciano',
  run: 'verde',
  lap: 'ambar',
  rounds: 'ambar',
  cycles: 'ciano',
};

/** Combinações prontas para a futura tela de cores. */
export const PRESETS: Record<string, { name: { pt: string; en: string }; colors: ColorScheme }> = {
  placar: { name: { pt: 'Placar do box', en: 'Box scoreboard' }, colors: DEFAULT_COLORS },
  semaforo: {
    name: { pt: 'Semáforo', en: 'Traffic light' },
    colors: { ...DEFAULT_COLORS, prepare: 'amarelo', restBC: 'amarelo', lap: 'amarelo', rounds: 'amarelo' },
  },
  frio: {
    name: { pt: 'Gelo', en: 'Ice' },
    colors: { ...DEFAULT_COLORS, work: 'ciano', run: 'ciano', rest: 'magenta', prepare: 'branco', cooldown: 'azul', cycles: 'azul' },
  },
};

/** Cores fixas da interface (não editáveis). */
export const UI = {
  bg: '#0B0B0B',
  panel: '#1E1E1E',
  deck: '#141414',
  line: '#2A2A2A',
  text: '#EDEDED',
  muted: '#9A9A9A',
  ink: '#0B0B0B',
} as const;

export const hex = (c: LedColor): string => LED[c];

/** Cor com transparência, para o brilho do LED. */
export function glow(c: LedColor, alpha: number): string {
  const n = parseInt(LED[c].slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
