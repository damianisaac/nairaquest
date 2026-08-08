import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'NairaQuest — Financial Adventure',
        short_name: 'NairaQuest',
        description: "Nigeria's #1 financial literacy adventure game. Master money, banking, savings, and more.",
        theme_color: '#008751',
        background_color: '#030712',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['education', 'games', 'finance'],
        icons: [
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' rx='32' fill='%23008751'/><text y='145' x='20' font-size='140' fill='white' font-family='sans-serif'>₦</text></svg>",
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='80' fill='%23008751'/><text y='390' x='40' font-size='380' fill='white' font-family='sans-serif'>₦</text></svg>",
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Play Now',
            url: '/map',
            description: 'Jump to the World Map and start playing',
          },
          {
            name: 'My Profile',
            url: '/profile',
            description: 'View your progress and badges',
          },
        ],
      },
      workbox: {
        // Take control immediately on every new deploy — prevents stale bundle white screens
        skipWaiting: true,
        clientsClaim: true,
        // Cache game assets aggressively for offline play
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
        // Precache all game assets
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three-vendor';
          if (id.includes('framer-motion')) return 'motion-vendor';
          if (id.includes('@supabase')) return 'supabase-vendor';
        },
      },
    },
  },
});
