import admin from 'firebase-admin'
import PDFDocument from 'pdfkit'

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com"
    }),
    projectId: process.env.FIREBASE_PROJECT_ID
  })
}

const db = admin.firestore()

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A'
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Create PDF header
const addPDFHeader = (doc, title) => {
  // Hospital Logo and Header
  doc.fontSize(20)
     .fillColor('#0066B2')
     .text('MORGENSTER HOSPITAL MANAGEMENT SYSTEM', 50, 50, { align: 'center' })
  
  doc.fontSize(16)
     .fillColor('#666666')
     .text(title, 50, 80, { align: 'center' })
  
  doc.fontSize(12)
     .fillColor('#999999')
     .text(`Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 50, 100, { align: 'center' })
  
  // Add line separator
  doc.moveTo(50, 130)
     .lineTo(550, 130)
     .strokeColor('#E5E7EB')
     .stroke()
  
  return 150 // Return Y position for content start
}

// Generate Financial Summary Report
const generateFinancialReport = async (doc, dateFrom, dateTo) => {
  let yPosition = addPDFHeader(doc, 'FINANCIAL SUMMARY REPORT')
  
  // Date range
  doc.fontSize(14)
     .fillColor('#374151')
     .text(`Report Period: ${dateFrom} to ${dateTo}`, 50, yPosition)
  
  yPosition += 30
  
  try {
    // Query invoices in date range
    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    toDate.setHours(23, 59, 59, 999)
    
    // Get all patients to access their invoices
    const patientsSnapshot = await db.collection('patients').get()
    
    let totalSales = 0
    let cashSales = 0
    let eftSales = 0
    let unpaidSales = 0
    let totalInvoices = 0
    
    for (const patientDoc of patientsSnapshot.docs) {
      const invoicesSnapshot = await db.collection(`patients/${patientDoc.id}/invoices`).get()
      
      for (const invoiceDoc of invoicesSnapshot.docs) {
        const invoice = invoiceDoc.data()
        const invoiceDate = invoice.creationDate?.toDate()
        
        if (invoiceDate && invoiceDate >= fromDate && invoiceDate <= toDate) {
          totalInvoices++
          totalSales += invoice.totalAmount || 0
          
          if (invoice.status === 'paid') {
            if (invoice.paymentMethod === 'cash') {
              cashSales += invoice.amountPaid || 0
            } else if (invoice.paymentMethod === 'eft') {
              eftSales += invoice.amountPaid || 0
            }
          } else {
            unpaidSales += invoice.balance || 0
          }
        }
      }
    }
    
    // Add financial summary to PDF
    doc.fontSize(16)
       .fillColor('#0066B2')
       .text('FINANCIAL SUMMARY', 50, yPosition)
    
    yPosition += 30
    
    const summaryData = [
      ['Total Invoices:', totalInvoices.toString()],
      ['Total Sales:', `M${formatCurrency(totalSales)}`],
      ['Cash Sales:', `M${formatCurrency(cashSales)}`],
      ['EFT Sales:', `M${formatCurrency(eftSales)}`],
      ['Unpaid Sales:', `M${formatCurrency(unpaidSales)}`],
      ['Collection Rate:', `${totalSales > 0 ? ((totalSales - unpaidSales) / totalSales * 100).toFixed(1) : 0}%`]
    ]
    
    summaryData.forEach(([label, value]) => {
      doc.fontSize(12)
         .fillColor('#374151')
         .text(label, 50, yPosition)
         .text(value, 300, yPosition)
      yPosition += 20
    })
    
  } catch (error) {
    doc.fontSize(12)
       .fillColor('#DC2626')
       .text(`Error generating financial data: ${error.message}`, 50, yPosition)
  }
}

// Generate Unpaid Patients Report
const generateUnpaidPatientsReport = async (doc, dateFrom, dateTo) => {
  let yPosition = addPDFHeader(doc, 'UNPAID PATIENTS REPORT')
  
  doc.fontSize(14)
     .fillColor('#374151')
     .text(`Report Period: ${dateFrom} to ${dateTo}`, 50, yPosition)
  
  yPosition += 30
  
  try {
    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    toDate.setHours(23, 59, 59, 999)
    
    const unpaidPatients = []
    const patientsSnapshot = await db.collection('patients').get()
    
    for (const patientDoc of patientsSnapshot.docs) {
      const patient = patientDoc.data()
      const invoicesSnapshot = await db.collection(`patients/${patientDoc.id}/invoices`)
        .where('status', '==', 'unpaid')
        .get()
      
      let totalBalance = 0
      let lastInvoiceDate = null
      
      invoicesSnapshot.forEach(invoiceDoc => {
        const invoice = invoiceDoc.data()
        const invoiceDate = invoice.creationDate?.toDate()
        
        if (invoiceDate && invoiceDate >= fromDate && invoiceDate <= toDate) {
          totalBalance += invoice.balance || 0
          if (!lastInvoiceDate || invoiceDate > lastInvoiceDate) {
            lastInvoiceDate = invoiceDate
          }
        }
      })
      
      if (totalBalance > 0) {
        unpaidPatients.push({
          name: `${patient.name} ${patient.surname}`,
          hospitalNumber: patient.hospitalNumber,
          phone: patient.phone,
          balance: totalBalance,
          lastInvoiceDate
        })
      }
    }
    
    // Sort by balance (highest first)
    unpaidPatients.sort((a, b) => b.balance - a.balance)
    
    // Add table header
    doc.fontSize(16)
       .fillColor('#0066B2')
       .text('UNPAID PATIENTS LIST', 50, yPosition)
    
    yPosition += 30
    
    if (unpaidPatients.length === 0) {
      doc.fontSize(12)
         .fillColor('#6B7280')
         .text('No unpaid patients found for the selected period.', 50, yPosition)
    } else {
      // Table headers
      doc.fontSize(10)
         .fillColor('#374151')
         .text('Patient Name', 50, yPosition)
         .text('Hospital #', 200, yPosition)
         .text('Phone', 300, yPosition)
         .text('Balance', 400, yPosition)
         .text('Last Invoice', 480, yPosition)
      
      yPosition += 20
      
      // Add line under headers
      doc.moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .strokeColor('#E5E7EB')
         .stroke()
      
      yPosition += 10
      
      // Add patient data
      unpaidPatients.slice(0, 30).forEach(patient => {
        if (yPosition > 700) {
          doc.addPage()
          yPosition = 50
        }
        
        doc.fontSize(9)
           .fillColor('#1F2937')
           .text(patient.name, 50, yPosition)
           .text(patient.hospitalNumber, 200, yPosition)
           .text(patient.phone, 300, yPosition)
           .fillColor('#DC2626')
           .text(`M${formatCurrency(patient.balance)}`, 400, yPosition)
           .fillColor('#6B7280')
           .text(formatDate(patient.lastInvoiceDate), 480, yPosition)
        
        yPosition += 15
      })
      
      // Summary
      yPosition += 20
      const totalUnpaid = unpaidPatients.reduce((sum, p) => sum + p.balance, 0)
      doc.fontSize(12)
         .fillColor('#0066B2')
         .text(`Total Unpaid Amount: M${formatCurrency(totalUnpaid)}`, 50, yPosition)
         .text(`Number of Patients: ${unpaidPatients.length}`, 50, yPosition + 15)
    }
    
  } catch (error) {
    doc.fontSize(12)
       .fillColor('#DC2626')
       .text(`Error generating unpaid patients data: ${error.message}`, 50, yPosition)
  }
}

// Generate Top Selling Items Report
const generateTopItemsReport = async (doc, dateFrom, dateTo) => {
  let yPosition = addPDFHeader(doc, 'TOP 20 SELLING ITEMS REPORT')
  
  doc.fontSize(14)
     .fillColor('#374151')
     .text(`Report Period: ${dateFrom} to ${dateTo}`, 50, yPosition)
  
  yPosition += 30
  
  try {
    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    toDate.setHours(23, 59, 59, 999)
    
    const itemsSold = {}
    const patientsSnapshot = await db.collection('patients').get()
    
    for (const patientDoc of patientsSnapshot.docs) {
      const invoicesSnapshot = await db.collection(`patients/${patientDoc.id}/invoices`).get()
      
      for (const invoiceDoc of invoicesSnapshot.docs) {
        const invoice = invoiceDoc.data()
        const invoiceDate = invoice.creationDate?.toDate()
        
        if (invoiceDate && invoiceDate >= fromDate && invoiceDate <= toDate) {
          const itemsSnapshot = await db.collection(`patients/${patientDoc.id}/invoices/${invoiceDoc.id}/items`).get()
          
          itemsSnapshot.forEach(itemDoc => {
            const item = itemDoc.data()
            const itemKey = item.description || 'Unknown Item'
            
            if (!itemsSold[itemKey]) {
              itemsSold[itemKey] = {
                name: itemKey,
                quantitySold: 0,
                totalRevenue: 0,
                unitPrice: item.unitPrice || 0
              }
            }
            
            itemsSold[itemKey].quantitySold += item.quantity || 0
            itemsSold[itemKey].totalRevenue += item.totalPrice || 0
          })
        }
      }
    }
    
    // Sort by revenue and get top 20
    const topItems = Object.values(itemsSold)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 20)
    
    // Add table header
    doc.fontSize(16)
       .fillColor('#0066B2')
       .text('TOP 20 SELLING ITEMS', 50, yPosition)
    
    yPosition += 30
    
    if (topItems.length === 0) {
      doc.fontSize(12)
         .fillColor('#6B7280')
         .text('No sales data found for the selected period.', 50, yPosition)
    } else {
      // Table headers
      doc.fontSize(10)
         .fillColor('#374151')
         .text('Rank', 50, yPosition)
         .text('Item Name', 80, yPosition)
         .text('Qty Sold', 300, yPosition)
         .text('Unit Price', 380, yPosition)
         .text('Total Revenue', 460, yPosition)
      
      yPosition += 20
      
      // Add line under headers
      doc.moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .strokeColor('#E5E7EB')
         .stroke()
      
      yPosition += 10
      
      // Add items data
      topItems.forEach((item, index) => {
        if (yPosition > 700) {
          doc.addPage()
          yPosition = 50
        }
        
        doc.fontSize(9)
           .fillColor('#1F2937')
           .text((index + 1).toString(), 50, yPosition)
           .text(item.name, 80, yPosition, { width: 200 })
           .text(item.quantitySold.toString(), 300, yPosition)
           .text(`M${formatCurrency(item.unitPrice)}`, 380, yPosition)
           .fillColor('#0066B2')
           .text(`M${formatCurrency(item.totalRevenue)}`, 460, yPosition)
        
        yPosition += 15
      })
      
      // Summary
      yPosition += 20
      const totalRevenue = topItems.reduce((sum, item) => sum + item.totalRevenue, 0)
      doc.fontSize(12)
         .fillColor('#0066B2')
         .text(`Total Revenue from Top 20: M${formatCurrency(totalRevenue)}`, 50, yPosition)
    }
    
  } catch (error) {
    doc.fontSize(12)
       .fillColor('#DC2626')
       .text(`Error generating top items data: ${error.message}`, 50, yPosition)
  }
}

// Generate Lab Report
const generateLabReport = async (doc, dateFrom, dateTo) => {
  let yPosition = addPDFHeader(doc, 'LABORATORY REPORT')
  
  doc.fontSize(14)
     .fillColor('#374151')
     .text(`Report Period: ${dateFrom} to ${dateTo}`, 50, yPosition)
  
  yPosition += 30
  
  try {
    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    toDate.setHours(23, 59, 59, 999)
    
    const testStats = {}
    const patientsSnapshot = await db.collection('patients').get()
    
    for (const patientDoc of patientsSnapshot.docs) {
      const patient = patientDoc.data()
      const labRequestsSnapshot = await db.collection(`patients/${patientDoc.id}/lab_requests`).get()
      
      labRequestsSnapshot.forEach(requestDoc => {
        const request = requestDoc.data()
        const requestDate = request.timestamp?.toDate()
        
        if (requestDate && requestDate >= fromDate && requestDate <= toDate) {
          const testType = request.testType || 'Unknown Test'
          
          if (!testStats[testType]) {
            testStats[testType] = {
              total: 0,
              completed: 0,
              pending: 0,
              failed: 0
            }
          }
          
          testStats[testType].total++
          
          switch (request.status) {
            case 'completed':
              testStats[testType].completed++
              break
            case 'pending':
              testStats[testType].pending++
              break
            case 'failed':
              testStats[testType].failed++
              break
          }
        }
      })
    }
    
    // Add lab statistics
    doc.fontSize(16)
       .fillColor('#0066B2')
       .text('LABORATORY TEST STATISTICS', 50, yPosition)
    
    yPosition += 30
    
    if (Object.keys(testStats).length === 0) {
      doc.fontSize(12)
         .fillColor('#6B7280')
         .text('No laboratory tests found for the selected period.', 50, yPosition)
    } else {
      // Table headers
      doc.fontSize(10)
         .fillColor('#374151')
         .text('Test Type', 50, yPosition)
         .text('Total', 250, yPosition)
         .text('Completed', 300, yPosition)
         .text('Pending', 370, yPosition)
         .text('Failed', 430, yPosition)
         .text('Success Rate', 480, yPosition)
      
      yPosition += 20
      
      // Add line under headers
      doc.moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .strokeColor('#E5E7EB')
         .stroke()
      
      yPosition += 10
      
      // Add test data
      Object.entries(testStats).forEach(([testType, stats]) => {
        if (yPosition > 700) {
          doc.addPage()
          yPosition = 50
        }
        
        const successRate = stats.total > 0 ? (stats.completed / stats.total * 100).toFixed(1) : 0
        
        doc.fontSize(9)
           .fillColor('#1F2937')
           .text(testType, 50, yPosition, { width: 180 })
           .text(stats.total.toString(), 250, yPosition)
           .fillColor('#16A34A')
           .text(stats.completed.toString(), 300, yPosition)
           .fillColor('#F59E0B')
           .text(stats.pending.toString(), 370, yPosition)
           .fillColor('#DC2626')
           .text(stats.failed.toString(), 430, yPosition)
           .fillColor('#0066B2')
           .text(`${successRate}%`, 480, yPosition)
        
        yPosition += 15
      })
    }
    
  } catch (error) {
    doc.fontSize(12)
       .fillColor('#DC2626')
       .text(`Error generating lab report: ${error.message}`, 50, yPosition)
  }
}

// Generate Radiology Report
const generateRadiologyReport = async (doc, dateFrom, dateTo) => {
  let yPosition = addPDFHeader(doc, 'RADIOLOGY REPORT')
  
  doc.fontSize(14)
     .fillColor('#374151')
     .text(`Report Period: ${dateFrom} to ${dateTo}`, 50, yPosition)
  
  yPosition += 30
  
  try {
    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    toDate.setHours(23, 59, 59, 999)
    
    const xrayStats = {}
    const patientsSnapshot = await db.collection('patients').get()
    
    for (const patientDoc of patientsSnapshot.docs) {
      const radiologyRequestsSnapshot = await db.collection(`patients/${patientDoc.id}/radiology_requests`).get()
      
      radiologyRequestsSnapshot.forEach(requestDoc => {
        const request = requestDoc.data()
        const requestDate = request.timestamp?.toDate()
        
        if (requestDate && requestDate >= fromDate && requestDate <= toDate) {
          const xrayType = request.xrayType || 'Unknown X-ray'
          
          if (!xrayStats[xrayType]) {
            xrayStats[xrayType] = {
              total: 0,
              completed: 0,
              pending: 0,
              failed: 0
            }
          }
          
          xrayStats[xrayType].total++
          
          switch (request.status) {
            case 'completed':
              xrayStats[xrayType].completed++
              break
            case 'pending':
              xrayStats[xrayType].pending++
              break
            case 'failed':
              xrayStats[xrayType].failed++
              break
          }
        }
      })
    }
    
    // Add radiology statistics
    doc.fontSize(16)
       .fillColor('#0066B2')
       .text('RADIOLOGY STATISTICS', 50, yPosition)
    
    yPosition += 30
    
    if (Object.keys(xrayStats).length === 0) {
      doc.fontSize(12)
         .fillColor('#6B7280')
         .text('No radiology requests found for the selected period.', 50, yPosition)
    } else {
      // Table headers
      doc.fontSize(10)
         .fillColor('#374151')
         .text('X-ray Type', 50, yPosition)
         .text('Total', 250, yPosition)
         .text('Completed', 300, yPosition)
         .text('Pending', 370, yPosition)
         .text('Failed', 430, yPosition)
         .text('Success Rate', 480, yPosition)
      
      yPosition += 20
      
      // Add line under headers
      doc.moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .strokeColor('#E5E7EB')
         .stroke()
      
      yPosition += 10
      
      // Add x-ray data
      Object.entries(xrayStats).forEach(([xrayType, stats]) => {
        if (yPosition > 700) {
          doc.addPage()
          yPosition = 50
        }
        
        const successRate = stats.total > 0 ? (stats.completed / stats.total * 100).toFixed(1) : 0
        
        doc.fontSize(9)
           .fillColor('#1F2937')
           .text(xrayType, 50, yPosition, { width: 180 })
           .text(stats.total.toString(), 250, yPosition)
           .fillColor('#16A34A')
           .text(stats.completed.toString(), 300, yPosition)
           .fillColor('#F59E0B')
           .text(stats.pending.toString(), 370, yPosition)
           .fillColor('#DC2626')
           .text(stats.failed.toString(), 430, yPosition)
           .fillColor('#0066B2')
           .text(`${successRate}%`, 480, yPosition)
        
        yPosition += 15
      })
    }
    
  } catch (error) {
    doc.fontSize(12)
       .fillColor('#DC2626')
       .text(`Error generating radiology report: ${error.message}`, 50, yPosition)
  }
}

// Generate Inventory Report
const generateInventoryReport = async (doc) => {
  let yPosition = addPDFHeader(doc, 'INVENTORY REPORT')
  
  try {
    // Get inventory data
    const inventoryDoc = await db.collection('app_config').doc('inventory').get()
    const inventory = inventoryDoc.exists ? inventoryDoc.data().items || [] : []
    
    // Calculate statistics
    const totalItems = inventory.length
    const lowStockItems = inventory.filter(item => item.stockLevel <= (item.minimumLevel || 10) && item.stockLevel > 0)
    const outOfStockItems = inventory.filter(item => item.stockLevel === 0)
    
    // Add summary
    doc.fontSize(16)
       .fillColor('#0066B2')
       .text('INVENTORY SUMMARY', 50, yPosition)
    
    yPosition += 30
    
    const summaryData = [
      ['Total Items:', totalItems.toString()],
      ['In Stock:', (totalItems - lowStockItems.length - outOfStockItems.length).toString()],
      ['Low Stock:', lowStockItems.length.toString()],
      ['Out of Stock:', outOfStockItems.length.toString()]
    ]
    
    summaryData.forEach(([label, value]) => {
      doc.fontSize(12)
         .fillColor('#374151')
         .text(label, 50, yPosition)
         .text(value, 200, yPosition)
      yPosition += 20
    })
    
    yPosition += 20
    
    // Add inventory table
    doc.fontSize(16)
       .fillColor('#0066B2')
       .text('INVENTORY DETAILS', 50, yPosition)
    
    yPosition += 30
    
    if (inventory.length === 0) {
      doc.fontSize(12)
         .fillColor('#6B7280')
         .text('No inventory items found.', 50, yPosition)
    } else {
      // Table headers
      doc.fontSize(10)
         .fillColor('#374151')
         .text('Item ID', 50, yPosition)
         .text('Item Name', 120, yPosition)
         .text('Stock Level', 300, yPosition)
         .text('Unit', 380, yPosition)
         .text('Min Level', 430, yPosition)
         .text('Status', 480, yPosition)
      
      yPosition += 20
      
      // Add line under headers
      doc.moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .strokeColor('#E5E7EB')
         .stroke()
      
      yPosition += 10
      
      // Add inventory data
      inventory.forEach(item => {
        if (yPosition > 700) {
          doc.addPage()
          yPosition = 50
        }
        
        const status = item.stockLevel === 0 ? 'Out of Stock' : 
                      item.stockLevel <= (item.minimumLevel || 10) ? 'Low Stock' : 'In Stock'
        const statusColor = item.stockLevel === 0 ? '#DC2626' : 
                           item.stockLevel <= (item.minimumLevel || 10) ? '#F59E0B' : '#16A34A'
        
        doc.fontSize(9)
           .fillColor('#1F2937')
           .text(item.id, 50, yPosition)
           .text(item.name, 120, yPosition, { width: 160 })
           .text(item.stockLevel.toString(), 300, yPosition)
           .text(item.unit, 380, yPosition)
           .text((item.minimumLevel || 10).toString(), 430, yPosition)
           .fillColor(statusColor)
           .text(status, 480, yPosition)
        
        yPosition += 15
      })
    }
    
  } catch (error) {
    doc.fontSize(12)
       .fillColor('#DC2626')
       .text(`Error generating inventory report: ${error.message}`, 50, yPosition)
  }
}

export const handler = async (event, context) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { reportType, dateFrom, dateTo, userId } = JSON.parse(event.body)

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    // Collect PDF data
    doc.on('data', chunk => chunks.push(chunk))
    
    // Generate report based on type
    switch (reportType) {
      case 'financial_summary':
        await generateFinancialReport(doc, dateFrom, dateTo)
        break
      case 'unpaid_patients':
        await generateUnpaidPatientsReport(doc, dateFrom, dateTo)
        break
      case 'top_selling_items':
        await generateTopItemsReport(doc, dateFrom, dateTo)
        break
      case 'lab_report':
        await generateLabReport(doc, dateFrom, dateTo)
        break
      case 'radiology_report':
        await generateRadiologyReport(doc, dateFrom, dateTo)
        break
      case 'inventory_report':
        await generateInventoryReport(doc)
        break
      default:
        throw new Error('Invalid report type')
    }

    // Finalize PDF
    doc.end()

    // Wait for PDF to be generated
    const pdfBuffer = await new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
    })

    // Create notification
    await db.collection('notifications').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId,
      message: `${reportType.replace('_', ' ')} report generated and downloaded`,
      triggeredBy: 'report_system'
    })

    // Return PDF
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reportType}_${dateFrom}_${dateTo}.pdf"`
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
    }

  } catch (error) {
    console.error('Error generating PDF report:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to generate PDF report', 
        details: error.message 
      })
    }
  }
}