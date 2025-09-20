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
    const { items, updatedBy } = JSON.parse(event.body)

    // Update inventory
    await db.collection('app_config').doc('inventory').set({
      items: items.map(item => ({
        ...item,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      })),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    })

    // Create notification
    await db.collection('notifications').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: updatedBy,
      message: `Inventory updated - ${items.length} items modified`,
      triggeredBy: 'inventory_system'
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        itemsUpdated: items.length,
        message: 'Inventory updated successfully'
      })
    }

  } catch (error) {
    console.error('Error updating inventory:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to update inventory', 
        details: error.message 
      })
    }
  }
}