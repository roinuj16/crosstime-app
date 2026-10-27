import { useEffect, useRef, useState } from 'react';
import { AppState as RNAppState } from 'react-native';
import * as Engine from '@/core/engine';
import { useApp } from '@/store/useApp';

export type EventHandler = (events: Engine.TimerEvent[]) => void;

/**
 * Faz o relógio "andar" na tela: a cada 100 ms recalcula a posição a partir do
 * tempo decorrido (não de tiques), entrega os eventos (troca de fase, 3-2-1,
 * volta, fim) para quem cuida de som/voz/vibração e encerra o treino no fim.
 */
export function useTimerLoop(onEvents?: EventHandler): number {
  const status = useApp((s) => s.session?.state.status ?? 'idle');
  const [, force] = useState(0);
  const lastEl = useRef(useApp.getState().elapsed());
  const handler = useRef(onEvents);
  handler.current = onEvents;

  useEffect(() => {
    // ao (re)abrir com um treino em andamento, parte do ponto atual sem "rajada" de sons
    lastEl.current = useApp.getState().elapsed();
    if (status !== 'running') { force((n) => n + 1); return; }
    const tick = () => {
      const st = useApp.getState();
      const segs = st.segments();
      const el = st.elapsed();
      const events = Engine.eventsBetween(segs, lastEl.current, el);
      lastEl.current = el;
      if (events.length) handler.current?.(events);
      if (Engine.locate(segs, el).done) st.finish();
      force((n) => (n + 1) % 1_000_000);
    };
    tick();
    const id = setInterval(tick, 100);
    const sub = RNAppState.addEventListener('change', (s) => { if (s === 'active') tick(); });
    return () => { clearInterval(id); sub.remove(); };
  }, [status]);

  // quando o usuário pula/volta fase, sincroniza a referência
  useEffect(() => useApp.subscribe((st, prev) => {
    if (st.session?.state !== prev.session?.state && st.session?.state.status !== 'running') {
      lastEl.current = st.elapsed();
    }
  }), []);

  return useApp.getState().elapsed();
}
