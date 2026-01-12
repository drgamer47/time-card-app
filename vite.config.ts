import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure service worker and manifest are copied
    rollupOptions: {
      input: {
        main: './index.html',
      }
    }
  },
  server: {
    port: 3002
  },
  publicDir: 'public'
})
