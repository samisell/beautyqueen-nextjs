const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logPath = path.join(process.cwd(), 'dev.log');
const out = fs.createWriteStream(logPath, { flags: 'a' });

function resolveNextBin() {
  try {
    return require.resolve('next/dist/bin/next');
  } catch (e) {
    return 'next';
  }
}

const nextBin = resolveNextBin();

const portArgIndex = process.argv.indexOf('--port');
const port = portArgIndex !== -1 ? process.argv[portArgIndex + 1] : '3000';

const child = spawn(process.execPath, [nextBin, 'dev', '-p', port], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_OPTIONS: (process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS + ' ' : '') + '--openssl-legacy-provider'
  }
});

child.stdout.pipe(process.stdout);
child.stdout.pipe(out);
child.stderr.pipe(process.stderr);
child.stderr.pipe(out);

child.on('exit', (code) => {
  out.end();
  process.exit(code);
});
