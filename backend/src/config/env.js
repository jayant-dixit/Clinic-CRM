import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careflow_db',
  jwtSecret: process.env.JWT_SECRET || 'careflow_super_secret_jwt_key_2026_dev',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  env: process.env.NODE_ENV || 'development',
  providers: {
    whatsapp: {
      apiKey: process.env.WHATSAPP_API_KEY || '',
      phoneId: process.env.WHATSAPP_PHONE_ID || '',
      mock: !process.env.WHATSAPP_API_KEY
    },
    sms: {
      apiKey: process.env.SMS_API_KEY || '',
      senderId: process.env.SMS_SENDER_ID || 'CAREFLOW',
      mock: !process.env.SMS_API_KEY
    },
    email: {
      apiKey: process.env.EMAIL_API_KEY || '',
      from: process.env.EMAIL_FROM || 'no-reply@careflow.com',
      mock: !process.env.EMAIL_API_KEY
    }
  }
};
