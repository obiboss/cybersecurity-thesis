import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

/**
 * JWT secret is expected from environment variables.
 * A fallback is used ONLY for local demonstration purposes.
 */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET not set. Using insecure demo secret.");
}

const EFFECTIVE_JWT_SECRET = JWT_SECRET || "insecure-demo-secret";

/**
 * MFA settings (simulation only)
 */
const MFA_TTL_MS = 5 * 60 * 1000;

type PendingMfa = {
  user_id: number;
  code: string;
  expires_at: number;
};

/**
 * In-memory MFA store for demonstration only.
 * Not suitable for production use.
 */
const pendingMfa = new Map<string, PendingMfa>();

export const authRouter = Router();

/**
 * LOGIN (Step 1)
 * Username + password verification
 * Initiates simulated MFA flow
 */
authRouter.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }

  const row = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as any;

  if (!row) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (row.status !== "active") {
    return res.status(403).json({ message: "Account is not active" });
  }

  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate simulated MFA code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const mfa_token = cryptoRandomToken();

  pendingMfa.set(mfa_token, {
    user_id: row.user_id,
    code,
    expires_at: Date.now() + MFA_TTL_MS,
  });

  return res.json({
    message: "MFA required (simulation)",
    mfa_token,
    otp_demo: code,
    disclaimer:
      "This OTP is provided for demonstration only. No real MFA is performed.",
  });
});

/**
 * MFA VERIFICATION (Step 2)
 * Verifies OTP and issues JWT
 */
authRouter.post("/verify-mfa", (req, res) => {
  const { mfa_token, otp } = req.body || {};

  if (!mfa_token || !otp) {
    return res.status(400).json({ message: "mfa_token and otp are required" });
  }

  const pending = pendingMfa.get(mfa_token);
  if (!pending) {
    return res.status(401).json({ message: "Invalid or expired MFA token" });
  }

  if (pending.expires_at < Date.now()) {
    pendingMfa.delete(mfa_token);
    return res.status(401).json({ message: "MFA token expired" });
  }

  if (pending.code !== String(otp)) {
    return res.status(401).json({ message: "Incorrect OTP" });
  }

  const user = db
    .prepare(
      "SELECT user_id, username, email, role, status FROM users WHERE user_id = ?"
    )
    .get(pending.user_id) as any;

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = jwt.sign(
    { sub: String(user.user_id), role: user.role },
    EFFECTIVE_JWT_SECRET,
    { expiresIn: "1h" }
  );

  db.prepare(
    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?"
  ).run(user.user_id);

  pendingMfa.delete(mfa_token);

  return res.json({
    access_token: token,
    user,
  });
});

/**
 * CURRENT USER
 */
authRouter.get("/me", requireAuth, (req, res) => {
  const user_id = Number(req.userId);

  const user = db
    .prepare(
      "SELECT user_id, username, email, role, status FROM users WHERE user_id = ?"
    )
    .get(user_id) as any;

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

/**
 * AUTH MIDDLEWARE
 */
export function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Missing or invalid authorization header" });
    }

    const token = auth.slice(7);
    const payload = jwt.verify(token, EFFECTIVE_JWT_SECRET) as any;

    req.userId = payload.sub;
    req.role = payload.role;

    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

/**
 * ROLE-BASED ACCESS CONTROL
 */
export function requireRole(roles: string[]) {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

/**
 * Simple random token generator (demo use only)
 */
function cryptoRandomToken(): string {
  return (
    Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  );
}
