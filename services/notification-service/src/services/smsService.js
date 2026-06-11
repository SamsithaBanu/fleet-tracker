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

const sendSMS = async (to, message) => {
  if (!twilioClient) {
    // Log instead of sending when in dev mode
    logger.warn(`SMS (dev mode) → ${to}: ${message}`);
    return { success: true, dev: true };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.success(`SMS sent to ${to}[${result.sid}]`);
    return { success: true, sid: result.sid };
  } catch (error) {
    logger.error(`Error sending SMS to ${to}: ${error.message}`);
    return { success: false, error: error.message };
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
