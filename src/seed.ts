import bcrypt from "bcryptjs";
import { db } from "./db.js";

// Seed default admin if none exists
const count = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as any).c as number;
if (count === 0) {
	const hash = bcrypt.hashSync("Admin@123", 10);
	db.prepare("INSERT INTO users (username, email, password_hash, role, status) VALUES (?,?,?,?,?)").run(
		"admin",
		"admin@example.com",
		hash,
		"admin",
		"active"
	);
	console.log("Seeded default admin user: admin / Admin@123");
}


