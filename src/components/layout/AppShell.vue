<template>
  <div class="app-shell">
    <!-- Desktop Sidebar Navigation -->
    <nav v-if="!isMobile" class="sidebar-nav">
      <div class="nav-header">
        <div class="logo-section">
          <div class="logo-icon">
            <mdi-icon :path="mdiHospital" size="28" color="#38bdf8" />
          </div>
          <div class="logo-text">
            <h1 class="system-title">Morgenster</h1>
            <p class="system-subtitle">Hospital MS</p>
          </div>
        </div>
      </div>

      <div class="nav-items">
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActiveRoute(item.path) }"
        >
          <div class="nav-icon">
            <mdi-icon :path="item.icon" size="20" />
          </div>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </div>

      <div class="nav-footer">
        <div class="user-profile">
          <div class="user-avatar">
            <mdi-icon :path="mdiAccount" size="20" />
          </div>
          <div class="user-details">
            <div class="user-name">{{ userDisplayName }}</div>
            <div class="user-role">{{ authStore.userRole }}</div>
          </div>
        </div>
        
        <button @click="handleLogout" class="logout-btn">
          <mdi-icon :path="mdiLogout" size="18" />
          <span>Logout</span>
        </button>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content" :class="{ 'mobile': isMobile }">
      <!-- Mobile Header -->
      <header v-if="isMobile" class="mobile-header">
        <div class="mobile-logo">
          <mdi-icon :path="mdiHospital" size="24" color="#38bdf8" />
          <span class="mobile-title">Morgenster HMS</span>
        </div>
        <div class="mobile-user">
          <span class="mobile-user-name">{{ userDisplayName }}</span>
          <button @click="handleLogout" class="mobile-logout">
            <mdi-icon :path="mdiLogout" size="18" />
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-content">
        <router-view />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav v-if="isMobile" class="bottom-nav">
      <router-link
        v-for="item in mobileNavigationItems"
        :key="item.name"
        :to="item.path"
        class="bottom-nav-item"
        :class="{ active: isActiveRoute(item.path) }"
      >
        <div class="bottom-nav-icon">
          <mdi-icon :path="item.icon" size="20" />
        </div>
        <span class="bottom-nav-label">{{ item.shortLabel || item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Login from '@/views/Login.vue'
import ProfileCompletion from '@/components/ProfileCompletion.vue'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiHospital,
  mdiAccount,
  mdiLogout,
  mdiViewDashboard,
  mdiAccountPlus,
  mdiChartLine,
  mdiAccountGroup,
  mdiPill,
  mdiTestTube,
  mdiRadiobox,
  mdiPhysicalTherapy,
  mdiCog,
  mdiFileDocument,
  mdiPackageVariant,
  mdiCash,
  mdiStethoscope,
  mdiNurse
} from '@mdi/js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isMobile = ref(false)

// Check screen size
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 1024
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// User display name
const userDisplayName = computed(() => {
  const user = authStore.user
  if (user?.name && user?.surname) {
    return `${user.name} ${user.surname}`
  }
  return user?.displayName || user?.email?.split('@')[0] || 'User'
})

// Check if route is active
const isActiveRoute = (path) => {
  if (path === '/') {
    return route.path === '/' || route.path === authStore.defaultRoute
  }
  return route.path.startsWith(path)
}

// Navigation items based on user role
const navigationItems = computed(() => {
  const role = authStore.userRole
  const baseItems = []

  // Dashboard for all roles
  baseItems.push({
    name: 'dashboard',
    label: 'Dashboard',
    icon: mdiViewDashboard,
    path: '/'
  })

  // Role-specific navigation items
  if (['Accounts Clerk', 'Doctor', 'Nurse'].includes(role)) {
    baseItems.push({
      name: 'register',
      label: 'New Patient',
      icon: mdiAccountPlus,
      path: '/patient/register'
    })
  }

  if (['Accounts Clerk', 'Account Assistant', 'Accountant'].includes(role)) {
    baseItems.push({
      name: 'reports',
      label: 'Reports',
      icon: mdiChartLine,
      path: '/reports'
    })
  }

  if (['Admin', 'Accountant'].includes(role)) {
    baseItems.push({
      name: 'users',
      label: 'User Management',
      icon: mdiAccountGroup,
      path: '/users'
    })
  }

  if (['Pharmacy Technician', 'Dispensary Assistant'].includes(role)) {
    baseItems.push({
      name: 'inventory',
      label: 'Inventory',
      icon: mdiPackageVariant,
      path: '/inventory'
    })
  }

  // Settings for all users
  baseItems.push({
    name: 'settings',
    label: 'Settings',
    icon: mdiCog,
    path: '/settings'
  })

  return baseItems
})

// Mobile navigation (limited to 5 items)
const mobileNavigationItems = computed(() => {
  const items = navigationItems.value.slice(0, 4)
  items.push({
    name: 'settings',
    label: 'Settings',
    shortLabel: 'More',
    icon: mdiCog,
    path: '/settings'
  })
  return items
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
}

/* Desktop Sidebar Navigation */
.sidebar-nav {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.nav-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--border-primary);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #38bdf8, #06b6d4);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.system-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

.system-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  font-weight: 500;
}

.nav-items {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  margin: 2px 0;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-left-color: var(--accent-primary);
}

.nav-item.active {
  background: rgba(56, 189, 248, 0.1);
  color: var(--accent-primary);
  border-left-color: var(--accent-primary);
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-weight: 500;
  font-size: 14px;
}

.nav-footer {
  padding: 20px;
  border-top: 1px solid var(--border-primary);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--bg-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--accent-primary);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: none;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--accent-error);
  border-color: var(--accent-error);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content.mobile {
  padding-bottom: 80px;
}

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  box-shadow: var(--shadow-md);
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.mobile-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-user-name {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.mobile-logout {
  padding: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.mobile-logout:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--accent-error);
}

/* Page Content */
.page-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
}

/* Mobile Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  display: flex;
  padding: 8px 4px;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin: 0 2px;
}

.bottom-nav-item.active {
  color: var(--accent-primary);
  background: rgba(56, 189, 248, 0.1);
}

.bottom-nav-item:hover {
  color: var(--text-secondary);
  background: var(--bg-hover);
}

.bottom-nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-nav-label {
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

@media (max-width: 1024px) {
  .sidebar-nav {
    display: none;
  }
}
</style>