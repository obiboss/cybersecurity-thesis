import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { simulationsRouter } from "./routes/simulations.js";
import { incidentsRouter } from "./routes/incidents.js";
import { auditRouter } from "./routes/audit.js";
import { metricsRouter } from "./routes/metrics.js";

export const app = express();

// ✅ Explicit CORS configuration (FIXES pending preflight)
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Explicitly handle OPTIONS (CRITICAL)
app.options("*", cors());

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "NCS Cybersecurity Demonstration API (Simulation Only)",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/simulations", simulationsRouter);
app.use("/api/incidents", incidentsRouter);
app.use("/api/audit-logs", auditRouter);
app.use("/api/metrics", metricsRouter);
