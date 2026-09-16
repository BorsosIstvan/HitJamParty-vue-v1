<template>
  <!-- De knop gebruikt jouw dögös hitjam-btn klasse en krijgt de oranje accentkleur via CSS -->
  <button class="hitjam-btn randomizer-btn" @click="drawNextSong">
    <span>🎲</span>
    <span>Draw Next Song</span>
  </button>
</template>

<script setup>
// Fisher-Yates shuffle algoritme om de array perfect te schudden
const shuffleArray = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// React Props definieren in het Engels
const props = defineProps({
  songList: { type: Array, required: true },
  deck: { type: Array, required: true }
})

// De events definieren om met App.vue te communiceren
const emit = defineEmits(['song-selected', 'update:deck'])

function drawNextSong() {
  if (!props.songList || props.songList.length === 0) return

  let currentDeck = [...props.deck]

  // ALS DE KAARTSTAPEL LEEG IS: direct vullen en schudden met alle beschikbare nummers
  if (currentDeck.length === 0) {
    currentDeck = shuffleArray(props.songList)
  }
  
  // Pak het eerste nummer van de stapel
  const selectedSong = currentDeck.shift()
  
  // Veiligheidscontrole en state synchronisatie met de parent (v-model / emits)
  if (currentDeck.length === 0) {
    emit('update:deck', [])
    localStorage.removeItem('hitjam_pakli')
  } else {
    emit('update:deck', currentDeck)
  }
  
  if (selectedSong) {
    emit('song-selected', selectedSong)
  }
}
</script>

<style scoped>
/* Oranje accentstijl speciaal voor de randomizer knop */
.randomizer-btn {
  border-color: #ff8c00;
  color: #ff8c00;
}

/* De hover effecten passen zich automatisch aan dankzij de 'currentColor' uit je main.css! */
.randomizer-btn:hover {
  background-color: #ff8c00;
  color: #0b0c10;
  box-shadow: 0 0 15px #ff8c00;
}
</style>
