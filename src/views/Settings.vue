<template>
  <div class="settings-page">
    <!-- Settings Content -->
    <div class="settings-content">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">System Settings</h1>
        <p class="page-subtitle">Manage your profile and system preferences</p>
      </div>

      <!-- User Profile Section -->
      <div class="settings-section">
        <div class="section-header">
          <mdi-icon :path="mdiAccount" size="24" />
          <h2>User Profile</h2>
        </div>
        
        <div class="section-content">
          <div class="profile-info">
            <div class="profile-avatar">
              <mdi-icon :path="mdiAccount" size="48" />
            </div>
            <div class="profile-details">
              <div class="profile-item">
                <label>Full Name</label>
                <span>{{ authStore.user?.displayName || 'User' }}</span>
              </div>
              <div class="profile-item">
                <label>Email</label>
                <span>{{ authStore.user?.email }}</span>
              </div>
              <div class="profile-item">
                <label>Role</label>
                <span>{{ authStore.userRole }}</span>
              </div>
              <div class="profile-item">
                <label>Department</label>
                <span>{{ authStore.userDepartment }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Section -->
      <div class="settings-section">
        <div class="section-header">
          <mdi-icon :path="mdiSecurity" size="24" />
          <h2>Security</h2>
        </div>
        
        <div class="section-content">
          <div class="security-actions">
            <m3-button 
              variant="outlined" 
              @click="changePassword"
              :icon="mdiLock"
            >
              Change Password
            </m3-button>
            
            <m3-button 
              variant="outlined" 
              @click="viewLoginHistory"
              :icon="mdiHistory"
            >
              Login History
            </m3-button>
          </div>
        </div>
      </div>

      <!-- System Information -->
      <div class="settings-section">
        <div class="section-header">
          <mdi-icon :path="mdiInformation" size="24" />
          <h2>System Information</h2>
        </div>
        
        <div class="section-content">
          <div class="system-info">
            <div class="info-item">
              <label>System Version</label>
              <span>MHMS v2.0</span>
            </div>
            <div class="info-item">
              <label>Last Updated</label>
              <span>{{ formatDate(new Date()) }}</span>
            </div>
            <div class="info-item">
              <label>Database Status</label>
              <span class="status-badge online">Online</span>
            </div>
            <div class="info-item">
              <label>Server Status</label>
              <span class="status-badge online">Online</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Only Sections -->
      <template v-if="authStore.isAdmin">
        <!-- User Management -->
        <div class="settings-section">
          <div class="section-header">
            <mdi-icon :path="mdiAccountGroup" size="24" />
            <h2>User Management</h2>
          </div>
          
          <div class="section-content">
            <div class="admin-actions">
              <m3-button 
                variant="filled" 
                @click="navigateTo('/users')"
                :icon="mdiAccountPlus"
              >
                Manage Users
              </m3-button>
              
              <m3-button 
                variant="outlined" 
                @click="viewSystemLogs"
                :icon="mdiFileDocument"
              >
                System Logs
              </m3-button>
              
              <m3-button 
                variant="outlined" 
                @click="backupSystem"
                :icon="mdiBackupRestore"
              >
                Backup System
              </m3-button>
            </div>
          </div>
        </div>

        <!-- System Configuration -->
        <div class="settings-section">
          <div class="section-header">
            <mdi-icon :path="mdiCog" size="24" />
            <h2>System Configuration</h2>
          </div>
          
          <div class="section-content">
            <div class="config-options">
              <div class="config-item">
                <div class="config-info">
                  <label>Hospital Name</label>
                  <span>Morgenster Hospital</span>
                </div>
                <m3-button variant="outlined" size="small" @click="editHospitalInfo">
                  Edit
                </m3-button>
              </div>
              
              <div class="config-item">
                <div class="config-info">
                  <label>System Timezone</label>
                  <span>Africa/Maseru</span>
                </div>
                <m3-button variant="outlined" size="small" @click="editTimezone">
                  Edit
                </m3-button>
              </div>
              
              <div class="config-item">
                <div class="config-info">
                  <label>Auto Backup</label>
                  <span class="status-badge online">Enabled</span>
                </div>
                <m3-button variant="outlined" size="small" @click="toggleAutoBackup">
                  Configure
                </m3-button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Notifications Section -->
      <div class="settings-section">
        <div class="section-header">
          <mdi-icon :path="mdiBell" size="24" />
          <h2>Notifications</h2>
        </div>
        
        <div class="section-content">
          <div class="notification-settings">
            <div class="notification-item">
              <div class="notification-info">
                <label>Email Notifications</label>
                <span>Receive important updates via email</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="emailNotifications" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="notification-item">
              <div class="notification-info">
                <label>System Alerts</label>
                <span>Get notified about system maintenance</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="systemAlerts" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="notification-item">
              <div class="notification-info">
                <label>Patient Updates</label>
                <span>Notifications for patient-related changes</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="patientUpdates" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="settings-section">
        <div class="section-header">
          <mdi-icon :path="mdiHelpCircle" size="24" />
          <h2>About</h2>
        </div>
        
        <div class="section-content">
          <div class="about-info">
            <div class="about-logo">
              <mdi-icon :path="mdiHospital" size="64" color="#0066B2" />
            </div>
            <div class="about-text">
              <h3>Morgenster Hospital Management System</h3>
              <p>A comprehensive hospital management solution built with modern web technologies.</p>
              <p><strong>Version:</strong> 2.0.0</p>
              <p><strong>Developer:</strong> Morgenster Systems</p>
              <p><strong>Copyright:</strong> © 2025 All rights reserved</p>
            </div>
          </div>
          
          <div class="about-actions">
            <m3-button variant="outlined" @click="viewDocumentation">
              Documentation
            </m3-button>
            <m3-button variant="outlined" @click="contactSupport">
              Contact Support
            </m3-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MdiIcon from '@/components/common/MdiIcon.vue'
import {
  mdiAccount,
  mdiSecurity,
  mdiInformation,
  mdiAccountGroup,
  mdiCog,
  mdiBell,
  mdiHelpCircle,
  mdiLock,
  mdiHistory,
  mdiAccountPlus,
  mdiFileDocument,
  mdiBackupRestore,
  mdiHospital
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()

// Notification settings
const emailNotifications = ref(true)
const systemAlerts = ref(true)
const patientUpdates = ref(true)

// Navigation helper
const navigateTo = (path) => {
  router.push(path)
}

// Format date helper
const formatDate = (date) => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Action handlers
const changePassword = () => {
  console.log('Change password')
  // Implement password change functionality
}

const viewLoginHistory = () => {
  console.log('View login history')
  // Implement login history view
}

const viewSystemLogs = () => {
  console.log('View system logs')
  // Implement system logs view
}

const backupSystem = () => {
  console.log('Backup system')
  // Implement system backup
}

const editHospitalInfo = () => {
  console.log('Edit hospital info')
  // Implement hospital info editing
}

const editTimezone = () => {
  console.log('Edit timezone')
  // Implement timezone editing
}

const toggleAutoBackup = () => {
  console.log('Toggle auto backup')
  // Implement auto backup configuration
}

const viewDocumentation = () => {
  console.log('View documentation')
  // Open documentation
}

const contactSupport = () => {
  console.log('Contact support')
  // Open support contact
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.settings-content {
  max-width: 1200px;
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

.settings-section {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.section-header {
  padding: 24px;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-secondary);
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-content {
  padding: 24px;
}

/* Profile Section */
.profile-info {
  display: flex;
  gap: 24px;
  align-items: center;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.profile-details {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-item label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.profile-item span {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

/* Security Section */
.security-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.security-actions button {
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

.security-actions button:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

/* System Info */
.system-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.info-item span {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.status-badge.online {
  background: rgba(16, 185, 129, 0.2);
  color: var(--accent-success);
}

/* Admin Actions */
.admin-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.admin-actions button {
  padding: 12px 20px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-actions button:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
}

.config-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-info label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.config-info span {
  font-size: 14px;
  color: var(--text-secondary);
}

.config-item button {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
}

.config-item button:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

/* Notifications */
.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
}

.notification-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-info label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.notification-info span {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  transition: 0.2s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--accent-primary);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* About Section */
.about-info {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 24px;
}

.about-logo {
  flex-shrink: 0;
}

.about-text h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.about-text p {
  margin: 8px 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.about-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.about-actions button {
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

.about-actions button:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-content {
    padding: 16px;
  }

  .profile-info {
    flex-direction: column;
    text-align: center;
  }

  .profile-details {
    grid-template-columns: 1fr;
  }

  .security-actions,
  .admin-actions,
  .about-actions {
    flex-direction: column;
  }

  .config-item,
  .notification-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .about-info {
    flex-direction: column;
    text-align: center;
  }

  .system-info {
    grid-template-columns: 1fr;
  }
}
</style>