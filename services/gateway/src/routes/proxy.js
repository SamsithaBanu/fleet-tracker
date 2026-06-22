import { createProxyMiddleware } from "http-proxy-middleware";

// Service URLs from environment
const services = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  order: process.env.ORDER_SERVICE_URL || "http://localhost:3012",
  tracking: process.env.TRACKING_SERVICE_URL || "http://localhost:3003",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3004",
};

// Helper — creates a proxy to a target service
const createProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,

    proxyTimeout: 5000,
    timeout: 5000,

    on: {
      proxyReq: (proxyReq, req) => {
        console.log("Proxy:", req.originalUrl, "->", proxyReq.path);
      },

      proxyRes: (proxyRes, req) => {
        console.log(
          `[Proxy Res] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`,
        );
      },

      error: (err, req, res) => {
        console.error(
          "[Proxy Error]",
          req.method,
          req.originalUrl,
          "->",
          err.code || err.message,
        );
        if (res && !res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              message: "Upstream service unavailable",
            }),
          );
        }
      },
    },
  });
};
const registerRoutes = (app) => {
  // ── Auth service ────────────────────────────
  // /api/auth/login → http://localhost:3001/auth/login
  app.use("/api/auth", createProxy(services.auth));
  // ── Order service ───────────────────────────
  // /api/orders → http://localhost:3002/orders
  app.use(
    "/api/orders",
    createProxy(services.order, { "^/api/orders": "/orders" }),
  );

  // /api/drivers → http://localhost:3002/drivers
  app.use(
    "/api/drivers",
    createProxy(services.order, { "^/api/drivers": "/drivers" }),
  );

  // /api/warehouses → http://localhost:3002/warehouses
  app.use(
    "/api/warehouses",
    createProxy(services.order, { "^/api/warehouses": "/warehouses" }),
  );

  // ── Tracking service ────────────────────────
  // /api/tracking → http://localhost:3003/tracking
  app.use(
    "/api/tracking",
    createProxy(services.tracking, { "^/api/tracking": "/tracking" }),
  );

  // ── Notification service ────────────────────
  // /api/notifications → http://localhost:3004
  app.use(
    "/api/notifications",
    createProxy(services.notification, { "^/api/notifications": "" }),
  );

  console.log("✅ All proxy routes registered");
};

export default registerRoutes;
