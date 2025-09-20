<template>
  <div class="patient-profile">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">Home</router-link>
          <mdi-icon :path="mdiChevronRight" size="16" />
          <span class="breadcrumb-current">Patient Profile</span>
        </div>
        <h1 class="page-title">PATIENT PROFILE</h1>
      </div>
      
      <div class="header-actions">
        <m3-button variant="outlined" @click="printProfile">
          <mdi-icon :path="mdiPrinter" size="20" />
          Print Profile
        </m3-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading patient information...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <mdi-icon :path="mdiAlertCircle" size="48" color="#DC2626" />
      <h2>Error Loading Patient</h2>
      <p>{{ error }}</p>
      <m3-button variant="filled" @click="loadPatient">
        Try Again
      </m3-button>
    </div>

    <!-- Patient Profile Content -->
    <div v-else-if="patient" class="profile-content">
      <!-- Patient Demographics Card -->
      <div class="demographics-card">
        <div class="card-header">
          <h2>Patient Demographics</h2>
          <div class="patient-id">{{ patient.hospitalNumber }}</div>
        </div>
        
        <div class="demographics-grid">
          <div class="demo-item">
            <label>Full Name</label>
            <span>{{ patient.name }} {{ patient.surname }}</span>
          </div>
          <div class="demo-item">
            <label>ID Number</label>
            <span>{{ patient.idNumber }}</span>
          </div>
          <div class="demo-item">
            <label>Phone Number</label>
            <span>{{ patient.phone }}</span>
          </div>
          <div class="demo-item">
            <label>Date of Birth</label>
            <span>{{ formatDate(patient.dob) }}</span>
          </div>
          <div class="demo-item">
            <label>Age</label>
            <span>{{ patient.age }} years</span>
          </div>
          <div class="demo-item">
            <label>Gender</label>
            <span>{{ patient.gender }}</span>
          </div>
          <div class="demo-item">
            <label>Country of Birth</label>
            <span>{{ patient.countryOfBirth }}</span>
          </div>
          <div class="demo-item">
            <label>Marital Status</label>
            <span>{{ patient.maritalStatus || 'Not specified' }}</span>
          </div>
          <div class="demo-item full-width">
            <label>Address</label>
            <span>{{ patient.address }}</span>
          </div>
        </div>

        <!-- Next of Kin Section -->
        <div class="nok-section">
          <h3>Next of Kin Information</h3>
          <div class="demographics-grid">
            <div class="demo-item">
              <label>N.O.K Name</label>
              <span>{{ patient.nokName }} {{ patient.nokSurname }}</span>
            </div>
            <div class="demo-item">
              <label>N.O.K Phone</label>
              <span>{{ patient.nokPhone }}</span>
            </div>
            <div class="demo-item full-width">
              <label>N.O.K Address</label>
              <span>{{ patient.nokAddress }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Medical Modules Grid -->
      <div class="modules-grid">
        <!-- Billing Module -->
        <div v-if="hasPermission('billing:view')" class="module-card billing">
          <div class="module-header">
            <mdi-icon :path="mdiCashMultiple" size="32" />
            <h3>BILLING AND INVOICES</h3>
          </div>
          <div class="module-actions">
            <m3-button 
              variant="filled" 
              size="small" 
              @click="navigateTo(`/patient/${patient.id}/billing`)"
            >
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('billing:edit')"
              variant="outlined" 
              size="small"
              @click="navigateTo(`/patient/${patient.id}/billing?mode=edit`)"
            >
              EDIT
            </m3-button>
            <m3-button 
              v-if="hasPermission('billing:create')"
              variant="outlined" 
              size="small"
              @click="navigateTo(`/patient/${patient.id}/billing?mode=new`)"
            >
              SAVE
            </m3-button>
          </div>
        </div>

        <!-- Doctor's Notes Module -->
        <div v-if="hasPermission('doctors_notes:view')" class="module-card doctors-notes">
          <div class="module-header">
            <mdi-icon :path="mdiDoctor" size="32" />
            <h3>DOCTORS NOTES</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewDoctorNotes">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('doctors_notes:edit')"
              variant="outlined" 
              size="small"
              @click="editDoctorNotes"
            >
              EDIT
            </m3-button>
            <m3-button 
              v-if="hasPermission('doctors_notes:create')"
              variant="outlined" 
              size="small"
              @click="addDoctorNote"
            >
              ADD
            </m3-button>
          </div>
        </div>

        <!-- Nurse's Notes Module -->
        <div v-if="hasPermission('nurses_notes:view')" class="module-card nurses-notes">
          <div class="module-header">
            <mdi-icon :path="mdiStethoscope" size="32" />
            <h3>NURSES NOTES</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewNurseNotes">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('nurses_notes:edit')"
              variant="outlined" 
              size="small"
              @click="editNurseNotes"
            >
              EDIT
            </m3-button>
            <m3-button 
              v-if="hasPermission('nurses_notes:create')"
              variant="outlined" 
              size="small"
              @click="addNurseNote"
            >
              ADD
            </m3-button>
          </div>
        </div>

        <!-- Vitals Module -->
        <div v-if="hasPermission('vitals:view')" class="module-card vitals">
          <div class="module-header">
            <mdi-icon :path="mdiHeart" size="32" />
            <h3>VITALS</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewVitals">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('vitals:create')"
              variant="outlined" 
              size="small"
              @click="addVitals"
            >
              ADD
            </m3-button>
          </div>
        </div>

        <!-- Prescriptions Module -->
        <div v-if="hasPermission('prescriptions:view')" class="module-card prescriptions">
          <div class="module-header">
            <mdi-icon :path="mdiPill" size="32" />
            <h3>PRESCRIPTIONS</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewPrescriptions">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('prescriptions:edit')"
              variant="outlined" 
              size="small"
              @click="editPrescriptions"
            >
              EDIT
            </m3-button>
            <m3-button 
              v-if="hasPermission('prescriptions:create')"
              variant="outlined" 
              size="small"
              @click="addPrescription"
            >
              ADD
            </m3-button>
            <m3-button 
              v-if="hasPermission('prescriptions:dispense')"
              variant="outlined" 
              size="small"
              @click="dispenseMedication"
            >
              DISPENSE
            </m3-button>
          </div>
        </div>

        <!-- Laboratory Module -->
        <div v-if="hasPermission('lab_requests:view')" class="module-card laboratory">
          <div class="module-header">
            <mdi-icon :path="mdiTestTube" size="32" />
            <h3>LABORATORY</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewLabResults">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('lab_requests:create')"
              variant="outlined" 
              size="small"
              @click="requestLabTest"
            >
              REQUEST
            </m3-button>
            <m3-button 
              v-if="hasPermission('lab_results:create')"
              variant="outlined" 
              size="small"
              @click="enterLabResults"
            >
              ENTER RESULTS
            </m3-button>
          </div>
        </div>

        <!-- Radiology Module -->
        <div v-if="hasPermission('radiology_requests:view')" class="module-card radiology">
          <div class="module-header">
            <mdi-icon :path="mdiRadioactive" size="32" />
            <h3>RADIOLOGY</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewRadiologyResults">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('radiology_requests:create')"
              variant="outlined" 
              size="small"
              @click="requestXray"
            >
              REQUEST
            </m3-button>
            <m3-button 
              v-if="hasPermission('radiology_results:create')"
              variant="outlined" 
              size="small"
              @click="enterRadiologyResults"
            >
              ENTER RESULTS
            </m3-button>
          </div>
        </div>

        <!-- Operations/Surgeries Module -->
        <div v-if="hasPermission('operations:view')" class="module-card operations">
          <div class="module-header">
            <mdi-icon :path="mdiScalpelLine" size="32" />
            <h3>OPERATIONS/SURGERIES</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewOperations">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('operations:create')"
              variant="outlined" 
              size="small"
              @click="addOperation"
            >
              ADD
            </m3-button>
          </div>
        </div>

        <!-- Rehabilitation Module -->
        <div v-if="hasPermission('rehabilitation_notes:view')" class="module-card rehabilitation">
          <div class="module-header">
            <mdi-icon :path="mdiRun" size="32" />
            <h3>REHABILITATION NOTES</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewRehabNotes">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('rehabilitation_notes:edit')"
              variant="outlined" 
              size="small"
              @click="editRehabNotes"
            >
              EDIT
            </m3-button>
            <m3-button 
              v-if="hasPermission('rehabilitation_notes:create')"
              variant="outlined" 
              size="small"
              @click="addRehabNote"
            >
              ADD
            </m3-button>
          </div>
        </div>

        <!-- Admission/Discharge Module -->
        <div v-if="hasPermission('admission_discharge:view')" class="module-card admission">
          <div class="module-header">
            <mdi-icon :path="mdiHospitalBuilding" size="32" />
            <h3>ADMISSION AND DISCHARGE SUMMARIES</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewAdmissionDischarge">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('admission_discharge:create')"
              variant="outlined" 
              size="small"
              @click="addAdmissionDischarge"
            >
              ADD
            </m3-button>
            <m3-button 
              v-if="hasPermission('admission_discharge:approve')"
              variant="outlined" 
              size="small"
              @click="approveDischarge"
            >
              APPROVE
            </m3-button>
          </div>
        </div>

        <!-- Consent Forms Module -->
        <div v-if="hasPermission('consent_forms:view')" class="module-card consent">
          <div class="module-header">
            <mdi-icon :path="mdiFileDocument" size="32" />
            <h3>CONSENT FORMS</h3>
          </div>
          <div class="module-actions">
            <m3-button variant="filled" size="small" @click="viewConsentForms">
              VIEW
            </m3-button>
            <m3-button 
              v-if="hasPermission('consent_forms:create')"
              variant="outlined" 
              size="small"
              @click="addConsentForm"
            >
              ADD
            </m3-button>
          </div>
        </div>
      </div>

      <!-- Patient History Button -->
      <div class="patient-history-section">
        <m3-button 
          variant="filled" 
          size="large" 
          :icon="mdiHistory"
          @click="viewPatientHistory"
          class="history-button"
        >
          PATIENT HISTORY
        </m3-button>
      </div>

      <!-- Print Notice -->
      <div class="print-notice">
        <p>ALL SECTIONS CAN BE PRINTED SEPARATELY</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import M3Button from '@/components/common/M3Button.vue'
import {
  mdiChevronRight,
  mdiPrinter,
  mdiAlertCircle,
  mdiCashMultiple,
  mdiDoctor,
  mdiStethoscope,
  mdiHeart,
  mdiPill,
  mdiTestTube,
  mdiRadioactive,
  mdiScalpelLine,
  mdiRun,
  mdiHospitalBuilding,
  mdiFileDocument,
  mdiHistory
} from '@mdi/js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const patientStore = usePatientStore()

const loading = ref(true)
const error = ref('')
const patient = ref(null)

const patientId = computed(() => route.params.id)

// Load patient data
const loadPatient = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const patientData = await patientStore.getPatient(patientId.value)
    patient.value = patientData
  } catch (err) {
    error.value = err.message || 'Failed to load patient information'
    console.error('Error loading patient:', err)
  } finally {
    loading.value = false
  }
}

// Permission check
const hasPermission = (permission) => {
  return authStore.hasPermission(permission)
}

// Navigation helper
const navigateTo = (path) => {
  router.push(path)
}

// Format date helper
const formatDate = (date) => {
  if (!date) return 'Not specified'
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Module action handlers
const viewDoctorNotes = () => {
  console.log('View doctor notes')
  // Implement modal or navigation to doctor notes
}

const editDoctorNotes = () => {
  console.log('Edit doctor notes')
  // Implement edit functionality
}

const addDoctorNote = () => {
  console.log('Add doctor note')
  // Implement add functionality
}

const viewNurseNotes = () => {
  console.log('View nurse notes')
}

const editNurseNotes = () => {
  console.log('Edit nurse notes')
}

const addNurseNote = () => {
  console.log('Add nurse note')
}

const viewVitals = () => {
  console.log('View vitals')
}

const addVitals = () => {
  console.log('Add vitals')
}

const viewPrescriptions = () => {
  console.log('View prescriptions')
}

const editPrescriptions = () => {
  console.log('Edit prescriptions')
}

const addPrescription = () => {
  console.log('Add prescription')
}

const dispenseMedication = () => {
  console.log('Dispense medication')
}

const viewLabResults = () => {
  console.log('View lab results')
}

const requestLabTest = () => {
  console.log('Request lab test')
}

const enterLabResults = () => {
  console.log('Enter lab results')
}

const viewRadiologyResults = () => {
  console.log('View radiology results')
}

const requestXray = () => {
  console.log('Request X-ray')
}

const enterRadiologyResults = () => {
  console.log('Enter radiology results')
}

const viewOperations = () => {
  console.log('View operations')
}

const addOperation = () => {
  console.log('Add operation')
}

const viewRehabNotes = () => {
  console.log('View rehab notes')
}

const editRehabNotes = () => {
  console.log('Edit rehab notes')
}

const addRehabNote = () => {
  console.log('Add rehab note')
}

const viewAdmissionDischarge = () => {
  console.log('View admission/discharge')
}

const addAdmissionDischarge = () => {
  console.log('Add admission/discharge')
}

const approveDischarge = () => {
  console.log('Approve discharge')
}

const viewConsentForms = () => {
  console.log('View consent forms')
}

const addConsentForm = () => {
  console.log('Add consent form')
}

const viewPatientHistory = () => {
  console.log('View patient history')
}

const printProfile = () => {
  window.print()
}

onMounted(() => {
  loadPatient()
})
</script>

<style scoped>
.patient-profile {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container h2 {
  color: var(--accent-error);
  margin: 16px 0 8px 0;
}

.error-container button {
  padding: 12px 24px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.error-container button:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.profile-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions button {
  padding: 12px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions button:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.demographics-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-primary);
}

.card-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.patient-id {
  background: var(--accent-primary);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.demographics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.demo-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.demo-item.full-width {
  grid-column: 1 / -1;
}

.demo-item label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.demo-item span {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.nok-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-primary);
}

.nok-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.module-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.module-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.module-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.module-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.module-actions button {
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

.module-actions button:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

/* Module-specific colors */
.module-card.billing .module-header {
  color: var(--accent-success);
}

.module-card.doctors-notes .module-header {
  color: var(--accent-primary);
}

.module-card.nurses-notes .module-header {
  color: #8b5cf6;
}

.module-card.vitals .module-header {
  color: var(--accent-error);
}

.module-card.prescriptions .module-header {
  color: var(--accent-warning);
}

.module-card.laboratory .module-header {
  color: #3b82f6;
}

.module-card.radiology .module-header {
  color: #8b5cf6;
}

.module-card.operations .module-header {
  color: var(--accent-error);
}

.module-card.rehabilitation .module-header {
  color: var(--accent-success);
}

.module-card.admission .module-header {
  color: #6366f1;
}

.module-card.consent .module-header {
  color: #84cc16;
}

.patient-history-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.history-button {
  padding: 16px 32px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  min-width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.history-button:hover {
  background: var(--accent-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.print-notice {
  text-align: center;
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.print-notice p {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-content {
    padding: 16px;
  }

  .demographics-card {
    padding: 24px 16px;
  }

  .demographics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modules-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .module-card {
    padding: 20px 16px;
  }

  .module-actions {
    flex-direction: column;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .history-button {
    min-width: 100%;
  }
}
</style>
