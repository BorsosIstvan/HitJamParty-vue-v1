import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa' // 1. Importáljuk a PWA plugint

export default defineConfig({
  base: '/', // A saját domain (hero.hitjamparty.com) miatt ez most már tiszta '/'
  plugins: [
    vue(), // A React() helyett most a Vue plugin fut
    
    // 2. Beállítjuk a PWA-t és a Manifestet
    VitePWA({
      registerType: 'prompt', // Automatikusan felugrik vagy kezelhető, ha új kód van
      manifest: {
        name: 'HitJam Party Kvíz',
        short_name: 'HitJamParty',
        description: 'A zseniális zenefelismerő bulijáték a Raspberry Pi-dről!',
        theme_color: '#0b0c10',      /* Az appcontainer sötét alapértelmezett színe */
        background_color: '#0b0c10', /* Betöltési háttérszín mobilon */
        display: 'standalone',       /* EZZEL TŰNIK EL A BÖNGÉSZŐSÁV! */
        orientation: 'portrait',     /* Függőleges mobil nézetre kényszerítés */
        icons: [
          {
            src: 'icon/hitjamparty-192.png',  /* A public/icon/icon-192.png fájlra mutat */
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon/hitjamparty-512.png',  /* A public/icon/icon-512.png fájlra mutat */
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon/hitjamparty-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'  /* Android körbevágáshoz */
          }
        ]
      }
    })
  ]
})
