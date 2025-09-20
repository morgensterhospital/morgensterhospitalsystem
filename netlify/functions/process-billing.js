import admin from 'firebase-admin'

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
    const { patientId, items, paymentMethod, amountPaid, processedBy } = JSON.parse(event.body)

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const balance = totalAmount - (amountPaid || 0)
    const status = balance <= 0 ? 'paid' : 'unpaid'

    // Create invoice
    const invoiceRef = await db.collection(`patients/${patientId}/invoices`).add({
      status,
      creationDate: admin.firestore.FieldValue.serverTimestamp(),
      totalAmount,
      amountPaid: amountPaid || 0,
      balance: Math.max(0, balance),
      paymentMethod,
      processedByRef: db.doc(`users/${processedBy}`)
    })

    // Add items to invoice
    const batch = db.batch()
    items.forEach(item => {
      const itemRef = db.collection(`patients/${patientId}/invoices/${invoiceRef.id}/items`).doc()
      batch.set(itemRef, item)
    })
    
    await batch.commit()

    // Create notification for payment
    await db.collection('notifications').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: processedBy,
      message: `Invoice processed for patient ${patientId}. Amount: M${totalAmount.toFixed(2)}`,
      triggeredBy: 'billing_system'
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        invoiceId: invoiceRef.id,
        totalAmount,
        amountPaid: amountPaid || 0,
        balance: Math.max(0, balance),
        status,
        message: 'Bill processed successfully'
      })
    }

  } catch (error) {
    console.error('Error processing billing:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to process billing', 
        details: error.message 
      })
    }
  }
}