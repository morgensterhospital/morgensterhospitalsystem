import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdTokenResult 
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth } from '@/services/firebase'
import { db } from '@/services/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userClaims = ref(null)
  const userDocument = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => userClaims.value?.role || null)
  const userDepartment = computed(() => userClaims.value?.department || null)
  const isAdmin = computed(() => userRole.value === 'Admin')

  // Role permissions mapping
  const permissions = computed(() => {
    const role = userRole.value
    if (!role) return []

    const rolePermissions = {
      'Admin': ['*'], // All permissions
      'Doctor': [
        'patient:view', 'patient:create', 'doctors_notes:create', 'doctors_notes:edit',
        'prescriptions:create', 'prescriptions:edit', 'lab_requests:create',
        'radiology_requests:create', 'admission_discharge:create', 'operations:create'
      ],
      'Nurse': [
        'patient:view', 'patient:create', 'nurses_notes:create', 'nurses_notes:edit',
        'vitals:create', 'vitals:edit', 'prescriptions:create', 'lab_requests:create',
        'radiology_requests:create'
      ],
      'Accounts Clerk': [
        'patient:view', 'patient:create', 'invoices:create', 'invoices:edit',
        'billing:create', 'billing:edit', 'reports:view'
      ],
      'Account Assistant': [
        'patient:view', 'invoices:view', 'reports:view', 'reports:export',
        'billing:approve', 'cash_sales:print'
      ],
      'Accountant': [
        'patient:view', 'invoices:view', 'invoices:approve', 'reports:view',
        'reports:export', 'price_list:edit', 'admission_discharge:approve'
      ],
      'Laboratory Technician': [
        'patient:view', 'lab_requests:view', 'lab_requests:update',
        'lab_results:create', 'lab_results:edit'
      ],
      'Pharmacy Technician': [
        'patient:view', 'prescriptions:view', 'prescriptions:dispense',
        'inventory:view', 'inventory:edit'
      ],
      'Dispensary Assistant': [
        'patient:view', 'prescriptions:view', 'prescriptions:dispense',
        'inventory:view'
      ],
      'Radiologist': [
        'patient:view', 'radiology_requests:view', 'radiology_requests:update',
        'radiology_results:create', 'radiology_results:edit'
      ],
      'Rehabilitation Technician': [
        'patient:view', 'rehabilitation_notes:create', 'rehabilitation_notes:edit'
      ]
    }

    return rolePermissions[role] || []
  })

  // Auth methods
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Get user claims
      const tokenResult = await getIdTokenResult(userCredential.user)
      userClaims.value = tokenResult.claims
      
      // Get user document from Firestore
      await loadUserDocument(userCredential.user.uid)
      
      return userCredential.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Load user document from Firestore
  const loadUserDocument = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDocSnap = await getDoc(userDocRef)
      
      if (userDocSnap.exists()) {
        userDocument.value = userDocSnap.data()
      }
    } catch (err) {
      console.error('Error loading user document:', err)
    }
  }

  // Refresh user data
  const refreshUserData = async () => {
    if (user.value) {
      await loadUserDocument(user.value.uid)
    }
  }

  // Initialize auth state
  const initializeAuth = () => {
    // Auth state is handled by onAuthStateChanged
  }
  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      userClaims.value = null
      userDocument.value = null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const hasPermission = (permission) => {
    const userPerms = permissions.value
    return userPerms.includes('*') || userPerms.includes(permission)
  }

  // Initialize auth state listener
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      user.value = firebaseUser
      const tokenResult = await getIdTokenResult(firebaseUser)
      userClaims.value = tokenResult.claims
      await loadUserDocument(firebaseUser.uid)
    } else {
      user.value = null
      userClaims.value = null
      userDocument.value = null
    }
    loading.value = false
  })

  return {
    user: computed(() => user.value),
    userDocument: computed(() => userDocument.value),
    userClaims: computed(() => userClaims.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isAuthenticated,
    userRole,
    userDepartment,
    isAdmin,
    permissions,
    login,
    logout,
    refreshUserData,
    initializeAuth,
    hasPermission
  }
})