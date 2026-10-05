import mongoose from 'mongoose';
import { Clinic } from '../models/Clinic.js';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { SubscriptionPayment } from '../models/SubscriptionPayment.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { slugify } from '../utils/helpers.js';

// Helper to generate secure human-friendly random password
const generateRandomPassword = (prefix = 'CareFlow') => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}@${digits}!`;
};

// 1. High-Level Platform Overview & Multi-Clinic Analytics
export const getSuperAdminAnalytics = async (req, res, next) => {
  try {
    const [
      clinics,
      totalDoctors,
      totalPatients,
      totalAppointments,
      completedAppointments,
      payments,
      supportTickets,
    ] = await Promise.all([
      Clinic.find({}).lean(),
      Doctor.countDocuments({}),
      Patient.countDocuments({}),
      Appointment.countDocuments({}),
      Appointment.countDocuments({ status: 'COMPLETED' }),
      SubscriptionPayment.find({}).lean(),
      SupportTicket.find({}).lean(),
    ]);

    const totalClinics = clinics.length;
    const activeClinics = clinics.filter((c) => c.subscription?.status === 'ACTIVE' && c.isActive).length;
    const suspendedClinics = clinics.filter((c) => c.subscription?.status === 'SUSPENDED' || !c.isActive).length;
    const trialClinics = clinics.filter((c) => c.subscription?.status === 'TRIAL').length;

    // Monthly Recurring Revenue (MRR) based on active clinic plans
    const mrr = clinics
      .filter((c) => c.subscription?.status === 'ACTIVE' && c.isActive)
      .reduce((sum, c) => sum + (c.subscription?.pricePerMonth || 2999), 0);

    // Total actual collected payments
    const totalRevenueCollected = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPaymentsCount = payments.filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE').length;
    const openTicketsCount = supportTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

    // Aggregate usage metrics per clinic (Patients & Appointments served)
    const [patientsPerClinic, appointmentsPerClinic, doctorsPerClinic] = await Promise.all([
      Patient.aggregate([
        { $group: { _id: '$clinicId', count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $group: { _id: '$clinicId', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } } } },
      ]),
      Doctor.aggregate([
        { $group: { _id: '$clinicId', count: { $sum: 1 } } },
      ]),
    ]);

    const patientsMap = Object.fromEntries(patientsPerClinic.map((p) => [p._id.toString(), p.count]));
    const aptMap = Object.fromEntries(appointmentsPerClinic.map((a) => [a._id.toString(), a]));
    const docMap = Object.fromEntries(doctorsPerClinic.map((d) => [d._id.toString(), d.count]));

    const clinicUsageBreakdown = clinics.map((c) => {
      const cId = c._id.toString();
      const patientCount = patientsMap[cId] || 0;
      const aptData = aptMap[cId] || { count: 0, completed: 0 };
      const docCount = docMap[cId] || 0;
      const baseFee = c.subscription?.pricePerMonth || 2999;
      // Extra tier charges if patient volume exceeds 500
      const extraPatientCharges = patientCount > 500 ? Math.round((patientCount - 500) * 5) : 0;
      const calculatedBill = baseFee + extraPatientCharges;

      return {
        clinicId: c._id,
        name: c.name,
        slug: c.slug,
        email: c.email,
        phone: c.phone,
        plan: c.subscription?.plan || 'PROFESSIONAL',
        status: c.subscription?.status || (c.isActive ? 'ACTIVE' : 'SUSPENDED'),
        monthlyFee: baseFee,
        calculatedBill,
        extraPatientCharges,
        patientCount,
        appointmentCount: aptData.count,
        completedAppointments: aptData.completed,
        doctorCount: docCount,
        validUntil: c.subscription?.validUntil,
        features: c.features || {},
      };
    });

    const overview = {
      totalClinics,
      activeClinics,
      suspendedClinics,
      trialClinics,
      totalDoctors,
      totalPatients,
      totalAppointments,
      completedAppointments,
      mrr,
      totalMRR: mrr,
      totalRevenueCollected,
      pendingPaymentsCount,
      openTicketsCount,
    };

    return res.status(200).json({
      success: true,
      data: {
        summary: overview,
        overview,
        clinicUsageBreakdown,
        clinicUsageMetrics: clinicUsageBreakdown,
      },
    });

  } catch (error) {
    next(error);
  }
};

// 2. Get All Clinics with Owner & Full Config
export const getAllClinics = async (req, res, next) => {
  try {
    const clinics = await Clinic.find({})
      .populate('ownerId', 'name email phone status lastLoginAt')
      .sort({ createdAt: -1 })
      .lean();

    const [doctorCounts, patientCounts, aptCounts] = await Promise.all([
      Doctor.aggregate([{ $group: { _id: '$clinicId', count: { $sum: 1 } } }]),
      Patient.aggregate([{ $group: { _id: '$clinicId', count: { $sum: 1 } } }]),
      Appointment.aggregate([{ $group: { _id: '$clinicId', count: { $sum: 1 } } }]),
    ]);

    const docMap = Object.fromEntries(doctorCounts.map((d) => [d._id.toString(), d.count]));
    const patMap = Object.fromEntries(patientCounts.map((p) => [p._id.toString(), p.count]));
    const aptMap = Object.fromEntries(aptCounts.map((a) => [a._id.toString(), a.count]));

    const enrichedClinics = clinics.map((c) => ({
      ...c,
      doctorCount: docMap[c._id.toString()] || 0,
      patientCount: patMap[c._id.toString()] || 0,
      appointmentCount: aptMap[c._id.toString()] || 0,
    }));

    return res.status(200).json({ success: true, count: enrichedClinics.length, data: enrichedClinics });
  } catch (error) {
    next(error);
  }
};

// 3. Register New Clinic and Generate Owner Credentials
export const createClinicBySuperAdmin = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      phone,
      email,
      address,
      website,
      clinicType,
      googleBusinessProfile,
      plan = 'PROFESSIONAL',
      pricePerMonth = 2999,
      billingCycle = 'MONTHLY',
      patientQuota = 1000,
      features,
      ownerName,
      ownerEmail,
      ownerPassword,
      password,
    } = req.body;

    const clinicEmail = (email || ownerEmail)?.toLowerCase();
    const clinicPhone = phone && phone.trim() ? phone.trim() : '+1 555-0100';

    if (!name || !ownerName || !ownerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide clinic name, owner name, and owner email.',
      });
    }

    const existingUser = await User.findOne({ email: ownerEmail.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `A user with email "${ownerEmail}" already exists. Please choose a different owner email.`,
      });
    }

    // Resolve unique slug
    let baseSlug = slug ? slugify(slug) : slugify(name);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Clinic.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // Generated Password if not specified
    const chosenPassword = ownerPassword || password;
    const plainPassword = chosenPassword && chosenPassword.trim()
      ? chosenPassword.trim()
      : generateRandomPassword('Clinic');

    // 1. Create Clinic
    const clinic = await Clinic.create({
      name,
      slug: finalSlug,
      phone: clinicPhone,
      email: clinicEmail,
      website: website || '',
      clinicType: clinicType || 'Multi-Speciality Clinic',
      googleBusinessProfile: googleBusinessProfile ? googleBusinessProfile.trim() : '',
      address: address || {},
      description: `Welcome to ${name}. Dedicated healthcare, consultation, and patient-centered clinical services.`,
      subscription: {
        plan,
        status: 'ACTIVE',
        pricePerMonth: Number(pricePerMonth) || 2999,
        billingCycle,
        validUntil: new Date(Date.now() + 30 * 86400000),
        patientQuota: Number(patientQuota) || 1000,
      },
      features: {
        publicBooking: features?.publicBooking !== false,
        qrCodeBooking: features?.qrCodeBooking !== false,
        customForms: features?.customForms !== false,
        analyticsReporting: features?.analyticsReporting !== false,
        automatedNotifications: features?.automatedNotifications !== false,
        multiDoctor: features?.multiDoctor !== false,
      },
      isActive: true,
    });

    // 2. Create Owner User
    const owner = await User.create({
      clinicId: clinic._id,
      name: ownerName,
      email: ownerEmail.toLowerCase(),
      password: plainPassword,
      role: 'CLINIC_ADMIN',
      phone: phone || '',
    });

    // Link owner to clinic
    clinic.ownerId = owner._id;
    await clinic.save();

    // 3. Create initial Subscription Payment invoice record
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await SubscriptionPayment.create({
      clinicId: clinic._id,
      clinicName: clinic.name,
      invoiceNumber,
      amount: Number(pricePerMonth) || 2999,
      plan,
      status: 'PAID',
      paymentMethod: 'MANUAL_OFFLINE',
      notes: 'Initial subscription invoice generated on clinic onboarding by SuperAdmin.',
    });

    return res.status(201).json({
      success: true,
      message: 'Clinic and owner credentials created successfully',
      data: {
        clinic,
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
          role: owner.role,
          generatedPassword: plainPassword,
        },
        credentials: {
          email: owner.email,
          password: plainPassword,
          loginUrl: `${req.protocol}://${req.get('host')}/login`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update Clinic Subscription & Active Status
export const updateClinicSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan, status, pricePerMonth, billingCycle, validUntil, patientQuota, clinicType, googleBusinessProfile } = req.body;

    const clinic = await Clinic.findById(id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    if (clinicType) clinic.clinicType = clinicType;
    if (googleBusinessProfile !== undefined) clinic.googleBusinessProfile = googleBusinessProfile.trim();
    if (!clinic.subscription) clinic.subscription = {};
    if (plan) clinic.subscription.plan = plan;
    if (status) {
      clinic.subscription.status = status;
      clinic.isActive = status !== 'SUSPENDED';
    }
    if (pricePerMonth !== undefined) clinic.subscription.pricePerMonth = Number(pricePerMonth);
    if (billingCycle) clinic.subscription.billingCycle = billingCycle;
    if (validUntil) clinic.subscription.validUntil = new Date(validUntil);
    if (patientQuota !== undefined) clinic.subscription.patientQuota = Number(patientQuota);

    await clinic.save();

    return res.status(200).json({
      success: true,
      message: 'Clinic subscription updated successfully',
      data: clinic,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Update Feature Access Controls (Gating / Blocking features)
export const updateClinicFeatures = async (req, res, next) => {
  try {
    const { id } = req.params;
    const featuresPayload = req.body.features || req.body;

    const clinic = await Clinic.findById(id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    clinic.features = {
      ...(clinic.features || {}),
      ...featuresPayload,
    };

    await clinic.save();

    return res.status(200).json({
      success: true,
      message: 'Feature access controls updated successfully',
      data: {
        features: clinic.features,
        clinicId: clinic._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 6. Superadmin Adds Doctor or Staff to a Clinic & Generates Credentials
export const addDoctorOrStaffToClinic = async (req, res, next) => {
  try {
    const { clinicId } = req.params;
    const { name, email, phone, role = 'DOCTOR', specialization, bio, password } = req.body;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `A user with email "${email}" already exists.`,
      });
    }

    const plainPassword = password && password.trim() ? password.trim() : generateRandomPassword('Staff');

    // 1. Create User account for login
    const user = await User.create({
      clinicId: clinic._id,
      name,
      email: email.toLowerCase(),
      password: plainPassword,
      role: 'STAFF',
      phone: phone || '',
    });

    let doctorRecord = null;
    // 2. If role is DOCTOR, create Doctor profile
    if (role === 'DOCTOR') {
      doctorRecord = await Doctor.create({
        clinicId: clinic._id,
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        specialization: specialization || 'Dental Specialist',
        bio: bio || '',
        status: 'ACTIVE',
      });
    }

    return res.status(201).json({
      success: true,
      message: `${role === 'DOCTOR' ? 'Doctor' : 'Staff member'} registered with login credentials!`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        doctor: doctorRecord,
        credentials: {
          name,
          email: user.email,
          password: plainPassword,
          generatedPassword: plainPassword,
          role: role === 'DOCTOR' ? 'Doctor' : 'Staff',
          clinicName: clinic.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 7. Get All Doctors and Staff Across the Platform
export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({})
      .populate('clinicId', 'name slug email phone')
      .populate('assignedServices', 'name duration price')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    next(error);
  }
};

// 8. Global Patients Directory (Usage & Reach Tracking)
export const getAllPatients = async (req, res, next) => {
  try {
    const { search, clinicId, limit = 100, page = 1 } = req.query;
    const query = {};

    if (clinicId && clinicId !== 'all') {
      query.clinicId = clinicId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('clinicId', 'name slug')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// 9. Payment Analytics & Revenue Invoices
export const getPaymentAnalytics = async (req, res, next) => {
  try {
    const payments = await SubscriptionPayment.find({})
      .populate('clinicId', 'name slug email')
      .sort({ createdAt: -1 })
      .lean();

    const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = payments.filter((p) => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0);

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalPaid,
          totalPending,
          totalOverdue,
          totalInvoices: payments.length,
        },
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 10. Record Subscription Payment / Invoice
export const recordPayment = async (req, res, next) => {
  try {
    const { clinicId, amount, plan = 'PROFESSIONAL', paymentMethod = 'UPI', notes, status = 'PAID' } = req.body;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await SubscriptionPayment.create({
      clinicId: clinic._id,
      clinicName: clinic.name,
      invoiceNumber,
      amount: Number(amount),
      plan,
      status,
      paymentMethod,
      notes: notes || '',
      billingDate: new Date(),
    });

    if (status === 'PAID') {
      clinic.subscription.status = 'ACTIVE';
      clinic.subscription.validUntil = new Date(Date.now() + 30 * 86400000);
      clinic.isActive = true;
      await clinic.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Subscription payment recorded successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// 11. Support Tickets & Complaints (Customer Feedback)
export const getSupportTickets = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;

    const tickets = await SupportTicket.find(query)
      .populate('clinicId', 'name slug email phone')
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    next(error);
  }
};

// 12. Update Support Ticket (Resolution & Response)
export const updateSupportTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, resolutionNote, priority, responseMessage } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    const notes = resolutionNotes !== undefined ? resolutionNotes : resolutionNote;
    if (notes !== undefined) ticket.resolutionNotes = notes;

    const msg = responseMessage || resolutionNote;
    if (msg && msg.trim()) {
      ticket.responses.push({
        authorName: req.user?.name || 'Super Admin',
        authorRole: 'SUPER_ADMIN',
        message: msg.trim(),
        createdAt: new Date(),
      });
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: 'Support ticket updated successfully',
      data: {
        ...ticket.toObject(),
        resolutionNote: ticket.resolutionNotes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 13. Create Support Ticket (Called by Clinics to Submit Feedback or Complaints)
export const createSupportTicketByClinic = async (req, res, next) => {
  try {
    const { subject, description, category = 'GENERAL', priority = 'MEDIUM' } = req.body;
    let clinicId = req.clinicId || req.body.clinicId;
    if (!clinicId) {
      const defaultClinic = await Clinic.findOne({});
      clinicId = defaultClinic?._id;
    }
    const clinic = await Clinic.findById(clinicId);

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required.' });
    }

    const ticket = await SupportTicket.create({
      clinicId,
      userId: req.user?._id,
      clinicName: clinic?.name || 'Clinic',
      authorName: req.user?.name || 'Clinic Staff',
      authorEmail: req.user?.email || clinic?.email || 'contact@clinic.com',
      subject,
      description,
      category,
      priority,
      status: 'OPEN',
    });

    return res.status(201).json({
      success: true,
      message: 'Support ticket and feedback submitted to platform administrators.',
      data: {
        ...ticket.toObject(),
        submittedBy: {
          name: ticket.authorName,
          email: ticket.authorEmail,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
