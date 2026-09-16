<template>
  <!-- De knop gebruikt jouw dögös hitjam-btn klasse uit de main.css -->
  <button class="hitjam-btn" @click="emit('toggle')">
    
    <!-- IF PLAYING -> Show Pause -->
    <template v-if="isPlaying">
      <span>⏸</span>
      <span>Pause</span>
    </template>
    
    <!-- ELSE -> Show Play -->
    <template v-else>
      <span>▶</span>
      <span>Play</span>
    </template>

  </button>
</template>

<script setup>
// React Props definieren in het Engels
defineProps({
  isPlaying: { type: Boolean, default: false }
})

// Het event definieren om de klik omhoog te sturen naar App.vue
const emit = defineEmits(['toggle'])
</script>
