<template>
  <div class="dashboard">
    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="welcome-info">
          <h1 class="welcome-title">Welcome back, {{ userDisplayName }}</h1>
          <p class="welcome-subtitle">Nursing Dashboard - {{ wardType }} Ward</p>
        </div>
        <div class="datetime-display">
          <div class="date-time">
            <span class="date">{{ currentDate }}</span>
            <span class="time">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">
            <mdi-icon :path="mdiHeart" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayStats.vitalsChecked }}</div>
            <div class="stat-label">Vitals Checked</div>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">
            <mdi-icon :path="mdiNoteText" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayStats.notesAdded }}</div>
            <div class="stat-label">Notes Added</div>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">
            <mdi-icon :path="mdiAccountMultiple" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayStats.patientsAssigned }}</div>
            <div class="stat-label">Patients Assigned</div>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">
            <mdi-icon :path="mdiPill" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayStats.medicationsGiven }}</div>
            <div class="stat-label">Medications Given</div>
          </div>
        </div>
      </div>

      <!-- Main Actions Grid -->
      <div class="actions-grid">
        <!-- New Patient Registration -->
        <div class="action-card" @click="navigateTo('/patient/register')">
          <div class="action-header">
            <mdi-icon :path="mdiAccountPlus" size="32" />
            <h3>New Patient Registration</h3>
          </div>
          <p>Register new patients for the ward</p>
          <div class="action-footer">
            <span class="action-count">Quick registration</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Vitals Management -->
        <div class="action-card" @click="navigateTo('/vitals')">
          <div class="action-header">
            <mdi-icon :path="mdiHeart" size="32" />
            <h3>Vitals Management</h3>
          </div>
          <p>Record and monitor patient vital signs</p>
          <div class="action-footer">
            <span class="action-count">Record vitals</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Nursing Notes -->
        <div class="action-card" @click="navigateTo('/nursing-notes')">
          <div class="action-header">
            <mdi-icon :path="mdiNoteText" size="32" />
            <h3>Nursing Notes</h3>
          </div>
          <p>Add and review nursing observations</p>
          <div class="action-footer">
            <span class="action-count">Add notes</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Ward Management -->
        <div class="action-card" @click="navigateTo('/ward-management')">
          <div class="action-header">
            <mdi-icon :path="mdiHospitalBuilding" size="32" />
            <h3>Ward Management</h3>
          </div>
          <p>Manage ward activities and patient care</p>
          <div class="action-footer">
            <span class="action-count">Manage ward</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>
      </div>

      <!-- Patient Search Section -->
      <div class="search-section">
        <div class="search-card">
          <h3>Patient Search</h3>
          <div class="search-container">
            <div class="search-input-wrapper">
              <mdi-icon :path="mdiMagnify" size="20" class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search patient name and surname..."
                @input="handleSearch"
              />
            </div>
            
            <div v-if="searchResults.length > 0" class="search-results">
              <div
                v-for="patient in searchResults"
                :key="patient.id"
                class="search-result-item"
                @click="selectPatient(patient)"
              >
                <div class="patient-info">
                  <div class="patient-name">{{ patient.name }} {{ patient.surname }}</div>
                  <div class="patient-details">{{ patient.hospitalNumber }} • {{ patient.age }} years</div>
                </div>
                <mdi-icon :path="mdiChevronRight" size="16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ward Patients -->
      <div class="ward-patients-section">
        <div class="ward-patients-card">
          <div class="section-header">
            <h3>{{ wardType }} Ward Patients</h3>
            <div class="patient-count">{{ wardPatients.length }} patients</div>
          </div>
          <div class="patients-grid">
            <div v-for="patient in wardPatients" :key="patient.id" class="patient-card" @click="selectPatient(patient)">
              <div class="patient-header">
                <div class="patient-avatar">
                  <mdi-icon :path="mdiAccount" size="20" />
                </div>
                <div class="patient-basic-info">
                  <div class="patient-name">{{ patient.name }} {{ patient.surname }}</div>
                  <div class="patient-number">{{ patient.hospitalNumber }}</div>
                </div>
                <div class="patient-status">
                  <span class="status-badge" :class="patient.status">{{ patient.status }}</span>
                </div>
              </div>
              <div class="patient-vitals">
                <div class="vital-item">
                  <span class="vital-label">BP:</span>
                  <span class="vital-value">{{ patient.lastVitals?.bloodPressure || 'N/A' }}</span>
                </div>
                <div class="vital-item">
                  <span class="vital-label">Temp:</span>
                  <span class="vital-value">{{ patient.lastVitals?.temperature || 'N/A' }}°C</span>
                </div>
                <div class="vital-item">
                  <span class="vital-label">Pulse:</span>
                  <span class="vital-value">{{ patient.lastVitals?.pulse || 'N/A' }} bpm</span>
                </div>
              </div>
              <div class="patient-actions">
                <button class="quick-action-btn" @click.stop="addVitals(patient)">
                  <mdi-icon :path="mdiHeart" size="16" />
                  Vitals
                </button>
                <button class="quick-action-btn" @click.stop="addNote(patient)">
                  <mdi-icon :path="mdiNoteText" size="16" />
                  Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiAccountPlus,
  mdiMagnify,
  mdiHeart,
  mdiNoteText,
  mdiAccountMultiple,
  mdiPill,
  mdiHospitalBuilding,
  mdiChevronRight,
  mdiAccount
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const searchQuery = ref('')
const searchResults = ref([])
const currentDate = ref('')
const currentTime = ref('')

const todayStats = ref({
  vitalsChecked: 15,
  notesAdded: 8,
  patientsAssigned: 12,
  medicationsGiven: 6
})

const wardPatients = ref([
  {
    id: '1',
    name: 'Sarah',
    surname: 'Wilson',
    hospitalNumber: 'MHS250001',
    status: 'stable',
    lastVitals: {
      bloodPressure: '120/80',
      temperature: '36.5',
      pulse: '72'
    }
  },
  {
    id: '2',
    name: 'Robert',
    surname: 'Brown',
    hospitalNumber: 'MHS250002',
    status: 'critical',
    lastVitals: {
      bloodPressure: '140/90',
      temperature: '38.2',
      pulse: '95'
    }
  },
  {
    id: '3',
    name: 'Emily',
    surname: 'Davis',
    hospitalNumber: 'MHS250003',
    status: 'recovering',
    lastVitals: {
      bloodPressure: '115/75',
      temperature: '36.8',
      pulse: '68'
    }
  }
])

let timeInterval = null

// User display name and ward type
const userDisplayName = computed(() => {
  const userDoc = authStore.userDocument
  if (userDoc?.name && userDoc?.surname) {
    return `${userDoc.name} ${userDoc.surname}`
  }
  return authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'Nurse'
})

const wardType = computed(() => {
  return authStore.userClaims?.wardType || 'General'
})

// Initialize datetime display
const updateDateTime = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
  currentTime.value = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Handle patient search
const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  try {
    const results = await patientStore.searchPatients(searchQuery.value)
    searchResults.value = results
  } catch (error) {
    console.error('Search error:', error)
  }
}

// Navigate to patient profile
const selectPatient = (patient) => {
  router.push(`/patient/${patient.id}`)
  searchQuery.value = ''
  searchResults.value = []
}

// Navigation helper
const navigateTo = (path) => {
  router.push(path)
}

// Quick actions
const addVitals = (patient) => {
  router.push(`/patient/${patient.id}?tab=vitals&action=add`)
}

const addNote = (patient) => {
  router.push(`/patient/${patient.id}?tab=notes&action=add`)
}

onMounted(() => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dashboard-content {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Welcome Header */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.welcome-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 16px;
}

.datetime-display {
  text-align: right;
}

.date-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.time {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-primary);
  font-family: 'JetBrains Mono', monospace;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.stat-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, var(--accent-success), #059669);
  color: white;
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, var(--accent-warning), #d97706);
  color: white;
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.action-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-primary);
}

.action-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.action-card p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.action-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.action-count {
  font-size: 14px;
  color: var(--accent-primary);
  font-weight: 500;
}

/* Search Section */
.search-section {
  width: 100%;
}

.search-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
}

.search-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.search-container {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 8px;
}

.search-result-item {
  padding: 16px;
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-result-item:hover {
  background: var(--bg-hover);
}

.search-result-item:last-child {
  border-bottom: none;
}

.patient-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.patient-details {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Ward Patients */
.ward-patients-section {
  width: 100%;
}

.ward-patients-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.patient-count {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.patients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.patient-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.patient-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.patient-avatar {
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.patient-basic-info {
  flex: 1;
}

.patient-number {
  font-size: 12px;
  color: var(--text-muted);
}

.patient-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.stable {
  background: rgba(16, 185, 129, 0.2);
  color: var(--accent-success);
}

.status-badge.critical {
  background: rgba(239, 68, 68, 0.2);
  color: var(--accent-error);
}

.status-badge.recovering {
  background: rgba(245, 158, 11, 0.2);
  color: var(--accent-warning);
}

.patient-vitals {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.vital-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.vital-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.vital-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

.patient-actions {
  display: flex;
  gap: 8px;
}

.quick-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
}

.quick-action-btn:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-content {
    padding: 24px 16px;
    gap: 24px;
  }

  .welcome-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }

  .datetime-display {
    text-align: left;
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .patients-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .dashboard-content {
    padding: 16px;
    gap: 20px;
  }

  .welcome-header {
    padding: 16px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 20px;
  }

  .action-card {
    padding: 20px;
  }

  .patient-vitals {
    flex-direction: column;
    gap: 8px;
  }

  .vital-item {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>