import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "../utils/db";
import { sendPasswordResetEmail } from "../services/email";

const router = Router();

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function toSafeUser(user: any) {
  const { password, ...safe } = user as any;
  safe.id = safe._id || safe.id;
  return safe;
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function authToken(req: any): string | null {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const decoded = db.verifyToken(token);
  if (!decoded) return null;
  return decoded.userId;
}

router.post("/google", async (req: any, res: Response) => {
  try {
    const { email, name, avatar, firebaseUid } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    let user = await db.users.findByEmail(email);
    if (!user) {
      user = await db.users.create({
        email,
        password: "",
        name: name || email.split("@")[0],
        avatar: avatar || "/default-avatar.png",
      });
    }
    const token = db.generateToken(user._id);
    const { password, ...safe } = user as any;
    safe.id = safe._id;
    res.json({ token, user: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register", async (req: any, res: Response) => {
  try {
    const { email, password, name, gender, age, country } = req.body;
    const username = String(req.body.username || "").trim().toLowerCase();
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name are required" });
    }
    const existing = await db.users.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }
    if (username) {
      if (!isValidUsername(username)) {
        return res.status(400).json({ error: "Username must be 3-20 characters (letters, numbers, underscore)" });
      }
      const existingUsername = await db.users.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }
    const user = await db.users.create({ username, email, password, name, gender, age, country });
    const token = db.generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, username: user.username, avatar: user.avatar, gender: user.gender, age: user.age, country: user.country, credits: user.credits, isPremium: user.isPremium },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req: any, res: Response) => {
  try {
    const identifier = (req.body.identifier || req.body.email || "").trim();
    const { password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: "Username/email and password required" });
    const lower = identifier.toLowerCase();
    const user = lower.includes("@")
      ? await db.users.findByEmail(lower)
      : await db.users.findByUsername(lower);
    if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
    if (user.isBanned) return res.status(403).json({ error: "Account banned" });
    const token = db.generateToken(user._id);
    res.json({ token, user: toSafeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/complete-account", async (req: any, res: Response) => {
  try {
    const userId = authToken(req);
    if (!userId) return res.status(401).json({ error: "Not authorized" });

    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!isValidUsername(username)) {
      return res.status(400).json({ error: "Username must be 3-20 characters (letters, numbers, underscore)" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email" });
    }

    const existingUsername = await db.users.findByUsername(username);
    if (existingUsername && existingUsername._id !== userId) {
      return res.status(400).json({ error: "Username already taken" });
    }
    if (email) {
      const existingEmail = await db.users.findByEmail(email);
      if (existingEmail && existingEmail._id !== userId) {
        return res.status(400).json({ error: "Email already registered" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const update: any = { username, password: passwordHash };
    if (email) update.email = email;

    const user = await db.users.update(userId, update);
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = db.generateToken(user._id);
    res.json({ token, user: toSafeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/forgot-password", async (req: any, res: Response) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email" });
    }
    const user = await db.users.findByEmail(email);
    if (user && user.email && user.email !== "") {
      const token = crypto.randomBytes(32).toString("hex");
      db.resetTokens.set(token, user._id);
      const { delivered, debugUrl } = await sendPasswordResetEmail(email, token);
      if (!delivered && !debugUrl) {
        return res.status(500).json({ error: "Could not send reset email. Try again later." });
      }
    }
    res.json({ success: true, message: "If that email is registered, a reset link has been sent." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reset-password", async (req: any, res: Response) => {
  try {
    const token = String(req.body.token || "");
    const password = String(req.body.password || "");
    if (!token) return res.status(400).json({ error: "Reset token required" });
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const userId = db.resetTokens.get(token);
    if (!userId) return res.status(400).json({ error: "Reset link is invalid or expired" });
    const passwordHash = await bcrypt.hash(password, 10);
    await db.users.update(userId, { password: passwordHash });
    db.resetTokens.delete(token);
    res.json({ success: true, message: "Password updated. You can now log in." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", async (req: any, res: Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });
    const decoded = db.verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid token" });
    const user = await db.users.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...safe } = user as any;
    res.json({ user: safe });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.post("/phone/check", async (req: any, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });
    const user = await db.users.findByPhone(phone);
    res.json({ exists: !!user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/phone/send-otp", async (req: any, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });
    const phoneClean = phone.replace(/[^+\d]/g, "");
    if (phoneClean.length < 10) return res.status(400).json({ error: "Invalid phone number" });

    const otp = generateOtp();
    db.otp.set(phoneClean, otp);
    console.log(`OTP for ${phoneClean}: ${otp}`);

    res.json({
      success: true,
      message: "OTP generated. Send your phone number to @CoPatnerBot on Telegram to receive it.",
      botUsername: "CoPatnerBot",
      otp, // dev mode: show OTP directly for testing
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/phone/verify-otp", async (req: any, res: Response) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP required" });
    const phoneClean = phone.replace(/[^+\d]/g, "");

    const storedOtp = db.otp.get(phoneClean);
    if (!storedOtp) return res.status(400).json({ error: "OTP expired or not requested. Please send OTP again." });
    if (storedOtp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    db.otp.delete(phoneClean);

    let user = await db.users.findByPhone(phoneClean);
    if (!user) {
      user = await db.users.create({
        phone: phoneClean,
        email: "",
        name: name || "User",
        password: "",
      });
    }

    if (user.isBanned) return res.status(403).json({ error: "Account banned" });

    const token = db.generateToken(user._id);
    const { password: _, ...safe } = user as any;
    safe.id = safe._id;
    res.json({ token, user: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/phone/signin", async (req: any, res: Response) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });
    const phoneClean = phone.replace(/[^+\d]/g, "");
    if (phoneClean.length < 10) return res.status(400).json({ error: "Invalid phone number" });
    let user = await db.users.findByPhone(phoneClean);
    if (!user) {
      user = await db.users.create({
        phone: phoneClean,
        email: "",
        name: name || "User",
        password: "",
      });
    }
    if (user.isBanned) return res.status(403).json({ error: "Account banned" });
    const token = db.generateToken(user._id);
    const { password: _, ...safe } = user as any;
    safe.id = safe._id;
    res.json({ token, user: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/sockets", (req: any, res: Response) => {
  try {
    const io = req.app.get("io");
    if (!io) return res.json({ error: "Socket.IO not available" });
    const sockets: any[] = [];
    io.sockets.sockets.forEach((s: any) => {
      sockets.push({ id: s.id, connected: s.connected });
    });
    res.json({ total: sockets.length, sockets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/online-users", (req: any, res: Response) => {
  try {
    const io = req.app.get("io");
    if (!io) return res.json({ error: "Socket.IO not available" });
    const sockets: any[] = [];
    io.sockets.sockets.forEach((s: any) => {
      sockets.push({ id: s.id, connected: s.connected });
    });
    const onlineUsers = (io as any).__onlineUsers;
    const users = onlineUsers ? [...onlineUsers.entries()].map(([sid, uid]) => ({ socketId: sid, userId: uid })) : [];
    res.json({ totalSockets: sockets.length, sockets, totalOnline: users.length, onlineUsers: users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
