// import bcrypt from "bcryptjs";
// import { db } from "./db.js";

// // Seed default admin if none exists
// const count = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as any).c as number;
// if (count === 0) {
// 	const hash = bcrypt.hashSync("Admin@123", 10);
// 	db.prepare("INSERT INTO users (username, email, password_hash, role, status) VALUES (?,?,?,?,?)").run(
// 		"admin",
// 		"admin@example.com",
// 		hash,
// 		"admin",
// 		"active"
// 	);
// 	console.log("Seeded default admin user: admin / Admin@123");
// }

//FOR PRODUCTION USE ONLY
// import bcrypt from "bcryptjs";
// import { db } from "./db.js";

// // ❌ Never seed in production
// if (process.env.NODE_ENV === "production") {
//   console.log("Skipping seed in production");
//   process.exit(0);
// }

// const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
// if (!adminPassword) {
//   throw new Error("ADMIN_BOOTSTRAP_PASSWORD not set");
// }

// const count = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as any)
//   .c as number;

// if (count === 0) {
//   const hash = bcrypt.hashSync(adminPassword, 10);
//   db.prepare(
//     `
//     INSERT INTO users (username, email, password_hash, role, status)
//     VALUES (?,?,?,?,?)
//     `
//   ).run("admin", "admin@example.com", hash, "admin", "active");

//   console.log("Seeded admin user from environment variable");
// }

// import bcrypt from "bcryptjs";
// import { db } from "./db.js";

// // ❌ Never seed in production automatically
// if (process.env.NODE_ENV === "production") {
//   console.log("Skipping seed in production");
//   process.exit(0);
// }

// // Use environment variable in prod, fallback to default for local dev
// const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || "Admin@123"; // default for dev

// const count = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as any)
//   .c as number;

// if (count === 0) {
//   const hash = bcrypt.hashSync(adminPassword, 10);
//   db.prepare(
//     `
//     INSERT INTO users (username, email, password_hash, role, status)
//     VALUES (?,?,?,?,?)
//     `
//   ).run("admin", "admin@example.com", hash, "admin", "active");

//   console.log(`Seeded admin user: username=admin, password=${adminPassword}`);
// } else {
//   console.log("Admin user already exists, skipping seed");
// }

import bcrypt from "bcryptjs";
import { db } from "./db.js";

// ✅ Explicit one-time seeding control
if (process.env.SEED_ADMIN !== "true") {
  console.log("SEED_ADMIN not enabled, skipping seed");
  process.exit(0);
}

const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || "Admin@123";

// Idempotent check
const existing = db
  .prepare("SELECT user_id FROM users WHERE username = 'admin'")
  .get();

if (existing) {
  console.log("Admin user already exists, skipping seed");
  process.exit(0);
}

const hash = bcrypt.hashSync(adminPassword, 10);

db.prepare(
  `
  INSERT INTO users (username, email, password_hash, role, status)
  VALUES (?,?,?,?,?)
`
).run("admin", "admin@example.com", hash, "admin", "active");

console.log(`✅ Admin user seeded: username=admin password=${adminPassword}`);
