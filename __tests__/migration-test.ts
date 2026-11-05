/// <reference types="jest" />
/** Quem já usava o app com um WOD só: ele passa para o modo que estava na tela. */
const mockMem = new Map<string, string>();
jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: { getItemSync: (k: string) => mockMem.get(k) ?? null, setItem: async (k: string, v: string) => { mockMem.set(k, v); } },
}));
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'pt', languageTag: 'pt-BR' }] }));

describe('WOD antigo (um só) vira WOD do modo', () => {
  it('vai para o modo que estava na tela', () => {
    mockMem.set('crosstimer.state.v1', JSON.stringify({ v: 1, mode: 'emom', settings: { tvWod: '10 Sit-ups\n15 Air squats' } }));
    jest.isolateModules(() => {
      const { useApp } = require('../src/store/useApp') as typeof import('../src/store/useApp');
      const st = useApp.getState().settings as unknown as Record<string, unknown>;
      expect(st.tvWods).toEqual({ emom: '10 Sit-ups\n15 Air squats' });
      expect(st.tvWod).toBeUndefined();
    });
  });
  it('no cronômetro, vai para o AMRAP', () => {
    mockMem.set('crosstimer.state.v1', JSON.stringify({ v: 1, mode: 'stopwatch', settings: { tvWod: '21-15-9' } }));
    jest.isolateModules(() => {
      const { useApp } = require('../src/store/useApp') as typeof import('../src/store/useApp');
      expect(useApp.getState().settings.tvWods).toEqual({ amrap: '21-15-9' });
    });
  });
});
