import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, requireRole } from "./auth.js";
import { recalcSecurityScore, getMetrics, setMetrics } from "../metrics.js";
import { emitEvent } from "../websocket.js";

export const incidentsRouter = Router();

incidentsRouter.get("/", requireAuth, requireRole(["admin", "analyst", "auditor"]), (req, res) => {
	const rows = db.prepare("SELECT * FROM incidents ORDER BY detected_at DESC LIMIT 200").all();
	res.json({ items: rows });
});

incidentsRouter.get("/:id", requireAuth, requireRole(["admin", "analyst", "auditor"]), (req, res) => {
	const id = Number(req.params.id);
	const row = db.prepare("SELECT * FROM incidents WHERE incident_id = ?").get(id);
	if (!row) return res.status(404).json({ message: "Incident not found" });
	res.json(row);
});

incidentsRouter.patch("/:id/status", requireAuth, requireRole(["admin", "analyst"]), (req, res) => {
	const id = Number(req.params.id);
	const { status, resolution_notes } = req.body || {};
	if (!["new", "investigating", "resolved"].includes(String(status))) {
		return res.status(400).json({ message: "Invalid status" });
	}
	const stmt = db.prepare("UPDATE incidents SET status = ?, resolved_at = CASE WHEN ?='resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END, description = COALESCE(description,'') || CASE WHEN ? IS NOT NULL THEN ('\\n' || ?) ELSE '' END WHERE incident_id = ?");
	const info = stmt.run(status, status, resolution_notes ?? null, resolution_notes ?? null, id);
	if (info.changes === 0) return res.status(404).json({ message: "Incident not found" });

	db.prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (?,?,?)").run(
		// @ts-ignore
		Number(req.userId),
		"update_incident_status",
		`incident_id=${id}; status=${status}`
	);

	// Recalculate security score; if resolved reduce impact
	const metrics = recalcSecurityScore();
	emitEvent("dashboard_update", { metrics });

	res.json({ message: "Incident updated", incident_id: id, status });
});


