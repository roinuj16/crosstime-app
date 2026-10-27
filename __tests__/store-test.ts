/// <reference types="jest" />

// Armazenamento falso em memória, no lugar do SQLite do aparelho.
const mockMem = new Map<string, string>();
jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: (k: string) => mockMem.get(k) ?? null,
    setItem: async (k: string, v: string) => { mockMem.set(k, v); },
  },
}));
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'pt', languageTag: 'pt-BR' }] }));

import { useApp } from '../src/store/useApp';
import { DEFAULT_COLORS } from '../src/theme/palette';

const T0 = 1_000_000;

describe('estado do app', () => {
  beforeEach(() => useApp.getState().reset(T0));

  it('começa com as cores do Placar (trabalho verde, descanso vermelho)', () => {
    expect(useApp.getState().colors.work).toBe('verde');
    expect(useApp.getState().colors.rest).toBe('vermelho');
    expect(DEFAULT_COLORS.prepare).toBe('ambar');
  });

  it('inicia, pausa e retoma', () => {
    const s = useApp.getState();
    s.toggle(T0);
    expect(useApp.getState().session?.state.status).toBe('running');
    expect(useApp.getState().elapsed(T0 + 12_000)).toBe(12);
    useApp.getState().toggle(T0 + 12_000);
    expect(useApp.getState().session?.state.status).toBe('paused');
    expect(useApp.getState().elapsed(T0 + 60_000)).toBe(12);
  });

  it('pula para a próxima fase', () => {
    useApp.getState().toggle(T0);
    useApp.getState().skip(T0 + 1000); // preparar -> trabalho
    expect(useApp.getState().elapsed(T0 + 1000)).toBe(5);
  });

  it('zerar depois de 10 s registra treino parcial no histórico', () => {
    const before = useApp.getState().history.length;
    useApp.getState().toggle(T0);
    useApp.getState().reset(T0 + 30_000);
    const h = useApp.getState().history;
    expect(h.length).toBe(before + 1);
    expect(h[0]).toMatchObject({ mode: 'tabata', completed: false, done: 30 });
    expect(useApp.getState().session).toBeNull();
  });

  it('concluir registra treino completo', () => {
    useApp.getState().toggle(T0);
    useApp.getState().finish(T0 + 590_000);
    expect(useApp.getState().history[0]).toMatchObject({ completed: true, done: 590, planned: 590 });
    expect(useApp.getState().session?.state.status).toBe('done');
  });

  it('cores e configurações podem ser alteradas', () => {
    useApp.getState().setColor('work', 'ciano');
    useApp.getState().setConfig('tabata', { work: 20, rest: 10 });
    expect(useApp.getState().colors.work).toBe('ciano');
    expect(useApp.getState().configs.tabata.work).toBe(20);
    useApp.getState().setColors(DEFAULT_COLORS);
    useApp.getState().resetConfig('tabata');
  });

  it('salva no armazenamento local', async () => {
    useApp.getState().setSetting('voiceLang', 'pt');
    await new Promise((r) => setTimeout(r, 400));
    const saved = JSON.parse(mockMem.get('crosstimer.state.v1') ?? '{}');
    expect(saved.settings.voiceLang).toBe('pt');
  });
});
