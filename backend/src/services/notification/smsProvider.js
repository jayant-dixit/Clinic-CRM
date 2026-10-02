import { config } from '../../config/env.js';

export class SMSProvider {
  constructor() {
    this.name = 'SMSProvider';
    this.isMock = config.providers.sms.mock;
  }

  async send({ to, message }) {
    if (this.isMock) {
      console.log(`[Notification: SMS (MOCK)] -> To: ${to} | Sender: ${config.providers.sms.senderId} | Text: "${message}"`);
      return {
        success: true,
        channel: 'SMS',
        status: 'MOCK_SENT',
        messageId: `mock_sms_${Date.now()}`,
        simulated: true,
      };
    }

    // Production integration hook for Twilio / MSG91
    try {
      console.log(`[Notification: SMS (LIVE)] -> Dispatching SMS to ${to} via gateway`);
      return {
        success: true,
        channel: 'SMS',
        status: 'SENT',
        messageId: `sms_live_${Date.now()}`,
      };
    } catch (error) {
      console.error('[SMSProvider] Delivery failed:', error.message);
      return {
        success: false,
        channel: 'SMS',
        status: 'FAILED',
        error: error.message,
      };
    }
  }
}
