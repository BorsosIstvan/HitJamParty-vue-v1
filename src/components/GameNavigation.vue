<template>
  <!-- A te gyönyörű, sötét, elválasztó vonalas navigációs sávod -->
  <nav class="hitjam-nav">
    
    <!-- Quiz gomb -->
    <button 
      class="hitjam-nav-btn" 
      :class="{ active: modelValue === 'quiz' }" 
      @click="emit('update:modelValue', 'quiz')"
    >
      <span>🎮</span> Quiz
    </button>

    <!-- Guitar Hero gomb (Az új modulod!) -->
    <button 
      class="hitjam-nav-btn" 
      :class="{ active: modelValue === 'guitar-hero' }" 
      @click="emit('update:modelValue', 'guitar-hero')"
    >
      <span>🎸</span> Guitar Hero
    </button>

    <!-- Inventory (Raktár) gomb -->
    <button 
      class="hitjam-nav-btn" 
      :class="{ active: modelValue === 'inventory' }" 
      @click="emit('update:modelValue', 'inventory')"
    >
      <span>🎒</span> Inventory
    </button>

    <!-- Store (Bolt) gomb -->
    <button 
      class="hitjam-nav-btn" 
      :class="{ active: modelValue === 'store' }" 
      @click="emit('update:modelValue', 'store')"
    >
      <span>🪙</span> Store
    </button>
    
    <!-- Admin gomb (Csak akkor jelenik meg, ha a belépett felhasználó 'poci') -->
    <button 
      v-if="user === 'poci'"
      class="hitjam-nav-btn" 
      :class="{ active: modelValue === 'admin' }" 
      @click="emit('update:modelValue', 'admin')"
      style="color: #00ff64;"
    >
      <span>👑</span> Admin
    </button>

  </nav>
</template>

<script setup>
defineProps({
  modelValue: String, // Ebbe jön az aktuálisan kiválasztott nézet (pl: 'quiz')
  user: String        // Ezt a jogosultság ellenőrzéshez (poci) használjuk
})

const emit = defineEmits(['update:modelValue'])
</script>
