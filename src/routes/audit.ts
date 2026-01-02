import { Router, type Request, type Response } from "express";
import { db } from "../db.js";
import { requireAuth, requireRole } from "./auth.js";

export const auditRouter = Router();

auditRouter.get(
  "/",
  requireAuth,
  requireRole(["admin", "auditor"]),
  (req: Request, res: Response) => {
    const { user_id, start, end } = req.query as any;
    let base = "SELECT * FROM audit_logs WHERE 1=1";
    const params: any[] = [];
    if (user_id) {
      base += " AND user_id = ?";
      params.push(Number(user_id));
    }
    if (start) {
      base += " AND timestamp >= ?";
      params.push(start);
    }
    if (end) {
      base += " AND timestamp <= ?";
      params.push(end);
    }
    base += " ORDER BY timestamp DESC LIMIT 200";
    const rows = db.prepare(base).all(...params);
    res.json({ items: rows });
  }
);
