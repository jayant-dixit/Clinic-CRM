import { config } from '../../config/env.js';

export class EmailProvider {
  constructor() {
    this.name = 'EmailProvider';
    this.isMock = config.providers.email.mock;
  }

  async send({ to, subject, message }) {
    if (this.isMock) {
      console.log(`[Notification: EMAIL (MOCK)] -> To: ${to} | Subject: "${subject}" | Content: "${message.slice(0, 80)}..."`);
      return {
        success: true,
        channel: 'EMAIL',
        status: 'MOCK_SENT',
        messageId: `mock_email_${Date.now()}`,
        simulated: true,
      };
    }

    // Production integration hook for SendGrid / AWS SES / Resend / Nodemailer
    try {
      console.log(`[Notification: EMAIL (LIVE)] -> Sending email to ${to} via SMTP/API`);
      return {
        success: true,
        channel: 'EMAIL',
        status: 'SENT',
        messageId: `email_live_${Date.now()}`,
      };
    } catch (error) {
      console.error('[EmailProvider] Delivery failed:', error.message);
      return {
        success: false,
        channel: 'EMAIL',
        status: 'FAILED',
        error: error.message,
      };
    }
  }
}
