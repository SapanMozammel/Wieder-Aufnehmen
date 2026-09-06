import { describe, expect, it } from 'vitest';
import { classifyFixtures, findSecrets } from './check-secrets.js';

describe('secret scan', () => {
  it('reports location and rule without returning the secret value', () => {
    const synthetic = ['ghp_', 'a'.repeat(36)].join('');
    const findings = findSecrets('fixture.ts', `// first line\nconst value = '${synthetic}';`);
    expect(findings).toEqual([
      {
        file: 'fixture.ts',
        line: 2,
        rule: 'github-token',
        fingerprint: expect.stringMatching(/^[a-f\d]{64}$/u),
      },
    ]);
    expect(JSON.stringify(findings)).not.toContain(synthetic);
  });
  it('detects repeated credentials and accepts a credential-free Mongo URI', () => {
    expect(findSecrets('file', 'mongodb://127.0.0.1:27018')).toEqual([]);
    const uri = ['mongodb://', 'user', ':', 'example-value', '@localhost/test'].join('');
    expect(findSecrets('file', `${uri}\n${uri}`)).toHaveLength(2);
  });
  it('allows only the exact reviewed synthetic fixture and detects stale allowances', () => {
    const findings = findSecrets('redaction.test.ts', ['ghp_', 'a'.repeat(36)].join(''));
    const finding = findings[0];
    if (!finding) throw new Error('Expected a fixture finding.');
    const allowance = {
      ...finding,
      rationale: 'Synthetic token tests redaction; never an issued credential.',
    };
    expect(classifyFixtures(findings, [allowance])).toEqual({ findings: [], issues: [] });
    expect(classifyFixtures([], [allowance]).issues).toHaveLength(1);
    expect(classifyFixtures(findings, [{ ...allowance, file: 'production.ts' }]).findings).toEqual(
      findings,
    );
    expect(
      classifyFixtures(findings, [{ ...allowance, fingerprint: '0'.repeat(64) }]).findings,
    ).toEqual(findings);
  });
});
