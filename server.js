/**
 * Startup script for Azure App Service (and other hosts that set PORT).
 * Ensures Next.js listens on process.env.PORT and 0.0.0.0 so the app is reachable.
 * Uses Node directly (no npx) for reliable startup on Azure.
 */
const { spawn } = require('child_process');
const path = require('path');

const port = String(process.env.PORT || 3000);
const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

const child = spawn(
  process.execPath,
  [nextBin, 'start', '-H', '0.0.0.0', '-p', port],
  {
    stdio: 'inherit',
    env: { ...process.env, PORT: port },
    cwd: __dirname,
  }
);

child.on('exit', (code, signal) => {
  process.exit(code !== null ? code : signal ? 1 : 0);
});
