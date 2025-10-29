import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    cloudflare({ 
      viteEnvironment: { name: 'ssr' },
      persistState: true,
    }),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
})
