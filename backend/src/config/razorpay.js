import dotenv from 'dotenv';
import Razorpay from 'razorpay';

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export const razorpayInstance = key_id && key_secret
  ? new Razorpay({ key_id, key_secret })
  : new Razorpay({ key_id: 'rzp_placeholder', key_secret: 'placeholder_secret' });

export const RAZORPAY_CONFIG = {
  keyId: key_id,
  keySecret: key_secret,
  webhookSecret: webhook_secret,
};

