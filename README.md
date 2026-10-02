# 🦷 CareSlot — Clinic Appointment & Patient Management SaaS

**CareSlot** is a complete, production-quality Clinic Appointment & Patient Management SaaS web application built initially for dental clinics, with a clinic-agnostic architecture designed to support general and multi-specialty healthcare practices.

---

## 🌟 Key Highlights & Core Capabilities

- **Countertop QR Code Booking**: Patients scan a QR code on a clinic counter card or visit a custom booking link (`/book/:clinicSlug/:bookingSlug`) using their phone without needing to download an app or register an account.
- **Dynamic Drag-and-Drop Form Builder**: 18 field categories, reordering with `@dnd-kit`, validation rules, and **visual IF/THEN conditional logic** (e.g. *If "Has Allergies" is "Yes", show "Allergy Details"*).
- **Reusable Dynamic Form Renderer**: Identical rendering engine across Admin Desktop & Mobile Previews and the live patient booking wizard.
- **Intelligent Slot Generation Engine**: Real-time slot calculation based on Doctor Availability + Treatment Duration + Existing Bookings + Blocked Slots + Clinic Advance Booking limits.
- **Concurrency Collision & Double-Booking Prevention**: Backend-level verification guarantees that conflicting slots are rejected with atomic checks.
- **Live Reception Queue System**: Interactive waiting room queue with token sequencing (`#01`, `#02`, `#08`), wait time estimation, and receptionist controls (*Call Next*, *Skip*, *Complete*).
- **Multi-Tenant Architecture**: Strict tenant isolation across all models via verified `clinicId` derived from authenticated JWT sessions.
- **Multi-Channel Notification Abstraction**: Unified interface for WhatsApp, SMS, and Email with template merge variables (`{{patientName}}`, `{{doctorName}}`, `{{serviceName}}`, `{{date}}`, `{{time}}`, `{{clinicName}}`, `{{appointmentId}}`) and pluggable live/mock adapters.
- **Analytics & Calendar**: Day, Week, and Month calendar views with slot blocking; Recharts-powered graphs for appointment volume, patient retention, and doctor workloads.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React.js (v18), Vite |
| **Styling & Design** | Tailwind CSS, Lucide React Icons |
| **Routing & State** | React Router v6, TanStack Query |
| **Form Builder Engine** | `@dnd-kit/core`, `@dnd-kit/sortable`, React Hook Form, Zod |
| **Data Visualization** | Recharts |
| **QR Code Generation** | `qrcode` |
| **Backend Runtime** | Node.js (ES Modules), Express.js |
| **Database & ODM** | MongoDB, Mongoose |
| **Embedded DB Fallback** | `mongodb-memory-server` (Zero-config out-of-the-box local runner) |
| **Security & Auth** | JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors` |

---

## 📂 Folder Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Database connection with MongoMemoryServer fallback
│   │   │   └── env.js             # Environment variables and adapter configs
│   │   ├── controllers/           # REST API route handlers
│   │   │   ├── analyticsController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── authController.js
│   │   │   ├── availabilityController.js
│   │   │   ├── bookingPageController.js
│   │   │   ├── clinicController.js
│   │   │   ├── doctorController.js
│   │   │   ├── formController.js
│   │   │   ├── notificationController.js
│   │   │   ├── patientController.js
│   │   │   ├── publicBookingController.js
│   │   │   ├── queueController.js
│   │   │   └── serviceController.js
│   │   ├── middlewares/
│   │   │   ├── auth.js            # JWT auth, tenant isolation, and RBAC
│   │   │   └── errorHandler.js    # Mongoose, Zod, and HTTP error handler
│   │   ├── models/                # Normalized Mongoose schemas
│   │   │   ├── Appointment.js
│   │   │   ├── AuditLog.js
│   │   │   ├── Availability.js
│   │   │   ├── BlockedSlot.js
│   │   │   ├── BookingPage.js
│   │   │   ├── Clinic.js
│   │   │   ├── Doctor.js
│   │   │   ├── Form.js
│   │   │   ├── Notification.js
│   │   │   ├── NotificationTemplate.js
│   │   │   ├── Patient.js
│   │   │   ├── Queue.js
│   │   │   ├── Service.js
│   │   │   └── User.js
│   │   ├── routes/                # Express API routers
│   │   ├── services/
│   │   │   ├── notification/      # WhatsApp, SMS, Email adapters
│   │   │   └── slotGenerationService.js # Intelligent scheduling engine
│   │   ├── utils/
│   │   │   └── helpers.js         # Time arithmetic, appointment ID generator
│   │   ├── app.js                 # Express server configuration
│   │   ├── seed.js                # Demo clinic and realistic test data seeder
│   │   └── server.js              # Application entrypoint
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Button, Card, Badge, Modal, EmptyState, Skeleton
│   │   │   ├── form-builder/      # FieldLibrary, FormCanvas, FieldSettingsDrawer, PreviewModal
│   │   │   ├── form-renderer/     # DynamicFormRenderer with live conditional evaluator
│   │   │   ├── qr/                # QRCodeModal & counter-card print format
│   │   │   └── queue/             # LiveQueueWidget
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Session, role checks, and 1-click demo logins
│   │   │   └── ToastContext.jsx   # Animated toast alerts
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx# Responsive sidebar and navbar
│   │   ├── pages/
│   │   │   ├── analytics/         # Growth analytics & Recharts
│   │   │   ├── appointments/      # Appointments table, walk-in modal, reschedule modal
│   │   │   ├── auth/              # Sign in & Clinic registration
│   │   │   ├── booking-pages/     # Unique booking URLs & QR codes
│   │   │   ├── calendar/          # Day, Week, Month calendar with slot blocking
│   │   │   ├── doctors/           # Doctor profiles & availability shift manager
│   │   │   ├── forms/             # Forms list & drag-and-drop form builder
│   │   │   ├── landing/           # CareSlot SaaS marketing landing page
│   │   │   ├── notifications/     # Notification template editor & dispatch logs
│   │   │   ├── patients/          # Patient directory & visit history
│   │   │   ├── public/            # 6-step public patient booking wizard
│   │   │   ├── qr-codes/          # Printable QR code counter hub
│   │   │   └── settings/          # Clinic settings & staff management
│   │   ├── services/
│   │   │   └── api.js             # API client with token management
│   │   ├── App.jsx                # Protected and public route declarations
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .env.example
├── package.json                   # Root monorepo script coordinator
└── README.md
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** *(Optional)*: If you do not have MongoDB running locally, CareSlot will automatically initialize an embedded in-memory MongoDB engine (`mongodb-memory-server`) with zero external configuration required!

### 1. Clone & Install Dependencies

From the project root directory, install all backend and frontend dependencies:

```bash
# Install root, backend, and frontend packages
npm run install:all
```

Or install separately:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Variables

Create `.env` files in both `backend` and `frontend` (or copy from the provided `.env.example` templates):

#### `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/careslot_db
JWT_SECRET=careslot_super_secret_jwt_key_2026_dev
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Add third-party credentials when ready to go live
WHATSAPP_API_KEY=
WHATSAPP_PHONE_ID=
SMS_API_KEY=
SMS_SENDER_ID=CARESLOT
EMAIL_API_KEY=
EMAIL_FROM=no-reply@careslot.com
```

#### `frontend/.env`
```env
VITE_API_URL=/api
```

---

## 🏃 Running the Application

### Option A: Run Both Together (Root Command)
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

### Option B: Run Individually
```bash
# Terminal 1: Backend API
cd backend
npm run dev
# Running at http://localhost:5000

# Terminal 2: Frontend Client
cd frontend
npm run dev
# Running at http://localhost:5173
```

---

## 🔑 Demo Login Credentials

CareSlot comes pre-seeded with realistic clinic data for **SmileCare Dental Clinic**:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Clinic Admin (Owner)** | `clinic@smilecare.com` | `Password123` | Full access: Clinic settings, Doctors, Services, Dynamic Forms, Availability, Notifications, Analytics |
| **Receptionist / Staff** | `receptionist@smilecare.com` | `Password123` | Operational access: Walk-in bookings, Rescheduling, Live Reception Queue, Calling next patient |
| **Super Admin** | `admin@careslot.com` | `Password123` | Platform-wide oversight: All clinics directory |

> **Tip**: You can use the **1-Click Demo Logins** on the Login page (`/login`) or SaaS Landing page (`/`) to immediately log in as any role without typing!

---

## 🧪 Testing the Complete End-to-End Booking Flow

1. **Open the SaaS Landing Page**:
   - Navigate to `http://localhost:5173/` to view the CareSlot marketing page.
2. **Access the Public Patient Booking Flow**:
   - Open `http://localhost:5173/book/smilecare-dental/general-appointment` (or scan the QR code).
3. **Walk Through the 6-Step Patient Experience**:
   - **Step 1 (Service)**: Select *Dental Consultation* (30 mins • ₹300).
   - **Step 2 (Doctor)**: Select *Dr. Rahul Sharma* (Cosmetic Dentist).
   - **Step 3 (Dynamic Form)**: Fill in Full Name, Phone, and Age.
     - Toggle *"Do you have any medical or drug allergies?"* to **YES** -> Notice the **Allergy Details** field appears conditionally!
     - Check the Consent agreement checkbox.
   - **Step 4 (Date & Time)**: Select an appointment date. The system automatically computes and displays all available doctor slots. Pick a slot (e.g. `09:00 AM`).
   - **Step 5 (Confirm)**: Review booking summary and click **Confirm Appointment ✓**.
   - **Step 6 (Confirmation)**: View your generated appointment reference (`APT-YYYYMMDD-XXXX`), click **Add to Google Calendar**, or test self-service cancellation.
4. **Inspect in Admin Dashboard**:
   - Log in as Clinic Admin (`clinic@smilecare.com`) or Receptionist (`receptionist@smilecare.com`).
   - Open `/dashboard` or `/appointments`.
   - Your newly booked appointment immediately appears in the schedule and waiting room queue!
   - Test the Live Queue widget: Click **Call Next Patient** to call the patient into the consultation room.

---

## 🏗️ Technical Architecture Details

### 1. Dynamic Form Builder Engine
Forms are not hardcoded. Every clinic can design dynamic schemas stored in MongoDB as JSON:
```json
{
  "title": "New Patient Registration",
  "fields": [
    {
      "id": "has_allergies",
      "type": "yes_no",
      "label": "Do you have any known medical or drug allergies?",
      "defaultValue": "no"
    },
    {
      "id": "allergy_details",
      "type": "long_text",
      "label": "Allergy Details",
      "conditionalLogic": {
        "enabled": true,
        "dependsOnFieldId": "has_allergies",
        "operator": "equals",
        "value": "yes",
        "action": "show"
      }
    }
  ]
}
```
The **DynamicFormRenderer** evaluates field visibility dynamically upon every keystroke, hiding irrelevant fields and omitting them from validation rules.

### 2. Smart Slot Scheduling Engine (`slotGenerationService.js`)
Available slots are generated dynamically via:
$$\text{Available Slots} = f(\text{Doctor Shifts}, \text{Breaks}, \text{Service Duration}, \text{Existing Appointments}, \text{Blocked Slots}, \text{Advance Notice})$$
- **Duration Sensitivity**: A 30-minute Consultation generates slots at 30-minute intervals (`09:00`, `09:30`, `10:00`), while a 90-minute Root Canal automatically requires contiguous 90-minute blocks (`09:00 - 10:30`, `10:30 - 12:00`).
- **Collision Verification**: Before an appointment is committed to the database, `verifySlotIsFree()` performs an atomic query to prevent race conditions when multiple patients attempt to book the same slot simultaneously.

### 3. Multi-Channel Notification Architecture
```
NotificationService
├── WhatsAppProvider  (Mock dev logger / WhatsApp Business Cloud API)
├── SMSProvider       (Mock dev logger / Twilio / MSG91)
└── EmailProvider     (Mock dev logger / SendGrid / Resend)
```
Templates support dynamic parameter injection:
`{{patientName}}`, `{{doctorName}}`, `{{serviceName}}`, `{{date}}`, `{{time}}`, `{{clinicName}}`, `{{appointmentId}}`.

---

## 📚 REST API Reference Summary

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticate user & retrieve JWT |
| `/api/auth/register` | `POST` | Public | Register new clinic & owner admin |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current user profile and clinic |
| `/api/public/booking/:clinicSlug/:bookingSlug` | `GET` | Public | Fetch booking page configuration & form |
| `/api/public/booking/:clinicSlug/:bookingSlug/slots` | `GET` | Public | Retrieve real-time available doctor slots |
| `/api/public/booking/:clinicSlug/:bookingSlug` | `POST` | Public | Book appointment without authentication |
| `/api/appointments` | `GET` | Staff / Admin | List appointments with filters |
| `/api/appointments` | `POST` | Staff / Admin | Create walk-in / reception booking |
| `/api/appointments/:id/status` | `PUT` | Staff / Admin | Update status (ARRIVED, WAITING, etc.) |
| `/api/appointments/:id/reschedule` | `POST` | Staff / Admin | Reschedule to new date & slot |
| `/api/appointments/:id/follow-up` | `POST` | Staff / Admin | Schedule follow-up consultation |
| `/api/forms` | `GET, POST` | Clinic Admin | List and save dynamic form schemas |
| `/api/doctors` | `GET, POST` | Clinic Admin | Manage clinic practitioners |
| `/api/services` | `GET, POST` | Clinic Admin | Manage treatments, fees, and durations |
| `/api/availability/:doctorId` | `PUT` | Clinic Admin | Configure weekly shift schedule |
| `/api/availability/block-slot` | `POST` | Staff / Admin | Block a specific time slot |
| `/api/queue` | `GET` | Staff / Admin | Fetch live reception queue state |
| `/api/queue/call-next` | `POST` | Staff / Admin | Call next patient in queue |
| `/api/analytics/overview` | `GET` | Clinic Admin | Fetch KPI summaries and chart metrics |
| `/api/clinic/profile` | `GET, PUT` | Clinic Admin | Manage clinic profile and settings |

---

## 📄 License
This project is open-source and available under the **MIT License**.
