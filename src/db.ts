import Database from "better-sqlite3";

export const db = new Database(process.env.DATABASE_FILE || "mvp.db");

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin','analyst','auditor')) NOT NULL,
  status TEXT CHECK(status IN ('active','inactive','suspended')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE TABLE IF NOT EXISTS incidents (
  incident_id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT CHECK(type IN ('sql_injection','ddos','other')) NOT NULL,
  severity TEXT CHECK(severity IN ('critical','high','medium','low')) NOT NULL,
  status TEXT CHECK(status IN ('new','investigating','resolved')) DEFAULT 'new',
  detection_method TEXT,
  description TEXT,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

CREATE TABLE IF NOT EXISTS threats (
  threat_id INTEGER PRIMARY KEY AUTOINCREMENT,
  threat_type TEXT NOT NULL,
  simulated_payload TEXT,
  severity TEXT CHECK(severity IN ('critical','high','medium','low')),
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  prevention_applied TEXT,
  outcome TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);
`);

// Attempt to add detection_method if missing (SQLite lacks IF NOT EXISTS for columns)
try {
	const cols = db.prepare("PRAGMA table_info(incidents)").all() as any[];
	const has = cols.some((c) => c.name === "detection_method");
	if (!has) {
		db.exec("ALTER TABLE incidents ADD COLUMN detection_method TEXT");
	}
} catch {}


