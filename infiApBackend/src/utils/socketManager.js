const jwt = require("jsonwebtoken");

let io = null;

// Maps userId -> Set of socket ids
const userSockets = new Map();

/**
 * Initialize Socket.IO with the HTTP server and JWT auth middleware.
 */
function initSocketManager(httpServer) {
  const { Server } = require("socket.io");
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const configuredOrigins = (process.env.CORS_ORIGIN || "")
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);
        const isLocal = !origin || /^https?:\/\/(localhost|127\.0\.0\.1)/.test(origin);
        if (!origin || configuredOrigins.includes(origin) || isLocal) {
          return callback(null, true);
        }
        callback(null, false);
      },
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;
      if (!token) {
        return next(new Error("Authentication error: token missing"));
      }
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = String(decoded._id);
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    // Register socket under userId
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    socket.join(`user_${userId}`);
    socket.join(`role_${socket.userRole || "unknown"}`);

    socket.on("disconnect", () => {
      const set = userSockets.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  console.log("[SocketManager] Initialized");
  return io;
}

/**
 * Emit a real-time event to a specific user if they are online.
 */
function emitToUser(userId, event, payload) {
  if (!io) return;
  const room = `user_${String(userId)}`;
  io.to(room).emit(event, payload);
}

/**
 * Emit a real-time event to all online users with given roles.
 */
function emitToRoles(roles, event, payload) {
  if (!io || !Array.isArray(roles)) return;
  roles.forEach((role) => {
    const room = `role_${String(role)}`;
    io.to(room).emit(event, payload);
  });
}

/**
 * Broadcast to all connected clients.
 */
function broadcast(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

function getIO() {
  return io;
}

module.exports = {
  initSocketManager,
  emitToUser,
  emitToRoles,
  broadcast,
  getIO,
};
