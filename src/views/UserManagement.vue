<template>
  <div class="user-management">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb" aria-label="Breadcrumb">
          <router-link to="/" class="breadcrumb-link">Home</router-link>
          <MdiIcon :path="mdiChevronRight" size="16" />
          <span class="breadcrumb-current" aria-current="page">User Management</span>
        </div>
        <h1 class="page-title">USER MANAGEMENT</h1>
        <p class="page-subtitle">Manage system users and departments</p>
      </div>

      <div class="header-actions">
        <button
          class="action-btn primary"
          @click="showAddDepartmentModal = true"
          aria-label="Add Department"
        >
          <MdiIcon :path="mdiPlus" size="20" />
          Add Department
        </button>
        <button
          class="action-btn"
          @click="refreshData"
          :disabled="loading"
          aria-label="Refresh data"
        >
          <MdiIcon :path="mdiRefresh" size="20" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container" role="status" aria-live="polite">
      <div class="loading-spinner" aria-hidden="true"></div>
      <p>Loading departments and users...</p>
    </div>

    <!-- Departments Grid -->
    <div v-else class="departments-content">
      <div class="departments-grid">
        <div
          v-for="(department, idx) in departments"
          :key="department.name + '-' + idx"
          class="department-card"
          @click="openDepartmentModal(department)"
          role="button"
          tabindex="0"
          @keydown.enter.prevent="openDepartmentModal(department)"
          :aria-label="`Open ${department.name} department`"
        >
          <div class="department-header">
            <div class="department-icon" aria-hidden="true">
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
    <div v-if="showDepartmentModal" class="modal-overlay" @click="closeDepartmentModal" role="dialog" aria-modal="true">
      <div class="department-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="modal-icon" aria-hidden="true">
              <MdiIcon :path="getDepartmentIcon(selectedDepartment?.name)" size="24" />
            </div>
            <div>
              <h3>{{ selectedDepartment?.name }} Department</h3>
              <p>{{ selectedDepartment?.userCount }} users in this department</p>
            </div>
          </div>
          <button @click="closeDepartmentModal" class="close-button" aria-label="Close">
            <MdiIcon :path="mdiClose" size="20" />
          </button>
        </div>

        <div class="modal-content">
          <div class="users-list">
            <div
              v-for="user in departmentUsers"
              :key="user.uid"
              class="user-item"
            >
              <div class="user-avatar" aria-hidden="true">
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
                <button class="edit-btn" @click.stop="editUser(user)" aria-label="Edit user">
                  <MdiIcon :path="mdiPencil" size="16" />
                  Edit
                </button>
                <button
                  class="toggle-btn"
                  :class="{ active: user.isActive }"
                  @click.stop="toggleUserStatus(user)"
                  :disabled="updating"
                  :aria-pressed="user.isActive ? 'true' : 'false'"
                  :aria-label="user.isActive ? 'Deactivate user' : 'Activate user'"
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
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal" role="dialog" aria-modal="true">
      <div class="edit-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="modal-icon" aria-hidden="true">
              <MdiIcon :path="mdiAccountEdit" size="24" />
            </div>
            <div>
              <h3>Edit User</h3>
              <p>{{ editingUser?.email }}</p>
            </div>
          </div>
          <button @click="closeEditModal" class="close-button" aria-label="Close">
            <MdiIcon :path="mdiClose" size="20" />
          </button>
        </div>

        <form @submit.prevent="updateUser" class="edit-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label for="firstName">First Name *</label>
              <input
                id="firstName"
                v-model="editForm.name"
                type="text"
                class="form-input"
                placeholder="Enter first name"
                required
              />
            </div>

            <div class="form-group">
              <label for="lastName">Last Name *</label>
              <input
                id="lastName"
                v-model="editForm.surname"
                type="text"
                class="form-input"
                placeholder="Enter last name"
                required
              />
            </div>

            <div class="form-group">
              <label for="idNumber">ID Number *</label>
              <input
                id="idNumber"
                v-model="editForm.idNumber"
                type="text"
                class="form-input"
                placeholder="Enter ID number"
                required
              />
            </div>

            <div class="form-group">
              <label for="phoneNumber">Phone Number *</label>
              <input
                id="phoneNumber"
                v-model="editForm.phoneNumber"
                type="tel"
                class="form-input"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div class="form-group full-width">
              <label for="password">New Password</label>
              <input
                id="password"
                v-model="editForm.password"
                type="password"
                class="form-input"
                placeholder="Enter new password (leave blank to keep current)"
                autocomplete="new-password"
              />
              <span class="form-hint">Leave blank to keep current password</span>
            </div>

            <div class="form-group">
              <label for="roleSelect">Role</label>
              <select id="roleSelect" v-model="editForm.role" class="form-select" required>
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Accounts Clerk">Accounts Clerk</option>
                <option value="Account Assistant">Account Assistant</option>
                <option value="Accountant">Accountant</option>
                <option value="Laboratory Technician">Laboratory Technician</option>
                <option value="Pharmacy Technician">Pharmacy Technician</option>
                <option value="Dispensary Assistant">Dispensary Assistant</option>
                <option value="Radiologist">Radiologist</option>
                <option value="Rehabilitation Technician">Rehabilitation Technician</option>
                <option value="Vitals Checker">Vitals Checker</option>
              </select>
            </div>

            <div class="form-group">
              <label for="departmentSelect">Department</label>
              <select id="departmentSelect" v-model="editForm.department" class="form-select" required>
                <option value="">Select Department</option>
                <option value="Administration">Administration</option>
                <option value="Clinical">Clinical</option>
                <option value="Accounting">Accounting</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Radiology">Radiology</option>
                <option value="Rehabilitation">Rehabilitation</option>
                <option value="OPD">OPD</option>
                <option value="FCH Ward">FCH Ward</option>
                <option value="Maternity">Maternity</option>
                <option value="Theatre Ward">Theatre Ward</option>
                <option value="Female Ward">Female Ward</option>
                <option value="Male Ward">Male Ward</option>
                <option value="Children Ward">Children Ward</option>
              </select>
            </div>
          </div>

          <div v-if="editError" class="error-message" role="alert">
            <MdiIcon :path="mdiAlertCircle" size="16" />
            {{ editError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeEditModal" :disabled="updating">Cancel</button>
            <button type="submit" class="update-btn" :disabled="updating">
              <MdiIcon v-if="updating" :path="mdiLoading" size="16" class="spinning" aria-hidden="true" />
              <MdiIcon v-else :path="mdiCheck" size="16" />
              <span v-if="updating">Updating...</span>
              <span v-else>Update User</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Department Modal -->
    <div v-if="showAddDepartmentModal" class="modal-overlay" @click="closeAddDepartmentModal" role="dialog" aria-modal="true">
      <div class="add-department-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="modal-icon" aria-hidden="true">
              <MdiIcon :path="mdiOfficeBuildingPlus" size="24" />
            </div>
            <div>
              <h3>Add New Department</h3>
              <p>Create a new department in the system</p>
            </div>
          </div>
          <button @click="closeAddDepartmentModal" class="close-button" aria-label="Close">
            <MdiIcon :path="mdiClose" size="20" />
          </button>
        </div>

        <form @submit.prevent="addDepartment" class="add-form" novalidate>
          <div class="form-group">
            <label for="deptName">Department Name *</label>
            <input
              id="deptName"
              v-model="newDepartmentName"
              type="text"
              class="form-input"
              placeholder="Enter department name"
              required
            />
          </div>

          <div class="form-group">
            <label for="deptDesc">Description</label>
            <textarea
              id="deptDesc"
              v-model="newDepartmentDescription"
              class="form-textarea"
              placeholder="Enter department description"
              rows="3"
            ></textarea>
          </div>

          <div v-if="addDeptError" class="error-message" role="alert">
            <MdiIcon :path="mdiAlertCircle" size="16" />
            {{ addDeptError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeAddDepartmentModal" :disabled="addingDepartment">Cancel</button>
            <button type="submit" class="add-btn" :disabled="!newDepartmentName.trim() || addingDepartment">
              <MdiIcon :path="mdiPlus" size="16" />
              <span v-if="addingDepartment">Adding...</span>
              <span v-else>Add Department</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="success-toast" role="status" aria-live="polite">
      <MdiIcon :path="mdiCheckCircle" size="20" />
      <span>{{ successMessage }}</span>
    </div>
  </div>
</template>

<script setup>
/* File: src/components/UserManagement.vue */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import apiService from '@/services/api'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import MdiIcon from '@/components/common/MdiIcon.vue'

/* Icon imports — only the icons used below */
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
  mdiOfficeBuilding,
  mdiStethoscope,
  mdiCashMultiple,
  mdiTestTube,
  mdiPill,
  mdiRadioactive,
  mdiWheelchair,
  mdiClipboardList,
  mdiHeart,
  mdiHumanPregnant,
  mdiScalpel,
  mdiGenderFemale,
  mdiGenderMale,
  mdiAccountChild
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()

// UI state
const loading = ref(true)
const showDepartmentModal = ref(false)
const showEditModal = ref(false)
const showAddDepartmentModal = ref(false)
const showSuccessToast = ref(false)
const updating = ref(false)
const addingDepartment = ref(false)

// Data
const allUsers = ref([])
const selectedDepartment = ref(null)
const editingUser = ref(null)
const editError = ref('')
const addDeptError = ref('')
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

/* --- Computed: departments aggregated from users --- */
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
    if (user.isActive) dept.activeUsers++
  })

  return Array.from(deptMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

/* --- Computed: users in selected department ordered --- */
const departmentUsers = computed(() => {
  if (!selectedDepartment.value) return []
  return selectedDepartment.value.users.slice().sort((a, b) => {
    const nameA = a.name && a.surname ? `${a.name} ${a.surname}` : (a.fullName || a.email || '')
    const nameB = b.name && b.surname ? `${b.name} ${b.surname}` : (b.fullName || b.email || '')
    return nameA.localeCompare(nameB)
  })
})

/* --- Load users from Firestore --- */
const loadUsers = async () => {
  loading.value = true
  editError.value = ''
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users = []
    usersSnapshot.forEach(d => {
      const data = d.data() || {}
      // Ensure both `id` and `uid` exist to be compatible with other pages
      users.push({
        id: d.id,
        uid: d.id,
        ...data
      })
    })
    allUsers.value = users
  } catch (err) {
    console.error('Error loading users:', err)
    editError.value = 'Failed to load users'
  } finally {
    loading.value = false
  }
}

/* --- Icons mapping — use safe icons --- */
const getDepartmentIcon = (departmentName) => {
  const iconMap = {
    'Administration': mdiOfficeBuilding,
    'Clinical': mdiStethoscope,
    'Accounting': mdiCashMultiple,
    'Laboratory': mdiTestTube,
    'Pharmacy': mdiPill,
    'Radiology': mdiRadioactive,
    'Rehabilitation': mdiWheelchair,
    'OPD': mdiClipboardList,
    'FCH Ward': mdiHeart,
    'Maternity': mdiHumanPregnant,
    'Theatre Ward': mdiScalpel,
    'Female Ward': mdiGenderFemale,
    'Male Ward': mdiGenderMale,
    'Children Ward': mdiAccountChild
  }
  return iconMap[departmentName] || mdiAccountGroup
}

/* --- Descriptions --- */
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

/* --- Modal handlers --- */
const openDepartmentModal = (department) => {
  selectedDepartment.value = department
  showDepartmentModal.value = true
}

const closeDepartmentModal = () => {
  showDepartmentModal.value = false
  selectedDepartment.value = null
}

/* --- Edit user --- */
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

/* --- Update user: try apiService first, fallback to Firestore update --- */
const updateUser = async () => {
  if (!editingUser.value) {
    editError.value = 'No user selected'
    return
  }

  updating.value = true
  editError.value = ''
  try {
    const uid = editingUser.value.uid || editingUser.value.id
    const payload = {
      name: editForm.value.name.trim(),
      surname: editForm.value.surname.trim(),
      idNumber: editForm.value.idNumber.trim(),
      phoneNumber: editForm.value.phoneNumber.trim(),
      role: editForm.value.role,
      department: editForm.value.department,
      profileCompleted: true,
      updatedAt: serverTimestamp()
    }
    // If apiService exists and has updateUser, prefer it (it might handle auth password)
    if (apiService && typeof apiService.updateUser === 'function') {
      await apiService.updateUser(uid, payload, editForm.value.password.trim(), authStore.user.uid)
    } else {
      // Fallback: update Firestore user doc
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        ...payload,
        // Only update password if some server-side mechanism exists — we can't update auth password here
      })
      if (editForm.value.password && editForm.value.password.trim()) {
        // best-effort: if apiService missing, we can't change firebase auth password safely here
        // We won't throw — inform user
        editError.value = 'Password not changed: server-side password update not available'
      }
    }

    // Update local data copy
    const idx = allUsers.value.findIndex(u => (u.uid || u.id) === uid)
    if (idx !== -1) {
      allUsers.value[idx] = {
        ...allUsers.value[idx],
        name: payload.name,
        surname: payload.surname,
        idNumber: payload.idNumber,
        phoneNumber: payload.phoneNumber,
        fullName: `${payload.name} ${payload.surname}`.trim(),
        role: payload.role,
        department: payload.department,
        profileCompleted: true
      }
    }

    // close modal and show message
    showSuccessMessage('User updated successfully!')
    closeEditModal()
  } catch (err) {
    console.error('Error updating user:', err)
    editError.value = (err && err.message) ? err.message : 'Failed to update user'
  } finally {
    updating.value = false
  }
}

/* --- Toggle user status (active/inactive) --- */
const toggleUserStatus = async (user) => {
  if (!user || !user.uid && !user.id) {
    editError.value = 'Invalid user selected'
    return
  }
  updating.value = true
  editError.value = ''
  try {
    const uid = user.uid || user.id
    const userRef = doc(db, 'users', uid)
    const newStatus = !user.isActive
    await updateDoc(userRef, {
      isActive: newStatus,
      updatedAt: serverTimestamp()
    })
    // update local model (reactive)
    user.isActive = newStatus

    showSuccessMessage(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`)
  } catch (err) {
    console.error('Error toggling user status:', err)
    editError.value = 'Failed to update user status'
  } finally {
    updating.value = false
  }
}

/* --- Add Department: write to Firestore 'departments' collection --- */
const addDepartment = async () => {
  addDeptError.value = ''
  if (!newDepartmentName.value.trim()) {
    addDeptError.value = 'Department name is required'
    return
  }

  addingDepartment.value = true
  try {
    const deptName = newDepartmentName.value.trim()

    // Prevent duplicates (case-insensitive)
    const q = query(collection(db, 'departments'), where('nameLower', '==', deptName.toLowerCase()))
    const snap = await getDocs(q)
    if (!snap.empty) {
      addDeptError.value = 'Department with this name already exists'
      return
    }

    await addDoc(collection(db, 'departments'), {
      name: deptName,
      nameLower: deptName.toLowerCase(),
      description: newDepartmentDescription.value.trim(),
      createdBy: authStore.user?.uid || null,
      createdAt: serverTimestamp()
    })

    showSuccessMessage('Department added successfully!')
    // reset
    closeAddDepartmentModal()
    // optional: refresh users or departments list if you display departments from Firestore elsewhere
  } catch (err) {
    console.error('Error adding department:', err)
    addDeptError.value = (err && err.message) ? err.message : 'Failed to add department'
  } finally {
    addingDepartment.value = false
  }
}

const closeAddDepartmentModal = () => {
  showAddDepartmentModal.value = false
  newDepartmentName.value = ''
  newDepartmentDescription.value = ''
  addDeptError.value = ''
}

/* --- Success toast --- */
const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccessToast.value = true
  setTimeout(() => {
    showSuccessToast.value = false
  }, 3000)
}

/* --- Refresh --- */
const refreshData = () => {
  loadUsers()
}

/* --- Lifecycle --- */
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
/* (unchanged styling from the original file) */

/* ... Keep the entire CSS from your original file here ... */
/* For brevity in this message, please reuse your original <style> block unchanged. */
/* The style block included earlier in your original component is compatible with these markup changes. */
</style>
