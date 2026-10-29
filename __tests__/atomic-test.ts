/// <reference types="jest" />
/// <reference types="node" />
/**
 * Guarda a hierarquia do Atomic Design em src/components:
 *   atoms → molecules → organisms → templates → páginas (src/app)
 * Cada nível só usa os níveis abaixo dele, e nenhum componente busca dados sozinho
 * (estado, serviços, hooks e navegação ficam nas páginas).
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', 'src', 'components');
const LEVELS = ['atoms', 'molecules', 'organisms', 'templates'] as const;
const FORBIDDEN_DATA = [/^@\/store/, /^@\/services/, /^@\/hooks/, /^expo-router$/];

function imports(file: string): string[] {
  const src = readFileSync(file, 'utf8');
  return [...src.matchAll(/(?:import|export)[^'"]*from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

describe('Atomic Design', () => {
  for (const [i, level] of LEVELS.entries()) {
    const files = readdirSync(join(ROOT, level)).filter((f) => /\.tsx?$/.test(f));
    const allowed = LEVELS.slice(0, i); // níveis abaixo

    it(`${level}: só usa níveis abaixo (${allowed.join(', ') || 'nenhum'}) e não busca dados`, () => {
      expect(files.length).toBeGreaterThan(0);
      const problems: string[] = [];
      for (const f of files) {
        for (const spec of imports(join(ROOT, level, f))) {
          const comp = spec.match(/^@\/components\/([^/]+)/);
          if (comp && !allowed.includes(comp[1] as never)) problems.push(`${level}/${f} usa ${spec}`);
          if (spec.startsWith('../')) problems.push(`${level}/${f} usa ${spec} (use @/components/<nível>)`);
          if (FORBIDDEN_DATA.some((re) => re.test(spec))) problems.push(`${level}/${f} busca dados em ${spec}`);
        }
      }
      expect(problems).toEqual([]);
    });

    it(`${level}: todo componente aparece no index.ts`, () => {
      const index = readFileSync(join(ROOT, level, 'index.ts'), 'utf8');
      const missing = files.filter((f) => f !== 'index.ts' && !index.includes(`'./${f.replace(/\.tsx?$/, '')}'`));
      expect(missing).toEqual([]);
    });
  }

  it('não sobra componente solto fora dos níveis', () => {
    const loose = readdirSync(ROOT).filter((f) => !LEVELS.includes(f as never) && f !== 'system');
    expect(loose).toEqual([]);
  });
});
