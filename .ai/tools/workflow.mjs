import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const VERSION = '1.1.0';
const SOURCE = 'SapanMozammel/auterix';
// Keep historical bundles and locks readable; new releases use the canonical identity.
const SOURCES = new Set([SOURCE, 'SapanMozammel/claude-workflow']);
const LOCK = '.ai/workflow.lock.json';
const GUARD = '.ai/workflow.writer.json';
const PROJECT = new Set([
  'AGENTS.md',
  '.ai/manifest.json',
  '.ai/project.json',
  '.ai/tasks/current.md',
]);
const BRIDGES = new Set([
  'CLAUDE.md',
  '.cursor/rules/workflow.mdc',
  '.augment/rules/workflow.md',
  '.github/copilot-instructions.md',
  '.agents/rules/workflow.md',
]);
const REQUIRED_MANAGED = [
  ...BRIDGES,
  '.ai/adapters.json',
  '.ai/core/start.md',
  '.ai/core/roles.md',
  '.ai/tools/check.mjs',
  '.ai/tools/workflow.mjs',
  ...[
    'product',
    'design',
    'architecture',
    'implementation',
    'verification',
    'security',
    'migration',
    'release',
  ].map((name) => `.ai/core/workflows/${name}.md`),
  ...['task', 'adr', 'design-brief', 'product-brief', 'review', 'handoff', 'tool-verification'].map(
    (name) => `.ai/templates/${name}.md`,
  ),
];
export const digest = (value) =>
  createHash('sha256')
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const fail = (message) => {
  throw new Error(message);
};
const plain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function rootPath(input) {
  if (typeof input !== 'string' || !path.isAbsolute(input))
    fail('An explicit absolute --root is required.');
  const root = fs.realpathSync(input);
  if (root === path.parse(root).root || root === fs.realpathSync(os.homedir()))
    fail('Choose a project directory, not a filesystem or home root.');
  if (!fs.statSync(root).isDirectory()) fail('Project root must be a directory.');
  return root;
}

function relative(file) {
  if (
    typeof file !== 'string' ||
    !file ||
    file.includes('\\') ||
    file.includes('\0') ||
    path.posix.isAbsolute(file) ||
    file.split('/').some((part) => !part || part === '.' || part === '..')
  )
    fail(`Unsafe relative path: ${file}`);
  return file;
}

function allowed(file, ownership) {
  relative(file);
  if (ownership === 'project') return PROJECT.has(file);
  return (
    ownership === 'managed' &&
    (BRIDGES.has(file) ||
      file === '.ai/adapters.json' ||
      /^\.ai\/(core|templates|tools)\/[a-zA-Z0-9_./-]+\.(md|json|mjs)$/.test(file))
  );
}

// Every existing component below the resolved root must be a real directory/file.
export function safePath(root, file) {
  relative(file);
  let current = root;
  const parts = file.split('/');
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (stat.isSymbolicLink()) fail(`Symlink boundary: ${file}`);
    if (i < parts.length - 1 && !stat.isDirectory()) fail(`Non-directory parent: ${file}`);
    if (i === parts.length - 1 && !stat.isFile()) fail(`Expected regular file: ${file}`);
    if (stat.isFile() && stat.nlink !== 1)
      fail(`Hard-linked file is not writable by adoption: ${file}`);
  }
  return current;
}

function read(root, file) {
  const target = safePath(root, file);
  try {
    if (fs.statSync(target).size > 2_000_000) fail(`File too large: ${file}`);
    return fs.readFileSync(target, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function parse(text, label) {
  try {
    return JSON.parse(text);
  } catch {
    fail(`Invalid JSON: ${label}`);
  }
}

export function validateBundle(bundle) {
  if (
    !plain(bundle) ||
    bundle.schemaVersion !== 1 ||
    typeof bundle.version !== 'string' ||
    !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(bundle.version) ||
    !SOURCES.has(bundle.source) ||
    !Array.isArray(bundle.files) ||
    !bundle.files.length ||
    bundle.files.length > 200
  )
    fail('Invalid bundle metadata.');
  let total = 0;
  const seen = new Set();
  for (const file of bundle.files) {
    if (
      !plain(file) ||
      !allowed(file.path, file.ownership) ||
      typeof file.content !== 'string' ||
      Buffer.byteLength(file.content, 'utf8') > 1_000_000 ||
      seen.has(file.path.toLowerCase())
    )
      fail('Invalid, duplicate, or disallowed bundle file.');
    total += Buffer.byteLength(file.content, 'utf8');
    seen.add(file.path.toLowerCase());
  }
  if (total > 5_000_000) fail('Bundle is too large.');
  for (const file of seen) {
    const components = file.split('/');
    for (let i = 1; i < components.length; i++) {
      if (seen.has(components.slice(0, i).join('/')))
        fail(`Bundle file/ancestor collision: ${file}`);
    }
  }
  if (![...PROJECT, ...REQUIRED_MANAGED].every((file) => seen.has(file.toLowerCase())))
    fail('Bundle is missing required files.');
  const { sourceDigest, ...payload } = bundle;
  if (sourceDigest !== digest(payload)) fail('Bundle content digest mismatch.');
  return bundle;
}

export function buildBundle(sourceRoot) {
  const files = [];
  function walk(directory, prefix, ownership) {
    for (const entry of fs
      .readdirSync(directory, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const next = path.join(directory, entry.name);
      const file = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) fail(`Source symlink: ${file}`);
      if (entry.isDirectory()) walk(next, file, ownership);
      else if (entry.isFile())
        files.push({ path: file, ownership, content: fs.readFileSync(next, 'utf8') });
      else fail(`Unsupported source entry: ${file}`);
    }
  }
  walk(path.join(sourceRoot, 'baseline/managed'), '', 'managed');
  walk(path.join(sourceRoot, 'baseline/project'), '', 'project');
  files.push({
    path: '.ai/tools/workflow.mjs',
    ownership: 'managed',
    content: fs.readFileSync(path.join(sourceRoot, 'lib/workflow.mjs'), 'utf8'),
  });
  files.sort((a, b) => a.path.localeCompare(b.path));
  const payload = {
    schemaVersion: 1,
    version: VERSION,
    source: SOURCE,
    files,
  };
  return validateBundle({ ...payload, sourceDigest: digest(payload) });
}

function loadLock(root) {
  const content = read(root, LOCK);
  if (content === null) return null;
  const lock = parse(content, LOCK);
  if (
    !plain(lock) ||
    lock.schemaVersion !== 1 ||
    !SOURCES.has(lock.source) ||
    typeof lock.version !== 'string' ||
    !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(lock.version) ||
    Object.keys(lock).some(
      (key) => !['schemaVersion', 'source', 'version', 'sourceDigest', 'files'].includes(key),
    ) ||
    !plain(lock.files) ||
    !/^[a-f0-9]{64}$/.test(lock.sourceDigest)
  )
    fail('Invalid workflow lock.');
  for (const [file, hash] of Object.entries(lock.files)) {
    if (!allowed(file, 'managed') || !/^[a-f0-9]{64}$/.test(hash))
      fail('Invalid managed entry in workflow lock.');
  }
  if (!REQUIRED_MANAGED.every((file) => Object.hasOwn(lock.files, file)))
    fail('Workflow lock is missing required managed entries.');
  return lock;
}

export function inspect(input) {
  const root = rootPath(input);
  const markers = [
    'package.json',
    'pnpm-lock.yaml',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'README.md',
    'AGENTS.md',
    'CLAUDE.md',
    '.ai/manifest.json',
  ];
  const present = markers.filter((file) => {
    try {
      return fs.lstatSync(path.join(root, file)).isFile();
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  });
  const legacyCandidates = [
    '.claude/settings.json',
    '.claude/settings.local.json',
    '.claude/commands',
    '.claude/agents',
    '.claude/skills',
    '.agent/rules',
    '.cursorrules',
    '.augment-guidelines',
  ];
  const legacyGuidance = legacyCandidates.filter((file) => {
    try {
      fs.lstatSync(path.join(root, file));
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  });
  return {
    root,
    markers: present,
    legacyGuidance,
    installed: read(root, LOCK) !== null,
    notice:
      'File names only; no scripts, credentials, or environment files read. Existing rules and legacy hooks need human conflict review; adoption does not disable them.',
  };
}

export function makePlan(input, bundle, mode = 'install') {
  const root = rootPath(input);
  validateBundle(bundle);
  if (!['install', 'update'].includes(mode)) fail('Invalid plan mode.');
  const lock = loadLock(root);
  if (mode === 'update' && !lock) fail('No managed installation; create an install plan first.');
  if (mode === 'install' && lock) fail('Already installed; use update-plan.');
  if (read(root, GUARD) !== null)
    fail('An adoption writer/recovery journal exists; inspect it before proceeding.');
  const actions = [];
  for (const file of bundle.files) {
    const content = read(root, file.path);
    const before = content === null ? null : digest(content);
    const after = digest(file.content);
    let action;
    if (lock && file.ownership === 'project') action = content === null ? 'create' : 'preserve';
    else if (content === null) action = lock?.files[file.path] ? 'conflict' : 'create';
    else if (before === after) action = 'unchanged';
    else if (file.ownership === 'managed' && lock?.files[file.path] === before) action = 'update';
    else action = 'conflict';
    actions.push({ path: file.path, ownership: file.ownership, action, before, after });
  }
  if (lock) {
    for (const file of Object.keys(lock.files)) {
      if (!bundle.files.some((item) => item.path === file))
        actions.push({
          path: file,
          ownership: 'managed',
          action: 'conflict',
          before: digest(read(root, file) ?? ''),
          after: null,
          reason: 'retired upstream; preserve and review manually',
        });
    }
  }
  const stat = fs.statSync(root);
  const payload = {
    schemaVersion: 1,
    mode,
    root,
    rootIdentity: `${stat.dev}:${stat.ino}`,
    sourceDigest: bundle.sourceDigest,
    lockBefore: read(root, LOCK) === null ? null : digest(read(root, LOCK)),
    actions,
  };
  return { ...payload, planDigest: digest(payload) };
}

function writeFile(root, file, content, create = false) {
  let target = safePath(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  target = safePath(root, file);
  // wx never replaces newly introduced files; r+ avoids truncation before verification.
  const descriptor = fs.openSync(
    target,
    fs.constants.O_WRONLY |
      fs.constants.O_NOFOLLOW |
      (create ? fs.constants.O_CREAT | fs.constants.O_EXCL : 0),
    0o644,
  );
  try {
    if (!fs.fstatSync(descriptor).isFile() || fs.fstatSync(descriptor).nlink !== 1)
      fail(`Unsafe write target: ${file}`);
    fs.writeFileSync(descriptor, content, 'utf8');
    fs.ftruncateSync(descriptor, Buffer.byteLength(content));
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

export function applyPlan(input, bundle, plan) {
  const root = rootPath(input);
  if (!plain(plan) || plan.root !== root || !['install', 'update'].includes(plan.mode))
    fail('Plan root or mode mismatch.');
  const expected = makePlan(root, bundle, plan.mode);
  if (JSON.stringify(plan) !== JSON.stringify(expected))
    fail('Plan changed or project drifted; create and review a new plan.');
  if (plan.actions.some((action) => action.action === 'conflict'))
    fail('Plan has conflicts; no files changed.');
  const writes = plan.actions.filter(
    (action) => action.action === 'create' || action.action === 'update',
  );
  const journal = {
    schemaVersion: 1,
    state: 'writing',
    planDigest: plan.planDigest,
    recovery:
      'Do not retry blindly. Restore these previous contents or complete the recorded plan after review, then remove this journal.',
    previous: Object.fromEntries([
      ...writes.map((item) => [item.path, read(root, item.path)]),
      [LOCK, read(root, LOCK)],
    ]),
  };
  writeFile(root, GUARD, json(journal), true);
  try {
    for (const action of writes) {
      const before = read(root, action.path);
      if ((before === null ? null : digest(before)) !== action.before)
        fail(`Concurrent change: ${action.path}; recovery journal retained.`);
      writeFile(
        root,
        action.path,
        bundle.files.find((file) => file.path === action.path).content,
        action.action === 'create',
      );
    }
    const files = Object.fromEntries(
      bundle.files
        .filter((file) => file.ownership === 'managed')
        .map((file) => [file.path, digest(file.content)]),
    );
    const lock = {
      schemaVersion: 1,
      version: bundle.version,
      source: bundle.source,
      sourceDigest: bundle.sourceDigest,
      files,
    };
    writeFile(root, LOCK, json(lock), plan.lockBefore === null);
    fs.unlinkSync(safePath(root, GUARD));
    return { applied: writes.length, version: bundle.version, sourceDigest: bundle.sourceDigest };
  } catch (error) {
    fail(`${error.message} Recovery journal retained at ${GUARD}.`);
  }
}

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(`Missing ${label}.`);
}

export function check(input) {
  const root = rootPath(input);
  const lock = loadLock(root);
  if (!lock) fail('Workflow lock is missing.');
  if (read(root, GUARD) !== null) fail('Unfinished adoption; inspect workflow.writer.json.');
  const problems = [];
  for (const [file, hash] of Object.entries(lock.files)) {
    const content = read(root, file);
    if (content === null || digest(content) !== hash) problems.push(`Managed file drift: ${file}`);
  }
  if (problems.length) fail(problems.join('\n'));
  const manifest = parse(read(root, '.ai/manifest.json') ?? '', '.ai/manifest.json');
  const project = parse(read(root, '.ai/project.json') ?? '', '.ai/project.json');
  if (
    !plain(manifest) ||
    manifest.schemaVersion !== 1 ||
    manifest.projectProfile !== '.ai/project.json' ||
    !Array.isArray(manifest.readOnStart) ||
    !Array.isArray(manifest.workflows)
  )
    fail('Invalid project manifest.');
  requireText(manifest.currentTask, 'currentTask');
  for (const file of [manifest.currentTask, ...manifest.readOnStart, ...manifest.workflows]) {
    relative(file);
    if (
      !/\.(md|json)$/.test(file) ||
      file
        .split('/')
        .some((part) => part === '.git' || part === 'node_modules' || part.startsWith('.env'))
    )
      fail(`Manifest target must be a project instruction artifact: ${file}`);
    if (read(root, file) === null) fail(`Missing manifest target: ${file}`);
  }
  if (
    !plain(project) ||
    project.schemaVersion !== 1 ||
    !Array.isArray(project.commands) ||
    !Array.isArray(project.protectedBoundaries)
  )
    fail('Invalid project profile.');
  requireText(project.name, 'project name');
  requireText(project.stack, 'project stack');
  for (const boundary of project.protectedBoundaries) requireText(boundary, 'protected boundary');
  if (!read(root, 'AGENTS.md')?.includes('.ai/manifest.json'))
    fail('AGENTS.md must link to the project manifest.');
  const ids = new Set();
  for (const command of project.commands) {
    if (!plain(command)) fail('Invalid command.');
    requireText(command.id, 'command id');
    requireText(command.command, 'command text');
    if (
      ids.has(command.id) ||
      !['read-only', 'local-write', 'external-write'].includes(command.mode) ||
      !['available', 'deferred'].includes(command.status)
    )
      fail('Invalid or duplicate project command.');
    if (command.status === 'deferred') {
      for (const field of ['owner', 'trigger', 'fallback'])
        requireText(command[field], `deferred command ${field}`);
    }
    ids.add(command.id);
  }
  const task = read(root, manifest.currentTask);
  for (const heading of ['## Objective', '## Scope', '## Acceptance', '## Evidence', '## Handoff'])
    if (!task.includes(heading)) fail(`Current task missing ${heading}.`);
  if (!/^Status: (ready|in_progress|blocked|complete)$/m.test(task))
    fail('Current task requires an explicit supported Status.');
  if (!/^Owned files:/m.test(task)) fail('Current task requires Owned files.');
  const adapters = parse(read(root, '.ai/adapters.json') ?? '', '.ai/adapters.json');
  if (!plain(adapters) || adapters.schemaVersion !== 1 || !Array.isArray(adapters.tools))
    fail('Invalid adapter registry.');
  for (const adapter of adapters.tools) {
    if (
      !plain(adapter) ||
      adapter.runtimeStatus !== 'not_verified' ||
      !['documented', 'manual'].includes(adapter.discoveryStatus)
    )
      fail('Adapter runtime claims require a separately reviewed release/evidence model.');
    if (read(root, adapter.entry) === null) fail(`Missing adapter entry: ${adapter.entry}`);
  }
  return {
    ok: true,
    version: lock.version,
    managedFiles: Object.keys(lock.files).length,
    commandsExecuted: 0,
    runtimeToolVerification: 'not_verified',
  };
}

export function ejectPlan(input) {
  const root = rootPath(input);
  const lock = loadLock(root);
  if (!lock) fail('No installed workflow.');
  const files = Object.entries(lock.files).map(([file, hash]) => ({
    path: file,
    recommendation:
      digest(read(root, file) ?? '') === hash
        ? 'eligible-for-reviewed-removal'
        : 'preserve-local-edit',
  }));
  return {
    root,
    previewOnly: true,
    files,
    preserve: [...PROJECT],
    notice:
      'No deletion is executed. Review removal of managed bridges/core plus lock, and update AGENTS/manifest links together. Preserve project history. A Git revert of the adoption commit is the simplest rollback before project edits.',
  };
}

export function readJsonFile(file) {
  if (typeof file !== 'string' || !path.isAbsolute(file))
    fail('Input file paths must be absolute.');
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 8_000_000)
    fail('Input must be a bounded regular JSON file.');
  return parse(fs.readFileSync(file, 'utf8'), file);
}

export function writeNewJson(file, value) {
  if (typeof file !== 'string' || !path.isAbsolute(file))
    fail('--out must be an absolute new file path.');
  const parent = fs.realpathSync(path.dirname(file));
  fs.writeFileSync(path.join(parent, path.basename(file)), json(value), {
    flag: 'wx',
    mode: 0o600,
  });
}
