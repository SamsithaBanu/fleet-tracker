import mqtt from "mqtt";
import redis from "../utils/redisClient.js";
import { emitLocationUpdate } from "../socket/socketHandler.js";
import { publishLocationEvent } from "./kafkaProducer.js";

let mqttClient = null;

const connectMQTT = () => {
  // Connect to Mosquitto broker
  mqttClient = mqtt.connect(
    process.env.MQTT_BROKER || "mqtt://localhost:1883",
    {
      clientId: `tracking-service-${Date.now()}`,
      reconnectPeriod: 3000, // auto-reconnect every 3s if disconnected
    },
  );

  // ── On connected ──────────────────────────────
  mqttClient.on("connect", () => {
    console.log("✅ MQTT broker connected");

    // Subscribe to ALL driver location topics
    // + is a wildcard — matches any driverId
    mqttClient.subscribe("grocery/driver/+/location", { qos: 1 }, (err) => {
      if (err) {
        console.error("❌ MQTT subscribe error:", err);
      } else {
        console.log("📡 Subscribed to grocery/driver/+/location");
      }
    });
  });

  // ── On message received ───────────────────────
  // This runs every time a driver sends their GPS
  mqttClient.on("message", async (topic, message) => {
    try {
      // topic looks like: grocery/driver/DRIVER123/location
      // Extract the driverId from the topic
      const parts = topic.split("/");
      const driverId = parts[2]; // index 2 is the driverId

      // Parse the JSON message from driver
      const payload = JSON.parse(message.toString());
      const { lat, lng, speed = 0, orderId = null } = payload;

      // Validate coordinates
      if (!lat || !lng) {
        console.warn("⚠️  Invalid GPS payload:", payload);
        return;
      }

      // Build location object
      const locationData = {
        lat,
        lng,
        speed,
        orderId,
        driverId,
        timestamp: Date.now(),
      };

      console.log(
        `📍 GPS received — Driver: ${driverId} → ${lat}, ${lng} @ ${speed}km/h`,
      );

      // ── Step 1: Save to Redis ──────────────────
      // TTL = 30 seconds — if no update in 30s, location is stale
      await redis.setex(
        `driver:${driverId}:location`,
        30,
        JSON.stringify(locationData),
      );

      // ── Step 2: Push via Socket.io ────────────
      // This makes the map marker move in the browser instantly
      emitLocationUpdate(driverId, locationData);

      // ── Step 3: Publish to Kafka ──────────────
      // Analytics and other services can consume this
      await publishLocationEvent(locationData);
    } catch (err) {
      console.error("❌ MQTT message error:", err.message);
    }
  });

  // ── On error ──────────────────────────────────
  mqttClient.on("error", (err) => {
    console.error("❌ MQTT error:", err.message);
  });

  // ── On disconnect ─────────────────────────────
  mqttClient.on("close", () => {
    console.log("🔌 MQTT disconnected — will auto-reconnect...");
  });
};

export { connectMQTT };
