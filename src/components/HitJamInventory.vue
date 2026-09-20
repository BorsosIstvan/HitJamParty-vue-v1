<template>
  <div class="inventory-container">
    <h3 class="inventory-title">My Inventory 🎒</h3>
    <p class="inventory-subtitle">
      Manage your unlocked content and customize your HitJam experience!
    </p>

    <!-- SUB-TABS: Switch between Albums and Skins inside your inventory -->
    <div class="inventory-tabs">
      <button 
        class="inventory-tab-btn" 
        :class="{ active: activeCategory === 'albums' }"
        @click="activeCategory = 'albums'"
      >
        🎵 Albums
      </button>
      <button 
        class="inventory-tab-btn" 
        :class="{ active: activeCategory === 'skins' }"
        @click="activeCategory = 'skins'"
      >
        ✨ Skins
      </button>
    </div>

    <!-- 1. ALBUMS CATEGORY LIST -->
    <div v-if="activeCategory === 'albums'" class="album-list">
      <div 
        v-for="album in ownedAlbums" 
        :key="album.id" 
        class="album-card"
      >
        <div class="album-info">
          <h4 class="album-title">🎴 {{ album.title }}</h4>
          <p class="album-songs-count">
            {{ album.songs ? album.songs.length : 0 }} songs active in game
          </p>
        </div>

        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="activeAlbumIds.includes(album.id)" 
            @change="emit('toggle-album', album.id)"
            class="hitjam-checkbox"
          />
        </label>
      </div>
    </div>

    <!-- 2. SKINS CATEGORY LIST (Radio buttons for single theme selection) -->
    <div v-if="activeCategory === 'skins'" class="album-list">
      
      <!-- Default Theme (Always available) -->
      <div class="album-card" :class="{ 'active-skin-card': currentSkin === 'skin-default' }">
        <div class="album-info">
          <h4 class="album-title">🔥 Default Orange Theme</h4>
          <p class="album-songs-count">The classic, energetic HitJam look</p>
        </div>
        <label class="radio-label">
          <input 
            type="radio" 
            name="hitjam-skin"
            value="skin-default" 
            :checked="currentSkin === 'skin-default'"
            @change="emit('change-skin', 'skin-default')"
            class="hitjam-radio"
          />
        </label>
      </div>

      <!-- Unlocked Custom Skins -->
      <div 
        v-for="skin in ownedSkins" 
        :key="skin.id" 
        class="album-card"
        :class="{ 'active-skin-card': currentSkin === skin.id }"
      >
        <div class="album-info">
          <h4 class="album-title">{{ skin.title }}</h4>
          <p class="album-songs-count">{{ skin.description }}</p>
        </div>

        <label class="radio-label">
          <input 
            type="radio" 
            name="hitjam-skin"
            :value="skin.id" 
            :checked="currentSkin === skin.id"
            @change="emit('change-skin', skin.id)"
            class="hitjam-radio"
          />
        </label>
      </div>

      <p v-if="ownedSkins.length === 0" class="empty-inventory-text">
        You haven't unlocked any custom skins yet. Visit the Store! 🪙
      </p>
    </div>

    <!-- GUESTBOOK / KODEX SECTION -->
    <div style="margin-top: 30px; border-top: 1px solid rgba(255,69,0,0.1); padding-top: 25px;">
      <HitJamKodex :username="username" />
    </div>

  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import HitJamKodex from './HitJamKodex.vue'
// We importeren de skins database om de titels en beschrijvingen te tonen
import staticSkinsData from '../assets/skins.json'

// Uitgebreide props in het Engels
const props = defineProps({
  albums: { type: Array, required: true },
  ownedAlbumsList: { type: Array, default: () => [] },
  activeAlbumIds: { type: Array, required: true },
  username: { type: String, required: true },
  currentSkin: { type: String, default: 'skin-default' } // NIEUW: Volgt welke stijl nu actief is
})

// De events om te communiceren met App.vue
const emit = defineEmits(['toggle-album', 'change-skin'])

// Interne categorie status (Albums of Skins)
const activeCategory = ref('albums')
const skinsData = ref(staticSkinsData)

// Veiligheidslijst voor bezeten items
const safeOwnedList = computed(() => {
  return props.ownedAlbumsList && props.ownedAlbumsList.length > 0 
    ? props.ownedAlbumsList 
    : ['retro-party']
})

// Filteren van de bezeten albums
const ownedAlbums = computed(() => {
  return props.albums.filter(album => safeOwnedList.value.includes(album.id))
})

// NIEUW: Filteren van de bezeten skins op basis van de database-records van de Pi
const ownedSkins = computed(() => {
  return skinsData.value.filter(skin => safeOwnedList.value.includes(skin.id))
})
</script>

<style scoped>
.inventory-container {
  animation: fadeIn 0.3s ease;
  text-align: left;
}

.inventory-title {
  color: #fff;
  text-align: center;
}

.inventory-subtitle {
  font-size: 12px;
  opacity: 0.7;
  text-align: center;
  margin-bottom: 15px;
}

/* Sub-tabs styling binnen het magazijn */
.inventory-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.inventory-tab-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 69, 0, 0.2);
  color: rgba(255, 255, 255, 0.6);
  padding: 6px 16px;
  font-size: 13px;
  font-weight: bold;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.inventory-tab-btn.active {
  border-color: var(--hitjam-neon, #ff4500);
  color: #fff;
  background: rgba(255, 69, 0, 0.1);
  box-shadow: 0 0 10px var(--hitjam-neon-glow, rgba(255, 69, 0, 0.2));
}

.album-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.album-card {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 15px;
  border: 1px solid rgba(255, 69, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.3s ease;
}

/* Groene oplichtende rand als deze specifieke skin momenteel aan staat */
.album-card.active-skin-card {
  border-color: var(--hitjam-neon, #00ff64);
  background: rgba(0, 0, 0, 0.4);
}

.album-title {
  margin: 0;
  color: #fff;
}

.album-songs-count {
  margin: 3px 0 0 0;
  font-size: 11px;
  opacity: 0.6;
}

.checkbox-label, .radio-label {
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
}

.hitjam-checkbox, .hitjam-radio {
  accent-color: var(--hitjam-neon, #ff4500);
  transform: scale(1.3);
  cursor: pointer;
}

.empty-inventory-text {
  font-style: italic;
  opacity: 0.5;
  text-align: center;
  margin-top: 10px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
