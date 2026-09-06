export interface PnpmCommand {
  readonly executable: string;
  readonly args: readonly string[];
}

export function createPnpmCommand(
  manager: string | undefined,
  args: readonly string[],
): PnpmCommand {
  if (!manager?.trim()) throw new Error('Run this command through pnpm run.');
  // npm_execpath can identify either pnpm's JavaScript entry point or its native executable.
  return /\.(?:c|m)?js$/iu.test(manager)
    ? { executable: process.execPath, args: [manager, ...args] }
    : { executable: manager, args: [...args] };
}
