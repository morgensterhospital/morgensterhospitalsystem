<template>
  <div class="profile-completion-overlay">
    <div class="profile-completion-modal">
      <div class="modal-header">
        <div class="header-icon">
          <mdi-icon :path="mdiAccountEdit" size="32" />
        </div>
        <h2>Complete Your Profile</h2>
        <p>Please provide your personal information to continue</p>
      </div>

      <form @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-grid">
          <m3-text-field
            v-model="form.name"
            label="First Name"
            required
          />
          <m3-text-field
            v-model="form.surname"
            label="Last Name"
            required
          />
          <m3-text-field
            v-model="form.idNumber"
            label="ID Number"
            required
          />
          <m3-text-field
            v-model="form.phoneNumber"
            label="Phone Number"
            type="tel"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <m3-button
            type="submit"
            variant="filled"
            size="large"
            :disabled="loading"
          >
            <span v-if="loading">Saving...</span>
            <span v-else>Complete Profile</span>
          </m3-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3TextField from '@/components/common/M3TextField.vue'
import M3Button from '@/components/common/M3Button.vue'
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
  background: rgba(13, 11, 20, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.profile-completion-modal {
  background-color: var(--bg-secondary);
  border-radius: 24px;
  border: 1px solid var(--border-primary);
  max-width: 640px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 24px 32px;
  text-align: center;
  border-bottom: 1px solid var(--border-primary);
}

.header-icon {
  margin-bottom: 12px;
  color: var(--accent-primary);
}

.modal-header h2 {
  font-size: 22px;
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
  margin-bottom: 32px;
}

.error-message {
  padding: 12px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--accent-error);
  border-radius: 10px;
  color: var(--accent-error);
  font-size: 14px;
  text-align: center;
  margin-bottom: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .profile-completion-modal {
    margin: 0;
    border-radius: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .profile-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>