<template>
  <div class="reports-page">
    <!-- Reports Content -->
    <div class="reports-content">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Financial Reports</h1>
        <p class="page-subtitle">Generate and download comprehensive financial reports</p>
      </div>

      <!-- Date Range Selector -->
      <div class="date-range-section">
        <div class="date-range-card">
          <h3>Report Period</h3>
          <div class="date-inputs">
            <div class="date-group">
              <label>From</label>
              <input 
                v-model="dateFrom" 
                type="date" 
                class="date-input"
              />
            </div>
            <div class="date-group">
              <label>To</label>
              <input 
                v-model="dateTo" 
                type="date" 
                class="date-input"
              />
            </div>
            <button 
              class="generate-btn"
              @click="generateReports"
              :disabled="loading"
            >
              <span v-if="loading">Generating...</span>
              <span v-else>Generate Reports</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Report Categories -->
      <div class="report-categories">
        <!-- Total Sales -->
        <div class="report-card total-sales">
          <div class="report-header">
            <mdi-icon :path="mdiCashMultiple" size="48" />
            <div class="report-info">
              <h3>TOTAL SALES</h3>
              <div class="report-value">M{{ formatCurrency(reportData.totalSales) }}</div>
            </div>
          </div>
          <div class="report-actions">
            <m3-button variant="outlined" size="small" @click="viewTotalSales">
              View Details
            </m3-button>
            <m3-button variant="outlined" size="small" @click="downloadFinancialPDF">
              Download PDF
            </m3-button>
          </div>
        </div>

        <!-- Total Cash Sales -->
        <div class="report-card cash-sales">
          <div class="report-header">
            <mdi-icon :path="mdiCash" size="48" />
            <div class="report-info">
              <h3>TOTAL CASH SALES</h3>
              <div class="report-value">M{{ formatCurrency(reportData.cashSales) }}</div>
            </div>
          </div>
          <div class="report-actions">
            <m3-button variant="outlined" size="small" @click="viewCashSales">
              View Details
            </m3-button>
            <m3-button variant="outlined" size="small" @click="downloadFinancialPDF">
              Download PDF
            </m3-button>
          </div>
        </div>

        <!-- Total EFT Sales -->
        <div class="report-card eft-sales">
          <div class="report-header">
            <mdi-icon :path="mdiCreditCard" size="48" />
            <div class="report-info">
              <h3>TOTAL EFT SALES</h3>
              <div class="report-value">M{{ formatCurrency(reportData.eftSales) }}</div>
            </div>
          </div>
          <div class="report-actions">
            <m3-button variant="outlined" size="small" @click="viewEftSales">
              View Details
            </m3-button>
            <m3-button variant="outlined" size="small" @click="downloadFinancialPDF">
              Download PDF
            </m3-button>
          </div>
        </div>

        <!-- Total Unpaid Sales -->
        <div class="report-card unpaid-sales">
          <div class="report-header">
            <mdi-icon :path="mdiClockAlert" size="48" />
            <div class="report-info">
              <h3>TOTAL UNPAID SALES</h3>
              <div class="report-value">M{{ formatCurrency(reportData.unpaidSales) }}</div>
            </div>
          </div>
          <div class="report-actions">
            <m3-button variant="outlined" size="small" @click="viewUnpaidSales">
              View Details
            </m3-button>
            <m3-button variant="outlined" size="small" @click="downloadFinancialPDF">
              Download PDF
            </m3-button>
          </div>
        </div>
      </div>

      <!-- Report Lists -->
      <div class="report-lists">
        <!-- List of Unpaid Patients -->
        <div class="list-card unpaid-patients">
          <div class="list-header">
            <h3>LIST OF UNPAID PATIENTS</h3>
            <div class="list-count">{{ unpaidPatients.length }} patients</div>
          </div>
          
          <div class="list-content">
            <div v-if="unpaidPatients.length === 0" class="empty-state">
              No unpaid patients found for the selected period
            </div>
            <div v-else class="patient-list">
              <div 
                v-for="patient in unpaidPatients" 
                :key="patient.id"
                class="patient-item"
                @click="viewPatientBilling(patient.id)"
              >
                <div class="patient-info">
                  <div class="patient-name">{{ patient.name }} {{ patient.surname }}</div>
                  <div class="patient-details">{{ patient.hospitalNumber }} • {{ patient.phone }}</div>
                </div>
                <div class="patient-balance">
                  <div class="balance-amount">M{{ formatCurrency(patient.balance) }}</div>
                  <div class="balance-date">{{ formatDate(patient.lastInvoiceDate) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="list-actions">
            <m3-button variant="outlined" @click="downloadUnpaidPatientsPDF">
              Download PDF
            </m3-button>
            <m3-button variant="filled" @click="exportUnpaidPatients">
              Export CSV
            </m3-button>
          </div>
        </div>

        <!-- Top 20 Selling Items -->
        <div class="list-card top-items">
          <div class="list-header">
            <h3>TOP 20 SELLING ITEMS</h3>
            <div class="list-count">{{ topSellingItems.length }} items</div>
          </div>
          
          <div class="list-content">
            <div v-if="topSellingItems.length === 0" class="empty-state">
              No sales data found for the selected period
            </div>
            <div v-else class="items-list">
              <div 
                v-for="(item, index) in topSellingItems" 
                :key="item.id"
                class="item-row"
              >
                <div class="item-rank">{{ index + 1 }}</div>
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-details">{{ item.quantitySold }} units sold</div>
                </div>
                <div class="item-revenue">
                  <div class="revenue-amount">M{{ formatCurrency(item.totalRevenue) }}</div>
                  <div class="unit-price">M{{ formatCurrency(item.unitPrice) }} each</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="list-actions">
            <m3-button variant="outlined" @click="downloadTopItemsPDF">
              Download PDF
            </m3-button>
            <m3-button variant="filled" @click="exportTopItems">
              Export CSV
            </m3-button>
          </div>
          <m3-button 
            variant="outlined" 
            @click="downloadFinancialPDF"
            :disabled="loading"
          >
            <mdi-icon :path="mdiDownload" size="16" />
            Download PDF
          </m3-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import apiService from '@/services/api'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiCashMultiple,
  mdiCash,
  mdiCreditCard,
  mdiClockAlert,
  mdiDownload
} from '@mdi/js'
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore'
import { db } from '@/services/firebase'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const dateFrom = ref('')
const dateTo = ref('')

const reportData = ref({
  totalSales: 0,
  cashSales: 0,
  eftSales: 0,
  unpaidSales: 0
})

const unpaidPatients = ref([])
const topSellingItems = ref([])

// Initialize date range (last 30 days)
const initializeDateRange = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  dateTo.value = today.toISOString().split('T')[0]
  dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0]
}

// Generate reports
const generateReports = async () => {
  try {
    loading.value = true
    
    const fromDate = new Date(dateFrom.value)
    const toDate = new Date(dateTo.value)
    toDate.setHours(23, 59, 59, 999) // End of day
    
    // Query all invoices in date range
    const invoicesQuery = collectionGroup(db, 'invoices')
    const invoicesSnapshot = await getDocs(invoicesQuery)
    
    let totalSales = 0
    let cashSales = 0
    let eftSales = 0
    let unpaidSales = 0
    const unpaidList = []
    const itemsSold = {}
    
    for (const doc of invoicesSnapshot.docs) {
      const invoice = doc.data()
      const invoiceDate = invoice.creationDate?.toDate()
      
      if (invoiceDate && invoiceDate >= fromDate && invoiceDate <= toDate) {
        totalSales += invoice.totalAmount || 0
        
        if (invoice.status === 'paid') {
          if (invoice.paymentMethod === 'cash') {
            cashSales += invoice.amountPaid || 0
          } else if (invoice.paymentMethod === 'eft') {
            eftSales += invoice.amountPaid || 0
          }
        } else {
          unpaidSales += invoice.balance || 0
          
          // Get patient info for unpaid list
          const patientId = doc.ref.parent.parent.id
          try {
            const patientDoc = await getDocs(query(collection(db, 'patients'), where('__name__', '==', patientId)))
            if (!patientDoc.empty) {
              const patient = patientDoc.docs[0].data()
              unpaidList.push({
                id: patientId,
                name: patient.name,
                surname: patient.surname,
                hospitalNumber: patient.hospitalNumber,
                phone: patient.phone,
                balance: invoice.balance || 0,
                lastInvoiceDate: invoiceDate
              })
            }
          } catch (error) {
            console.error('Error fetching patient:', error)
          }
        }
        
        // Get invoice items for top selling items
        try {
          const itemsQuery = collection(db, doc.ref.path + '/items')
          const itemsSnapshot = await getDocs(itemsQuery)
          
          itemsSnapshot.forEach(itemDoc => {
            const item = itemDoc.data()
            const itemId = item.id || item.description
            
            if (!itemsSold[itemId]) {
              itemsSold[itemId] = {
                id: itemId,
                name: item.description,
                quantitySold: 0,
                totalRevenue: 0,
                unitPrice: item.unitPrice || 0
              }
            }
            
            itemsSold[itemId].quantitySold += item.quantity || 0
            itemsSold[itemId].totalRevenue += item.totalPrice || 0
          })
        } catch (error) {
          console.error('Error fetching invoice items:', error)
        }
      }
    }
    
    // Update report data
    reportData.value = {
      totalSales,
      cashSales,
      eftSales,
      unpaidSales
    }
    
    // Sort and limit unpaid patients
    unpaidPatients.value = unpaidList
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 50) // Limit to top 50
    
    // Sort and limit top selling items
    topSellingItems.value = Object.values(itemsSold)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 20)
    
  } catch (error) {
    console.error('Error generating reports:', error)
    alert('Error generating reports. Please try again.')
  } finally {
    loading.value = false
  }
}

// View handlers
const viewTotalSales = () => {
  console.log('View total sales details')
}

const viewCashSales = () => {
  console.log('View cash sales details')
}

const viewEftSales = () => {
  console.log('View EFT sales details')
}

const viewUnpaidSales = () => {
  console.log('View unpaid sales details')
}

// PDF Download handlers
const downloadFinancialPDF = async () => {
  try {
    loading.value = true
    await apiService.generateReportPDF('financial_summary', dateFrom.value, dateTo.value, authStore.user.uid)
  } catch (error) {
    console.error('Error downloading financial PDF:', error)
    alert('Error generating PDF report. Please try again.')
  } finally {
    loading.value = false
  }
}

const downloadUnpaidPatientsPDF = async () => {
  try {
    loading.value = true
    await apiService.generateReportPDF('unpaid_patients', dateFrom.value, dateTo.value, authStore.user.uid)
  } catch (error) {
    console.error('Error downloading unpaid patients PDF:', error)
    alert('Error generating PDF report. Please try again.')
  } finally {
    loading.value = false
  }
}

const downloadTopItemsPDF = async () => {
  try {
    loading.value = true
    await apiService.generateReportPDF('top_selling_items', dateFrom.value, dateTo.value, authStore.user.uid)
  } catch (error) {
    console.error('Error downloading top items PDF:', error)
    alert('Error generating PDF report. Please try again.')
  } finally {
    loading.value = false
  }
}

const viewPatientBilling = (patientId) => {
  router.push(`/patient/${patientId}/billing`)
}

// Export handlers
const exportUnpaidPatients = () => {
  console.log('Export unpaid patients to CSV')
  // Implement CSV export
}

const exportTopItems = () => {
  console.log('Export top items to CSV')
  // Implement CSV export
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

// Format date
const formatDate = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  initializeDateRange()
  generateReports()
})
</script>

<style scoped>
.reports-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.reports-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 16px;
}

.date-range-section {
  display: flex;
  justify-content: center;
}

.date-range-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  min-width: 500px;
}

.date-range-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  text-align: center;
}

.date-inputs {
  display: flex;
  gap: 20px;
  align-items: end;
  justify-content: center;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-group label {
  font-size: 14px;
  font-weight: 600;
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

.generate-btn {
  padding: 12px 24px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-btn:hover:not(:disabled) {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.report-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.report-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.report-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.report-info h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.report-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
}

.report-actions {
  display: flex;
  gap: 8px;
}

.report-actions button {
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
}

.report-actions button:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

/* Report card specific colors */
.report-card.total-sales .report-header {
  color: var(--accent-primary);
}

.report-card.cash-sales .report-header {
  color: var(--accent-success);
}

.report-card.eft-sales .report-header {
  color: #8b5cf6;
}

.report-card.unpaid-sales .report-header {
  color: var(--accent-error);
}

.report-lists {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.list-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.list-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.list-count {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.list-content {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 24px;
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
}

.patient-list,
.items-list {
  padding: 16px 0;
}

.patient-item,
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.patient-item:hover,
.item-row:hover {
  background: var(--bg-hover);
}

.patient-item:last-child,
.item-row:last-child {
  border-bottom: none;
}

.patient-info,
.item-info {
  flex: 1;
}

.patient-name,
.item-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.patient-details,
.item-details {
  font-size: 12px;
  color: var(--text-secondary);
}

.patient-balance,
.item-revenue {
  text-align: right;
}

.balance-amount,
.revenue-amount {
  font-weight: 600;
  color: var(--accent-error);
  margin-bottom: 4px;
}

.balance-date,
.unit-price {
  font-size: 12px;
  color: var(--text-secondary);
}

.item-rank {
  width: 32px;
  height: 32px;
  background: var(--accent-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin-right: 16px;
}

.list-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--border-primary);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.list-actions button {
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.list-actions button:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .reports-content {
    padding: 16px;
  }

  .date-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .date-range-card {
    min-width: auto;
    width: 100%;
  }

  .report-categories {
    grid-template-columns: 1fr;
  }

  .report-lists {
    grid-template-columns: 1fr;
  }

  .patient-item,
  .item-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .patient-balance,
  .item-revenue {
    text-align: left;
    width: 100%;
  }
}
</style>