import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface SecretFinding {
  readonly file: string;
  readonly line: number;
  readonly rule: string;
  readonly fingerprint: string;
}
export interface FixtureAllowance {
  readonly file: string;
  readonly rule: string;
  readonly fingerprint: string;
  readonly rationale: string;
}
const rules: readonly { readonly name: string; readonly pattern: RegExp }[] = [
  {
    name: 'private-key',
    pattern: new RegExp(
      ['-----BEGIN ', '(?:RSA |EC |DSA |OPENSSH )?', 'PRIVATE KEY-----'].join(''),
      'gu',
    ),
  },
  { name: 'github-token', pattern: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/gu },
  { name: 'aws-access-key', pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/gu },
  { name: 'openai-token', pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/gu },
  { name: 'stripe-secret', pattern: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/gu },
  {
    name: 'credentialed-uri',
    pattern:
      /\b(?:https?|mongodb(?:\+srv)?|postgres(?:ql)?|redis):\/\/[^\s/:@]+:[^\s/@]+@[^\s"'`]+/giu,
  },
];

export function findSecrets(file: string, content: string): SecretFinding[] {
  return rules.flatMap(({ name, pattern }) =>
    Array.from(content.matchAll(pattern), (match) => ({
      file,
      rule: name,
      line: content.slice(0, match.index).split('\n').length,
      fingerprint: createHash('sha256').update(match[0]).digest('hex'),
    })),
  );
}

export function scanSecrets(root: string): SecretFinding[] {
  const git = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (git.status !== 0) throw new Error('Git file inventory failed; secret scan did not run.');
  return [...new Set(git.stdout.split('\0').filter(Boolean))].flatMap((file) => {
    const path = resolve(root, file);
    if (!existsSync(path) || !lstatSync(path).isFile()) return [];
    if (/(^|\/)\.env(?:\.(?!example$)[^/]+)?$/u.test(file))
      return [{ file, line: 1, rule: 'tracked-environment-file', fingerprint: '' }];
    const bytes = readFileSync(path);
    if (bytes.includes(0)) return [];
    return findSecrets(file, bytes.toString('utf8'));
  });
}

export function classifyFixtures(
  findings: readonly SecretFinding[],
  allowances: readonly FixtureAllowance[],
): { readonly findings: readonly SecretFinding[]; readonly issues: readonly string[] } {
  const issues: string[] = [];
  const matched = new Set<string>();
  const key = (value: {
    readonly file: string;
    readonly rule: string;
    readonly fingerprint: string;
  }): string => `${value.file}:${value.rule}:${value.fingerprint}`;
  const approved = new Set<string>();
  for (const allowance of allowances) {
    if (
      !allowance ||
      typeof allowance.file !== 'string' ||
      !/\.(test|spec)\.[cm]?[jt]sx?$/u.test(allowance.file) ||
      typeof allowance.rule !== 'string' ||
      !rules.some(({ name }) => name === allowance.rule) ||
      typeof allowance.fingerprint !== 'string' ||
      !/^[a-f\d]{64}$/u.test(allowance.fingerprint) ||
      typeof allowance.rationale !== 'string' ||
      allowance.rationale.trim().length < 12
    ) {
      issues.push('Invalid synthetic fixture allowance.');
      continue;
    }
    const id = key(allowance);
    if (approved.has(id)) issues.push(`Duplicate fixture allowance: ${allowance.file}`);
    approved.add(id);
  }
  const remaining = findings.filter((finding) => {
    const id = key(finding);
    if (!approved.has(id)) return true;
    matched.add(id);
    return false;
  });
  for (const id of approved)
    if (!matched.has(id)) issues.push(`Stale fixture allowance: ${id.split(':')[0]}`);
  return { findings: remaining, issues };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const allowances: unknown = JSON.parse(
    readFileSync(resolve(process.cwd(), 'tooling/security/secret-fixtures.json'), 'utf8'),
  );
  if (!Array.isArray(allowances))
    throw new Error('Secret fixture classification must be an array.');
  const { findings, issues } = classifyFixtures(
    scanSecrets(process.cwd()),
    allowances as FixtureAllowance[],
  );
  for (const issue of issues) console.error(issue);
  for (const finding of findings)
    console.error(`${finding.file}:${finding.line}: possible ${finding.rule}; value withheld.`);
  if (findings.length || issues.length) process.exitCode = 1;
  else
    console.log('Local secret pattern scan passed. This complements provider scanning and review.');
}
