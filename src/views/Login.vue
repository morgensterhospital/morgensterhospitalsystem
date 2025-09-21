<template>
  <div class="auth-page">
    <div class="auth-form-container">
      <div class="auth-form-header">
        <h1>Welcome Back</h1>
        <p>Log in to the Morgenster Hospital Management System</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="role" class="form-label">Role</label>
          <select id="role" v-model="selectedRole" class="form-select" required @change="handleRoleChange">
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
          <label for="username" class="form-label">Email Address</label>
          <input id="username" v-model="email" type="email" class="form-input" placeholder="Enter your email address" required />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input id="password" v-model="password" type="password" class="form-input" placeholder="Enter your password" required />
        </div>

        <div v-if="error" class="error-message">
          <mdi-icon :path="mdiAlertCircle" size="16" />
          {{ error }}
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary btn-block" :disabled="loading || !selectedRole || !email || !password">
            <mdi-icon v-if="loading" :path="mdiLoading" size="20" class="spinning" />
            <span v-if="loading">Logging In...</span>
            <span v-else>Log In</span>
          </button>
        </div>

        <a href="#" class="forgot-password">
          Forgot Password?
        </a>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiLoading,
  mdiAlertCircle,
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