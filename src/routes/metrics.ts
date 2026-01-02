// import { Router } from "express";
// import { getMetrics } from "../metrics.js";
// import { requireAuth, requireRole } from "./auth.js";

// export const metricsRouter = Router();

// metricsRouter.get("/", requireAuth, requireRole(["admin", "analyst", "auditor"]), (req, res) => {
// 	const m = getMetrics();
// 	res.json(m);
// });

import { Router, type Request, type Response } from "express";
import { getMetrics } from "../metrics.js";
import { requireAuth, requireRole } from "./auth.js";

export const metricsRouter = Router();

metricsRouter.get(
  "/",
  requireAuth,
  requireRole(["admin", "analyst", "auditor"]),
  (req: Request, res: Response) => {
    res.json(getMetrics());
  }
);
