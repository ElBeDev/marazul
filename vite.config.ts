import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'index.html'),
        rooms:       resolve(__dirname, 'rooms.html'),
        marina:      resolve(__dirname, 'marina.html'),
        activities:  resolve(__dirname, 'activities.html'),
        events:      resolve(__dirname, 'events.html'),
        membership:  resolve(__dirname, 'membership.html'),
      },
    },
  },
})
