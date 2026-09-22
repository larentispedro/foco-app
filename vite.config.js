import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base precisa bater com o caminho onde o GitHub Pages serve o site:
// - repo tipo usuario.github.io/NOME-DO-REPO  -> base: '/NOME-DO-REPO/'
// - repo tipo usuario.github.io (site raiz)    -> base: '/'
// Sobrescreva via variável de ambiente no build (ver README) em vez de
// editar aqui toda vez que mudar de repositório.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
