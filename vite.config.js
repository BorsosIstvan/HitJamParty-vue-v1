import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/HitJamParty-vue-v1/' // <-- EZT A SORT ADDD HOZZÁ (pontosan a repo nevével, perjelekkel!)
})
