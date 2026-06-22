import logger from "../utils/logger.js";
import twilio from "twilio";

let twilioClient = null;

const initTwilio = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token || sid.includes("xxx")) {
    logger.warn(
      "Twilio credentials are not set. SMS notifications will be disabled.",
    );
    return null;
  }

  try {
    twilioClient = twilio(sid, token);
    logger.info("Twilio client initialized successfully.");
  } catch (error) {
    logger.error("Error initializing Twilio client.", error);
    return null;
  }
};

// services/notification-service/src/services/smsService.js
// Add this helper at the top

const isValidE164 = (phone) => {
  // E.164 format: + followed by 1-15 digits
  return /^\+[1-9]\d{1,14}$/.test(phone);
};

// Update sendSMS function
const sendSMS = async (to, message) => {
  // Validate phone format first
  if (!isValidE164(to)) {
    logger.warn(
      `Invalid phone format: ${to} — skipping SMS. Must be E.164 like +919876543210`,
    );
    return { success: false, error: "Invalid phone format" };
  }

  if (!twilioClient) {
    logger.warn(`SMS (dev mode) → ${to}: ${message}`);
    return { success: true, dev: true };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    logger.success(`SMS sent → ${to} [${result.sid}]`);
    return { success: true, sid: result.sid };
  } catch (err) {
    logger.error(`SMS failed → ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

// ── Specific SMS templates ────────────────────

// When order is assigned to a driver
const sendOrderAssignedSMS = async (customerPhone, data) => {
  const message =
    `Hi ${data.customerName}! Your QuickDeliver order ${data.orderNumber} ` +
    `has been assigned to ${data.driverName}. ` +
    `Track live: ${data.trackingLink}`;

  return sendSMS(customerPhone, message);
};

// When driver picks up the order
const sendOrderPickedUpSMS = async (customerPhone, data) => {
  const message =
    `Good news ${data.customerName}! Your order ${data.orderNumber} ` +
    `has been picked up and is on the way. ` +
    `Track live: ${data.trackingLink}`;

  return sendSMS(customerPhone, message);
};

// When order is delivered
const sendOrderDeliveredSMS = async (customerPhone, data) => {
  const message =
    `Your order ${data.orderNumber} has been delivered! ` +
    `Thank you for using QuickDeliver. 🎉`;

  return sendSMS(customerPhone, message);
};

// When order fails
const sendOrderFailedSMS = async (customerPhone, data) => {
  const message =
    `We're sorry — your order ${data.orderNumber} could not be delivered. ` +
    `Reason: ${data.reason}. Our team will contact you shortly.`;

  return sendSMS(customerPhone, message);
};

export {
  initTwilio,
  sendSMS,
  sendOrderAssignedSMS,
  sendOrderPickedUpSMS,
  sendOrderDeliveredSMS,
  sendOrderFailedSMS,
};
