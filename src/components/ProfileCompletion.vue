<template>
  <div class="profile-completion-overlay">
    <div class="auth-form-container profile-completion-modal">
      <div class="auth-form-header">
        <h2>Complete Your Profile</h2>
        <p>Please provide your personal information to continue</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="profile-form-grid">
          <div class="form-group">
            <label class="form-label">First Name *</label>
            <input v-model="form.name" type="text" class="form-input" placeholder="Enter your first name" required />
          </div>

          <div class="form-group">
            <label class="form-label">Last Name *</label>
            <input v-model="form.surname" type="text" class="form-input" placeholder="Enter your last name" required />
          </div>

          <div class="form-group">
            <label class="form-label">ID Number *</label>
            <input v-model="form.idNumber" type="text" class="form-input" placeholder="Enter your ID number" required />
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number *</label>
            <input v-model="form.phoneNumber" type="tel" class="form-input" placeholder="Enter your phone number" required />
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group" style="margin-top: 2rem;">
          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            <span v-if="loading">Saving...</span>
            <span v-else>Complete Profile</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

const emit = defineEmits(['completed'])

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  surname: '',
  idNumber: '',
  phoneNumber: ''
})

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    // Update user document in Firestore
    const userRef = doc(db, 'users', authStore.user.uid)
    await updateDoc(userRef, {
      name: form.name.trim(),
      surname: form.surname.trim(),
      idNumber: form.idNumber.trim(),
      phoneNumber: form.phoneNumber.trim(),
      profileCompleted: true,
      profileCompletedAt: new Date()
    })

    // Update auth store
    await authStore.refreshUserData()
    
    emit('completed')
  } catch (err) {
    error.value = err.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}
</script>