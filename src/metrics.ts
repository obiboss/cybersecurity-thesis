// import { db } from "./db.js";

// // Ensure metrics row exists (id=1)
// db.exec(`
// CREATE TABLE IF NOT EXISTS system_metrics (
//   id INTEGER PRIMARY KEY CHECK(id=1),
//   security_score INTEGER NOT NULL,
//   active_threats INTEGER NOT NULL,
//   total_simulations INTEGER NOT NULL,
//   last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
// );
// `);
// const cnt = (db.prepare("SELECT COUNT(*) as c FROM system_metrics").get() as any).c as number;
// if (cnt === 0) {
// 	db.prepare("INSERT INTO system_metrics (id, security_score, active_threats, total_simulations) VALUES (1, 100, 0, 0)").run();
// }

// export function getMetrics() {
// 	return db.prepare("SELECT * FROM system_metrics WHERE id = 1").get() as any;
// }

// export function setMetrics(partial: Partial<{ security_score: number; active_threats: number; total_simulations: number }>) {
// 	const m = getMetrics();
// 	const next = {
// 		security_score: partial.security_score ?? m.security_score,
// 		active_threats: partial.active_threats ?? m.active_threats,
// 		total_simulations: partial.total_simulations ?? m.total_simulations,
// 	};
// 	db.prepare(
// 		"UPDATE system_metrics SET security_score=?, active_threats=?, total_simulations=?, last_updated=CURRENT_TIMESTAMP WHERE id=1"
// 	).run(next.security_score, next.active_threats, next.total_simulations);
// 	return getMetrics();
// }

// export function recalcSecurityScore() {
// 	const unresolved = (db.prepare("SELECT COUNT(*) as c FROM incidents WHERE status != 'resolved'").get() as any).c as number;
// 	const m = getMetrics();
// 	const base = 100;
// 	const penaltyThreats = m.active_threats * 10;
// 	const penaltyIncidents = unresolved * 15;
// 	let score = base - penaltyThreats - penaltyIncidents;
// 	if (score < 0) score = 0;
// 	if (score > 100) score = 100;
// 	return setMetrics({ security_score: score });
// }

import { db } from "./db.js";

/**
 * SYSTEM METRICS TABLE
 *
 * risk_pressure:
 *   - Volatile stress indicator (0–70)
 *   - Increases during simulations
 *   - Decays over time
 */

db.exec(`
CREATE TABLE IF NOT EXISTS system_metrics (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  security_score INTEGER NOT NULL,
  active_threats INTEGER NOT NULL,
  total_simulations INTEGER NOT NULL,
  risk_pressure INTEGER NOT NULL,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

const cnt = (
  db.prepare("SELECT COUNT(*) as c FROM system_metrics").get() as any
).c as number;

if (cnt === 0) {
  db.prepare(
    `
    INSERT INTO system_metrics
    (id, security_score, active_threats, total_simulations, risk_pressure)
    VALUES (1, 100, 0, 0, 0)
  `
  ).run();
}

export type SystemMetrics = {
  id: number;
  security_score: number;
  active_threats: number;
  total_simulations: number;
  risk_pressure: number;
  last_updated: string;
};

export function getMetrics(): SystemMetrics {
  return db
    .prepare("SELECT * FROM system_metrics WHERE id = 1")
    .get() as SystemMetrics;
}

export function setMetrics(
  partial: Partial<
    Pick<
      SystemMetrics,
      | "security_score"
      | "active_threats"
      | "total_simulations"
      | "risk_pressure"
    >
  >
): SystemMetrics {
  const m = getMetrics();

  const next = {
    security_score: partial.security_score ?? m.security_score,
    active_threats: partial.active_threats ?? m.active_threats,
    total_simulations: partial.total_simulations ?? m.total_simulations,
    risk_pressure: partial.risk_pressure ?? m.risk_pressure,
  };

  db.prepare(
    `
    UPDATE system_metrics
    SET security_score = ?,
        active_threats = ?,
        total_simulations = ?,
        risk_pressure = ?,
        last_updated = CURRENT_TIMESTAMP
    WHERE id = 1
  `
  ).run(
    next.security_score,
    next.active_threats,
    next.total_simulations,
    next.risk_pressure
  );

  return getMetrics();
}

/**
 * SECURITY SCORE MODEL (FINAL)
 *
 * - Base: 100
 * - Active threat: -30 each
 * - Risk pressure: -risk_pressure
 * - No cumulative penalties
 * - No permanent damage
 */
export function recalcSecurityScore(): SystemMetrics {
  const m = getMetrics();

  const base = 100;

  const activeThreatPenalty = m.active_threats * 30;
  const pressurePenalty = m.risk_pressure;

  let score = base - activeThreatPenalty - pressurePenalty;

  score = Math.max(0, Math.min(100, score));

  return setMetrics({ security_score: score });
}
