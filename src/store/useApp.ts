import { create } from 'zustand';
import * as Engine from '@/core/engine';
import type { AnyConfig, Mode, ModeConfigs, SessionState, TimeFormat } from '@/core/engine';
import type { LangSetting } from '@/i18n';
import { DEFAULT_COLORS, type ColorRole, type ColorScheme, type LedColor } from '@/theme/palette';
import { loadJSON, saveJSON } from './storage';

export interface Settings {
  language: LangSetting;
  sound: boolean;
  soundScheme: 'beep' | 'bell' | 'gong' | 'horn' | 'whistle';
  volume: number;
  countdown: boolean;
  tick: boolean;
  voice: boolean;
  voiceLang: 'en' | 'pt';
  voiceId: string;
  voiceRate: number;
  sayRound: boolean;
  vibrate: boolean;
  keepAwake: boolean;
  flash: boolean;
  /** abaixar a música de outros apps durante os avisos (desligado por padrão) */
  duckOthers: boolean;
  timeFormat: TimeFormat;
}

export interface SavedWorkout { id: string; name: string; mode: Mode; config: AnyConfig; example?: boolean }
export interface HistoryEntry { at: number; mode: Mode; name: string | null; planned: number | null; done: number; completed: boolean; rounds?: number }
/** rounds = contador manual do AMRAP / For Time */
export interface ActiveSession { mode: Mode; name: string | null; config: AnyConfig; startedAt: number; state: SessionState; rounds: number }

interface Persisted {
  v: 1;
  mode: Mode;
  activeName: string | null;
  configs: ModeConfigs;
  colors: ColorScheme;
  settings: Settings;
  saved: SavedWorkout[];
  history: HistoryEntry[];
  session: ActiveSession | null;
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'auto', sound: true, soundScheme: 'beep', volume: 0.8, countdown: true, tick: false,
  voice: true, voiceLang: 'en', voiceId: '', voiceRate: 1, sayRound: true,
  vibrate: true, keepAwake: true, flash: false, duckOthers: false, timeFormat: '00:00',
};

const EXAMPLES: SavedWorkout[] = [
  { id: 'ex1', example: true, name: 'Tabata 20/10 × 8', mode: 'tabata', config: { prepare: 10, work: 20, rest: 10, rounds: 8, cycles: 1, restBC: 0, cooldown: 0 } },
  { id: 'ex2', example: true, name: 'EMOM 10 min', mode: 'emom', config: { prepare: 10, interval: 60, rounds: 10 } },
  { id: 'ex3', example: true, name: 'AMRAP 12 min', mode: 'amrap', config: { prepare: 10, time: 12 * 60 } },
  { id: 'ex4', example: true, name: 'For Time · cap 15 min', mode: 'fortime', config: { prepare: 10, cap: 15 * 60 } },
];

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

function initial(): Persisted {
  const base: Persisted = {
    v: 1, mode: 'tabata', activeName: null, configs: clone(Engine.DEFAULTS), colors: { ...DEFAULT_COLORS },
    settings: { ...DEFAULT_SETTINGS }, saved: clone(EXAMPLES), history: [], session: null,
  };
  const d = loadJSON<Partial<Persisted>>();
  if (!d || d.v !== 1) return base;
  return {
    ...base, ...d,
    configs: { ...base.configs, ...d.configs },
    colors: { ...base.colors, ...d.colors },
    settings: { ...base.settings, ...d.settings },
  } as Persisted;
}

interface Actions {
  /** modo exibido (o da sessão, se houver uma) */
  currentMode(): Mode;
  currentConfig(): AnyConfig;
  segments(): Engine.Segment[];
  elapsed(now?: number): number;
  setMode(mode: Mode): void;
  setConfig(mode: Mode, patch: Partial<AnyConfig>): void;
  resetConfig(mode: Mode): void;
  setColor(role: ColorRole, color: LedColor): void;
  setColors(colors: ColorScheme): void;
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void;
  saveWorkout(name: string): void;
  deleteWorkout(id: string): void;
  loadWorkout(w: SavedWorkout): void;
  clearHistory(): void;
  /** iniciar / pausar / continuar / repetir */
  toggle(now?: number): void;
  skip(now?: number): void;
  back(now?: number): void;
  /** zera e registra no histórico como parcial (se passou de 10 s) */
  reset(now?: number): void;
  /**
   * Marca como concluído e registra no histórico.
   * early = o atleta tocou em "Terminei" (For Time): vale o tempo de chegada.
   */
  finish(now?: number, early?: boolean): void;
  /** contador manual de rounds (AMRAP / For Time) */
  addRound(delta: number): void;
}

export type AppState = Persisted & Actions;

export const useApp = create<AppState>()((set, get) => {
  /** tempo que vale para o histórico, limitado ao total quando há um */
  const effectiveElapsed = (s: ActiveSession, now: number) => {
    const total = Engine.totalDuration(Engine.buildSegments(s.mode, s.config));
    const el = Engine.elapsedOf(s.state, now);
    return total > 0 && s.mode !== 'stopwatch' ? Math.min(el, total) : el;
  };
  const record = (completed: boolean, now: number) => {
    const s = get().session;
    if (!s) return;
    const el = effectiveElapsed(s, now);
    if (!completed && el < 10) return;
    const total = Engine.totalDuration(Engine.buildSegments(s.mode, s.config));
    const entry: HistoryEntry = {
      at: s.startedAt, mode: s.mode, name: s.name, planned: total > 0 && s.mode !== 'stopwatch' ? total : null,
      done: Math.round(el), completed, ...(Engine.tapsRounds(s.mode) ? { rounds: s.rounds } : {}),
    };
    set({ history: [entry, ...get().history].slice(0, 100) });
  };

  return {
    ...initial(),

    currentMode: () => get().session?.mode ?? get().mode,
    currentConfig: () => get().session?.config ?? get().configs[get().mode],
    segments: () => Engine.buildSegments(get().currentMode(), get().currentConfig()),
    elapsed: (now = Date.now()) => { const s = get().session; return s ? Engine.elapsedOf(s.state, now) : 0; },

    setMode: (mode) => set((st) => ({ mode, activeName: st.mode === mode ? st.activeName : null, session: st.session?.state.status === 'done' ? null : st.session })),
    setConfig: (mode, patch) => set((st) => ({ configs: { ...st.configs, [mode]: { ...st.configs[mode], ...patch } }, activeName: null })),
    resetConfig: (mode) => set((st) => ({ configs: { ...st.configs, [mode]: clone(Engine.DEFAULTS[mode]) }, activeName: null })),
    setColor: (role, color) => set((st) => ({ colors: { ...st.colors, [role]: color } })),
    setColors: (colors) => set({ colors: { ...colors } }),
    setSetting: (key, value) => set((st) => ({ settings: { ...st.settings, [key]: value } })),

    saveWorkout: (name) => set((st) => {
      const w: SavedWorkout = { id: 'w' + Date.now(), name, mode: st.mode, config: clone(st.configs[st.mode]) };
      return { saved: [w, ...st.saved], activeName: name };
    }),
    deleteWorkout: (id) => set((st) => ({ saved: st.saved.filter((w) => w.id !== id) })),
    loadWorkout: (w) => set((st) => ({ mode: w.mode, configs: { ...st.configs, [w.mode]: clone(w.config) }, activeName: w.name, session: null })),
    clearHistory: () => set({ history: [] }),

    toggle: (now = Date.now()) => {
      const st = get();
      const s = st.session;
      if (s?.state.status === 'running') { set({ session: { ...s, state: Engine.pause(s.state, now) } }); return; }
      if (!s || s.state.status === 'done') {
        const fresh: ActiveSession = { mode: st.mode, name: st.activeName, config: clone(st.configs[st.mode]), startedAt: now, state: Engine.createSession(), rounds: 0 };
        set({ session: { ...fresh, state: Engine.start(fresh.state, now) } });
        return;
      }
      set({ session: { ...s, state: Engine.start(s.state, now) } });
    },
    skip: (now = Date.now()) => { const s = get().session; if (s) set({ session: { ...s, state: Engine.skip(s.state, get().segments(), now) } }); },
    back: (now = Date.now()) => { const s = get().session; if (s) set({ session: { ...s, state: Engine.back(s.state, get().segments(), now) } }); },
    reset: (now = Date.now()) => {
      const s = get().session;
      if (s && s.state.status !== 'done') record(false, now);
      set({ session: null });
    },
    finish: (now = Date.now(), early = false) => {
      const s = get().session;
      if (!s || s.state.status === 'done') return;
      record(true, now);
      const total = Engine.totalDuration(Engine.buildSegments(s.mode, s.config));
      const at = early ? effectiveElapsed(s, now) : total;
      set({ session: { ...s, state: { status: 'done', elapsedBase: at, runningSince: null } } });
    },
    addRound: (delta) => {
      const s = get().session;
      if (!s || (s.state.status !== 'running' && s.state.status !== 'paused')) return;
      set({ session: { ...s, rounds: Math.max(0, (s.rounds ?? 0) + delta) } });
    },
  };
});

// Salva tudo que é dado (não as funções) a cada mudança, com debounce.
useApp.subscribe((st) => {
  const data: Persisted = {
    v: 1, mode: st.mode, activeName: st.activeName, configs: st.configs, colors: st.colors,
    settings: st.settings, saved: st.saved, history: st.history, session: st.session,
  };
  saveJSON(data);
});
