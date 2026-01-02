// import { Router } from "express";
// import { db } from "../db.js";
// import { requireAuth, requireRole } from "./auth.js";
// import { emitEvent } from "../websocket.js";
// import { getMetrics, setMetrics, recalcSecurityScore } from "../metrics.js";

// export const simulationsRouter = Router();

// function classifySeverityForSQLi(
//   payload: string
// ): "critical" | "high" | "medium" | "low" {
//   const p = payload.toLowerCase();
//   if (p.includes("union select") || p.includes("drop table")) return "critical";
//   if (p.includes(" or 1=1")) return "high";
//   return "medium";
// }
// function classifySeverityForDDoS(
//   hits: number
// ): "critical" | "high" | "medium" | "low" {
//   if (hits >= 5000) return "critical";
//   if (hits >= 2000) return "high";
//   if (hits >= 1000) return "medium";
//   return "low";
// }

// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// simulationsRouter.post(
//   "/sql-injection",
//   requireAuth,
//   requireRole(["admin", "analyst"]),
//   async (req, res) => {
//     const preview = "SELECT * FROM users WHERE username = 'admin' OR 1=1 --";
//     const severity = classifySeverityForSQLi(preview);
//     const prevention = "Input validation and sanitization (simulation)";
//     const outcome = "Blocked (simulation)";

//     // increment metrics for active threat and total_simulations
//     const m1 = getMetrics();
//     setMetrics({
//       active_threats: m1.active_threats + 1,
//       total_simulations: m1.total_simulations + 1,
//     });
//     recalcSecurityScore();

//     emitEvent("threat_detected", {
//       kind: "sql_injection",
//       severity,
//       step: 1,
//       message: "Detecting threat...",
//     });
//     await sleep(2000);
//     emitEvent("threat_blocked", {
//       kind: "sql_injection",
//       prevention,
//       step: 2,
//       message: "Activating defense mechanism...",
//     });
//     await sleep(2000);

//     const insertThreat = db.prepare(
//       "INSERT INTO threats (threat_type, simulated_payload, severity, prevention_applied, outcome) VALUES (?,?,?,?,?)"
//     );
//     const result = insertThreat.run(
//       "sql_injection",
//       preview,
//       severity,
//       prevention,
//       outcome
//     );

//     const description =
//       "Simulated SQL injection detected. Prevention applied: input validation and sanitization. System remains secure.";
//     const insertIncident = db.prepare(
//       "INSERT INTO incidents (type, severity, status, detection_method, description) VALUES (?,?,?,?,?)"
//     );
//     const inc = insertIncident.run(
//       "sql_injection",
//       severity,
//       "new",
//       "Input validation (simulation)",
//       description
//     );

//     db.prepare(
//       "INSERT INTO audit_logs (user_id, action, details) VALUES (?,?,?)"
//     ).run(
//       // @ts-ignore
//       Number(req.userId),
//       "simulate_sql_injection",
//       `threat_id=${result.lastInsertRowid}; incident_id=${inc.lastInsertRowid}`
//     );

//     // decrement active threat and recalc security
//     const m2 = getMetrics();
//     setMetrics({ active_threats: Math.max(0, m2.active_threats - 1) });
//     const metrics = recalcSecurityScore();

//     emitEvent("simulation_complete", {
//       kind: "sql_injection",
//       severity,
//       threat_id: result.lastInsertRowid,
//       incident_id: inc.lastInsertRowid,
//       message: "Threat contained! (simulation)",
//       metrics,
//     });
//     emitEvent("dashboard_update", { metrics });

//     return res.status(201).json({
//       message: "Simulation: SQL Injection detected and prevented",
//       severity,
//       threat_id: result.lastInsertRowid,
//       incident_id: inc.lastInsertRowid,
//       explanation:
//         "This is a demonstration. The system applied input validation/sanitization to prevent injection and logged the incident.",
//     });
//   }
// );

// simulationsRouter.post(
//   "/ddos",
//   requireAuth,
//   requireRole(["admin", "analyst"]),
//   async (req, res) => {
//     const hits = 3000; // simulated burst
//     const preview = `Burst traffic detected: hits_last_minute=${hits}`;
//     const severity = classifySeverityForDDoS(hits);
//     const prevention = "Rate limiting and traffic throttling (simulation)";
//     const outcome = "Throttled (simulation)";

//     const m1 = getMetrics();
//     setMetrics({
//       active_threats: m1.active_threats + 1,
//       total_simulations: m1.total_simulations + 1,
//     });
//     recalcSecurityScore();

//     emitEvent("threat_detected", {
//       kind: "ddos",
//       severity,
//       step: 1,
//       message: "Detecting threat...",
//     });
//     await sleep(2000);
//     emitEvent("threat_blocked", {
//       kind: "ddos",
//       prevention,
//       step: 2,
//       message: "Activating defense mechanism...",
//     });
//     await sleep(2000);

//     const insertThreat = db.prepare(
//       "INSERT INTO threats (threat_type, simulated_payload, severity, prevention_applied, outcome) VALUES (?,?,?,?,?)"
//     );
//     const result = insertThreat.run(
//       "ddos",
//       preview,
//       severity,
//       prevention,
//       outcome
//     );

//     const description =
//       "Simulated DDoS spike detected. Prevention applied: rate limiting and throttling. Service remains available (simulation).";
//     const insertIncident = db.prepare(
//       "INSERT INTO incidents (type, severity, status, detection_method, description) VALUES (?,?,?,?,?)"
//     );
//     const inc = insertIncident.run(
//       "ddos",
//       severity,
//       "new",
//       "Rate limiting (simulation)",
//       description
//     );

//     db.prepare(
//       "INSERT INTO audit_logs (user_id, action, details) VALUES (?,?,?)"
//     ).run(
//       // @ts-ignore
//       Number(req.userId),
//       "simulate_ddos",
//       `threat_id=${result.lastInsertRowid}; incident_id=${inc.lastInsertRowid}`
//     );

//     const m2 = getMetrics();
//     setMetrics({ active_threats: Math.max(0, m2.active_threats - 1) });
//     const metrics = recalcSecurityScore();

//     emitEvent("simulation_complete", {
//       kind: "ddos",
//       severity,
//       threat_id: result.lastInsertRowid,
//       incident_id: inc.lastInsertRowid,
//       message: "Threat contained! (simulation)",
//       metrics,
//     });
//     emitEvent("dashboard_update", { metrics });

//     return res.status(201).json({
//       message: "Simulation: DDoS burst detected and throttled",
//       severity,
//       threat_id: result.lastInsertRowid,
//       incident_id: inc.lastInsertRowid,
//       explanation:
//         "This is a demonstration. The system applied rate limiting/throttling to contain traffic and logged the incident.",
//     });
//   }
// );

// simulationsRouter.get(
//   "/history",
//   requireAuth,
//   requireRole(["admin", "analyst", "auditor"]),
//   (req, res) => {
//     const rows = db
//       .prepare("SELECT * FROM threats ORDER BY detected_at DESC LIMIT 100")
//       .all();
//     return res.json({ items: rows });
//   }
// );

// import { Router } from "express";
import { Router, type Request, type Response } from "express";
import { db } from "../db.js";
import { requireAuth, requireRole } from "./auth.js";
import { emitEvent } from "../websocket.js";
import { getMetrics, setMetrics, recalcSecurityScore } from "../metrics.js";

export const simulationsRouter = Router();

/* -------------------------------------------------------------------------- */
/*                               SEVERITY LOGIC                               */
/* -------------------------------------------------------------------------- */

function classifySeverityForSQLi(
  payload: string
): "critical" | "high" | "medium" | "low" {
  const p = payload.toLowerCase();
  if (p.includes("union select") || p.includes("drop table")) return "critical";
  if (p.includes(" or 1=1")) return "high";
  return "medium";
}

function classifySeverityForDDoS(
  hits: number
): "critical" | "high" | "medium" | "low" {
  if (hits >= 5000) return "critical";
  if (hits >= 2000) return "high";
  if (hits >= 1000) return "medium";
  return "low";
}

/* -------------------------------------------------------------------------- */
/*                                 UTILITIES                                  */
/* -------------------------------------------------------------------------- */

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function severityPressure(severity: string): number {
  switch (severity) {
    case "critical":
      return 40;
    case "high":
      return 25;
    case "medium":
      return 15;
    default:
      return 5;
  }
}

/* -------------------------------------------------------------------------- */
/*                            SQL INJECTION SIMULATION                         */
/* -------------------------------------------------------------------------- */

simulationsRouter.post(
  "/sql-injection",
  requireAuth,
  requireRole(["admin", "analyst"]),
  async (req: Request, res: Response) => {
    const preview = "SELECT * FROM users WHERE username = 'admin' OR 1=1 --";
    const severity = classifySeverityForSQLi(preview);
    const prevention = "Input validation and sanitization (simulation)";
    const outcome = "Blocked (simulation)";

    /* ---- APPLY THREAT IMPACT ---- */
    /* ---- APPLY THREAT IMPACT (ATOMIC) ---- */
    const before = getMetrics();

    const metricsAfterThreat = setMetrics({
      active_threats: before.active_threats + 1,
      total_simulations: before.total_simulations + 1,
      risk_pressure: Math.min(
        before.risk_pressure + severityPressure(severity),
        80
      ),
    });

    recalcSecurityScore();

    emitEvent("threat_detected", {
      kind: "sql_injection",
      severity,
      step: 1,
      message: "Detecting threat...",
    });

    await sleep(2000);

    emitEvent("threat_blocked", {
      kind: "sql_injection",
      prevention,
      step: 2,
      message: "Activating defense mechanism...",
    });

    await sleep(2000);

    /* ---- DATABASE LOGGING ---- */
    const result = db
      .prepare(
        `INSERT INTO threats
         (threat_type, simulated_payload, severity, prevention_applied, outcome)
         VALUES (?,?,?,?,?)`
      )
      .run("sql_injection", preview, severity, prevention, outcome);

    const inc = db
      .prepare(
        `INSERT INTO incidents
         (type, severity, status, detection_method, description)
         VALUES (?,?,?,?,?)`
      )
      .run(
        "sql_injection",
        severity,
        "new",
        "Input validation (simulation)",
        "Simulated SQL injection detected and blocked."
      );

    db.prepare(
      "INSERT INTO audit_logs (user_id, action, details) VALUES (?,?,?)"
    ).run(
      // @ts-ignore
      Number(req.userId),
      "simulate_sql_injection",
      `threat_id=${result.lastInsertRowid}; incident_id=${inc.lastInsertRowid}`
    );

    /* ---- THREAT RESOLVED ---- */
    const resolved = getMetrics();

    const metrics = setMetrics({
      active_threats: Math.max(0, resolved.active_threats - 1),
    });

    recalcSecurityScore();

    emitEvent("simulation_complete", {
      kind: "sql_injection",
      severity,
      threat_id: result.lastInsertRowid,
      incident_id: inc.lastInsertRowid,
      message: "Threat contained! (simulation)",
      metrics,
    });

    emitEvent("dashboard_update", { metrics });

    return res.status(201).json({
      message: "Simulation: SQL Injection detected and prevented",
      severity,
      threat_id: result.lastInsertRowid,
      incident_id: inc.lastInsertRowid,
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                                 DDOS SIMULATION                             */
/* -------------------------------------------------------------------------- */

simulationsRouter.post(
  "/ddos",
  requireAuth,
  requireRole(["admin", "analyst"]),
  async (req: Request, res: Response) => {
    const hits = 3000;
    const preview = `Burst traffic detected: hits_last_minute=${hits}`;
    const severity = classifySeverityForDDoS(hits);
    const prevention = "Rate limiting and traffic throttling (simulation)";
    const outcome = "Throttled (simulation)";

    /* ---- APPLY THREAT IMPACT ---- */
    const m1 = getMetrics();
    setMetrics({
      active_threats: m1.active_threats + 1,
      total_simulations: m1.total_simulations + 1,
      risk_pressure: Math.min(
        m1.risk_pressure + severityPressure(severity),
        80
      ),
    });

    recalcSecurityScore();

    emitEvent("threat_detected", {
      kind: "ddos",
      severity,
      step: 1,
      message: "Detecting threat...",
    });

    await sleep(2000);

    emitEvent("threat_blocked", {
      kind: "ddos",
      prevention,
      step: 2,
      message: "Activating defense mechanism...",
    });

    await sleep(2000);

    /* ---- DATABASE LOGGING ---- */
    const result = db
      .prepare(
        `INSERT INTO threats
         (threat_type, simulated_payload, severity, prevention_applied, outcome)
         VALUES (?,?,?,?,?)`
      )
      .run("ddos", preview, severity, prevention, outcome);

    const inc = db
      .prepare(
        `INSERT INTO incidents
         (type, severity, status, detection_method, description)
         VALUES (?,?,?,?,?)`
      )
      .run(
        "ddos",
        severity,
        "new",
        "Rate limiting (simulation)",
        "Simulated DDoS burst detected and throttled."
      );

    db.prepare(
      "INSERT INTO audit_logs (user_id, action, details) VALUES (?,?,?)"
    ).run(
      // @ts-ignore
      Number(req.userId),
      "simulate_ddos",
      `threat_id=${result.lastInsertRowid}; incident_id=${inc.lastInsertRowid}`
    );

    /* ---- THREAT RESOLVED ---- */
    const m2 = getMetrics();
    setMetrics({
      active_threats: Math.max(0, m2.active_threats - 1),
    });

    const metrics = recalcSecurityScore();

    emitEvent("simulation_complete", {
      kind: "ddos",
      severity,
      threat_id: result.lastInsertRowid,
      incident_id: inc.lastInsertRowid,
      message: "Threat contained! (simulation)",
      metrics,
    });

    emitEvent("dashboard_update", { metrics });

    return res.status(201).json({
      message: "Simulation: DDoS burst detected and throttled",
      severity,
      threat_id: result.lastInsertRowid,
      incident_id: inc.lastInsertRowid,
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                                  HISTORY                                   */
/* -------------------------------------------------------------------------- */

simulationsRouter.get(
  "/history",
  requireAuth,
  requireRole(["admin", "analyst", "auditor"]),
  (req: Request, res: Response) => {
    const rows = db
      .prepare("SELECT * FROM threats ORDER BY detected_at DESC LIMIT 100")
      .all();
    return res.json({ items: rows });
  }
);
