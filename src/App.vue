<template>
  <!-- De centrale HitJam mobiele container -->
  <AppContainer>
    <h2 style="margin: 0 0 10px 0; letter-spacing: 2px;">HITJAM PARTY 🎧</h2>

    <!-- PHASE 1: Loading Guest Login / Background process -->
    <div v-if="loadingGuest && !user" style="margin: 40px 0;">
      <p style="color: #ff4500; font-weight: bold;">Preparing Party... 🕺</p>
    </div>

    <!-- PHASE 2: Authentication (Login / Register) -->
    <div v-else-if="!user" style="margin: 20px 0;">
      <AuthForm @auth-success="handleSuccessLogin" />
    </div>

    <!-- PHASE 3: Main Dashboard (When logged in) -->
    <div v-else class="dashboard-wrapper">
      
      <!-- Player Status Bar Component -->
      <PlayerStatus 
        :user="user" 
        :score="score" 
        :coins="coins" 
        @logout="handleLogout" 
      />

      <!-- Main Navigation Component (v-model handles currentView automatically) -->
      <GameNavigation v-model="currentView" :user="user" />

      <!-- GAME VIEWS & ROUTING -->
      <main class="view-content">
        
        <!-- 1. QUIZ GAME MODE -->
        <template v-if="currentView === 'quiz'">
          <GameStats :albumList="activeAlbums" :deck="deck" />
          
          <!-- Song Display (Hidden or Revealed) -->
          <SongDisplay 
            :trackName="currentSong.title || 'Unknown'" 
            :artistName="currentSong.artist || 'Unknown'" 
            :year="currentSong.year || '?'" 
            :answered="answered" 
          />
          
          <!-- Audio Playback Button -->
          <PlayPauseButton :isPlaying="isPlaying" @toggle="togglePlay" />
          
          <!-- Quiz Options Buttons (Years, Artists, Titles) -->
          <QuizDisplay 
            v-if="currentSong.title"
            :years="quizOptions.years"
            :artists="quizOptions.artists"
            :titles="quizOptions.titles"
            :answered="answered"
            :isCorrect="isCorrect"
            @answer="handleQuizAnswer"
          />
          
          <!-- Next Song Draw Button -->
          <RandomizerButton 
            :songList="allAvailableSongs" 
            v-model:deck="deck" 
            @song-selected="handleSongSelected" 
          />
        </template>

        <!-- 2. GUITAR HERO MODE -->
        <template v-else-if="currentView === 'guitar-hero'">
          <GuitarHeroGame 
            :trackName="currentSong.title || 'You Shook Me All Night Long'" 
            :artistName="currentSong.artist || 'AC/DC'" 
            :musicUrl="currentSong.previewUrl || './acdcYouShookMeAllNightLong.mp3'" 
            :bpm="currentSong.bpm || 127"
            @convert-points="handleCoinsEarned" 
          />
        </template>

        <!-- 3. INVENTORY MODE -->
        <template v-else-if="currentView === 'inventory'">
          <HitJamInventory 
            :albums="albumData" 
            :ownedAlbumsList="ownedAlbums" 
            :activeAlbumIds="activeAlbumIds" 
            @toggle-album="handleToggleAlbum" 
          />
        </template>

        <!-- 4. STORE MODE -->
        <template v-else-if="currentView === 'store'">
          <HitJamStore 
            :albums="albumData" 
            :ownedAlbumsList="ownedAlbums" 
            :coins="coins" 
            @purchase="handlePurchase" 
          />
        </template>

        <!-- 5. ADMINISTRATIVE COMMAND CENTER -->
        <template v-else-if="currentView === 'admin' && user === 'poci'">
          <HitJamAdmin :apiUrl="`https://${PI_IP_CIM}/HitJamParty/admin.php`" />
        </template>

      </main>
    </div>

    <!-- Universal Game Footer -->
    <GameFooter />
  </AppContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Import all Vue 3 Core Components
import AppContainer from './components/AppContainer.vue'
import AuthForm from './components/AuthForm.vue'
import PlayerStatus from './components/PlayerStatus.vue'
import GameNavigation from './components/GameNavigation.vue'
import GameFooter from './components/GameFooter.vue'

// Import Sub-Module Components
import QuizDisplay from './components/QuizDisplay.vue'
import SongDisplay from './components/SongDisplay.vue'
import PlayPauseButton from './components/PlayPauseButton.vue'
import RandomizerButton from './components/RandomizerButton.vue'
import GameStats from './components/GameStats.vue'
import GuitarHeroGame from './components/GuitarHeroGameBtn.vue'
import HitJamInventory from './components/HitJamInventory.vue'
import HitJamStore from './components/HitJamStore.vue'
import HitJamAdmin from './components/HitJamAdmin.vue'

// Import External iTunes JSONP Service
import { searchiTunes } from './services/itunesService'

// Import static local albums file
import staticAlbums from './assets/albums.json'

// Environment configurations
const PI_IP_CIM = "api.hitjamparty.com"

// User & State tracking refs
const loadingGuest = ref(false)
const user = ref(null)
const score = ref(0)
const coins = ref(0)
const ownedAlbums = ref([])
const activeAlbumIds = ref([])
const currentView = ref('quiz')

// Quiz Engine refs
const albumData = ref(staticAlbums)
const deck = ref([])
const currentSong = ref({ title: '', artist: '', year: '', previewUrl: '', bpm: 0 })
const answered = ref(false)
const isCorrect = ref(false)
const isPlaying = ref(false)

const quizOptions = ref({ years: [], artists: [], titles: [] })
let audioObject = null
// --- AUTOMATIC CACHING & FILTERS (Vue Computed Properties) ---
const activeAlbums = computed(() => {
  return albumData.value.filter(album => activeAlbumIds.value.includes(album.id))
})

const allAvailableSongs = computed(() => {
  const songs = []
  activeAlbums.value.forEach(album => {
    if (album.songs) {
      album.songs.forEach(song => {
        // We voegen het albumId toe aan de song voor tracking doeleinden
        songs.push({ ...song, albumId: album.id })
      })
    }
  })
  return songs
})

// --- CORE APPLICATIE LOGICA FUNCTIONS ---

function handleSuccessLogin(playerData) {
  user.value = playerData.username
  score.value = playerData.score
  coins.value = playerData.coins
  ownedAlbums.value = playerData.ownedAlbums || []
  activeAlbumIds.value = playerData.activeAlbumIds || []
  
  // Proberen we de opgeslagen kaartstapel te laden uit het geheugen
  const savedDeck = localStorage.getItem('hitjam_pakli')
  if (savedDeck) {
    try { deck.value = JSON.parse(savedDeck) } catch(e) { deck.value = [] }
  }
}

function handleLogout() {
  stopAudio()
  user.value = null
  score.value = 0
  coins.value = 0
  ownedAlbums.value = []
  activeAlbumIds.value = []
  deck.value = []
  currentView.value = 'quiz'
  resetQuizState()
}

function resetQuizState() {
  answered.value = false
  isCorrect.value = false
  currentSong.value = { title: '', artist: '', year: '', previewUrl: '', bpm: 0 }
  quizOptions.value = { years: [], artists: [], titles: [] }
}

// --- QUIZ ENGINE FUNCTIONS ---

async function handleSongSelected(song) {
  stopAudio()
  resetQuizState()
  
  currentSong.value = {
    title: song.title,
    artist: song.artist,
    year: song.year,
    previewUrl: '',
    bpm: song.bpm || 120
  }

  // Sla de resterende kaartstapel op in het lokale geheugen van de browser
  localStorage.setItem('hitjam_pakli', JSON.stringify(deck.value))

  // GENEREREN VAN MEERKEUZE OPTIES (Foute antwoorden mixen met de juiste)
  generateQuizOptions(song)

  // LIVE AUDIO LINK OPHALEN VIA JOUW ITUNES JSONP SERVICE
  console.log(`Searching iTunes for: ${song.artist} - ${song.title}`)
  const result = await searchiTunes(song.artist, song.title)
  
  if (result.success) {
    currentSong.value.previewUrl = result.previewUrl
    // Als de speler direct op "Play" had staan, starten we de audio direct
    if (currentView.value === 'quiz') {
      startAudio(result.previewUrl)
    }
  } else {
    console.warn("iTunes preview failed:", result.error)
    // Fallback: Als iTunes faalt, kijken we of er een lokale mp3 is of we spelen in silent mode
  }
}

function generateQuizOptions(correctSong) {
  const songsPool = allAvailableSongs.value
  
  // Helper om een unieke lijst van foute opties te genereren
  const getDummies = (field, correctValue, count) => {
    const dummies = songsPool
      .map(s => s[field])
      .filter(val => val !== correctValue)
    const uniqueDummies = [...new Set(dummies)]
    // Shuffelen en het benodigde aantal pakken
    return uniqueDummies.sort(() => 0.5 - Math.random()).slice(0, count)
  }

  const dummyYears = getDummies('year', correctSong.year, 3)
  const dummyArtists = getDummies('artist', correctSong.artist, 3)
  const dummyTitles = getDummies('title', correctSong.title, 3)

  // Mixen en sorteren zodat het juiste antwoord niet altijd op dezelfde plek staat
  quizOptions.value.years = [...dummyYears, correctSong.year].sort(() => 0.5 - Math.random())
  quizOptions.value.artists = [...dummyArtists, correctSong.artist].sort(() => 0.5 - Math.random())
  quizOptions.value.titles = [...dummyTitles, correctSong.title].sort(() => 0.5 - Math.random())
}

// AFHANDELING VAN HET QUIZ ANTWOORD EN PUNTENTELLING
function handleQuizAnswer(payload) {
  if (answered.value) return
  
  answered.value = true
  let isTargetCorrect = false
  let pointsEarned = 0

  if (payload.mode === 'year' && String(payload.guess) === String(currentSong.value.year)) {
    isTargetCorrect = true
    pointsEarned = 10
  } else if (payload.mode === 'artist' && payload.guess === currentSong.value.artist) {
    isTargetCorrect = true
    pointsEarned = 5
  } else if (payload.mode === 'title' && payload.guess === currentSong.value.title) {
    isTargetCorrect = true
    pointsEarned = 5
  }

  isCorrect.value = isTargetCorrect

  if (isTargetCorrect) {
    score.value += pointsEarned
    // Synchroniseren met de Raspberry Pi server in de achtergrond
    syncUserDataWithPi('score', score.value)
  }
}

// --- AUDIO CONTROLS MANAGEMENT ---

function togglePlay() {
  if (!currentSong.value.previewUrl) {
    console.warn("No audio track loaded yet.")
    return
  }
  
  if (isPlaying.value) {
    stopAudio()
  } else {
    startAudio(currentSong.value.previewUrl)
  }
}

function startAudio(url) {
  if (audioObject) {
    audioObject.pause()
  }
  audioObject = new Audio(url)
  audioObject.volume = 0.7
  isPlaying.value = true
  audioObject.play().catch(err => {
    console.error("Playback interrupted:", err)
    isPlaying.value = false
  })
  audioObject.onended = () => { isPlaying.value = false }
}

function stopAudio() {
  isPlaying.value = false
  if (audioObject) {
    audioObject.pause()
    audioObject = null
  }
}

// --- SUBSYSTEM INTERACTION HANDLERS (Emits & Events Connectors) ---

function handleCoinsEarned(earnedCoins) {
  coins.value += earnedCoins
  syncUserDataWithPi('coins', coins.value)
}

function handleToggleAlbum(albumId) {
  if (activeAlbumIds.value.includes(albumId)) {
    // Alleen uitschakelen als er minimaal 1 album actief blijft
    if (activeAlbumIds.value.length > 1) {
      activeAlbumIds.value = activeAlbumIds.value.filter(id => id !== albumId)
    } else {
      alert("⚠️ You must keep at least one music album active!")
      return
    }
  } else {
    activeAlbumIds.value.push(albumId)
  }
  // Stapel kaarten resetten na aanpassing magazijn
  deck.value = []
  localStorage.removeItem('hitjam_pakli')
  
  syncUserDataWithPi('active_albums', activeAlbumIds.value.join(', '))
}

function handlePurchase(payload) {
  if (coins.value >= payload.price) {
    coins.value -= payload.price
    ownedAlbums.value.push(payload.id)
    activeAlbumIds.value.push(payload.id) // Direct activeren na aankoop
    
    // Stapel kaarten resetten na aankoop
    deck.value = []
    localStorage.removeItem('hitjam_pakli')

    // Beiden updates naar de Pi sturen via de API
    syncUserDataWithPi('coins', coins.value)
    // Vertraagde sync voor de albumlijst om serverconflicten te voorkomen
    setTimeout(() => {
      syncUserDataWithPi('buy_album', payload.id)
    }, 300)
  }
}

// --- SERVER COMMUNICATION LOGIC (Raspberry Pi Sync Engine) ---

async function syncUserDataWithPi(field, value) {
  if (!user.value) return
  
  const updateApiUrl = `https://${PI_IP_CIM}/HitJamParty/update_user.php`
  
  try {
    const response = await fetch(updateApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_user: user.value,
        field: field,
        value: value
      })
    })
    const data = await response.json()
    if (!data.success) {
      console.error(`Pi sync failed for ${field}:`, data.error)
    }
  } catch (err) {
    console.error("Network error while syncing with Raspberry Pi:", err)
  }
}
</script>

<style scoped>
/* Schone dashboard styling */
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}

.view-content {
  flex-grow: 1;
  width: 100%;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}
</style>
