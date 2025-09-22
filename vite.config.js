import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const apiTarget = isDev ? 'http://localhost:3001' : 'https://ss.bot.prnt.gg'
  
    // Base URL for production - should match your deployment URL
  const base = isDev ? '/' : '/'
  
  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Sensory Smiles - Visual Schedule App',
        short_name: 'Sensory Smiles',
        description: 'Visual scheduling app for children with sensory needs',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base,
  server: {
    port: 5173,
    strictPort: true,
    open: isDev,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: !isDev,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/uploads': {
        target: apiTarget,
        changeOrigin: true,
        secure: !isDev
      }
    }
  }
  }
})
