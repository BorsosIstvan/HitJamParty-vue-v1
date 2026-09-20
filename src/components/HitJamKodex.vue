<template>
  <div class="kodex-container">
    
    <!-- SECTION 1: THE OFFICIAL HITJAM RULES -->
    <div class="kodex-rules-card">
      <h3 class="kodex-title">📜 THE HITJAM KODEX</h3>
      <p class="kodex-intro">The fundamental laws of the HitJam Party ecosystem.</p>
      
      <ul class="rules-list">
        <li>
          <strong>⚖️ Law 1: Absolute Freedom</strong>
          <p>This game is, and will always remain, 100% free to play. No pay-to-win, no ads.</p>
        </li>
        <li>
          <strong>🏛️ Law 2: Finite Economy</strong>
          <p>HitJamCoins are not infinite. They are backed by the central reserves of the HitJamBank.</p>
        </li>
        <li>
          <strong>🎧 Law 3: Pure Vibe</strong>
          <p>Audio streams and metadata are provided for high-fidelity party entertainment only.</p>
        </li>
      </ul>
    </div>

    <!-- SECTION 2: THE INTERACTIVE GUESTBOOK -->
    <div class="guestbook-section">
      <h4 class="guestbook-title">✍️ Party Suggestions & Guestbook</h4>
      
      <!-- Message Submit Form (Using your hot form styles!) -->
      <form @submit.prevent="submitMessage" class="hitjam-form">
        <div class="hitjam-field">
          <label>Your Suggestion</label>
          <textarea 
            v-model="newMessage" 
            placeholder="Type your feedback or rule suggestion here..." 
            class="hitjam-input kodex-textarea"
            maxlength="200"
            :disabled="submitting"
          ></textarea>
        </div>
        
        <button type="submit" class="hitjam-btn submit-msg-btn" :disabled="submitting || !newMessage.trim()">
          {{ submitting ? '⚡ Sending...' : '📩 Write to Kodex' }}
        </button>
      </form>

      <!-- Messages Feed list -->
      <div class="messages-feed">
        <div v-if="loadingFeed" class="kodex-info-text">Loading suggestions from the Pi...</div>
        <div v-else-if="messages.length === 0" class="kodex-info-text casual">No entries yet. Be the first to write!</div>
        
        <div 
          v-else 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message-bubble"
        >
          <div class="msg-header">
            <span class="msg-author">👤 {{ msg.username }}</span>
            <span class="msg-time">{{ formatDate(msg.created_at) }}</span>
          </div>
          <p class="msg-body">{{ msg.message }}</p>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  username: { type: String, required: true }
})

// Configuration for your Pi
const PI_IP_CIM = "api.hitjamparty.com"
const targetApiUrl = `https://${PI_IP_CIM}/HitJamParty/kodex.php`

const messages = ref([])
const newMessage = ref('')
const loadingFeed = ref(true)
const submitting = ref(false)
// --- DATA FETCHING & ACTIONS LOGIC ---

// Berichten ophalen van de Pi
async function fetchMessages() {
  try {
    const response = await fetch(targetApiUrl)
    if (!response.ok) throw new Error("Network error")
    const data = await response.json()
    if (data.success) {
      messages.value = data.messages
    }
  } catch (err) {
    console.error("Failed to load guestbook feed:", err)
  } finally {
    loadingFeed.value = false
  }
}

// Nieuw bericht versturen naar de Pi
async function submitMessage() {
  if (!newMessage.value.trim() || submitting.value) return

  submitting.value = true
  try {
    const response = await fetch(targetApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: props.username,
        message: newMessage.value.trim()
      })
    })

    if (!response.ok) throw new Error("Network error")
    const data = await response.json()

    if (data.success) {
      newMessage.value = '' // Input leegmaken
      await fetchMessages() // Feed live verversen!
    } else {
      alert(`⚠️ Error: ${data.error}`)
    }
  } catch (err) {
    console.error("Failed to submit message:", err)
    alert("Could not connect to Raspberry Pi to save your comment.")
  } finally {
    submitting.value = false
  }
}

// Datum netjes formatteren (omzetting van SQLite UTC timestamp naar leesbare tijd)
function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    // SQLite geeft yyyy-mm-dd hh:mm:ss terug, we maken er een kortere weergave van
    const t = dateStr.split(/[- :]/)
    return `${t[1]}/${t[2]} ${t[3]}:${t[4]}`
  } catch (e) {
    return dateStr
  }
}

// Zodra de component in het scherm geladen wordt, direct de feed ophalen
onMounted(() => {
  fetchMessages()
})
</script>

<style scoped>
.kodex-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  animation: fadeIn 0.3s ease;
}

/* KODEX RULES CARD STYLING */
.kodex-rules-card {
  background: rgba(255, 69, 0, 0.05);
  border: 1px dashed rgba(255, 69, 0, 0.3);
  padding: 15px;
  border-radius: 15px;
  box-sizing: border-box;
}

.kodex-title {
  margin: 0 0 5px 0;
  color: #fff;
  text-align: center;
  letter-spacing: 1px;
}

.kodex-intro {
  margin: 0 0 15px 0;
  font-size: 12px;
  opacity: 0.6;
  text-align: center;
  font-style: italic;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rules-list li strong {
  color: #ff4500;
  font-size: 14px;
  display: block;
  margin-bottom: 2px;
}

.rules-list li p {
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
  line-height: 1.4;
  color: #fff;
}

/* GUESTBOOK SECTION STYLING */
.guestbook-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guestbook-title {
  margin: 0;
  color: #fff;
  font-size: 15px;
  border-bottom: 1px solid rgba(255, 69, 0, 0.2);
  padding-bottom: 5px;
}

.kodex-textarea {
  min-height: 70px;
  max-height: 120px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px !important;
  font-weight: normal !important;
}

.submit-msg-btn {
  margin: 5px 0 10px auto !important;
  padding: 8px 16px !important;
  font-size: 12px !important;
  border-radius: 15px !important;
}

/* MESSAGES FEED STYLING */
.messages-feed {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom scrollbar voor de berichtenstroom */
.messages-feed::-webkit-scrollbar { width: 4px; }
.messages-feed::-webkit-scrollbar-thumb { background: rgba(255, 69, 0, 0.3); border-radius: 10px; }

.kodex-info-text {
  text-align: center;
  font-size: 12px;
  color: #ff4500;
  opacity: 0.7;
}
.kodex-info-text.casual {
  color: #fff;
  opacity: 0.5;
  font-style: italic;
}

.message-bubble {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 10px;
  box-sizing: border-box;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 11px;
}

.msg-author {
  font-weight: bold;
  color: #ff8c00;
}

.msg-time {
  opacity: 0.4;
  font-family: monospace;
}

.msg-body {
  margin: 0;
  font-size: 13px;
  color: #fff;
  opacity: 0.9;
  line-height: 1.4;
  word-break: break-word;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
