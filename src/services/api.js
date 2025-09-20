// API service for Netlify functions
const API_BASE = '/.netlify/functions'

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      
      // Handle PDF responses
      if (response.headers.get('content-type')?.includes('application/pdf')) {
        return response.blob()
      }
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Seed users on first app load
  async seedUsers() {
    return this.request('/seed-users', {
      method: 'POST'
    })
  }

  // Create a new patient
  async createPatient(patientData, registeredBy) {
    return this.request('/create-patient', {
      method: 'POST',
      body: JSON.stringify({
        ...patientData,
        registeredBy
      })
    })
  }

  // Process billing
  async processBilling(patientId, items, paymentMethod, amountPaid, processedBy) {
    return this.request('/process-billing', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        items,
        paymentMethod,
        amountPaid,
        processedBy
      })
    })
  }

  // Add medical record
  async addMedicalRecord(patientId, recordType, data, authorId) {
    return this.request('/add-medical-record', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        recordType,
        data,
        authorId
      })
    })
  }

  // Update inventory
  async updateInventory(items, updatedBy) {
    return this.request('/update-inventory', {
      method: 'POST',
      body: JSON.stringify({
        items,
        updatedBy
      })
    })
  }

  // Generate and download PDF report
  async generateReportPDF(reportType, dateFrom, dateTo, userId) {
    try {
      const response = await fetch(`/.netlify/functions/generate-report-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType,
          dateFrom,
          dateTo,
          userId
        })
      })

      if (!response.ok) {
        let errorMessage = 'Failed to generate report'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Get the PDF data
      const arrayBuffer = await response.arrayBuffer()
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportType.replace(/_/g, '-')}_${dateFrom}_${dateTo}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true, message: 'Report downloaded successfully' }
    } catch (error) {
      console.error('Error generating PDF report:', error)
      throw error
    }
  }

  // Update user information
  async updateUser(userId, userData, newPassword, updatedBy) {
    return this.request('/update-user', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        userData,
        newPassword,
        updatedBy
      })
    })
  }
}

export default new ApiService()