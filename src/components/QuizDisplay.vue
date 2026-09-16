<template>
  <div style="margin: 15px 0;">
    
    <!-- CAPSULE TABS: Elegant switching between quiz modes -->
    <div class="quiz-tabs">
      <button 
        class="quiz-tab-btn" 
        :class="{ active: gameMode === 'year' }"
        @click="!answered && (gameMode = 'year')"
      >
        📅 Year
      </button>
      <button 
        class="quiz-tab-btn" 
        :class="{ active: gameMode === 'artist' }"
        @click="!answered && (gameMode = 'artist')"
      >
        🎤 Artist
      </button>
      <button 
        class="quiz-tab-btn" 
        :class="{ active: gameMode === 'title' }"
        @click="!answered && (gameMode = 'title')"
      >
        🎵 Title
      </button>
    </div>

    <!-- Dynamic question text -->
    <p style="font-size: 15px; font-weight: bold; margin: 10px 0;">
      {{ questionText }}
    </p>
    
    <!-- 2x2 Grid for option buttons -->
    <div class="quiz-grid">
      <!-- In Vue use v-for instead of .map() -->
      <button 
        v-for="option in currentOptions" 
        :key="option" 
        class="quiz-btn"
        :disabled="answered"
        @click="handleButtonClick(option)"
      >
        {{ option }}
      </button>
    </div>

    <!-- Feedback message after answering -->
    <p 
      v-if="answered" 
      style="font-size: 17px; font-weight: bold; margin: 10px 0 0 0;"
      :style="{ color: isCorrect ? '#00ff64' : '#ff3333' }"
    >
      {{ isCorrect 
        ? `🎉 Correct! (${gameMode === 'year' ? '+10' : '+5'} Points)` 
        : "❌ Wrong guess, try next time!" 
      }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Define the incoming parameters (React Props) in English
const props = defineProps({
  years: { type: Array, required: true },
  artists: { type: Array, required: true },
  titles: { type: Array, required: true },
  answered: { type: Boolean, default: false },
  isCorrect: { type: Boolean, default: false }
})

// Define the event to communicate with App.vue (React onValasz)
const emit = defineEmits(['answer'])

// Internal state for the current quiz sub-mode (React useState)
const gameMode = ref('year')

// Computed properties (Automatically recalulates when gameMode or props change)
const questionText = computed(() => {
  if (gameMode.value === 'artist') return "Who performs this song?"
  if (gameMode.value === 'title') return "What is the exact title of this song?"
  return "In which year was this song released?"
})

const currentOptions = computed(() => {
  if (gameMode.value === 'artist') return props.artists
  if (gameMode.value === 'title') return props.titles
  return props.years
})

// Emitting the click event upwards
function handleButtonClick(guess) {
  emit('answer', { guess: guess, mode: gameMode.value })
}
</script>
