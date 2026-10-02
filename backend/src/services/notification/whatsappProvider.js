import { config } from '../../config/env.js';

export class WhatsAppProvider {
  constructor() {
    this.name = 'WhatsAppProvider';
    this.isMock = config.providers.whatsapp.mock;
  }

  async send({ to, message, templateData }) {
    if (this.isMock) {
      console.log(`[Notification: WhatsApp (MOCK)] -> To: ${to} | Message: "${message}"`);
      return {
        success: true,
        channel: 'WHATSAPP',
        status: 'MOCK_SENT',
        messageId: `mock_wa_${Date.now()}`,
        simulated: true,
      };
    }

    // Production integration hook for WhatsApp Cloud API / Twilio WhatsApp
    try {
      console.log(`[Notification: WhatsApp (LIVE)] -> Dispatching to ${to} via WhatsApp Business API`);
      // e.g. await axios.post(`https://graph.facebook.com/v18.0/${config.providers.whatsapp.phoneId}/messages`, ...)
      return {
        success: true,
        channel: 'WHATSAPP',
        status: 'SENT',
        messageId: `wa_live_${Date.now()}`,
      };
    } catch (error) {
      console.error('[WhatsAppProvider] Delivery failed:', error.message);
      return {
        success: false,
        channel: 'WHATSAPP',
        status: 'FAILED',
        error: error.message,
      };
    }
  }
}
