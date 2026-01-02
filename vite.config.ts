import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import packageJson from './package.json'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Parse allowed hosts from env variable (comma-separated) or use default
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? ['localhost', ...env.VITE_ALLOWED_HOSTS.split(',').map(h => h.trim())]
    : ['localhost']

  console.log('Allowed Hosts:', allowedHosts)

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/cable': {
          target: 'http://localhost:3000',
          ws: true,
          changeOrigin: true,
        },
      },
      allowedHosts,
    },
  }
})
