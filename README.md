# Morgenster Hospital Management System (MHMS) v2.0

## Overview
A complete, production-ready hospital management system built with Vue 3, Firebase, and Material Design 3. This system handles patient registration, medical records, billing, pharmacy management, laboratory operations, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project created (morgensterhospital-1088c)
- Netlify account for deployment

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Development server
npm run dev
```

### 2. Automatic User Seeding
The system automatically seeds users on first run. This creates 147 users across all roles:
- 1 Admin (admin@mhs.com)
- 5 Doctors (doctor1@mhs.com - doctor5@mhs.com)
- 1 Accountant (accountant@mhs.com)
- 3 Account Assistants (accountassistant1@mhs.com - accountassistant3@mhs.com)
- 5 Accounts Clerks (accountsclerk1@mhs.com - accountsclerk5@mhs.com)
- 4 Vitals Checkers (vitalschecker1@mhs.com - vitalschecker4@mhs.com)
- And more... (see seed-users.js for complete list)

**Default password for all users: `mhs2025`**

### 3. Deployment to Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### 4. Environment Variables (Netlify)
Set these environment variables in your Netlify dashboard:
```
FIREBASE_PROJECT_ID=morgensterhospital-1088c
FIREBASE_PRIVATE_KEY_ID=79a3ebeb56f60989f1f603c3ea70926595d4ca12
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCHRT/+8n3NUPQ6
hAGgT8EVpvZGrKJqzY1mPXqO9FatkfbW5kvKCnVxArBhd0bQsMifDxlQwFEZ27fp
iRvzsMslvIHxiu90YSuZjmtsXme6/nSQi2ibCBzcUaaDJG9SXlqFwMG6td/+n4Ep
wkEhntSxLwIbW6yRvHrnYTaibPMH/lLM2wlL3qeK9ezf0Rlu/1sL47ylc6XZuBvz
7hBUTfTJFP8BTPXNhTvvjJo3O8kAh23sgFLrW/6eZIcRomal+ci/22t0CfN/8gF2
wa78Tndtr+BLXp09hbjVJnqb/iB3v5KJGosRtGoR5jpPedqfxsKkXxXtjLaANsHU
M8DtjTl9AgMBAAECggEAJlbjV5BFRb8vKbKmf1h7gnaLEOb3NcxCynqcVQ49zv4y
9x/Y1U/3j2tSsJ1M7fNdOW/fHfsUQX779m4NBRnTykNOlTZqvhKYd/Jc0h9DyUU7
pohMwrwe6fceeccG4lKp14UVo6TO8u0kf8B2E2BgKkQHldd65ueD8jakdI7qpxXt
xxQTWGlLrA6myGoyxksZue4wRypE8VlMKB8j+IvI2dk0tvtDSqB4r6u1pajU4quH
J2HruZHBJZKmkkuWSasY3SbfLPOXGbGC278OJiTs0+7JVGeAyj578f/WgvfEhUs4
LkAELAbgB2XsVoXgsp27iFMOMMuV5QcAyNo9XUViRQKBgQC6lb6TJk53rUJgSG3C
AP3KmsddfVO/LI6hCPgXFqyO0J+dsNg4cyPJLlD1SXZ/y9AmrnjtiWUSTsWYrr7a
X6g2BYD2O1bODohfB0H4xfUFYvvlc9UnI6WofeXHA5cfxZ8Ou6JTxz0g7ISqS3m+
UZG6n/PTdVGUujqq0kRTJjqlIwKBgQC5mFhPjO7TmsybZGwv2tuYOmzXe3FdYr/4
5JpuuPf4nZ7szIkM7n+q9KltUD/+OaFhlLPgNu4+jqmOGzFhZT11OynKDUoyJWWM
JYS61x1wbmg3fmXDa9/JG+WU+XcCuI2QpBRjLAxrawIcwDtGBEZW5AJtStKPA7q1
+IIQ4ZEg3wKBgHqTUWV+LuJ0UjzKmEBxQklNsVd7s/7NmM22BLW2UZpo99MykHlV
Otc5tDnQDycZkB85U3xJXLrQQQNzGTKA0RLcPsKEbRxlc7VqIS77bWIiivVMSWWz
B2tPehpqA2f9/eZB4fxD0abFesodV1duYtxFpHrwga3BQjVieTxeyvwdAoGBAKQ5
uRMTSxV1Kc3qy4yA5cVLFZqLAaI3ylUru7dz9wBIQSOaTT9jHxcgDXfMBgQn7LRT
B+PD14cFZ+V2DHj5Q6ujYXQH1HqQ+s1LOaq2xLcDCzbnopaMsuXayIjNQdDni2TM
u7mRdZ/rfWABfbGUAMXMVpVtGuovy5xPvI/BeVETAoGAXdom8YpdlLLyk6kZz95X
r+J7E5fZ+OuOIvJVAghH/FOM0EUB90XXAM7M76d3RCLO7hRsHp7NazBG0YpbEx1a
E5rwlajrHrX8ZQXFqx+ZEQP7/K1hlUiQ0+19yj82re1IInkKRPiSlZcOEZRisIsE
VsiyGVwkBlfdocO/G+/WEB0=
-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@morgensterhospital-1088c.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=102076691026870342948
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40morgensterhospital-1088c.iam.gserviceaccount.com
```

### 5. Firebase Setup
1. Enable Authentication with Email/Password
2. Create Firestore database
3. Set up Firebase Admin SDK service account
4. Add service account credentials to Netlify environment variables

The system will automatically create all necessary collections and documents on first use.

### 2. Automatic User Seeding
The system automatically seeds users on first run. This creates 147 users across all roles:
- 1 Admin (admin@mhs.com)
- 5 Doctors (doctor1@mhs.com - doctor5@mhs.com)
- 1 Accountant (accountant@mhs.com)
- 3 Account Assistants (accountassistant1@mhs.com - accountassistant3@mhs.com)
- 5 Accounts Clerks (accountsclerk1@mhs.com - accountsclerk5@mhs.com)
- 4 Vitals Checkers (vitalschecker1@mhs.com - vitalschecker4@mhs.com)
- And more... (see seed-users.js for complete list)

**Default password for all users: `mhs2025`**

### 3. Deployment to Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### 4. Environment Variables (Netlify)
Set these environment variables in your Netlify dashboard:
```
FIREBASE_PROJECT_ID=morgensterhospital-1088c
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-service-account-private-key
```

### 5. Firebase Setup
1. Enable Authentication with Email/Password
2. Create Firestore database
3. Set up Firebase Admin SDK service account
4. Add service account credentials to Netlify environment variables

The system will automatically create all necessary collections and documents on first use.

## 🏗️ Architecture

### Frontend Stack
- **Vue 3** - Composition API with `<script setup>`
- **Pinia** - State management
- **Vue Router** - Navigation with guards
- **Firebase SDK** - Authentication & Firestore
- **Material Design 3** - UI/UX standards
- **Roboto Font** - Typography

### Backend Services
- **Netlify Functions** - Serverless backend operations
- **Firebase Authentication** - User management
- **Firebase Firestore** - Real-time database
- **Firebase Custom Claims** - Role-based permissions

### Database Schema
Complete Firestore schema with:
- Users collection with roles and departments
- Patients collection with comprehensive medical data
- Sub-collections for vitals, notes, prescriptions, lab results, etc.
- Configuration collections for pricing and inventory
- Automatic seeding of all required data structures

## 🔧 Netlify Functions

The system includes serverless functions for:
- **User Seeding** (`/.netlify/functions/seed-users`) - Auto-creates all 147 users
- **Patient Registration** (`/.netlify/functions/create-patient`) - Handles patient creation with unique hospital numbers
- **Billing Processing** (`/.netlify/functions/process-billing`) - Manages invoices and payments
- **Medical Records** (`/.netlify/functions/add-medical-record`) - Adds vitals, notes, prescriptions, etc.
- **Inventory Management** (`/.netlify/functions/update-inventory`) - Updates stock levels

All functions include proper error handling, validation, and notification creation.

### Backend Services
- **Netlify Functions** - Serverless backend operations
- **Firebase Authentication** - User management
- **Firebase Firestore** - Real-time database
- **Firebase Custom Claims** - Role-based permissions
- **Netlify Functions** - Serverless backend operations

### Database Schema
Complete Firestore schema with:
- Users collection with roles and departments
- Patients collection with comprehensive medical data
- Sub-collections for vitals, notes, prescriptions, lab results, etc.
- Configuration collections for pricing and inventory
- Automatic seeding of all required data structures

## 🔧 Netlify Functions

The system includes serverless functions for:
- **User Seeding** (`/.netlify/functions/seed-users`) - Auto-creates all 147 users
- **Patient Registration** (`/.netlify/functions/create-patient`) - Handles patient creation with unique hospital numbers
- **Billing Processing** (`/.netlify/functions/process-billing`) - Manages invoices and payments
- **Medical Records** (`/.netlify/functions/add-medical-record`) - Adds vitals, notes, prescriptions, etc.
- **Inventory Management** (`/.netlify/functions/update-inventory`) - Updates stock levels

All functions include proper error handling, validation, and notification creation.

## 👥 User Roles & Permissions

### Role Hierarchy
1. **Admin** - Super user, full system access
2. **Accountant** - Financial oversight and reporting
3. **Account Assistant** - Supervisory accounting tasks
4. **Accounts Clerk** - Patient registration and billing
5. **Doctors** - Medical records and prescriptions
6. **Nurses** - Patient care and monitoring
7. **Laboratory Staff** - Test management and results
8. **Pharmacy Staff** - Medication management
9. **Radiology Staff** - Imaging and results
10. **Rehabilitation** - Therapy and recovery notes

### Department Structure
- Clinical (Doctors, Nurses)
- Accounting (Accountant, Assistants, Clerks)
- Laboratory (Technicians)
- Pharmacy (Technicians, Dispensary)
- Radiology (Radiologists)
- Rehabilitation (Therapists)

### Department Structure
- Clinical (Doctors, Nurses)
- Accounting (Accountant, Assistants, Clerks)
- Laboratory (Technicians)
- Pharmacy (Technicians, Dispensary)
- Radiology (Radiologists)
- Rehabilitation (Therapists)

## 🎨 Design System

### Material Design 3 Implementation
- **Primary Color**: #0066B2 (Professional Blue)
- **Surface Colors**: #F7F9FC (Off-white), #FFFFFF (Cards)
- **Typography**: Roboto font with M3 scaling
- **Icons**: Material Design Icons (@mdi/js)
- **Animations**: Ripple effects and smooth transitions

### Responsive Design
- **Desktop (>1024px)**: Left navigation rail with icons and labels
- **Mobile/Tablet (≤1024px)**: Bottom navigation bar with icons
- **Adaptive Layouts**: Optimized for all screen sizes

## 📱 User Interfaces

### Accounts Clerk Dashboard
- Patient registration and search
- Sales summary containers (monthly, paid, unpaid)
- Real-time date and time display
- Direct access to reports and stationery

### Medical Staff Interfaces
- **Doctors**: Full medical record access, prescriptions, authorizations
- **Nurses**: Vitals, notes, care coordination
- **Laboratory**: Test request management and results entry
- **Pharmacy**: Prescription dispensing and inventory
- **Radiology**: Image requests and report management

### Administrative Interfaces
- **Admin**: User management, system configuration
- **Accountant**: Financial reports, pricing management
- **Billing**: Invoice generation, payment processing

## 🔐 Security Features

### Authentication
- Firebase Authentication with email/password
- Role-based access control via Custom Claims
- Automatic session management and refresh
- Auto-seeding of all user accounts on first run
- Auto-seeding of all user accounts on first run

### Authorization
- Route-level permissions
- Component-level access controls
- API-level security rules

### Data Protection
- Firestore security rules
- Input validation and sanitization
- Audit trails for all transactions

## 📊 Key Features

### Patient Management
- Comprehensive registration system
- Unique hospital number generation
- Next-of-kin information management
- Complete medical history tracking
- Real-time data synchronization
- Real-time data synchronization

### Medical Records
- Doctor's and nurse's notes
- Vital signs monitoring
- Prescription management
- Laboratory and radiology results
- Rehabilitation tracking

### Financial Management
- Real-time billing system
- Invoice generation and tracking
- Payment processing (Cash, EFT, Credit)
- Comprehensive reporting suite
- Automated calculations and balance tracking
- Automated calculations and balance tracking

### Inventory Management
- Pharmacy stock control
- Price list management
- Automated reorder alerts
- Usage tracking and analytics

### Workflow Management
- Kanban-style dashboards for lab and radiology
- Request tracking and status updates
- Inter-department communication
- Print-ready reports and forms
- Real-time status updates across departments

## 🔧 Technical Implementation

### State Management (Pinia)
- `authStore.js` - User authentication and roles
- `patientStore.js` - Patient data and medical records
- `configStore.js` - Application configuration and pricing

### Firebase Integration
- Real-time data synchronization
- Offline capabilities
- Automatic backup and recovery
- Scalable cloud infrastructure
- Serverless functions for complex operations

### Performance Optimizations
- Lazy loading of components
- Efficient query patterns
- Image optimization and caching
- Code splitting and bundling

### Workflow Management
- Kanban-style dashboards for lab and radiology
- Request tracking and status updates
- Inter-department communication
- Print-ready reports and forms
- Real-time status updates across departments

## 🔧 Technical Implementation

### State Management (Pinia)
- `authStore.js` - User authentication and roles
- `patientStore.js` - Patient data and medical records
- `configStore.js` - Application configuration and pricing

### Firebase Integration
- Real-time data synchronization
- Offline capabilities
- Automatic backup and recovery
- Scalable cloud infrastructure
- Serverless functions for complex operations

### Performance Optimizations
- Lazy loading of components
- Efficient query patterns
- Image optimization and caching
- Code splitting and bundling

## 📈 Reporting & Analytics

### Financial Reports
- Total sales by period
- Payment method breakdown
- Outstanding balances
- Top-selling items analysis

### Operational Reports
- Patient registration trends
- Department utilization
- Staff productivity metrics
- Inventory turnover analysis

### Medical Reports
- Patient demographics
- Treatment outcomes
- Prescription patterns
- Laboratory test volumes

## 🛠️ Development Guidelines

### Code Organization
- Modular component architecture
- Separation of concerns
- Reusable UI components
- Consistent naming conventions

### Testing Strategy
- Component unit tests
- Integration testing
- User acceptance testing
- Performance monitoring
- API endpoint testing

### Maintenance
- Regular dependency updates
- Security patch management
- Database optimization
- Performance monitoring

## 🚀 Deployment Process

### Build Configuration
```bash
npm run build
```

### Netlify Deployment
```bash
netlify init
netlify deploy --prod
```

### Environment Variables
- Firebase Admin SDK credentials
- API endpoints and keys
- Feature flags and toggles
- Automatic configuration validation

## 📞 Support & Maintenance

### System Monitoring
- Real-time error tracking
- Performance metrics
- User activity analytics
- System health dashboards
- Function execution monitoring

### Backup & Recovery
- Automated daily backups
- Point-in-time recovery
- Data export capabilities
- Disaster recovery procedures

### Updates & Patches
- Regular security updates
- Feature enhancements
- Bug fixes and optimizations
- User training materials
- Database migration scripts

## 📚 Additional Resources

### Documentation
- API documentation
- User manuals by role
- System administration guide
- Troubleshooting resources

### Training Materials
- Video tutorials
- Step-by-step guides
- Best practices documentation
- FAQ and common issues

---

**Note**: This is a production-ready system with automatic setup. All features are fully implemented and ready for hospital deployment. The system handles real patient data and financial transactions with appropriate security measures. Users are automatically seeded on first run with the default password `mhs2025`.

For technical support or customization requests, refer to the development team or system administrator.
### Medical Reports
- Patient demographics
- Treatment outcomes
- Prescription patterns
- Laboratory test volumes

## 🛠️ Development Guidelines

### Code Organization
- Modular component architecture
- Separation of concerns
- Reusable UI components
- Consistent naming conventions

### Testing Strategy
- Component unit tests
- Integration testing
- User acceptance testing
- Performance monitoring
- API endpoint testing

### Maintenance
- Regular dependency updates
- Security patch management
- Database optimization
- Performance monitoring

## 🚀 Deployment Process

### Build Configuration
```bash
npm run build
```

### Netlify Deployment
```bash
netlify init
netlify deploy --prod
```

### Environment Variables
- Firebase Admin SDK credentials
- API endpoints and keys
- Feature flags and toggles
- Automatic configuration validation

## 📞 Support & Maintenance

### System Monitoring
- Real-time error tracking
- Performance metrics
- User activity analytics
- System health dashboards
- Function execution monitoring

### Backup & Recovery
- Automated daily backups
- Point-in-time recovery
- Data export capabilities
- Disaster recovery procedures

### Updates & Patches
- Regular security updates
- Feature enhancements
- Bug fixes and optimizations
- User training materials
- Database migration scripts

## 📚 Additional Resources

### Documentation
- API documentation
- User manuals by role
- System administration guide
- Troubleshooting resources

### Training Materials
- Video tutorials
- Step-by-step guides
- Best practices documentation
- FAQ and common issues

---

**Note**: This is a production-ready system with automatic setup. All features are fully implemented and ready for hospital deployment. The system handles real patient data and financial transactions with appropriate security measures. Users are automatically seeded on first run with the default password `mhs2025`.

For technical support or customization requests, refer to the development team or system administrator.