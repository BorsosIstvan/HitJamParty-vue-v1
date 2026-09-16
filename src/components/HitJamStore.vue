<template>
  <div class="store-container">
    <h3 class="store-title">HitJam Store 🪙</h3>
    <p class="store-subtitle">
      Unlock new music albums using your hard-earned coins!
    </p>

    <div class="store-list">
      <!-- In Vue use v-for instead of .map() -->
      <div 
        v-for="album in storeOfferings" 
        :key="album.id" 
        class="store-card"
        :class="{ 'owned-card': isOwned(album.id) }"
      >
        <div class="album-details">
          <h4 class="album-title">🔥 {{ album.title }}</h4>
          <p class="album-price">
            {{ isOwned(album.id) ? "Successfully purchased!" : `Price: 🪙 ${getAlbumPrice(album)} HitJamCoins` }}
          </p>
          <p class="album-description">
            {{ album.description }}
          </p>
        </div>
        
        <!-- Action Button or Owned Tag -->
        <div class="action-container">
          <button 
            v-if="!isOwned(album.id)"
            class="hitjam-btn store-buy-btn" 
            :disabled="coins < getAlbumPrice(album)"
            @click="emit('purchase', { id: album.id, price: getAlbumPrice(album) })"
          >
            {{ coins >= getAlbumPrice(album) ? "Buy 🛒" : "Locked 🔒" }}
          </button>
          
          <span v-else class="owned-tag">OWNED</span>
        </div>
      </div>

      <!-- Empty state illustration -->
      <p v-if="storeOfferings.length === 0" class="empty-store-text">
        There are currently no new albums available for purchase.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Define the incoming parameters (React Props) in English
const props = defineProps({
  albums: { type: Array, required: true },
  ownedAlbumsList: { type: Array, default: () => [] },
  coins: { type: Number, default: 0 }
})

// Define the event to communicate with App.vue (React onVasarlas)
const emit = defineEmits(['purchase'])

// Computed helper to safely track owned items
const safeOwnedList = computed(() => {
  return props.ownedAlbumsList && props.ownedAlbumsList.length > 0 
    ? props.ownedAlbumsList 
    : ['retro-party']
})

// Filter out the base album, as it's free for everyone
const storeOfferings = computed(() => {
  return props.albums.filter(album => album.id !== 'retro-party')
})

// Helper functions for clean template rendering
function isOwned(albumId) {
  return safeOwnedList.value.includes(albumId)
}

function getAlbumPrice(album) {
  return album.price !== undefined ? album.price : 5
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

/* Green dynamic border color if owned */
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
