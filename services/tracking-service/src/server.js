import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import { initSocket } from "./socket/socketHandler.js";
import { connectMQTT } from "./services/mqttSubscriber.js";
import { connectProducer } from "./services/kafkaProducer.js";
import trackingRoutes from "./routes/trackingRoutes.js";

const app = express();
const server = http.createServer(app); // create HTTP server (Socket.io needs this)
const PORT = process.env.PORT || 3003;

//  socket.io setup

const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      process.env.FRONTEND_URL_PROD || "https://fleet-tracker-cjun4ed3s-samsithabanus-projects.vercel.app",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  transports: ["websocket", "polling"],
});

initSocket(io); // initialize socket handlers

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

//Routes

app.use("/tracking", trackingRoutes);
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "tracking-service", port: PORT });
});

// Start server

const startServer = async () => {
  //connect kafka producer

  await connectProducer();

  //connect MQTT broker

  connectMQTT();

  //start HTTP server (for REST + Socket.io)
  server.listen(PORT, () => {
    console.log(`Tracking service running on port ${PORT}`);
  });
};

startServer();
