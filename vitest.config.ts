import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    // Mirrors the @/* path alias in tsconfig.json so that any future
    // test files using @/ imports resolve correctly under Vitest.
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
