/**
 * Escala do modo TV. O design foi desenhado em 1280×720; `u` converte os pixels do
 * design para a tela de verdade (1080p → 1,5; 4K → 3), sem distorcer em telas 4:3.
 */
export const tvUnit = (width: number, height: number) => Math.min(width / 1280, height / 720);

/** Cores fixas do modo TV (as das fases vêm do esquema de cores do app). */
export const TV = { panel: '#161616', aside: '#141414', track: '#1E1E1E', line: '#2A2A2A', soft: '#C9C9C9' } as const;
