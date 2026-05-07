import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  root: process.cwd(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  publicDir: path.resolve(process.cwd(), 'public'),
  server: {
    port: 5173,
  },
})
