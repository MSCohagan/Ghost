import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  root: process.cwd(),
  publicDir: path.resolve(process.cwd(), 'public'),
  server: {
    port: 5173
  }
})