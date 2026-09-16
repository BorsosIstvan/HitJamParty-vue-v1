<template>
  <div class="inventory-container">
    <h3 class="inventory-title">My Inventory 🎒</h3>
    <p class="inventory-subtitle">
      Toggle the albums you want to include in the quiz rotation!
    </p>

    <div class="album-list">
      <!-- In Vue use v-for instead of .map() -->
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

        <!-- Checkbox with accent color from your style -->
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
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Define the incoming parameters (React Props) in English
const props = defineProps({
  albums: { type: Array, required: true },
  ownedAlbumsList: { type: Array, default: () => [] },
  activeAlbumIds: { type: Array, required: true }
})

// Define the event to communicate with App.vue (React onToggleAlbum)
const emit = defineEmits(['toggle-album'])

// Computed property to safely filter only the albums owned by the user
const ownedAlbums = computed(() => {
  const safeOwnedList = props.ownedAlbumsList && props.ownedAlbumsList.length > 0 
    ? props.ownedAlbumsList 
    : ['retro-party']

  return props.albums.filter(album => safeOwnedList.includes(album.id))
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

.checkbox-label {
  cursor: pointer;
  padding: 10px;
}

.hitjam-checkbox {
  accent-color: #ff4500;
  transform: scale(1.3);
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
