import type { EventStatus } from '@/core/event';
import { LED, UI } from './palette';

/** Cor da situação do treino especial: aberto (verde), valendo (vermelho), encerrado (cinza). */
export const statusColor = (s: EventStatus) => (s === 'open' ? LED.verde : s === 'live' ? LED.vermelho : UI.muted);
