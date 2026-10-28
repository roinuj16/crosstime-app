/// <reference types="jest" />
import { entryDigits, entryPreview, entryValue } from '@/core/entry';

/** Simula a caixa de texto: mostra o valor formatado e a pessoa digita/apaga no fim. */
function type(keys: string, kind: 'time' | 'count' = 'time') {
  let digits = '';
  for (const k of keys) {
    const shown = entryPreview(digits, kind);
    const text = k === '⌫' ? shown.slice(0, -1) : shown + k;
    digits = entryDigits(text, kind);
  }
  return { digits, shown: entryPreview(digits, kind), value: entryValue(digits, kind) };
}

describe('digitar tempo', () => {
  it('os números entram pela direita', () => {
    expect(type('4')).toMatchObject({ shown: '00:04', value: 4 });
    expect(type('45')).toMatchObject({ shown: '00:45', value: 45 });
    expect(type('130')).toMatchObject({ shown: '01:30', value: 90 });
    expect(type('1000')).toMatchObject({ shown: '10:00', value: 600 });
  });

  it('passa de 4 dígitos para horas', () => {
    expect(type('10000')).toMatchObject({ shown: '1:00:00', value: 3600 });
    expect(type('13000')).toMatchObject({ shown: '1:30:00', value: 5400 });
  });

  it('segundos acima de 59 viram minutos', () => {
    expect(type('90')).toMatchObject({ shown: '00:90', value: 90 });
  });

  it('apagar tira o último dígito', () => {
    expect(type('130⌫')).toMatchObject({ shown: '00:13', value: 13 });
    expect(type('10000⌫')).toMatchObject({ shown: '10:00', value: 600 });
    expect(type('5⌫⌫')).toMatchObject({ digits: '', shown: '00:00', value: 0 });
  });

  it('zeros à esquerda não contam e o limite é de 6 dígitos', () => {
    expect(type('0030')).toMatchObject({ shown: '00:30', value: 30 });
    expect(type('12345678').digits).toBe('123456');
  });
});

describe('digitar quantidade', () => {
  it('aceita até 2 dígitos', () => {
    expect(type('8', 'count')).toMatchObject({ shown: '8', value: 8 });
    expect(type('12', 'count')).toMatchObject({ shown: '12', value: 12 });
    expect(type('123', 'count').value).toBe(12);
    expect(type('12⌫', 'count').value).toBe(1);
  });
});
