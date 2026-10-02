import { Clinic } from '../models/Clinic.js';
import { BookingPage } from '../models/BookingPage.js';
import { Doctor } from '../models/Doctor.js';
import { Service } from '../models/Service.js';
import { Form } from '../models/Form.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { SlotGenerationService } from '../services/slotGenerationService.js';
import { notificationService } from '../services/notification/index.js';
import { generateAppointmentNumber, addMinutesToTime } from '../utils/helpers.js';

export const getPublicBookingConfig = async (req, res, next) => {
  try {
    const { clinicSlug, bookingSlug } = req.params;

    const clinic = await Clinic.findOne({ slug: clinicSlug.toLowerCase(), isActive: true })
      .select('name slug logo description phone email address website settings');

    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found or is currently inactive' });
    }

    const bookingPage = await BookingPage.findOne({
      clinicId: clinic._id,
      slug: bookingSlug.toLowerCase(),
      isPublished: true,
    }).populate('formId');

    if (!bookingPage) {
      return res.status(404).json({ success: false, message: 'Booking page not found or is not published' });
    }

    // Determine available services
    let servicesQuery = { clinicId: clinic._id, status: 'ACTIVE' };
    if (bookingPage.allowedServices && bookingPage.allowedServices.length > 0) {
      servicesQuery._id = { $in: bookingPage.allowedServices };
    }
    const services = await Service.find(servicesQuery).sort({ price: 1 });

    // Determine available doctors
    let doctorsQuery = { clinicId: clinic._id, status: 'ACTIVE' };
    if (bookingPage.allowedDoctors && bookingPage.allowedDoctors.length > 0) {
      doctorsQuery._id = { $in: bookingPage.allowedDoctors };
    }
    const doctors = await Doctor.find(doctorsQuery)
      .select('name specialization bio profileImage assignedServices')
      .sort({ displayOrder: 1 });

    return res.status(200).json({
      success: true,
      data: {
        clinic,
        bookingPage: {
          id: bookingPage._id,
          title: bookingPage.title,
          slug: bookingPage.slug,
          description: bookingPage.description,
          themeColor: bookingPage.themeColor,
        },
        form: bookingPage.formId,
        services,
        doctors,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicAvailableSlots = async (req, res, next) => {
  try {
    const { clinicSlug, bookingSlug } = req.params;
    const { doctorId, serviceId, date } = req.query;

    if (!doctorId || !serviceId || !date) {
      return res.status(400).json({ success: false, message: 'doctorId, serviceId and date are required' });
    }

    const clinic = await Clinic.findOne({ slug: clinicSlug.toLowerCase() }).select('_id');
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    const slots = await SlotGenerationService.getAvailableSlots({
      clinicId: clinic._id,
      doctorId,
      serviceId,
      date,
    });

    return res.status(200).json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    next(error);
  }
};

export const createPublicAppointment = async (req, res, next) => {
  try {
    const { clinicSlug, bookingSlug } = req.params;
    const { doctorId, serviceId, date, startTime, formData, bookingSource } = req.body;

    if (!doctorId || !serviceId || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'Missing required appointment parameters' });
    }

    const clinic = await Clinic.findOne({ slug: clinicSlug.toLowerCase() });
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    const bookingPage = await BookingPage.findOne({ clinicId: clinic._id, slug: bookingSlug.toLowerCase() });
    const service = await Service.findOne({ _id: serviceId, clinicId: clinic._id, status: 'ACTIVE' });
    const doctor = await Doctor.findOne({ _id: doctorId, clinicId: clinic._id, status: 'ACTIVE' });

    if (!service || !doctor) {
      return res.status(400).json({ success: false, message: 'Invalid doctor or service selected' });
    }

    const endTime = addMinutesToTime(startTime, service.duration);

    // CRITICAL Double-Booking Prevention: Concurrency collision check
    const slotCheck = await SlotGenerationService.verifySlotIsFree({
      clinicId: clinic._id,
      doctorId,
      date,
      startTime,
      endTime,
    });

    if (!slotCheck.available) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available. Another patient may have just booked it. Please choose another slot.',
        reason: slotCheck.reason,
      });
    }

    // Extract patient details from form data
    const patientName = formData?.full_name || formData?.fullName || formData?.name || 'Patient';
    const patientPhone = formData?.phone_number || formData?.phone || formData?.mobile || '';
    const patientEmail = formData?.email || '';
    const patientDob = formData?.date_of_birth || formData?.dob || '';
    const patientGender = formData?.gender || 'Male';

    if (!patientPhone) {
      return res.status(400).json({ success: false, message: 'Patient phone number is required in form submission.' });
    }

    // Find or create patient record
    let patient = await Patient.findOne({ clinicId: clinic._id, phone: patientPhone });
    if (!patient) {
      patient = await Patient.create({
        clinicId: clinic._id,
        name: patientName,
        phone: patientPhone,
        email: patientEmail,
        dateOfBirth: patientDob,
        gender: ['Male', 'Female', 'Other', 'Prefer not to say'].includes(patientGender) ? patientGender : 'Male',
        totalVisits: 1,
        lastVisitAt: new Date(),
      });
    } else {
      patient.totalVisits += 1;
      patient.lastVisitAt = new Date();
      if (patientEmail && !patient.email) patient.email = patientEmail;
      await patient.save();
    }

    // Generate unique appointment number: e.g. APT-20261010-4821
    const appointmentNumber = generateAppointmentNumber(date);

    const appointment = await Appointment.create({
      clinicId: clinic._id,
      appointmentNumber,
      patientId: patient._id,
      patientDetails: {
        name: patientName,
        phone: patientPhone,
        email: patientEmail,
        dateOfBirth: patientDob,
        gender: patientGender,
      },
      doctorId: doctor._id,
      serviceId: service._id,
      bookingPageId: bookingPage ? bookingPage._id : null,
      date,
      startTime,
      endTime,
      duration: service.duration,
      status: 'BOOKED',
      bookingSource: bookingSource || 'QR',
      formData: formData || {},
    });

    // Dispatch confirmation notification
    notificationService.dispatchAppointmentNotification({
      clinicId: clinic._id,
      clinicName: clinic.name,
      appointment,
      patient,
      doctor,
      service,
      eventType: 'CONFIRMATION',
      channels: ['WHATSAPP', 'SMS', 'EMAIL'],
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: {
        appointmentNumber: appointment.appointmentNumber,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        doctor: { name: doctor.name, specialization: doctor.specialization },
        service: { name: service.name, duration: service.duration, price: service.price },
        clinic: { name: clinic.name, phone: clinic.phone, address: clinic.address },
        patient: { name: patient.name, phone: patient.phone },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicAppointmentByNumber = async (req, res, next) => {
  try {
    const { appointmentNumber } = req.params;

    const appointment = await Appointment.findOne({ appointmentNumber })
      .populate('clinicId', 'name slug phone email address settings')
      .populate('doctorId', 'name specialization profileImage')
      .populate('serviceId', 'name duration price color');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const cancelPublicAppointment = async (req, res, next) => {
  try {
    const { appointmentNumber } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findOne({ appointmentNumber })
      .populate('clinicId')
      .populate('doctorId')
      .populate('serviceId')
      .populate('patientId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
    }

    appointment.status = 'CANCELLED';
    appointment.cancellationReason = reason || 'Cancelled by patient online';
    await appointment.save();

    // Notification
    notificationService.dispatchAppointmentNotification({
      clinicId: appointment.clinicId._id,
      clinicName: appointment.clinicId.name,
      appointment,
      patient: appointment.patientId,
      doctor: appointment.doctorId,
      service: appointment.serviceId,
      eventType: 'CANCELLED',
    });

    return res.status(200).json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
