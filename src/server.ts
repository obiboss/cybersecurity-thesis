//FOR PRODUCTION USE ONLY
// Load environment variables FIRST
import "dotenv/config";

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { decayRiskPressure, recalcSecurityScore } from "./metrics.js";
import { app } from "./app.js";
import { setIo } from "./websocket.js";

// Server port
const PORT = Number(process.env.PORT) || 8080;

// Shared allowed origins (REST + WS)
export const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://127.0.0.1:5173",
  "http://localhost:5173",
].filter(Boolean);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup (explicit origin check)
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

// Make io available globally
setIo(io);

// ✅ ONLY seed in non-production
if (process.env.NODE_ENV !== "production") {
  await import("./seed.js");
}

setInterval(() => {
  decayRiskPressure(5);
  recalcSecurityScore();
}, 60_000); // every 1 minute

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// FOR DEVELOPMENT PURPOSES ONLY
// import http from "http";
// import { Server as SocketIOServer } from "socket.io";
// import { app } from "./app.js";
// import { setIo } from "./websocket.js";
// import "./seed.js";

// const port = Number(process.env.PORT || 8080);
// const server = http.createServer(app);

// const io = new SocketIOServer(server, {
//   cors: {
//     origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
//     methods: ["GET", "POST", "PATCH"],
//     credentials: true,
//   },
// });

// setIo(io);

// server.listen(port, () => {
//   console.log(`Server listening on http://127.0.0.1:${port}`);
// });
