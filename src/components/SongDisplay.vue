<template>
  <div class="song-display-container">
    
    <!-- IF NOT ANSWERED YET -> Hidden quiz view -->
    <template v-if="!answered">
      <h3 class="quiz-title">🎵 GUESS THE SONG!</h3>
      <p class="quiz-subtitle">Listen to the music and guess below...</p>
    </template>

    <!-- IF ANSWERED -> Reveal the real song details -->
    <template v-else>
      <h3 class="song-title animate-fade">{{ trackName }}</h3>
      <p class="song-artist animate-fade">{{ artistName }}</p>
      <p class="song-year">📅 {{ year }}</p>
    </template>

  </div>
</template>

<script setup>
// Define the incoming parameters (React Props) in English
defineProps({
  trackName: { type: String, required: true },
  artistName: { type: String, required: true },
  year: { type: [Number, String], required: true },
  answered: { type: Boolean, default: false }
})
</script>

<style scoped>
.song-display-container {
  margin: 20px 0;
  min-height: 80px;
}

/* Hidden quiz view styles */
.quiz-title {
  margin: 0;
  color: #ff4500;
  font-size: 24px;
  letter-spacing: 1px;
}

.quiz-subtitle {
  margin: 8px 0 0 0;
  opacity: 0.5;
  font-style: italic;
  font-size: 14px;
}

/* Revealed song view styles */
.song-title {
  margin: 0;
  color: #fff;
  font-size: 22px;
}

.song-artist {
  margin: 5px 0 0 0;
  color: #ff8c00;
  font-weight: bold;
}

.song-year {
  margin: 8px 0 0 0;
  opacity: 0.8;
  color: #ff4500;
  font-size: 16px;
  font-weight: bold;
}

/* Clean CSS Animation for the fade-in effect */
.animate-fade {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
