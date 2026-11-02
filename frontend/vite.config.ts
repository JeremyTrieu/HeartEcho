import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/user': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/post': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/comment': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/notification': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
