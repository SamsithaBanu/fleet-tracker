import { Kafka } from "kafkajs";
import logger from "../utils/logger.js";

import {
  sendOrderAssignedSMS,
  sendOrderPickedUpSMS,
  sendOrderDeliveredSMS,
  sendOrderFailedSMS,
} from "../services/smsService.js";
import {
  sendNewOrderPush,
  sendOrderCancelledPush,
} from "../services/pushService.js";
import Notification from "../model /Notification.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

// Create consumer with a consumer group ID
// groupId ensures each notification service instance
// processes each message only ONCE even if scaled horizontally
const consumer = kafka.consumer({
  groupId: "notification-group",
});

const startConsumer = async () => {
  try {
    await consumer.connect();
    logger.success("Kafka consumer connected");

    // Subscribe to order events topic
    await consumer.subscribe({
      topic: "order-events",
      fromBeginning: false, // only new messages, not old ones
    });

    // Process each message as it arrives
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          // Parse the Kafka message
          const raw = JSON.parse(message.value.toString());
          const event = raw.event; // e.g. "order.assigned"
          const data = raw.data; // e.g. { orderId, customerPhone, ... }

          logger.info(`Kafka event received: ${event}`, data.orderNumber);

          // Route to correct handler based on event type
          await handleEvent(event, data);
        } catch (err) {
          logger.error("Failed to process Kafka message:", err.message);
          // Don't throw — we don't want one bad message to crash the consumer
        }
      },
    });
  } catch (err) {
    logger.error("Kafka consumer error:", err.message);
    // Retry after 5 seconds
    setTimeout(startConsumer, 5000);
  }
};

// ── Event router ──────────────────────────────
// Each Kafka event triggers specific notifications
export const handleEvent = async (event, data) => {
  const trackingLink = `${FRONTEND_URL}/track/${data.orderNumber}`;

  switch (event) {
    // Order was created and driver auto-assigned
    case "order.assigned": {
      logger.info("Handling order.assigned");

      // SMS to customer — "your order is on the way"
      if (data.customerPhone) {
        await sendOrderAssignedSMS(data.customerPhone, {
          customerName: data.customerName,
          orderNumber: data.orderNumber,
          driverName: data.driverName || "our driver",
          trackingLink,
        });
      }

      // Push to driver — "new order for you"
      if (data.driverFcmToken) {
        await sendNewOrderPush(data.driverFcmToken, {
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          warehouseName: data.warehouseName || "warehouse",
          customerName: data.customerName,
        });
      }
      // ── Save notification record ──
      await Notification.create({
        title: "Order Assigned",
        description: `Order ${data.orderNumber} assigned to ${data.driverName || "driver"}`,
        orderId: data.orderNumber,
        driverId: data.driverId,
        warehouse: data.warehouseName || "",
        type: "order_assigned",
        status: "unread",
      });

      break;
    }

    // Driver picked up from warehouse
    case "order.picked_up": {
      logger.info("Handling order.picked_up");

      if (data.customerPhone) {
        await sendOrderPickedUpSMS(data.customerPhone, {
          customerName: data.customerName,
          orderNumber: data.orderNumber,
          trackingLink,
        });
      }
      await Notification.create({
        title: "Order Picked Up",
        description: `Order ${data.orderNumber} picked up from warehouse`,
        orderId: data.orderNumber,
        type: "order_picked_up",
        status: "unread",
      });
      break;
    }

    // Order successfully delivered
    case "order.delivered": {
      logger.info("Handling order.delivered");

      if (data.customerPhone) {
        await sendOrderDeliveredSMS(data.customerPhone, {
          customerName: data.customerName,
          orderNumber: data.orderNumber,
        });
      }
      await Notification.create({
        title: "Order Delivered",
        description: `Order ${data.orderNumber} delivered successfully`,
        orderId: data.orderNumber,
        type: "order_delivered",
        status: "unread",
      });
      break;
    }

    // Delivery failed
    case "order.failed": {
      logger.info("Handling order.failed");

      if (data.customerPhone) {
        await sendOrderFailedSMS(data.customerPhone, {
          customerName: data.customerName,
          orderNumber: data.orderNumber,
          reason: data.reason || "unknown reason",
        });
      }

      await Notification.create({
        title: "Order Pending",
        description: `Order ${data.orderNumber} failed: ${data.reason}`,
        orderId: data.orderNumber,
        type: "order_failed",
        status: "unread",
      });
      break;
    }

    // No driver available when order created
    case "order.pending_no_driver": {
      logger.warn(`Order ${data.orderNumber} has no driver assigned`);
      // Could send admin alert here in V2
      break;
    }

    default:
      logger.warn(`Unknown event: ${event}`);
  }
};

export { startConsumer };
