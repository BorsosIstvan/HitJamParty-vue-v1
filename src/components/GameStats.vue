<template>
  <div class="game-stats-container">
    <p class="stats-row">🎴 Active albums: <strong>{{ albumCount }}</strong></p>
    <p class="stats-row">🎵 Total songs in game: <strong>{{ totalSongsCount }}</strong></p>
    
    <!-- PROGRESS TRACKING -->
    <p class="stats-row progress-row">
      📊 Progress: <strong>{{ playedSongsCount }} / {{ totalSongsCount }}</strong> songs played
    </p>
    <p class="stats-row remaining-row">
      🃏 Remaining in deck: <strong>{{ remainingSongsCount }}</strong> songs
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Define the incoming parameters (React Props) in English
const props = defineProps({
  albumList: { type: Array, required: true },
  deck: { type: Array, required: true }
})

// Computed properties for high-performance automatic caching
const albumCount = computed(() => props.albumList.length)

const totalSongsCount = computed(() => {
  return props.albumList.reduce((sum, album) => {
    return sum + (album.songs ? album.songs.length : 0)
  }, 0)
})

const remainingSongsCount = computed(() => {
  return props.deck.length === 0 ? totalSongsCount.value : props.deck.length
})

const playedSongsCount = computed(() => {
  return totalSongsCount.value - remainingSongsCount.value
})
</script>

<style scoped>
/* Inline stijlen netjes opgeruimd in scoped CSS */
.game-stats-container {
  margin: 15px 0;
  padding: 10px;
  border-top: 1px solid rgba(255, 69, 0, 0.2);
  border-bottom: 1px solid rgba(255, 69, 0, 0.2);
  font-size: 14px;
  opacity: 0.8;
}

.stats-row {
  margin: 5px 0;
}

.progress-row {
  color: #ff8c00;
}

.remaining-row {
  color: #ffa500;
}
</style>
