import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    commonjsOptions: {
      include: [/firebase/, /node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  base: './',
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth', 
      'firebase/firestore',
      'firebase/messaging',
      'firebase-admin'
    ]
  },
  define: {
    global: 'globalThis'
  }
})

