<template>
  <div class="store-container">
    <h3 class="store-title">HitJam Store 🪙</h3>
    <p class="store-subtitle">
      Unlock new items using your hard-earned coins!
    </p>

    <!-- SUB-TABS: Switch between Albums and Skines inside the store -->
    <div class="store-tabs">
      <button 
        class="store-tab-btn" 
        :class="{ active: activeCategory === 'albums' }"
        @click="activeCategory = 'albums'"
      >
        🎵 Albums
      </button>
      <button 
        class="store-tab-btn" 
        :class="{ active: activeCategory === 'skins' }"
        @click="activeCategory = 'skins'"
      >
        ✨ Skines
      </button>
    </div>

    <!-- MAIN MERCHANDISE LIST -->
    <div class="store-list">
      <!-- We loop through the currently active category items -->
      <div 
        v-for="item in currentOfferings" 
        :key="item.id" 
        class="store-card"
        :class="{ 'owned-card': isOwned(item.id) }"
      >
        <div class="album-details">
          <h4 class="album-title">{{ item.title }}</h4>
          <p class="album-price">
            {{ isOwned(item.id) ? "Successfully purchased!" : `Price: 🪙 ${getItemPrice(item)} HitJamCoins` }}
          </p>
          <p class="album-description">
            {{ item.description }}
          </p>
        </div>
        
        <div class="action-container">
          <button 
            v-if="!isOwned(item.id)"
            class="hitjam-btn store-buy-btn" 
            :disabled="coins < getItemPrice(item)"
            @click="emit('purchase', { id: item.id, price: getItemPrice(item) })"
          >
            {{ coins >= getItemPrice(item) ? "Buy 🛒" : "Locked 🔒" }}
          </button>
          
          <span v-else class="owned-tag">OWNED</span>
        </div>
      </div>

      <!-- Empty state illustration -->
      <p v-if="currentOfferings.length === 0" class="empty-store-text">
        There are currently no items available in this category.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// We importeren de nieuwe skins.json direct in de store
import staticSkinsData from '../assets/skins.json'

// De props die we ontvangen van App.vue
const props = defineProps({
  albums: { type: Array, required: true },
  ownedAlbumsList: { type: Array, default: () => [] },
  coins: { type: Number, default: 0 }
})

// De emit om de aankoop omhoog te sturen naar App.vue
const emit = defineEmits(['purchase'])

// Interne state voor het actieve sub-tabblad in de winkel
const activeCategory = ref('albums')
const skinsData = ref(staticSkinsData)

// Veilige lijst van alles wat de speler bezit (zowel albums als skines)
const safeOwnedList = computed(() => {
  return props.ownedAlbumsList && props.ownedAlbumsList.length > 0 
    ? props.ownedAlbumsList 
    : ['retro-party']
})

// Dynamische weergave op basis van de gekozen categorie (Albums of Skines)
const currentOfferings = computed(() => {
  if (activeCategory.value === 'skins') {
    return skinsData.value
  }
  // Filter de gratis basis-album eruit voor de winkel
  return props.albums.filter(album => album.id !== 'retro-party')
})

// Helper functies
function isOwned(itemId) {
  return safeOwnedList.value.includes(itemId)
}

function getItemPrice(item) {
  return item.price !== undefined ? item.price : 5
}
</script>

<style scoped>
.store-container {
  animation: fadeIn 0.3s ease;
  text-align: left;
}

.store-title {
  color: #fff;
  text-align: center;
}

.store-subtitle {
  font-size: 12px;
  opacity: 0.7;
  text-align: center;
  margin-bottom: 15px;
}

/* ÚJ: Sub-tabs styling speciaal binnen de winkel */
.store-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.store-tab-btn {
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

.store-tab-btn.active {
  border-color: var(--hitjam-neon, #ff4500);
  color: #fff;
  background: rgba(255, 69, 0, 0.1);
  box-shadow: 0 0 10px var(--hitjam-neon-glow, rgba(255, 69, 0, 0.2));
}

.store-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.store-card {
  background: rgba(255, 69, 0, 0.05);
  padding: 15px;
  border-radius: 15px;
  border: 1px solid #ff4500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.store-card.owned-card {
  border-color: #00ff64;
  background: rgba(0, 255, 100, 0.02);
}

.album-title {
  margin: 0;
  color: #fff;
}

.album-price {
  margin: 4px 0 0 0;
  font-size: 12px;
  opacity: 0.7;
}

.owned-card .album-price {
  color: #00ff64;
  font-weight: bold;
}

.album-description {
  margin: 2px 0 0 0;
  font-size: 11px;
  opacity: 0.5;
}

.store-buy-btn {
  font-size: 12px !important;
  padding: 8px 15px !important;
  margin: 0 !important;
  border-radius: 15px !important;
}

.owned-tag {
  color: #00ff64;
  font-weight: bold;
  font-size: 13px;
  letter-spacing: 0.5px;
  padding-right: 5px;
}

.empty-store-text {
  font-style: italic;
  opacity: 0.5;
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
