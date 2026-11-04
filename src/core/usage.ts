/**
 * Quais eventos de uso uma mudança de sessão gera (sem React e sem Analytics; testado).
 * Só dados do treino (modo e tempos), nunca nomes ou textos digitados.
 */
import type { Mode, SessionStatus } from './engine';

interface Session { mode: Mode; state: { status: SessionStatus; elapsedBase: number } }
export interface UsageEvent { name: 'workout_start' | 'workout_complete' | 'workout_reset'; params: Record<string, string | number | boolean> }

export function sessionEvents(prev: Session | null, next: Session | null, planned: (s: Session) => number): UsageEvent[] {
  const was = prev?.state.status ?? 'idle';
  const now = next?.state.status ?? 'idle';
  if (next && now === 'running' && (was === 'idle' || was === 'done') ) {
    return [{ name: 'workout_start', params: { mode: next.mode, planned_s: Math.round(planned(next)) } }];
  }
  if (next && now === 'done' && was !== 'done') {
    const total = planned(next), done = Math.round(next.state.elapsedBase);
    return [{ name: 'workout_complete', params: { mode: next.mode, duration_s: done, early: Number.isFinite(total) && done < total - 1 } }];
  }
  if (prev && !next && (was === 'running' || was === 'paused')) {
    return [{ name: 'workout_reset', params: { mode: prev.mode, elapsed_s: Math.round(prev.state.elapsedBase) } }];
  }
  return [];
}
