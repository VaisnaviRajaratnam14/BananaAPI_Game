import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: '../../',
  envPrefix: ['VITE_', 'GOOGLE_'],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true,
    },
  },
  preview: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
  },
})
