<template>
  <div id="app" class="app">
    <!-- Loading Screen -->
    <div v-if="authStore.loading" class="loading-screen">
      <div class="loading-content">
        <div class="hospital-logo">
          <mdi-icon :path="mdiHospital" size="64" color="#38bdf8" />
        </div>
        <h1 class="loading-title">Morgenster Hospital</h1>
        <p class="loading-subtitle">Management System</p>
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- Login Page -->
    <Login v-else-if="!authStore.isAuthenticated" />

    <!-- Profile Completion Modal -->
    <ProfileCompletion 
      v-else-if="showProfileCompletion" 
      @completed="handleProfileCompleted"
    />

    <!-- Main Application -->
    <AppShell v-else />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import Login from '@/views/Login.vue'
import AppShell from '@/components/layout/AppShell.vue'
import ProfileCompletion from '@/components/ProfileCompletion.vue'
import MdiIcon from '@/components/common/MdiIcon.vue'
import { mdiHospital } from '@mdi/js'

const authStore = useAuthStore()

const showProfileCompletion = computed(() => {
  return authStore.isAuthenticated && !authStore.user?.profileCompleted
})

const handleProfileCompleted = () => {
  // Profile completion handled in the component
  console.log('Profile completed')
}

onMounted(() => {
  // Initialize auth state
  authStore.initializeAuth()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.loading-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.hospital-logo {
  margin-bottom: 24px;
  animation: pulse 2s infinite;
}

.loading-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #38bdf8, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>