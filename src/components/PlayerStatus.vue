<template>
  <div style="margin-bottom: 10px;">
    <p style="margin: 3px 0;">
      player: <strong>{{ user }}</strong> | score: <strong>{{ score }}</strong>
    </p>
    <p style="margin: 3px 0; font-size: 14px; opacity: 0.8;">
      coins: 🪙 {{ coins }}
    </p>
    
    <button @click="emit('logout')" class="hitjam-btn-logout">
      🚪 Logout
    </button>
  </div>
</template>

<script setup>
defineProps({
  user: String,
  score: Number,
  coins: Number
})

const emit = defineEmits(['logout'])
</script>
