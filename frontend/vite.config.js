import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envDir: '../', // 👈 Tell Vite to look one level up (the global project root) for the .env
  server: {
    port: 5173,
    host: 'localhost'
  }
})