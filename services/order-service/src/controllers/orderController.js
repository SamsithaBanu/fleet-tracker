import Order from "../models/Order.js";
import Driver from "../models/Driver.js";
import Warehouse from "../models/Warehouse.js";
import redis from "../utils/redisClient.js";
import { autoAssignDriver } from "../services/autoAssign.js";
import { publishEvent } from "../services/kafkaProducer.js";

// Generate a readable order ID like ORD-001
const generateOrderId = async () => {
  const count = await Order.countDocuments();
  const num = String(count + 1).padStart(3, "0");
  return `ORD-${num}`;
};

export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      warehouseId,
      priority,
      notes,
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !deliveryAddress || !warehouseId) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone, address and warehouse are required",
      });
    }

    // Get warehouse details (we need its location for auto-assign)
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // Generate unique order ID
    const orderId = await generateOrderId();

    // Create the order in MongoDB
    const order = await Order.create({
      orderId,
      customer: {
        name: customerName,
        phone: customerPhone,
      },
      deliveryAddress: {
        text: deliveryAddress,
        lat: parseFloat(deliveryLat) || 0,
        lng: parseFloat(deliveryLng) || 0,
      },
      warehouseId,
      priority: priority || "normal",
      notes: notes || "",
    });

    console.log(`📦 Order created: ${orderId}`);

    // ── AUTO ASSIGN DRIVER ──────────────────
    const nearest = await autoAssignDriver(warehouse);

    if (nearest) {
      // Assign the nearest driver to this order
      order.driverId = nearest.driverId;
      order.status = "assigned";
      order.timeline.assignedAt = new Date();
      await order.save();

      // Mark driver as busy in Redis
      await redis.set(`driver:${nearest.driverId}:busy`, order._id.toString());

      // Update driver record in MongoDB
      await Driver.findByIdAndUpdate(nearest.driverId, {
        currentOrderId: order._id,
      });

      console.log(`🛵 Auto-assigned to driver: ${nearest.driverId}`);

      // ── ADD THIS BLOCK HERE ─────────────────
      // Get driver FCM token and name for push notification
      let driverFcmToken = null;
      let driverName = null;

      const assignedDriver = await Driver.findById(nearest.driverId);
      driverFcmToken = assignedDriver?.fcmToken || null;
      driverName = assignedDriver?.name || null;
      // ── END ADD ─────────────────────────────

      // Publish event to Kafka — notification service will send SMS + push
      // REPLACE the old publishEvent with this one:
      await publishEvent("order-events", "order.assigned", {
        orderId: order._id.toString(),
        orderNumber: orderId,
        driverId: nearest.driverId,
        driverName, // ← added
        driverFcmToken, // ← added (for Firebase push)
        customerPhone,
        customerName,
        deliveryAddress,
        warehouseName: warehouse.name, // ← added
      });
    } else {
      // No driver available — order stays pending
      console.log(`⚠️  No driver available for order ${orderId}`);

      await publishEvent("order-events", "order.pending_no_driver", {
        orderId: order._id.toString(),
        orderNumber: orderId,
      });
    }

    // Return the created order
    const populatedOrder = await Order.findById(order._id)
      .populate("warehouseId", "name address")
      .populate("driverId", "name phone");

    res.status(201).json({
      success: true,
      message: nearest
        ? `Order created and assigned to nearest driver`
        : `Order created — no driver available right now`,
      data: { order: populatedOrder },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── GET ALL ORDERS ────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const { status, warehouseId, page = 1, limit = 20, date } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (warehouseId) filter.warehouseId = warehouseId;

    // Filter by date if provided
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(filter)
      .populate("warehouseId", "name")
      .populate("driverId", "name phone")
      .sort({ createdAt: -1 }) // newest first
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE ORDER ──────────────────────────
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("warehouseId", "name address location")
      .populate("driverId", "name phone rating");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate("driverId", "name phone")
      .populate("warehouseId", "name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get driver live location from Redis
    let driverLocation = null;
    if (order.driverId) {
      const loc = await redis.get(`driver:${order.driverId._id}:location`);
      if (loc) driverLocation = JSON.parse(loc);
    }

    res.json({
      success: true,
      data: {
        order: {
          orderId: order.orderId,
          status: order.status,
          customer: order.customer,
          deliveryAddress: order.deliveryAddress,
          timeline: order.timeline,
          driver: order.driverId
            ? { name: order.driverId.name, phone: order.driverId.phone }
            : null,
          driverLocation,
          warehouse: order.warehouseId?.name,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markPickedUp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: `Cannot mark picked up — current status is ${order.status}`,
      });
    }

    order.status = "picked_up";
    order.timeline.pickedUpAt = new Date();
    await order.save();

    // Publish Kafka event
    await publishEvent("order-events", "order.picked_up", {
      orderId: order._id.toString(),
      orderNumber: order.orderId,
      driverId: order.driverId?.toString(),
      customerPhone: order.customer.phone,
    });

    res.json({
      success: true,
      message: "Order marked as picked up",
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (!["picked_up", "in_transit"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot deliver — current status is ${order.status}`,
      });
    }

    // Get proof photo path if uploaded
    const proofPhoto = req.file ? req.file.path : null;

    order.status = "delivered";
    order.timeline.deliveredAt = new Date();
    if (proofPhoto) order.proofPhoto = proofPhoto;
    await order.save();

    // Free up driver in Redis
    if (order.driverId) {
      await redis.del(`driver:${order.driverId}:busy`);

      // Update driver total deliveries count
      await Driver.findByIdAndUpdate(order.driverId, {
        $inc: { totalDeliveries: 1 },
      });
    }

    // Publish Kafka event — notification service sends "Delivered!" SMS
    await publishEvent("order-events", "order.delivered", {
      orderId: order._id.toString(),
      orderNumber: order.orderId,
      driverId: order.driverId?.toString(),
      customerPhone: order.customer.phone,
      customerName: order.customer.name,
    });

    res.json({
      success: true,
      message: "Order marked as delivered",
      data: { order },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── MARK FAILED ───────────────────────────────
export const markFailed = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = "failed";
    order.timeline.failedAt = new Date();
    order.failReason = reason || "No reason provided";
    await order.save();

    // Free up driver
    if (order.driverId) {
      await redis.del(`driver:${order.driverId}:busy`);
    }

    // Publish Kafka event
    await publishEvent("order-events", "order.failed", {
      orderId: order._id.toString(),
      orderNumber: order.orderId,
      customerPhone: order.customer.phone,
            // customerName: order.customer.name,
      reason: order.failReason,
    });

    res.json({
      success: true,
      message: "Order marked as failed",
      data: { order },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET LIVE ORDERS (kanban board) ────────────
export const getLiveOrders = async (req, res) => {
  try {
    const liveStatuses = ["pending", "assigned", "picked_up", "in_transit"];

    const orders = await Order.find({ status: { $in: liveStatuses } })
      .populate("driverId", "name phone")
      .populate("warehouseId", "name")
      .sort({ createdAt: -1 });

    // Group by status for kanban board
    const grouped = {
      pending: orders.filter((o) => o.status === "pending"),
      assigned: orders.filter((o) => o.status === "assigned"),
      picked_up: orders.filter((o) => o.status === "picked_up"),
      in_transit: orders.filter((o) => o.status === "in_transit"),
    };

    res.json({ success: true, data: { orders: grouped } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ANALYTICS SUMMARY ─────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, deliveredToday, failedToday, pendingNow] =
      await Promise.all([
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.countDocuments({
          status: "delivered",
          createdAt: { $gte: today },
        }),
        Order.countDocuments({ status: "failed", createdAt: { $gte: today } }),
        Order.countDocuments({
          status: { $in: ["pending", "assigned", "picked_up", "in_transit"] },
        }),
      ]);

    const onlineDriverCount = await redis.scard("drivers:online");

    res.json({
      success: true,
      data: {
        totalToday,
        deliveredToday,
        failedToday,
        pendingNow,
        onlineDrivers: onlineDriverCount,
        successRate:
          totalToday > 0 ? ((deliveredToday / totalToday) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
