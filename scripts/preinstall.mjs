// Root preinstall guard. Same behaviour as the old `sh -c` one-liner, but in
// Node so it also runs on Windows (cmd.exe / PowerShell have no `sh`).
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
for (const file of ['package-lock.json', 'yarn.lock']) rmSync(`${root}/${file}`, { force: true });

if (!(process.env.npm_config_user_agent ?? '').startsWith('pnpm/')) {
  console.error('Use pnpm instead');
  process.exit(1);
}
