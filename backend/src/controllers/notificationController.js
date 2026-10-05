import { Notification } from '../models/Notification.js';
import { NotificationTemplate } from '../models/NotificationTemplate.js';
import { Clinic } from '../models/Clinic.js';
import { notificationService } from '../services/notification/index.js';

export const getNotificationLogs = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await Notification.find({ clinicId: req.clinicId })
      .populate('appointmentId', 'appointmentNumber date startTime')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

export const getNotificationTemplates = async (req, res, next) => {
  try {
    const templates = await NotificationTemplate.find({ clinicId: req.clinicId });
    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationTemplate = async (req, res, next) => {
  try {
    const { eventType, channel, template, subject, isActive } = req.body;

    const updated = await NotificationTemplate.findOneAndUpdate(
      { clinicId: req.clinicId, eventType, channel },
      {
        template,
        ...(subject !== undefined && { subject }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: 'Template saved successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const sendTestNotification = async (req, res, next) => {
  try {
    const { channel, recipientPhone, recipientEmail } = req.body;
    const clinic = await Clinic.findById(req.clinicId);

    const dummyAppointment = {
      appointmentNumber: 'APT-TEST-0001',
      date: new Date().toISOString().slice(0, 10),
      startTime: '10:00 AM',
    };
    const dummyPatient = { name: 'Test Patient', phone: recipientPhone, email: recipientEmail };
    const dummyDoctor = { name: 'Dr. Test Specialist' };
    const dummyService = { name: 'Sample Consultation' };

    await notificationService.dispatchAppointmentNotification({
      clinicId: req.clinicId,
      clinicName: clinic?.name || 'CareFlow Clinic',
      appointment: dummyAppointment,
      patient: dummyPatient,
      doctor: dummyDoctor,
      service: dummyService,
      eventType: 'CONFIRMATION',
      channels: [channel || 'WHATSAPP'],
    });

    return res.status(200).json({ success: true, message: `Test ${channel} notification dispatched successfully!` });
  } catch (error) {
    next(error);
  }
};
