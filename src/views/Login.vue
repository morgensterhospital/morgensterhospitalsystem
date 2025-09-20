<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Background Pattern -->
      <div class="bg-pattern"></div>
      
      <!-- Login Card -->
      <div class="login-card">
        <!-- Hospital Header -->
        <div class="hospital-header">
          <div class="hospital-logo">
            <mdi-icon :path="mdiHospital" size="48" color="#38bdf8" />
          </div>
          <h1 class="hospital-name">MORGENSTER HOSPITAL</h1>
          <p class="hospital-subtitle">Management System</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="role" class="form-label">
              <mdi-icon :path="mdiAccountGroup" size="16" />
              LOG IN AS
            </label>
            <select
              id="role"
              v-model="selectedRole"
              class="form-select"
              required
              @change="handleRoleChange"
            >
              <option value="">Select Your Role</option>
              <option value="Admin">ADMIN</option>
              <option value="Accounts Clerk">ACCOUNTS CLERK</option>
              <option value="Account Assistant">ACCOUNT ASSISTANT</option>
              <option value="Accountant">ACCOUNTANT</option>
              <option value="Nurse">NURSE</option>
              <option value="Doctor">DOCTOR</option>
              <option value="Pharmacy Technician">PHARMACY TECHNICIAN</option>
              <option value="Dispensary Assistant">DISPENSARY ASSISTANT</option>
              <option value="Laboratory Technician">LABORATORY TECHNICIAN</option>
              <option value="Radiologist">RADIOLOGIST</option>
              <option value="Rehabilitation Technician">REHABILITATION TECHNICIAN</option>
              <option value="Vitals Checker">VITALS CHECKER</option>
            </select>
          </div>

          <div class="form-group">
            <label for="username" class="form-label">
              <mdi-icon :path="mdiEmail" size="16" />
              EMAIL ADDRESS
            </label>
            <input
              id="username"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">
              <mdi-icon :path="mdiLock" size="16" />
              PASSWORD
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <div v-if="error" class="error-message">
            <mdi-icon :path="mdiAlertCircle" size="16" />
            {{ error }}
          </div>

          <button
            type="submit"
            class="login-button"
            :disabled="loading || !selectedRole || !email || !password"
          >
            <mdi-icon v-if="loading" :path="mdiLoading" size="20" class="spinning" />
            <mdi-icon v-else :path="mdiLogin" size="20" />
            <span v-if="loading">LOGGING IN...</span>
            <span v-else>LOG IN</span>
          </button>

          <a href="#" class="forgot-password">
            <mdi-icon :path="mdiHelpCircle" size="14" />
            Forgot Password?
          </a>
        </form>

        <!-- System Footer -->
        <div class="system-footer">
          <p>© 2025 Morgenster Systems. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiHospital,
  mdiAccountGroup,
  mdiEmail,
  mdiLock,
  mdiLogin,
  mdiLoading,
  mdiAlertCircle,
  mdiHelpCircle
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()

const selectedRole = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    await authStore.login(email.value, password.value)
    
    // Verify the user has the selected role
    if (authStore.userRole !== selectedRole.value) {
      error.value = 'You do not have permission to access this role.'
      await authStore.logout()
      return
    }

    // Redirect to appropriate dashboard
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

// Auto-fill email based on role selection
const handleRoleChange = () => {
  const roleEmailMap = {
    'Admin': 'admin@mhs.com',
    'Doctor': 'doctor1@mhs.com',
    'Accounts Clerk': 'accountsclerk1@mhs.com',
    'Account Assistant': 'accountassistant1@mhs.com',
    'Accountant': 'accountant@mhs.com',
    'Nurse': 'nurse1@mhs.com',
    'Pharmacy Technician': 'pharmacytechnician1@mhs.com',
    'Dispensary Assistant': 'dispensaryassistant1@mhs.com',
    'Laboratory Technician': 'laboratorytechnician1@mhs.com',
    'Radiologist': 'radiologist1@mhs.com',
    'Rehabilitation Technician': 'rehabilitationtechnician1@mhs.com',
    'Vitals Checker': 'vitalschecker1@mhs.com'
  }
  
  if (roleEmailMap[selectedRole.value]) {
    email.value = roleEmailMap[selectedRole.value]
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(1deg); }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
}

.login-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  backdrop-filter: blur(12px);
}

.hospital-header {
  padding: 40px 32px 32px 32px;
  text-align: center;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(6, 182, 212, 0.1));
  border-bottom: 1px solid var(--border-primary);
}

.hospital-logo {
  margin-bottom: 16px;
  animation: pulse 2s infinite;
}

.hospital-name {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #38bdf8, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hospital-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.login-form {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-select,
.form-input {
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.2s ease;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
}

.form-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23cbd5e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.form-input::placeholder {
  color: var(--text-muted);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--accent-error);
  border-radius: 8px;
  color: var(--accent-error);
  font-size: 14px;
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

.forgot-password {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--accent-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: var(--accent-secondary);
}

.system-footer {
  padding: 24px 32px;
  background: var(--bg-tertiary);
  text-align: center;
  border-top: 1px solid var(--border-primary);
}

.system-footer p {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

@media (max-width: 640px) {
  .login-card {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .hospital-header {
    padding: 32px 24px;
  }

  .hospital-name {
    font-size: 20px;
  }

  .login-form {
    padding: 32px 24px;
    flex: 1;
  }

  .system-footer {
    padding: 20px 24px;
  }
}
</style>