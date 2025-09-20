<template>
  <div class="dashboard">
    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="welcome-info">
          <h1 class="welcome-title">Welcome back, {{ userDisplayName }}</h1>
          <p class="welcome-subtitle">Pharmacy Dashboard</p>
        </div>
        <div class="datetime-display">
          <div class="date-time">
            <span class="date">{{ currentDate }}</span>
            <span class="time">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- Pharmacy Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">
            <mdi-icon :path="mdiPrescription" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayStats.prescriptionsDispensed }}</div>
            <div class="stat-label">Prescriptions Dispensed</div>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">
            <mdi-icon :path="mdiAlertCircle" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayStats.lowStockItems }}</div>
            <div class="stat-label">Low Stock Alerts</div>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">
            <mdi-icon :path="mdiPackageVariant" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayStats.totalItems }}</div>
            <div class="stat-label">Total Items</div>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">
            <mdi-icon :path="mdiCashMultiple" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">M{{ formatCurrency(todayStats.dailyRevenue) }}</div>
            <div class="stat-label">Daily Revenue</div>
          </div>
        </div>
      </div>

      <!-- Main Actions Grid -->
      <div class="actions-grid">
        <!-- Stock Management -->
        <div class="action-card" @click="navigateTo('/inventory')">
          <div class="action-header">
            <mdi-icon :path="mdiPackageVariant" size="32" />
            <h3>Stock Management</h3>
          </div>
          <p>Manage pharmacy inventory and stock levels</p>
          <div class="action-footer">
            <span class="action-count">{{ todayStats.lowStockItems }} low stock</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Dispensary -->
        <div class="action-card" @click="navigateTo('/dispensary')">
          <div class="action-header">
            <mdi-icon :path="mdiPill" size="32" />
            <h3>Dispensary</h3>
          </div>
          <p>Dispense medications and manage prescriptions</p>
          <div class="action-footer">
            <span class="action-count">{{ pendingPrescriptions.length }} pending</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Prescription Queue -->
        <div class="action-card" @click="navigateTo('/prescription-queue')">
          <div class="action-header">
            <mdi-icon :path="mdiClipboardList" size="32" />
            <h3>Prescription Queue</h3>
          </div>
          <p>View and process prescription requests</p>
          <div class="action-footer">
            <span class="action-count">Process queue</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Pharmacy Reports -->
        <div class="action-card" @click="navigateTo('/pharmacy-reports')">
          <div class="action-header">
            <mdi-icon :path="mdiChartBar" size="32" />
            <h3>Pharmacy Reports</h3>
          </div>
          <p>Generate pharmacy-specific reports</p>
          <div class="action-footer">
            <span class="action-count">View reports</span>
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

      <!-- Pending Prescriptions -->
      <div class="prescriptions-section">
        <div class="prescriptions-card">
          <div class="section-header">
            <h3>Pending Prescriptions</h3>
            <div class="prescription-count">{{ pendingPrescriptions.length }} prescriptions</div>
          </div>
          <div class="prescriptions-list">
            <div v-for="prescription in pendingPrescriptions" :key="prescription.id" class="prescription-item">
              <div class="prescription-info">
                <div class="prescription-patient">{{ prescription.patientName }}</div>
                <div class="prescription-details">{{ prescription.medication }} • {{ prescription.dosage }}</div>
                <div class="prescription-doctor">Prescribed by: {{ prescription.doctorName }}</div>
              </div>
              <div class="prescription-actions">
                <button class="dispense-btn" @click="dispensePrescription(prescription)">
                  <mdi-icon :path="mdiCheck" size="16" />
                  Dispense
                </button>
                <button class="view-btn" @click="viewPrescription(prescription)">
                  <mdi-icon :path="mdiEye" size="16" />
                  View
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
  mdiPackageVariant,
  mdiMagnify,
  mdiPill,
  mdiPrescription,
  mdiAlertCircle,
  mdiCashMultiple,
  mdiChartBar,
  mdiClipboardList,
  mdiChevronRight,
  mdiCheck,
  mdiEye
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const searchQuery = ref('')
const searchResults = ref([])
const currentDate = ref('')
const currentTime = ref('')

const todayStats = ref({
  prescriptionsDispensed: 24,
  lowStockItems: 3,
  totalItems: 156,
  dailyRevenue: 4500.00
})

const pendingPrescriptions = ref([
  {
    id: '1',
    patientName: 'John Doe',
    medication: 'Paracetamol 500mg',
    dosage: '2 tablets, 3 times daily',
    doctorName: 'Dr. Smith',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    medication: 'Amoxicillin 250mg',
    dosage: '1 capsule, 2 times daily',
    doctorName: 'Dr. Johnson',
    timestamp: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    id: '3',
    patientName: 'Michael Brown',
    medication: 'Ibuprofen 200mg',
    dosage: '1 tablet, as needed',
    doctorName: 'Dr. Wilson',
    timestamp: new Date(Date.now() - 90 * 60 * 1000)
  }
])

let timeInterval = null

// User display name
const userDisplayName = computed(() => {
  const userDoc = authStore.userDocument
  if (userDoc?.name && userDoc?.surname) {
    return `${userDoc.name} ${userDoc.surname}`
  }
  return authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'Pharmacist'
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

// Prescription actions
const dispensePrescription = (prescription) => {
  console.log('Dispensing prescription:', prescription.medication)
  // Remove from pending list
  const index = pendingPrescriptions.value.findIndex(item => item.id === prescription.id)
  if (index !== -1) {
    pendingPrescriptions.value.splice(index, 1)
    todayStats.value.prescriptionsDispensed++
  }
}

const viewPrescription = (prescription) => {
  console.log('Viewing prescription details:', prescription.id)
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
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

/* Prescriptions Section */
.prescriptions-section {
  width: 100%;
}

.prescriptions-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.prescription-count {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.prescriptions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prescription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.prescription-item:hover {
  background: var(--bg-hover);
}

.prescription-info {
  flex: 1;
}

.prescription-patient {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.prescription-details {
  font-size: 14px;
  color: var(--accent-primary);
  margin-bottom: 4px;
}

.prescription-doctor {
  font-size: 12px;
  color: var(--text-muted);
}

.prescription-actions {
  display: flex;
  gap: 8px;
}

.dispense-btn,
.view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.dispense-btn {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--accent-success);
  color: var(--accent-success);
}

.dispense-btn:hover {
  background: rgba(16, 185, 129, 0.2);
}

.view-btn {
  background: rgba(56, 189, 248, 0.1);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.view-btn:hover {
  background: rgba(56, 189, 248, 0.2);
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

  .prescription-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .prescription-actions {
    width: 100%;
    justify-content: flex-end;
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

  .prescription-actions {
    flex-direction: column;
    gap: 8px;
  }

  .dispense-btn,
  .view-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>