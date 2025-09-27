import { defineConfig } from 'vitest/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'

// Type assertion to handle version incompatibility between Vite 6.x and Vitest 3.x
const tsconfigPaths = viteTsConfigPaths({
  projects: ['./tsconfig.json'],
}) as unknown  as Plugin

export default defineConfig({
  plugins: [tsconfigPaths],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
})