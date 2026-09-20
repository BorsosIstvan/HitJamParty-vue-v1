<template>
  <!-- De centrale HitJam mobiele container -->
  <AppContainer>
    <h2 style="margin: 0 0 10px 0; ">HITJAM PARTY 🎧</h2>

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
import { ref, computed, onMounted, watch } from 'vue'

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

// Amikor az app elindul, azonnal ellenőrizzük a localStorage-t
onMounted(() => {
  const savedUser = localStorage.getItem('hitjam_user')
  
  if (savedUser) {
    // Ha van mentett felhasználó, beolvassuk az összes adatát
    user.value = savedUser
    score.value = parseInt(localStorage.getItem('hitjam_score') || '0', 10)
    coins.value = parseInt(localStorage.getItem('hitjam_coins') || '0', 10)
    
    try {
      ownedAlbums.value = JSON.parse(localStorage.getItem('hitjam_owned_albums') || '[]')
      activeAlbumIds.value = JSON.parse(localStorage.getItem('hitjam_active_albums') || '[]')
    } catch (e) {
      ownedAlbums.value = ['retro-party']
      activeAlbumIds.value = ['retro-party']
    }
  }

  // Megpróbáljuk betölteni a kártyapaklit is, ha van
  const savedDeck = localStorage.getItem('hitjam_pakli')
  if (savedDeck) {
    try { deck.value = JSON.parse(savedDeck) } catch(e) { deck.value = [] }
  }
})

function handleSuccessLogin(playerData) {
  user.value = playerData.username
  score.value = playerData.score
  coins.value = playerData.coins
  ownedAlbums.value = playerData.ownedAlbums || []
  activeAlbumIds.value = playerData.activeAlbumIds || []
  
  // ÚJ: Elmentjük az adatokat a localStorage-ba az auto-loginhoz
  localStorage.setItem('hitjam_user', playerData.username)
  localStorage.setItem('hitjam_score', playerData.score)
  localStorage.setItem('hitjam_coins', playerData.coins)
  localStorage.setItem('hitjam_owned_albums', JSON.stringify(playerData.ownedAlbums || []))
  localStorage.setItem('hitjam_active_albums', JSON.stringify(playerData.activeAlbumIds || []))

  const savedDeck = localStorage.getItem('hitjam_pakli')
  if (savedDeck) {
    try { deck.value = JSON.parse(savedDeck) } catch(e) { deck.value = [] }
  }
}

function handleLogout() {
  stopAudio()
  
  // ÚJ: Töröljük a belépési adatokat a localStorage-ból
  localStorage.removeItem('hitjam_user')
  localStorage.removeItem('hitjam_score')
  localStorage.removeItem('hitjam_coins')
  localStorage.removeItem('hitjam_owned_albums')
  localStorage.removeItem('hitjam_active_albums')
  localStorage.removeItem('hitjam_pakli')
  
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

// INTELLIGENTE COIN-UPVISUALISATIE: Draait vloeiend lokaal, updatet de Pi slechts 1 keer!
function handleCoinsEarned(totalCoinsEarned) {
  if (totalCoinsEarned <= 0) return

  let coinsAdded = 0
  
  // We starten een snelle timer om de munten op het scherm één voor één op te laten lopen
  const visualCoinTimer = setInterval(() => {
    if (coinsAdded < totalCoinsEarned) {
      coins.value++  // Dit zie je direct live oplopen in de PlayerStatus bar!
      coinsAdded++
    } else {
      // De visuele teller is klaar!
      clearInterval(visualCoinTimer)

      // PAS NU sturen we de totale nieuwe coin-status in 1 keer naar de Raspberry Pi!
      syncUserDataWithPi('coins', coins.value)
      
      // Ook direct opslaan in de lokale opslag voor de auto-login
      localStorage.setItem('hitjam_coins', coins.value)
    }
  }, 40) // Elke 40ms komt er op het scherm een muntje bij (super vloeiend effect)
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

// A JAVÍTOTT VÁSÁRLÁS: Nincs többé setTimeout, szigorú sorrend van!
// A TÖKÉLETESÍTETT VÁSÁRLÁS: Csak akkor zöldül be, ha a Pi már elmentette!
async function handlePurchase(payload) {
  // Biztonsági ellenőrzés a kliens oldalon
  if (coins.value < payload.price) {
    alert("⚠️ You don't have enough coins!");
    return;
  }

  console.log("🚀 Starting purchase process with Raspberry Pi...");

  // 1. LÉPÉS: Először elmentjük a csökkentett coinokat a Pi-re
  const újCoinÖsszeg = coins.value - payload.price;
  const coinMentésSikerült = await syncUserDataWithPi('coins', újCoinÖsszeg);
  
  if (!coinMentésSikerült) {
    alert("❌ Failed to update coins on Raspberry Pi. Purchase cancelled.");
    return; // MEGÁLLÍTJUK a folyamatot, ha a szerver nem válaszol!
  }

  // 2. LÉPÉS: Beküldjük a Pi-re az albumvásárlást (az SQLite user_albums táblába)
  const albumMentésSikerült = await syncUserDataWithPi('buy_album', payload.id);
  
  if (!albumMentésSikerült) {
    alert("❌ Failed to register album on Raspberry Pi. Please contact support.");
    // Visszaadjuk a coinokat a biztonság kedvéért, ha a folyamat fele elbukott
    await syncUserDataWithPi('coins', coins.value);
    return;
  }

  // =====================================================================
  // 3. LÉPÉS: CSAK MOST, ha a Pi MINDENT visszaigazolt, frissítünk helyben!
  // =====================================================================
  coins.value = újCoinÖsszeg;
  ownedAlbums.value.push(payload.id);
  activeAlbumIds.value.push(payload.id);
  
  // Reseteljük a paklit az új dalok miatt
  deck.value = [];
  localStorage.removeItem('hitjam_pakli');

  // Frissítjük a localStorage-ot az auto-loginhoz
  localStorage.setItem('hitjam_coins', coins.value);
  localStorage.setItem('hitjam_owned_albums', JSON.stringify(ownedAlbums.value));
  localStorage.setItem('hitjam_active_albums', JSON.stringify(activeAlbumIds.value));

  console.log("🎉 Success! Purchase officially written to Pi SQLite and updated in Vue!");
}


// --- SERVER COMMUNICATION LOGIC (Raspberry Pi Sync Engine) ---

// A JAVÍTOTT SZINKRONIZÁCIÓ: Most már megvárható (Promise) és visszajelzést ad
async function syncUserDataWithPi(field, value) {
  if (!user.value) return false
  
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
    if (data.success) {
      return true // SIKER! Az adatbázis frissült a Pi-n
    } else {
      console.error(`Pi sync failed for ${field}:`, data.error)
      return false
    }
  } catch (err) {
    console.error("Network error while syncing with Raspberry Pi:", err)
    return false
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
