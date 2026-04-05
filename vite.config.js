import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/wcag-audit-tool/',
  plugins: [react()],
})