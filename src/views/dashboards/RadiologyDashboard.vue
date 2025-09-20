<template>
  <div class="dashboard">
    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="welcome-info">
          <h1 class="welcome-title">Welcome back, {{ userDisplayName }}</h1>
          <p class="welcome-subtitle">Radiology Dashboard</p>
        </div>
        <div class="datetime-display">
          <div class="date-time">
            <span class="date">{{ currentDate }}</span>
            <span class="time">{{ currentTime }}</span>
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

      <!-- X-ray Status Kanban Board -->
      <div class="kanban-section">
        <h2 class="kanban-title">X-ray Request Status</h2>
        <div class="kanban-board">
          <!-- Incoming X-rays -->
          <div class="kanban-column incoming">
            <div class="column-header">
              <div class="column-icon">
                <mdi-icon :path="mdiClockOutline" size="20" />
              </div>
              <h3>Incoming X-rays</h3>
              <span class="count-badge">{{ incomingXrays.length }}</span>
            </div>
            <div class="column-content">
              <div
                v-for="xray in incomingXrays"
                :key="xray.id"
                class="xray-card"
                @click="viewXray(xray)"
              >
                <div class="xray-patient">{{ xray.patientName }}</div>
                <div class="xray-type">{{ xray.xrayType }}</div>
                <div class="xray-time">{{ formatTime(xray.timestamp) }}</div>
                <div class="xray-actions">
                  <button class="action-btn start" @click.stop="startXray(xray)">
                    <mdi-icon :path="mdiPlay" size="14" />
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending X-rays -->
          <div class="kanban-column pending">
            <div class="column-header">
              <div class="column-icon">
                <mdi-icon :path="mdiClockAlert" size="20" />
              </div>
              <h3>Pending X-rays</h3>
              <span class="count-badge">{{ pendingXrays.length }}</span>
            </div>
            <div class="column-content">
              <div
                v-for="xray in pendingXrays"
                :key="xray.id"
                class="xray-card"
                @click="viewXray(xray)"
              >
                <div class="xray-patient">{{ xray.patientName }}</div>
                <div class="xray-type">{{ xray.xrayType }}</div>
                <div class="xray-time">{{ formatTime(xray.timestamp) }}</div>
                <div class="xray-actions">
                  <button class="action-btn complete" @click.stop="completeXray(xray)">
                    <mdi-icon :path="mdiCheck" size="14" />
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Done X-rays -->
          <div class="kanban-column done">
            <div class="column-header">
              <div class="column-icon">
                <mdi-icon :path="mdiCheckCircle" size="20" />
              </div>
              <h3>Done X-rays</h3>
              <span class="count-badge">{{ doneXrays.length }}</span>
            </div>
            <div class="column-content">
              <div
                v-for="xray in doneXrays"
                :key="xray.id"
                class="xray-card completed"
                @click="viewXray(xray)"
              >
                <div class="xray-patient">{{ xray.patientName }}</div>
                <div class="xray-type">{{ xray.xrayType }}</div>
                <div class="xray-results">{{ xray.resultDetails }}</div>
                <div class="xray-time">{{ formatTime(xray.resultTimestamp) }}</div>
              </div>
            </div>
          </div>

          <!-- Failed X-rays -->
          <div class="kanban-column failed">
            <div class="column-header">
              <div class="column-icon">
                <mdi-icon :path="mdiCloseCircle" size="20" />
              </div>
              <h3>Failed X-rays</h3>
              <span class="count-badge">{{ failedXrays.length }}</span>
            </div>
            <div class="column-content">
              <div
                v-for="xray in failedXrays"
                :key="xray.id"
                class="xray-card failed"
                @click="viewXray(xray)"
              >
                <div class="xray-patient">{{ xray.patientName }}</div>
                <div class="xray-type">{{ xray.xrayType }}</div>
                <div class="xray-results">{{ xray.resultDetails }}</div>
                <div class="xray-time">{{ formatTime(xray.resultTimestamp) }}</div>
                <div class="xray-actions">
                  <button class="action-btn retry" @click.stop="retryXray(xray)">
                    <mdi-icon :path="mdiRefresh" size="14" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports Section -->
      <div class="reports-section">
        <div class="reports-card">
          <div class="reports-header">
            <h3>Radiology Reports</h3>
            <button class="generate-btn" @click="downloadRadiologyReportPDF">
              <mdi-icon :path="mdiDownload" size="16" />
              Download PDF
            </button>
          </div>
          <div class="date-range">
            <div class="date-input-group">
              <label>From</label>
              <input v-model="reportDateFrom" type="date" class="date-input" />
            </div>
            <div class="date-input-group">
              <label>To</label>
              <input v-model="reportDateTo" type="date" class="date-input" />
            </div>
            <button class="generate-btn" @click="generateReport">
              Generate Report
            </button>
          </div>
          <p class="print-note">All sections can be printed separately</p>
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
import apiService from '@/services/api'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiMagnify,
  mdiClockOutline,
  mdiClockAlert,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiDownload,
  mdiChevronRight,
  mdiPlay,
  mdiCheck,
  mdiRefresh
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const searchQuery = ref('')
const searchResults = ref([])
const currentDate = ref('')
const currentTime = ref('')
const reportDateFrom = ref('')
const reportDateTo = ref('')

// X-ray status arrays
const incomingXrays = ref([
  {
    id: '1',
    patientName: 'John Doe',
    xrayType: 'Chest X-Ray',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    xrayType: 'Abdominal X-Ray',
    timestamp: new Date(Date.now() - 45 * 60 * 1000)
  }
])

const pendingXrays = ref([
  {
    id: '3',
    patientName: 'Michael Brown',
    xrayType: 'Spine X-Ray',
    timestamp: new Date(Date.now() - 60 * 60 * 1000)
  }
])

const doneXrays = ref([
  {
    id: '4',
    patientName: 'Sarah Wilson',
    xrayType: 'Chest X-Ray',
    resultDetails: 'Normal findings',
    resultTimestamp: new Date(Date.now() - 90 * 60 * 1000)
  }
])

const failedXrays = ref([
  {
    id: '5',
    patientName: 'Robert Davis',
    xrayType: 'Knee X-Ray',
    resultDetails: 'Patient movement during scan',
    resultTimestamp: new Date(Date.now() - 120 * 60 * 1000)
  }
])

let timeInterval = null

// User display name
const userDisplayName = computed(() => {
  const userDoc = authStore.userDocument
  if (userDoc?.name && userDoc?.surname) {
    return `${userDoc.name} ${userDoc.surname}`
  }
  return authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'Radiologist'
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

// X-ray actions
const viewXray = (xray) => {
  console.log('Viewing X-ray:', xray.id)
}

const startXray = (xray) => {
  console.log('Starting X-ray:', xray.id)
  // Move from incoming to pending
  const index = incomingXrays.value.findIndex(x => x.id === xray.id)
  if (index !== -1) {
    const xrayItem = incomingXrays.value.splice(index, 1)[0]
    pendingXrays.value.push(xrayItem)
  }
}

const completeXray = (xray) => {
  console.log('Completing X-ray:', xray.id)
  // Move from pending to done
  const index = pendingXrays.value.findIndex(x => x.id === xray.id)
  if (index !== -1) {
    const xrayItem = pendingXrays.value.splice(index, 1)[0]
    xrayItem.resultDetails = 'X-ray completed'
    xrayItem.resultTimestamp = new Date()
    doneXrays.value.push(xrayItem)
  }
}

const retryXray = (xray) => {
  console.log('Retrying X-ray:', xray.id)
  // Move from failed to incoming
  const index = failedXrays.value.findIndex(x => x.id === xray.id)
  if (index !== -1) {
    const xrayItem = failedXrays.value.splice(index, 1)[0]
    delete xrayItem.resultDetails
    delete xrayItem.resultTimestamp
    incomingXrays.value.push(xrayItem)
  }
}

// Generate report
const generateReport = () => {
  console.log('Generating radiology report from', reportDateFrom.value, 'to', reportDateTo.value)
}

// Download radiology report PDF
const downloadRadiologyReportPDF = async () => {
  try {
    await apiService.generateReportPDF('radiology_report', reportDateFrom.value, reportDateTo.value, authStore.user.uid)
  } catch (error) {
    console.error('Error downloading radiology report PDF:', error)
    alert('Error generating PDF report. Please try again.')
  }
}

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
  
  // Set default date range (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  reportDateFrom.value = thirtyDaysAgo.toISOString().split('T')[0]
  reportDateTo.value = today.toISOString().split('T')[0]
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
  max-width: 1600px;
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

/* Search Section */
.search-section {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
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

/* Kanban Board */
.kanban-section {
  width: 100%;
}

.kanban-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  text-align: center;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.kanban-column {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  overflow: hidden;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.column-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-primary);
}

.column-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kanban-column.incoming .column-header {
  background: rgba(245, 158, 11, 0.1);
}

.kanban-column.incoming .column-icon {
  background: rgba(245, 158, 11, 0.2);
  color: var(--accent-warning);
}

.kanban-column.pending .column-header {
  background: rgba(239, 68, 68, 0.1);
}

.kanban-column.pending .column-icon {
  background: rgba(239, 68, 68, 0.2);
  color: var(--accent-error);
}

.kanban-column.done .column-header {
  background: rgba(16, 185, 129, 0.1);
}

.kanban-column.done .column-icon {
  background: rgba(16, 185, 129, 0.2);
  color: var(--accent-success);
}

.kanban-column.failed .column-header {
  background: rgba(156, 163, 175, 0.1);
}

.kanban-column.failed .column-icon {
  background: rgba(156, 163, 175, 0.2);
  color: var(--text-muted);
}

.column-header h3 {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.count-badge {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.column-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.xray-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.xray-card:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.xray-card.completed {
  border-color: rgba(16, 185, 129, 0.3);
}

.xray-card.failed {
  border-color: rgba(239, 68, 68, 0.3);
}

.xray-patient {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.xray-type {
  font-size: 14px;
  color: var(--accent-primary);
  margin-bottom: 4px;
}

.xray-results {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  font-style: italic;
}

.xray-time {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.xray-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.action-btn.start {
  background: rgba(56, 189, 248, 0.1);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.action-btn.start:hover {
  background: rgba(56, 189, 248, 0.2);
}

.action-btn.complete {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--accent-success);
  color: var(--accent-success);
}

.action-btn.complete:hover {
  background: rgba(16, 185, 129, 0.2);
}

.action-btn.retry {
  background: rgba(245, 158, 11, 0.1);
  border-color: var(--accent-warning);
  color: var(--accent-warning);
}

.action-btn.retry:hover {
  background: rgba(245, 158, 11, 0.2);
}

/* Reports Section */
.reports-section {
  width: 100%;
}

.reports-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.reports-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-btn:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.date-range {
  display: flex;
  gap: 16px;
  align-items: end;
  margin-bottom: 16px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-input-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.date-input {
  padding: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.date-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.print-note {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  text-align: center;
  font-style: italic;
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

  .kanban-board {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .date-range {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
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

  .kanban-column {
    min-height: 400px;
  }

  .xray-actions {
    flex-direction: column;
    gap: 6px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>