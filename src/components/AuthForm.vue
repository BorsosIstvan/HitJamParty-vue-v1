<template>
  <div>
    <!-- HEADINGS -->
    <h2 style="margin: 0 0 5px 0;">
      {{ isRegisterMode ? "Create New Account 📝" : "Welcome to the party! 👋" }}
    </h2>
    <p style="font-size: 13px; opacity: 0.7; margin-bottom: 20px;">
      {{ isRegisterMode 
        ? "Register to start collecting HitJamCoins!" 
        : "Log in to access your saved albums!" }}
    </p>

    <!-- ALERT MESSAGES -->
    <div v-if="error" class="hitjam-alert hitjam-alert-error">
      ⚠️ {{ error }}
    </div>

    <div v-if="successMessage" class="hitjam-alert hitjam-alert-success">
      {{ successMessage }}
    </div>

    <!-- FORM -->
    <form @submit.prevent="handleSubmit" class="hitjam-form">
      <div class="hitjam-field">
        <label>Username</label>
        <input
          type="text"
          v-model="username"
          :disabled="loading"
          placeholder="E.g. poci"
          class="hitjam-input"
        />
      </div>

      <div class="hitjam-field">
        <label>Password</label>
        <input
          type="password"
          v-model="password"
          :disabled="loading"
          placeholder="••••••••"
          class="hitjam-input"
        />
      </div>

      <button type="submit" class="hitjam-btn" :disabled="loading" style="width: 100%;">
        {{ loading ? "Processing..." : (isRegisterMode ? "Start Registration 🚀" : "Enter Game 🔓") }}
      </button>
    </form>

    <!-- MODE TOGGLE -->
    <button
      @click="toggleMode"
      :disabled="loading"
      class="hitjam-link-btn"
    >
      {{ isRegisterMode ? "Already have an account? Log in here!" : "Don't have an account? Register here!" }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const PI_IP_CIM = "api.hitjamparty.com"
const emit = defineEmits(['auth-success'])

const isRegisterMode = ref(false)
const username = ref("")
const password = ref("")
const loading = ref(false)
const error = ref("")
const successMessage = ref("")

function toggleMode() {
  isRegisterMode.value = !isRegisterMode.value
  error.value = ""
  successMessage.value = ""
}

async function handleSubmit() {
  if (!username.value || !password.value) {
    error.value = "All fields must be filled!"
    return
  }

  error.value = ""
  successMessage.value = ""
  loading.value = true

  try {
    const response = await fetch(`https://${PI_IP_CIM}/HitJamParty/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
        action: isRegisterMode.value ? 'register' : 'login'
      })
    })

    if (!response.ok) {
      throw new Error("Server not responding. Check Raspberry Pi connection!")
    }

    const data = await response.json()
    loading.value = false

    if (data.success) {
      if (isRegisterMode.value) {
        successMessage.value = "🎉 Registration successful! You can now log in."
        isRegisterMode.value = false
        password.value = ""
      } else {
        emit('auth-success', {
          username: data.username,
          score: data.score,
          coins: data.coins,
          ownedAlbums: data.ownedAlbums,
          activeAlbumIds: data.activeAlbumIds
        })
      }
    } else {
      error.value = data.error
    }

  } catch (err) {
    console.error("Network error:", err)
    loading.value = false
    error.value = "Could not reach Raspberry Pi. Is it turned on?"
  }
}
</script>
