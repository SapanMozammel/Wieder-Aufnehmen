// This module has no filesystem, process, network or dependency imports. The
// caller supplies the same guarded reader for installed and staged contexts.
const STATES = new Set([
  'draft',
  'discovery',
  'ready',
  'in_progress',
  'verification',
  'review',
  'complete',
  'blocked',
  'cancelled',
]);
const DEPENDENCY_GATED = new Set(['ready', 'in_progress', 'verification', 'review', 'complete']);
const SECTIONS = ['Objective', 'Scope', 'Acceptance', 'Evidence', 'Handoff'];
const plain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const meaningful = (value) => {
  if (!text(value)) return false;
  const content = value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\s*[-*+]\s*\[[ xX]\]\s*/gm, '')
    .replace(/[#*_`\s.-]/g, '');
  return (
    /[\p{L}\p{N}]/u.test(content) &&
    !/^(?:todo|tbd|pending|none|n\/?a|placeholder|filllater)$/i.test(content)
  );
};
const validDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

function safeRelative(file) {
  return (
    text(file) &&
    !/[\\\u0000-\u001f\u007f:%?#]/.test(file) &&
    !file.startsWith('/') &&
    file.split('/').every((part) => part && part !== '.' && part !== '..')
  );
}
function protectedTarget(file) {
  return file
    .split('/')
    .some(
      (part) => /^(?:\.git|node_modules|\.ssh|\.aws|\.gnupg)$/i.test(part) || /^\.env/i.test(part),
    );
}
function documentPath(file) {
  return safeRelative(file) && !protectedTarget(file) && /\.(?:md|json)$/.test(file);
}
function ownedPath(file) {
  const normalized = file.endsWith('/') ? file.slice(0, -1) : file;
  return (
    safeRelative(normalized) &&
    !protectedTarget(normalized) &&
    !/[?{}[\]]/.test(normalized) &&
    !normalized.split('/')[0].includes('*') &&
    !/^(?:todo|tbd|none|list explicit paths or scoped globs)$/i.test(normalized)
  );
}

/**
 * Validate project-owned context without executing declared commands.
 * readFile(relativePath) must synchronously return a string or null and guard
 * symlinks/root boundaries. today is an optional ISO date for reproducible checks.
 * Diagnostics are strings; context is partial when validation fails.
 */
export function validateContext({ readFile, today = new Date().toISOString().slice(0, 10) }) {
  const errors = [];
  const warnings = [];
  const context = { manifest: null, project: null, task: null };
  const result = () => ({ ok: errors.length === 0, errors, warnings, context });
  if (typeof readFile !== 'function') {
    errors.push('Context validation requires a guarded readFile(relativePath) callback.');
    return result();
  }
  if (!validDate(today)) {
    errors.push('Context validation today must be a real ISO date (YYYY-MM-DD).');
    return result();
  }
  const cache = new Map();
  function read(file, label) {
    if (!safeRelative(file)) {
      errors.push(`Unsafe relative path for ${label}: ${String(file)}`);
      return null;
    }
    if (!documentPath(file)) {
      errors.push(`${label} must be a project instruction artifact (.md or .json): ${file}`);
      return null;
    }
    if (cache.has(file)) return cache.get(file);
    if (cache.size >= 256) {
      errors.push(
        `Context exceeds 256 linked artifacts; narrow the current task context before reading ${file}.`,
      );
      return null;
    }
    let value = null;
    try {
      value = readFile(file);
      if (value !== null && typeof value !== 'string')
        throw new Error('reader must return text or null');
      if (typeof value === 'string' && value.length > 2_000_000)
        throw new Error('artifact exceeds 2,000,000 characters');
      if (value === null) errors.push(`Missing ${label}: ${file}`);
      else if (!value.trim()) errors.push(`Empty ${label}: ${file}`);
    } catch (error) {
      errors.push(
        `Cannot read ${label} ${file}: ${error instanceof Error ? error.message : String(error)}`,
      );
      value = null;
    }
    cache.set(file, value);
    return value;
  }
  function parse(file, label) {
    const value = read(file, label);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch {
      errors.push(`Invalid JSON: ${file}`);
      return null;
    }
  }
  const linked = new Set();
  function visitDocument(file, label) {
    const value = read(file, label);
    if (value === null || linked.has(file)) return;
    linked.add(file);
    if (!file.endsWith('.md')) return;
    // Recognize ordinary inline Markdown links and reference definitions. Code
    // examples are intentionally excluded. This is not a full Markdown parser.
    const prose = value
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, '')
      .replace(/`[^`\n]*`/g, '');
    const targets = [
      ...prose.matchAll(/!?\[[^\]\n]*\]\(\s*(?:<([^>\n]+)>|([^\s)]+))(?:\s+["'][^\n]*["'])?\s*\)/g),
      ...prose.matchAll(/^\s*\[[^\]\n]+\]:\s*(?:<([^>\n]+)>|(\S+))/gm),
    ];
    for (const match of targets) {
      const target = match[1] ?? match[2];
      if (/^(?:https?:\/\/|mailto:|#)/i.test(target)) continue;
      if (
        /^[a-z][a-z\d+.-]*:/i.test(target) ||
        target.startsWith('/') ||
        target.includes('\\') ||
        target.includes('%')
      ) {
        errors.push(`Unsafe linked target in ${file}: ${target}`);
        continue;
      }
      const pathname = target.split(/[?#]/)[0];
      if (!pathname) continue;
      const parts = file.split('/').slice(0, -1);
      let escaped = false;
      for (const part of pathname.split('/')) {
        if (part === '..') {
          if (!parts.length) {
            escaped = true;
            break;
          }
          parts.pop();
        } else if (part && part !== '.') parts.push(part);
      }
      const resolved = parts.join('/');
      if (escaped || !safeRelative(resolved) || protectedTarget(resolved)) {
        errors.push(`Unsafe linked target in ${file}: ${target}`);
      } else if (/\.(?:md|json)$/.test(resolved)) {
        visitDocument(resolved, `linked document from ${file}`);
      }
    }
  }
  function pathArray(value, label, nonempty = false) {
    if (!Array.isArray(value) || (nonempty && !value.length)) {
      errors.push(
        `${label} must be ${nonempty ? 'a nonempty' : 'an'} array of repository-relative artifact paths; use [] when no references apply.`,
      );
      return [];
    }
    const seen = new Set();
    for (const file of value) {
      if (seen.has(file)) errors.push(`Duplicate ${label}: ${String(file)}`);
      seen.add(file);
      visitDocument(file, label.startsWith('manifest') ? 'manifest target' : `${label} target`);
    }
    return value.filter(documentPath);
  }
  const manifest = parse('.ai/manifest.json', 'project manifest');
  context.manifest = manifest;
  if (
    !plain(manifest) ||
    manifest.schemaVersion !== 1 ||
    manifest.projectProfile !== '.ai/project.json'
  ) {
    errors.push(
      'Invalid project manifest: require schemaVersion 1 and projectProfile .ai/project.json.',
    );
    return result();
  }
  pathArray(manifest.readOnStart, 'manifest readOnStart', true);
  const workflows = pathArray(manifest.workflows, 'manifest workflows', true);
  if (!read('AGENTS.md', 'project instructions')?.includes('.ai/manifest.json'))
    errors.push('AGENTS.md must link to the project manifest.');
  const project = parse(manifest.projectProfile, 'project profile');
  context.project = project;
  function requireText(value, label) {
    if (!text(value)) errors.push(`Missing ${label}.`);
  }
  function deferral(value, label) {
    for (const field of ['owner', 'trigger', 'fallback', 'expires'])
      requireText(value[field], `${label} ${field}`);
    if (text(value.expires)) {
      if (!validDate(value.expires))
        errors.push(`${label} expires must be a real ISO date (YYYY-MM-DD).`);
      else if (value.expires < today)
        errors.push(
          `${label} expired on ${value.expires}; resolve it or record an owner-reviewed renewed expiry and fallback.`,
        );
    }
  }
  if (!plain(project) || project.schemaVersion !== 1) {
    errors.push('Invalid project profile: require a JSON object with schemaVersion 1.');
  } else {
    requireText(project.name, 'project name');
    requireText(project.stack, 'project stack');
    if (!Array.isArray(project.protectedBoundaries))
      errors.push('Invalid project profile: protectedBoundaries must be an array.');
    else
      for (const boundary of project.protectedBoundaries)
        requireText(boundary, 'protected boundary');
    for (const field of ['architectureDocuments', 'designDocuments', 'externalReferences'])
      pathArray(project[field], `project ${field}`);
    if (!Array.isArray(project.commands))
      errors.push('Invalid project profile: commands must be an array.');
    else {
      const ids = new Set();
      for (const command of project.commands) {
        if (!plain(command)) {
          errors.push('Invalid project command: require a command object.');
          continue;
        }
        requireText(command.id, 'command id');
        requireText(command.command, 'command text');
        if (
          ids.has(command.id) ||
          !['read-only', 'local-write', 'external-write'].includes(command.mode) ||
          !['available', 'deferred'].includes(command.status)
        )
          errors.push('Invalid or duplicate project command.');
        ids.add(command.id);
        if (command.status === 'deferred') deferral(command, 'deferred command');
      }
    }
    if (project.deferrals !== undefined) {
      if (!Array.isArray(project.deferrals)) errors.push('Project deferrals must be an array.');
      else {
        const ids = new Set();
        for (const entry of project.deferrals) {
          if (!plain(entry)) {
            errors.push('Invalid project deferral: require an object.');
            continue;
          }
          requireText(entry.id, 'deferral id');
          requireText(entry.reason, 'deferral reason');
          if (ids.has(entry.id)) errors.push(`Duplicate deferral id: ${String(entry.id)}`);
          ids.add(entry.id);
          deferral(entry, `deferral ${entry.id ?? '(missing id)'}`);
        }
      }
    }
  }
  const tasks = new Map();
  const visiting = new Set();
  function visitTask(file, chain = []) {
    if (visiting.has(file)) {
      errors.push(`Task dependency cycle: ${[...chain, file].join(' -> ')}`);
      return tasks.get(file);
    }
    if (tasks.has(file)) return tasks.get(file);
    if (tasks.size >= 64) {
      errors.push('Task dependency graph exceeds 64 tasks; narrow the current task.');
      return null;
    }
    const isCurrent = file === manifest.currentTask;
    const label = isCurrent ? 'Current task' : `Dependency task ${file}`;
    if (!documentPath(file) || !file.endsWith('.md')) {
      read(file, 'manifest target');
      if (documentPath(file)) errors.push(`${label} must reference a Markdown task (.md).`);
      return null;
    }
    const source = read(file, isCurrent ? 'manifest target' : 'dependency task');
    if (source === null) return null;
    const value = source.replace(/<!--[\s\S]*?-->/g, '');
    const headings = [...value.matchAll(/^##\s+([^\n\r]+)\r?$/gm)];
    const sections = new Map();
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i][1].trim();
      if (sections.has(heading)) errors.push(`${label} has duplicate ## ${heading}.`);
      sections.set(
        heading,
        value.slice(
          headings[i].index + headings[i][0].length,
          headings[i + 1]?.index ?? value.length,
        ),
      );
    }
    const header = value.slice(0, headings[0]?.index ?? value.length);
    function field(name) {
      const values = [...header.matchAll(new RegExp(`^${name}:([^\\n\\r]*)\\r?$`, 'gm'))];
      if (values.length > 1) errors.push(`${label} has duplicate ${name} metadata.`);
      return values[0]?.[1].trim() ?? '';
    }
    for (const name of SECTIONS) {
      if (!sections.has(name)) errors.push(`${label} missing ## ${name}.`);
      else if (!meaningful(sections.get(name)))
        errors.push(
          `${label} requires nonempty ## ${name} content; replace placeholders with concrete task context.`,
        );
    }
    if (field('Task schema') !== '1')
      errors.push(
        `${label} requires explicit migration: add Task schema: 1, Risk, Workflow and Dependencies metadata using the current task template; preserve historical task files.`,
      );
    const status = field('Status');
    if (!STATES.has(status))
      errors.push(`${label} requires an explicit supported Status (${[...STATES].join(', ')}).`);
    const ownedFiles = field('Owned files')
      .split(',')
      .map((entry) => entry.trim());
    if (ownedFiles.some((entry) => !ownedPath(entry)))
      errors.push(
        `${label} requires nonempty scoped Owned files: list safe repository-relative paths or directory-scoped globs; no root-wide ownership, traversal or placeholders.`,
      );
    if (new Set(ownedFiles).size !== ownedFiles.length)
      errors.push(`${label} has duplicate Owned files.`);
    const risk = field('Risk');
    if (!['low', 'medium', 'high'].includes(risk))
      errors.push(`${label} requires explicit Risk: low, medium or high.`);
    const selectedWorkflow = field('Workflow');
    if (!workflows.includes(selectedWorkflow))
      errors.push(`${label} Workflow must name a path registered in manifest.workflows.`);
    if (!selectedWorkflow.endsWith('.md'))
      errors.push(`${label} Workflow must be a Markdown instruction document (.md).`);
    const dependencyText = field('Dependencies');
    const dependencies =
      dependencyText === 'none' ? [] : dependencyText.split(',').map((entry) => entry.trim());
    if (!dependencyText)
      errors.push(`${label} requires explicit Dependencies: none or comma-separated task paths.`);
    if (new Set(dependencies).size !== dependencies.length)
      errors.push(`${label} has duplicate Dependencies.`);
    if (status === 'complete') {
      if (!meaningful(sections.get('Review')))
        errors.push(
          `${label} complete status requires nonempty ## Review content identifying reviewed changes, findings and residual risk.`,
        );
      if (/^\s*[-*+]\s*\[\s\]/m.test(sections.get('Acceptance') ?? ''))
        errors.push(`${label} complete status has unchecked items in ## Acceptance.`);
    }
    const parsed = {
      path: file,
      status,
      ownedFiles,
      risk,
      workflow: selectedWorkflow,
      dependencies,
    };
    tasks.set(file, parsed);
    visiting.add(file);
    for (const dependency of dependencies) {
      if (!documentPath(dependency) || !/^\.ai\/tasks\/.+\.md$/.test(dependency)) {
        errors.push(`${label} dependency must be a safe .ai/tasks/*.md artifact: ${dependency}`);
        continue;
      }
      const prerequisite = visitTask(dependency, [...chain, file]);
      if (prerequisite && DEPENDENCY_GATED.has(status) && prerequisite.status !== 'complete')
        errors.push(
          `${label} dependency ${dependency} must be complete before status ${status}; use draft, discovery or blocked while waiting.`,
        );
    }
    visiting.delete(file);
    visitDocument(file, label);
    return parsed;
  }
  context.task = visitTask(manifest.currentTask);
  return result();
}
