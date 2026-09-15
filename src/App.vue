<template>
  <AppContainer>
    
    <h2 style="margin: 0 0 10px 0;">HITJAM PARTY 🎧</h2>

    <!-- 1. PHASE: Loading -->
    <div v-if="loadingGuest && !user">
      <p style="font-weight: bold;">Preparing Party... 🕺</p>
    </div>

    <!-- 2. PHASE: Authentication -->
    <div v-else-if="!user">
      <AuthForm @auth-success="handleSuccessLogin" />
    </div>

    <!-- 3. PHASE: Dashboard -->
    <div v-else>
      
      <!-- Player status -->
      <PlayerStatus 
        :user="user" 
        :score="score" 
        :coins="coins" 
        @logout="handleLogout" 
      />

      <!-- ÚJ KISZERVEZETT NAVIGÁCIÓ (v-model-lel összekötve!) -->
      <GameNavigation v-model="currentView" :user="user" />

      <!-- JÁTÉKTEREK ÉS NÉZETEK KEZELÉSE -->
      <main>
        
        <div v-if="currentView === 'quiz'">
          <p style="color: #ffffff; font-weight: bold;">[ Quiz Game Mode Placeholder ]</p>
        </div>

        <div v-else-if="currentView === 'guitar-hero'">
          <GuitarHeroGame 
            trackName="You Shook Me All Night Long" 
            artistName="AC/DC" 
            musicUrl="./acdcYouShookMeAllNightLong.mp3" 
            :bpm="127" 
            @convert-points="coins += $event" 
          />
        </div>

        <div v-else-if="currentView === 'inventory'">
          <p style="color: #ffffff; opacity: 0.7;">[ Inventory Placeholder ]</p>
        </div>

        <div v-else-if="currentView === 'store'">
          <p style="color: #ffffff; opacity: 0.7;">[ Store Placeholder ]</p>
        </div>

        <div v-else-if="currentView === 'admin' && user === 'poci'">
          <p style="color: #00ff64; font-weight: bold;">[ Admin Panel Placeholder ]</p>
        </div>

      </main>

    </div>

    <GameFooter />

  </AppContainer>
</template>

<script setup>
import { ref } from 'vue'
import AppContainer from './components/AppContainer.vue'
import AuthForm from './components/AuthForm.vue'
import PlayerStatus from './components/PlayerStatus.vue'
import GameFooter from './components/GameFooter.vue'
// AZ ÚJ NAVIGÁCIÓ IMPORTJA:
import GameNavigation from './components/GameNavigation.vue'
import initialAlbumData from './assets/albums.json'
import GuitarHeroGame from './components/GuitarHeroGameBtn.vue'

// Reactive states
const loadingGuest = ref(false)
const user = ref(null)
const score = ref(0)
const coins = ref(0)
const ownedAlbums = ref([])
const activeAlbumIds = ref([])
const albumData = ref(initialAlbumData)

// ÚJ: Aktuális nézet állapota (React-es setNezet/nezet megfelelője)
const currentView = ref('quiz')

function handleSuccessLogin(playerData) {
  user.value = playerData.username
  score.value = playerData.score
  coins.value = playerData.coins
  ownedAlbums.value = playerData.ownedAlbums
  activeAlbumIds.value = playerData.activeAlbumIds
}

function handleLogout() {
  user.value = null
  currentView.value = 'quiz' // Reseteljük a nézetet kilépéskor
}
</script>
