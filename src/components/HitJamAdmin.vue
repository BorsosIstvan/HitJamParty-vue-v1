<template>
  <div>
    <!-- LOADING STATE -->
    <p v-if="loading" class="loading-text">Loading admin data from Raspberry Pi...</p>

    <!-- MAIN INTERFACE -->
    <div v-else class="admin-container">
      <h3 class="admin-title">👑 HitJam Command Center</h3>
      
      <!-- ERROR BOX -->
      <div v-if="error" class="hitjam-alert hitjam-alert-error">
        ⚠️ {{ error }}
      </div>

      <div class="user-list">
        <!-- Végigmegyünk a Pi-től kapott felhasználókon -->
        <div v-for="user in users" :key="user.username" class="user-card">
          
          <!-- PLAYER INFO -->
          <div class="user-name">
            👤 {{ user.username }}
          </div>

          <!-- CONTROLS CONTAINER -->
          <div class="controls-box">
            
            <!-- 1. SCORE CONTROLS (+/- 50 POINTS) -->
            <div class="control-row">
              <span>🏆 Score: <strong class="score-value">{{ user.score }}</strong></span>
              <div class="btn-group">
                <button @click="handleModify(user.username, 'score', Math.max(0, user.score - 50))" class="admin-btn btn-danger">-50</button>
                <button @click="handleModify(user.username, 'score', user.score + 50)" class="admin-btn btn-success">+50</button>
              </div>
            </div>

            <!-- 2. COIN CONTROLS (+/- 1 COIN) -->
            <div class="control-row coin-row">
              <span>Coins: <strong class="coin-value">🪙 {{ user.coins }}</strong></span>
              <div class="btn-group">
                <button @click="handleModify(user.username, 'coins', Math.max(0, user.coins - 1))" class="admin-btn btn-danger">-1</button>
                <button @click="handleModify(user.username, 'coins', user.coins + 1)" class="admin-btn btn-warning">+1</button>
              </div>
            </div>

          </div>

          <!-- ALBUM PERMISSIONS LIST -->
          <p class="permissions-label">
            🎴 ALBUM PERMISSIONS:
          </p>
          
          <div class="permissions-list">
            <label 
              v-for="album in albumData" 
              :key="album.id" 
              class="permission-label-item"
              :class="{ 'disabled-label': album.id === 'retro-party' }"
            >
              <span :class="{ 'owned-album-text': hasAlbum(user, album.id) }">
                {{ album.title }}
              </span>
              <input 
                type="checkbox"
                :checked="hasAlbum(user, album.id)"
                :disabled="album.id === 'retro-party'"
                class="admin-checkbox"
                @change="handleCheckboxChange($event, user.username, album.id)"
              />
            </label>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import staticAlbumData from '../assets/albums.json'

const props = defineProps({
  apiUrl: { type: String, required: true }
})

const users = ref([])
const loading = ref(true)
const error = ref("")
const albumData = ref(staticAlbumData)

// Dynamically compute the update API path
const updateApiUrl = computed(() => {
  return props.apiUrl.replace('admin.php', 'update_user.php')
})

// Adatok lekérése a Pi-ről
async function refreshData() {
  try {
    error.value = ""
    const response = await fetch(props.apiUrl)
    if (!response.ok) throw new Error("Server communication error")
    
    const data = await response.json()
    if (data.success) {
      users.value = data.users // Mentjük a Pi-től kapott felhasználói tömböt
    } else {
      throw new Error(data.error || "Unknown server error")
    }
  } catch (err) {
    console.error("Admin fetch error:", err)
    error.value = "Failed to reach Raspberry Pi or parse database records."
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshData()
})

watch(() => props.apiUrl, () => {
  loading.value = true
  refreshData()
})

// Ellenőrizzük, hogy a Pi-től kapott vesszős string tartalmazza-e az album ID-t
function hasAlbum(userObj, albumId) {
  if (!userObj || !userObj.ownedAlbums) return albumId === 'retro-party'
  const ownedList = userObj.ownedAlbums.split(', ')
  return ownedList.includes(albumId)
}

// Módosítások beküldése a Pi-re
async function handleModify(targetUser, field, value) {
  try {
    const response = await fetch(updateApiUrl.value, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_user: targetUser,
        field: field,
        value: value
      })
    })
    const data = await response.json()
    if (data.success) {
      refreshData() // Háttérfrissítés alert ablakok nélkül
    } else {
      alert(`⚠️ Error: ${data.error}`)
    }
  } catch (err) {
    console.error("Modification error:", err)
    alert("Failed to update user profile on the Pi server.")
  }
}

function handleCheckboxChange(event, username, albumId) {
  const actionType = event.target.checked ? 'add_album' : 'remove_album'
  handleModify(username, actionType, albumId)
}
</script>

<style scoped>
.loading-text {
  color: #ff8c00;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
}

.admin-container {
  animation: fadeIn 0.3s ease;
  text-align: left;
  font-size: 13px;
}

.admin-title {
  color: #fff;
  text-align: center;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-card {
  background: rgba(0, 0, 0, 0.5);
  padding: 15px;
  border-radius: 15px;
  border: 1px solid rgba(255, 69, 0, 0.2);
}

.user-name {
  font-size: 16px;
  font-weight: bold;
  color: #ff8c00;
  margin-bottom: 10px;
}

.controls-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.coin-row {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 10px;
}

.score-value { color: #00ff64; }
.coin-value { color: #ffea00; }

.btn-group {
  display: flex;
  gap: 5px;
}

.admin-btn {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.admin-btn:hover { opacity: 0.8; }

.btn-danger { background: rgba(255, 51, 51, 0.2); border: 1px solid #ff3333; color: #ff3333; }
.btn-success { background: rgba(0, 255, 100, 0.2); border: 1px solid #00ff64; color: #00ff64; }
.btn-warning { background: rgba(255, 234, 0, 0.2); border: 1px solid #ffea00; color: #ffea00; }

.permissions-label {
  margin: 5px 0 8px 0;
  font-size: 11px;
  color: #ff8c00;
  font-weight: bold;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 10px;
}

.permission-label-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.permission-label-item.disabled-label {
  cursor: not-allowed;
  opacity: 0.5;
}

.owned-album-text {
  color: #fff;
}

span:not(.owned-album-text) {
  color: rgba(255, 255, 255, 0.4);
}

.admin-checkbox {
  accent-color: #ff4500;
  transform: scale(1.2);
  cursor: pointer;
}

.hitjam-alert {
  padding: 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 15px;
}

.hitjam-alert-error {
  background: rgba(255, 69, 0, 0.1);
  border: 1px solid #ff4500;
  color: #ff4500;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
