import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Service } from '../models/Service.js';
import { Clinic } from '../models/Clinic.js';
import { Queue } from '../models/Queue.js';
import { SlotGenerationService } from '../services/slotGenerationService.js';
import { notificationService } from '../services/notification/index.js';
import { generateAppointmentNumber, addMinutesToTime } from '../utils/helpers.js';

export const getAppointments = async (req, res, next) => {
  try {
    const { date, startDate, endDate, doctorId, serviceId, status, search, limit = 100 } = req.query;

    const query = { clinicId: req.clinicId };

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (doctorId && doctorId !== 'all') {
      query.doctorId = doctorId;
    }

    if (serviceId && serviceId !== 'all') {
      query.serviceId = serviceId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { 'patientDetails.name': { $regex: search, $options: 'i' } },
        { 'patientDetails.phone': { $regex: search, $options: 'i' } },
        { appointmentNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const appointments = await Appointment.find(query)
      .populate('patientId')
      .populate('doctorId', 'name specialization profileImage')
      .populate('serviceId', 'name duration price color')
      .populate('bookingPageId', 'title slug')
      .sort({ date: 1, startTime: 1 })
      .limit(Number(limit));

    return res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const getTodayAppointmentStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const appointments = await Appointment.find({ clinicId: req.clinicId, date: today })
      .populate('doctorId', 'name specialization')
      .populate('serviceId', 'name duration price color')
      .sort({ startTime: 1 });

    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    const waiting = appointments.filter((a) => a.status === 'WAITING' || a.status === 'ARRIVED').length;
    const upcoming = appointments.filter((a) => a.status === 'BOOKED' || a.status === 'CONFIRMED').length;
    const inProgress = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;
    const noShow = appointments.filter((a) => a.status === 'NO_SHOW').length;

    return res.status(200).json({
      success: true,
      data: {
        date: today,
        metrics: {
          total,
          completed,
          waiting,
          upcoming,
          inProgress,
          cancelled,
          noShow,
        },
        timeline: appointments.map((a) => ({
          id: a._id,
          appointmentNumber: a.appointmentNumber,
          time: a.startTime,
          patientName: a.patientDetails?.name || 'Patient',
          doctorName: a.doctorId?.name || 'Doctor',
          serviceName: a.serviceId?.name || 'Service',
          status: a.status,
          queueToken: a.queueToken,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, clinicId: req.clinicId })
      .populate('patientId')
      .populate('doctorId')
      .populate('serviceId')
      .populate('bookingPageId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const createManualAppointment = async (req, res, next) => {
  try {
    const {
      isNewPatient,
      patientId,
      newPatientData,
      doctorId,
      serviceId,
      date,
      startTime,
      bookingSource = 'RECEPTION',
      internalNotes,
    } = req.body;

    const clinic = await Clinic.findById(req.clinicId);
    const service = await Service.findOne({ _id: serviceId, clinicId: req.clinicId });
    const doctor = await Doctor.findOne({ _id: doctorId, clinicId: req.clinicId });

    if (!service || !doctor) {
      return res.status(400).json({ success: false, message: 'Doctor or Service not found' });
    }

    const endTime = addMinutesToTime(startTime, service.duration);

    // Collision check
    const slotCheck = await SlotGenerationService.verifySlotIsFree({
      clinicId: req.clinicId,
      doctorId,
      date,
      startTime,
      endTime,
    });

    if (!slotCheck.available) {
      return res.status(409).json({ success: false, message: slotCheck.reason });
    }

    // Patient resolution
    let patient = null;
    if (isNewPatient || !patientId) {
      if (!newPatientData?.name || !newPatientData?.phone) {
        return res.status(400).json({ success: false, message: 'Patient name and phone are required' });
      }

      patient = await Patient.findOne({ clinicId: req.clinicId, phone: newPatientData.phone });
      if (!patient) {
        patient = await Patient.create({
          clinicId: req.clinicId,
          name: newPatientData.name,
          phone: newPatientData.phone,
          email: newPatientData.email || '',
          gender: newPatientData.gender || 'Male',
          dateOfBirth: newPatientData.dateOfBirth || '',
          address: newPatientData.address || '',
          totalVisits: 1,
          lastVisitAt: new Date(),
        });
      } else {
        patient.totalVisits += 1;
        patient.lastVisitAt = new Date();
        await patient.save();
      }
    } else {
      patient = await Patient.findOne({ _id: patientId, clinicId: req.clinicId });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Existing patient not found' });
      }
      patient.totalVisits += 1;
      patient.lastVisitAt = new Date();
      await patient.save();
    }

    const appointmentNumber = generateAppointmentNumber(date);

    const appointment = await Appointment.create({
      clinicId: req.clinicId,
      appointmentNumber,
      patientId: patient._id,
      patientDetails: {
        name: patient.name,
        phone: patient.phone,
        email: patient.email || '',
        gender: patient.gender || 'Male',
        dateOfBirth: patient.dateOfBirth || '',
      },
      doctorId: doctor._id,
      serviceId: service._id,
      date,
      startTime,
      endTime,
      duration: service.duration,
      status: 'CONFIRMED',
      bookingSource: bookingSource || 'RECEPTION',
      internalNotes: internalNotes || '',
    });

    // Notify patient
    notificationService.dispatchAppointmentNotification({
      clinicId: req.clinicId,
      clinicName: clinic.name,
      appointment,
      patient,
      doctor,
      service,
      eventType: 'CONFIRMATION',
    });

    return res.status(201).json({ success: true, message: 'Appointment created successfully', data: appointment });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason, internalNotes } = req.body;

    const appointment = await Appointment.findOne({ _id: req.params.id, clinicId: req.clinicId })
      .populate('patientId')
      .populate('doctorId')
      .populate('serviceId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;
    if (internalNotes !== undefined) appointment.internalNotes = internalNotes;

    // Queue integration: If status transitions to ARRIVED or WAITING, assign queue token if not present
    if (['ARRIVED', 'WAITING'].includes(status) && !appointment.queueToken) {
      let queue = await Queue.findOne({ clinicId: req.clinicId, date: appointment.date });
      if (!queue) {
        queue = await Queue.create({ clinicId: req.clinicId, date: appointment.date, currentTokenSeq: 0, items: [] });
      }
      queue.currentTokenSeq += 1;
      const tokenNumber = `#${String(queue.currentTokenSeq).padStart(2, '0')}`;
      appointment.queueToken = tokenNumber;

      queue.items.push({
        appointmentId: appointment._id,
        tokenNumber,
        tokenSeq: queue.currentTokenSeq,
        patientName: appointment.patientDetails?.name || 'Patient',
        patientPhone: appointment.patientDetails?.phone || '',
        doctorName: appointment.doctorId?.name || 'Doctor',
        serviceName: appointment.serviceId?.name || 'Service',
        status: 'WAITING',
      });
      await queue.save();
    }

    if (status === 'COMPLETED') {
      // Sync queue item
      await Queue.updateOne(
        { clinicId: req.clinicId, date: appointment.date, 'items.appointmentId': appointment._id },
        { $set: { 'items.$.status': 'COMPLETED' } }
      );
      // Update patient stats
      if (appointment.patientId) {
        await Patient.updateOne(
          { _id: appointment.patientId },
          { $set: { lastVisitAt: new Date() } }
        );
      }
    }

    await appointment.save();

    // Notification on cancellation
    if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
      const clinic = await Clinic.findById(req.clinicId);
      notificationService.dispatchAppointmentNotification({
        clinicId: req.clinicId,
        clinicName: clinic.name,
        appointment,
        patient: appointment.patientId,
        doctor: appointment.doctorId,
        service: appointment.serviceId,
        eventType: 'CANCELLED',
      });
    }

    return res.status(200).json({ success: true, message: `Status updated to ${status}`, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, startTime, doctorId } = req.body;

    const appointment = await Appointment.findOne({ _id: req.params.id, clinicId: req.clinicId })
      .populate('patientId')
      .populate('doctorId')
      .populate('serviceId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const assignedDoctorId = doctorId || appointment.doctorId._id;
    const service = appointment.serviceId;
    const endTime = addMinutesToTime(startTime, service.duration);

    // Concurrency collision check
    const slotCheck = await SlotGenerationService.verifySlotIsFree({
      clinicId: req.clinicId,
      doctorId: assignedDoctorId,
      date,
      startTime,
      endTime,
      excludeAppointmentId: appointment._id,
    });

    if (!slotCheck.available) {
      return res.status(409).json({ success: false, message: slotCheck.reason });
    }

    appointment.date = date;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.doctorId = assignedDoctorId;
    appointment.status = 'CONFIRMED';
    await appointment.save();

    // Notify patient
    const clinic = await Clinic.findById(req.clinicId);
    notificationService.dispatchAppointmentNotification({
      clinicId: req.clinicId,
      clinicName: clinic.name,
      appointment,
      patient: appointment.patientId,
      doctor: appointment.doctorId,
      service: appointment.serviceId,
      eventType: 'RESCHEDULED',
    });

    return res.status(200).json({ success: true, message: 'Appointment rescheduled successfully', data: appointment });
  } catch (error) {
    next(error);
  }
};

export const scheduleFollowUpAppointment = async (req, res, next) => {
  try {
    const { recommendedDate, startTime, doctorId, serviceId, notes } = req.body;

    const originalAppointment = await Appointment.findOne({ _id: req.params.id, clinicId: req.clinicId })
      .populate('patientId')
      .populate('doctorId')
      .populate('serviceId');

    if (!originalAppointment) {
      return res.status(404).json({ success: false, message: 'Original appointment not found' });
    }

    const clinic = await Clinic.findById(req.clinicId);
    const targetDoctorId = doctorId || originalAppointment.doctorId._id;
    const targetServiceId = serviceId || originalAppointment.serviceId._id;

    const service = await Service.findById(targetServiceId);
    const doctor = await Doctor.findById(targetDoctorId);
    const endTime = addMinutesToTime(startTime, service.duration);

    // Collision check
    const slotCheck = await SlotGenerationService.verifySlotIsFree({
      clinicId: req.clinicId,
      doctorId: targetDoctorId,
      date: recommendedDate,
      startTime,
      endTime,
    });

    if (!slotCheck.available) {
      return res.status(409).json({ success: false, message: slotCheck.reason });
    }

    const appointmentNumber = generateAppointmentNumber(recommendedDate);

    const followUpApt = await Appointment.create({
      clinicId: req.clinicId,
      appointmentNumber,
      patientId: originalAppointment.patientId._id,
      patientDetails: originalAppointment.patientDetails,
      doctorId: targetDoctorId,
      serviceId: targetServiceId,
      date: recommendedDate,
      startTime,
      endTime,
      duration: service.duration,
      status: 'CONFIRMED',
      bookingSource: 'ADMIN',
      internalNotes: `Follow-up to ${originalAppointment.appointmentNumber}. ${notes || ''}`,
    });

    originalAppointment.followUp = {
      isScheduled: true,
      recommendedDate,
      notes: notes || '',
      followUpAppointmentId: followUpApt._id,
    };
    await originalAppointment.save();

    // Send FOLLOW_UP notification
    notificationService.dispatchAppointmentNotification({
      clinicId: req.clinicId,
      clinicName: clinic.name,
      appointment: followUpApt,
      patient: originalAppointment.patientId,
      doctor,
      service,
      eventType: 'FOLLOW_UP',
    });

    return res.status(201).json({
      success: true,
      message: 'Follow-up appointment scheduled successfully',
      data: followUpApt,
    });
  } catch (error) {
    next(error);
  }
};
