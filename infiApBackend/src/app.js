const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const logger = require("./utils/logger");

dotenv.config({
  path: "./.env",
});

const compression = require("compression");
const { generalLimiter } = require("./middlewares/security.middleware");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");
app.set("trust proxy", 1);

const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalOrigin = (origin) => {
  // Allow localhost, 127.0.0.1, and private IP ranges (10.x, 172.16-31.x, 192.168.x)
  const localPattern = /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/i;
  return localPattern.test(origin);
};

const allowCorsOrigin = (origin, callback) => {
  if (!origin) {
    return callback(null, true);
  }

  if (configuredOrigins.includes(origin)) {
    return callback(null, true);
  }

  if (!isProduction && isLocalOrigin(origin)) {
    return callback(null, true);
  }

  return callback(null, false);
};

app.use(
  helmet({
    hsts: isProduction
      ? {
          maxAge: 15552000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbState = mongoose.connection.readyState;

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? "ok" : "degraded",
    db: dbState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
  });
});

// 1. Gzip Compression for performance
app.use(compression());

// Middleware
app.use(cors({
  origin: allowCorsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

app.use("/api", generalLimiter);

// 301 Redirect Middleware (Example: force https/www if needed)
app.use((req, res, next) => {
  // if (req.headers['x-forwarded-proto'] !== 'https') {
  //   return res.redirect(301, `https://${req.headers.host}${req.url}`);
  // }
  next();
});

// 2. Caching Headers for performance
app.use((req, res, next) => {
  if (req.method === 'GET') {
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.set('Cache-Control', 'no-store');
    }
  }
  next();
});

app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: true, limit: "6mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import Routes
const authRouter = require("./routes/auth.routes");
const mainAdminRouter = require("./routes/mainAdmin.routes");
const employeeRouter = require("./routes/employee.routes");
const leaveRouter = require("./routes/leave.routes");
const hrRouter = require("./routes/hr.routes");
const adminDashboardRouter = require("./routes/adminDashboard.routes");
const mainAdminDashboardRouter = require("./routes/mainAdminDashboard.routes");
const wfhRouter = require("./routes/wfh.routes");
const eventRouter = require("./routes/event.routes");
const notificationsRouter = require("./routes/notifications.routes");
const requestRoomRouter = require("./routes/requestRoom.routes");

// Routes Declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/auth", authRouter);
app.use("/api/v1/main-admin", mainAdminRouter);
app.use("/api/v1", employeeRouter);
app.use("/api/v1", leaveRouter);
app.use("/api/v1/hr", hrRouter);
app.use("/api/v1/admin-dashboard", adminDashboardRouter);
app.use("/api/v1/main-admin-dashboard", mainAdminDashboardRouter);
app.use("/api/v1/wfh", wfhRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/request-rooms", requestRoomRouter);

// Basic health check
app.get("/", (req, res) => {
  res.json({ message: "InfiAP Tech Solution API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Server error", { error: err.message, stack: err.stack });

  const statusCode = err.status || 500;
  const message = statusCode >= 500 ? "Internal Server Error" : err.message || "Request failed";

  res.status(statusCode).json({
    message,
  });
});

module.exports = app;
