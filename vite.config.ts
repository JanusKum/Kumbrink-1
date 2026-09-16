import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path matches the GitHub Pages project site URL (/<repo-name>/).
// Override with VITE_BASE_PATH if deploying elsewhere (e.g. Vercel/Netlify use '/').
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/Kumbrink-1/',
})
