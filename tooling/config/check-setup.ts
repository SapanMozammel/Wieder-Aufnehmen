import { spawnSync } from 'node:child_process';
import { RUNTIME } from './check-config.js';

let failed = false;
if (process.versions.node !== RUNTIME.node) {
  console.error(`Use Node ${RUNTIME.node}; found ${process.versions.node}.`);
  failed = true;
}
const manager = process.env.npm_config_user_agent;
if (!manager?.startsWith(`pnpm/${RUNTIME.pnpm} `)) {
  console.error(`Run this check with pnpm ${RUNTIME.pnpm}.`);
  failed = true;
}
const docker = spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], {
  encoding: 'utf8',
  timeout: 5_000,
});
if (docker.status !== 0)
  console.warn(
    'Docker is unavailable. Set a local MongoDB URI or start Docker before integration tests.',
  );
else console.log('Docker is ready for the local replica-set MongoDB.');
process.exitCode = failed ? 1 : 0;
if (!failed) console.log('Pinned development runtime passed.');
