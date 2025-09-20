<template>
  <div class="user-management">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">Home</router-link>
          <MdiIcon :path="mdiChevronRight" size="16" />
          <span class="breadcrumb-current">User Management</span>
        </div>
        <h1 class="page-title">USER MANAGEMENT</h1>
        <p class="page-subtitle">Manage system users and departments</p>
      </div>
      
      <div class="header-actions">
        <button class="action-btn primary" @click="showAddDepartmentModal = true">
          <MdiIcon :path="mdiPlus" size="20" />
          Add Department
        </button>
        <button class="action-btn" @click="refreshData">
          <MdiIcon :path="mdiRefresh" size="20" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading departments and users...</p>
    </div>

    <!-- Departments Grid -->
    <div v-else class="departments-content">
      <div class="departments-grid">
        <div 
          v-for="department in departments" 
          :key="department.name"
          class="department-card"
          @click="openDepartmentModal(department)"
        >
          <div class="department-header">
            <div class="department-icon">
              <MdiIcon :path="getDepartmentIcon(department.name)" size="32" />
            </div>
            <div class="department-info">
              <h3 class="department-name">{{ department.name }}</h3>
              <p class="department-description">{{ getDepartmentDescription(department.name) }}</p>
            </div>
          </div>
          
          <div class="department-stats">
            <div class="stat-item">
              <span class="stat-value">{{ department.userCount }}</span>
              <span class="stat-label">Users</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ department.activeUsers }}</span>
              <span class="stat-label">Active</span>
            </div>
          </div>
          
          <div class="department-footer">
            <span class="view-users">View Users</span>
            <MdiIcon :path="mdiChevronRight" size="20" />
          </div>
        </div>
      </div>
    </div>

    <!-- Department Users Modal -->
    <div v-if="showDepartmentModal" class="modal-overlay" @click="closeDepartmentModal">
      <div class="department-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="modal-icon">
              <MdiIcon :path="getDepartmentIcon(selectedDepartment?.name)" size="24" />
            </div>
            <div>
              <h3>{{ selectedDepartment?.name }} Department</h3>
              <p>{{ selectedDepartment?.userCount }} users in this department</p>
            </div>
          </div>
          <button @click="closeDepartmentModal" class="close-button">
            <MdiIcon :path="mdiClose" size="20" />
          </button>
        </div>
        
        <div class="modal-content">
          <div class="users-list">
            <div 
              v-for="user in departmentUsers" 
              :key="user.id"
              class="user-item"
            >
              <div class="user-avatar">
                <MdiIcon :path="mdiAccount" size="20" />
              </div>
              
              <div class="user-info">
                <div class="user-name">
                  {{ user.name && user.surname ? `${user.name} ${user.surname}` : user.fullName || user.email.split('@')[0] }}
                </div>
                <div class="user-details">
                  <span class="user-email">{{ user.email }}</span>
                  <span class="user-role">{{ user.role }}</span>
                  <span v-if="user.wardType" class="user-ward">{{ user.wardType }} Ward</span>
                </div>
                <div class="user-status">
                  <span class="status-badge" :class="{ active: user.isActive, inactive: !user.isActive }">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                  <span v-if="!user.profileCompleted" class="profile-status">Profile Incomplete</span>
                </div>
              </div>
              
              <div class="user-actions">
                <button class="edit-btn" @click="editUser(user)">
                  <MdiIcon :path="mdiPencil" size="16" />
                  Edit
                </button>
                <button 
                  class="toggle-btn" 
                  :class="{ active: user.isActive }"
                  @click="toggleUserStatus(user)"
                >
                  <MdiIcon :path="user.isActive ? mdiAccountOff : mdiAccountCheck" size="16" />
                  {{ user.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            </div>
            
            <div v-if="departmentUsers.length === 0" class="empty-state">
              <MdiIcon :path="mdiAccountGroup" size="48" />
              <p>No users found in this department</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="edit-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="modal-icon">
              <MdiIcon :path="mdiAccountEdit" size="24" />
            </div>
            <div>
              <h3>Edit User</h3>
              <p>{{ editingUser?.email }}</p>
            </div>
          </div>
          <button @click="closeEditModal" class="close-button">
            <MdiIcon :path="mdiClose" size="20" />
          </button>
        </div>
        
        <form @submit.prevent="updateUser" class="edit-form">
          <!-- form fields (unchanged) -->
          <!-- ... -->
        </form>
      </div>
    </div>

    <!-- Add Department Modal -->
    <div v-if="showAddDepartmentModal" class="modal-overlay" @click="closeAddDepartmentModal">
      <div class="add-department-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="modal-icon">
              <MdiIcon :path="mdiOfficeBuildingPlus" size="24" />
            </div>
            <div>
              <h3>Add New Department</h3>
              <p>Create a new department in the system</p>
            </div>
          </div>
          <button @click="closeAddDepartmentModal" class="close-button">
            <MdiIcon :path="mdiClose" size="20" />
          </button>
        </div>
        
        <form @submit.prevent="addDepartment" class="add-form">
          <!-- form fields (unchanged) -->
          <!-- ... -->
        </form>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="success-toast">
      <MdiIcon :path="mdiCheckCircle" size="20" />
      <span>{{ successMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import apiService from '@/services/api'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiChevronRight,
  mdiPlus,
  mdiRefresh,
  mdiAccount,
  mdiPencil,
  mdiAccountOff,
  mdiAccountCheck,
  mdiAccountGroup,
  mdiClose,
  mdiCheck,
  mdiLoading,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiAccountEdit,
  mdiOfficeBuildingPlus,
  mdiHospitalBuilding,
  mdiStethoscope,
  mdiCashMultiple,
  mdiTestTube,
  mdiPill,
  mdiRadioactive,
  mdiYoga,          // ✅ instead of mdiKarate
  mdiClipboardPulse,
  mdiHeart,
  mdiHumanPregnant,
  mdiKnife,        // ✅ instead of mdiScalpel
  mdiGenderFemale,
  mdiGenderMale,
  mdiAccountChild,
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const showDepartmentModal = ref(false)
const showEditModal = ref(false)
const showAddDepartmentModal = ref(false)
const showSuccessToast = ref(false)
const updating = ref(false)

const allUsers = ref([])
const selectedDepartment = ref(null)
const editingUser = ref(null)
const editError = ref('')
const successMessage = ref('')
const newDepartmentName = ref('')
const newDepartmentDescription = ref('')

const editForm = ref({
  name: '',
  surname: '',
  idNumber: '',
  phoneNumber: '',
  password: '',
  role: '',
  department: ''
})

// Computed departments with user counts
const departments = computed(() => {
  const deptMap = new Map()
  
  allUsers.value.forEach(user => {
    const deptName = user.department || 'Unassigned'
    if (!deptMap.has(deptName)) {
      deptMap.set(deptName, {
        name: deptName,
        users: [],
        userCount: 0,
        activeUsers: 0
      })
    }
    
    const dept = deptMap.get(deptName)
    dept.users.push(user)
    dept.userCount++
    if (user.isActive) {
      dept.activeUsers++
    }
  })
  
  return Array.from(deptMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const departmentUsers = computed(() => {
  if (!selectedDepartment.value) return []
  return selectedDepartment.value.users.sort((a, b) => {
    const nameA = a.name && a.surname ? `${a.name} ${a.surname}` : a.fullName || a.email
    const nameB = b.name && b.surname ? `${b.name} ${b.surname}` : b.fullName || b.email
    return nameA.localeCompare(nameB)
  })
})

const loadUsers = async () => {
  try {
    loading.value = true
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users = []
    
    usersSnapshot.forEach(snap => {
      users.push({ id: snap.id, ...snap.data() })
    })
    
    allUsers.value = users
  } catch (error) {
    console.error('Error loading users:', error)
    editError.value = 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const getDepartmentIcon = (departmentName) => {
  const iconMap = {
    'Administration': mdiHospitalBuilding,
    'Clinical': mdiStethoscope,
    'Accounting': mdiCashMultiple,
    'Laboratory': mdiTestTube,
    'Pharmacy': mdiPill,
    'Radiology': mdiRadioactive,
    'Rehabilitation': mdiYoga,
    'OPD': mdiClipboardPulse,
    'FCH Ward': mdiHeart,
    'Maternity': mdiHumanPregnant,
    'Theatre Ward': mdiKnife,
    'Female Ward': mdiGenderFemale,
    'Male Ward': mdiGenderMale,
    'Children Ward': mdiAccountChild
  }
  return iconMap[departmentName] || mdiAccountGroup
}

const getDepartmentDescription = (departmentName) => {
  const descriptions = {
    'Administration': 'System administration and management',
    'Clinical': 'Medical staff and patient care',
    'Accounting': 'Financial management and billing',
    'Laboratory': 'Medical testing and analysis',
    'Pharmacy': 'Medication management and dispensing',
    'Radiology': 'Medical imaging and diagnostics',
    'Rehabilitation': 'Physical therapy and recovery',
    'OPD': 'Outpatient department services',
    'FCH Ward': 'Family and child health ward',
    'Maternity': 'Maternity and obstetric care',
    'Theatre Ward': 'Surgical operations and procedures',
    'Female Ward': 'Female patient care',
    'Male Ward': 'Male patient care',
    'Children Ward': 'Pediatric patient care'
  }
  return descriptions[departmentName] || 'Department services'
}

const openDepartmentModal = (department) => {
  selectedDepartment.value = department
  showDepartmentModal.value = true
}

const closeDepartmentModal = () => {
  showDepartmentModal.value = false
  selectedDepartment.value = null
}

const editUser = (user) => {
  editingUser.value = user
  editForm.value = {
    name: user.name || '',
    surname: user.surname || '',
    idNumber: user.idNumber || '',
    phoneNumber: user.phoneNumber || '',
    password: '',
    role: user.role || '',
    department: user.department || ''
  }
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
  editError.value = ''
}

const updateUser = async () => {
  try {
    updating.value = true
    editError.value = ''

    await apiService.updateUser(
      editingUser.value.id,
      {
        name: editForm.value.name.trim(),
        surname: editForm.value.surname.trim(),
        idNumber: editForm.value.idNumber.trim(),
        phoneNumber: editForm.value.phoneNumber.trim(),
        role: editForm.value.role,
        department: editForm.value.department
      },
      editForm.value.password.trim(),
      authStore.user.uid
    )

    const userIndex = allUsers.value.findIndex(u => u.id === editingUser.value.id)
    if (userIndex !== -1) {
      allUsers.value[userIndex] = { 
        ...allUsers.value[userIndex], 
        name: editForm.value.name.trim(),
        surname: editForm.value.surname.trim(),
        idNumber: editForm.value.idNumber.trim(),
        phoneNumber: editForm.value.phoneNumber.trim(),
        fullName: `${editForm.value.name.trim()} ${editForm.value.surname.trim()}`,
        role: editForm.value.role,
        department: editForm.value.department,
        profileCompleted: true
      }
    }

    showSuccessMessage('User updated successfully!')
    closeEditModal()

  } catch (error) {
    console.error('Error updating user:', error)
    editError.value = error.message || 'Failed to update user'
  } finally {
    updating.value = false
  }
}

const toggleUserStatus = async (user) => {
  try {
    const userRef = doc(db, 'users', user.id)
    const newStatus = !user.isActive
    
    await updateDoc(userRef, {
      isActive: newStatus,
      updatedAt: new Date()
    })

    user.isActive = newStatus
    
    showSuccessMessage(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`)
    
  } catch (error) {
    console.error('Error toggling user status:', error)
    editError.value = 'Failed to update user status'
  }
}

const addDepartment = () => {
  console.log('Adding department:', newDepartmentName.value)
  showSuccessMessage('Department functionality will be implemented in future updates')
  closeAddDepartmentModal()
}

const closeAddDepartmentModal = () => {
  showAddDepartmentModal.value = false
  newDepartmentName.value = ''
  newDepartmentDescription.value = ''
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccessToast.value = true
  setTimeout(() => {
    showSuccessToast.value = false
  }, 3000)
}

const refreshData = () => {
  loadUsers()
}

onMounted(() => {
  loadUsers()
})
</script>



<style scoped>
.user-management {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  border-bottom: 1px solid var(--border-primary);
}

.header-content {
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.breadcrumb-link {
  color: var(--accent-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--accent-secondary);
}

.breadcrumb-current {
  color: var(--text-muted);
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

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.action-btn.primary {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.action-btn.primary:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.loading-container {
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

.departments-content {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.department-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.department-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-primary);
}

.department-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.department-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.department-info {
  flex: 1;
}

.department-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.department-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.department-stats {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 500;
}

.department-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.view-users {
  font-size: 14px;
  color: var(--accent-primary);
  font-weight: 500;
}

/* Modal Styles */
.modal-overlay {
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
  z-index: 1000;
  padding: 20px;
}

.department-modal,
.edit-modal,
.add-department-modal {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.modal-title-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.modal-title-section p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.close-button {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-content {
  padding: 24px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.user-item:hover {
  background: var(--bg-hover);
}

.user-avatar {
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

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
}

.user-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.user-email {
  font-size: 14px;
  color: var(--text-secondary);
}

.user-role {
  font-size: 12px;
  color: var(--accent-primary);
  background: rgba(56, 189, 248, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.user-ward {
  font-size: 12px;
  color: var(--accent-warning);
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.user-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.2);
  color: var(--accent-success);
}

.status-badge.inactive {
  background: rgba(156, 163, 175, 0.2);
  color: var(--text-muted);
}

.profile-status {
  font-size: 10px;
  color: var(--accent-warning);
  font-weight: 500;
}

.user-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.edit-btn,
.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.edit-btn {
  background: rgba(56, 189, 248, 0.1);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.edit-btn:hover {
  background: rgba(56, 189, 248, 0.2);
}

.toggle-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--accent-error);
  color: var(--accent-error);
}

.toggle-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.toggle-btn.active {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--accent-success);
  color: var(--accent-success);
}

.toggle-btn.active:hover {
  background: rgba(16, 185, 129, 0.2);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}

.empty-state p {
  margin: 16px 0 0 0;
  font-size: 16px;
}

/* Edit Form */
.edit-form,
.add-form {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-input,
.form-select,
.form-textarea {
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-muted);
}

.form-hint {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--accent-error);
  border-radius: 8px;
  color: var(--accent-error);
  font-size: 14px;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
}

.cancel-btn,
.update-btn,
.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.update-btn,
.add-btn {
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  color: white;
}

.update-btn:hover:not(:disabled),
.add-btn:hover:not(:disabled) {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.update-btn:disabled,
.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Success Toast */
.success-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  background: var(--accent-success);
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 2000;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .departments-content {
    padding: 24px 16px;
  }

  .departments-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .user-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .user-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .page-header {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .departments-content {
    padding: 16px;
  }

  .department-card {
    padding: 20px;
  }

  .department-stats {
    justify-content: space-around;
  }

  .modal-header {
    padding: 20px 16px 16px 16px;
  }

  .modal-content,
  .edit-form,
  .add-form {
    padding: 20px 16px;
  }

  .user-actions {
    flex-direction: column;
    gap: 8px;
  }

  .edit-btn,
  .toggle-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
