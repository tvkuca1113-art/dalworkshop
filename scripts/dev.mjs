import { spawn } from 'node:child_process';

// Keep Next.js as the runtime; also accept the preview service's Vite-style flags.
const input = process.argv.slice(2);
const args = [];
for (let i = 0; i < input.length; i++) {
  if (input[i] === '--strictPort') continue;
  if (input[i] === '--host') args.push('--hostname', input[++i]);
  else args.push(input[i]);
}
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', ...args], { stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => { process.exitCode = code ?? 1; });
