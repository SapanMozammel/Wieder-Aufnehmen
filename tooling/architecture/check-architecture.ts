import { builtinModules } from 'node:module';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export interface ArchitectureIssue {
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

const nodeModules = new Set(builtinModules.map((name) => name.replace(/^node:/u, '')));
const normalized = (path: string): string => path.split(sep).join('/');

function sourceFiles(path: string): string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isSymbolicLink()) return [];
    if (entry.isDirectory()) {
      return ['node_modules', 'dist', '.next'].includes(entry.name) ? [] : sourceFiles(child);
    }
    return /\.[cm]?[jt]sx?$/u.test(entry.name) && !/\.(test|spec)\./u.test(entry.name)
      ? [child]
      : [];
  });
}

function workspace(file: string): string | undefined {
  return file.match(/^(apps|packages)\/[^/]+/u)?.[0];
}

export function validateImport(file: string, specifier: string): string | undefined {
  const target = specifier.startsWith('.')
    ? normalized(relative('/', resolve('/', file, '..', specifier)))
    : specifier.startsWith('@/')
      ? `apps/web/src/${specifier.slice(2)}`
      : specifier;
  const nodeOnly = specifier.startsWith('node:') || nodeModules.has(specifier);
  const serverSdk = /^(express|mongodb|helmet)(\/|$)/u.test(specifier);
  const external = !specifier.startsWith('.') && !specifier.startsWith('@/');

  if (
    specifier.startsWith('@aufnehmen/') &&
    !['@aufnehmen/contracts', '@aufnehmen/testing'].includes(specifier)
  ) {
    return 'Use a declared workspace public entry point; deep package imports are forbidden.';
  }
  if (workspace(target) && workspace(file) !== workspace(target)) {
    return 'Cross-workspace imports must use a declared package public entry point.';
  }
  if (
    file.startsWith('apps/web/src/') &&
    (nodeOnly || serverSdk || target.startsWith('apps/api/'))
  ) {
    return 'Web code reaches backend capabilities through HTTP and shared contracts.';
  }
  if (
    file.startsWith('packages/contracts/src/') &&
    (nodeOnly || serverSdk || target.startsWith('apps/') || (external && specifier !== 'zod'))
  ) {
    return 'Contracts must remain independent of application, test, and server implementation.';
  }
  if (/^apps\/api\/src\/modules\/[^/]+\/(domain|application)\//u.test(file)) {
    if (
      nodeOnly ||
      serverSdk ||
      (external && specifier !== '@aufnehmen/contracts') ||
      /^apps\/api\/src\/shared\/mongo(?:\/|$)/u.test(target) ||
      /(^|\/)(bootstrap|infrastructure|presentation|http|config|logging)(\/|$)/u.test(target)
    ) {
      return 'Domain and application code must depend on ports, not framework or infrastructure adapters.';
    }
  }
  const originModule = file.match(/^apps\/api\/src\/modules\/([^/]+)\//u)?.[1];
  const targetModule = target.match(/^apps\/api\/src\/modules\/([^/]+)\//u)?.[1];
  if (originModule && targetModule && originModule !== targetModule) {
    return 'API modules must communicate through application-owned ports, not another module internals.';
  }
  if (specifier === '@aufnehmen/testing') return 'Production source must not import test fixtures.';
  return undefined;
}

export function checkSource(file: string, contents: string): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = [];
  const source = ts.createSourceFile(file, contents, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node): void => {
    let value: ts.Expression | undefined;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) value = node.moduleSpecifier;
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
      value = node.argument.literal;
    if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference))
      value = node.moduleReference.expression;
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    )
      value = node.arguments[0];
    if (value) {
      const line = source.getLineAndCharacterOfPosition(value.getStart(source)).line + 1;
      if (!ts.isStringLiteralLike(value))
        issues.push({
          file,
          line,
          message: 'Computed module loading prevents architecture validation; use a static import.',
        });
      else {
        const message = validateImport(file, value.text);
        if (message) issues.push({ file, line, message });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return issues;
}

export function checkArchitecture(root: string): ArchitectureIssue[] {
  return ['apps', 'packages']
    .flatMap((directory) => sourceFiles(resolve(root, directory)))
    .flatMap((path) => {
      const file = normalized(relative(root, path));
      if (!file.includes('/src/')) return [];
      return checkSource(file, readFileSync(path, 'utf8'));
    });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const issues = checkArchitecture(process.cwd());
  for (const issue of issues) console.error(`${issue.file}:${issue.line}: ${issue.message}`);
  if (issues.length) process.exitCode = 1;
  else console.log('Architecture boundaries passed.');
}
