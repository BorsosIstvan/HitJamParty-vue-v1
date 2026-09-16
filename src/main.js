import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register' // 1. Importáljuk a SW regisztrálót

// 2. Regisztráljuk a Service Workert az azonnali frissítési logikáddal
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("🔥 Új HitJamParty verzió elérhető! Azonnali frissítés...");
    // Ha van új kód a GitHub Pages-en, azonnal felülírjuk a régit:
    updateSW(true)
  },
  onOfflineReady() {
    console.log("📲 Az alkalmazás készen áll az offline játékra!")
  }
})

// 3. Elindítjuk a Vue alkalmazást
createApp(App).mount('#app')
