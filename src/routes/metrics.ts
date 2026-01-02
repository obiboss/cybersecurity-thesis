import { Router } from "express";
import { getMetrics } from "../metrics.js";
import { requireAuth, requireRole } from "./auth.js";

export const metricsRouter = Router();

metricsRouter.get("/", requireAuth, requireRole(["admin", "analyst", "auditor"]), (req, res) => {
	const m = getMetrics();
	res.json(m);
});


