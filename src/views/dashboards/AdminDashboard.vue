<template>
  <div class="dashboard">
    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="welcome-info">
          <h1 class="welcome-title">Welcome back, {{ userDisplayName }}</h1>
          <p class="welcome-subtitle">System Administrator Dashboard</p>
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
            <mdi-icon :path="mdiAccountGroup" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ systemStats.totalUsers }}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">
            <mdi-icon :path="mdiAccountPlus" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ systemStats.totalPatients }}</div>
            <div class="stat-label">Total Patients</div>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">
            <mdi-icon :path="mdiHospitalBuilding" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ systemStats.activeDepartments }}</div>
            <div class="stat-label">Active Departments</div>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">
            <mdi-icon :path="mdiCashMultiple" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">M{{ formatCurrency(systemStats.monthlyRevenue) }}</div>
            <div class="stat-label">Monthly Revenue</div>
          </div>
        </div>
      </div>

      <!-- Main Actions Grid -->
      <div class="actions-grid">
        <!-- User Management -->
        <div class="action-card" @click="navigateTo('/users')">
          <div class="action-header">
            <mdi-icon :path="mdiAccountGroup" size="32" />
            <h3>User Management</h3>
          </div>
          <p>Manage system users, roles, and permissions</p>
          <div class="action-footer">
            <span class="action-count">{{ systemStats.totalUsers }} users</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Patient Registration -->
        <div class="action-card" @click="navigateTo('/patient/register')">
          <div class="action-header">
            <mdi-icon :path="mdiAccountPlus" size="32" />
            <h3>New Patient Registration</h3>
          </div>
          <p>Register new patients into the system</p>
          <div class="action-footer">
            <span class="action-count">Quick registration</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Reports & Analytics -->
        <div class="action-card" @click="navigateTo('/reports')">
          <div class="action-header">
            <mdi-icon :path="mdiChartLine" size="32" />
            <h3>Reports & Analytics</h3>
          </div>
          <p>View financial reports and system analytics</p>
          <div class="action-footer">
            <span class="action-count">Generate reports</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- System Settings -->
        <div class="action-card" @click="navigateTo('/settings')">
          <div class="action-header">
            <mdi-icon :path="mdiCog" size="32" />
            <h3>System Settings</h3>
          </div>
          <p>Configure system settings and preferences</p>
          <div class="action-footer">
            <span class="action-count">System config</span>
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

      <!-- Recent Activity -->
      <div class="activity-section">
        <div class="activity-card">
          <div class="activity-header">
            <h3>Recent System Activity</h3>
            <button class="refresh-btn" @click="refreshActivity">
              <mdi-icon :path="mdiRefresh" size="16" />
            </button>
          </div>
          <div class="activity-list">
            <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <mdi-icon :path="activity.icon" size="16" />
              </div>
              <div class="activity-content">
                <div class="activity-message">{{ activity.message }}</div>
                <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
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
  mdiAccountGroup,
  mdiAccountPlus,
  mdiChartLine,
  mdiMagnify,
  mdiCog,
  mdiHospitalBuilding,
  mdiCashMultiple,
  mdiChevronRight,
  mdiRefresh,
  mdiClockOutline,
  mdiFileDocument,
  mdiSecurity
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const searchQuery = ref('')
const searchResults = ref([])
const currentDate = ref('')
const currentTime = ref('')

const systemStats = ref({
  totalUsers: 147,
  totalPatients: 0,
  activeDepartments: 8,
  monthlyRevenue: 125000.00
})

const recentActivity = ref([
  {
    id: 1,
    message: 'New patient registered by Accounts Clerk',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    icon: mdiAccountPlus
  },
  {
    id: 2,
    message: 'Financial report generated',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    icon: mdiFileDocument
  },
  {
    id: 3,
    message: 'User permissions updated',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    icon: mdiSecurity
  },
  {
    id: 4,
    message: 'System backup completed',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    icon: mdiCog
  }
])

let timeInterval = null

// User display name
const userDisplayName = computed(() => {
  const userDoc = authStore.userDocument
  if (userDoc?.name && userDoc?.surname) {
    return `${userDoc.name} ${userDoc.surname}`
  }
  return authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'Administrator'
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

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Format time
const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Refresh activity
const refreshActivity = () => {
  console.log('Refreshing activity...')
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

/* Activity Section */
.activity-section {
  width: 100%;
}

.activity-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.refresh-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: var(--bg-hover);
}

.activity-icon {
  width: 32px;
  height: 32px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-message {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.activity-time {
  font-size: 12px;
  color: var(--text-muted);
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
}
</style>