/// <reference types="jest" />
import { MAX_ALERTS, upcomingAlerts } from '../src/core/alerts';
import { DEFAULTS } from '../src/core/engine';
import { STRINGS } from '../src/i18n/strings';

const t = STRINGS.pt;
const NOW = 1_700_000_000_000;

describe('avisos de segundo plano', () => {
  it('Tabata: um aviso por troca de fase + fim, nos horários certos', () => {
    const a = upcomingAlerts('tabata', DEFAULTS.tabata, 0, NOW, t, '00:00');
    expect(a[0]).toEqual({ at: NOW + 5000, title: 'TRABALHO · ROUND 1/4', body: '00:30', kind: 'phase' });
    expect(a[1]).toMatchObject({ at: NOW + 35000, title: 'DESCANSO', body: '00:15' });
    expect(a[a.length - 1]).toMatchObject({ at: NOW + 590000, title: 'CONCLUÍDO', kind: 'done' });
    expect(a).toHaveLength(24 + 1); // 3 ciclos × 7 fases + 2 descansos entre ciclos + desaquecimento = 24, mais o fim
  });
  it('a partir do meio do treino só agenda o que falta', () => {
    const a = upcomingAlerts('tabata', DEFAULTS.tabata, 40, NOW, t, '00:00');
    expect(a[0]).toMatchObject({ at: NOW + 10000, title: 'TRABALHO · ROUND 2/4' });
  });
  it('EMOM avisa cada intervalo', () => {
    const a = upcomingAlerts('emom', DEFAULTS.emom, 0, NOW, t, '00:00');
    expect(a.slice(0, 2).map((x) => x.title)).toEqual(['EMOM 1/10', 'EMOM 2/10']);
    expect(a[1].at - a[0].at).toBe(60000);
  });
  it('For Time avisa o time cap', () => {
    const a = upcomingAlerts('fortime', DEFAULTS.fortime, 0, NOW, t, '00:00');
    expect(a[a.length - 1]).toMatchObject({ title: 'TIME CAP', at: NOW + 1210000 });
  });
  it('For Time sem cap não tem aviso de fim', () => {
    const a = upcomingAlerts('fortime', { prepare: 10, cap: 0 }, 0, NOW, t, '00:00');
    expect(a.map((x) => x.kind)).toEqual(['phase']);
  });
  it('cronômetro: avisos de volta até o limite do sistema', () => {
    const a = upcomingAlerts('stopwatch', DEFAULTS.stopwatch, 27, NOW, t, '00:00');
    expect(a[0]).toMatchObject({ title: 'VOLTA 3', at: NOW + 8000, kind: 'lap' });
    expect(a).toHaveLength(MAX_ALERTS);
  });
  it('nunca passa do limite do iOS', () => {
    expect(upcomingAlerts('emom', { prepare: 0, interval: 10, rounds: 99 }, 0, NOW, t, '00:00').length).toBeLessThanOrEqual(MAX_ALERTS);
  });
});
