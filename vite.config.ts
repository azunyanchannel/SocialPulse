import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Local dev: run `npm run cf:dev` (wrangler dev on :8787) in another terminal
    // so that `/api/*` calls from `npm run dev` reach the Worker + Workers AI.
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
