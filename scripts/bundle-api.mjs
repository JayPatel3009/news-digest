import { build } from 'esbuild';
import { rm } from 'node:fs/promises';

const routes = ['news', 'summarise', 'deep-dive'];

await rm('api', { recursive: true, force: true });

await build({
  entryPoints: routes.map((route) => ({
    in: `server/routes/${route}.ts`,
    out: route,
  })),
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'api',
  outExtension: { '.js': '.js' },
  external: ['@google/generative-ai'],
  logLevel: 'info',
});
