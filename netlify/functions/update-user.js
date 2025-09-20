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

const auth = admin.auth()
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { userId, userData, newPassword, updatedBy } = JSON.parse(event.body)

    // Update user document in Firestore
    const userRef = db.collection('users').doc(userId)
    await userRef.update({
      name: userData.name,
      surname: userData.surname,
      idNumber: userData.idNumber,
      phoneNumber: userData.phoneNumber,
      fullName: `${userData.name} ${userData.surname}`,
      role: userData.role,
      department: userData.department,
      profileCompleted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: updatedBy
    })

    // Update Firebase Auth user if password is provided
    if (newPassword && newPassword.trim()) {
      await auth.updateUser(userId, {
        password: newPassword.trim(),
        displayName: `${userData.name} ${userData.surname}`
      })
    }

    // Update custom claims for role-based access
    await auth.setCustomUserClaims(userId, {
      role: userData.role,
      department: userData.department,
      isActive: true
    })

    // Create notification
    await db.collection('notifications').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: updatedBy,
      message: `User ${userData.name} ${userData.surname} (${userData.role}) updated successfully`,
      triggeredBy: 'user_management'
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'User updated successfully',
        userId: userId
      })
    }

  } catch (error) {
    console.error('Error updating user:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to update user', 
        details: error.message 
      })
    }
  }
}