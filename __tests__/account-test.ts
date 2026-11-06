/// <reference types="jest" />
import {
  accountData, accountKey, applyRemote, cleanProfile, feedbackReady, firstMerge, firstName, formatPhone, isEmail, matchCode,
  phoneDigits, profileErrors, shouldPromptFeedback, WEEK, type Profile,
} from '@/core/account';

const base: Profile = { name: 'Ana Paula', email: 'Ana@Email.com ', phone: '', whatsapp: true, role: 'aluno', box: '', city: '', marketing: false, lang: 'pt' };

describe('cadastro', () => {
  it('nome obrigatório; box só para coach; telefone opcional mas com DDD', () => {
    expect(profileErrors(base)).toEqual({});
    expect(profileErrors({ ...base, name: ' a ' })).toEqual({ name: 'required' });
    expect(profileErrors({ ...base, role: 'coach' })).toEqual({ box: 'required' });
    expect(profileErrors({ ...base, role: 'coach', box: 'Box10' })).toEqual({});
    expect(profileErrors({ ...base, phone: '9999-1234' })).toEqual({ phone: 'invalid' });
    expect(profileErrors({ ...base, phone: '(85) 99999-1234' })).toEqual({});
  });
  it('telefone: só números para guardar, formatado para mostrar', () => {
    expect(phoneDigits('(85) 99999-1234')).toBe('85999991234');
    expect(formatPhone('85999991234')).toBe('(85) 99999-1234');
    expect(formatPhone('8532221234')).toBe('(85) 3222-1234');
    expect(formatPhone('5585999991234')).toBe('+55 (85) 99999-1234');
    expect(formatPhone('859')).toBe('(85) 9');
  });
  it('limpa antes de salvar (e WhatsApp só com telefone)', () => {
    expect(cleanProfile({ ...base, name: '  Ana  ', box: ' Box10 ' })).toMatchObject({ name: 'Ana', email: 'ana@email.com', box: 'Box10', whatsapp: false, phone: '' });
    expect(cleanProfile({ ...base, phone: '(85) 99999-1234' })).toMatchObject({ phone: '85999991234', whatsapp: true });
  });
  it('e-mail e primeiro nome', () => {
    expect(isEmail('ana@box.com')).toBe(true);
    expect(isEmail('ana@box')).toBe(false);
    expect(isEmail('ana box@x.com')).toBe(false);
    expect(firstName('  Edson Silva ')).toBe('Edson');
  });
});

describe('dados na conta', () => {
  const cfg = { tabata: { prepare: 10 } } as never;
  const local = {
    configs: cfg, colors: { work: 'verde' },
    settings: { sound: true, tvWods: { emom: 'local' }, tvRoomCode: 'AAAAAA', pairedCode: 'BBBBBB', analyticsConsent: 'granted', feedbackPromptAt: 5 },
    saved: [{ id: 'a', name: 'Local' }, { id: 'ex1', name: 'Exemplo' }],
  };
  const remote = accountData({
    configs: cfg, colors: { work: 'azul' },
    settings: { sound: false, tvWods: { emom: 'conta' }, tvRoomCode: 'ZZZZZZ', pairedCode: '', analyticsConsent: 'denied', feedbackPromptAt: 9 },
    saved: [{ id: 'b', name: 'Conta' }, { id: 'ex1', name: 'Exemplo' }],
  }, 1000, 'outro');

  it('o que é do aparelho não vai para a conta', () => {
    expect(remote.settings).not.toHaveProperty('tvRoomCode');
    expect(remote.settings).not.toHaveProperty('pairedCode');
    expect(remote.settings).not.toHaveProperty('analyticsConsent');
    expect(remote.settings).not.toHaveProperty('feedbackPromptAt');
  });
  it('primeira vez: junta os treinos; vale a conta se ela mudou por último', () => {
    const m = firstMerge(local as never, 500, remote as never) as typeof local;
    expect(m.saved.map((w) => w.id)).toEqual(['b', 'ex1', 'a']);
    expect(m.settings).toMatchObject({ sound: false, tvWods: { emom: 'conta' }, tvRoomCode: 'AAAAAA', pairedCode: 'BBBBBB', analyticsConsent: 'granted' });
    expect(m.colors).toEqual({ work: 'azul' });
  });
  it('primeira vez: vale o aparelho se ele mudou depois da conta', () => {
    const m = firstMerge(local as never, 2000, remote as never) as typeof local;
    expect(m.settings.tvWods).toEqual({ emom: 'local' });
    expect(m.saved.map((w) => w.id)).toEqual(['b', 'ex1', 'a']);
  });
  it('conta vazia: fica como está (e sobe)', () => {
    expect(firstMerge(local as never, 0, null)).toBe(local);
  });
  it('mudança de outro aparelho: a conta vale inteira (treino apagado some)', () => {
    const m = applyRemote(local as never, remote as never) as typeof local;
    expect(m.saved.map((w) => w.id)).toEqual(['b', 'ex1']);
    expect(m.settings).toMatchObject({ sound: false, tvRoomCode: 'AAAAAA' });
  });
  it('chave não depende da ordem das chaves nem dos ajustes do aparelho', () => {
    const a = accountKey(local as never);
    const b = accountKey({ ...local, settings: { ...local.settings, pairedCode: 'XXXXXX', sound: true } } as never);
    expect(a).toBe(b);
    expect(accountKey({ ...local, settings: { ...local.settings, sound: false } } as never)).not.toBe(a);
  });
});

describe('avaliação', () => {
  it('precisa de nota ou texto', () => {
    expect(feedbackReady(null, '  ')).toBe(false);
    expect(feedbackReady(4, '')).toBe(true);
    expect(feedbackReady(null, 'Ideia')).toBe(true);
    expect(feedbackReady(null, 'x'.repeat(2001))).toBe(false);
  });
  it('convite no máximo uma vez por semana', () => {
    expect(shouldPromptFeedback(0, Date.now())).toBe(true);
    expect(shouldPromptFeedback(1000, 1000 + WEEK - 1)).toBe(false);
    expect(shouldPromptFeedback(1000, 1000 + WEEK)).toBe(true);
  });
  it('código do pedido: 2 dígitos, sempre o mesmo para o mesmo pedido', () => {
    const c = matchCode('abcdefghijkmnpqrstuvwxyz');
    expect(c).toMatch(/^[1-9][0-9]$/);
    expect(matchCode('abcdefghijkmnpqrstuvwxyz')).toBe(c);
  });
});
