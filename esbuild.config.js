import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  packages: 'external',
  format: 'esm',
  outdir: 'dist',
  external: [
    '@vitejs/plugin-react',
    'vite',
    '../vite.config.ts',
    './vite.config.ts',
    'react'
  ],
  define: {
    'import.meta.dirname': '__dirname'
  },
  banner: {
    js: 'import { createRequire } from "module"; import { fileURLToPath } from "url"; import { dirname } from "path"; const require = createRequire(import.meta.url); const __dirname = dirname(fileURLToPath(import.meta.url));'
  }
}).catch(() => process.exit(1));