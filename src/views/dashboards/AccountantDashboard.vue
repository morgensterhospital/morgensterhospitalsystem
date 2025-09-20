<template>
  <div class="dashboard">
    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="welcome-info">
          <h1 class="welcome-title">Welcome back, {{ userDisplayName }}</h1>
          <p class="welcome-subtitle">Chief Accountant Dashboard</p>
        </div>
        <div class="datetime-display">
          <div class="date-time">
            <span class="date">{{ currentDate }}</span>
            <span class="time">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- Financial Overview Cards -->
      <div class="financial-overview">
        <div class="overview-card revenue">
          <div class="overview-icon">
            <mdi-icon :path="mdiTrendingUp" size="32" />
          </div>
          <div class="overview-content">
            <div class="overview-value">M{{ formatCurrency(financialStats.totalRevenue) }}</div>
            <div class="overview-label">Total Revenue</div>
            <div class="overview-change positive">+{{ financialStats.revenueGrowth }}% from last month</div>
          </div>
        </div>

        <div class="overview-card expenses">
          <div class="overview-icon">
            <mdi-icon :path="mdiTrendingDown" size="32" />
          </div>
          <div class="overview-content">
            <div class="overview-value">M{{ formatCurrency(financialStats.totalExpenses) }}</div>
            <div class="overview-label">Total Expenses</div>
            <div class="overview-change negative">+{{ financialStats.expenseGrowth }}% from last month</div>
          </div>
        </div>

        <div class="overview-card profit">
          <div class="overview-icon">
            <mdi-icon :path="mdiCashMultiple" size="32" />
          </div>
          <div class="overview-content">
            <div class="overview-value">M{{ formatCurrency(financialStats.netProfit) }}</div>
            <div class="overview-label">Net Profit</div>
            <div class="overview-change positive">+{{ financialStats.profitMargin }}% margin</div>
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
          <p>Manage system users and permissions</p>
          <div class="action-footer">
            <span class="action-count">147 users</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Financial Reports -->
        <div class="action-card" @click="navigateTo('/reports')">
          <div class="action-header">
            <mdi-icon :path="mdiChartLine" size="32" />
            <h3>Financial Reports</h3>
          </div>
          <p>Generate comprehensive financial reports</p>
          <div class="action-footer">
            <span class="action-count">Generate reports</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Price Management -->
        <div class="action-card" @click="navigateTo('/price-management')">
          <div class="action-header">
            <mdi-icon :path="mdiCurrencyUsd" size="32" />
            <h3>Price List Management</h3>
          </div>
          <p>Manage service prices and billing rates</p>
          <div class="action-footer">
            <span class="action-count">Update prices</span>
            <mdi-icon :path="mdiChevronRight" size="20" />
          </div>
        </div>

        <!-- Budget Planning -->
        <div class="action-card" @click="navigateTo('/budget-planning')">
          <div class="action-header">
            <mdi-icon :path="mdiCalculator" size="32" />
            <h3>Budget Planning</h3>
          </div>
          <p>Plan and monitor departmental budgets</p>
          <div class="action-footer">
            <span class="action-count">Plan budget</span>
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

      <!-- Financial Summary Charts -->
      <div class="charts-section">
        <div class="charts-grid">
          <!-- Revenue Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>Monthly Revenue Trend</h3>
              <div class="chart-period">Last 6 months</div>
            </div>
            <div class="chart-placeholder">
              <mdi-icon :path="mdiChartLine" size="48" />
              <p>Revenue chart visualization</p>
            </div>
          </div>

          <!-- Department Performance -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>Department Performance</h3>
              <div class="chart-period">Current month</div>
            </div>
            <div class="department-stats">
              <div v-for="dept in departmentStats" :key="dept.name" class="dept-stat">
                <div class="dept-info">
                  <span class="dept-name">{{ dept.name }}</span>
                  <span class="dept-revenue">M{{ formatCurrency(dept.revenue) }}</span>
                </div>
                <div class="dept-bar">
                  <div class="dept-progress" :style="{ width: dept.percentage + '%' }"></div>
                </div>
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
  mdiChartLine,
  mdiMagnify,
  mdiCurrencyUsd,
  mdiCalculator,
  mdiTrendingUp,
  mdiTrendingDown,
  mdiCashMultiple,
  mdiChevronRight
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const searchQuery = ref('')
const searchResults = ref([])
const currentDate = ref('')
const currentTime = ref('')

const financialStats = ref({
  totalRevenue: 125000.00,
  totalExpenses: 85000.00,
  netProfit: 40000.00,
  revenueGrowth: 12.5,
  expenseGrowth: 8.2,
  profitMargin: 32.0
})

const departmentStats = ref([
  { name: 'Clinical', revenue: 45000.00, percentage: 85 },
  { name: 'Laboratory', revenue: 25000.00, percentage: 70 },
  { name: 'Radiology', revenue: 20000.00, percentage: 60 },
  { name: 'Pharmacy', revenue: 18000.00, percentage: 55 },
  { name: 'Rehabilitation', revenue: 12000.00, percentage: 40 },
  { name: 'Emergency', revenue: 5000.00, percentage: 25 }
])

let timeInterval = null

// User display name
const userDisplayName = computed(() => {
  const userDoc = authStore.userDocument
  if (userDoc?.name && userDoc?.surname) {
    return `${userDoc.name} ${userDoc.surname}`
  }
  return authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'Accountant'
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

/* Financial Overview */
.financial-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.overview-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.overview-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.overview-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-card.revenue .overview-icon {
  background: linear-gradient(135deg, var(--accent-success), #059669);
  color: white;
}

.overview-card.expenses .overview-icon {
  background: linear-gradient(135deg, var(--accent-error), #dc2626);
  color: white;
}

.overview-card.profit .overview-icon {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
}

.overview-content {
  flex: 1;
}

.overview-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 8px;
}

.overview-label {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 4px;
}

.overview-change {
  font-size: 14px;
  font-weight: 500;
}

.overview-change.positive {
  color: var(--accent-success);
}

.overview-change.negative {
  color: var(--accent-error);
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

/* Charts Section */
.charts-section {
  width: 100%;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-period {
  font-size: 14px;
  color: var(--text-muted);
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  text-align: center;
}

.chart-placeholder p {
  margin: 8px 0 0 0;
  font-size: 14px;
}

.department-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dept-stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dept-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dept-name {
  font-weight: 500;
  color: var(--text-primary);
}

.dept-revenue {
  font-weight: 600;
  color: var(--accent-primary);
}

.dept-bar {
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.dept-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 4px;
  transition: width 0.3s ease;
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

  .financial-overview {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .charts-grid {
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

  .overview-card {
    padding: 24px;
  }

  .overview-value {
    font-size: 24px;
  }

  .action-card {
    padding: 20px;
  }
}
</style>