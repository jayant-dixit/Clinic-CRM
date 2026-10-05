import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db.js';
import { Clinic } from './models/Clinic.js';
import { User } from './models/User.js';
import { Doctor } from './models/Doctor.js';
import { Service } from './models/Service.js';
import { Availability } from './models/Availability.js';
import { Form } from './models/Form.js';
import { BookingPage } from './models/BookingPage.js';
import { Patient } from './models/Patient.js';
import { Appointment } from './models/Appointment.js';
import { Queue } from './models/Queue.js';
import { NotificationTemplate } from './models/NotificationTemplate.js';
import { Notification } from './models/Notification.js';

export const seedData = async () => {
  try {
    console.log('[Seed] Starting database seeding...');
    await connectDB();

    // Clean existing data
    await Promise.all([
      Clinic.deleteMany({}),
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Service.deleteMany({}),
      Availability.deleteMany({}),
      Form.deleteMany({}),
      BookingPage.deleteMany({}),
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
      Queue.deleteMany({}),
      NotificationTemplate.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing records.');

    // 1. Create Demo Clinic
    const clinic = await Clinic.create({
      name: 'CareFlow Multi-Speciality Clinic',
      slug: 'smilecare-dental',
      logo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80',
      description: 'Premier multispecialty healthcare clinic offering clinical consultations, diagnostics, specialized treatments, and patient-centered care.',
      clinicType: 'Multi-Speciality Clinic',
      googleBusinessProfile: 'https://maps.app.goo.gl/careclinic-reviews',
      phone: '+91 98765 43210',
      email: 'contact@careclinic.in',
      address: {
        street: 'Suite 402, Lotus Health Plaza, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
      },
      website: 'https://careclinic.in',
      timezone: 'Asia/Kolkata',
      settings: {
        minAdvanceBookingHours: 1,
        maxAdvanceBookingDays: 30,
        defaultSlotDuration: 30,
        cancellationPolicy: 'Please reschedule or cancel at least 2 hours in advance of your scheduled time.',
        allowReschedule: true,
        allowCancellation: true,
        currency: 'INR',
        currencySymbol: '₹',
        primaryColor: '#2563eb',
      },
    });
    console.log(`[Seed] Created Clinic: ${clinic.name} (${clinic.slug})`);

    // 2. Create Users (Super Admin, Clinic Admin, Staff)
    const superAdmin = await User.create({
      name: 'Platform Super Admin',
      email: 'admin@careflow.com',
      password: 'Password123',
      role: 'SUPER_ADMIN',
      phone: '+91 90000 00001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    });

    const clinicAdmin = await User.create({
      clinicId: clinic._id,
      name: 'Dr. Rahul Sharma (Owner)',
      email: 'clinic@smilecare.com',
      password: 'Password123',
      role: 'CLINIC_ADMIN',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
    });

    const staffUser = await User.create({
      clinicId: clinic._id,
      name: 'Pooja Verma (Receptionist)',
      email: 'receptionist@smilecare.com',
      password: 'Password123',
      role: 'STAFF',
      phone: '+91 98765 43211',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    });
    console.log('[Seed] Created Users: Super Admin, Clinic Admin, Staff');

    // 3. Create Services
    const serviceConsultation = await Service.create({
      clinicId: clinic._id,
      name: 'Dental Consultation',
      description: 'Comprehensive dental examination, digital intraoral camera scan, and personalized treatment planning.',
      duration: 30,
      price: 300,
      color: '#3b82f6',
      status: 'ACTIVE',
    });

    const serviceCleaning = await Service.create({
      clinicId: clinic._id,
      name: 'Teeth Cleaning & Polishing',
      description: 'Ultrasonic plaque and calculus removal followed by air-flow stain removal and fluoride enamel polish.',
      duration: 45,
      price: 800,
      color: '#10b981',
      status: 'ACTIVE',
    });

    const serviceRootCanal = await Service.create({
      clinicId: clinic._id,
      name: 'Root Canal Treatment',
      description: 'Rotary endodontic therapy with painless electronic apex locator under local anesthesia.',
      duration: 90,
      price: 2500,
      color: '#8b5cf6',
      status: 'ACTIVE',
    });

    const serviceCheckup = await Service.create({
      clinicId: clinic._id,
      name: 'Dental Checkup & X-Ray',
      description: 'Routine preventive bi-annual checkup with single-tooth digital RVG radiograph.',
      duration: 30,
      price: 500,
      color: '#f59e0b',
      status: 'ACTIVE',
    });
    console.log('[Seed] Created 4 Services');

    // 4. Create Doctors
    const doctor1 = await Doctor.create({
      clinicId: clinic._id,
      name: 'Dr. Rahul Sharma',
      specialization: 'Cosmetic Dentist & Implantologist',
      phone: '+91 98765 11111',
      email: 'dr.rahul@smilecare.com',
      bio: 'BDS, MDS - 12+ years experience specializing in digital smile design, ceramic veneers, and painless dental implants.',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      assignedServices: [serviceConsultation._id, serviceCleaning._id, serviceCheckup._id],
      status: 'ACTIVE',
      displayOrder: 1,
    });

    const doctor2 = await Doctor.create({
      clinicId: clinic._id,
      name: 'Dr. Priya Gupta',
      specialization: 'Orthodontist & Endodontist',
      phone: '+91 98765 22222',
      email: 'dr.priya@smilecare.com',
      bio: 'BDS, MDS - 9+ years experience in invisible aligners, complex root canal retreatment, and pediatric dental care.',
      profileImage: 'https://images.unsplash.com/photo-1594824813637-43c3f8f10134?w=300&auto=format&fit=crop&q=80',
      assignedServices: [serviceConsultation._id, serviceRootCanal._id, serviceCheckup._id],
      status: 'ACTIVE',
      displayOrder: 2,
    });
    console.log('[Seed] Created 2 Doctors');

    // 5. Configure Doctor Availability Schedules
    const standardWeeklySchedule = [
      {
        dayOfWeek: 1, // Monday
        dayName: 'Monday',
        isWorkingDay: true,
        shifts: [
          { startTime: '09:00', endTime: '13:00' },
          { startTime: '16:00', endTime: '20:00' },
        ],
        breaks: [{ startTime: '13:00', endTime: '14:00', label: 'Lunch Break' }],
      },
      {
        dayOfWeek: 2, // Tuesday
        dayName: 'Tuesday',
        isWorkingDay: true,
        shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }],
        breaks: [{ startTime: '13:00', endTime: '14:00', label: 'Lunch Break' }],
      },
      {
        dayOfWeek: 3, // Wednesday
        dayName: 'Wednesday',
        isWorkingDay: true,
        shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }],
        breaks: [{ startTime: '13:00', endTime: '14:00', label: 'Lunch Break' }],
      },
      {
        dayOfWeek: 4, // Thursday
        dayName: 'Thursday',
        isWorkingDay: true,
        shifts: [
          { startTime: '09:00', endTime: '13:00' },
          { startTime: '16:00', endTime: '20:00' },
        ],
        breaks: [{ startTime: '13:00', endTime: '14:00', label: 'Lunch Break' }],
      },
      {
        dayOfWeek: 5, // Friday
        dayName: 'Friday',
        isWorkingDay: true,
        shifts: [
          { startTime: '09:00', endTime: '13:00' },
          { startTime: '16:00', endTime: '20:00' },
        ],
        breaks: [{ startTime: '13:00', endTime: '14:00', label: 'Lunch Break' }],
      },
      {
        dayOfWeek: 6, // Saturday
        dayName: 'Saturday',
        isWorkingDay: true,
        shifts: [{ startTime: '09:00', endTime: '15:00' }],
        breaks: [{ startTime: '12:30', endTime: '13:00', label: 'Quick Break' }],
      },
      {
        dayOfWeek: 0, // Sunday
        dayName: 'Sunday',
        isWorkingDay: false,
        shifts: [],
        breaks: [],
      },
    ];

    await Availability.create({
      clinicId: clinic._id,
      doctorId: doctor1._id,
      slotIntervalMinutes: 15,
      weeklySchedule: standardWeeklySchedule,
      dateOverrides: [],
    });

    await Availability.create({
      clinicId: clinic._id,
      doctorId: doctor2._id,
      slotIntervalMinutes: 15,
      weeklySchedule: standardWeeklySchedule,
      dateOverrides: [],
    });
    console.log('[Seed] Created Availability schedules for both doctors');

    // 6. Create Demo Dynamic Form with Conditional Logic
    const registrationForm = await Form.create({
      clinicId: clinic._id,
      title: 'New Patient Registration',
      slug: 'new-patient-registration',
      description: 'Please fill in your personal, contact, and dental health details to complete your clinic booking.',
      isDefault: true,
      isPublished: true,
      fields: [
        {
          id: 'full_name',
          type: 'short_text',
          label: 'Full Name',
          placeholder: 'e.g. Rahul Sharma',
          description: 'Enter your legal first and last name',
          required: true,
          order: 1,
        },
        {
          id: 'phone_number',
          type: 'phone',
          label: 'Phone Number',
          placeholder: 'e.g. 9876543210',
          description: 'We will send booking confirmation & reminder via WhatsApp / SMS',
          required: true,
          order: 2,
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          placeholder: 'e.g. rahul@example.com',
          description: 'To receive appointment confirmation and invoice',
          required: false,
          order: 3,
        },
        {
          id: 'age',
          type: 'number',
          label: 'Age',
          placeholder: 'e.g. 32',
          description: 'Age in completed years',
          required: true,
          validation: { min: 1, max: 120 },
          order: 4,
        },
        {
          id: 'gender',
          type: 'radio',
          label: 'Gender',
          options: ['Male', 'Female', 'Other', 'Prefer not to say'],
          defaultValue: 'Male',
          required: true,
          order: 5,
        },
        {
          id: 'reason_for_visit',
          type: 'dropdown',
          label: 'Reason for Visit',
          placeholder: 'Select main symptom or inquiry',
          options: [
            'General Routine Consultation',
            'Severe Toothache / Sensitivity',
            'Teeth Cleaning & Scaling',
            'Bleeding or Swollen Gums',
            'Cavity / Broken Tooth',
            'Cosmetic Veneers / Smile Makeover',
            'Orthodontic Braces / Clear Aligners',
            'Root Canal Follow-up',
          ],
          required: true,
          order: 6,
        },
        {
          id: 'has_allergies',
          type: 'yes_no',
          label: 'Do you have any known medical or drug allergies?',
          description: 'e.g. Penicillin, Sulfa drugs, latex, or local anesthesia',
          defaultValue: 'no',
          required: true,
          order: 7,
        },
        {
          id: 'allergy_details',
          type: 'long_text',
          label: 'Allergy Details',
          placeholder: 'Please list all substances, medications, and your typical reactions...',
          description: 'Specific names of medicines or allergens',
          required: false,
          conditionalLogic: {
            enabled: true,
            dependsOnFieldId: 'has_allergies',
            operator: 'equals',
            value: 'yes',
            action: 'show',
          },
          order: 8,
        },
        {
          id: 'taking_medication',
          type: 'yes_no',
          label: 'Are you currently taking any regular medications?',
          description: 'e.g. Blood thinners, BP medication, diabetic insulin',
          defaultValue: 'no',
          required: true,
          order: 9,
        },
        {
          id: 'medication_details',
          type: 'long_text',
          label: 'Medication Details & Dosage',
          placeholder: 'List ongoing prescription medications, frequency and dosage...',
          required: false,
          conditionalLogic: {
            enabled: true,
            dependsOnFieldId: 'taking_medication',
            operator: 'equals',
            value: 'yes',
            action: 'show',
          },
          order: 10,
        },
        {
          id: 'additional_notes',
          type: 'long_text',
          label: 'Additional Clinical Notes or Questions',
          placeholder: 'Any dental anxiety, past dental surgeries or preferences you would like the doctor to know...',
          required: false,
          order: 11,
        },
        {
          id: 'consent_checkbox',
          type: 'consent',
          label: 'Consent to Dental Examination & Clinic Terms',
          description: 'I confirm that the health details provided are accurate to the best of my knowledge and I consent to dental diagnosis and clinic communications.',
          required: true,
          order: 12,
        },
      ],
    });
    console.log(`[Seed] Created Dynamic Form: ${registrationForm.title} (${registrationForm.fields.length} fields)`);

    // 7. Create Demo Booking Page
    const bookingPage = await BookingPage.create({
      clinicId: clinic._id,
      title: 'Book Your Clinic Appointment',
      slug: 'general-appointment',
      description: 'Book your in-clinic consultation with top doctors and specialists. Scan the QR code or select your preferred service and time slot below.',
      formId: registrationForm._id,
      allowedServices: [serviceConsultation._id, serviceCleaning._id, serviceRootCanal._id, serviceCheckup._id],
      allowedDoctors: [doctor1._id, doctor2._id],
      isPublished: true,
      themeColor: '#2563eb',
    });
    console.log(`[Seed] Created Booking Page: /book/${clinic.slug}/${bookingPage.slug}`);

    // 8. Create Sample Patients
    const patient1 = await Patient.create({
      clinicId: clinic._id,
      name: 'Amit Kumar',
      phone: '+91 98111 22233',
      email: 'amit.kumar@gmail.com',
      dateOfBirth: '1992-05-14',
      gender: 'Male',
      address: '74 HAL 2nd Stage, Indiranagar, Bengaluru',
      notes: [{ author: 'Dr. Rahul Sharma', text: 'Patient complained of sensitivity in upper right molar. Fluoride applied.' }],
      totalVisits: 3,
      lastVisitAt: new Date(),
    });

    const patient2 = await Patient.create({
      clinicId: clinic._id,
      name: 'Priya Gupta',
      phone: '+91 98222 33344',
      email: 'priya.g@outlook.com',
      dateOfBirth: '1995-11-20',
      gender: 'Female',
      address: '104 Koramangala 4th Block, Bengaluru',
      notes: [{ author: 'Pooja Verma', text: 'Prefers morning appointments due to office schedule.' }],
      totalVisits: 1,
      lastVisitAt: new Date(),
    });

    const patient3 = await Patient.create({
      clinicId: clinic._id,
      name: 'Rohan Mehra',
      phone: '+91 98333 44455',
      email: 'rohan.m@yahoo.com',
      dateOfBirth: '1988-08-02',
      gender: 'Male',
      address: '22 HSR Layout Sector 1, Bengaluru',
      totalVisits: 2,
      lastVisitAt: new Date(),
    });

    const patient4 = await Patient.create({
      clinicId: clinic._id,
      name: 'Sneha Patel',
      phone: '+91 98444 55566',
      email: 'sneha.patel@gmail.com',
      dateOfBirth: '1998-03-25',
      gender: 'Female',
      address: 'B-12 Whitefield Main Road, Bengaluru',
      totalVisits: 1,
      lastVisitAt: new Date(),
    });
    console.log('[Seed] Created 4 Patients');

    // 9. Create Sample Appointments (Today & Past Days)
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const apt1 = await Appointment.create({
      clinicId: clinic._id,
      appointmentNumber: 'APT-20261001-1001',
      patientId: patient1._id,
      patientDetails: { name: patient1.name, phone: patient1.phone, email: patient1.email },
      doctorId: doctor1._id,
      serviceId: serviceConsultation._id,
      bookingPageId: bookingPage._id,
      date: today,
      startTime: '09:00',
      endTime: '09:30',
      duration: 30,
      status: 'COMPLETED',
      bookingSource: 'BOOKING_LINK',
      formData: { full_name: patient1.name, reason_for_visit: 'General Routine Consultation' },
      internalNotes: 'Routine cleaning recommended in 2 weeks.',
      queueToken: '#01',
    });

    const apt2 = await Appointment.create({
      clinicId: clinic._id,
      appointmentNumber: 'APT-20261001-1002',
      patientId: patient2._id,
      patientDetails: { name: patient2.name, phone: patient2.phone, email: patient2.email },
      doctorId: doctor1._id,
      serviceId: serviceCleaning._id,
      bookingPageId: bookingPage._id,
      date: today,
      startTime: '09:30',
      endTime: '10:15',
      duration: 45,
      status: 'IN_PROGRESS',
      bookingSource: 'QR',
      formData: { full_name: patient2.name, reason_for_visit: 'Teeth Cleaning & Scaling' },
      queueToken: '#02',
    });

    const apt3 = await Appointment.create({
      clinicId: clinic._id,
      appointmentNumber: 'APT-20261001-1003',
      patientId: patient3._id,
      patientDetails: { name: patient3.name, phone: patient3.phone, email: patient3.email },
      doctorId: doctor2._id,
      serviceId: serviceRootCanal._id,
      bookingPageId: bookingPage._id,
      date: today,
      startTime: '10:30',
      endTime: '12:00',
      duration: 90,
      status: 'WAITING',
      bookingSource: 'RECEPTION',
      formData: { full_name: patient3.name, reason_for_visit: 'Cavity / Broken Tooth' },
      queueToken: '#03',
    });

    const apt4 = await Appointment.create({
      clinicId: clinic._id,
      appointmentNumber: 'APT-20261001-1004',
      patientId: patient4._id,
      patientDetails: { name: patient4.name, phone: patient4.phone, email: patient4.email },
      doctorId: doctor1._id,
      serviceId: serviceCheckup._id,
      bookingPageId: bookingPage._id,
      date: today,
      startTime: '16:00',
      endTime: '16:30',
      duration: 30,
      status: 'CONFIRMED',
      bookingSource: 'QR',
      formData: { full_name: patient4.name, reason_for_visit: 'General Routine Consultation' },
    });

    const apt5 = await Appointment.create({
      clinicId: clinic._id,
      appointmentNumber: 'APT-20261001-1005',
      patientId: patient1._id,
      patientDetails: { name: patient1.name, phone: patient1.phone, email: patient1.email },
      doctorId: doctor2._id,
      serviceId: serviceCheckup._id,
      bookingPageId: bookingPage._id,
      date: yesterday,
      startTime: '11:00',
      endTime: '11:30',
      duration: 30,
      status: 'COMPLETED',
      bookingSource: 'WALK_IN',
    });
    console.log('[Seed] Created 5 Sample Appointments');

    // 10. Create Queue for Today
    await Queue.create({
      clinicId: clinic._id,
      date: today,
      currentTokenSeq: 3,
      currentlyServingSeq: 2,
      items: [
        {
          appointmentId: apt1._id,
          tokenNumber: '#01',
          tokenSeq: 1,
          patientName: patient1.name,
          patientPhone: patient1.phone,
          doctorName: doctor1.name,
          serviceName: serviceConsultation.name,
          status: 'COMPLETED',
          arrivedAt: new Date(Date.now() - 3600000 * 2),
        },
        {
          appointmentId: apt2._id,
          tokenNumber: '#02',
          tokenSeq: 2,
          patientName: patient2.name,
          patientPhone: patient2.phone,
          doctorName: doctor1.name,
          serviceName: serviceCleaning.name,
          status: 'IN_PROGRESS',
          arrivedAt: new Date(Date.now() - 1800000),
        },
        {
          appointmentId: apt3._id,
          tokenNumber: '#03',
          tokenSeq: 3,
          patientName: patient3.name,
          patientPhone: patient3.phone,
          doctorName: doctor2.name,
          serviceName: serviceRootCanal.name,
          status: 'WAITING',
          arrivedAt: new Date(Date.now() - 600000),
          estimatedWaitMinutes: 20,
        },
      ],
    });
    console.log('[Seed] Created Live Queue for Today');

    // 11. Create Notification Templates
    await NotificationTemplate.create({
      clinicId: clinic._id,
      eventType: 'CONFIRMATION',
      channel: 'WHATSAPP',
      template: '🦷 *Appointment Confirmed!* Hello {{patientName}}, your appointment with {{doctorName}} for {{serviceName}} is confirmed for *{{date}} at {{time}}* at {{clinicName}}. Ref ID: *{{appointmentId}}*. Please arrive 10 mins early.',
      isActive: true,
    });

    await NotificationTemplate.create({
      clinicId: clinic._id,
      eventType: 'REMINDER',
      channel: 'WHATSAPP',
      template: '⏰ *Appointment Reminder:* Hello {{patientName}}, this is a friendly reminder for your appointment tomorrow with {{doctorName}} at {{time}} at {{clinicName}}.',
      isActive: true,
    });
    console.log('[Seed] Created Notification Templates');

    console.log(`
========================================================================
✨ SEED COMPLETED SUCCESSFULLY!
Demo Credentials:
1. Super Admin:       admin@careflow.com          / Password123
2. Clinic Admin:      clinic@smilecare.com        / Password123
3. Staff/Reception:   receptionist@smilecare.com  / Password123

Demo Clinic:          SmileCare Dental Clinic
Public Booking URL:   /book/smilecare-dental/general-appointment
========================================================================
    `);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    throw error;
  }
};

// If run directly via `node src/seed.js`
if (process.argv[1]?.includes('seed.js')) {
  seedData()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
