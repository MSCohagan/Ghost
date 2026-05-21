import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowedHosts = (env.VITE_ALLOWED_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)

  return {
    root: process.cwd(),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    publicDir: path.resolve(process.cwd(), 'public'),
    server: {
      host: '0.0.0.0',
      port: 5173,
      ...(allowedHosts.length > 0 ? { allowedHosts } : {}),
    },
  }
})
