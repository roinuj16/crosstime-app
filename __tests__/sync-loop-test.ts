/// <reference types="jest" />
/**
 * Duas "telas" (TV e celular do coach) conversando por uma sala falsa, em memória,
 * com relógios diferentes. Confere que o que um faz aparece no outro e que não há eco infinito.
 */
import { createStore } from 'zustand/vanilla';
import * as Engine from '../src/core/engine';
import type { Room, RoomHandlers } from '../src/services/remote';
import { startSync } from '../src/services/syncLoop';
import { DEFAULT_COLORS } from '../src/theme/palette';

jest.mock('../src/services/remote', () => ({}));

type Snap = Record<string, unknown> & { by: string };
function fakeServer() {
  const rooms = new Map<string, { timer?: Snap; brand?: Snap; subs: { uid: string; h: RoomHandlers }[] }>();
  let writes = 0;
  const open = (offset: number, uid: string) => async (code: string, _role: string, h: RoomHandlers): Promise<Room> => {
    const r = rooms.get(code) ?? { subs: [] };
    rooms.set(code, r);
    r.subs.push({ uid, h });
    const send = (kind: 'timer' | 'brand', v: object) => {
      writes++;
      const snap = JSON.parse(JSON.stringify({ ...v, by: uid })) as Snap; // como o Firebase: sem undefined
      r[kind] = snap;
      for (const s of r.subs) if (s.uid !== uid) queueMicrotask(() => (kind === 'timer' ? s.h.onTimer(snap as never) : s.h.onBrand(snap as never)));
    };
    return { uid, offset: () => offset, publishTimer: (s) => send('timer', s), publishBrand: (s) => send('brand', s), close: () => {} };
  };
  return { open, writes: () => writes };
}

const initial = () => ({
  mode: 'tabata' as Engine.Mode, activeName: null as string | null, configs: Engine.DEFAULTS, saved: [] as unknown[], session: null as unknown,
  colors: DEFAULT_COLORS, settings: { tvBoxName: '', tvLogo: '', tvWod: '', timeFormat: '00:00' as const, pairedCode: '', tvRoomCode: '' },
});

const flush = async () => { for (let i = 0; i < 5; i++) { jest.advanceTimersByTime(100); await Promise.resolve(); await new Promise((r) => jest.requireActual('timers').setImmediate(r)); } };

describe('TV e celular sincronizando', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('o coach entra, muda o treino e dá play; a TV acompanha e ninguém fica reenviando', async () => {
    const server = fakeServer();
    const tv = createStore(initial), phone = createStore(initial);
    phone.setState({ activeName: 'EMOM 10 min', mode: 'emom', settings: { ...phone.getState().settings, tvBoxName: 'Box Fortaleza', tvWod: '10 burpees' } });

    // relógios: celular 2 s atrás do servidor, TV 3 s à frente
    const stopTv = startSync(tv, server.open(-3000, 'tv') as never, 'tv', 'K7Q4M2', undefined, 50);
    await flush();
    const stopPhone = startSync(phone, server.open(2000, 'phone') as never, 'coach', 'K7Q4M2', undefined, 50);
    await flush();

    expect(tv.getState().mode).toBe('emom');
    expect(tv.getState().activeName).toBe('EMOM 10 min');
    expect(tv.getState().settings).toMatchObject({ tvBoxName: 'Box Fortaleza', tvWod: '10 burpees', tvRoomCode: '' });

    // play no celular
    const now = 1_000_000;
    phone.setState({ session: { mode: 'emom', name: 'EMOM 10 min', config: Engine.DEFAULTS.emom, startedAt: now, rounds: 0, state: Engine.start(Engine.createSession(), now) } });
    await flush();
    const s = tv.getState().session as { state: Engine.SessionState };
    expect(s.state.status).toBe('running');
    // mesmo instante absoluto: TV (5 s à frente do celular) calcula o mesmo tempo decorrido
    expect(Engine.elapsedOf(s.state, now + 30_000 + 5000)).toBeCloseTo(30, 3);

    // pausa pelo controle da TV: chega no celular
    tv.setState({ session: { ...(tv.getState().session as object), state: Engine.pause(s.state, now + 40_000 + 5000) } });
    await flush();
    expect((phone.getState().session as { state: Engine.SessionState }).state).toMatchObject({ status: 'paused', elapsedBase: 40 });

    // sem eco: depois de tudo assentar, nenhuma escrita nova
    const w = server.writes();
    await flush(); await flush();
    expect(server.writes()).toBe(w);
    expect(w).toBeLessThanOrEqual(6);
    stopTv(); stopPhone();
  });
});
