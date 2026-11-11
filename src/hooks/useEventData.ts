import { useEffect, useState } from 'react';
import type { EventEntry, EventProgress, MurphEvent } from '@/core/event';
import { watchEntries, watchEvent, watchMyEntry, watchProgress } from '@/services/events';

/** Evento, inscritos e contagem ao vivo, sempre atualizados. `parts` escolhe o que acompanhar. */
export function useEventData(id: string | null | undefined, parts: { entries?: boolean; progress?: boolean; mine?: boolean } = {}) {
  const [event, setEvent] = useState<MurphEvent | null | undefined>(undefined);
  const [entries, setEntries] = useState<EventEntry[]>([]);
  const [progress, setProgress] = useState<EventProgress[]>([]);
  const [mine, setMine] = useState<EventEntry | null | undefined>(undefined);

  useEffect(() => { if (!id) { setEvent(null); return; } setEvent(undefined); return watchEvent(id, setEvent); }, [id]);
  useEffect(() => (id && parts.entries ? watchEntries(id, setEntries) : undefined), [id, parts.entries]);
  useEffect(() => (id && parts.progress ? watchProgress(id, setProgress) : undefined), [id, parts.progress]);
  useEffect(() => (id && parts.mine ? watchMyEntry(id, setMine) : undefined), [id, parts.mine]);

  return { event, entries, progress, mine, loading: event === undefined };
}

/** Relógio que atualiza sozinho (para o tempo do treino). */
export function useNow(everyMs = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), everyMs); return () => clearInterval(t); }, [everyMs]);
  return now;
}
