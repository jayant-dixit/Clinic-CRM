import { WhatsAppProvider } from './whatsappProvider.js';
import { SMSProvider } from './smsProvider.js';
import { EmailProvider } from './emailProvider.js';
import { NotificationTemplate } from '../../models/NotificationTemplate.js';
import { Notification } from '../../models/Notification.js';
import { interpolateTemplate } from '../../utils/helpers.js';

class NotificationService {
  constructor() {
    this.whatsapp = new WhatsAppProvider();
    this.sms = new SMSProvider();
    this.email = new EmailProvider();

    this.defaultTemplates = {
      CONFIRMATION: 'Hello {{patientName}}, your appointment with {{doctorName}} for {{serviceName}} is confirmed for {{date}} at {{time}} at {{clinicName}}. Ref ID: {{appointmentId}}.',
      REMINDER: 'Reminder: Hello {{patientName}}, your appointment with {{doctorName}} is tomorrow at {{time}} at {{clinicName}}.',
      RESCHEDULED: 'Hello {{patientName}}, your appointment with {{doctorName}} has been rescheduled to {{date}} at {{time}} at {{clinicName}}.',
      CANCELLED: 'Hello {{patientName}}, your appointment with {{doctorName}} for {{date}} at {{time}} has been cancelled.',
      FOLLOW_UP: 'Hello {{patientName}}, your follow-up consultation with {{doctorName}} is scheduled for {{date}} at {{time}} at {{clinicName}}.',
      THANK_YOU: 'Thank you for visiting {{clinicName}}, {{patientName}}! Please take care and reach out if you need any assistance.',
    };
  }

  async dispatchAppointmentNotification({
    clinicId,
    clinicName,
    appointment,
    patient,
    doctor,
    service,
    eventType,
    channels = ['WHATSAPP', 'SMS'],
  }) {
    try {
      const variables = {
        patientName: patient?.name || appointment?.patientDetails?.name || 'Patient',
        doctorName: doctor?.name || 'Doctor',
        serviceName: service?.name || 'Consultation',
        date: appointment?.date || '',
        time: appointment?.startTime || '',
        clinicName: clinicName || 'CareSlot Clinic',
        appointmentId: appointment?.appointmentNumber || '',
      };

      const recipientPhone = patient?.phone || appointment?.patientDetails?.phone;
      const recipientEmail = patient?.email || appointment?.patientDetails?.email;

      for (const channel of channels) {
        // Fetch customized template if clinic configured one
        const customTemplate = await NotificationTemplate.findOne({
          clinicId,
          eventType,
          channel,
          isActive: true,
        });

        const rawText = customTemplate?.template || this.defaultTemplates[eventType] || this.defaultTemplates.CONFIRMATION;
        const messageText = interpolateTemplate(rawText, variables);

        let providerRes = null;

        if (channel === 'WHATSAPP' && recipientPhone) {
          providerRes = await this.whatsapp.send({
            to: recipientPhone,
            message: messageText,
            templateData: variables,
          });
        } else if (channel === 'SMS' && recipientPhone) {
          providerRes = await this.sms.send({
            to: recipientPhone,
            message: messageText,
          });
        } else if (channel === 'EMAIL' && recipientEmail) {
          const subject = customTemplate?.subject
            ? interpolateTemplate(customTemplate.subject, variables)
            : `Appointment ${eventType.toLowerCase()} - ${clinicName}`;

          providerRes = await this.email.send({
            to: recipientEmail,
            subject,
            message: messageText,
          });
        }

        // Store log in Notification collection for audit & analytics
        if (providerRes) {
          await Notification.create({
            clinicId,
            appointmentId: appointment?._id || null,
            recipientName: variables.patientName,
            recipientPhone: recipientPhone || '',
            recipientEmail: recipientEmail || '',
            channel,
            eventType,
            message: messageText,
            status: providerRes.status || 'SENT',
            providerResponse: providerRes,
          });
        }
      }
    } catch (err) {
      console.error('[NotificationService] Dispatch error:', err.message);
    }
  }
}

export const notificationService = new NotificationService();
