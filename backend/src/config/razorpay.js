import dotenv from 'dotenv';
import Razorpay from 'razorpay';

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_leafinlife123';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'leafinlife_test_secret_9988';
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'leafinlife_webhook_secret_9988';

export const razorpayInstance = new Razorpay({
  key_id,
  key_secret,
});

export const RAZORPAY_CONFIG = {
  keyId: key_id,
  keySecret: key_secret,
  webhookSecret: webhook_secret,
};

