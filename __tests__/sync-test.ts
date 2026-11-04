/// <reference types="jest" />
import * as Engine from '../src/core/engine';
import { applyTimer, brandKey, brandSnapshot, formatRoomCode, newRoomCode, parseRoomCode, timerKey, timerSnapshot, type SyncSource } from '../src/core/sync';
import { DEFAULT_COLORS } from '../src/theme/palette';

const base: SyncSource = {
  mode: 'tabata', activeName: 'Tabata 20/10 × 8', configs: Engine.DEFAULTS, saved: [],
  session: { mode: 'tabata', name: 'Tabata 20/10 × 8', config: Engine.DEFAULTS.tabata, startedAt: 1_000_000, rounds: 0, state: { status: 'running', elapsedBase: 12, runningSince: 1_005_000 } },
  colors: DEFAULT_COLORS, settings: { tvBoxName: 'Box Fortaleza', tvLogo: '', tvWod: '10 Thrusters', timeFormat: '00:00' },
};

describe('sincronização TV ↔ celular', () => {
  it('os horários viajam no relógio do servidor e voltam no relógio de cada aparelho', () => {
    // celular 2 s atrasado em relação ao servidor; TV 3 s adiantada
    const snap = timerSnapshot(base, 2000);
    expect(snap.session?.state.runningSince).toBe(1_007_000);
    const onTv = applyTimer(snap, -3000);
    expect(onTv.session?.state.runningSince).toBe(1_010_000);
    // o mesmo instante absoluto: o tempo decorrido calculado nos dois aparelhos é igual
    const phoneNow = 1_020_000, tvNow = phoneNow + 2000 + 3000;
    const el = (s: NonNullable<SyncSource['session']>, now: number) => Engine.elapsedOf(s.state, now);
    expect(el(onTv.session!, tvNow)).toBeCloseTo(el(base.session!, phoneNow), 5);
  });

  it('o Firebase apaga nulos e listas vazias: ao receber, voltam', () => {
    const fromDb = JSON.parse(JSON.stringify({ ...timerSnapshot({ ...base, session: null }, 0), saved: undefined, session: undefined, activeName: undefined }));
    const a = applyTimer(fromDb, 0);
    expect(a.saved).toEqual([]);
    expect(a.session).toBeNull();
    expect(a.activeName).toBeNull();
  });

  it('a mesma sessão com poucos ms de diferença não é reenviada; uma pausa é', () => {
    const k1 = timerKey(timerSnapshot(base, 2000));
    const k2 = timerKey(timerSnapshot(base, 2040));
    expect(k1).toBe(k2);
    const paused = { ...base, session: { ...base.session!, state: { status: 'paused' as const, elapsedBase: 30, runningSince: null } } };
    expect(timerKey(timerSnapshot(paused, 2000))).not.toBe(k1);
  });

  it('a marca (nome, logo, WOD, cores) vai separada do timer', () => {
    const b = brandSnapshot(base);
    expect(b).toMatchObject({ boxName: 'Box Fortaleza', wod: '10 Thrusters', timeFormat: '00:00' });
    expect(brandKey(b)).toBe(brandKey(brandSnapshot({ ...base, session: null })));
  });

  it('código da sala: 6 caracteres sem I/O/0/1, aceito com hífen, espaço ou minúsculas', () => {
    const c = newRoomCode(() => 0.5);
    expect(c).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(parseRoomCode('k7q-4m2')).toBe('K7Q4M2');
    expect(parseRoomCode('K7Q 4M')).toBeNull();
    expect(parseRoomCode('K7Q4M0')).toBeNull();
    expect(formatRoomCode('K7Q4M2')).toBe('K7Q-4M2');
  });
});

describe('leitor de QR da TV', () => {
  const { codeFromScan } = require('@/core/sync') as typeof import('@/core/sync');
  it('aceita o link do QR da TV', () => {
    expect(codeFromScan('https://cronobox.expo.app/pair?code=K7Q4M2')).toBe('K7Q4M2');
    expect(codeFromScan('http://localhost:8081/pair?x=1&code=k7q-4m2#a')).toBe('K7Q4M2');
  });
  it('aceita só o código', () => {
    expect(codeFromScan(' K7Q-4M2 ')).toBe('K7Q4M2');
    expect(codeFromScan('k7q4m2')).toBe('K7Q4M2');
  });
  it('recusa outros QR codes', () => {
    expect(codeFromScan('https://cardapio.exemplo.com/mesa/12')).toBeNull();
    expect(codeFromScan('WIFI:S:Box;T:WPA;P:12345678;;')).toBeNull();
    expect(codeFromScan('https://x.com/pair?code=K7Q4M')).toBeNull();
    expect(codeFromScan('K7Q-4M1')).toBeNull(); // 1 não existe no alfabeto do código
  });
});
