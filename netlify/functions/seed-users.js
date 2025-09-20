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

// Complete list of all users to be created
const usersToCreate = [
  // Admin
  { email: 'admin@mhs.com', role: 'Admin', department: 'Administration', name: 'System', surname: 'Administrator', idNumber: 'ADM001', phoneNumber: '+266-5000-0001' },
  
  // Doctors
  { email: 'doctor1@mhs.com', role: 'Doctor', department: 'Clinical', name: 'Dr. John', surname: 'Smith', idNumber: 'DOC001', phoneNumber: '+266-5000-0101' },
  { email: 'doctor2@mhs.com', role: 'Doctor', department: 'Clinical', name: 'Dr. Sarah', surname: 'Johnson', idNumber: 'DOC002', phoneNumber: '+266-5000-0102' },
  { email: 'doctor3@mhs.com', role: 'Doctor', department: 'Clinical', name: 'Dr. Michael', surname: 'Brown', idNumber: 'DOC003', phoneNumber: '+266-5000-0103' },
  { email: 'doctor4@mhs.com', role: 'Doctor', department: 'Clinical', name: 'Dr. Emily', surname: 'Davis', idNumber: 'DOC004', phoneNumber: '+266-5000-0104' },
  { email: 'doctor5@mhs.com', role: 'Doctor', department: 'Clinical', name: 'Dr. David', surname: 'Wilson', idNumber: 'DOC005', phoneNumber: '+266-5000-0105' },
  
  // Accountant
  { email: 'accountant@mhs.com', role: 'Accountant', department: 'Accounting', name: 'Mary', surname: 'Thompson', idNumber: 'ACC001', phoneNumber: '+266-5000-0201' },
  
  // Account Assistants
  { email: 'accountassistant1@mhs.com', role: 'Account Assistant', department: 'Accounting', name: 'James', surname: 'Miller', idNumber: 'ACA001', phoneNumber: '+266-5000-0301' },
  { email: 'accountassistant2@mhs.com', role: 'Account Assistant', department: 'Accounting', name: 'Lisa', surname: 'Garcia', idNumber: 'ACA002', phoneNumber: '+266-5000-0302' },
  { email: 'accountassistant3@mhs.com', role: 'Account Assistant', department: 'Accounting', name: 'Robert', surname: 'Martinez', idNumber: 'ACA003', phoneNumber: '+266-5000-0303' },
  
  // Accounts Clerks
  { email: 'accountsclerk1@mhs.com', role: 'Accounts Clerk', department: 'Accounting', name: 'Jennifer', surname: 'Anderson', idNumber: 'ACL001', phoneNumber: '+266-5000-0401' },
  { email: 'accountsclerk2@mhs.com', role: 'Accounts Clerk', department: 'Accounting', name: 'William', surname: 'Taylor', idNumber: 'ACL002', phoneNumber: '+266-5000-0402' },
  { email: 'accountsclerk3@mhs.com', role: 'Accounts Clerk', department: 'Accounting', name: 'Jessica', surname: 'Thomas', idNumber: 'ACL003', phoneNumber: '+266-5000-0403' },
  { email: 'accountsclerk4@mhs.com', role: 'Accounts Clerk', department: 'Accounting', name: 'Christopher', surname: 'Jackson', idNumber: 'ACL004', phoneNumber: '+266-5000-0404' },
  { email: 'accountsclerk5@mhs.com', role: 'Accounts Clerk', department: 'Accounting', name: 'Amanda', surname: 'White', idNumber: 'ACL005', phoneNumber: '+266-5000-0405' },
  
  // Vitals Checkers
  { email: 'vitalschecker1@mhs.com', role: 'Vitals Checker', department: 'Clinical', name: 'Patricia', surname: 'Harris', idNumber: 'VIT001', phoneNumber: '+266-5000-0501' },
  { email: 'vitalschecker2@mhs.com', role: 'Vitals Checker', department: 'Clinical', name: 'Daniel', surname: 'Martin', idNumber: 'VIT002', phoneNumber: '+266-5000-0502' },
  { email: 'vitalschecker3@mhs.com', role: 'Vitals Checker', department: 'Clinical', name: 'Michelle', surname: 'Thompson', idNumber: 'VIT003', phoneNumber: '+266-5000-0503' },
  { email: 'vitalschecker4@mhs.com', role: 'Vitals Checker', department: 'Clinical', name: 'Kevin', surname: 'Garcia', idNumber: 'VIT004', phoneNumber: '+266-5000-0504' },
  
  // OPD Nurses
  { email: 'nurse1@mhs.com', role: 'Nurse', department: 'OPD', wardType: 'OPD', name: 'Linda', surname: 'Martinez', idNumber: 'NUR001', phoneNumber: '+266-5000-0601' },
  { email: 'nurse2@mhs.com', role: 'Nurse', department: 'OPD', wardType: 'OPD', name: 'Barbara', surname: 'Rodriguez', idNumber: 'NUR002', phoneNumber: '+266-5000-0602' },
  { email: 'nurse3@mhs.com', role: 'Nurse', department: 'OPD', wardType: 'OPD', name: 'Susan', surname: 'Lewis', idNumber: 'NUR003', phoneNumber: '+266-5000-0603' },
  { email: 'nurse4@mhs.com', role: 'Nurse', department: 'OPD', wardType: 'OPD', name: 'Dorothy', surname: 'Lee', idNumber: 'NUR004', phoneNumber: '+266-5000-0604' },
  { email: 'nurse5@mhs.com', role: 'Nurse', department: 'OPD', wardType: 'OPD', name: 'Lisa', surname: 'Walker', idNumber: 'NUR005', phoneNumber: '+266-5000-0605' },
  { email: 'nurse6@mhs.com', role: 'Nurse', department: 'OPD', wardType: 'OPD', name: 'Nancy', surname: 'Hall', idNumber: 'NUR006', phoneNumber: '+266-5000-0606' },
  { email: 'nurse7@mhs.com', role: 'Nurse', department: 'OPD', wardType: 'OPD', name: 'Karen', surname: 'Allen', idNumber: 'NUR007', phoneNumber: '+266-5000-0607' },
  { email: 'nurse8@mhs.com', role: 'Nurse', department: 'OPD', wardType: 'OPD', name: 'Betty', surname: 'Young', idNumber: 'NUR008', phoneNumber: '+266-5000-0608' },
  { email: 'nurse9@mhs.com', role: 'Nurse', department: 'OPD', wardType: 'OPD', name: 'Helen', surname: 'Hernandez', idNumber: 'NUR009', phoneNumber: '+266-5000-0609' },
  { email: 'nurse10@mhs.com', role: 'Nurse', department: 'OPD', wardType: 'OPD', name: 'Sandra', surname: 'King', idNumber: 'NUR010', phoneNumber: '+266-5000-0610' },
  
  // FCH Ward Nurses
  { email: 'fch1@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Donna', surname: 'Wright', idNumber: 'FCH001', phoneNumber: '+266-5000-0701' },
  { email: 'fch2@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Carol', surname: 'Lopez', idNumber: 'FCH002', phoneNumber: '+266-5000-0702' },
  { email: 'fch3@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Ruth', surname: 'Hill', idNumber: 'FCH003', phoneNumber: '+266-5000-0703' },
  { email: 'fch4@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Sharon', surname: 'Scott', idNumber: 'FCH004', phoneNumber: '+266-5000-0704' },
  { email: 'fch5@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Michelle', surname: 'Green', idNumber: 'FCH005', phoneNumber: '+266-5000-0705' },
  { email: 'fch6@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Laura', surname: 'Adams', idNumber: 'FCH006', phoneNumber: '+266-5000-0706' },
  { email: 'fch7@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Sarah', surname: 'Baker', idNumber: 'FCH007', phoneNumber: '+266-5000-0707' },
  { email: 'fch8@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Kimberly', surname: 'Gonzalez', idNumber: 'FCH008', phoneNumber: '+266-5000-0708' },
  { email: 'fch9@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Deborah', surname: 'Nelson', idNumber: 'FCH009', phoneNumber: '+266-5000-0709' },
  { email: 'fch10@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Dorothy', surname: 'Carter', idNumber: 'FCH010', phoneNumber: '+266-5000-0710' },
  { email: 'fch11@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Lisa', surname: 'Mitchell', idNumber: 'FCH011', phoneNumber: '+266-5000-0711' },
  { email: 'fch12@mhs.com', role: 'Nurse', department: 'FCH Ward', wardType: 'FCH', name: 'Nancy', surname: 'Perez', idNumber: 'FCH012', phoneNumber: '+266-5000-0712' },
  
  // Maternity Nurses (30 users)
  { email: 'maternity1@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Angela', surname: 'Roberts', idNumber: 'MAT001', phoneNumber: '+266-5000-0801' },
  { email: 'maternity2@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Brenda', surname: 'Turner', idNumber: 'MAT002', phoneNumber: '+266-5000-0802' },
  { email: 'maternity3@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Emma', surname: 'Phillips', idNumber: 'MAT003', phoneNumber: '+266-5000-0803' },
  { email: 'maternity4@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Olivia', surname: 'Campbell', idNumber: 'MAT004', phoneNumber: '+266-5000-0804' },
  { email: 'maternity5@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Ava', surname: 'Parker', idNumber: 'MAT005', phoneNumber: '+266-5000-0805' },
  { email: 'maternity6@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Isabella', surname: 'Evans', idNumber: 'MAT006', phoneNumber: '+266-5000-0806' },
  { email: 'maternity7@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Sophia', surname: 'Edwards', idNumber: 'MAT007', phoneNumber: '+266-5000-0807' },
  { email: 'maternity8@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Charlotte', surname: 'Collins', idNumber: 'MAT008', phoneNumber: '+266-5000-0808' },
  { email: 'maternity9@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Mia', surname: 'Stewart', idNumber: 'MAT009', phoneNumber: '+266-5000-0809' },
  { email: 'maternity10@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Amelia', surname: 'Sanchez', idNumber: 'MAT010', phoneNumber: '+266-5000-0810' },
  { email: 'maternity11@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Harper', surname: 'Morris', idNumber: 'MAT011', phoneNumber: '+266-5000-0811' },
  { email: 'maternity12@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Evelyn', surname: 'Rogers', idNumber: 'MAT012', phoneNumber: '+266-5000-0812' },
  { email: 'maternity13@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Abigail', surname: 'Reed', idNumber: 'MAT013', phoneNumber: '+266-5000-0813' },
  { email: 'maternity14@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Emily', surname: 'Cook', idNumber: 'MAT014', phoneNumber: '+266-5000-0814' },
  { email: 'maternity15@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Elizabeth', surname: 'Morgan', idNumber: 'MAT015', phoneNumber: '+266-5000-0815' },
  { email: 'maternity16@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Sofia', surname: 'Bell', idNumber: 'MAT016', phoneNumber: '+266-5000-0816' },
  { email: 'maternity17@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Avery', surname: 'Murphy', idNumber: 'MAT017', phoneNumber: '+266-5000-0817' },
  { email: 'maternity18@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Ella', surname: 'Bailey', idNumber: 'MAT018', phoneNumber: '+266-5000-0818' },
  { email: 'maternity19@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Scarlett', surname: 'Rivera', idNumber: 'MAT019', phoneNumber: '+266-5000-0819' },
  { email: 'maternity20@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Grace', surname: 'Cooper', idNumber: 'MAT020', phoneNumber: '+266-5000-0820' },
  { email: 'maternity21@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Chloe', surname: 'Richardson', idNumber: 'MAT021', phoneNumber: '+266-5000-0821' },
  { email: 'maternity22@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Victoria', surname: 'Cox', idNumber: 'MAT022', phoneNumber: '+266-5000-0822' },
  { email: 'maternity23@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Penelope', surname: 'Howard', idNumber: 'MAT023', phoneNumber: '+266-5000-0823' },
  { email: 'maternity24@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Layla', surname: 'Ward', idNumber: 'MAT024', phoneNumber: '+266-5000-0824' },
  { email: 'maternity25@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Riley', surname: 'Torres', idNumber: 'MAT025', phoneNumber: '+266-5000-0825' },
  { email: 'maternity26@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Zoey', surname: 'Peterson', idNumber: 'MAT026', phoneNumber: '+266-5000-0826' },
  { email: 'maternity27@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Nora', surname: 'Gray', idNumber: 'MAT027', phoneNumber: '+266-5000-0827' },
  { email: 'maternity28@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Lily', surname: 'Ramirez', idNumber: 'MAT028', phoneNumber: '+266-5000-0828' },
  { email: 'maternity29@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Eleanor', surname: 'James', idNumber: 'MAT029', phoneNumber: '+266-5000-0829' },
  { email: 'maternity30@mhs.com', role: 'Nurse', department: 'Maternity', wardType: 'Maternity', name: 'Hannah', surname: 'Watson', idNumber: 'MAT030', phoneNumber: '+266-5000-0830' },
  
  // Theatre Ward Nurses (15 users)
  { email: 'theatre1@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Lillian', surname: 'Brooks', idNumber: 'THE001', phoneNumber: '+266-5000-0901' },
  { email: 'theatre2@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Addison', surname: 'Kelly', idNumber: 'THE002', phoneNumber: '+266-5000-0902' },
  { email: 'theatre3@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Natalie', surname: 'Sanders', idNumber: 'THE003', phoneNumber: '+266-5000-0903' },
  { email: 'theatre4@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Maya', surname: 'Price', idNumber: 'THE004', phoneNumber: '+266-5000-0904' },
  { email: 'theatre5@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Leah', surname: 'Bennett', idNumber: 'THE005', phoneNumber: '+266-5000-0905' },
  { email: 'theatre6@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Zoe', surname: 'Wood', idNumber: 'THE006', phoneNumber: '+266-5000-0906' },
  { email: 'theatre7@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Samantha', surname: 'Barnes', idNumber: 'THE007', phoneNumber: '+266-5000-0907' },
  { email: 'theatre8@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Audrey', surname: 'Ross', idNumber: 'THE008', phoneNumber: '+266-5000-0908' },
  { email: 'theatre9@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Claire', surname: 'Henderson', idNumber: 'THE009', phoneNumber: '+266-5000-0909' },
  { email: 'theatre10@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Lucy', surname: 'Coleman', idNumber: 'THE010', phoneNumber: '+266-5000-0910' },
  { email: 'theatre11@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Anna', surname: 'Jenkins', idNumber: 'THE011', phoneNumber: '+266-5000-0911' },
  { email: 'theatre12@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Violet', surname: 'Perry', idNumber: 'THE012', phoneNumber: '+266-5000-0912' },
  { email: 'theatre13@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Savannah', surname: 'Powell', idNumber: 'THE013', phoneNumber: '+266-5000-0913' },
  { email: 'theatre14@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Brooklyn', surname: 'Long', idNumber: 'THE014', phoneNumber: '+266-5000-0914' },
  { email: 'theatre15@mhs.com', role: 'Nurse', department: 'Theatre Ward', wardType: 'Theatre', name: 'Bella', surname: 'Hughes', idNumber: 'THE015', phoneNumber: '+266-5000-0915' },
  
  // Female Ward Nurses (20 users)
  { email: 'female1@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Aria', surname: 'Flores', idNumber: 'FEM001', phoneNumber: '+266-5000-1001' },
  { email: 'female2@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Genesis', surname: 'Washington', idNumber: 'FEM002', phoneNumber: '+266-5000-1002' },
  { email: 'female3@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Aaliyah', surname: 'Butler', idNumber: 'FEM003', phoneNumber: '+266-5000-1003' },
  { email: 'female4@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Kennedy', surname: 'Simmons', idNumber: 'FEM004', phoneNumber: '+266-5000-1004' },
  { email: 'female5@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Kinsley', surname: 'Foster', idNumber: 'FEM005', phoneNumber: '+266-5000-1005' },
  { email: 'female6@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Allison', surname: 'Gonzales', idNumber: 'FEM006', phoneNumber: '+266-5000-1006' },
  { email: 'female7@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Gianna', surname: 'Bryant', idNumber: 'FEM007', phoneNumber: '+266-5000-1007' },
  { email: 'female8@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Skylar', surname: 'Alexander', idNumber: 'FEM008', phoneNumber: '+266-5000-1008' },
  { email: 'female9@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Paisley', surname: 'Russell', idNumber: 'FEM009', phoneNumber: '+266-5000-1009' },
  { email: 'female10@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Brooklyn', surname: 'Griffin', idNumber: 'FEM010', phoneNumber: '+266-5000-1010' },
  { email: 'female11@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Peyton', surname: 'Diaz', idNumber: 'FEM011', phoneNumber: '+266-5000-1011' },
  { email: 'female12@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Nova', surname: 'Hayes', idNumber: 'FEM012', phoneNumber: '+266-5000-1012' },
  { email: 'female13@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Ariana', surname: 'Myers', idNumber: 'FEM013', phoneNumber: '+266-5000-1013' },
  { email: 'female14@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Elena', surname: 'Ford', idNumber: 'FEM014', phoneNumber: '+266-5000-1014' },
  { email: 'female15@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Caroline', surname: 'Hamilton', idNumber: 'FEM015', phoneNumber: '+266-5000-1015' },
  { email: 'female16@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Eliana', surname: 'Graham', idNumber: 'FEM016', phoneNumber: '+266-5000-1016' },
  { email: 'female17@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Anna', surname: 'Sullivan', idNumber: 'FEM017', phoneNumber: '+266-5000-1017' },
  { email: 'female18@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Maya', surname: 'Wallace', idNumber: 'FEM018', phoneNumber: '+266-5000-1018' },
  { email: 'female19@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Valentina', surname: 'Woods', idNumber: 'FEM019', phoneNumber: '+266-5000-1019' },
  { email: 'female20@mhs.com', role: 'Nurse', department: 'Female Ward', wardType: 'Female', name: 'Ruby', surname: 'Cole', idNumber: 'FEM020', phoneNumber: '+266-5000-1020' },
  
  // Male Ward Nurses (20 users)
  { email: 'male1@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Liam', surname: 'West', idNumber: 'MAL001', phoneNumber: '+266-5000-1101' },
  { email: 'male2@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Noah', surname: 'Tucker', idNumber: 'MAL002', phoneNumber: '+266-5000-1102' },
  { email: 'male3@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Oliver', surname: 'Wells', idNumber: 'MAL003', phoneNumber: '+266-5000-1103' },
  { email: 'male4@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Elijah', surname: 'Barnes', idNumber: 'MAL004', phoneNumber: '+266-5000-1104' },
  { email: 'male5@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'William', surname: 'Ross', idNumber: 'MAL005', phoneNumber: '+266-5000-1105' },
  { email: 'male6@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'James', surname: 'Henderson', idNumber: 'MAL006', phoneNumber: '+266-5000-1106' },
  { email: 'male7@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Benjamin', surname: 'Coleman', idNumber: 'MAL007', phoneNumber: '+266-5000-1107' },
  { email: 'male8@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Lucas', surname: 'Jenkins', idNumber: 'MAL008', phoneNumber: '+266-5000-1108' },
  { email: 'male9@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Henry', surname: 'Perry', idNumber: 'MAL009', phoneNumber: '+266-5000-1109' },
  { email: 'male10@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Alexander', surname: 'Powell', idNumber: 'MAL010', phoneNumber: '+266-5000-1110' },
  { email: 'male11@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Mason', surname: 'Long', idNumber: 'MAL011', phoneNumber: '+266-5000-1111' },
  { email: 'male12@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Michael', surname: 'Patterson', idNumber: 'MAL012', phoneNumber: '+266-5000-1112' },
  { email: 'male13@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Ethan', surname: 'Hughes', idNumber: 'MAL013', phoneNumber: '+266-5000-1113' },
  { email: 'male14@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Daniel', surname: 'Flores', idNumber: 'MAL014', phoneNumber: '+266-5000-1114' },
  { email: 'male15@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Jacob', surname: 'Washington', idNumber: 'MAL015', phoneNumber: '+266-5000-1115' },
  { email: 'male16@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Logan', surname: 'Butler', idNumber: 'MAL016', phoneNumber: '+266-5000-1116' },
  { email: 'male17@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Jackson', surname: 'Simmons', idNumber: 'MAL017', phoneNumber: '+266-5000-1117' },
  { email: 'male18@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Sebastian', surname: 'Foster', idNumber: 'MAL018', phoneNumber: '+266-5000-1118' },
  { email: 'male19@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Jack', surname: 'Gonzales', idNumber: 'MAL019', phoneNumber: '+266-5000-1119' },
  { email: 'male20@mhs.com', role: 'Nurse', department: 'Male Ward', wardType: 'Male', name: 'Aiden', surname: 'Bryant', idNumber: 'MAL020', phoneNumber: '+266-5000-1120' },
  
  // Children Ward Nurses (20 users)
  { email: 'children1@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Owen', surname: 'Alexander', idNumber: 'CHI001', phoneNumber: '+266-5000-1201' },
  { email: 'children2@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Luke', surname: 'Russell', idNumber: 'CHI002', phoneNumber: '+266-5000-1202' },
  { email: 'children3@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Gabriel', surname: 'Griffin', idNumber: 'CHI003', phoneNumber: '+266-5000-1203' },
  { email: 'children4@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Anthony', surname: 'Diaz', idNumber: 'CHI004', phoneNumber: '+266-5000-1204' },
  { email: 'children5@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Isaac', surname: 'Hayes', idNumber: 'CHI005', phoneNumber: '+266-5000-1205' },
  { email: 'children6@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Grayson', surname: 'Myers', idNumber: 'CHI006', phoneNumber: '+266-5000-1206' },
  { email: 'children7@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Julian', surname: 'Ford', idNumber: 'CHI007', phoneNumber: '+266-5000-1207' },
  { email: 'children8@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Mateo', surname: 'Hamilton', idNumber: 'CHI008', phoneNumber: '+266-5000-1208' },
  { email: 'children9@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Adam', surname: 'Graham', idNumber: 'CHI009', phoneNumber: '+266-5000-1209' },
  { email: 'children10@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Ezra', surname: 'Sullivan', idNumber: 'CHI010', phoneNumber: '+266-5000-1210' },
  { email: 'children11@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Thomas', surname: 'Wallace', idNumber: 'CHI011', phoneNumber: '+266-5000-1211' },
  { email: 'children12@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Charles', surname: 'Woods', idNumber: 'CHI012', phoneNumber: '+266-5000-1212' },
  { email: 'children13@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Christopher', surname: 'Cole', idNumber: 'CHI013', phoneNumber: '+266-5000-1213' },
  { email: 'children14@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Joshua', surname: 'West', idNumber: 'CHI014', phoneNumber: '+266-5000-1214' },
  { email: 'children15@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Matthew', surname: 'Tucker', idNumber: 'CHI015', phoneNumber: '+266-5000-1215' },
  { email: 'children16@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Andrew', surname: 'Wells', idNumber: 'CHI016', phoneNumber: '+266-5000-1216' },
  { email: 'children17@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Joshua', surname: 'Barnes', idNumber: 'CHI017', phoneNumber: '+266-5000-1217' },
  { email: 'children18@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Nathan', surname: 'Ross', idNumber: 'CHI018', phoneNumber: '+266-5000-1218' },
  { email: 'children19@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Adrian', surname: 'Henderson', idNumber: 'CHI019', phoneNumber: '+266-5000-1219' },
  { email: 'children20@mhs.com', role: 'Nurse', department: 'Children Ward', wardType: 'Children', name: 'Ryan', surname: 'Coleman', idNumber: 'CHI020', phoneNumber: '+266-5000-1220' },
  
  // Laboratory Technicians
  { email: 'laboratorytechnician1@mhs.com', role: 'Laboratory Technician', department: 'Laboratory', name: 'Mark', surname: 'Jenkins', idNumber: 'LAB001', phoneNumber: '+266-5000-1301' },
  { email: 'laboratorytechnician2@mhs.com', role: 'Laboratory Technician', department: 'Laboratory', name: 'Steven', surname: 'Perry', idNumber: 'LAB002', phoneNumber: '+266-5000-1302' },
  { email: 'laboratorytechnician3@mhs.com', role: 'Laboratory Technician', department: 'Laboratory', name: 'Paul', surname: 'Powell', idNumber: 'LAB003', phoneNumber: '+266-5000-1303' },
  { email: 'laboratorytechnician4@mhs.com', role: 'Laboratory Technician', department: 'Laboratory', name: 'Kenneth', surname: 'Long', idNumber: 'LAB004', phoneNumber: '+266-5000-1304' },
  
  // Pharmacy Technicians
  { email: 'pharmacytechnician1@mhs.com', role: 'Pharmacy Technician', department: 'Pharmacy', name: 'Joshua', surname: 'Patterson', idNumber: 'PHA001', phoneNumber: '+266-5000-1401' },
  { email: 'pharmacytechnician2@mhs.com', role: 'Pharmacy Technician', department: 'Pharmacy', name: 'Kevin', surname: 'Hughes', idNumber: 'PHA002', phoneNumber: '+266-5000-1402' },
  
  // Dispensary Assistants
  { email: 'dispensaryassistant1@mhs.com', role: 'Dispensary Assistant', department: 'Pharmacy', name: 'Brian', surname: 'Flores', idNumber: 'DIS001', phoneNumber: '+266-5000-1501' },
  { email: 'dispensaryassistant2@mhs.com', role: 'Dispensary Assistant', department: 'Pharmacy', name: 'Edward', surname: 'Washington', idNumber: 'DIS002', phoneNumber: '+266-5000-1502' },
  { email: 'dispensaryassistant3@mhs.com', role: 'Dispensary Assistant', department: 'Pharmacy', name: 'Ronald', surname: 'Butler', idNumber: 'DIS003', phoneNumber: '+266-5000-1503' },
  { email: 'dispensaryassistant4@mhs.com', role: 'Dispensary Assistant', department: 'Pharmacy', name: 'Timothy', surname: 'Simmons', idNumber: 'DIS004', phoneNumber: '+266-5000-1504' },
  { email: 'dispensaryassistant5@mhs.com', role: 'Dispensary Assistant', department: 'Pharmacy', name: 'Jason', surname: 'Foster', idNumber: 'DIS005', phoneNumber: '+266-5000-1505' },
  
  // Radiologists
  { email: 'radiologist1@mhs.com', role: 'Radiologist', department: 'Radiology', name: 'Jeffrey', surname: 'Gonzales', idNumber: 'RAD001', phoneNumber: '+266-5000-1601' },
  { email: 'radiologist2@mhs.com', role: 'Radiologist', department: 'Radiology', name: 'Ryan', surname: 'Bryant', idNumber: 'RAD002', phoneNumber: '+266-5000-1602' },
  
  // Rehabilitation Technicians
  { email: 'rehabilitationtechnician1@mhs.com', role: 'Rehabilitation Technician', department: 'Rehabilitation', name: 'Jacob', surname: 'Alexander', idNumber: 'REH001', phoneNumber: '+266-5000-1701' },
  { email: 'rehabilitationtechnician2@mhs.com', role: 'Rehabilitation Technician', department: 'Rehabilitation', name: 'Gary', surname: 'Russell', idNumber: 'REH002', phoneNumber: '+266-5000-1702' },
  { email: 'rehabilitationtechnician3@mhs.com', role: 'Rehabilitation Technician', department: 'Rehabilitation', name: 'Nicholas', surname: 'Griffin', idNumber: 'REH003', phoneNumber: '+266-5000-1703' }
]

const createUser = async (userData) => {
  try {
    const { email, role, department, wardType, name, surname, idNumber, phoneNumber } = userData
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password: 'mhs2025',
      displayName: `${name} ${surname}`,
      emailVerified: true
    })

    // Set custom claims for role-based access
    await auth.setCustomUserClaims(userRecord.uid, {
      role,
      department,
      wardType: wardType || null,
      isActive: true
    })

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      fullName: `${name} ${surname}`,
      name,
      surname,
      idNumber,
      phoneNumber,
      role,
      department,
      wardType: wardType || null,
      isActive: true,
      profileCompleted: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null
    })

    console.log(`✅ Created user: ${email} (${role})`)
    return userRecord
  } catch (error) {
    console.error(`❌ Failed to create user ${userData.email}:`, error.message)
    throw error
  }
}

const seedUsers = async () => {
  console.log('🚀 Starting user seeding process...')
  console.log('📊 Total users to create:', usersToCreate.length)

  let totalCreated = 0

  try {
    for (const userData of usersToCreate) {
      try {
        await createUser(userData)
        totalCreated++
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`)
        } else {
          console.error(`❌ Failed to create ${userData.email}:`, error.message)
        }
      }
    }

    // Create app configuration documents
    console.log('\n🏥 Setting up application configuration...')
    
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
    })

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
    })

    console.log('✅ Application configuration created')
    console.log('\n🎉 User seeding completed successfully!')
    console.log(`📈 Total users created: ${totalCreated}`)
    console.log('\n🔐 Login credentials:')
    console.log('   Default password for all users: mhs2025')
    console.log('\n📧 Sample login emails:')
    console.log('   Admin: admin@mhs.com')
    console.log('   Doctor: doctor1@mhs.com - doctor5@mhs.com')
    console.log('   Accounts Clerk: accountsclerk1@mhs.com - accountsclerk5@mhs.com')
    console.log('   Nurse: nurse1@mhs.com - nurse10@mhs.com (OPD)')
    console.log('   Lab Technician: laboratorytechnician1@mhs.com - laboratorytechnician4@mhs.com')
    console.log('\n✨ System is ready for use!')

  } catch (error) {
    console.error('❌ Seeding process failed:', error)
    throw error
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    await seedUsers()

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'User seeding completed successfully!',
        totalCreated: usersToCreate.length
      })
    }

  } catch (error) {
    console.error('Seeding process failed:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Seeding process failed', 
        details: error.message 
      })
    }
  }
}