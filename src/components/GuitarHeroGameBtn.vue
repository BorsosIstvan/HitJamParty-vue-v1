<template>
  <div class="guitar-hero-container">
    
    <!-- CURRENT SONG INFO PANEL -->
    <div class="song-info-card" v-if="trackName">
      <span class="now-playing">NOW PLAYING:</span>
      <h4 class="song-title">{{ trackName }}</h4>
      <p class="song-artist">{{ artistName }}</p>
    </div>

    <!-- GAME HEADER -->
    <div class="game-header">
      <div class="score-display">
        <span class="label">SCORE:</span>
        <span class="value">{{ gameScore }}</span>
      </div>

      <button 
        @click="toggleGame" 
        class="hitjam-btn start-btn"
        :class="{ 'game-running': isPlaying }"
      >
        {{ isPlaying ? '⏱️ STOP GAME' : '🎮 START GAME' }}
      </button>
    </div>

    <!-- FRETBOARD / GAMEFIELD -->
    <div class="fretboard" :class="{ 'fretboard-active': isPlaying }">
      
      <!-- 1. Lane (Green) -->
      <div class="lane lane-green">
        <!-- A hangjegyek mostantól a sávon BELÜL vannak, így képtelenek elcsúszni jobbra-balra! -->
        <div 
          v-for="note in activeNotes.filter(n => n.lane === 0)" 
          :key="note.id"
          class="falling-note note-green"
          :style="{ top: note.y + 'px' }"
        ></div>
        
        <div 
          class="hit-zone zone-green" 
          :class="{ 'zone-active': activeLanes[0] }"
          @mousedown="handlePress(0)"
          @touchstart.prevent="handlePress(0)"
        >D</div>
      </div>
      
      <!-- 2. Lane (Red) -->
      <div class="lane lane-red">
        <div 
          v-for="note in activeNotes.filter(n => n.lane === 1)" 
          :key="note.id"
          class="falling-note note-red"
          :style="{ top: note.y + 'px' }"
        ></div>
        
        <div 
          class="hit-zone zone-red" 
          :class="{ 'zone-active': activeLanes[1] }"
          @mousedown="handlePress(1)"
          @touchstart.prevent="handlePress(1)"
        >F</div>
      </div>
      
      <!-- 3. Lane (Yellow) -->
      <div class="lane lane-yellow">
        <div 
          v-for="note in activeNotes.filter(n => n.lane === 2)" 
          :key="note.id"
          class="falling-note note-yellow"
          :style="{ top: note.y + 'px' }"
        ></div>
        
        <div 
          class="hit-zone zone-yellow" 
          :class="{ 'zone-active': activeLanes[2] }"
          @mousedown="handlePress(2)"
          @touchstart.prevent="handlePress(2)"
        >J</div>
      </div>
      
      <!-- 4. Lane (Blue) -->
      <div class="lane lane-blue">
        <div 
          v-for="note in activeNotes.filter(n => n.lane === 3)" 
          :key="note.id"
          class="falling-note note-blue"
          :style="{ top: note.y + 'px' }"
        ></div>
        
        <div 
          class="hit-zone zone-blue" 
          :class="{ 'zone-active': activeLanes[3] }"
          @mousedown="handlePress(3)"
          @touchstart.prevent="handlePress(3)"
        >K</div>
      </div>

    </div>

    <!-- CONVERSION PANEL -->
    <div v-if="gameScore > 0" class="conversion-panel">
      <button @click="claimCoins" class="hitjam-link-btn claim-btn">
        💰 Convert Points to HitJam Coins
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  trackName: { type: String, default: "No Track Selected" },
  artistName: { type: String, default: "Unknown Artist" },
  musicUrl: { type: String, default: "" },
  bpm: { type: Number, default: 0 } 
})

const emit = defineEmits(['convert-points'])

// Speciális motorbeállítások a stabil mobilos futáshoz
const FRETBOARD_HEIGHT = 400
const HIT_ZONE_Y = 320
const HIT_WINDOW = 25
const NOTE_SPEED = 0.25 // Pixels per millisecond (időalapú mozgáshoz)

const isPlaying = ref(false)
const gameScore = ref(0)
const activeLanes = ref([false, false, false, false])
const activeNotes = ref([])

let gameLoopId = null
let noteSpawnerId = null
let noteIdCounter = 0
let audioPlayer = null
let lastFrameTime = 0 // Időkövető változó az egyenletes sebességért
// Keyboard inputs
function handleKeyDown(e) {
  if (!isPlaying.value) return
  switch(e.key.toLowerCase()) {
    case 'd': handlePress(0); break;
    case 'f': handlePress(1); break;
    case 'j': handlePress(2); break;
    case 'k': handlePress(3); break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  stopGame()
})

// Mathematical seed generation
function getSongSeed(str) {
  let hash = 0
  if (!str || str.length === 0) return 12345
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

function getSongBPM() {
  if (props.bpm > 0) return props.bpm
  const seed = getSongSeed(props.trackName)
  return 110 + (seed % 21)
}

function toggleGame() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    gameScore.value = 0
    activeNotes.value = []
    lastFrameTime = performance.now() // Reset time tracker
    startAudio()
    startGameLoop()
    startSpawningNotes()
  } else {
    stopGame()
  }
}

function startAudio() {
  if (props.musicUrl) {
    audioPlayer = new Audio(props.musicUrl)
    audioPlayer.volume = 0.8
    audioPlayer.play().catch(err => console.error("Audio play failed:", err))
    audioPlayer.onended = () => stopGame()
  }
}

function stopGame() {
  isPlaying.value = false
  cancelAnimationFrame(gameLoopId)
  clearInterval(noteSpawnerId)
  if (audioPlayer) {
    audioPlayer.pause()
    audioPlayer = null
  }
}

// 1. DELTA-TIME GAME LOOP - Perfectly smooth on any screen or CPU lag (60Hz, 120Hz, Mobile Touch)
function startGameLoop() {
  function update(currentTime) {
    if (!isPlaying.value) return

    // Calculate time elapsed since last frame in milliseconds
    const deltaTime = currentTime - lastFrameTime
    lastFrameTime = currentTime

    // Move notes based on actual time elapsed, not frames!
    activeNotes.value.forEach(note => {
      note.y += NOTE_SPEED * deltaTime
    })

    // Filter out missed notes
    activeNotes.value = activeNotes.value.filter(note => note.y <= FRETBOARD_HEIGHT)

    gameLoopId = requestAnimationFrame(update)
  }
  gameLoopId = requestAnimationFrame(update)
}

// 2. STABLE BEAT SPAWNER
function startSpawningNotes() {
  const songBPM = getSongBPM()
  const beatInterval = 60000 / songBPM
  const songSeed = getSongSeed(props.trackName)
  let noteIndex = 0

  noteSpawnerId = setInterval(() => {
    const pseudoRandom = Math.sin(songSeed + noteIndex) * 10000
    const targetLane = Math.floor((pseudoRandom - Math.floor(pseudoRandom)) * 4)

    activeNotes.value.push({
      id: noteIdCounter++,
      lane: targetLane,
      y: -20
    })

    noteIndex++
  }, beatInterval)
}

// 3. HIT CHECK
function handlePress(laneIndex) {
  activeLanes.value[laneIndex] = true
  setTimeout(() => { activeLanes.value[laneIndex] = false }, 100)

  if (!isPlaying.value) return

  const targetNoteIndex = activeNotes.value.findIndex(note => {
    return note.lane === laneIndex && Math.abs(note.y - HIT_ZONE_Y) < HIT_WINDOW * 1.5
  })

  if (targetNoteIndex !== -1) {
    const targetNote = activeNotes.value[targetNoteIndex]
    const distance = Math.abs(targetNote.y - HIT_ZONE_Y)

    if (distance < HIT_WINDOW * 0.5) {
      gameScore.value += 100
    } else {
      gameScore.value += 50
    }

    activeNotes.value.splice(targetNoteIndex, 1)
  }
}

function claimCoins() {
  const earnedCoins = Math.floor(gameScore.value / 100)
  if (earnedCoins > 0) {
    alert(`🎉 Successfully converted! You earned 🪙 ${earnedCoins} HitJam Coins!`)
    emit('convert-points', earnedCoins)
    gameScore.value = 0
  } else {
    alert("⚠️ You need at least 100 points to convert into HitJam Coins!")
  }
}
</script>

<style scoped>
.guitar-hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 15px;
  user-select: none;
  -webkit-user-select: none;
}

.song-info-card {
  width: 100%;
  max-width: 360px;
  background: rgba(255, 69, 0, 0.05);
  border: 1px solid rgba(255, 69, 0, 0.2);
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-sizing: border-box;
}

.now-playing { font-size: 10px; letter-spacing: 1px; opacity: 0.5; display: block; }
.song-title { margin: 2px 0; font-size: 16px; color: #ffffff; }
.song-artist { margin: 0; font-size: 13px; color: #ff4500; opacity: 0.9; }

.game-header {
  display: flex;
  width: 100%;
  max-width: 360px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.score-display { display: flex; flex-direction: column; align-items: flex-start; font-family: monospace; }
.score-display .label { font-size: 11px; letter-spacing: 1px; opacity: 0.6; }
.score-display .value { font-size: 24px; font-weight: bold; color: #ff4500; text-shadow: 0 0 10px rgba(255, 69, 0, 0.4); }

.start-btn { margin: 0 !important; padding: 8px 16px !important; font-size: 13px !important; border-radius: 20px !important; }
.game-running { color: #ff3333 !important; border-color: #ff3333 !important; }
.game-running:hover { background-color: #ff3333 !important; color: #0b0c10 !important; box-shadow: 0 0 15px #ff3333 !important; }

.fretboard {
  display: flex;
  width: 100%;
  max-width: 360px;
  height: 400px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 69, 0, 0.3);
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  transition: border-color 0.3s ease;
}

.fretboard-active {
  border-color: rgba(255, 69, 0, 0.7);
  box-shadow: 0 0 15px rgba(255, 69, 0, 0.15);
}

/* RESPONSIVE FALLING NOTES (INSIDE LANES) */
.falling-note {
  position: absolute;
  width: 45px;
  height: 20px;
  border-radius: 10px;
  box-shadow: 0 0 12px currentColor;
  z-index: 10;
  pointer-events: none;
  /* Centering notes horizontally inside each lane automatically! */
  left: 50%;
  transform: translateX(-50%);
}

/* Note colors */
.note-green  { color: #00ff64; background-color: #00ff64; }
.note-red    { color: #ff3333; background-color: #ff3333; }
.note-yellow { color: #ffcc00; background-color: #ffcc00; }
.note-blue   { color: #0096ff; background-color: #0096ff; }

.lane {
  flex: 1;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 25px;
  box-sizing: border-box;
  border-right: 1px dashed rgba(255, 255, 255, 0.1);
}

.lane:last-child { border-right: none; }

.lane-green { background: linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(0,255,100,0.03) 100%); }
.lane-red { background: linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(255,51,51,0.03) 100%); }
.lane-yellow { background: linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(255,200,0,0.03) 100%); }
.lane-blue { background: linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(0,150,255,0.03) 100%); }

.hit-zone {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.05s ease, box-shadow 0.1s ease;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.6);
  -webkit-tap-highlight-color: transparent;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  color: #0b0c10;
}

.zone-green  { background-color: rgba(0, 255, 100, 0.2); border: 2px solid #00ff64; }
.zone-red    { background-color: rgba(255, 51, 51, 0.2); border: 2px solid #ff3333; }
.zone-yellow { background-color: rgba(255, 204, 0, 0.2); border: 2px solid #ffcc00; }
.zone-blue   { background-color: rgba(0, 150, 255, 0.2); border: 2px solid #0096ff; }

.zone-green.zone-active  { background-color: #00ff64; box-shadow: 0 0 25px #00ff64; transform: scale(0.92); color: #0b0c10; }
.zone-red.zone-active    { background-color: #ff3333; box-shadow: 0 0 25px #ff3333; transform: scale(0.92); color: #0b0c10; }
.zone-yellow.zone-active { background-color: #ffcc00; box-shadow: 0 0 25px #ffcc00; transform: scale(0.92); color: #0b0c10; }
.zone-blue.zone-active   { background-color: #0096ff; box-shadow: 0 0 25px #0096ff; transform: scale(0.92); color: #0b0c10; }

.conversion-panel { margin-top: 10px; }
.claim-btn { font-size: 13px !important; text-transform: uppercase; letter-spacing: 0.5px; }
</style>
