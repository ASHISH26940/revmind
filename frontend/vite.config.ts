import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),tailwindcss(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8000' },
  },
})
