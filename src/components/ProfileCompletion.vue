<template>
  <div class="profile-completion-overlay">
    <div class="profile-completion-modal">
      <div class="modal-header">
        <div class="header-icon">
          <mdi-icon :path="mdiAccountEdit" size="32" color="#38bdf8" />
        </div>
        <h2>Complete Your Profile</h2>
        <p>Please provide your personal information to continue</p>
      </div>

      <form @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-grid">
          <div class="form-group">
            <label>First Name *</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="Enter your first name"
              required
            />
          </div>

          <div class="form-group">
            <label>Last Name *</label>
            <input
              v-model="form.surname"
              type="text"
              class="form-input"
              placeholder="Enter your last name"
              required
            />
          </div>

          <div class="form-group">
            <label>ID Number *</label>
            <input
              v-model="form.idNumber"
              type="text"
              class="form-input"
              placeholder="Enter your ID number"
              required
            />
          </div>

          <div class="form-group">
            <label>Phone Number *</label>
            <input
              v-model="form.phoneNumber"
              type="tel"
              class="form-input"
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="submit-button"
            :disabled="loading"
          >
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
import MdiIcon from '@/components/common/MdiIcon.vue'
import { mdiAccountEdit } from '@mdi/js'
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

<style scoped>
.profile-completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.profile-completion-modal {
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  max-width: 600px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 32px 32px 24px 32px;
  text-align: center;
  border-bottom: 1px solid var(--border-primary);
}

.header-icon {
  margin-bottom: 16px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.modal-header p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 16px;
}

.profile-form {
  padding: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-input {
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.error-message {
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--accent-error);
  border-radius: 8px;
  color: var(--accent-error);
  font-size: 14px;
  text-align: center;
  margin-bottom: 24px;
}

.form-actions {
  display: flex;
  justify-content: center;
}

.submit-button {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .profile-completion-modal {
    margin: 10px;
  }

  .modal-header,
  .profile-form {
    padding: 24px 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>