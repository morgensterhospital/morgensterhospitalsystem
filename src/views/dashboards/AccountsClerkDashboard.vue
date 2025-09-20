<template>
  <div class="dashboard">
    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="welcome-info">
          <h1 class="welcome-title">Welcome back, {{ userDisplayName }}</h1>
          <p class="welcome-subtitle">Accounts Clerk Dashboard</p>
        </div>
        <div class="datetime-display">
          <div class="date-time">
            <span class="date">{{ currentDate }}</span>
            <span class="time">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- Sales Summary Cards -->
      <div class="sales-summary">
        <div class="summary-card total">
          <div class="summary-icon">
            <mdi-icon :path="mdiCashMultiple" size="32" />
          </div>
          <div class="summary-content">
            <div class="summary-value">M{{ formatCurrency(monthlyStats.totalSales) }}</div>
            <div class="summary-label">Total Monthly Sales</div>
          </div>
        </div>

        <div class="summary-card paid">
          <div class="summary-icon">
            <mdi-icon :path="mdiCheckCircle" size="32" />
          </div>
          <div class="summary-content">
            <div class="summary-value">M{{ formatCurrency(monthlyStats.paidSales) }}</div>
            <div class="summary-label">Total Paid Sales</div>
          </div>
        </div>

        <div class="summary-card unpaid">
          <div class="summary-icon">
            <mdi-icon :path="mdiClockAlert" size="32" />
          </div>
          <div class="summary-content">
            <div class="summary-value">M{{ formatCurrency(monthlyStats.unpaidSales) }}</div>
            <div class="summary-label">Total Unpaid Sales</div>
          </div>
        </div>
      </div>

      <!-- Main Actions Grid -->
      <div class="actions-grid">
        <!-- New Patient Registration -->
        <div class="action-card primary" @click="navigateTo('/patient/register')">
          <div class="action-header">
            <mdi-icon :path="mdiAccountPlus" size="32" />
            <h3>New Patient Registration</h3>
          </div>
          <p>Register new patients and create billing accounts</p>
          <div class="action-footer">
            <span class="action-count">Quick registration</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Reports -->
        <div class="action-card secondary" @click="navigateTo('/reports')">
          <div class="action-header">
            <mdi-icon :path="mdiChartLine" size="32" />
            <h3>Financial Reports</h3>
          </div>
          <p>Generate and view financial analytics</p>
          <div class="action-footer">
            <span class="action-count">Generate reports</span>
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
                <div class="patient-balance">
                  <span class="balance-amount">M{{ formatCurrency(patient.balance || 0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions */
      <div class="transactions-section">
        <div class="transactions-card">
          <div class="section-header">
            <h3>Recent Transactions</h3>
            <button class="view-all-btn" @click="navigateTo('/transactions')">
              View All
            </button>
          </div>
          <div class="transactions-list">
            <div v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
              <div class="transaction-info">
                <div class="transaction-patient">{{ transaction.patientName }}</div>
                <div class="transaction-details">{{ transaction.description }} • {{ formatTime(transaction.timestamp) }}</div>
              </div>
              <div class="transaction-amount" :class="transaction.type">
                {{ transaction.type === 'payment' ? '+' : '' }}M{{ formatCurrency(transaction.amount) }}
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
  mdiChartLine,
  mdiMagnify,
  mdiCashMultiple,
  mdiCheckCircle,
  mdiClockAlert,
  mdiChevronRight
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const searchQuery = ref('')
const searchResults = ref([])
const currentDate = ref('')
const currentTime = ref('')

const monthlyStats = ref({
  totalSales: 125000.00,
  paidSales: 98000.00,
  unpaidSales: 27000.00
})

const recentTransactions = ref([
  {
    id: '1',
    patientName: 'John Doe',
    description: 'Consultation payment',
    amount: 150.00,
    type: 'payment',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    description: 'X-Ray invoice',
    amount: 300.00,
    type: 'invoice',
    timestamp: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    id: '3',
    patientName: 'Michael Brown',
    description: 'Lab test payment',
    amount: 200.00,
    type: 'payment',
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
  return authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'User'
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

/* Sales Summary */
.sales-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.summary-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.summary-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.summary-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-card.total .summary-icon {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
}

.summary-card.paid .summary-icon {
  background: linear-gradient(135deg, var(--accent-success), #059669);
  color: white;
}

.summary-card.unpaid .summary-icon {
  background: linear-gradient(135deg, var(--accent-error), #dc2626);
  color: white;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.action-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-primary);
}

.action-card.primary:hover {
  border-color: var(--accent-primary);
}

.action-card.secondary:hover {
  border-color: var(--accent-success);
}

.action-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.action-card p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  font-size: 16px;
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

.patient-balance {
  text-align: right;
}

.balance-amount {
  font-weight: 600;
  color: var(--accent-warning);
}

/* Transactions Section */
.transactions-section {
  width: 100%;
}

.transactions-card {
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

.view-all-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--accent-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.view-all-btn:hover {
  background: var(--bg-hover);
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: var(--bg-hover);
}

.transaction-patient {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.transaction-details {
  font-size: 14px;
  color: var(--text-secondary);
}

.transaction-amount {
  font-weight: 700;
  font-size: 16px;
}

.transaction-amount.payment {
  color: var(--accent-success);
}

.transaction-amount.invoice {
  color: var(--accent-warning);
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

  .sales-summary {
    grid-template-columns: 1fr;
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

  .summary-card {
    padding: 24px;
  }

  .summary-value {
    font-size: 24px;
  }

  .action-card {
    padding: 24px;
  }
}
</style>