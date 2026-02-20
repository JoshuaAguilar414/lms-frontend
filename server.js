/**
 * Startup script for Azure App Service (and other hosts that set PORT).
 * Ensures Next.js listens on process.env.PORT and 0.0.0.0 so the app is reachable.
 */
const { spawn } = require('child_process');

const port = String(process.env.PORT || 3000);

const child = spawn(
  'npx',
  ['next', 'start', '-H', '0.0.0.0', '-p', port],
  {
    stdio: 'inherit',
    env: { ...process.env, PORT: port },
    shell: true,
  }
);

child.on('exit', (code, signal) => {
  process.exit(code !== null ? code : signal ? 1 : 0);
});
