import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com"
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

const seedConfig = async () => {
  console.log('🚀 Starting application configuration seeding process...');

  try {
    // Initialize price list
    await db.collection('app_config').doc('price_list').set({
      items: [
        { id: 'consultation', name: 'Doctor Consultation', price: 150.00 },
        { id: 'xray_chest', name: 'Chest X-Ray', price: 300.00 },
        { id: 'blood_test_full', name: 'Full Blood Count', price: 200.00 },
        { id: 'urine_test', name: 'Urine Analysis', price: 100.00 },
        { id: 'ecg', name: 'ECG', price: 250.00 },
        { id: 'ultrasound', name: 'Ultrasound', price: 400.00 },
        { id: 'vaccination', name: 'Vaccination', price: 80.00 },
        { id: 'dressing', name: 'Wound Dressing', price: 50.00 },
        { id: 'injection', name: 'Injection', price: 30.00 },
        { id: 'admission_fee', name: 'Admission Fee', price: 500.00 }
      ],
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Price list initialized.');

    // Initialize inventory
    await db.collection('app_config').doc('inventory').set({
      items: [
        { id: 'paracetamol', name: 'Paracetamol 500mg', stockLevel: 1000, unit: 'tablets', category: 'medication', minimumLevel: 100 },
        { id: 'amoxicillin', name: 'Amoxicillin 250mg', stockLevel: 500, unit: 'capsules', category: 'medication', minimumLevel: 50 },
        { id: 'ibuprofen', name: 'Ibuprofen 200mg', stockLevel: 750, unit: 'tablets', category: 'medication', minimumLevel: 75 },
        { id: 'bandages', name: 'Elastic Bandages', stockLevel: 200, unit: 'rolls', category: 'supplies', minimumLevel: 20 },
        { id: 'syringes', name: 'Disposable Syringes', stockLevel: 2000, unit: 'pieces', category: 'supplies', minimumLevel: 200 },
        { id: 'gloves', name: 'Medical Gloves', stockLevel: 500, unit: 'boxes', category: 'supplies', minimumLevel: 50 },
        { id: 'masks', name: 'Surgical Masks', stockLevel: 1000, unit: 'pieces', category: 'supplies', minimumLevel: 100 },
        { id: 'antiseptic', name: 'Antiseptic Solution', stockLevel: 100, unit: 'bottles', category: 'supplies', minimumLevel: 10 }
      ],
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Inventory initialized.');

    console.log('\n🎉 Application configuration seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding process failed:', error);
    throw error;
  }
}

seedConfig().then(() => {
  console.log("🔚 Configuration seeding process finished.");
  process.exit(0);
});
